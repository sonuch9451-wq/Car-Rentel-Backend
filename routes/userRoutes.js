import express from 'express';
import { registerUser,loginUser, getUserData, getCar } from '../controllers/userController.js';
import { protect } from '../midelware/auth.js';
const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/data', protect, getUserData)
userRouter.get('/cars', getCar)

export default userRouter