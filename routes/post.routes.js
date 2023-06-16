import { Router } from 'express';
import PostController from '../controllers/post.controller.js';

import { isAuth, restrictTo } from '../middlewares/auth-middleware.js';

const postRoutes = Router();

postRoutes.post('/', isAuth, PostController.createPost);

postRoutes.get('/:id', isAuth, PostController.postDetail);

postRoutes.get('/likes/:id', isAuth, PostController.toggleLikes);

postRoutes.get('/dislikes/:id', isAuth, PostController.toggleDisLikes);

postRoutes.get('/', isAuth, PostController.findAllPosts);

export default postRoutes;
