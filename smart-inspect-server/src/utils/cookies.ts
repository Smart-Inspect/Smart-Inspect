import type { Response } from 'express';

const cookies = {
	// TODO: MAKE SURE THIS COOKIE WORKS
	setRefreshCookie: (res: Response, refreshToken: string) => {
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds
		});
	},
	clearRefreshCookie: (res: Response) => {
		res.clearCookie('refreshToken');
	}
};

export default cookies;
