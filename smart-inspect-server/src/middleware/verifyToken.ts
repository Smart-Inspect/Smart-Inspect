import auth from '../utils/auth';

import { Request, Response, NextFunction } from 'express';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
	const authHeader = req.headers['authorization'];
	if (!authHeader) {
		res.status(401).json({ message: 'No token provided' });
		return;
	}

	const token = authHeader.split(' ')[1];
	const isTokenValid = auth.verifyToken(token, 'access');
	if (!isTokenValid) {
		res.status(401).json({ message: 'Invalid token' });
		return;
	}

	const payload = auth.getPayload(token, 'access');
	req.body.token = payload;
	next();
}

export function authenticateManager(req: Request, res: Response, next: NextFunction): void {
	authenticate(req, res, () => {
		const payload = req.body.token;
		if (payload.permissions < 1) {
			res.status(403).json({ message: 'Permission denied' });
			return;
		}
		next();
	});
}

export function authenticateAdmin(req: Request, res: Response, next: NextFunction): void {
	authenticate(req, res, () => {
		const payload = req.body.token;
		if (payload.permissions < 2) {
			res.status(403).json({ message: 'Permission denied' });
			return;
		}
		next();
	});
}
