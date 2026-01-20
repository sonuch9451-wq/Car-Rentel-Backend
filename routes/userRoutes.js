import express from 'express';
import { registerUser,loginUser, getUserData, getCar, updateProfile } from '../controllers/userController.js';
import { protect } from '../midelware/auth.js';
import upload from '../midelware/multer.js';
const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/data', protect, getUserData)
userRouter.get('/cars', getCar)
userRouter.put('/update-profile', protect, upload.single('image'), updateProfile)

export default userRouter