import express from 'express';
import multer from 'multer';
import {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getServicesByCentre,
    getMostBookedServices
} from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/authMiddleware.js';

const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });
router.get('/', getAllServices);
router.get('/most-booked', getMostBookedServices);
router.get('/:id', getServiceById);
router.get('/centre/:centreId', getServicesByCentre);

router.post('/', protect, upload.fields([{ name: 'photos', maxCount: 10 }, { name: 'videos', maxCount: 5 }]), createService);
router.put('/:id', protect, admin, updateService);
router.delete('/:id', protect, admin, deleteService);

export default router;
