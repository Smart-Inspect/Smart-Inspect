import dotenv from 'dotenv';
export const BUILD_TYPE = process.env.NODE_ENV === 'production' ? 'production' : 'development';
dotenv.config({
	path: BUILD_TYPE === 'production' ? '.env.production' : '.env.development'
});

import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import database from './config/db';
import mail from './config/mail';
import usersRoute from './routes/usersRoute';
import refreshRoute from './routes/refreshRoute';

async function main() {
	const app = express();
	const PORT = parseInt(process.env.PORT as string) || 3000;

	// Middleware
	app.use(express.json());
	app.use(cookieParser());
	// Set up CORS for development
	if (BUILD_TYPE === 'development') {
		console.log('[APP] Setting up CORS for development');
		app.use(
			cors({
				origin: process.env.WEB_URL,
				methods: ['GET', 'POST', 'PUT', 'DELETE'],
				allowedHeaders: ['Content Type', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Methods'],
				credentials: false
			})
		);
	}

	// Database Connection
	await database.connect();
	// Email Setup
	await mail.setup();

	// Test Routes
	app.get('/', (req: Request, res: Response) => {
		res.send('Hello World');
	});
	app.get('/api', (req: Request, res: Response) => {
		res.json({ status: 'Connected to API' });
	});
	app.get('/mongo', (req: Request, res: Response) => {
		res.send(`MongoDB connected: ${database.isConnected()}`);
	});

	// Routes
	app.use('/api/refresh', refreshRoute);
	app.use('/api/users', usersRoute);

	app.listen(PORT, '0.0.0.0', () => {
		console.log(`[APP] Server is running on http://localhost:${PORT}`);
	});
}

main();
