import Service from '../models/Service.js';
import ServiceCentre from '../models/ServiceCentres.js';
export const getAllServices = async (req, res) => {
    try {
        const services = await Service.find().populate('availableAt', 'name address').populate('serviceCentres', 'name');
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate('availableAt', 'name address').populate('serviceCentres', 'name');
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const createService = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        console.log('Request user:', req.user);

        const { serviceName, price, availableAt, contact, mostBooked } = req.body;
        if (!serviceName || !price || !contact) {
            return res.status(400).json({ 
                message: 'Missing required fields: serviceName, price, and contact are required' 
            });
        }
        const photos = req.files?.photos ? req.files.photos.map(file => `/uploads/${file.filename}`) : [];
        const videos = req.files?.videos ? req.files.videos.map(file => `/uploads/${file.filename}`) : [];

        let serviceCentre;
        if (req.user.role === 'serviceCenter') {
            console.log('Looking for service centre with email:', req.user.email);
            serviceCentre = await ServiceCentre.findOne({ email: req.user.email });
            
            if (!serviceCentre) {
                console.log('Service centre not found. Creating a new one...');
                serviceCentre = new ServiceCentre({
                    name: req.user.name || 'Service Centre',
                    ownerName: req.user.name || 'Owner',
                    ownerContact: contact,
                    address: availableAt || 'Address to be updated',
                    servicesAvailable: [serviceName],
                    contact: contact,
                    mainServices: [serviceName],
                    openingTime: '09:00 AM',
                    closingTime: '06:00 PM',
                    email: req.user.email
                });
                
                await serviceCentre.save();
                console.log('New service centre created:', serviceCentre._id);
            }
        } else if (req.user.role === 'admin') {
            if (!availableAt) {
                return res.status(400).json({ 
                    message: 'Address (availableAt) is required for admin to create service' 
                });
            }
            
            serviceCentre = await ServiceCentre.findOne({ address: availableAt });
            
            if (!serviceCentre) {
                return res.status(404).json({ 
                    message: 'Service centre not found at this address. Please create the service centre first.' 
                });
            }
        } else {
            return res.status(403).json({ 
                message: 'You do not have permission to create services' 
            });
        }
        const service = new Service({
            serviceName,
            price: parseFloat(price),
            photos,
            videos,
            availableAt: [serviceCentre._id],
            serviceCentres: [serviceCentre._id],
            contact,
            mostBooked: mostBooked === 'true' || mostBooked === true
        });

        await service.save();
        
        console.log('Service created successfully:', service._id);
        
        res.status(201).json({ 
            message: 'Service created successfully', 
            service,
            serviceCentre: {
                id: serviceCentre._id,
                name: serviceCentre.name
            }
        });
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
export const updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(200).json({ message: 'Service updated successfully', service });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const getServicesByCentre = async (req, res) => {
    try {
        const { centreId } = req.params;
        const services = await Service.find({ availableAt: centreId }).populate('availableAt', 'name address');
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
export const getMostBookedServices = async (req, res) => {
    try {
        const services = await Service.find({ mostBooked: true }).populate('availableAt', 'name address');
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};