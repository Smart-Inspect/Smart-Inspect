import mongoose from 'mongoose';

class Database {
	async connect() {
		try {
			await mongoose.connect(
				process.env.DATABASE_URL as string,
				{
					useUnifiedTopology: true,
					useNewUrlParser: true
				} as mongoose.ConnectOptions
			);
			console.log('[DB] MongoDB connected');
		} catch (error) {
			console.error('[DB] MongoDB connection error:', error);
		}
	}

	isConnected() {
		return mongoose.connection.readyState === 1;
	}
}

const database: Database = new Database();

export default database;
