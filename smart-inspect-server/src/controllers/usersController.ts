import type { Request, Response } from 'express';
import User from '../models/User';
import userType from '../types/usersTypes';
import crypt from '../utils/crypt';
import auth from '../utils/auth';

export async function createUser(req: Request, res: Response): Promise<void> {
	const validationResult = userType.ForCreate.decode(req.body);
	if (validationResult._tag === 'Left') {
		res.status(400).json({ message: 'Invalid request body' });
		return;
	}

	const { email, password, firstName, lastName } = validationResult.right;

	// Checking if the user already exists
	const existingEmail = await User.findOne({ email });
	if (existingEmail) {
		res.status(409).json({ message: 'User already exists' });
		return;
	}
	// Hashing the password
	const passwordHash = crypt.hashPassword(password);
	// Creating the new user
	const newUser = new User({ email, passwordHash, firstName, lastName });
	await newUser.save();
	res.status(201).json({ message: 'New user created' });
}

export async function loginUser(req: Request, res: Response): Promise<void> {
	const validationResult = userType.ForLogin.decode(req.body);
	if (validationResult._tag === 'Left') {
		res.status(400).json({ message: 'Invalid request body' });
		return;
	}

	const { email, password } = validationResult.right;

	// Checking if the user exists
	const existingUser = await User.findOne({ email });
	if (!existingUser) {
		res.status(401).json({ message: 'Invalid email or password' });
		return;
	}

	// Checking if the password is correct
	const isPasswordCorrect = await crypt.comparePasswords(password, existingUser.passwordHash);
	if (!isPasswordCorrect) {
		res.status(400).json({ message: 'Invalid email or password' });
		return;
	}

	// Generating the refresh and access tokens
	const refreshToken = auth.generateToken(
		{
			email: existingUser.email,
			permissions: existingUser.permissions
		},
		'refresh'
	);
	const accessToken = auth.generateToken(
		{
			email: existingUser.email,
			permissions: existingUser.permissions
		},
		'access'
	);

	// Saving the refresh token in the database
	existingUser.authToken.push(refreshToken);
	await existingUser.save();

	// Sending the access token and setting the refresh token as a cookie with a 1 year expiration
	res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 365 });
	res.status(200).json({ accessToken });
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
