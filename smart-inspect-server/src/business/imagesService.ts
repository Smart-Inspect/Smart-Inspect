import { Response } from 'express';
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import Image from '../models/Image';
import database from '../config/db';
//import multer, { MulterError } from 'multer';

/*interface UploadParams {
	allowedFileTypes: string[];
	timestamps: string[];
	maxUploadCount: number;
}*/

interface DownloadParams {
	id: string;
}

/*interface DeleteParams {
	id: string;
}*/

interface DeleteManyParams {
	ids: string[];
}

const imageService = {
	/*async uploadMany({ allowedFileTypes, timestamps, maxUploadCount }: UploadParams, req: Request, res: Response): Promise<IImage[] | null> {
		try {
			const user = await User.findOne({ _id: req.user?._id }).exec();
			if (!user) {
				res.status(404).json({ error: 'Upload user not found' });
				return null;
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

			const result = multerMiddleware.array('files', maxUploadCount)(req, res, (err: unknown) => {
				if (err) {
					if (err instanceof MulterError) {
						console.log('Image Upload Multer error:', err);
						res.status(400).json({ error: err.message });
					} else if (err instanceof Error) {
						console.log('Image Upload Error:', err);
						res.status(400).json({ error: err.message });
					} else {
						res.status(500).json({ error: 'Unknown error occured when processing file' });
					}
					return false;
				} else {
					if (!Array.isArray(req.files)) {
						res.status(400).json({ error: 'No file(s) uploaded' });
						return false;
					}
					if ((req.files as Express.Multer.File[]).length !== timestamps.length) {
						res.status(400).json({ error: 'Number of timestamps does not match number of uploaded images' });
						return false;
					}
				}
				return true;
			});

			if (!result) {
				return null;
			}
			const uploadedImages = req.files as Express.Multer.File[];
			const images: IImage[] = [];
			for (let i = 0; i < uploadedImages.length; i++) {
				const timestamp = new Date(timestamps[i]);
				const image = new Image({ name: uploadedImages[i].originalname, url: uploadedImages[i].path, timestamp });
				await image.save();
				images.push(image);
			}
			return images;
		} catch (error) {
			console.error('Error processing images:', error);
			res.status(500).json({ error: 'Error processing images' });
			return null;
		}
	},*/
	async download({ id }: DownloadParams, res: Response): Promise<boolean> {
		try {
			// Find the image in the database by ID
			const image = await Image.findOne({ _id: id }).exec();
			if (!image) {
				res.status(404).json({ error: 'Image not found' });
				return false;
			}
			// Create the command to get the object from the bucket
			const getObjectParams = {
				Bucket: process.env.DO_BUCKET as string,
				Key: image.url
			};
			const command = new GetObjectCommand(getObjectParams);
			const s3Response = await database.getS3Client().send(command); // Send the command to S3 and get the object body
			// Set the appropriate headers for the response
			res.setHeader('Content-Type', s3Response.ContentType || 'application/octet-stream');
			res.setHeader('Content-Length', s3Response.ContentLength?.toString() || '0');
			res.setHeader('Content-Disposition', `inline; filename=${image.name}`);
			res.write(s3Response.Body);
			res.end();
			return true;
		} catch (err) {
			console.error(`Error retrieving image ${id}:`, err);
			res.status(500).json({ error: 'Error retrieving image' });
			return false;
		}
	},
	/*async delete({ id }: DeleteParams, res: Response): Promise<boolean> {
		try {
			// Find the image metadata in the database by ID
			const image = await Image.findOne({ _id: id }).exec();
			if (!image) {
				res.status(404).json({ error: 'Image not found' });
				return false;
			}
			// Delete image from S3
			const deleteObjectParams = {
				Bucket: process.env.DO_BUCKET as string,
				Key: image.url
			};
			const resultS3 = await database.getS3Client().send(new DeleteObjectCommand(deleteObjectParams));
			if (resultS3.$metadata.httpStatusCode !== 204) {
				res.status(500).json({ error: 'Error deleting image from storage' });
				return false;
			}
			// Delete the image from the database
			const resultDB = await image.deleteOne();
			if (resultDB.deletedCount === 0) {
				res.status(500).json({ error: 'Error deleting image from database' });
				return false;
			}
			return true;
		} catch (error) {
			console.error(`Failed to delete image ${id}:`, error);
			res.status(500).json({ error: 'Error deleting image' });
			return false;
		}
	},*/
	async deleteMany({ ids }: DeleteManyParams, res: Response): Promise<boolean> {
		try {
			// Find the image metadata in the database by ID
			const images = await Image.find({ _id: { $in: ids } }).exec();
			if (images.length !== ids.length) {
				res.status(404).json({ error: 'Image(s) not found' });
				return false;
			}
			for (const image of images) {
				// Delete image from S3
				const deleteObjectParams = {
					Bucket: process.env.DO_BUCKET as string,
					Key: image.url
				};
				const resultS3 = await database.getS3Client().send(new DeleteObjectCommand(deleteObjectParams));
				if (resultS3.$metadata.httpStatusCode !== 204) {
					res.status(500).json({ error: 'Error deleting image from storage' });
					return false;
				}
				// Delete the image from the database
				const resultDB = await image.deleteOne();
				if (resultDB.deletedCount === 0) {
					res.status(500).json({ error: 'Error deleting image from database' });
					return false;
				}
			}
			return true;
		} catch (error) {
			console.error(`Failed to delete images ${ids.join(', ')}:`, error);
			res.status(500).json({ error: 'Error deleting image' });
			return false;
		}
	}
};

export default imageService;
