import mongoose, { Document, Schema } from 'mongoose';
import permissions from '../config/permissions';

interface IUser extends Document {
	email: string;
	passwordHash: string;
	firstName: string;
	lastName: string;
	creationDate: Date;
	permissions: number[];
	refreshTokens: string[];
	resetToken: string;
	verifyToken: string;
	accountVerified: boolean;
}

const userSchema: Schema = new Schema({
	email: { type: String, required: true, unique: true },
	passwordHash: { type: String, required: true },
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	creationDate: { type: Date, default: Date.now },
	permissions: { type: [Number], default: [permissions.ENGINEER] },
	refreshTokens: { type: [String], required: false },
	resetToken: { type: String, required: false },
	verifyToken: { type: String, required: false },
	accountVerified: { type: Boolean, default: false }
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
