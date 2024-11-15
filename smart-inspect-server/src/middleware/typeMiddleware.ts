import { Request, Response, NextFunction } from 'express';
import type from '../utils/types';
import * as t from 'io-ts';

export function validateType<A>(passedType: t.Type<A>) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!type.validateType(req.body, passedType)) {
			res.status(400).json({ message: 'Invalid request body' });
			return;
		}
		next();
	};
}
