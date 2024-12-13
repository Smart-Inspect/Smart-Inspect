import { Router } from 'express';
import { refreshToken } from '../controllers/refreshController';
import { validateBody } from '../middleware/typeMiddleware';
import refreshType from '../types/refreshTypes';

const router = Router();

router.post('/', validateBody(refreshType.ForRefresh), refreshToken);

export default router;
