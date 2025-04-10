import { JwtPayload } from 'jsonwebtoken';
import auth from '../utils/auth';

import { Request, Response, NextFunction } from 'express';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
	// Check if the authorization header is present and has the correct format
	const authHeader = (req.headers.authorization || req.headers.Authorization) as string;
	if (!authHeader?.startsWith('Bearer ')) {
		res.status(401).json({ error: 'No token provided' });
		return;
	}
	// Check if the token is valid
	const token = authHeader.split(' ')[1];
	const isTokenValid = auth.verifyToken(token, 'access');
	if (!isTokenValid) {
		res.status(401).json({ error: 'Invalid token' });
		return;
	}
	// Get the payload from the token
	const payload = auth.getPayload(token, 'access');
	req.user = payload as JwtPayload;
	next();
}

// NOTE: This middleware can ONLY be used after the authenticate middleware (because it uses req.user)
export function isVerified(req: Request, res: Response, next: NextFunction): void {
	// Check if the user is verified
	if (!req.user?.accountVerified) {
		res.status(403).json({ error: 'Account not verified' });
		return;
	}
	next();
}

// NOTE: This middleware can ONLY be used after the authenticate middleware (because it uses req.user)
export function authorize(...permissions: number[]) {
	return (req: Request, res: Response, next: NextFunction): void => {
		// Check if the permissions are present in the payload
		if (!req.user?.permissions) {
			res.status(403).json({ error: 'Permission denied' });
			return;
		}
		// Check if the user has the required permissions
		const permsArray = [...permissions];
		const result = req.user.permissions.map((perm: number) => permsArray.includes(perm));
		if (!result.includes(true)) {
			res.status(403).json({ error: 'Permission denied' });
			return;
		}
		next();
	};
}
