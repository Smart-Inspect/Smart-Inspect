import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import database from './config/db';
import usersRoute from './routes/usersRoute';
import refreshRoute from './routes/refreshRoute';

export const BUILD_TYPE = process.env.NODE_ENV === 'production' ? 'production' : 'development';

async function main() {
	dotenv.config({
		path: BUILD_TYPE === 'production' ? '.env.production' : '.env.development'
	});

	const app = express();
	const PORT = process.env.PORT;

	// Middleware
	app.use(express.json());
	app.use(cookieParser());

	// Database Connection
	database.connect();

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

	app.listen(PORT, () => {
		console.log(`Server is running on http://localhost:${PORT}`);
	});
}

main();
