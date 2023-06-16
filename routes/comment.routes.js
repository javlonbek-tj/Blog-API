import { Router } from 'express';
import commentController from '../controllers/comment.controller.js';

const commentRoutes = Router();

commentRoutes.post('/', commentController.createComment);

commentRoutes.delete('/:id', commentController.deleteComment);

commentRoutes.put('/:id', commentController.updateComment);

export default commentRoutes;
