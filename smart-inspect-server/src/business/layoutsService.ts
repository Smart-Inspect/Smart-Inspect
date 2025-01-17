import type { Request, Response } from 'express';
import Project from '../models/Project';
import { IImage } from '../models/Image';
import imageService from './imagesService';
import { IUser } from '../models/User';
import permissions from '../config/permissions';
import { ObjectId } from 'mongoose';

interface UploadManyParams {
	projectId: string;
}

interface DownloadParams {
	projectId: string;
	layoutId: string;
}

interface DeleteManyParams {
	projectId: string;
	ids: string[];
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
			if (!(project.layouts as IImage[]).map(layout => layout._id).includes(layoutId)) {
				res.status(404).json({ error: 'Layout not found' });
				return false;
			}
			if (!(project.engineers as IUser[]).map(engineer => engineer._id).includes(req.user?._id) && !req.user?.permissions.includes(permissions.MANAGER)) {
				res.status(403).json({ error: 'Permission denied' });
				return false;
			}
			return await imageService.download({ id: layoutId }, res);
		} catch (error) {
			console.log(`Error downloading layout ${projectId}:`, error);
			res.status(500).json({ error: 'Error downloading layout' });
			return false;
		}
	},
	async deleteMany({ projectId, ids }: DeleteManyParams, res: Response): Promise<boolean> {
		try {
			const project = await Project.findOne({ _id: projectId }).populate('layouts').exec();
			if (!project) {
				res.status(404).json({ error: 'Project not found' });
				return false;
			}
			const wrongLayout = ids.filter(id => !(project.layouts as IImage[]).map(layout => layout._id).includes(id));
			if (wrongLayout.length > 0) {
				res.status(404).json({ error: `Layout(s) ${wrongLayout.join(', ')} not found` });
				return false;
			}

			const result = await imageService.deleteMany({ ids }, res);
			if (!result) {
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
