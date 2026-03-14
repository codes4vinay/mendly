import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/centre/:centreId', protect, async (req, res) => {
    try {
        const { centreId } = req.params;
        const notifs = await Notification.find({ centre: centreId })
            .populate({
                path: 'booking',
                populate: [{ path: 'service', select: 'serviceName price' }, { path: 'user', select: 'name email' }]
            })
            .sort({ createdAt: -1 })
            .limit(200);
        res.json({ notifications: notifs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id/read', protect, async (req, res) => {
    try {
        const n = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
        res.json({ notification: n });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
