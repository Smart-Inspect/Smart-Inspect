import mongoose from 'mongoose';
import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';

class Database {
	private s3Client: S3Client | undefined;
	private s3StorageOptions: multer.StorageEngine | undefined;

	async connect() {
		try {
			await mongoose.connect(
				process.env.DATABASE_URL as string /*,
				{
					useUnifiedTopology: true,
					useNewUrlParser: true
				} as mongoose.ConnectOptions*/
			);
			console.log('[DB] MongoDB connected');
		} catch (error) {
			console.error('[DB] MongoDB connection error:', error);
		}
	}

	async connectS3() {
		try {
			this.s3Client = new S3Client({
				region: process.env.DO_REGION as string,
				endpoint: process.env.DO_ENDPOINT as string,
				credentials: {
					accessKeyId: process.env.DO_ACCESS_KEY_ID as string,
					secretAccessKey: process.env.DO_SECRET_ACCESS_KEY as string
				}
			});
			console.log('[DB] S3 client initialized');
		} catch (error) {
			console.error('[DB] S3 client initialization error:', error);
		}
		try {
			this.s3StorageOptions = multerS3({
				s3: this.s3Client as S3Client,
				bucket: process.env.DO_BUCKET as string,
				contentType: multerS3.AUTO_CONTENT_TYPE,
				acl: 'private',
				metadata: function (req, file, cb) {
					cb(null, {
						uploaderID: req.user?.id || 'unknown',
						uploadedAt: new Date().toISOString()
					});
				},
				key: (req, file, cb) => {
					const filePath = `uploads/${Date.now()}-${file.originalname}`;
					cb(null, filePath);
				}
			});
			console.log('[DB] Multer-S3 storage options initialized');
		} catch (error) {
			console.error('[DB] Multer-S3 storage options initialization error:', error);
		}
	}

	getS3Client() {
		if (this.s3Client === undefined) {
			throw new Error('[DB] S3 client not initialized');
		}
		return this.s3Client;
	}

	getS3StorageOptions() {
		if (this.s3StorageOptions === undefined) {
			throw new Error('[DB] Multer-S3 storage options not initialized');
		}
		return this.s3StorageOptions;
	}

	isConnected() {
		return mongoose.connection.readyState === 1;
	}

	isS3Connected() {
		return this.s3Client !== undefined && this.s3StorageOptions !== undefined;
	}
}

const database: Database = new Database();

export default database;
