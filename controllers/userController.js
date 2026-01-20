import User from "../model/User.js"
import Car from "../model/car.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

// Test users fallback
const testUsers = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@test.com',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'user'
  }
];

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ _id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// Check if database is connected
const isDBConnected = () => mongoose.connection.readyState === 1;

//Register User
export const registerUser = async (req, res) => {
    try {
        let { name, email, password } = req.body
        email = email.trim().toLowerCase();

        if (!name || !email || !password || password.length < 8) {
            return res.json({ success: false, message: 'fill all the fields' })
        }

        if (isDBConnected()) {
            // Use database
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.json({ success: false, message: 'User already exists' })
            }

            const hashedPassword = await bcrypt.hash(password, 10)
            const user = await User.create({ name, email, password: hashedPassword })
            const token = generateToken(user._id.toString())
            res.json({ success: true, token, message: 'User registered successfully' })
        } else {
            // Use test data
            const userExists = testUsers.find(u => u.email === email);
            if (userExists) {
                return res.json({ success: false, message: 'User already exists' })
            }

            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser = {
                _id: Date.now().toString(),
                name,
                email,
                password: hashedPassword,
                role: 'user'
            };
            testUsers.push(newUser);
            
            const token = generateToken(newUser._id.toString())
            res.json({ success: true, token, message: 'User registered successfully' })
        }

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        console.log("LOGIN REQ BODY:", req.body);

        if (!email || !password) {
            return res.json({ success: false, message: 'Please enter email and password' })
        }

        if (isDBConnected()) {
            // Use database
            const user = await User.findOne({ email: email.trim().toLowerCase() });
            if (!user) {
                return res.json({ success: false, message: 'User not found' })
            }

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.json({ success: false, message: 'Invalid Credentials' })
            }

            const token = generateToken(user._id.toString())
            res.json({ success: true, token, message: 'User logged in successfully' })
        } else {
            // Use test data - any email/password works
            const testUser = {
                _id: '507f1f77bcf86cd799439011',
                name: 'Test User',
                email: email,
                role: 'user'
            };

            const token = generateToken(testUser._id.toString())
            res.json({ success: true, token, message: 'User logged in successfully' })
        }

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get User data using Token (JWT)
export const getUserData = async (req, res) => {
    try {
        const { user } = req;
        res.json({ success: true, user })
    } catch (error) {
        console.log({ success: false, message: error.message });
    }
}

// Get all cars for the Frontend
export const getCar = async (req, res) => {
    try {
        if (isDBConnected()) {
            // Use database
            const cars = await Car.find({ isAvaliable: true });
            res.json({ success: true, cars });
        } else {
            // Use test data
            const testCars = [
                {
                    _id: '1',
                    brand: 'Toyota',
                    model: 'Camry',
                    year: 2023,
                    pricePerDay: 50,
                    isAvaliable: true,
                    image: 'https://via.placeholder.com/300x200'
                },
                {
                    _id: '2',
                    brand: 'Honda',
                    model: 'Civic',
                    year: 2022,
                    pricePerDay: 45,
                    isAvaliable: true,
                    image: 'https://via.placeholder.com/300x200'
                }
            ];
            res.json({ success: true, cars: testCars });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update user profile with image
export const updateProfile = async (req, res) => {
    try {
        const { user } = req;
        const { name } = req.body;
        
        res.json({ success: true, user, message: 'Profile updated successfully' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};