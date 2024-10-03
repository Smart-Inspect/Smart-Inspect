import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class Database {
	async connect() {
		try {
			await mongoose.connect(process.env.DATABASE_URL as string);
			console.log('MongoDB connected');
		} catch (error) {
			console.error('MongoDB connection error:', error);
		}
	}

	isConnected() {
		return mongoose.connection.readyState === 1;
	}
}

const database: Database = new Database();

export default database;
