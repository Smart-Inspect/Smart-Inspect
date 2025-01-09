import type { Request, Response } from 'express';
import Project from '../models/Project';
import { IImage } from '../models/Image';
import imageService from './imagesService';
import { IUser } from '../models/User';
import permissions from '../config/permissions';

interface UploadManyParams {
	projectId: string;
	timestamps: string[];
}

interface DownloadParams {
	projectId: string;
	layoutId: string;
}

interface ViewManyParams {
	projectId: string;
}

interface DeleteManyParams {
	projectId: string;
	ids: string[];
}

const layoutService = {
	async uploadMany({ projectId, timestamps }: UploadManyParams, req: Request, res: Response): Promise<IImage[] | null> {
		try {
			const project = await Project.findOne({ _id: projectId }).exec();
			if (!project) {
				res.status(404).json({ error: 'Project not found' });
				return null;
			}
			const images = await imageService.uploadMany({ allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png'], timestamps }, req, res);
			if (!images) {
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
			if (!project.layouts.map(layout => layout._id).includes(layoutId)) {
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
	async viewMany({ projectId }: ViewManyParams, req: Request, res: Response): Promise<IImage[] | null> {
		try {
			const project = await Project.findOne({ _id: projectId }).populate('layouts').populate('engineers').exec();
			if (!project) {
				res.status(404).json({ error: 'Project not found' });
				return null;
			}
			if (!(project.engineers as IUser[]).map(engineer => engineer._id).includes(req.user?._id) && !req.user?.permissions.includes(permissions.MANAGER)) {
				res.status(403).json({ error: 'Permission denied' });
				return null;
			}
			return project.layouts as IImage[];
		} catch (error) {
			console.log(`Error viewing layouts from project ${projectId}:`, error);
			res.status(500).json({ error: 'Error viewing layout metadata' });
			return null;
		}
	},
	async deleteMany({ projectId, ids }: DeleteManyParams, res: Response): Promise<boolean> {
		try {
			const project = await Project.findOne({ _id: projectId }).exec();
			if (!project) {
				res.status(404).json({ error: 'Project not found' });
				return false;
			}
			for (const id of ids) {
				const image = project.layouts.find(image => image._id === id);
				if (image) {
					const result = await imageService.delete({ id }, res);
					if (!result) {
						res.status(500).json({ error: `Error deleting layout ${id}` });
						return false;
					}
				} else {
					res.status(404).json({ error: `Layout ${id} not found` });
					return false;
				}
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
