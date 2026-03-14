import User from '../models/User.js';
import ServiceCentre from '../models/ServiceCentres.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const getAllServiceCentres = async (req, res) => {
    try {
        const centres = await ServiceCentre.find();
        res.status(200).json(centres);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const createServiceCentre = async (req, res) => {
    try {
        const centre = new ServiceCentre(req.body);
        await centre.save();
        res.status(201).json({ message: 'Service centre created successfully', centre });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const updateServiceCentre = async (req, res) => {
    try {
        const centre = await ServiceCentre.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!centre) {
            return res.status(404).json({ message: 'Service centre not found' });
        }
        res.status(200).json({ message: 'Service centre updated successfully', centre });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const deleteServiceCentre = async (req, res) => {
    try {
        const centre = await ServiceCentre.findByIdAndDelete(req.params.id);
        if (!centre) {
            return res.status(404).json({ message: 'Service centre not found' });
        }
        res.status(200).json({ message: 'Service centre deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalServices = await Service.countDocuments();
        const totalCentres = await ServiceCentre.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });

        res.status(200).json({
            totalUsers,
            totalServices,
            totalCentres,
            totalBookings,
            pendingBookings
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
