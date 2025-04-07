import type { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import crypt from '../utils/crypt';
import auth, { generateAccessToken, generateRefreshToken, generateVerifyToken, generateResetToken } from '../utils/auth';
import emails from '../utils/emails';
import permissions from '../config/permissions';
import cookies from '../utils/cookies';

interface CreateParams {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

interface LoginParams {
	email: string;
	password: string;
}

interface VerifyEmailParams {
	verifyToken: string;
}

interface LogoutParams {
	refreshToken: string;
}

interface ViewParams {
	id: string;
}

interface EditParams {
	id: string;
	email?: string;
	oldPassword?: string;
	newPassword?: string;
	firstName?: string;
	lastName?: string;
	permissionLevel?: 'engineer' | 'manager';
}

interface DeleteParams {
	id: string;
}

interface ForgotPasswordParams {
	email: string;
}

interface ResetPasswordEmailParams {
	resetToken: string;
	newPassword: string;
}

const userService = {
	async create({ email, password, firstName, lastName }: CreateParams, res: Response): Promise<IUser | null> {
		try {
			// Checking if the user already exists
			const existingUser = await User.findOne({ email }).exec();
			if (existingUser) {
				res.status(409).json({ error: 'User already exists' });
				return null;
			}
			// Hashing the password
			const passwordHash = await crypt.hashPassword(password);
			// Creating the new user
			const newUser = new User({ email, passwordHash, firstName, lastName });
			await newUser.save();
			return newUser;
		} catch (error) {
			console.error('Failed to create user:', error);
			res.status(500).json({ error: 'Error creating user' });
			return null;
		}
	},
	async login({ email, password }: LoginParams, res: Response): Promise<{ id: string; accessToken: string; refreshToken: string; isAccountVerified: boolean } | null> {
		try {
			// Checking if the user exists
			const existingUser = await User.findOne({ email }).exec();
			if (!existingUser) {
				res.status(401).json({ error: 'Invalid email or password' });
				return null;
			}
			// Checking if the password is correct
			const isPasswordCorrect = await crypt.comparePasswords(password, existingUser.passwordHash);
			if (!isPasswordCorrect) {
				res.status(400).json({ error: 'Invalid email or password' });
				return null;
			}
			// Check if the user has verified their account
			const isAccountVerified = existingUser.accountVerified;
			// Generating the refresh and access tokens
			const refreshToken = generateRefreshToken(existingUser._id as string);
			const accessToken = generateAccessToken(existingUser._id as string, existingUser.email, existingUser.permissions, isAccountVerified);
			// Adding the refresh token in the database
			existingUser.refreshTokens.push(refreshToken);
			// Save the user
			await existingUser.save();
			// Send a secure httponly cookie with the refresh token
			cookies.setRefreshCookie(res, refreshToken);
			// Sending the access and refresh tokens (refresh token has a 1 year expiration)
			return { id: existingUser._id as string, accessToken, refreshToken, isAccountVerified };
		} catch (error) {
			console.error('Failed to login user:', error);
			res.status(500).json({ error: 'Error logging in user' });
			return null;
		}
	},
	async verifySend(req: Request, res: Response): Promise<boolean> {
		const existingUser = await User.findOne({ _id: req.user?.id }).exec();
		try {
			// Check if the user exists
			if (!existingUser) {
				res.status(404).json({ error: 'User not found' });
				return false;
			}
			// Check if the user has already verified their account
			const isAccountVerified = existingUser.accountVerified;
			if (isAccountVerified) {
				res.status(204).json({ message: 'User already verified' });
				return false;
			}

			// Generate a verification token and send it to the user
			const verifyToken = generateVerifyToken(existingUser._id as string);
			existingUser.verifyToken = verifyToken;
			await emails.sendVerification(existingUser.email, verifyToken);
			await existingUser.save();
			return true;
		} catch (error) {
			console.error('Failed to send verification email:', error);
			res.status(500).json({ error: 'Failed to send verification email' });
			return false;
		}
	},
	async verifyEmail({ verifyToken }: VerifyEmailParams, res: Response): Promise<boolean> {
		try {
			// Check if the token is valid
			if (!auth.verifyToken(verifyToken, 'verify')) {
				res.status(401).json({ error: 'Invalid verification token' });
				return false;
			}
			const payload = auth.getPayload(verifyToken, 'verify') as { id: string };
			// Check if the user exists
			const existingUser = await User.findOne({ _id: payload.id }).exec();
			if (!existingUser) {
				res.status(404).json({ error: 'User not found' });
				return false;
			}
			// Check if the verification token is the same as the one in the database
			if (existingUser.verifyToken !== verifyToken) {
				res.status(401).json({ error: 'Invalid verification token' });
				return false;
			}
			// Verify the user's account
			existingUser.accountVerified = true;
			existingUser.verifyToken = '';
			await existingUser.save();
			return true;
		} catch (error) {
			console.error('Failed to verify user:', error);
			res.status(500).json({ error: 'Failed to verify user' });
			return false;
		}
	},
	async verify(req: Request, res: Response): Promise<{ isAccountVerified: boolean; accessToken: string } | null> {
		try {
			// Check if the user exists
			const existingUser = await User.findOne({ _id: req.user?.id }).exec();
			if (!existingUser) {
				res.status(404).json({ error: 'User not found' });
				return null;
			}
			// Check if the user has verified their account
			const isAccountVerified = existingUser.accountVerified;
			let accessToken = ((req.headers.authorization || req.headers.Authorization) as string).split(' ')[1];
			// If the user has verified their account and the token doesn't have the accountVerified flag, generate a new token
			if (isAccountVerified && !req.user?.accountVerified) {
				accessToken = generateAccessToken(existingUser._id as string, existingUser.email, existingUser.permissions, isAccountVerified);
			}
			return { isAccountVerified, accessToken };
		} catch (error) {
			console.error('Failed to verify user:', error);
			res.status(500).json({ error: 'Failed to verify user' });
			return null;
		}
	},
	async logout({ refreshToken }: LogoutParams, req: Request, res: Response): Promise<boolean> {
		try {
			// If the refresh token is not in the body, check the cookies
			if (!refreshToken) {
				refreshToken = req.cookies.refreshToken;
				if (!refreshToken) {
					res.status(401).json({ error: 'No refresh token provided' });
					return false;
				}
			}
			// Check if the user exists
			const existingUser = await User.findOne({ _id: req.user?.id }).exec();
			if (!existingUser) {
				res.status(404).json({ error: 'User not found' });
				return false;
			}
			// Check if the refresh token is in the user's refreshTokens
			// Note: This check isn't really necessary, but it's good to have for better response messages
			if (!existingUser.refreshTokens.includes(refreshToken)) {
				res.status(404).json({ error: 'Invalid refresh token' });
				return false;
			}
			// Remove the refresh token from the database
			existingUser.refreshTokens = existingUser.refreshTokens.filter(rt => rt !== refreshToken);
			await existingUser.save();
			// Clear the refresh token cookie
			cookies.clearRefreshCookie(res);
			return true;
		} catch (error) {
			console.error('Failed to logout user:', error);
			res.status(500).json({ error: 'Failed to logout user' });
			return false;
		}
	},
	async view({ id }: ViewParams, req: Request, res: Response): Promise<IUser | null> {
		try {
			// Check if the user has the required permissions
			if (!req.user?.permissions.includes(permissions.MANAGER) && id !== req.user?.id) {
				res.status(403).json({ error: 'Permission denied' });
				return null;
			}
			// Check if the user exists
			const existingUser = await User.findOne({ _id: id }).exec();
			if (!existingUser) {
				res.status(404).json({ error: 'User not found' });
				return null;
			}
			return existingUser;
		} catch (error) {
			console.error(`Failed to get user ${id}:`, error);
			res.status(500).json({ error: 'Error getting user' });
			return null;
		}
	},
	async edit({ id, email, oldPassword, newPassword, firstName, lastName, permissionLevel }: EditParams, req: Request, res: Response): Promise<IUser | null> {
		try {
			// Check if the user has the required permissions
			if (!req.user?.permissions.includes(permissions.MANAGER) && id !== req.user?.id) {
				res.status(403).json({ error: 'Permission denied' });
				return null;
			}
			// Check if the user if trying to change their own permissions while not being a MANAGER
			if (!req.user?.permissions.includes(permissions.MANAGER) && permissionLevel) {
				res.status(403).json({ error: 'Permission denied' });
				return null;
			}
			// Check if the user exists
			const existingUser = await User.findOne({ _id: id }).exec();
			if (!existingUser) {
				res.status(404).json({ error: 'User not found' });
				return null;
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
					return null;
				}
				// Hash the new password
				const passwordHash = await crypt.hashPassword(newPassword);
				existingUser.passwordHash = passwordHash;
			}
			// Update the permissions if a permissionLevel is provided
			if (permissionLevel) {
				switch (permissionLevel) {
					case 'engineer':
						existingUser.permissions = [permissions.ENGINEER];
						break;
					case 'manager':
						existingUser.permissions = [permissions.ENGINEER, permissions.MANAGER];
						break;
					default:
						res.status(400).json({ error: 'Invalid permission level' });
						return null;
				}
			}
			// Save the user
			await existingUser.save();
			return existingUser;
		} catch (error) {
			console.error(`Failed to update user ${id}:`, error);
			res.status(500).json({ error: 'Error updating user' });
			return null;
		}
	},
	async delete({ id }: DeleteParams, req: Request, res: Response): Promise<boolean> {
		try {
			// Check if the user has the required permissions
			if (!req.user?.permissions.includes(permissions.MANAGER) && id !== req.user?.id) {
				res.status(403).json({ error: 'Permission denied' });
				return false;
			}
			// Check if the user exists
			const existingUser = await User.findOne({ _id: id }).exec();
			if (!existingUser) {
				res.status(404).json({ error: 'User not found' });
				return false;
			}
			// Delete the user
			await existingUser.deleteOne().exec();
			return true;
		} catch (error) {
			console.error(`Failed to delete user ${id}:`, error);
			res.status(500).json({ error: 'Error deleting user' });
			return false;
		}
	},
	async forgotPassword({ email }: ForgotPasswordParams, res: Response): Promise<boolean> {
		try {
			// Check if the user exists
			const existingUser = await User.findOne({ email }).exec();
			if (!existingUser) {
				res.status(404).json({ error: 'User not found' });
				return false;
			}
			// Generate a reset token
			const resetToken = generateResetToken(existingUser._id as string);
			// Send the password reset email
			await emails.sendResetPassword(existingUser.email, resetToken);
			// Save the reset token
			existingUser.resetToken = resetToken;
			await existingUser.save();
			return true;
		} catch (error) {
			console.error('Failed to send password reset email:', error);
			res.status(500).json({ error: 'Failed to send password reset email' });
			return false;
		}
	},
	async resetPasswordEmail({ resetToken, newPassword }: ResetPasswordEmailParams, res: Response): Promise<IUser | null> {
		try {
			// Check if the token is valid
			if (!auth.verifyToken(resetToken, 'reset')) {
				res.status(401).json({ error: 'Invalid reset token' });
				return null;
			}
			const payload = auth.getPayload(resetToken, 'reset') as { id: string };
			// Check if the user exists
			const existingUser = await User.findOne({ _id: payload.id }).exec();
			if (!existingUser) {
				res.status(404).json({ error: 'User not found' });
				return null;
			}
			// Check if the reset token is the same as the one in the database
			if (existingUser.resetToken !== resetToken) {
				res.status(401).json({ error: 'Invalid reset token' });
				return null;
			}
			// Hash the new password
			const passwordHash = await crypt.hashPassword(newPassword);
			// Update the password
			existingUser.passwordHash = passwordHash;
			existingUser.resetToken = '';
			// Clear the refresh tokens (this will log the user out of all devices)
			existingUser.refreshTokens = [];
			await existingUser.save();
			return existingUser;
		} catch (error) {
			console.error('Failed to reset password:', error);
			res.status(500).json({ error: 'Failed to reset password' });
			return null;
		}
	}
};

export default userService;
