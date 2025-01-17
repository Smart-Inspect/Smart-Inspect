import type { Request, Response } from 'express';
import Inspection from '../models/Inspection';
import inspectionService from '../business/inspectionsService';
import photoService from '../business/photosService';

export async function viewInspection(req: Request, res: Response) {
	const { id } = req.params;
	const inspection = await inspectionService.view({ id }, req, res);
	if (!inspection) {
		return;
	}
	res.status(200).json({
		id: inspection._id,
		engineer: inspection.engineer,
		unit: inspection.unit,
		project: inspection.project,
		inspectionDate: inspection.inspectionDate,
		layout: inspection.layout,
		notes: inspection.notes,
		images: inspection.images
	});
}

export async function editInspection(req: Request, res: Response) {
	const { id } = req.params;
	const { inspectionDate, layoutId, notes } = req.body;
	const inspection = await inspectionService.edit({ id, inspectionDate, layoutId, notes }, req, res);
	if (!inspection) {
		return;
	}
	res.status(200).json({ message: 'Inspection updated' });
}

export async function deleteInspection(req: Request, res: Response) {
	const { id } = req.params;
	const result = await inspectionService.delete({ id }, res);
	if (!result) {
		return;
	}
	res.status(200).json({ message: 'Inspection deleted' });
}

export async function uploadPhoto(req: Request, res: Response) {
	const { id } = req.params;
	const image = await photoService.upload({ inspectionId: id }, req, res);
	if (!image) {
		return;
	}
	res.status(201).json({ message: 'New image uploaded' });
}

export async function downloadPhoto(req: Request, res: Response) {
	const { id, photoId } = req.params;
	const result = await photoService.download({ inspectionId: id, imageId: photoId }, req, res);
	if (!result) {
		return;
	}
}

export async function viewPhotos(req: Request, res: Response) {
	const { id } = req.params;
	const images = await photoService.viewMany({ inspectionId: id }, req, res);
	if (!images) {
		return;
	}
	res.status(200).json(images);
}

export async function viewAssignedInspections(req: Request, res: Response) {
	const { projectId } = req.params;
	const inspections = await inspectionService.viewAssigned({ engineerId: req.user?.id, projectId }, res);
	if (!inspections) {
		return;
	}
	res.status(200).json(inspections);
}

export async function viewAllInspections(req: Request, res: Response) {
	try {
		// Get all inspections
		// Only populating the building field for now
		const inspections = await Inspection.find({}, 'name description building units engineers inspections createdAt updatedAt').populate('building').exec();
		res.status(200).json(inspections);
	} catch (error) {
		console.error('Failed to get inspections:', error);
		res.status(500).json({ error: 'Error getting inspections' });
	}
}
