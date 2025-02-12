import { Response } from 'express';
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import Image from '../models/Image';
import database from '../config/db';

interface DownloadParams {
	id: string;
}

interface DeleteManyParams {
	ids: string[];
}

const imageService = {
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
			(s3Response.Body as NodeJS.ReadableStream).pipe(res);
			return true;
		} catch (err) {
			console.error(`Error retrieving image ${id}:`, err);
			res.status(500).json({ error: 'Error retrieving image' });
			return false;
		}
	},
	async deleteMany({ ids }: DeleteManyParams, res: Response | undefined): Promise<boolean> {
		try {
			// Find the image metadata in the database by ID
			const images = await Image.find({ _id: { $in: ids } }).exec();
			if (images.length !== ids.length) {
				res?.status(404).json({ error: 'Image(s) not found' });
				return false;
			}
			// For each image, delete it from S3 and then delete it from the database
			for (const image of images) {
				// Create the command to delete the object from the bucket
				const deleteObjectParams = {
					Bucket: process.env.DO_BUCKET as string,
					Key: image.url
				};
				// Delete the image from the database
				await image.deleteOne();
				// Delete image from S3
				const resultS3 = await database.getS3Client().send(new DeleteObjectCommand(deleteObjectParams));
				if (resultS3.$metadata.httpStatusCode !== 204) {
					res?.status(500).json({ error: 'Error deleting image from storage' });
					return false;
				}
			}
			return true;
		} catch (error) {
			console.error(`Failed to delete images ${ids.join(', ')}:`, error);
			res?.status(500).json({ error: 'Error deleting image' });
			return false;
		}
	}
};

export default imageService;
