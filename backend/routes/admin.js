import express from 'express';
import {
    getAllUsers,
    getAllServiceCentres,
    createServiceCentre,
    updateServiceCentre,
    deleteServiceCentre,
    getDashboardStats
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/centres', getAllServiceCentres);
router.use(protect);
router.use(admin);

router.get('/users', getAllUsers);
router.post('/centres', createServiceCentre);
router.put('/centres/:id', updateServiceCentre);
router.delete('/centres/:id', deleteServiceCentre);
router.get('/dashboard', getDashboardStats);

export default router;