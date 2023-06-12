import { Router } from 'express';
import userRoutes from './user.routes.js';

const api = Router();

api.use('/users', userRoutes);

export default api;
