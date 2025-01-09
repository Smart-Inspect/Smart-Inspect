import type { Request, Response } from 'express';
import Project, { IProject } from '../models/Project';
import Building from '../models/Building';
import { IUnit } from '../models/Unit';
import User, { IUser } from '../models/User';
import permissions from '../config/permissions';
import unitService from './unitsService';
import { IInspection } from '../models/Inspection';
import inspectionService from './inspectionsService';

interface CreateParams {
	name: string;
	description: string;
	buildingId: string;
	unitNumbers: string[];
	engineerIds: string[];
	engineerToUnits: { engineerId: string; unitNumbers: string[] }[];
}

interface ViewParams {
	id: string;
}

interface ViewAssignedParams {
	engineerId: string;
}

interface EditParams {
	id: string;
	name?: string;
	description?: string;
	unitNumbers?: string[];
	engineerIds?: string[];
	status?: 'started' | 'completed' | 'not-started';
	engineerToUnits?: { engineerId: string; unitNumbers: string[] }[];
}

interface DeleteParams {
	id: string;
}

const projectService = {
	async create({ name, description, buildingId, unitNumbers, engineerIds, engineerToUnits }: CreateParams, res: Response): Promise<IProject | null> {
		try {
			// Getting the building
			const building = await Building.findOne({ _id: buildingId }).exec();
			if (!building) {
				res.status(404).json({ error: 'Building not found' });
				return null;
			}
			// Creating the new project
			const newProject = new Project({ name, description, building });
			// Creating/getting the units
			const units = await unitService.createMany({ numbers: unitNumbers, project: newProject }, res);
			if (!units) {
				// Error message already sent
				return null;
			}
			newProject.units = units;
			// Getting the engineers
			// TODO: Come back and turn this into a function in the usersService
			const engineers = await User.find({ _id: { $in: engineerIds }, permissions: { $in: [permissions.ENGINEER] } }).exec();
			if (engineers.length !== engineerIds.length) {
				res.status(404).json({ error: 'Engineer(s) not found' });
				return null;
			}
			newProject.engineers = engineers;
			// Assigning units to engineers
			const result = await unitService.assignMany({ project: newProject, engineerToUnits }, res);
			if (!result) {
				return null;
			}
			// Saving the project
			await newProject.save();
			return newProject;
		} catch (error) {
			console.error('Failed to create project:', error);
			res.status(500).json({ error: 'Error creating project' });
			return null;
		}
	},
	async view({ id }: ViewParams, req: Request, res: Response): Promise<IProject | null> {
		try {
			// Check if the project exists
			const existingProject = await Project.findOne({ _id: id }).populate('building').populate('units').populate('engineers').populate('inspections').exec();
			if (!existingProject) {
				res.status(404).json({ error: 'Project not found' });
				return null;
			}
			if (!(existingProject.engineers as IUser[]).map(engineer => engineer._id).includes(req.user?._id) && !req.user?.permissions.includes(permissions.MANAGER)) {
				res.status(403).json({ error: 'Permission denied' });
				return null;
			}
			return existingProject;
		} catch (error) {
			console.error(`Failed to get project ${id}:`, error);
			res.status(500).json({ error: 'Error viewing project' });
			return null;
		}
	},
	async viewAssigned({ engineerId }: ViewAssignedParams, res: Response): Promise<IProject[] | null> {
		try {
			// Check if the engineer exists
			const engineer = await User.findOne({ _id: engineerId, permissions: { $in: [permissions.ENGINEER] } }).exec();
			if (!engineer) {
				res.status(404).json({ error: 'Engineer not found' });
				return null;
			}
			// Get the projects assigned to the engineer
			const projects = await Project.find({ engineers: engineerId }).populate('building').exec();
			return projects;
		} catch (error) {
			console.error(`Failed to get projects assigned to engineer ${engineerId}:`, error);
			res.status(500).json({ error: 'Error getting projects' });
			return null;
		}
	},
	async edit({ id, name, description, unitNumbers, engineerIds, status, engineerToUnits }: EditParams, res: Response): Promise<IProject | null> {
		try {
			// Check if the project exists
			const existingProject = await Project.findOne({ _id: id }).populate('units').populate('engineers').exec();
			if (!existingProject) {
				res.status(404).json({ error: 'Project not found' });
				return null;
			}
			// Update the project
			if (name) existingProject.name = name;
			if (description) existingProject.description = description;
			if (unitNumbers) {
				const units = await unitService.createMany({ numbers: unitNumbers, project: existingProject }, res);
				if (!units) {
					// Error message already sent
					return null;
				}
				// If there were units removed, first filter out the ones that are no longer in unitNumbers (AKA the manager removed them) and have no inspection history (AKA they can be deleted safely)
				const removedUnits = (existingProject.units as IUnit[]).filter(unit => !unitNumbers.includes(unit.number)).filter(unit => unit.inspections.length === 0);
				if (removedUnits.length > 0) {
					// Delete the removed units
					const result = unitService.deleteMany({ ids: removedUnits.map(unit => unit._id) as string[] }, res);
					if (!result) {
						return null;
					}
				}
				existingProject.units = units;
			}
			if (engineerIds) {
				// TODO: Come back and turn this into a function in the usersService
				const engineers = await User.find({ _id: { $in: engineerIds }, permissions: { $in: [permissions.ENGINEER] } })
					.populate('assignedInspections')
					.exec();
				if (engineers.length !== engineerIds.length) {
					res.status(404).json({ error: 'Engineer(s) not found' });
					return null;
				}
				// If there were engineers removed, filter out the ones that are no longer in engineerIds (AKA the manager removed them)
				const removedEngineers = (existingProject.engineers as IUser[]).filter(engineer => !engineerIds.includes(engineer._id as string));
				if (removedEngineers.length > 0) {
					const deletedInspections = [] as IInspection[];
					// For each removed engineer, get their assigned inspections for this project and push them to the deletedInspections array
					for (const engineer of removedEngineers) {
						const inspections = (engineer.assignedInspections as IInspection[]).filter(inspection => inspection.project === id);
						deletedInspections.push(...inspections);
					}
					// Delete the removed inspections
					const result = inspectionService.deleteMany({ ids: deletedInspections.map(inspection => inspection._id) as string[] }, res);
					if (!result) {
						return null;
					}
				}
				existingProject.engineers = engineers;
			}
			if (status && ['started', 'completed', 'not-started'].includes(status)) {
				existingProject.status = status;
			} else {
				res.status(400).json({ error: 'Invalid status' });
				return null;
			}
			// Assigning units to engineers
			if (engineerToUnits) {
				unitService.assignMany({ project: existingProject, engineerToUnits }, res);
			}
			// Save the project
			await existingProject.save();
			return existingProject;
		} catch (error) {
			console.error(`Failed to edit project ${id}:`, error);
			res.status(500).json({ error: 'Error editing project' });
			return null;
		}
	},
	async delete({ id }: DeleteParams, res: Response): Promise<boolean> {
		try {
			// Delete the project
			const result = await Project.deleteOne({ _id: id }).exec();
			// Check if the project was deleted
			if (result.deletedCount === 0) {
				res.status(404).json({ error: 'Project not found' });
				return false;
			}
			return true;
		} catch (error) {
			console.error(`Failed to delete project ${id}:`, error);
			res.status(500).json({ error: 'Error deleting project' });
			return false;
		}
	}
};

export default projectService;
