
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import ServiceCentre from '../models/ServiceCentres.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
const getUserId = (req) => (req.user?._id ?? req.user?.id ?? null);
export const createBooking = async (req, res) => {
    try {
        const { service, serviceCentre, date, time, notes } = req.body;
        const user = getUserId(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        if (!service || !date || !time) {
            return res.status(400).json({ message: 'service, date and time are required' });
        }

        const serviceExists = await Service.findById(service).lean();
        if (!serviceExists) return res.status(404).json({ message: 'Service not found' });

        let centreId = serviceCentre;

        if (!centreId) {
            const arr = serviceExists.availableAt?.length
                ? serviceExists.availableAt
                : serviceExists.serviceCentres?.length
                    ? serviceExists.serviceCentres
                    : [];

            if (arr.length === 0)
                return res.status(400).json({ message: 'No service centre available for this service' });

            centreId = arr[0];
        }

        if (!mongoose.Types.ObjectId.isValid(centreId))
            return res.status(400).json({ message: 'Invalid serviceCentre id' });

        const centreExists = await ServiceCentre.findById(centreId);
        if (!centreExists) return res.status(404).json({ message: 'Service centre not found' });

        const centreList = serviceExists.availableAt?.length
            ? serviceExists.availableAt.map(String)
            : serviceExists.serviceCentres?.map(String) ?? [];

        if (!centreList.includes(centreId.toString())) {
            return res.status(400).json({ message: 'Service not available at this centre' });
        }

        const totalPrice = serviceExists.price ?? 0;

        const booking = await Booking.create({
            user,
            service,
            serviceCentre: centreId,
            date,
            time,
            notes,
            totalPrice
        });
        try {
            await Notification.create({
                centre: centreId,
                booking: booking._id,
                message: `New booking for ${serviceExists.serviceName}`
            });
        } catch (err) {
            console.error("Notification error:", err);
        }

        const populated = await Booking.findById(booking._id)
            .populate('service')
            .populate('serviceCentre');

        res.status(201).json({ message: "Booking created successfully", booking: populated });

    } catch (error) {
        console.error('createBooking:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const getUserBookings = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const bookings = await Booking.find({ user: userId })
            .populate('service')
            .populate('serviceCentre')
            .sort({ createdAt: -1 });

        res.json({ bookings });
    } catch (error) {
        console.error('getUserBookings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const getCentreBookings = async (req, res) => {
    try {
        let centreId = req.user?.serviceCentre || req.query.centreId;

        if (!centreId)
            return res.status(400).json({ message: "Service centre ID required" });

        const bookings = await Booking.find({ serviceCentre: centreId })
            .populate('user', 'name email')
            .populate('service')
            .populate('serviceCentre')
            .sort({ createdAt: -1 });

        res.status(200).json(bookings);

    } catch (error) {
        console.error('getCentreBookings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user')
            .populate('service')
            .populate('serviceCentre')
            .sort({ createdAt: -1 });

        res.json({ bookings });
    } catch (error) {
        console.error('getAllBookings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const valid = ["pending", "confirmed", "completed", "cancelled"];
        if (!valid.includes(status))
            return res.status(400).json({ message: "Invalid status" });

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: Date.now() },
            { new: true }
        );

        if (!booking)
            return res.status(404).json({ message: "Booking not found" });

        res.json({ message: "Status updated", booking });

    } catch (error) {
        console.error('updateBookingStatus:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const cancelBooking = async (req, res) => {
    try {
        const userId = getUserId(req);

        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, user: userId },
            { status: "cancelled", updatedAt: Date.now() },
            { new: true }
        );

        if (!booking)
            return res.status(404).json({ message: "Booking not found or not allowed" });

        res.json({ message: "Booking cancelled", booking });

    } catch (error) {
        console.error('cancelBooking:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
