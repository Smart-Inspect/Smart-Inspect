import { Router } from 'express';
import { authenticate, authorize, isVerified } from '../middleware/authMiddleware';
import { refreshToken, authCheck, engineerCheck, managerCheck } from '../controllers/authController';
import { validateBody } from '../middleware/typeMiddleware';
import permissions from '../config/permissions';
import authType from '../types/authTypes';

const router = Router();

// PUBLIC ROUTES
router.post('/refresh', validateBody(authType.ForRefresh), refreshToken);

// PROTECTED ROUTES
router.use(authenticate, isVerified);
router.get('/', authCheck);
router.get('/permission/engineer', authorize(permissions.ENGINEER), engineerCheck);
router.get('/permission/manager', authorize(permissions.MANAGER), managerCheck);

export default router;
