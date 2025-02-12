import type { Request, Response } from 'express';
import Inspection from '../models/Inspection';
import permissions from '../config/permissions';
import { IImage } from '../models/Image';
import imageService from './imagesService';
import { ObjectId } from 'mongoose';

interface UploadParams {
	inspectionId: string;
}

interface DownloadParams {
	inspectionId: string;
	photoId: string;
}

interface DeleteManyParams {
	inspectionId: string;
	photoIds: string[];
}

const photoService = {
	async upload({ inspectionId }: UploadParams, req: Request, res: Response): Promise<IImage | null> {
		try {
			const images = res.locals.images;
			if (!images) {
				res.status(400).json({ error: 'No file(s) uploaded' });
				return null;
			}
			const inspection = await Inspection.findOne({ _id: inspectionId }).populate('photos').populate('engineer').exec();
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
			(inspection.photos as IImage[]).push(...images);
			await inspection.save();
			return images;
		} catch (error) {
			console.log(`Error uploading images for inspection ${inspectionId}:`, error);
			res.status(500).json({ error: 'Error uploading image(s)' });
			return null;
		}
	},
	async download({ inspectionId, photoId }: DownloadParams, req: Request, res: Response): Promise<boolean> {
		try {
			const inspection = await Inspection.findOne({ _id: inspectionId }).populate('photos').populate('engineer').exec();
			if (!inspection) {
				res.status(404).json({ error: 'Inspection not found' });
				return false;
			}
			if (!(inspection.photos as IImage[]).map(image => image._id).includes(photoId)) {
				res.status(404).json({ error: 'Image not found' });
				return false;
			}
			if (inspection.engineer !== req.user?._id && !req.user?.permissions.includes(permissions.MANAGER)) {
				res.status(403).json({ error: 'Permission denied' });
				return false;
			}
			return await imageService.download({ id: photoId }, res);
		} catch (error) {
			console.log(`Error downloading image for inspection ${inspectionId}:`, error);
			res.status(500).json({ error: 'Error downloading image' });
			return false;
		}
	},
	async deleteMany({ inspectionId, photoIds }: DeleteManyParams, res: Response): Promise<boolean> {
		try {
			const inspection = await Inspection.findOne({ _id: inspectionId }).populate('photos').exec();
			if (!inspection) {
				res.status(404).json({ error: 'Inspection not found' });
				return false;
			}
			const wrongPhotos = photoIds.filter(photoId => !(inspection.photos as IImage[]).map(photo => (photo._id as ObjectId).toString()).includes(photoId));
			if (wrongPhotos.length > 0) {
				res.status(404).json({ error: `Photo(s) ${wrongPhotos.join(', ')} not found` });
				return false;
			}
			const result = await imageService.deleteMany({ ids: photoIds }, res);
			if (!result) {
				// Error message already sent
				return false;
			}
			return true;
		} catch (error) {
			console.log(`Error deleting photos from inspection ${inspectionId}:`, error);
			res.status(500).json({ error: 'Error deleting photo(s)' });
			return false;
		}
	}
};

export default photoService;
