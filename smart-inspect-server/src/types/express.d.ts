import 'express';
import { JwtPayload } from 'jsonwebtoken';

// Extend the Request interface to include a user property
declare global {
	namespace Express {
		interface Request {
			user?: JwtPayload;
		}
	}
}
