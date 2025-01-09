import type { Request, Response } from 'express';
import { IProject } from '../models/Project';
import Inspection, { IInspection } from '../models/Inspection';
import User, { IUser } from '../models/User';
import permissions from '../config/permissions';
import { IUnit } from '../models/Unit';

interface CreateManyParams {
	engineer: IUser;
	units: IUnit[];
	project: IProject;
}

interface ViewParams {
	id: string;
}

interface ViewManyParams {
	project: IProject;
}

interface ViewAssignedParams {
	engineerId: string;
	projectId: string;
}

interface EditParams {
	id: string;
	inspectionDate?: Date;
	layoutId?: string;
	notes?: string;
}

interface DeleteManyParams {
	ids: string[];
}

const inspectionService = {
	async createMany({ engineer, units, project }: CreateManyParams, res: Response): Promise<IInspection[] | null> {
		try {
			const newInspections = [];
			for (const unit of units) {
				// Check if the inspection already exists
				const existingInspection = await Inspection.findOne({ unit, project }).exec();
				if (existingInspection) {
					res.status(400).json({ error: 'Inspection already exists' });
					return null;
				}
				// Creating the new inspection
				const newInspection = new Inspection({ engineer, unit, project });
				engineer.assignedInspections.push(newInspection);
				unit.inspections.push(newInspection);
				project.inspections.push(newInspection);
				await engineer.save();
				await unit.save();
				await newInspection.save();
				newInspections.push(newInspection);
			}
			return newInspections;
		} catch (error) {
			console.log('Error creating inspection:', error);
			res.status(500).json({ error: 'Error creating inspection' });
			return null;
		}
	},
	async view({ id }: ViewParams, req: Request, res: Response): Promise<IInspection | null> {
		try {
			// Getting the inspection
			const inspection = await Inspection.findOne({ _id: id }).populate('project').populate('engineer').populate('unit').populate('layout').populate('images').exec();
			// Checking if the inspection exists
			if (!inspection) {
				res.status(404).json({ error: 'Inspection not found' });
				return null;
			}
			// Checking if the user has permission to view the inspection
			if (req.user?._id !== (inspection.engineer as IUser)._id && !req.user?.permissions.includes(permissions.MANAGER)) {
				res.status(403).json({ error: 'Permission denied' });
				return null;
			}
			return inspection;
		} catch (error) {
			console.log(`Error viewing inspection ${id}:`, error);
			res.status(500).json({ error: 'Error viewing inspection' });
			return null;
		}
	},
	async viewMany({ project }: ViewManyParams, res: Response): Promise<IInspection[] | null> {
		try {
			// Get all the inspections of the project
			const inspections = project.inspections as IInspection[];
			return inspections;
		} catch (error) {
			console.log(`Error viewing inspections from project ${project._id}:`, error);
			res.status(500).json({ error: 'Error viewing inspections' });
			return null;
		}
	},
	async viewAssigned({ engineerId, projectId }: ViewAssignedParams, res: Response): Promise<IInspection[] | null> {
		try {
			const engineer = await User.findOne({ _id: engineerId, permissions: { $in: [permissions.ENGINEER] } })
				.populate({
					path: 'assignedInspections',
					populate: [{ path: 'project' }]
				})
				.exec();
			// Checking if the engineer exists
			if (!engineer) {
				res.status(404).json({ error: 'Engineer not found' });
				return null;
			}
			// Getting the inspections assigned to the engineer for the specified project
			const inspections = (engineer.assignedInspections as IInspection[]).filter(inspection => (inspection.project as IProject)._id === projectId);
			if (!inspections) {
				res.status(404).json({ error: 'Inspections not found' });
				return null;
			}
			return inspections;
		} catch (error) {
			console.log(`Error viewing inspections assigned to engineer ${engineerId}:`, error);
			res.status(500).json({ error: 'Error viewing inspections' });
			return null;
		}
	},
	async edit({ id, inspectionDate, layoutId, notes }: EditParams, req: Request, res: Response): Promise<IInspection | null> {
		try {
			// Getting the inspection
			const inspection = await Inspection.findOne({ _id: id }).populate('layout').exec();
			// Checking if the inspection exists
			if (!inspection) {
				res.status(404).json({ error: 'Inspection not found' });
				return null;
			}
			// Checking if the user has permission to edit the inspection
			if (req.user?._id !== (inspection.engineer as IUser)._id && !req.user?.permissions.includes(permissions.MANAGER)) {
				res.status(403).json({ error: 'Permission denied' });
				return null;
			}
			// Updating the inspection
			if (inspectionDate) inspection.inspectionDate = inspectionDate;
			if (layoutId) inspection.layout = layoutId;
			if (notes) inspection.notes = notes;
			await inspection.save();
			return inspection;
		} catch (error) {
			console.log(`Error editing inspection ${id}:`, error);
			res.status(500).json({ error: 'Error editing inspection' });
			return null;
		}
	},
	async delete({ id }: ViewParams, res: Response): Promise<boolean> {
		try {
			// Deleting the inspection
			const result = await Inspection.deleteOne({ _id: id });
			// Checking if the inspection was deleted
			if (result.deletedCount !== 1) {
				res.status(404).json({ error: 'Inspection not found' });
				return false;
			}
			return true;
		} catch (error) {
			console.log(`Error deleting inspection ${id}:`, error);
			res.status(500).json({ error: 'Error deleting inspection' });
			return false;
		}
	},
	async deleteMany({ ids }: DeleteManyParams, res: Response): Promise<boolean> {
		try {
			// Deleting the inspections with the given ids
			const result = await Inspection.deleteMany({ _id: { $in: ids } });
			// If not all inspections were deleted
			if (result.deletedCount !== ids.length) {
				res.status(404).json({ error: 'Inspection(s) not found' });
				return false;
			}
			return true;
		} catch (error) {
			console.log('Error deleting inspections:', error);
			res.status(500).json({ error: 'Error deleting inspections' });
			return false;
		}
	}
};

export default inspectionService;
