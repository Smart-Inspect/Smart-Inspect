import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
	email: string;
	passwordHash: string;
	firstName: string;
	lastName: string;
}

const userSchema: Schema = new Schema({
	email: { type: String, required: true, unique: true },
	passwordHash: { type: String, required: true, unique: true },
	firstName: { type: String, required: true, unique: true },
	lastName: { type: String, required: true, unique: true }
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
