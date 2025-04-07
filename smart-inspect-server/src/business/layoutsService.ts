import type { Request, Response } from 'express';
import Project from '../models/Project';
import { IImage } from '../models/Image';
import imageService from './imagesService';
import { IUser } from '../models/User';
import permissions from '../config/permissions';
import { ObjectId } from 'mongoose';
import Inspection from '../models/Inspection';

interface UploadManyParams {
	projectId: string;
}

interface DownloadParams {
	projectId: string;
	layoutId: string;
}

interface DownloadFromInspectionParams {
	inspectionId: string;
}

interface DeleteManyParams {
	projectId: string;
	layoutIds: string[];
}

const layoutService = {
	async uploadMany({ projectId }: UploadManyParams, req: Request, res: Response): Promise<IImage[] | null> {
		try {
			const images = res.locals.images;
			if (!images) {
				res.status(400).json({ error: 'No file(s) uploaded' });
				return null;
			}
			const project = await Project.findOne({ _id: projectId }).exec();
			if (!project) {
				res.status(404).json({ error: 'Project not found' });
				await imageService.deleteMany({ ids: (images as IImage[]).map(image => (image._id as ObjectId).toString()) }, res);
				return null;
			}
			(project.layouts as IImage[]).push(...images);
			await project.save();
			return images;
		} catch (error) {
			console.log(`Error uploading layouts of project ${projectId}:`, error);
			res.status(500).json({ error: 'Error uploading layout(s)' });
			return null;
		}
	},
	async download({ projectId, layoutId }: DownloadParams, req: Request, res: Response): Promise<boolean> {
		try {
			const project = await Project.findOne({ _id: projectId }).populate('engineers').populate('layouts').exec();
			if (!project) {
				res.status(404).json({ error: 'Project not found' });
				return false;
			}
			if (!(project.layouts as IImage[]).map(layout => (layout._id as ObjectId).toString()).includes(layoutId)) {
				res.status(404).json({ error: 'Layout not found' });
				return false;
			}
			if (!req.user?.permissions.includes(permissions.MANAGER) && !(project.engineers as IUser[]).map(engineer => (engineer._id as string).toString()).includes(req.user?.id)) {
				res.status(403).json({ error: 'Permission denied' });
				return false;
			}
			return await imageService.download({ id: layoutId }, res);
		} catch (error) {
			console.log(`Error downloading layout from project ${projectId}:`, error);
			res.status(500).json({ error: 'Error downloading layout' });
			return false;
		}
	},
	async downloadFromInspection({ inspectionId }: DownloadFromInspectionParams, req: Request, res: Response): Promise<boolean> {
		try {
			const inspection = await Inspection.findOne({ _id: inspectionId }).populate('engineer').populate('layout').exec();
			if (!inspection) {
				res.status(404).json({ error: 'Inspection not found' });
				return false;
			}
			const layoutId = ((inspection.layout as IImage)._id as string).toString();
			if (!layoutId) {
				res.status(404).json({ error: 'Layout not found' });
				return false;
			}
			if (!req.user?.permissions.includes(permissions.MANAGER) && ((inspection.engineer as IUser)._id as string).toString() !== req.user?.id) {
				res.status(403).json({ error: 'Permission denied' });
				return false;
			}
			return await imageService.download({ id: layoutId }, res);
		} catch (error) {
			console.log(`Error downloading layout from inspection ${inspectionId}:`, error);
			res.status(500).json({ error: 'Error downloading layout' });
			return false;
		}
	},
	async deleteMany({ projectId, layoutIds }: DeleteManyParams, res: Response): Promise<boolean> {
		try {
			const project = await Project.findOne({ _id: projectId }).populate('layouts').exec();
			if (!project) {
				res.status(404).json({ error: 'Project not found' });
				return false;
			}
			const wrongLayouts = layoutIds.filter(layoutId => !(project.layouts as IImage[]).map(layout => (layout._id as ObjectId).toString()).includes(layoutId));
			if (wrongLayouts.length > 0) {
				res.status(404).json({ error: `Layout(s) ${wrongLayouts.join(', ')} not found` });
				return false;
			}
			const result = await imageService.deleteMany({ ids: layoutIds }, res);
			if (!result) {
				// Error message already sent
				return false;
			}
			return true;
		} catch (error) {
			console.log(`Error deleting layouts from project ${projectId}:`, error);
			res.status(500).json({ error: 'Error deleting layout(s)' });
			return false;
		}
	}
};

export default layoutService;
