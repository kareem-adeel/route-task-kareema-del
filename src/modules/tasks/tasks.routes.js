import { Router } from "express";
import asyncHandler from 'express-async-handler';
import * as tasksController from './tasks.controller.js';
import {auth} from '../../middlewares/auth.middleware.js';
const router = Router();


router.post('/addTask',auth(),asyncHandler(tasksController.addTask));
router.get('/getAllPublicTasks',asyncHandler(tasksController.getAllPublicTasks));
router.get('/getPrivateTasks',auth(),asyncHandler(tasksController.getPrivateTasks));
router.delete('/deleteTask',auth(),asyncHandler(tasksController.deleteTask));
router.put('/updateTask',auth(),asyncHandler(tasksController.updateTask));


export default router;