import User from "../model/User.js";
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

// Test users for auth fallback
const testUsers = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@test.com',
    role: 'user'
  }
];

// Check if database is connected
const isDBConnected = () => mongoose.connection.readyState === 1;

export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.json({ success: false, message: 'not authorized' })
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded._id) {
            return res.json({ success: false, message: "not authorized" })
        }
        
        if (isDBConnected()) {
            // Use database
            const user = await User.findById(decoded._id).select("-password");
            if (!user) {
                return res.json({ success: false, message: "not authorized" })
            }
            req.user = user;
        } else {
            // Use test data
            const user = testUsers.find(u => u._id === decoded._id) || {
                _id: decoded._id,
                name: 'Test User',
                email: 'test@test.com',
                role: 'user'
            };
            req.user = user;
        }
        
        next();
    }
    catch (error) {
        return res.json({ success: false, message: "not authorized" })
    }
}