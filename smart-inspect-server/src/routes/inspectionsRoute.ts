import { Router } from 'express';
import { authenticate, authorize, isVerified } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/typeMiddleware';
import permissions from '../config/permissions';
import inspectionType from '../types/inspectionsTypes';
import {
	deleteInspection,
	downloadLayout,
	downloadPhoto,
	deletePhotos,
	editInspection,
	uploadPhoto,
	viewAllInspections,
	viewAssignedInspections,
	viewInspection
} from '../controllers/inspectionsController';
import { imageUpload } from '../middleware/imagesMiddleware';

const router = Router();

// PROTECTED ROUTES
router.use(authenticate, isVerified);
router.post('/create/:id/upload-photo', authorize(permissions.ENGINEER), imageUpload({ allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png'] }), uploadPhoto);
router.get('/view/:id', authorize(permissions.ENGINEER), viewInspection);
router.get('/view/:id/download-layout/:layoutId', authorize(permissions.ENGINEER), downloadLayout);
router.get('/view/:id/download-photo/:photoId', authorize(permissions.ENGINEER), downloadPhoto);
router.put('/edit/:id', authorize(permissions.ENGINEER), validateBody(inspectionType.ForEdit), editInspection);
router.delete('/delete/:id', authorize(permissions.MANAGER), deleteInspection);
router.delete('/delete/:id/delete-photos', authorize(permissions.MANAGER), validateBody(inspectionType.ForDeletePhotos), deletePhotos);
router.get('/view', authorize(permissions.MANAGER), viewAllInspections);
router.get('/view-assigned', authorize(permissions.ENGINEER), viewAssignedInspections);

export default router;
