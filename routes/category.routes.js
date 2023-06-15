import { Router } from 'express';
import CategoryController from '../controllers/category.controller.js';

import { isAuth, restrictTo } from '../middlewares/auth-middleware.js';

const categoryRoutes = Router();

categoryRoutes.post('/', isAuth, CategoryController.createCategory);

categoryRoutes.get('/', isAuth, CategoryController.findAllCategories);

categoryRoutes.get('/:id', isAuth, CategoryController.findOneCategory);

categoryRoutes.delete('/:id', isAuth, CategoryController.deleteCategory);

categoryRoutes.put('/:id', isAuth, CategoryController.updateCategory);

export default categoryRoutes;
