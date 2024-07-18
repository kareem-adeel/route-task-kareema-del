import { Router } from "express";
import asyncHandler from 'express-async-handler';
import {auth} from '../../middlewares/auth.middleware.js';
import * as categoryController from '../categories/categories.controller.js';
const router = Router();

router.post('/addCategory',auth(),asyncHandler(categoryController.addCategory));
router.put('/updateCategory/:categoryId',auth(),asyncHandler(categoryController.updateCategory));
router.delete('/deleteCategory/:categoryId',auth(),asyncHandler(categoryController.deleteCategory));
router.get('/getAllCategories',auth(),asyncHandler(categoryController.getAllCategories));
router.get('/getCategoryByName',asyncHandler(categoryController.getCategoryByName));






export default router;