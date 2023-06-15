import { Router } from 'express';
import postRoutes from './post.routes.js';
import userRoutes from './user.routes.js';
import categoryRoutes from './category.routes.js';

const api = Router();

api.use('/users', userRoutes);
api.use('/posts', postRoutes);
api.use('/categories', categoryRoutes);

export default api;
