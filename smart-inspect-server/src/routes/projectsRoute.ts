import { Router } from 'express';
import { authenticate, authorize, isVerified } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/typeMiddleware';
import permissions from '../config/permissions';
import projectType from '../types/projectsTypes';
import {
	createProject,
	deleteProject,
	downloadLayout,
	editProject,
	uploadLayouts,
	deleteLayouts,
	viewAllProjects,
	viewAssignedProjects,
	viewLayouts,
	viewProject
} from '../controllers/projectsController';
import { formDataFormatter } from '../middleware/imageMiddleware';

const router = Router();

const layoutUploadMiddleware = formDataFormatter([
	{ name: 'files', maxCount: 10 },
	{ name: 'uploadCount', maxCount: 1 },
	{ name: 'timestamp', maxCount: 1 }
]);

// PROTECTED ROUTES
router.use(authenticate, isVerified);
router.post('/create', authorize(permissions.MANAGER), validateBody(projectType.ForCreate), createProject);
router.post('/create/:id/upload-layouts', authorize(permissions.MANAGER), layoutUploadMiddleware, uploadLayouts);
router.get('/view/:id', authorize(permissions.ENGINEER), viewProject);
router.get('/view/:id/layouts', authorize(permissions.ENGINEER), viewLayouts);
router.get('/view/:id/download-layout/:layoutId', authorize(permissions.ENGINEER), downloadLayout);
router.put('/edit/:id', authorize(permissions.MANAGER), validateBody(projectType.ForEdit), editProject);
router.delete('/delete/:id', authorize(permissions.MANAGER), deleteProject);
router.delete('/delete/:id/delete-layouts', authorize(permissions.MANAGER), validateBody(projectType.ForDeleteLayouts), deleteLayouts);
router.get('/view', authorize(permissions.MANAGER), viewAllProjects);
router.get('/view-assigned', authorize(permissions.ENGINEER), viewAssignedProjects);

export default router;
