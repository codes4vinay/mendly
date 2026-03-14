
import express from 'express';
import {
    createBooking,
    getUserBookings,
    getCentreBookings,
    getAllBookings,
    updateBookingStatus,
    cancelBooking
} from '../controllers/bookingController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/', protect, createBooking);
router.get('/user', protect, getUserBookings);
router.put('/:id/cancel', protect, cancelBooking);
router.get('/centre', protect, getCentreBookings);
router.get('/', protect, admin, getAllBookings);
router.put('/:id/status', protect, updateBookingStatus);




export default router;
