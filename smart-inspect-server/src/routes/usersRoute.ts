import { Router } from 'express';
import { authenticate, authorize, isVerified } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/typeMiddleware';
import {
	createUser,
	loginUser,
	verifyUserEmail,
	verifyUser,
	verifyUserSend,
	logoutUser,
	viewUser,
	editUser,
	deleteUser,
	forgotPassword,
	resetPasswordEmail,
	viewAllUsers
} from '../controllers/usersController';
import permissions from '../config/permissions';
import userType from '../types/usersTypes';

const router = Router();

// PUBLIC ROUTES
router.post('/create', validateBody(userType.ForCreate), createUser);
router.post('/login', validateBody(userType.ForLogin), loginUser);
router.post('/forgot-password', validateBody(userType.ForForgotPassword), forgotPassword);
router.post('/verify/email', validateBody(userType.ForVerify), verifyUserEmail); // This route will be accessed by the user through the email link
router.post('/reset-password/email', validateBody(userType.ForReset), resetPasswordEmail); // This route will be accessed by the user through the email link

// PROTECTED (but UNVERIFIED) ROUTES
router.use(authenticate);
router.get('/verify', verifyUser);
router.get('/verify/send', verifyUserSend);
router.post('/logout', validateBody(userType.ForLogout), logoutUser);
// PROTECTED (and VERIFIED) ROUTES
router.use(isVerified);
router.get('/view/:id', authorize(permissions.ENGINEER), viewUser);
router.put('/edit/:id', authorize(permissions.ENGINEER), validateBody(userType.ForEdit), editUser);
router.delete('/delete/:id', authorize(permissions.ENGINEER), deleteUser);
router.get('/view', authorize(permissions.MANAGER), viewAllUsers);

export default router;
