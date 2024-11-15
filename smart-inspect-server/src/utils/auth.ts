import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const jwtAccessSecret = process.env.ACCESS_TOKEN_SECRET as string;
const jwtRefreshSecret = process.env.REFRESH_TOKEN_SECRET as string;

const auth = {
	generateToken: (payload: object, type: 'access' | 'refresh' = 'access'): string => {
		const secret = type === 'refresh' ? jwtRefreshSecret : jwtAccessSecret;
		const expiresIn = type === 'refresh' ? '1yr' : '1h';
		return jwt.sign(payload, secret, { expiresIn });
	},
	verifyToken: (token: string, type: 'access' | 'refresh' = 'access'): boolean => {
		try {
			const secret = type === 'refresh' ? jwtRefreshSecret : jwtAccessSecret;
			jwt.verify(token, secret);
			return true;
		} catch {
			return false;
		}
	},
	getPayload: (token: string, type: 'access' | 'refresh' = 'access'): jwt.JwtPayload | string => {
		const secret = type === 'refresh' ? jwtRefreshSecret : jwtAccessSecret;
		return jwt.verify(token, secret);
	}
};

export default auth;
