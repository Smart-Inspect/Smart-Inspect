import 'express';

// Extend the Request interface to include a user property
declare global {
	namespace Express {
		namespace Multer {
			interface File {
				key?: string;
				location?: string;
			}
		}
	}
}
