import { Request, Response, NextFunction } from 'express';
import types from '../utils/types';
import * as t from 'io-ts';

export function validateBody<A>(passedType: t.Type<A>) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!types.validateType(req.body, passedType)) {
			res.status(400).json({ error: 'Invalid request body' });
			return;
		}
		next();
	};
}
