import type { Request, Response } from 'express';
import User from '../models/User';
import auth from '../utils/auth';
import { BUILD_TYPE } from '../app';

export async function refreshToken(req: Request, res: Response): Promise<void> {
	const cookies = req.cookies;
	// Check if the refresh token is provided
	if (!cookies?.refreshToken) {
		res.status(401).json({ message: 'No refresh token provided' });
		return;
	}
	// Get the refresh token from the cookies
	const refreshToken = cookies.refreshToken;
	// Verify the refresh token
	if (!auth.verifyToken(refreshToken, 'refresh')) {
		res.clearCookie('refreshToken', { httpOnly: true, secure: BUILD_TYPE === 'production', sameSite: 'none' });
		res.status(401).json({ message: 'Invalid refresh token' });
		return;
	}
	// Get the payload from the refresh token
	const payload = auth.getPayload(refreshToken, 'refresh') as { id: string; email: string };
	// Check if the user exists
	const existingUser = await User.findOne({ _id: payload.id }).exec();
	if (!existingUser) {
		res.status(401).json({ message: 'User not found' });
		return;
	}
	// Check if the refresh token is in the user's authTokens
	if (!existingUser.authTokens.includes(refreshToken)) {
		res.status(401).json({ message: 'Invalid refresh token' });
		return;
	}
	// Generate a new access token
	const accessToken = auth.generateToken(
		{
			id: existingUser._id,
			email: existingUser.email,
			permissions: existingUser.permissions // This may need to be changed
		},
		'access'
	);
	// Send the access token
	res.status(200).json({ accessToken });
}
