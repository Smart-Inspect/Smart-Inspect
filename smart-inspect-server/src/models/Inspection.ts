import mongoose, { CallbackError, Document, Schema } from 'mongoose';
import { IUser } from './User';
import Unit, { IUnit } from './Unit';
import Project, { IProject } from './Project';
import { IImage } from './Image';

export interface IInspection extends Document {
	engineer: IUser['_id'];
	unit: IUnit['_id'];
	project: IProject['_id'];
	inspectionDate: Date;
	layout: IImage['_id'];
	notes: string;
	images: IImage['_id'][];
	status: 'completed' | 'not-started';
}

const inspectionSchema: Schema<IInspection> = new Schema({
	engineer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
	project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
	inspectionDate: { type: Date, required: false },
	layout: { type: Schema.Types.ObjectId, ref: 'Image', required: false },
	notes: { type: String, required: false },
	images: [{ type: Schema.Types.ObjectId, ref: 'Image', default: [] }],
	status: { type: String, enum: ['completed', 'not-started'], default: 'not-started' }
});

// Add a compound unique index for engineer, unit, and project
inspectionSchema.index({ unit: 1, project: 1 }, { unique: true });

// Pre-delete hook to remove references to this inspectios from any projects and units
inspectionSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
	try {
		await Project.updateMany({ inspections: this._id }, { $pull: { inspections: this._id } }).exec();
		await Unit.updateMany({ inspections: this._id }, { $pull: { inspections: this._id } }).exec();
		next();
	} catch (error) {
		next(error as CallbackError);
	}
});
// Pre-delete hook to remove references to this inspectios from any projects and units
inspectionSchema.pre('deleteMany', { document: false, query: true }, async function (next) {
	try {
		const filter = this.getFilter();
		const inspections = filter._id.$in; // Extract the list of inspections
		await Project.updateMany({ inspections: { $in: inspections } }, { $pull: { inspections: { $in: inspections } } }).exec();
		await Unit.updateMany({ inspections: { $in: inspections } }, { $pull: { inspections: { $in: inspections } } }).exec();
	} catch (error) {
		next(error as CallbackError);
	}
});

inspectionSchema.set('toJSON', {
	transform: (doc, ret) => {
		ret.id = ret._id.toString(); // Convert _id to id
		delete ret._id;
		return ret;
	}
});

const Inspection = mongoose.model<IInspection>('Inspection', inspectionSchema);
export default Inspection;
