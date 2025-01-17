import type { Request, Response } from 'express';
import Building from '../models/Building';
import buildingService from '../business/buildingsService';

export async function createBuilding(req: Request, res: Response): Promise<void> {
	const { name, address } = req.body;
	const building = await buildingService.create({ name, address }, res);
	if (!building) {
		return;
	}
	res.status(201).json({ message: 'New building created', id: building._id });
}

export async function viewBuilding(req: Request, res: Response) {
	const { id } = req.params;
	const building = await buildingService.view({ id }, res);
	if (!building) {
		return;
	}
	res.status(200).json({
		id: building._id,
		name: building.name,
		address: building.address,
		addresses: building.addresses,
		units: building.units,
		createdAt: building.createdAt,
		updatedAt: building.updatedAt
	});
}

export async function editBuilding(req: Request, res: Response) {
	const { id } = req.params;
	const { name, address, addresses } = req.body;
	const building = await buildingService.edit({ id, name, address, addresses }, res);
	if (!building) {
		return;
	}
	res.status(200).json({ message: 'Building updated' });
}

export async function deleteBuilding(req: Request, res: Response) {
	const { id } = req.params;
	const result = await buildingService.delete({ id }, res);
	if (!result) {
		return;
	}
	res.status(200).json({ message: 'Building deleted' });
}

export async function viewAllBuildings(req: Request, res: Response) {
	try {
		// Get all buildings
		const buildings = await Building.find({}, 'name address addresses createdAt updatedAt').exec();
		res.status(200).json(buildings);
	} catch (error) {
		console.error('Failed to get buildings:', error);
		res.status(500).json({ error: 'Error getting buildings' });
	}
}
