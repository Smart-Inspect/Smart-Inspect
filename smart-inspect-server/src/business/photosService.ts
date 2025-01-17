import type { Request, Response } from 'express';
import Inspection from '../models/Inspection';
import permissions from '../config/permissions';
import { IImage } from '../models/Image';
import imageService from './imagesService';
import { ObjectId } from 'mongoose';

interface ViewManyParams {
	inspectionId: string;
}

interface UploadParams {
	inspectionId: string;
}

interface DownloadParams {
	inspectionId: string;
	imageId: string;
}

const photoService = {
	async viewMany({ inspectionId }: ViewManyParams, req: Request, res: Response): Promise<IImage[] | null> {
		try {
			const inspection = await Inspection.findOne({ _id: inspectionId }).populate('images').exec();
			if (!inspection) {
				res.status(404).json({ error: 'Inspection not found' });
				return null;
			}
			if (inspection.engineer !== req.user?._id && !req.user?.permissions.includes(permissions.MANAGER)) {
				res.status(403).json({ error: 'Permission denied' });
				return null;
			}
			return inspection.images as IImage[];
		} catch (error) {
			console.log(`Error viewing inspection ${inspectionId}:`, error);
			res.status(500).json({ error: 'Error viewing inspections' });
			return null;
		}
	},
	async upload({ inspectionId }: UploadParams, req: Request, res: Response): Promise<IImage | null> {
		try {
			const images = res.locals.images;
			if (!images) {
				res.status(400).json({ error: 'No file(s) uploaded' });
				return null;
			}
			const inspection = await Inspection.findOne({ _id: inspectionId }).populate('images').populate('engineer').exec();
			if (!inspection) {
				res.status(404).json({ error: 'Inspection not found' });
				await imageService.deleteMany({ ids: (images as IImage[]).map(image => (image._id as ObjectId).toString()) }, res);
				return null;
			}
			if (inspection.engineer !== req.user?._id && !req.user?.permissions.includes(permissions.MANAGER)) {
				res.status(403).json({ error: 'Permission denied' });
				await imageService.deleteMany({ ids: (images as IImage[]).map(image => (image._id as ObjectId).toString()) }, res);
				return null;
			}
			(inspection.images as IImage[]).push(...images);
			await inspection.save();
			return images;
		} catch (error) {
			console.log(`Error uploading images for inspection ${inspectionId}:`, error);
			res.status(500).json({ error: 'Error uploading image(s)' });
			return null;
		}
	},
	async download({ inspectionId, imageId }: DownloadParams, req: Request, res: Response): Promise<boolean> {
		try {
			const inspection = await Inspection.findOne({ _id: inspectionId }).populate('images').populate('engineer').exec();
			if (!inspection) {
				res.status(404).json({ error: 'Inspection not found' });
				return false;
			}
			if (!(inspection.images as IImage[]).map(image => image._id).includes(imageId)) {
				res.status(404).json({ error: 'Image not found' });
				return false;
			}
			if (inspection.engineer !== req.user?._id && !req.user?.permissions.includes(permissions.MANAGER)) {
				res.status(403).json({ error: 'Permission denied' });
				return false;
			}
			return await imageService.download({ id: imageId }, res);
		} catch (error) {
			console.log(`Error downloading image for inspection ${inspectionId}:`, error);
			res.status(500).json({ error: 'Error downloading image' });
			return false;
		}
	}
};

export default photoService;
