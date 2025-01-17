import mongoose, { CallbackError, Document, Schema } from 'mongoose';
import Project from './Project';
import Unit, { IUnit } from './Unit';

interface IAddress {
	address: string;
	changedAt: Date;
}

export interface IBuilding extends Document {
	name: string;
	address: string;
	addresses: IAddress[];
	units: IUnit['_id'][];
	createdAt: Date;
	updatedAt: Date;
}

const buildingSchema: Schema = new Schema(
	{
		name: { type: String, required: true },
		address: { type: String, required: true },
		addresses: {
			type: [
				{
					address: { type: String, required: true },
					changedAt: { type: Date, default: Date.now }
				}
			],
			required: false
		},
		units: [{ type: Schema.Types.ObjectId, ref: 'Unit', default: [] }]
	},
	{ timestamps: true }
);

// Add a compound unique index for `name` and `address`
buildingSchema.index({ name: 1, address: 1 }, { unique: true });

// Pre-save hook to push the current address to the 'addresses' array if it's changing
buildingSchema.pre<IBuilding>('save', function (next) {
	if (this.isModified('address')) {
		this.addresses.unshift({
			address: this.address,
			changedAt: new Date()
		});
	}
	next();
});

// Pre-delete hook to delete all projects and units associated with the building
buildingSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
	try {
		const projects = await Project.find({ building: this._id });
		await Project.deleteMany({ _id: { $in: projects } });
		const units = await Unit.find({ building: this._id });
		await Unit.deleteMany({ _id: { $in: units } });
		next();
	} catch (error) {
		next(error as CallbackError);
	}
});

buildingSchema.set('toJSON', {
	transform: (doc, ret) => {
		ret.id = ret._id.toString(); // Convert _id to id
		delete ret._id;
		return ret;
	}
});

const Building = mongoose.model<IBuilding>('Building', buildingSchema);
export default Building;
