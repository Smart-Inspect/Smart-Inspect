import type { Request, Response } from 'express';
import User from '../models/User';
import crypt from '../utils/crypt';
import auth, { generateAccessToken, generateRefreshToken, generateVerifyToken, generateResetToken } from '../utils/auth';
import emails from '../utils/emails';
import permissions from '../config/permissions';

export async function createUser(req: Request, res: Response): Promise<void> {
	const { email, password, firstName, lastName } = req.body;
	// Checking if the user already exists
	const existingUser = await User.findOne({ email });
	if (existingUser) {
		res.status(409).json({ error: 'User already exists' });
		return;
	}
	// Hashing the password
	const passwordHash = await crypt.hashPassword(password);
	// Creating the new user
	const newUser = new User({ email, passwordHash, firstName, lastName });
	await newUser.save();
	res.status(201).json({ message: 'New user created' });
}

export async function loginUser(req: Request, res: Response): Promise<void> {
	const { email, password } = req.body;
	// Checking if the user exists
	const existingUser = await User.findOne({ email });
	if (!existingUser) {
		res.status(401).json({ error: 'Invalid email or password' });
		return;
	}
	// Checking if the password is correct
	const isPasswordCorrect = await crypt.comparePasswords(password, existingUser.passwordHash);
	if (!isPasswordCorrect) {
		res.status(400).json({ error: 'Invalid email or password' });
		return;
	}
	// Check if the user has verified their account
	const isAccountVerified = existingUser.accountVerified;
	// Generating the refresh and access tokens
	const refreshToken = generateRefreshToken(existingUser._id as string);
	const accessToken = generateAccessToken(existingUser._id as string, existingUser.email, existingUser.permissions, isAccountVerified);
	// Adding the refresh token in the database
	existingUser.refreshTokens.push(refreshToken);
	// Ensure the array only has MAX_REFRESH_TOKENS elements
	// This is to prevent the array from growing indefinitely (if the user keeps logging in without logging out)
	if (existingUser.refreshTokens.length > parseInt(process.env.MAX_REFRESH_TOKENS as string)) {
		existingUser.refreshTokens.shift();
	}
	// Save the user
	await existingUser.save();
	// Sending the access and refresh tokens (refresh token has a 1 year expiration)
	res.status(200).json({ id: existingUser._id, accessToken, refreshToken, isAccountVerified });
}

export async function verifyUserSend(req: Request, res: Response): Promise<void> {
	const existingUser = await User.findOne({ _id: req.user?.id }).exec();
	// Check if the user exists
	if (!existingUser) {
		res.status(404).json({ error: 'User not found' });
		return;
	}
	// Check if the user has already verified their account
	const isAccountVerified = existingUser.accountVerified;
	if (isAccountVerified) {
		res.status(204).json({ message: 'User already verified' });
		return;
	}

	// Generate a verification token and send it to the user
	const verifyToken = generateVerifyToken(existingUser._id as string);
	existingUser.verifyToken = verifyToken;
	await emails.sendVerification(existingUser.email, verifyToken);
	await existingUser.save();
	res.status(204).json({ message: 'Verification email sent' });
}

// This function will be accessed by the user through a link in the verification email
export async function verifyUserEmail(req: Request, res: Response): Promise<void> {
	const { verifyToken } = req.body;
	// Check if the token is valid
	if (!auth.verifyToken(verifyToken, 'verify')) {
		res.status(401).json({ error: 'Invalid verification token' });
		return;
	}
	const payload = auth.getPayload(verifyToken, 'verify') as { id: string };
	// Check if the user exists
	const existingUser = await User.findOne({ _id: payload.id }).exec();
	if (!existingUser) {
		res.status(404).json({ error: 'User not found' });
		return;
	}
	// Check if the verification token is the same as the one in the database
	if (existingUser.verifyToken !== verifyToken) {
		res.status(401).json({ error: 'Invalid verification token' });
		return;
	}
	// Verify the user's account
	existingUser.accountVerified = true;
	existingUser.verifyToken = '';
	await existingUser.save();
	console.log('User verified:', existingUser.email);
	res.status(204).json({ message: 'User verified' });
}

export async function verifyUser(req: Request, res: Response): Promise<void> {
	// Check if the user exists
	const existingUser = await User.findOne({ _id: req.user?.id }).exec();
	if (!existingUser) {
		res.status(404).json({ error: 'User not found' });
		return;
	}
	// Check if the user has verified their account
	const isAccountVerified = existingUser.accountVerified;
	let accessToken = ((req.headers.authorization || req.headers.Authorization) as string).split(' ')[1];
	// If the user has verified their account and the token doesn't have the accountVerified flag, generate a new token
	if (isAccountVerified && !req.user?.accountVerified) {
		accessToken = generateAccessToken(existingUser._id as string, existingUser.email, existingUser.permissions, isAccountVerified);
	}
	res.status(200).json({ isAccountVerified, accessToken });
}

