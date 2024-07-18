import { Router } from "express";
import asyncHandler from 'express-async-handler';
import * as userController from './user.controller.js';
import {auth} from '../../middlewares/auth.middleware.js';
import { multerMiddlewareHost } from "../../middlewares/multer.middleware.js";
import {allowedExtensions} from '../../utils/allowed-extensions.js';

const router = Router();

router.post('/signUp',multerMiddlewareHost({extinsions:allowedExtensions.image}).single('pic'),asyncHandler(userController.signUp));
router.get('/verify-email',asyncHandler(userController.verifyEmail));
router.post('/signIn',asyncHandler(userController.signIn));
router.get('/getAllUsers',asyncHandler(userController.getAllUsers));
router.put('/updateAccount',auth(),multerMiddlewareHost({extinsions:allowedExtensions.image}).single('pic'),asyncHandler(userController.updateAccount));
router.delete('/deleteAccount',auth(),asyncHandler(userController.deleteAccount));

export default router;