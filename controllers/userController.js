import User from "../model/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Car from "../model/car.js";

// Generate JWT Token
const generateToken = (userId) =>{
    const payload = userId;
    return jwt.sign(payload, process.env.JWT_SECRET)
}

//Register User

export const registerUser = async  (req,res) => {
    try{
        let {name, email, password} = req.body
        email = email.trim().toLowerCase();

        if(!name || !email || !password || password.length < 8){
            return res.json({success: false, message: 'fill all the fields'})
        }

        const userExists = await User.findOne({email})
        if(userExists){
            return res.json({success: false, message: 'User alredy exists'})
        }

        const hashedPassword = await bcrypt.hash(password,10)
        const user = await User.create({name,email,password:hashedPassword})
        const token = generateToken(user._id.toString())
        res.json({success: true, token})

    } catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
        
    }
}

//Login User

export const loginUser = async(req,res)=>{
try{
    const {email, password} = req.body
    console.log("LOGIN REQ BODY:", req.body);

    const user = await User.findOne({email})
    console.log("FOUND USER:", user);
    if(!user){
        return res.json({success: false, message: 'User not found'})
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        return res.json({success: false, message: 'Invalid Credentials'})
    }
     const token = generateToken(user._id.toString())
        res.json({success: true, token})

}catch(error){
     console.log(error.message);
        res.json({success: false, message: error.message})
        
}
}

// Get User data using Token (JWT)

export const getUserData = async (req,res)=>{
    try{
        const {user} = req;
        res.json({success: true, user})
    }catch(error){
        console.log({success: false, message: error.message});
        
    }
}

// Get all cars for the Frontend

// export const getCar = async(req,res)=>{
//     try{
//         const car = await Car.find({isAvaliable: true})
//         res.json({success: true, car})
//     }catch(error){
//         console.log(error.message);
//         res.json({success: false, message: error.message})
        
//     }
// }



// controllers/userController.js



export const getCar = async (req, res) => {
  try {
    const cars = await Car.find();     // ya tumhari condition { isAvaliable: true }

    res.json({ success: true, cars })  // 👈 IMPORTANT: yahan plural "cars"
  } catch (error) {
    
    res.json({ success: false, message: error.message });
  }
};
