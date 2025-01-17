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
import authRoute from './routes/authRoute';
import usersRoute from './routes/usersRoute';
import projectsRoute from './routes/projectsRoute';
import buildingsRoute from './routes/buildingsRoute';
import inspectionsRoute from './routes/inspectionsRoute';

async function main() {
	const app = express();
	const PORT = parseInt(process.env.PORT as string) || 3000;

	// Middleware
	app.use(express.json());
	app.use(cookieParser());
	// Set up CORS for development
	if (BUILD_TYPE === 'development') {
		console.log('[APP] Setting up CORS for development');
		const corsOptions = {
			origin: process.env.WEB_URL,
			methods: ['GET', 'POST', 'PUT', 'DELETE'],
			allowedHeaders: ['Content-Type'],
			credentials: false
		};

		app.use(cors(corsOptions));
		app.options('*', cors(corsOptions));
	}

	// Database Connection
	await database.connect();
	await database.connectS3();
	// Email Setup
	//await mail.setup();

	// Test Routes
	app.get('/api', (req: Request, res: Response) => {
		res.status(200).json({ message: 'Connected to API' });
	});
	app.get('/mongo', (req: Request, res: Response) => {
		res.send(`MongoDB connected: ${database.isConnected()}`);
	});
	app.get('/s3', (req: Request, res: Response) => {
		res.send(`S3 connected: ${database.isS3Connected()}`);
	});

	// Routes
	app.use('/api/auth', authRoute);
	app.use('/api/users', usersRoute);
	app.use('/api/buildings', buildingsRoute);
	app.use('/api/projects', projectsRoute);
	app.use('/api/inspections', inspectionsRoute);

	app.listen(PORT, '0.0.0.0', () => {
		console.log(`[APP] Server is running on http://localhost:${PORT}`);
	});
}

main();
