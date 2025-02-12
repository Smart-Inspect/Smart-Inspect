import { Router } from 'express';
import { authenticate, authorize, isVerified } from '../middleware/authMiddleware';
import permissions from '../config/permissions';
import unitType from '../types/unitTypes';
import { viewUnit, deleteUnit, editUnit } from '../controllers/unitsController';
import { validateBody } from '../middleware/typeMiddleware';

const router = Router();

// PROTECTED ROUTES
router.use(authenticate, isVerified);
router.get('/view/:id', authorize(permissions.MANAGER), viewUnit);
router.put('/edit/:id', authorize(permissions.MANAGER), validateBody(unitType.ForEdit), editUnit);
router.delete('/delete/:id', authorize(permissions.MANAGER), deleteUnit);

export default router;
