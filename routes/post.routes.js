import { Router } from 'express';
import multer from 'multer';
import PostController from '../controllers/post.controller.js';
import storage from '../config/cloudinary.js';

import { isAuth } from '../middlewares/auth-middleware.js';

const upload = multer({ storage });

const postRoutes = Router();

postRoutes.post('/', isAuth, upload.single('image'), PostController.createPost);

postRoutes.get('/:id', isAuth, PostController.postDetail);

postRoutes.get('/likes/:id', isAuth, PostController.toggleLikes);

postRoutes.get('/dislikes/:id', isAuth, PostController.toggleDisLikes);

postRoutes.get('/', isAuth, PostController.findAllPosts);

postRoutes.delete('/:id', isAuth, PostController.deletePost);

postRoutes.put('/:id', isAuth, upload.single('image'), PostController.updatePost);

export default postRoutes;
