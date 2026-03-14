

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ServiceCentre from './models/ServiceCentres.js';

dotenv.config();

const sampleServiceCenters = [
    {
        name: "Star Mobile Care",
        ownerName: "Rajesh Kumar",
        ownerContact: "+91 9876543210",
        address: "123 Main Street, Sector 15, Delhi",
        servicesAvailable: ["Mobile Repair", "Tablet Repair", "Screen Replacement"],
        contact: "+91 9876543210",
        rating: 4.5,
        starRating: 4.5,
        mainServices: ["Mobile Repair", "Screen Replacement"],
        openingTime: "09:00 AM",
        closingTime: "08:00 PM",
        reviews: ["Great service!", "Fast and reliable"],
        email: "star.mobile@example.com",
        gstin: "29ABCDE1234F1Z5",
        photos: ["https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop"],
        videos: []
    },
    {
        name: "Cool AC Services",
        ownerName: "Amit Sharma",
        ownerContact: "+91 9876543211",
        address: "456 Downtown Market, Connaught Place, Delhi",
        servicesAvailable: ["AC Repair", "AC Installation", "AC Maintenance"],
        contact: "+91 9876543211",
        rating: 4.8,
        starRating: 4.8,
        mainServices: ["AC Repair", "AC Installation"],
        openingTime: "08:00 AM",
        closingTime: "09:00 PM",
        reviews: ["Excellent work", "Very professional"],
        email: "cool.ac@example.com",
        gstin: "29ABCDE1234F2Z5",
        photos: ["https://images.unsplash.com/photo-1631545806609-70cf8cfe5421?w=400&h=300&fit=crop"],
        videos: []
    },
    {
        name: "Fresh Fridge Fix",
        ownerName: "Priya Singh",
        ownerContact: "+91 9876543212",
        address: "789 Near City Mall, Rohini, Delhi",
        servicesAvailable: ["Fridge Repair", "Freezer Repair", "Refrigerator Maintenance"],
        contact: "+91 9876543212",
        rating: 4.3,
        starRating: 4.3,
        mainServices: ["Fridge Repair", "Refrigerator Maintenance"],
        openingTime: "09:30 AM",
        closingTime: "07:30 PM",
        reviews: ["Good service", "Affordable pricing"],
        email: "fresh.fridge@example.com",
        gstin: "29ABCDE1234F3Z5",
        photos: ["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop"],
        videos: []
    },
    {
        name: "QuickFix Electricians",
        ownerName: "Vikram Reddy",
        ownerContact: "+91 9876543213",
        address: "321 Model Town, Delhi",
        servicesAvailable: ["Electrical Repair", "Wiring", "Circuit Installation"],
        contact: "+91 9876543213",
        rating: 4.6,
        starRating: 4.6,
        mainServices: ["Electrical Repair", "Wiring"],
        openingTime: "08:00 AM",
        closingTime: "08:00 PM",
        reviews: ["Expert electricians", "Prompt service"],
        email: "quickfix.electric@example.com",
        gstin: "29ABCDE1234F4Z5",
        photos: ["https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop"],
        videos: []
    },
    {
        name: "Perfect Plumbing Solutions",
        ownerName: "Suresh Patel",
        ownerContact: "+91 9876543214",
        address: "654 Dwarka Sector 12, Delhi",
        servicesAvailable: ["Plumbing", "Pipe Repair", "Leak Fixing"],
        contact: "+91 9876543214",
        rating: 4.7,
        starRating: 4.7,
        mainServices: ["Plumbing", "Leak Fixing"],
        openingTime: "07:00 AM",
        closingTime: "07:00 PM",
        reviews: ["Reliable plumbers", "Fair pricing"],
        email: "perfect.plumbing@example.com",
        gstin: "29ABCDE1234F5Z5",
        photos: ["https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop"],
        videos: []
    },
    {
        name: "Wash Master Services",
        ownerName: "Anjali Verma",
        ownerContact: "+91 9876543215",
        address: "987 Janakpuri, Delhi",
        servicesAvailable: ["Washing Machine Repair", "Dryer Repair", "Appliance Maintenance"],
        contact: "+91 9876543215",
        rating: 4.4,
        starRating: 4.4,
        mainServices: ["Washing Machine Repair", "Dryer Repair"],
        openingTime: "09:00 AM",
        closingTime: "06:00 PM",
        reviews: ["Quick turnaround", "Quality repairs"],
        email: "wash.master@example.com",
        gstin: "29ABCDE1234F6Z5",
        photos: ["https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=400&h=300&fit=crop"],
        videos: []
    }
];

const seedServiceCenters = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
        const result = await ServiceCentre.insertMany(sampleServiceCenters);
        console.log(`✅ ${result.length} service centers added successfully!`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding service centers:', error.message);
        process.exit(1);
    }
};

seedServiceCenters();