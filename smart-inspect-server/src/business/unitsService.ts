import type { Response } from 'express';
import Unit, { IUnit } from '../models/Unit';
import { IBuilding } from '../models/Building';
import { IProject } from '../models/Project';
import inspectionService from './inspectionsService';
import { IUser } from '../models/User';

interface CreateManyParams {
	numbers: string[];
	project: IProject;
}

interface DeleteManyParams {
	ids: string[];
}

interface AssignManyParams {
	project: IProject;
	engineerToUnits: { engineerId: string; unitNumbers: string[] }[];
}

const unitService = {
	async createMany({ numbers, project }: CreateManyParams, res: Response): Promise<IUnit[] | null> {
		try {
			// Get the building of the project
			const building = project.building as IBuilding;
			const units = [];
			for (const number of numbers) {
				// Check if the unit exists
				const existingUnit = await Unit.findOne({ number, building: building._id }).exec();
				if (existingUnit) {
					units.push(existingUnit);
				} else {
					// Else, create the new unit
					const newUnit = new Unit({ number, building });
					await newUnit.save();
					units.push(newUnit);
				}
			}
			return units;
		} catch (error) {
			console.error('Failed to create unit:', error);
			res.status(500).json({ error: 'Error creating/getting unit(s)' });
			return null;
		}
	},
	async deleteMany({ ids }: DeleteManyParams, res: Response): Promise<boolean> {
		try {
			await Unit.deleteMany({ _id: { $in: ids } }).exec();
			return true;
		} catch (error) {
			console.error('Failed to delete units:', error);
			res.status(500).json({ error: 'Error deleting units' });
			return false;
		}
	},
	async assignMany({ project, engineerToUnits }: AssignManyParams, res: Response): Promise<boolean> {
		try {
			const engineers = project.engineers as IUser[];
			const units = project.units as IUnit[];
			// Assigning units to engineers
			for (const { engineerId, unitNumbers } of engineerToUnits) {
				const engineer = engineers.find(e => (e._id as string).toString() === engineerId);
				if (!engineer) {
					res.status(404).json({ error: 'Engineer not found' });
					return false;
				}
				const assignedUnits = units.filter(unit => unitNumbers.includes(unit.number));
				if (assignedUnits.length !== unitNumbers.length) {
					res.status(404).json({ error: 'Unit(s) not found' });
					return false;
				}
				const inspections = await inspectionService.createMany({ engineer, units: assignedUnits, project }, res);
				if (!inspections) {
					// Error message already sent
					return false;
				}
			}
			return true;
		} catch (error) {
			console.error('Failed to assign units to engineers:', error);
			res.status(500).json({ error: 'Error assigning unit(s) to engineer(s)' });
			return false;
		}
	}
};

export default unitService;
