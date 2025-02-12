import type { Request, Response } from 'express';
import unitService from '../business/unitsService';

export async function viewUnit(req: Request, res: Response) {
	const { id } = req.params;
	const unit = await unitService.view({ id }, res);
	if (!unit) {
		return;
	}
	res.status(200).json({
		id: unit._id,
		number: unit.number,
		building: unit.building,
		inspections: unit.inspections,
		createdAt: unit.createdAt,
		updatedAt: unit.updatedAt
	});
}

export async function editUnit(req: Request, res: Response) {
	const { id } = req.params;
	const result = await unitService.edit({ id, ...req.body }, res);
	if (!result) {
		return;
	}
	res.status(200).json({ message: 'Unit edited' });
}

export async function deleteUnit(req: Request, res: Response) {
	const { id } = req.params;
	const result = await unitService.delete({ id }, res);
	if (!result) {
		return;
	}
	res.status(200).json({ message: 'Unit deleted' });
}
