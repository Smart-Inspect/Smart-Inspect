import { number } from 'io-ts';
import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
	email: string;
	passwordHash: string;
	firstName: string;
	lastName: string;
	permissions: number;
	authToken: string[];
}

const userSchema: Schema = new Schema({
	email: { type: String, required: true, unique: true },
	passwordHash: { type: String, required: true },
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	permissions: { type: number, required: true, default: 0 },
	authToken: { type: [String], required: false }
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