export async function logoutUser(req: Request, res: Response): Promise<void> {
	const { refreshToken } = req.body;
	// Check if the user exists
	const existingUser = await User.findOne({ _id: req.user?.id }).exec();
	if (!existingUser) {
		res.status(404).json({ error: 'User not found' });
		return;
	}
	// Check if the refresh token is in the user's refreshTokens
	// Note: This check isn't really necessary, but it's good to have for better response messages
	if (!existingUser.refreshTokens.includes(refreshToken)) {
		res.status(404).json({ error: 'Invalid refresh token' });
		return;
	}
	// Remove the refresh token from the database
	existingUser.refreshTokens = existingUser.refreshTokens.filter(rt => rt !== refreshToken);
	await existingUser.save();
	res.status(204).json({ message: 'User logged out' });
}

export async function viewUser(req: Request, res: Response) {
	const { id } = req.params;
	// Check if the user has the required permissions
	if (id !== req.user?.id && !req.user?.permissions.includes(permissions.MANAGER)) {
		res.status(403).json({ error: 'Permission denied' });
		return;
	}
	// Check if the user exists
	const existingUser = await User.findOne({ _id: id }).exec();
	if (!existingUser) {
		res.status(404).json({ error: 'User not found' });
		return;
	}
	res.status(200).json({
		email: existingUser.email,
		firstName: existingUser.firstName,
		lastName: existingUser.lastName,
		permissions: existingUser.permissions,
		creationDate: existingUser.creationDate.getTime().toString()
	});
}

export async function editUser(req: Request, res: Response) {
	const { id } = req.params;
	const { email, oldPassword, newPassword, firstName, lastName } = req.body;
	// Check if the user has the required permissions
	if (id !== req.user?.id && !req.user?.permissions.includes(permissions.MANAGER)) {
		res.status(403).json({ error: 'Permission denied' });
		return;
	}
	// Check if the user exists
	const existingUser = await User.findOne({ _id: id }).exec();
	if (!existingUser) {
		res.status(404).json({ error: 'User not found' });
		return;
	}
	// Update the user
	if (email) existingUser.email = email;
	if (firstName) existingUser.firstName = firstName;
	if (lastName) existingUser.lastName = lastName;
	// Update the password if the old password and new password are provided
	if (oldPassword && newPassword) {
		// Check if the old password is correct
		const isPasswordCorrect = await crypt.comparePasswords(oldPassword, existingUser.passwordHash);
		if (!isPasswordCorrect) {
			res.status(400).json({ error: 'Invalid password' });
			return;
		}
		// Hash the new password
		const passwordHash = await crypt.hashPassword(newPassword);
		existingUser.passwordHash = passwordHash;
	}
	// Save the user
	await existingUser.save();
	res.status(204).json({ message: 'User updated' });
}

export async function deleteUser(req: Request, res: Response) {
	const { id } = req.params;
	// Check if the user has the required permissions
	if (id !== req.user?.id && !req.user?.permissions.includes(permissions.MANAGER)) {
		res.status(403).json({ error: 'Permission denied' });
		return;
	}
	// Delete the user
	const result = await User.deleteOne({ _id: id }).exec();
	// Check if the user was deleted
	if (result.deletedCount === 0) {
		res.status(204).json({ error: 'User not found' });
		return;
	}
	res.status(204).json({ message: 'User deleted' });
}

export async function resetPassword(req: Request, res: Response) {
	// Check if the user exists
	const existingUser = await User.findOne({ _id: req.user?.id });
	if (!existingUser) {
		res.status(404).json({ error: 'User not found' });
		return;
	}
	// Generate a reset token
	const resetToken = generateResetToken(existingUser._id as string);
	// Send the password reset email
	await emails.sendResetPassword(existingUser.email, resetToken);
	// Save the reset token
	existingUser.resetToken = resetToken;
	await existingUser.save();
	res.status(204).json({ message: 'Password reset email sent' });
}

// This function will be accessed by the user through a link in the password reset email
export async function resetPasswordEmail(req: Request, res: Response) {
	const { resetToken, newPassword } = req.body;
	// Check if the token is valid
	if (!auth.verifyToken(resetToken, 'reset')) {
		res.status(401).json({ error: 'Invalid reset token' });
		return;
	}
	const payload = auth.getPayload(resetToken, 'reset') as { id: string };
	// Check if the user exists
	const existingUser = await User.findOne({ _id: payload.id }).exec();
	if (!existingUser) {
		res.status(404).json({ error: 'User not found' });
		return;
	}
	// Check if the reset token is the same as the one in the database
	if (existingUser.resetToken !== resetToken) {
		res.status(401).json({ error: 'Invalid reset token' });
		return;
	}
	// Hash the new password
	const passwordHash = await crypt.hashPassword(newPassword);
	// Update the password
	existingUser.passwordHash = passwordHash;
	existingUser.resetToken = '';
	// Clear the refresh tokens (this will log the user out of all devices)
	existingUser.refreshTokens = [];
	await existingUser.save();
	res.status(204).json({ message: 'Password reset' });
}

// This function is only accessible to users with the MANAGER permission
export async function viewAllUsers(req: Request, res: Response) {
	// Get all users and return only the email, firstName, lastName, and permissions
	const users = await User.find().select('email firstName lastName permissions').exec();
	res.status(200).json(users);
}
