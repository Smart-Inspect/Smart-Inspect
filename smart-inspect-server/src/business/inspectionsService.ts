import type { Request, Response } from 'express';
import Project, { IMetricsSchema, IProject } from '../models/Project';
import Inspection, { IInspection, IMetric } from '../models/Inspection';
import User, { IUser } from '../models/User';
import permissions from '../config/permissions';
import Unit, { IUnit } from '../models/Unit';
import unitService from './unitsService';

interface CreateManyParams {
	engineer: IUser;
	units: IUnit[];
	project: IProject;
	oldMetricsSchema?: IMetricsSchema[];
	newMetricsSchema?: IMetricsSchema[];
}

interface ViewParams {
	id: string;
}

interface ViewManyParams {
	project: IProject;
}

interface ViewAssignedParams {
	engineerId: string;
	projectId: string;
}

interface EditParams {
	id: string;
	inspectionDate?: Date;
	layoutId?: string;
	notes?: string;
	metrics?: IMetric[];
	status?: 'completed' | 'not-started';
}

interface DeleteParams {
	id: string;
}

interface DeleteManyParams {
	ids: string[];
}

const inspectionService = {
	async createMany({ engineer, units, project, oldMetricsSchema, newMetricsSchema }: CreateManyParams, res: Response): Promise<IInspection[] | null> {
		try {
			const inspections = [];
			for (const unit of units) {
				// Check if the inspection already exists
				const existingInspection = await Inspection.findOne({ unit, project }).exec();
				const newMetrics = newMetricsSchema?.map(({ name }) => ({ name, value: null }) as IMetric);
				if (existingInspection) {
					if (newMetricsSchema && oldMetricsSchema) {
						// Updating the metrics schema
						// Grabs the new metrics that directly match the old metrics (by name and fieldType)
						const newMetricsSchemaWithOldValues = newMetricsSchema.filter(({ name, fieldType }) =>
							oldMetricsSchema.some(oldMetricSchema => oldMetricSchema.name === name && oldMetricSchema.fieldType === fieldType)
						);
						// Loops through the new metrics to be added to the inspection, checks if there is a corresponding old metric value, makes sure it's still within range, and then copies it over to the new metrics
						for (const newMetric of newMetrics as IMetric[]) {
							const newMetricSchemaWithOldValue = newMetricsSchemaWithOldValues.find(({ name }) => newMetric.name === name);
							if (newMetricSchemaWithOldValue) {
								const oldMetric = existingInspection.metrics.find(({ name }) => newMetric.name === name);
								if (oldMetric && oldMetric.value && newMetricSchemaWithOldValue.values?.includes(oldMetric.value)) {
									newMetric.value = oldMetric.value;
								}
							}
						}
						existingInspection.metrics = newMetrics as IMetric[];
						await existingInspection.save();
					} else if (newMetricsSchema && !oldMetricsSchema) {
						existingInspection.metrics = newMetrics as IMetric[];
						await existingInspection.save();
					}
					inspections.push(existingInspection);
				} else {
					// Creating the new inspection
					console.log('Creating new inspection: ', newMetrics);
					const newInspection = new Inspection({ engineer, unit, project, metrics: newMetrics });
					unit.inspections.push(newInspection);
					project.inspections.push(newInspection);
					await unit.save();
					console.log('Unit saved');
					await newInspection.save();
					inspections.push(newInspection);
				}
			}
			return inspections;
		} catch (error) {
			console.error('Error creating inspection:', error);
			res.status(500).json({ error: 'Error creating inspection' });
			return null;
		}
	},
	async view({ id }: ViewParams, req: Request, res: Response): Promise<IInspection | null> {
		try {
			// Getting the inspection
			const inspection = await Inspection.findOne({ _id: id }).populate('project').populate('engineer').populate('unit').populate('layout').populate('photos').exec();
			// Checking if the inspection exists
			if (!inspection) {
				res.status(404).json({ error: 'Inspection not found' });
				return null;
			}
			// Checking if the user has permission to view the inspection
			if (req.user?._id !== (inspection.engineer as IUser)._id && !req.user?.permissions.includes(permissions.MANAGER)) {
				res.status(403).json({ error: 'Permission denied' });
				return null;
			}
			return inspection;
		} catch (error) {
			console.error(`Error viewing inspection ${id}:`, error);
			res.status(500).json({ error: 'Error viewing inspection' });
			return null;
		}
	},
	async viewMany({ project }: ViewManyParams, res: Response): Promise<IInspection[] | null> {
		try {
			// Get all the inspections of the project
			const inspections = project.inspections as IInspection[];
			return inspections;
		} catch (error) {
			console.error(`Error viewing inspections from project ${project._id}:`, error);
			res.status(500).json({ error: 'Error viewing inspections' });
			return null;
		}
	},
	async viewAssigned({ engineerId, projectId }: ViewAssignedParams, res: Response): Promise<IInspection[] | null> {
		try {
			// Getting the engineer
			const engineer = await User.findOne({ _id: engineerId, permissions: { $in: [permissions.ENGINEER] } }).exec();
			// Checking if the engineer exists
			if (!engineer) {
				res.status(404).json({ error: 'Engineer not found' });
				return null;
			}
			// Getting the project
			const project = await Project.findOne({ _id: projectId }).exec();
			// Checking if the project exists
			if (!project) {
				res.status(404).json({ error: 'Project not found' });
				return null;
			}
			// Getting the inspections assigned to the engineer for the specified project
			const inspections = await Inspection.find({ project, engineer }).exec();
			if (!inspections) {
				res.status(404).json({ error: 'Inspections not found' });
				return null;
			}
			return inspections;
		} catch (error) {
			console.error(`Error viewing inspections assigned to engineer ${engineerId}:`, error);
			res.status(500).json({ error: 'Error viewing inspections' });
			return null;
		}
	},
	async edit({ id, inspectionDate, layoutId, notes, metrics, status }: EditParams, req: Request, res: Response): Promise<IInspection | null> {
		try {
			// Getting the inspection
			const inspection = await Inspection.findOne({ _id: id }).populate('layout').populate('project').exec();
			// Checking if the inspection exists
			if (!inspection) {
				res.status(404).json({ error: 'Inspection not found' });
				return null;
			}
			// Checking if the user has permission to edit the inspection
			if (req.user?._id !== (inspection.engineer as IUser)._id && !req.user?.permissions.includes(permissions.MANAGER)) {
				res.status(403).json({ error: 'Permission denied' });
				return null;
			}
			// Updating the inspection
			if (inspectionDate) inspection.inspectionDate = inspectionDate;
			if (layoutId) inspection.layout = layoutId;
			if (notes) inspection.notes = notes;
			if (metrics) {
				for (const existingMetric of inspection.metrics) {
					const newMetric = metrics.find(({ name }) => name === existingMetric.name);
					const metricSchema = (inspection.project as IProject).metricsSchema.find(({ name }) => name === existingMetric.name);
					if (newMetric && (newMetric.value === null || metricSchema?.values?.includes(newMetric.value))) {
						existingMetric.value = newMetric.value;
					}
				}
			}
			if (status) inspection.status = status;
			await inspection.save();
			return inspection;
		} catch (error) {
			console.error(`Error editing inspection ${id}:`, error);
			res.status(500).json({ error: 'Error editing inspection' });
			return null;
		}
	},
	async delete({ id }: DeleteParams, res: Response): Promise<boolean> {
		try {
			const existingInspection = await Inspection.findOne({ _id: id }).populate('unit').exec();
			if (!existingInspection) {
				res.status(404).json({ error: 'Inspection not found' });
				return false;
			}
			const unitId = (existingInspection.unit as IUnit)._id as string;
			// Deleting the inspection
			await existingInspection.deleteOne().exec();
			// Re-get the inspection unit (since its inspection history just changed)
			const unit = await Unit.findOne({ _id: unitId }).exec();
			if (!unit) {
				res.status(500).json({ error: 'Error updating unit on inspection' });
				return false;
			}
			// Removing the unit if it has no inspection history
			const result = await unitService.deleteMany({ units: [unit] }, res);
			if (!result) {
				// Error message already sent
				return false;
			}
			return true;
		} catch (error) {
			console.error(`Error deleting inspection ${id}:`, error);
			res.status(500).json({ error: 'Error deleting inspection' });
			return false;
		}
	},
	async deleteMany({ ids }: DeleteManyParams, res: Response): Promise<boolean> {
		try {
			// Deleting the inspections with the given ids
			const result = await Inspection.deleteMany({ _id: { $in: ids } });
			// If not all inspections were deleted
			if (result.deletedCount !== ids.length) {
				res.status(404).json({ error: 'Inspection(s) not found' });
				return false;
			}
			return true;
		} catch (error) {
			console.error('Error deleting inspections:', error);
			res.status(500).json({ error: 'Error deleting inspections' });
			return false;
		}
	}
};

export default inspectionService;
