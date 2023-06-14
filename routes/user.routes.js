import { Router } from 'express';
import UserController from '../controllers/user.controller.js';
import multer from 'multer';
import storage from '../config/cloudinary.js';
import { isAuth, restrictTo } from '../middlewares/auth-middleware.js';

const upload = multer({ storage });

const userRoutes = Router();

userRoutes.post('/signup', UserController.signup);

userRoutes.post('/login', UserController.login);

userRoutes.post('/logout', UserController.logout);

userRoutes.get('/activate/:link', UserController.activate);

userRoutes.get('/refresh', UserController.refresh);

userRoutes.get('/:id', UserController.findOne);

userRoutes.patch(
  '/upload-user-photo',
  isAuth,
  upload.single('profile'),
  UserController.uploadUserPhoto,
);

userRoutes.get('/profile-viewers/:id', isAuth, UserController.visitUserProfile);

userRoutes.get('/following/:id', isAuth, UserController.followUser);

userRoutes.get('/unFollowing/:id', isAuth, UserController.unFollowUser);

userRoutes.get('/blocking/:id', isAuth, UserController.blockUser);

userRoutes.get('/unBlocking/:id', isAuth, UserController.unBlockUser);

userRoutes.put('/admin-block/:id', isAuth, restrictTo('Admin'), UserController.adminBlockUser);

userRoutes.put('/admin-unblock/:id', isAuth, restrictTo('Admin'), UserController.adminUnBlockUser);

export default userRoutes;
