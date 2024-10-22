import { Router } from 'express';
import { createUser, loginUser, deleteUser, getUsers, updateUser } from '../controllers/usersController';
import { authenticate, authenticateManager } from '../middleware/verifyToken';

const router = Router();

router.get('/', authenticateManager, getUsers);
router.post('/create', createUser);
router.put('/login', loginUser);
router.post('/edit', authenticate, updateUser);
router.post('/delete', authenticate, deleteUser);

export default router;
