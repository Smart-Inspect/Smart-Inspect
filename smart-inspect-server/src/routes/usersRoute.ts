import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validateType } from '../middleware/typeMiddleware';
import { createUser, loginUser, logoutUser, viewUser, deleteUser, getUsers, updateUser } from '../controllers/usersController';
import permissions from '../config/permissions';
import userType from '../types/usersTypes';

const router = Router();

// Public Routes
router.post('/create', validateType(userType.ForCreate), createUser);
router.post('/login', validateType(userType.ForLogin), loginUser);

// Protected Routes
router.use(authenticate);
router.get('/logout', authenticate, logoutUser);
router.get('/view:id', authenticate, viewUser);
router.post('/edit', authenticate, updateUser);
router.post('/delete', authenticate, deleteUser);

// Manager Routes: none

// Admin Routes
router.use(authorize(permissions.ADMIN));
router.get('/', getUsers);

export default router;
