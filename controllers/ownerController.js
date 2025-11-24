import { format } from "path";
import imagekit from "../configs/imageKit.js";
import User from "../model/User.js";
import fs from 'fs'
import Car from "../model/car.js";
import Booking from "../model/Booking.js";
//API to change Role of User

export const changeRoleToOwner = async (req,res)=>{
    try{
        const {_id} = req.user;
        await User.findByIdAndUpdate(_id,{role:"owner"})
        res.json({success: true, message: "Now you can list cars"})
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
        
    }
}

// API to List Car

export const addCar = async(req,res)=>{
    try{
        const {_id} = req.user;
        let car = JSON.parse(req.body.carData);
        const imageFile = req.file;

        // Upload image to Imagekit

        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars'
        })

        // Optimization through imagekit URL transformation

        var optimizationUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                {width: '1280'},  //Width resizing
                {quality: 'auto'},  // Auto Compression
                {format: 'webp'}  //Convert to morden format
            ]
        });

        const image = optimizationUrl;
        await Car.create({...car, owner: _id, image})

        res.json({success: true, message: "Car Added"})

    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
        
    }
}


// APi to list owner cars

export const getOwneracrs = async(req,res)=>{
    try{
        const{_id} = req.user;
        const cars = await Car.find({owner:_id})
        res.json({success: true, cars})
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Api to Toggle Car Availability

export const toggleCarAvailability = async(req,res)=>{
    try{
        const{_id} = req.user;
        const {carId} = req.body


        const car = await Car.findById(carId)

        // Checking is car belongs to the user

        if(car.owner.toString() !==_id.toString()){
            return res.json({success: false, message: "Unauthorized"})
        }

        car.isAvaliable = !car.isAvaliable;
        await car.save()

        res.json({success: true, message: "Availabilty Toggled"})
        
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to delete a car



export const deleteCar = async(req,res)=>{
    try{
        const{_id} = req.user;
        const {carId} = req.body

        const car = await Car.findById(carId)

        // Checking is car belongs to the user

        if(car.owner.toString() !==_id.toString()){
            return res.json({success: false, message: "Unauthorized"})
        }

        car.owner = null;
        car.isAvaliable = false;
        await car.save()

        res.json({success: true, message: "Car Removed"})
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to get dashboard data


export const getDashboardData = async(req,res)=>{
    try{
        const {_id, role} = req.user;

        if(role !== 'owner'){
            return res.json({success: false, message: "Unauthorized"});
        }
        const cars = await Car.find({owner: _id})
        const bookings = await Booking.find({owner: _id}).populate('car').sort({createdAt: -1});

        const pendingBookings = await Booking.find({owner: _id, status: "pending"})
        const completedBookings = await Booking.find({owner: _id, status: "confirmed"})

        // Calculate monthly revenue from booking where status is confirmed 
        const monthlyRevenue = bookings.slice().filter(bookings => bookings.status === 'confirmed').reduce((acc,booking)=> acc + booking.price, 0)

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0,3),
            monthlyRevenue
        }

        res.json({success: true, dashboardData});
    }catch(error){
        console.log(error.message);
        res.json({success: false, success: error.message})
        
    }
}

// API to update user image

export const updateUserImage = async(req,res)=>{
    try{
        const {_id} = req.user;

         const imageFile = req.file;

         if (!imageFile) {
      return res.json({ success: false, message: "No image uploaded" });
    }

        // Upload image to Imagekit

        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
        })

        // Optimization through imagekit URL transformation

        var optimizationUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                {width: '400'},  //Width resizing
                {quality: 'auto'},  // Auto Compression
                {format: 'webp'}  //Convert to morden format
            ]
        });

        const image = optimizationUrl;

        await User.findByIdAndUpdate(_id, {image});
        res.json({success: true, message: "Image Updated"})
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}
