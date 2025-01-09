import type { Request, Response } from 'express';
import User from '../models/User';
import permissions from '../config/permissions';
import userService from '../business/usersService';

export async function createUser(req: Request, res: Response): Promise<void> {
	const { email, password, firstName, lastName } = req.body;
	const user = await userService.create({ email, password, firstName, lastName }, res);
	if (!user) {
		return;
	}
	res.status(201).json({ message: 'New user created', id: user._id });
}

export async function loginUser(req: Request, res: Response): Promise<void> {
	const { email, password } = req.body;
	const result = await userService.login({ email, password }, res);
	if (!result) {
		return;
	}
	res.status(200).json({ id: result.id, accessToken: result.accessToken, refreshToken: result.refreshToken, isAccountVerified: result.isAccountVerified });
}

export async function verifyUserSend(req: Request, res: Response): Promise<void> {
	const result = await userService.verifySend(req, res);
	if (!result) {
		return;
	}
	res.status(200).json({ message: 'Verification email sent' });
}

// This function will be accessed by the user through a link in the verification email
export async function verifyUserEmail(req: Request, res: Response): Promise<void> {
	const { verifyToken } = req.body;
	const result = await userService.verifyEmail({ verifyToken }, res);
	if (!result) {
		return;
	}
	res.status(200).json({ message: 'User verified' });
}

export async function verifyUser(req: Request, res: Response): Promise<void> {
	const result = await userService.verify(req, res);
	if (!result) {
		return;
	}
	res.status(200).json({ isAccountVerified: result.isAccountVerified, accessToken: result.accessToken });
}

export async function logoutUser(req: Request, res: Response): Promise<void> {
	const { refreshToken } = req.body;
	const result = await userService.logout({ refreshToken }, req, res);
	if (!result) {
		return;
	}
	res.status(200).json({ message: 'User logged out' });
}

export async function viewUser(req: Request, res: Response) {
	const { id } = req.params;
	const user = await userService.view({ id }, req, res);
	if (!user) {
		return;
	}
	// Fix permissions to be strings
	const strPerms = user.permissions.map(numPerm => permissions.getStringPermission(numPerm));
	const permissionLevel = strPerms[strPerms.length - 1];
	res.status(200).json({
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName,
		permissionLevel,
		createdAt: user.createdAt.getTime().toString(),
		updatedAt: user.updatedAt.getTime().toString()
	});
}

export async function editUser(req: Request, res: Response) {
	const { id } = req.params;
	const { email, oldPassword, newPassword, firstName, lastName, permissionLevel } = req.body;
	const result = await userService.edit({ id, email, oldPassword, newPassword, firstName, lastName, permissionLevel }, req, res);
	if (!result) {
		return;
	}
	res.status(200).json({ message: 'User updated' });
}

export async function deleteUser(req: Request, res: Response) {
	const { id } = req.params;
	const result = await userService.delete({ id }, req, res);
	if (!result) {
		return;
	}
	res.status(200).json({ message: 'User deleted' });
}

export async function forgotPassword(req: Request, res: Response) {
	const { email } = req.body;
	const result = await userService.forgotPassword({ email }, res);
	if (!result) {
		return;
	}
	res.status(200).json({ message: 'Password reset email sent' });
}

// This function will be accessed by the user through a link in the password reset email
export async function resetPasswordEmail(req: Request, res: Response) {
	const { resetToken, newPassword } = req.body;
	const result = await userService.resetPasswordEmail({ resetToken, newPassword }, res);
	if (!result) {
		return;
	}
	res.status(200).json({ message: 'Password reset' });
}

export async function viewAllUsers(req: Request, res: Response) {
	try {
		// Get all users and return only their id, firstName, and lastName
		const users = await User.find({}, 'email firstName lastName permissions createdAt updatedAt').exec();
		res.status(200).json(users);
	} catch (error) {
		console.error('Failed to get all users:', error);
		res.status(500).json({ error: 'Failed to get all users' });
	}
}
