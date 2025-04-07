import { Request, Response, NextFunction } from 'express';
import database from '../config/db';
import multer, { MulterError } from 'multer';
import { IImage } from '../models/Image';
import User from '../models/User';
import Image from '../models/Image';

interface ImageUploadOptions {
	allowedFileTypes: string[];
}

// NOTE: This middleware can ONLY be used after the authenticate middleware (because it uses req.user)
export function imageUpload({ allowedFileTypes }: ImageUploadOptions) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await User.findOne({ _id: req.user?.id }).exec();
			if (!user) {
				res.status(404).json({ error: 'Upload user not found' });
				return;
			}

			const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
				const allowed = allowedFileTypes.includes(file.mimetype);
				if (!allowed) {
					return cb(new Error('Invalid file type'));
				}
				cb(null, true);
			};

			const multerMiddleware = multer({
				storage: database.getS3StorageOptions(),
				limits: { fileSize: 10 * 1024 * 1024 }, // File size limit (10MB here)
				fileFilter
			});

			return multerMiddleware.array('files', 10)(req, res, async (err: unknown) => {
				if (err) {
					if (err instanceof MulterError) {
						console.log('Multer error:', err);
						res.status(400).json({ error: err.message });
					} else if (err instanceof Error) {
						console.log('Error:', err);
						res.status(400).json({ error: err.message });
					} else {
						res.status(500).json({ error: 'Unknown error occured when processing file' });
					}
					return;
				}
				if (!Array.isArray(req.files)) {
					res.status(400).json({ error: 'No file(s) uploaded' });
					return;
				}
				const { uploadCount, timestamps, captions } = req.body;
				// I have to check this manually (without the types middleware) because their are files attached to upload (form-data)
				// Captions are optional, so I don't check for them
				if (!uploadCount || !timestamps) {
					console.log('Invalid request body:', req.body);
					res.status(400).json({ error: `Invalid request body` });
					return;
				}
				const timestampArray = JSON.parse(timestamps);
				const captionArray = captions ? JSON.parse(captions) : null;
				const uploadedImages = req.files as Express.Multer.File[];
				if (uploadedImages.length !== timestampArray.length || uploadedImages.length !== parseInt(uploadCount)) {
					console.log('Number of timestamps does not match number of uploaded images: ', uploadedImages.length, timestampArray.length, uploadCount);
					res.status(400).json({ error: 'Number of timestamps does not match number of uploaded images' });
					return;
				}
				const images: IImage[] = [];
				for (let i = 0; i < uploadedImages.length; i++) {
					const file = uploadedImages[i] as Express.Multer.File;
					const timestamp = new Date(timestampArray[i]);
					const image = new Image({ name: file.originalname, url: file.key, type: file.mimetype, timestamp, uploader: user }); // uploader: user });
					// Set the caption if it exists
					if (captionArray && captionArray[i]) {
						image.caption = captionArray[i];
					}
					await image.save();
					images.push(image);
				}
				res.locals.images = images;
				next();
			});
		} catch (error) {
			console.error('Error processing images:', error);
			res.status(500).json({ error: 'Error processing images' });
		}
	};
}
