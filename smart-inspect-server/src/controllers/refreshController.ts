import type { Request, Response } from 'express';
import User from '../models/User';
import auth, { generateAccessToken } from '../utils/auth';

export async function refreshToken(req: Request, res: Response): Promise<void> {
	const { refreshToken } = req.body;
	// Verify the refresh token
	if (!auth.verifyToken(refreshToken, 'refresh')) {
		res.status(401).json({ error: 'Invalid refresh token' });
		return;
	}
	// Get the payload from the refresh token
	const payload = auth.getPayload(refreshToken, 'refresh') as { id: string };
	// Check if the user exists
	const existingUser = await User.findOne({ _id: payload.id }).exec();
	if (!existingUser) {
		res.status(401).json({ error: 'User not found' });
		return;
	}
	// Check if the refresh token is in the user's refreshTokens
	if (!existingUser.refreshTokens.includes(refreshToken)) {
		res.status(401).json({ error: 'Invalid refresh token' });
		return;
	}
	// Generate a new access token
	const accessToken = generateAccessToken(existingUser._id as string, existingUser.email, existingUser.permissions, existingUser.accountVerified);
	// Send the access token
	res.status(200).json({ accessToken });
}
