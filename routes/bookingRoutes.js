import express from 'express'
import { changeBookingStatus, checkAvailabilityOfCar, createBooking, getOwnerBookings, getUserBooking } from '../controllers/bookingControllers.js';
import { protect } from '../midelware/auth.js';

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityOfCar)
bookingRouter.post('/create', protect, createBooking)
bookingRouter.get('/user', protect, getUserBooking)
bookingRouter.get('/owner', protect, getOwnerBookings)
bookingRouter.post('/change-status', protect, changeBookingStatus)


export default bookingRouter;