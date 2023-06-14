import { Router } from 'express';
import UserController from '../controllers/user.controller.js';
import multer from 'multer';
import storage from '../config/cloudinary.js';
import { isAuth, restrictTo } from '../middlewares/auth-middleware.js';

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

userRotes.get('/profile-viewers/:id', isAuth, UserController.visitUserProfile);

userRotes.get('/following/:id', isAuth, UserController.followUser);

userRotes.get('/unFollowing/:id', isAuth, UserController.unFollowUser);

userRotes.get('/blocking/:id', isAuth, UserController.blockUser);

userRotes.get('/unBlocking/:id', isAuth, UserController.unBlockUser);

userRotes.put('/admin-block/:id', isAuth, restrictTo('Admin'), UserController.adminBlockUser);

userRotes.put('/admin-unblock/:id', isAuth, restrictTo('Admin'), UserController.adminUnBlockUser);

export default userRotes;
