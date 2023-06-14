import { Router } from 'express';
import postRoutes from './post.routes.js';
import userRoutes from './user.routes.js';

const api = Router();

api.use('/users', userRoutes);
api.use('/posts', postRoutes);

export default api;
