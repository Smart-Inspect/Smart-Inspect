import type { Request, Response } from 'express';
import User from '../models/User';

export async function createUser(req: Request, res: Response) {
	try {
		const { email, password, firstName, lastName } = req.body;
		// TODO: Perform password hashing
		const passwordHash = password; // THIS IS TEMPORARY
		const newUser = new User({ email, passwordHash, firstName, lastName });
		await newUser.save();
		res.status(201).json({ message: 'New user created' });
	} catch (error) {
		res.status(400).json({ message: 'Error creating user', error });
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function deleteUser(req: Request, res: Response) {
	// TODO: Implement this function
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function updateUser(req: Request, res: Response) {
	// TODO: Implement this function
}

export const getUsers = async (req: Request, res: Response) => {
	try {
		const users = await User.find();
		res.status(200).json(users);
	} catch (error) {
		res.status(400).json({ message: 'Error fetching users', error });
	}
};
