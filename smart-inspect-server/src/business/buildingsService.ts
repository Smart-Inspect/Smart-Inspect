import type { Response } from 'express';
import Building, { IBuilding } from '../models/Building';

interface CreateParams {
	name: string;
	address: string;
}

interface ViewParams {
	id: string;
}

interface EditParams {
	id: string;
	name?: string;
	address?: string;
	addresses?: string[];
}

interface DeleteParams {
	id: string;
}

const buildingService = {
	async create({ name, address }: CreateParams, res: Response): Promise<IBuilding | null> {
		try {
			// Checking if the building already exists
			const existingBuilding = await Building.findOne({ name, address }).exec();
			if (existingBuilding) {
				res.status(409).json({ error: 'Building already exists' });
				return null;
			}
			// Creating the new building
			const newBuilding = new Building({ name, address });
			await newBuilding.save();
			return newBuilding;
		} catch (error) {
			console.error('Failed to create building:', error);
			res.status(500).json({ error: 'Error creating building' });
			return null;
		}
	},
	async view({ id }: ViewParams, res: Response): Promise<IBuilding | null> {
		try {
			// Check if the building exists
			const existingBuilding = await Building.findOne({ _id: id })
				.populate({
					path: 'units', // Populate the units
					populate: {
						path: 'inspections' // Populate the inspections within the units
					}
				})
				.exec();
			if (!existingBuilding) {
				res.status(404).json({ error: 'Building not found' });
				return null;
			}
			return existingBuilding;
		} catch (error) {
			console.error(`Failed to get building ${id}:`, error);
			res.status(500).json({ error: 'Error getting building' });
			return null;
		}
	},
	async edit({ id, name, address, addresses }: EditParams, res: Response): Promise<IBuilding | null> {
		try {
			// Check if the building exists
			const existingBuilding = await Building.findOne({ _id: id }).exec();
			if (!existingBuilding) {
				res.status(404).json({ error: 'Building not found' });
				return null;
			}
			// Update the building
			if (name) existingBuilding.name = name;
			if (address) existingBuilding.address = address;
			if (addresses) {
				const newAddresses = [] as { address: string; changedAt: Date }[];
				for (const usrAddr of addresses) {
					const dbAddr = existingBuilding.addresses.find(a => a.address === usrAddr) as { address: string; changedAt: Date };
					if (dbAddr === undefined) {
						res.status(400).json({ error: 'Address in address history not found' });
						return null;
					}
					newAddresses.push(dbAddr);
				}
				if (newAddresses[0].address !== address) {
					res.status(400).json({ error: 'Cannot delete the current address out of the address history' });
					return null;
				}
				existingBuilding.addresses = newAddresses;
			}
			// Save the building
			await existingBuilding.save();
			return existingBuilding;
		} catch (error) {
			console.error(`Failed to update building ${id}:`, error);
			res.status(500).json({ error: 'Error updating building' });
			return null;
		}
	},
	async delete({ id }: DeleteParams, res: Response): Promise<boolean> {
		try {
			const existingBuilding = await Building.findOne({ _id: id }).exec();
			if (!existingBuilding) {
				res.status(404).json({ error: 'Building not found' });
				return false;
			}
			// Delete the building
			await existingBuilding.deleteOne().exec();
			return true;
		} catch (error) {
			console.error(`Failed to delete building ${id}:`, error);
			res.status(500).json({ error: 'Error deleting building' });
			return false;
		}
	}
};

export default buildingService;
