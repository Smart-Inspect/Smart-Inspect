import { Router } from 'express';
import {
	createUser,
	deleteUser,
	getUsers,
	updateUser
} from '../controllers/users';

const router = Router();

router.get('/', getUsers);
router.post('/create', createUser);
router.post('/edit', updateUser);
router.post('/delete', deleteUser);

export default router;
