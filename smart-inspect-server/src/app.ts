import express, { Request, Response } from 'express';
import database from './config/db';
import users from './routes/usersRoute';
import dotenv from 'dotenv';

async function main() {
	dotenv.config({
		path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
	});

	const app = express();
	const PORT = process.env.PORT;

	// Middleware
	app.use(express.json());
	// TODO: ADD AUTHENTICATION

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
	app.use('/api/users', users);

	app.listen(PORT, () => {
		console.log(`Server is running on http://localhost:${PORT}`);
	});
}

main();
