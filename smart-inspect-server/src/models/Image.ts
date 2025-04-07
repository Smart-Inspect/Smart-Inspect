import mongoose, { Schema, Document, CallbackError } from 'mongoose';
import { IUser } from './User';
import Project from './Project';
import Inspection from './Inspection';

export interface IImage extends Document {
	name: string;
	url: string; // The URL of the uploaded image in the cloud storage
	type: string;
	uploader: IUser['_id'];
	caption: string;
	timestamp: Date;
	uploadedAt: Date;
}

const imageSchema: Schema = new Schema({
	name: { type: String, required: true },
	url: { type: String, required: true }, // The URL of the uploaded image in the cloud storage
	type: { type: String, required: true },
	uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	caption: { type: String, required: false },
	timestamp: { type: Date, required: true },
	uploadedAt: { type: Date, default: Date.now }
});

// Pre-delete hook to delete all inspections associated with the layout OR remove references to this image from any inspections AND remove references to this image from any projects
imageSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
	try {
		// If this image is associated with a project (AKA its a layout), remove it from the project
		// Also, there should only be one project associated with this image, so I call updateOne (versus updateMany)
		await Project.updateOne({ layouts: this._id }, { $pull: { layouts: this._id } }).exec();
		// If this image is a layout for an inspection, remove that inspection (since its layout is being deleted)
		const inspections = await Inspection.find({ layout: this._id });
		await Inspection.deleteMany({ _id: { $in: inspections } }).exec();
		// Else if this image is just a picture from that inspection, simply remove it from the inspection
		// Also, once again there should only be one inspection associated with this image, so I call updateOne (versus updateMany)
		await Inspection.updateOne({ images: this._id }, { $pull: { images: this._id } }).exec();
		next();
	} catch (error) {
		next(error as CallbackError);
	}
});

imageSchema.set('toJSON', {
	transform: (doc, ret) => {
		ret.id = ret._id.toString(); // Convert _id to id
		delete ret._id;
		return ret;
	}
});

const Image = mongoose.model<IImage>('Image', imageSchema);
export default Image;
