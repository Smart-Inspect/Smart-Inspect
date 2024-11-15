import { Router } from 'express';
import { refreshToken } from '../controllers/refreshController';

const router = Router();

router.get('/refresh', refreshToken);

export default router;
