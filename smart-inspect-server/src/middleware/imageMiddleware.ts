import { Request, Response, NextFunction } from 'express';
//import database from '../config/db';
import multer, { MulterError } from 'multer';
//import User from '../models/User';
//import Image from '../models/Image';

/*interface ImageUploadOptions {
	allowedFileTypes: string[];
}*/

interface FormDataFormatterOptions {
	name: string;
	maxCount: number;
}

export function formDataFormatter(fields: FormDataFormatterOptions[]) {
	const multerMiddleware = multer({
		storage: multer.memoryStorage(),
		limits: { fileSize: 10 * 1024 * 1024 } // File size limit (10MB here)
	}).fields(fields);

	return (req: Request, res: Response, next: NextFunction) => {
		multerMiddleware(req, res, (err: unknown) => {
			if (err) {
				if (err instanceof MulterError) {
					res.status(400).json({ error: err.message });
				} else if (err instanceof Error) {
					res.status(400).json({ error: err.message });
				} else {
					res.status(500).json({ error: 'Unknown error occured when processing file' });
				}
				return;
			}
			next();
		});
	};
}

// NOTE: This middleware can ONLY be used after the authenticate middleware (because it uses req.user)
// NOTE: This middleware can ONLY be used after the validateBody middleware (because it requires a 'timestamp' field in req.body)
/*export function imageUpload(options: ImageUploadOptions) {
	return (req: Request, res: Response, next: NextFunction): void => {
		const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
			const allowed = options.allowedFileTypes.includes(file.mimetype);
			if (!allowed) {
				return cb(new Error('Invalid file type'));
			}
			cb(null, true);
		};
		const multerMiddleware = multer({
			storage: database.getS3StorageOptions(),
			fileFilter
		});
		multerMiddleware.array('files')(req, res, async (err: unknown) => {
			if (err) {
				if (err instanceof MulterError) {
					res.status(400).json({ error: err.message });
				} else if (err instanceof Error) {
					res.status(400).json({ error: err.message });
				} else {
					res.status(500).json({ error: 'Unknown error occured when processing file' });
				}
			} else if (!req.file) {
				res.status(400).json({ error: 'No file uploaded' });
			} else {
				const { timestamp } = req.body;
				try {
					const user = User.findOne({ _id: req.user?._id });
					if (!user) {
						res.status(404).json({ error: 'Upload user not found' });
						return;
					}
					const image = new Image({ name: req.file.originalname, url: req.file.path, timestamp, user });
					req.body.image = image._id;
					await image.save();
					next();
				} catch (error) {
					console.error('Failed to save image:', error);
					res.status(500).json({ error: 'Error saving image' });
				}
			}
		});
	};
}*/
