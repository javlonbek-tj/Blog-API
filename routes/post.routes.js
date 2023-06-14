import { Router } from 'express';
import PostController from '../controllers/post.controller.js';

import { isAuth, restrictTo } from '../middlewares/auth-middleware.js';

const postRoutes = Router();

postRoutes.post('/', isAuth, PostController.createPost);

export default postRoutes;
