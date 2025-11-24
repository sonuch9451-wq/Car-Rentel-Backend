

// Function to check  Availability of car for a given Date

import Booking from "../model/Booking.js"
import Car from "../model/car.js";

const checkAvailability = async (car, pickupDate, returnDate)=>{
    const bookings = await Booking.find({
        car,
        pickupDate: {$lte: returnDate},
        pickupDate: {$gte: pickupDate},

    })
    return bookings.length === 0;
}

// API to check Availability of cars for the given Date and location

export const checkAvailabilityOfCar = async(req,res)=>{
    try{
        const {location , pickupDate, returnDate} = req.body

        //fetch all available car for given location

        const cars = await Car.find({location, isAvaliable: true})

        // check car availability for the given date range using promise
        const availableCarPromiese = cars.map(async (car)=>{
            const isAvaliable = await checkAvailability(car._id, pickupDate, returnDate)
            return {...car._doc, isAvaliable: isAvaliable}
        })

        let availableCars = await Promise.all(availableCarPromiese);
        availableCars = availableCars.filter(car => car.isAvaliable === true)

        res.json({success: true, availableCars})
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
        
    }
}

//API to create Booking
export const createBooking = async (req,res)=>{
    try{
        const {_id} = req.user;
        const {car,pickupDate, returnDate} =req.body

        const isAvaliable = await checkAvailability(car, pickupDate, returnDate)
        if(!isAvaliable){
            return res.json({success: false, message: "Car is not Available"})
        }

        const carData = await Car.findById(car)

        // Calculate price based on pickupDate and returnDate
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned-picked) / (1000*60*60*24))
        const price = carData.pricePerDay * noOfDays;

        await Booking.create({car, owner: carData.owner, user: _id, pickupDate, returnDate, price})
        res.json({success: true, message: "Booking Created"})
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
        
    }
}

// API to list user Booking

export const getUserBooking = async (req,res)=>{
    try{
        const {_id} = req.user;
        const bookings = await Booking.find({user:_id}).populate("car").sort({createdAt: -1})
        res.json({success: true, bookings})
    }catch(error){
            console.log(error.message);
            res.json({success: false, message: error.message})
            
        }
    }

    //API to get owner Booking

   export const getOwnerBookings = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.json({ success: false, message: "Unauthorized" })
    }

    const bookings = await Booking.find({ owner: req.user._id })
      .populate("car")                      // car details chahiye
      .populate("user", "-password")        // user details, password ke bina
      .sort({ createdAt: -1 })

    res.json({ success: true, bookings })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}

    // API to change booking status

    export const changeBookingStatus = async(req,res) =>{
        try{
            const {_id} = req.user;
            const {bookingId, status} = req.body;

            const booking = await Booking.findById(bookingId)

            if(booking.owner.toString() !== _id.toString()){
                return res.json({success: false, message: "Unauthorized"})
            }
            booking.status = status;
            await booking.save();

            res.json({success: true, message: "Status Updated"})
        }catch(error){
            console.log(error.message);
            res.json({success: false, message: error.message})
            
        }
    }