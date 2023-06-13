import { Router } from 'express';
import UserController from '../controllers/user.controller.js';
import multer from 'multer';
import storage from '../config/cloudinary.js';
import isAuth from '../middlewares/auth-middleware.js';

const upload = multer({ storage });

const userRotes = Router();

userRotes.post('/signup', UserController.signup);

userRotes.post('/login', UserController.login);

userRotes.post('/logout', UserController.logout);

userRotes.get('/activate/:link', UserController.activate);

userRotes.get('/refresh', UserController.refresh);

userRotes.patch(
  '/upload-user-photo',
  isAuth,
  upload.single('profile'),
  UserController.uploadUserPhoto,
);

export default userRotes;
