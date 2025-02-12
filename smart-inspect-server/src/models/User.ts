import mongoose, { Document, Schema } from 'mongoose';
import permissions from '../config/permissions';
//import { IInspection } from './Inspection';

export interface IUser extends Document {
	email: string;
	passwordHash: string;
	firstName: string;
	lastName: string;
	permissions: number[];
	//assignedInspections: IInspection['_id'][];
	refreshTokens: string[];
	resetToken: string;
	verifyToken: string;
	accountVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema: Schema = new Schema(
	{
		email: { type: String, required: true, unique: true },
		passwordHash: { type: String, required: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		permissions: { type: [Number], default: [permissions.ENGINEER] },
		//assignedInspections: { type: [Schema.Types.ObjectId], ref: 'Inspection', default: [] },
		refreshTokens: { type: [String], required: false },
		resetToken: { type: String, required: false },
		verifyToken: { type: String, required: false },
		accountVerified: { type: Boolean, default: false }
	},
	{ timestamps: true }
);

// Pre-save hook to ensure the refreshTokens array only has MAX_REFRESH_TOKENS elements
// This is to prevent the array from growing indefinitely (if the user keeps logging in without logging out)
// Also, if the user is not an engineer, they cannot have assigned inspections
userSchema.pre<IUser>('save', function (next) {
	if (this.isModified('refreshTokens')) {
		if (this.refreshTokens.length > Number(process.env.MAX_REFRESH_TOKENS)) {
			this.refreshTokens.shift();
		}
	}
	/*if (this.isModified('assignedInspections') && !this.permissions.includes(permissions.ENGINEER)) {
		this.assignedInspections = [];
		return next(new Error('User is not an engineer, cannot have assigned inspections'));
	}*/
	next();
});

userSchema.set('toJSON', {
	transform: (doc, ret) => {
		ret.id = ret._id.toString(); // Convert _id to id
		delete ret._id;
		// Fix permissions to be strings
		const strPerms = ret.permissions.map((numPerm: number) => permissions.getStringPermission(numPerm));
		ret.permissionLevel = strPerms[strPerms.length - 1];
		delete ret.permissions;
		return ret;
	}
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
