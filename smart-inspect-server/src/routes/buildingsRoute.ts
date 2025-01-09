import { Router } from 'express';
import { authenticate, authorize, isVerified } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/typeMiddleware';
import { createBuilding, viewBuilding, editBuilding, deleteBuilding, viewAllBuildings, viewBuildingUnits } from '../controllers/buildingsController';
import permissions from '../config/permissions';
import buildingType from '../types/buildingsTypes';

const router = Router();

// PROTECTED ROUTES
router.use(authenticate, isVerified);
router.post('/create', authorize(permissions.MANAGER), validateBody(buildingType.ForCreate), createBuilding);
router.get('/view/:id', authorize(permissions.MANAGER), viewBuilding);
router.get('/view/:id/units', authorize(permissions.MANAGER), viewBuildingUnits);
router.put('/edit/:id', authorize(permissions.MANAGER), validateBody(buildingType.ForEdit), editBuilding);
router.delete('/delete/:id', authorize(permissions.MANAGER), deleteBuilding);
router.get('/view', authorize(permissions.MANAGER), viewAllBuildings);

export default router;
