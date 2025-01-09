import mongoose, { CallbackError, Document, Schema } from 'mongoose';
import { IBuilding } from './Building';
import Inspection, { IInspection } from './Inspection';
import Project from './Project';

export interface IUnit extends Document {
	number: string;
	building: IBuilding['_id'];
	inspections: IInspection['_id'][];
	createdAt: Date;
	updatedAt: Date;
}

const unitSchema: Schema<IUnit> = new Schema(
	{
		number: { type: String, required: true },
		building: { type: Schema.Types.ObjectId, ref: 'Building', required: true },
		inspections: [{ type: Schema.Types.ObjectId, ref: 'Inspection', default: [] }]
	},
	{ timestamps: true }
);

// Add a compound unique index for `name` and `address`
unitSchema.index({ number: 1, building: 1 }, { unique: true });

// Pre-delete hook to delete all inspections associated with the unit AND remove references to this unit from any projects
unitSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
	try {
		await Inspection.deleteMany({ unit: this._id }).exec();
		await Project.updateMany({ units: this._id }, { $pull: { units: this._id } }).exec();
		next();
	} catch (error) {
		next(error as CallbackError);
	}
});
// Pre-delete hook to delete all inspections associated with the unity AND remove references to this unit from any projects
unitSchema.pre('deleteMany', { document: false, query: true }, async function (next) {
	try {
		const filter = this.getFilter();
		await Inspection.deleteMany({ unit: { $in: filter._id } }).exec();
		await Project.updateMany({ units: { $in: filter._id } }, { $pull: { units: { $in: filter._id } } }).exec();
		next();
	} catch (error) {
		next(error as CallbackError);
	}
});

unitSchema.set('toJSON', {
	transform: (doc, ret) => {
		ret.id = ret._id.toString(); // Convert _id to id
		delete ret._id;
		return ret;
	}
});

const Unit = mongoose.model<IUnit>('Unit', unitSchema);
export default Unit;
