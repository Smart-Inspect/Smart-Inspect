import jwt from 'jsonwebtoken';

const jwtAccessSecret = Buffer.from(crypto.getRandomValues(new Uint8Array(64)));
const jwtRefreshSecret = Buffer.from(crypto.getRandomValues(new Uint8Array(64)));

const auth = {
	generateToken: (payload: object, type: 'access' | 'refresh' = 'access') => {
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
	getPayload: (token: string, type: 'access' | 'refresh' = 'access'): unknown => {
		const secret = type === 'refresh' ? jwtRefreshSecret : jwtAccessSecret;
		return jwt.verify(token, secret);
	}
};

export default auth;
