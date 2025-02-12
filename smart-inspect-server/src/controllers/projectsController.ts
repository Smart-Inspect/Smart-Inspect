import type { Request, Response } from 'express';
import Project from '../models/Project';
import projectService from '../business/projectsService';
import layoutService from '../business/layoutsService';

export async function createProject(req: Request, res: Response): Promise<void> {
	const { name, description, buildingId, unitNumbers, engineerIds, engineerToUnits, metricsSchema } = req.body;
	const project = await projectService.create({ name, description, buildingId, unitNumbers, engineerIds, engineerToUnits, metricsSchema }, res);
	if (!project) {
		return;
	}
	res.status(201).json({ message: 'New project created', id: project._id });
}

export async function viewProject(req: Request, res: Response) {
	const { id } = req.params;
	const project = await projectService.view({ id }, req, res);
	if (!project) {
		return;
	}
	res.status(200).json({
		id: project._id,
		name: project.name,
		description: project.description,
		building: project.building,
		layouts: project.layouts,
		units: project.units,
		engineers: project.engineers,
		inspections: project.inspections,
		metricsSchema: project.metricsSchema,
		status: project.status,
		createdAt: project.createdAt,
		updatedAt: project.updatedAt
	});
}

export async function editProject(req: Request, res: Response) {
	const { id } = req.params;
	const { name, description, unitNumbers, engineerIds, status, engineerToUnits, metricsSchema } = req.body;
	const project = await projectService.edit({ id, name, description, unitNumbers, engineerIds, status, engineerToUnits, metricsSchema }, res);
	if (!project) {
		return;
	}
	res.status(200).json({ message: 'Project updated' });
}

export async function deleteProject(req: Request, res: Response) {
	const { id } = req.params;
	const result = await projectService.delete({ id }, res);
	if (!result) {
		return;
	}
	res.status(200).json({ message: 'Project deleted' });
}

export async function uploadLayouts(req: Request, res: Response) {
	const { id } = req.params;
	const layout = await layoutService.uploadMany({ projectId: id }, req, res);
	if (!layout) {
		return;
	}
	res.status(201).json({ message: 'New layout(s) created' });
}

export async function downloadLayout(req: Request, res: Response) {
	const { id, layoutId } = req.params;
	const layout = await layoutService.download({ projectId: id, layoutId }, req, res);
	if (!layout) {
		return;
	}
}

export async function deleteLayouts(req: Request, res: Response) {
	const { id } = req.params;
	const { layoutIds } = req.body;
	const result = await layoutService.deleteMany({ projectId: id, layoutIds }, res);
	if (!result) {
		return;
	}
	res.status(200).json({ message: 'Layout(s) deleted' });
}

export async function viewAssignedProjects(req: Request, res: Response) {
	const { id } = req.params;
	const projects = await projectService.viewAssigned({ engineerId: id }, res);
	if (!projects) {
		return;
	}
	res.status(200).json(projects);
}

export async function viewAllProjects(req: Request, res: Response) {
	try {
		// Get all projects
		// Only populating the building field for now
		const projects = await Project.find({}, 'name description building units engineers inspections metricsSchema status createdAt updatedAt').populate('building').exec();
		res.status(200).json(projects);
	} catch (error) {
		console.error('Failed to get projects:', error);
		res.status(500).json({ error: 'Error getting projects' });
	}
}
