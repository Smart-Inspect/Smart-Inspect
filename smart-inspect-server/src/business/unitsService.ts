import type { Response } from 'express';
import Unit, { IUnit } from '../models/Unit';
import Building, { IBuilding } from '../models/Building';
import { IMetricsSchema, IProject } from '../models/Project';
import inspectionService from './inspectionsService';
import { IUser } from '../models/User';

interface CreateManyParams {
	numbers: string[];
	project: IProject;
}

interface ViewParams {
	id: string;
}

interface EditParams {
	id: string;
	number?: string;
}

interface DeleteParams {
	id: string;
}

interface DeleteManyParams {
	units: IUnit[];
}

interface AssignManyParams {
	project: IProject;
	engineerToUnits: { engineerId: string; unitNumbers: string[] }[];
	oldMetricsSchema?: IMetricsSchema[];
	newMetricsSchema?: IMetricsSchema[];
}

const unitService = {
	async createMany({ numbers, project }: CreateManyParams, res: Response): Promise<IUnit[] | null> {
		try {
			// Get the building of the project
			const building = (await Building.findOne({ _id: project.building }).populate('units').exec()) as IBuilding;
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
					building.units.push(newUnit);
				}
			}
			await building.save();
			return units;
		} catch (error) {
			console.error('Failed to create unit:', error);
			res.status(500).json({ error: 'Error creating/getting unit(s)' });
			return null;
		}
	},
	async view({ id }: ViewParams, res: Response): Promise<IUnit | null> {
		try {
			const unit = await Unit.findOne({ _id: id })
				.populate('building')
				.populate({
					path: 'inspections', // Populate the units
					populate: {
						path: 'engineer' // Populate the inspections within the units
					}
				})
				.exec();
			if (!unit) {
				res.status(404).json({ error: 'Unit not found' });
				return null;
			}
			return unit;
		} catch (error) {
			console.error('Failed to get unit:', error);
			res.status(500).json({ error: 'Error getting unit' });
			return null;
		}
	},
	async edit({ id, number }: EditParams, res: Response): Promise<IUnit | null> {
		try {
			const unit = await Unit.findOne({ _id: id }).exec();
			if (!unit) {
				res.status(404).json({ error: 'Unit not found' });
				return null;
			}
			if (number) unit.number = number;
			await unit.save();
			return unit;
		} catch (error) {
			console.error('Failed to edit unit:', error);
			res.status(500).json({ error: 'Error editing unit' });
			return null;
		}
	},
	async delete({ id }: DeleteParams, res: Response): Promise<boolean> {
		try {
			const unit = await Unit.findOne({ _id: id }).exec();
			if (!unit) {
				res.status(404).json({ error: 'Unit not found' });
				return false;
			}
			await unit.deleteOne();
			return true;
		} catch (error) {
			console.error('Failed to delete unit:', error);
			res.status(500).json({ error: 'Error deleting unit' });
			return false;
		}
	},
	async deleteMany({ units }: DeleteManyParams, res: Response): Promise<boolean> {
		try {
			// Only keep the units that have no inspection history (AKA they can be deleted safely)
			const removedUnits = (units as IUnit[]).filter(unit => unit.inspections.length === 0);
			if (removedUnits.length > 0) {
				// Delete the removed units
				const result = Unit.deleteMany({ _id: { $in: removedUnits } }).exec();
				if (!result) {
					res.status(500).json({ error: 'Error deleting units' });
					return false;
				}
			}
			return true;
		} catch (error) {
			console.error('Failed to delete units:', error);
			res.status(500).json({ error: 'Error deleting units' });
			return false;
		}
	},
	async assignMany({ project, engineerToUnits, oldMetricsSchema, newMetricsSchema }: AssignManyParams, res: Response): Promise<boolean> {
		try {
			const engineers = project.engineers as IUser[];
			const units = project.units as IUnit[];
			// Assigning units (or rather inspections) to engineers
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
				const inspections = await inspectionService.createMany({ engineer, units: assignedUnits, project, oldMetricsSchema, newMetricsSchema }, res);
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
