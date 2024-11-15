import { number } from 'io-ts';
import mongoose, { Document, Schema } from 'mongoose';
import permissions from '../config/permissions';

interface IUser extends Document {
	email: string;
	passwordHash: string;
	firstName: string;
	lastName: string;
	permissions: {
		Engineer: number;
		Manager: number;
		Admin: number;
	};
	authTokens: string[];
}

const userSchema: Schema = new Schema({
	email: { type: String, required: true, unique: true },
	passwordHash: { type: String, required: true },
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	permissions: {
		Engineer: { type: number, default: permissions.ENGINEER },
		Manager: { type: number },
		Admin: { type: number }
	},
	authTokens: { type: [String], required: false }
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
