import { Router } from 'express';
import { authenticate, authorize, isVerified } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/typeMiddleware';
import permissions from '../config/permissions';
import inspectionType from '../types/inspectionsTypes';
import { deleteInspection, downloadPhoto, editInspection, uploadPhoto, viewAllInspections, viewAssignedInspections, viewInspection } from '../controllers/inspectionsController';

const router = Router();

// PROTECTED ROUTES
router.use(authenticate, isVerified);
router.post('/create/:id/upload-photo', authorize(permissions.ENGINEER), validateBody(inspectionType.ForUploadPhoto), uploadPhoto);
router.get('/view/:id', authorize(permissions.ENGINEER), viewInspection);
router.get('/view/:id/download-photo/:photoId', authorize(permissions.ENGINEER), downloadPhoto);
router.put('/edit/:id', authorize(permissions.ENGINEER), validateBody(inspectionType.ForEdit), editInspection);
router.delete('/delete/:id', authorize(permissions.ENGINEER), deleteInspection);
router.get('/view', authorize(permissions.MANAGER), viewAllInspections);
router.get('/view-assigned', authorize(permissions.ENGINEER), viewAssignedInspections);

export default router;
