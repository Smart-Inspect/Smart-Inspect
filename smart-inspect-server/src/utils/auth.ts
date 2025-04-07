import jwt from 'jsonwebtoken';

const jwtAccessSecret = process.env.ACCESS_TOKEN_SECRET as string;
const jwtRefreshSecret = process.env.REFRESH_TOKEN_SECRET as string;
const jwtVerifySecret = process.env.VERIFY_TOKEN_SECRET as string;
const jwtResetSecret = process.env.RESET_TOKEN_SECRET as string;

const auth = {
	generateToken: (payload: object, type: 'access' | 'refresh' | 'verify' | 'reset', expiresIn: string): string => {
		const secret = getSecret(type);
		return jwt.sign(payload, secret, { expiresIn });
	},
	verifyToken: (token: string, type: 'access' | 'refresh' | 'verify' | 'reset'): boolean => {
		try {
			const secret = getSecret(type);
			jwt.verify(token, secret);
			return true;
		} catch {
			return false;
		}
	},
	getPayload: (token: string, type: 'access' | 'refresh' | 'verify' | 'reset'): jwt.JwtPayload | string => {
		const secret = getSecret(type);
		return jwt.verify(token, secret);
	}
};

export function generateRefreshToken(id: string): string {
	return auth.generateToken(
		{
			id
		},
		'refresh',
		'1yr'
	);
}

export function generateAccessToken(id: string, email: string, permissions: number[], accountVerified: boolean): string {
	return auth.generateToken(
		{
			id,
			email,
			permissions, // This may need to be changed
			accountVerified
		},
		'access',
		'1hr'
	);
}

export function generateVerifyToken(id: string): string {
	return auth.generateToken(
		{
			id
		},
		'verify',
		'5m'
	);
}

export function generateResetToken(id: string): string {
	return auth.generateToken(
		{
			id
		},
		'reset',
		'15m'
	);
}

function getSecret(type: 'access' | 'refresh' | 'verify' | 'reset'): string {
	switch (type) {
		case 'access':
			return jwtAccessSecret;
		case 'refresh':
			return jwtRefreshSecret;
		case 'verify':
			return jwtVerifySecret;
		case 'reset':
			return jwtResetSecret;
	}
}

export default auth;
