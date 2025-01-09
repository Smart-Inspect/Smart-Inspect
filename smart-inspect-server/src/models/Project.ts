import mongoose, { CallbackError, Document, Schema } from 'mongoose';
import { IBuilding } from './Building';
import { IUnit } from './Unit';
import { IUser } from './User';
import Image, { IImage } from './Image';
import Inspection, { IInspection } from './Inspection';

export interface IProject extends Document {
	name: string;
	description: string;
	building: IBuilding['_id'];
	layouts: IImage[];
	units: IUnit['_id'][];
	engineers: IUser['_id'][];
	inspections: IInspection['_id'][];
	status: 'started' | 'completed' | 'not-started';
	createdAt: Date;
	updatedAt: Date;
}

const projectSchema: Schema<IProject> = new Schema(
	{
		name: { type: String, required: true },
		description: { type: String, required: true },
		building: { type: Schema.Types.ObjectId, ref: 'Building', required: true },
		layouts: [{ type: Schema.Types.ObjectId, ref: 'Image', default: [] }],
		units: [{ type: Schema.Types.ObjectId, ref: 'Unit', default: [] }],
		engineers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
		inspections: [{ type: Schema.Types.ObjectId, ref: 'Inspection', default: [] }],
		status: { type: String, enum: ['started', 'completed', 'not-started'], default: 'not-started' }
	},
	{ timestamps: true }
);

// Pre-delete hook to delete all inspections associated with the project
projectSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
	try {
		await Inspection.deleteMany({ project: this._id }).exec();
		await Image.deleteMany({ _id: { $in: this.layouts } }).exec(); // Deletes all layouts associated with the project
		next();
	} catch (error) {
		next(error as CallbackError);
	}
});
// Pre-delete hook to delete all inspections associated with the project
projectSchema.pre('deleteMany', { document: false, query: true }, async function (next) {
	try {
		const filter = this.getFilter();
		await Inspection.deleteMany({ project: { $in: filter._id } }).exec();
		await Image.deleteMany({ _id: { $in: filter.layouts } }).exec(); // Deletes all layouts associated with the projects
		next();
	} catch (error) {
		next(error as CallbackError);
	}
});

projectSchema.set('toJSON', {
	transform: (doc, ret) => {
		ret.id = ret._id.toString(); // Convert _id to id
		delete ret._id;
		return ret;
	}
});

const Project = mongoose.model<IProject>('Project', projectSchema);
export default Project;
