import { Router } from 'express';
import UserController from '../controllers/user.controller.js';

const userRotes = Router();

userRotes.post('/signup', UserController.signup);

userRotes.post('/login', UserController.login);

userRotes.post('/logout', UserController.logout);

userRotes.get('/activate/:link', UserController.activate);

userRotes.get('/refresh', UserController.refresh);

export default userRotes;
