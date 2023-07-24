import { Router } from 'express';
import commentController from '../controllers/comment.controller.js';
import { isAuth } from '../middlewares/auth-middleware.js';

const commentRoutes = Router();

commentRoutes.post('/', isAuth, commentController.createComment);

commentRoutes.delete('/:id', isAuth, commentController.deleteComment);

commentRoutes.put('/:id', isAuth, commentController.updateComment);

export default commentRoutes;
