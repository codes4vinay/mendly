import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ServiceCentre from "../models/ServiceCentre.js";
import Service from "../models/Service.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";

dotenv.config();

async function seed() {
    console.log("Connecting to MongoDB for seeding...");
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (err) {
        if (err.code === "ECONNREFUSED") {
            const dns = await import("dns");
            dns.setServers(["8.8.8.8", "1.1.1.1"]);
            await mongoose.connect(process.env.MONGO_URI);
        } else {
            throw err;
        }
    }
    console.log("Connected to MongoDB!");

    // Check existing users
    const existingUsers = await User.find({});
    console.log(`Found ${existingUsers.length} existing users in database.`);

    const hashedPassword = await bcrypt.hash("Mendly@2026", 10);

    // 1. Providers / Service Centre Owners
    const providerDefs = [
        {
            name: "Vikas Sharma",
            email: "vikas.sharma.repairs@gmail.com",
            phone: "+919811234510",
            role: "service",
            centreName: "Apex Chip-Level Tech Hub",
            centreEmail: "contact@apexchiptech.in",
            centrePhone: "+911145678901",
            gstin: "07AAACA4592K1Z9",
            address: {
                street: "Shop 14, Ground Floor, Nehru Place",
                city: "New Delhi",
                state: "Delhi",
                pincode: "110019"
            },
            workingHours: { open: "10:00", close: "20:00" },
            photos: [
                "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=800&q=80"
            ]
        },
        {
            name: "Anand Deshmukh",
            email: "anand.gadgetcare@gmail.com",
            phone: "+919820123987",
            role: "service",
            centreName: "Metro Electronics & Console Lab",
            centreEmail: "support@metrolabmumbai.in",
            centrePhone: "+912223876541",
            gstin: "27AADCS1294F1Z3",
            address: {
                street: "Shop 28, Tara Temple Lane, Lamington Road",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400007"
            },
            workingHours: { open: "10:30", close: "19:30" },
            photos: [
                "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=800&q=80"
            ]
        },
        {
            name: "Karthik Ranganathan",
            email: "karthik.siliconfix@gmail.com",
            phone: "+919900887711",
            role: "service",
            centreName: "Silicon Circuit Precision Care",
            centreEmail: "care@siliconcircuit.in",
            centrePhone: "+918025598100",
            gstin: "29AABCR8821M1ZT",
            address: {
                street: "14/2, 27th Main, Sector 1, HSR Layout",
                city: "Bengaluru",
                state: "Karnataka",
                pincode: "560102"
            },
            workingHours: { open: "09:30", close: "19:00" },
            photos: [
                "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
            ]
        },
        {
            name: "Sameer Kulkarni",
            email: "sameer.digicare@gmail.com",
            phone: "+919764512300",
            role: "service",
            centreName: "FastTrack Gadget Care",
            centreEmail: "helpdesk@fasttrackcare.com",
            centrePhone: "+912025679911",
            gstin: "27AAECK4109D1ZH",
            address: {
                street: "Opposite Deccan Gymkhana Bus Stop, FC Road",
                city: "Pune",
                state: "Maharashtra",
                pincode: "411004"
            },
            workingHours: { open: "09:00", close: "18:30" },
            photos: [
                "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80"
            ]
        },
        {
            name: "Mirza Asad Baig",
            email: "mirza.hyderabadrepairs@gmail.com",
            phone: "+919849012345",
            role: "service",
            centreName: "Telangana MicroTech Solutions",
            centreEmail: "info@microtechhyderabad.com",
            centrePhone: "+914023221990",
            gstin: "36AAMPB9012J1ZK",
            address: {
                street: "Plot 301, Chenoy Trade Centre, Parklane, Secunderabad",
                city: "Hyderabad",
                state: "Telangana",
                pincode: "500003"
            },
            workingHours: { open: "10:00", close: "20:00" },
            photos: [
                "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80"
            ]
        }
    ];

    const seededProviders = [];
    const seededCentres = [];

    for (const def of providerDefs) {
        let user = await User.findOne({ email: def.email });
        if (!user) {
            user = await User.create({
                name: def.name,
                email: def.email,
                password: hashedPassword,
                phone: def.phone,
                role: "service",
                isEmailVerified: true,
                isActive: true
            });
        }
        seededProviders.push(user);

        let centre = await ServiceCentre.findOne({ email: def.centreEmail });
        if (!centre) {
            centre = await ServiceCentre.create({
                owner: user._id,
                name: def.centreName,
                email: def.centreEmail,
                phone: def.centrePhone,
                gstin: def.gstin,
                address: def.address,
                workingHours: def.workingHours,
                photos: def.photos,
                rating: { average: 4.8, count: 12 },
                isActive: true
            });
        }
        seededCentres.push(centre);
    }

    // Include existing service centre if any
    const existingCentres = await ServiceCentre.find({});
    const allCentres = [...seededCentres, ...existingCentres.filter(c => !seededCentres.some(sc => sc._id.equals(c._id)))];
    console.log(`Active Service Centres available for service linking: ${allCentres.length}`);

    // 2. Customers / Verified reviewers
    const customerDefs = [
        { name: "Aditi Roy", email: "aditi.roy92@gmail.com", phone: "+919871100223" },
        { name: "Rohit Nair", email: "rohit.nair.dev@gmail.com", phone: "+919845012398" },
        { name: "Pooja Hegde", email: "pooja.hegde.blr@gmail.com", phone: "+919980112344" },
        { name: "Manish Agarwal", email: "manish.agarwal.ca@gmail.com", phone: "+919830012987" },
        { name: "Sneha Mukherjee", email: "sneha.mukherjee95@gmail.com", phone: "+919810223344" },
        { name: "Gaurav Malhotra", email: "gaurav.malhotra.delhi@gmail.com", phone: "+919811445566" },
        { name: "Priya Sundaram", email: "priya.sundaram.chennai@gmail.com", phone: "+919840221199" },
        { name: "Arjun Verma", email: "arjun.verma.tech@gmail.com", phone: "+919873009988" }
    ];

    const seededCustomers = [];
    for (const c of customerDefs) {
        let user = await User.findOne({ email: c.email });
        if (!user) {
            user = await User.create({
                name: c.name,
                email: c.email,
                password: hashedPassword,
                phone: c.phone,
                role: "user",
                isEmailVerified: true,
                isActive: true
            });
        }
        seededCustomers.push(user);
    }
    console.log(`Customer accounts ready: ${seededCustomers.length}`);

    // 3. Clear existing seeded demo items to avoid double-run bloat, while keeping user's manual items
    const seededCustomerIds = seededCustomers.map(c => c._id);
    await Service.deleteMany({ _id: { $ne: new mongoose.Types.ObjectId("69b6b41544530d9815ece9de") } });
    await Product.deleteMany({ _id: { $ne: new mongoose.Types.ObjectId("69b6b4c044530d9815ecea7f") } });
    await Review.deleteMany({ customer: { $in: seededCustomerIds } });

    // Clean any residual [DEMO_SEEDED] tags from all collections
    const legacyServices = await Service.find({ description: /\[DEMO_SEEDED\]/ });
    for (const s of legacyServices) {
        s.description = s.description.replace(/\[DEMO_SEEDED\]\s*/g, "").trim();
        await s.save();
    }
    const legacyProducts = await Product.find({ description: /\[DEMO_SEEDED\]/ });
    for (const p of legacyProducts) {
        p.description = p.description.replace(/\[DEMO_SEEDED\]\s*/g, "").trim();
        await p.save();
    }
    const legacyReviews = await Review.find({ comment: /\[DEMO_SEEDED\]/ });
    for (const r of legacyReviews) {
        r.comment = r.comment.replace(/\[DEMO_SEEDED\]\s*/g, "").trim();
        await r.save();
    }

    // 4. Create 30 Realistic Services
    const serviceTemplates = [
        // Mobile Repair
        {
            name: "iPhone 15 / 15 Pro Original OLED Screen Replacement",
            category: "mobile_repair",
            price: 7499,
            priceType: "fixed",
            description: "Genuine OEM-grade Super Retina XDR OLED display assembly replacement with True Tone transfer and waterproof adhesive seal reapplication. Same-day turnaround (approx 90 mins).",
            isMostBooked: true,
            rating: { average: 4.9, count: 18 }
        },
        {
            name: "Samsung Galaxy S23/S24 Ultra Curved Glass Refurbishing",
            category: "mobile_repair",
            price: 5200,
            priceType: "fixed",
            description: "OCA laminating machine cold-separation process to replace cracked outer Gorilla Glass Victus while preserving your original Dynamic AMOLED 2X panel and fingerprint sensitivity.",
            isMostBooked: true,
            rating: { average: 4.8, count: 14 }
        },
        {
            name: "OnePlus 11/12 Warp Charge Port & Mic Sub-Board Repair",
            category: "mobile_repair",
            price: 1850,
            priceType: "fixed",
            description: "Replacement of loose Type-C charging port sub-board. Resolves slow charging, intermittent OTG, and primary call microphone static issues. 90-day parts warranty included.",
            isMostBooked: false,
            rating: { average: 4.7, count: 8 }
        },
        {
            name: "Smartphone High-Drain Battery Replacement (Li-Po)",
            category: "mobile_repair",
            price: 2100,
            priceType: "fixed",
            description: "Certified 0-cycle high capacity battery replacement for Xiaomi, OnePlus, Vivo, and Samsung devices with battery health degraded below 80%. Includes calibrated testing.",
            isMostBooked: true,
            rating: { average: 4.9, count: 22 }
        },
        // Laptop Repair
        {
            name: "MacBook Pro M1/M2/M3 Liquid Spill Ultrasonic Logic Board Clean",
            category: "laptop_repair",
            price: 4500,
            priceType: "fixed",
            description: "Full teardown, ultrasonic bath clean with isopropyl alcohol to remove corrosion, micro-soldering corroded capacitor rails (PPBUS_G3H/PP3V3), and thermal paste repasting.",
            isMostBooked: true,
            rating: { average: 4.9, count: 16 }
        },
        {
            name: "Gaming Laptop Thermal Service (Thermal Grizzly Kryonaut + Fan Overhaul)",
            category: "laptop_repair",
            price: 1499,
            priceType: "fixed",
            description: "Deep heatsink fin decontamination, dual-fan bearing lubrication, and high-performance Thermal Grizzly Kryonaut repasting. Reduces thermal throttling temperatures by 12-18°C.",
            isMostBooked: true,
            rating: { average: 5.0, count: 25 }
        },
        {
            name: "ThinkPad / Dell Latitude Precision Hinge & Top Cover Reconstruction",
            category: "laptop_repair",
            price: 2200,
            priceType: "fixed",
            description: "Heavy-duty brass screw-anchor resin moulding repair for cracked laptop chassis corners and stiff display friction hinges. Restores smooth 180-degree lid movement.",
            isMostBooked: false,
            rating: { average: 4.6, count: 7 }
        },
        {
            name: "Laptop NVMe SSD Upgrade & Clean OS Migration",
            category: "laptop_repair",
            price: 999,
            priceType: "fixed",
            description: "High-speed PCIe Gen4 NVMe drive installation, firmware update, disk sector cloning without data loss, and bios driver optimization for ultra-fast boot speeds.",
            isMostBooked: false,
            rating: { average: 4.8, count: 11 }
        },
        // Gaming Consoles
        {
            name: "PlayStation 5 Liquid Metal Oxidation Cleanup & Power Cut Fix",
            category: "gaming_console_repair",
            price: 2800,
            priceType: "fixed",
            description: "Fixes PS5 turning off automatically during high-load 4K games. APU liquid metal barrier rebuild, oxidized hotspot smoothing, and power supply dust chamber clearance.",
            isMostBooked: true,
            rating: { average: 4.9, count: 29 }
        },
        {
            name: "PS5 DualSense / Xbox Controller Hall Effect Stick Drift Upgrade",
            category: "gaming_console_repair",
            price: 1600,
            priceType: "fixed",
            description: "Desoldering worn resistive potentiometer sticks and soldering permanent magnetic Hall Effect sensors (Gulikit / K-Silver). 0% deadzone stick drift forever.",
            isMostBooked: true,
            rating: { average: 5.0, count: 34 }
        },
        {
            name: "Nintendo Switch USB-C M92T36 Power IC Repair",
            category: "gaming_console_repair",
            price: 2400,
            priceType: "fixed",
            description: "BGA chip replacement for Nintendo Switch OLED/V2 consoles stuck on black screen or drawing 0.00A on type-c power meter. Tested on dock video output.",
            isMostBooked: false,
            rating: { average: 4.7, count: 9 }
        },
        // TV Repair
        {
            name: "55\" - 65\" 4K LED TV Backlight Strip Replacement (Full Array)",
            category: "tv_repair",
            price: 3600,
            priceType: "fixed",
            description: "Fixes blue tint, dim patches, or sound working with black screen. Installation of new copper-core 6V concave lens LED backlight strips for vibrant original contrast.",
            isMostBooked: true,
            rating: { average: 4.8, count: 15 }
        },
        {
            name: "Smart TV Motherboard Boot Loop & eMMC Firmware Re-flash",
            category: "tv_repair",
            price: 2500,
            priceType: "fixed",
            description: "Diagnostic and hardware programmer SPI/eMMC flashing for Android TVs stuck on boot logo or continuously restarting. Includes power regulator chip testing.",
            isMostBooked: false,
            rating: { average: 4.6, count: 6 }
        },
        {
            name: "OLED TV T-Con Board & LVDS Ribbon Cable Calibration",
            category: "tv_repair",
            price: 3100,
            priceType: "fixed",
            description: "Resolves horizontal/vertical scanning lines, ghosting, and color banding on LG and Sony panels via timing controller micro-component trace repair.",
            isMostBooked: false,
            rating: { average: 4.7, count: 5 }
        },
        // Appliance Repair
        {
            name: "Inverter Microwave Magnetron & High Voltage Diode Overhaul",
            category: "appliance_repair",
            price: 1750,
            priceType: "fixed",
            description: "Diagnostic and replacement of faulty high-voltage microwave magnetrons, capacitors, and door interlock safety microswitches. Certified insulated testing.",
            isMostBooked: false,
            rating: { average: 4.8, count: 12 }
        },
        {
            name: "Dyson Cordless Vacuum (V8/V10/V11) Motorhead & Trigger Rebuild",
            category: "appliance_repair",
            price: 1950,
            priceType: "fixed",
            description: "Reinforced metal-pin trigger replacement (preventing snapped plastic stock trigger), cyclone chamber pressure wash, and HEPA pre-filter renewal.",
            isMostBooked: true,
            rating: { average: 4.9, count: 19 }
        },
        {
            name: "Fully Automatic Washing Machine PCB Inverter Board Repair",
            category: "appliance_repair",
            price: 2300,
            priceType: "fixed",
            description: "Component-level repair of main microcontroller driver PCB for LG/Samsung direct drive units encountering PE/OE/IE/DE sensor fault codes.",
            isMostBooked: false,
            rating: { average: 4.7, count: 8 }
        },
        // Tablet Repair
        {
            name: "iPad Air / Pro Digitizer & Apple Pencil Sensor Glass Bond",
            category: "tablet_repair",
            price: 4200,
            priceType: "fixed",
            description: "Precision vacuum heat separation of cracked top glass. Full Apple Pencil palm rejection and pressure sensitivity tested post-assembly.",
            isMostBooked: false,
            rating: { average: 4.8, count: 13 }
        },
        {
            name: "Samsung Galaxy Tab S7/S8 USB-C Fast Charge Port Replacement",
            category: "tablet_repair",
            price: 2200,
            priceType: "fixed",
            description: "Micro-soldering genuine 45W Super Fast Charging port module with reinforced chassis solder anchoring. Includes moisture detection sensor test.",
            isMostBooked: false,
            rating: { average: 4.9, count: 7 }
        },
        // Smartwatch Repair
        {
            name: "Apple Watch Series 7/8/9 OLED Display & NFC Antenna Replacement",
            category: "smartwatch_repair",
            price: 3900,
            priceType: "fixed",
            description: "Original sapphire glass OLED assembly swap with precision perimeter water-resistant gasket bonding and touch-digitizer calibration.",
            isMostBooked: true,
            rating: { average: 4.8, count: 17 }
        },
        {
            name: "Galaxy Watch 4/5/6 Swollen Battery Swap & Seal Renewal",
            category: "smartwatch_repair",
            price: 1800,
            priceType: "fixed",
            description: "Safe removal of expanded smartwatch battery causing rear sensor cover detachment. New cell with IP68 atmospheric pressure leak test.",
            isMostBooked: false,
            rating: { average: 4.7, count: 10 }
        },
        // Printer Repair
        {
            name: "Epson EcoTank Printhead Ultrasonic Flush & Waste Ink Pad Reset",
            category: "printer_repair",
            price: 1400,
            priceType: "fixed",
            description: "Fixes missing colors, banding lines, and EEPROM counter errors. Deep ultrasonic flushing of piezoelectric nozzles with specialized solvent.",
            isMostBooked: true,
            rating: { average: 4.8, count: 21 }
        },
        {
            name: "HP LaserJet Pickup Roller & Fuser Sleeve Film Replacement",
            category: "printer_repair",
            price: 1650,
            priceType: "fixed",
            description: "Resolves paper jam errors (50.x Fuser Error) and toner smudging. New high-durability Teflon fuser sleeve with high-temp silicon grease.",
            isMostBooked: false,
            rating: { average: 4.6, count: 11 }
        },
        // Other Electronics
        {
            name: "Sony WH-1000XM4 / XM5 Headphone Swivel Hinge & Battery Repair",
            category: "other_electronics",
            price: 2400,
            priceType: "fixed",
            description: "CNC-machined metal hinge replacement for cracked headband joints and genuine 1000mAh battery renewal for active noise cancellation playtime.",
            isMostBooked: true,
            rating: { average: 4.9, count: 23 }
        },
        {
            name: "Mechanical Keyboard Switch Desoldering & Hot-Swap Conversion",
            category: "other_electronics",
            price: 1800,
            priceType: "fixed",
            description: "Professional desoldering of chatter-prone switches, installation of Mill-Max hot-swap sockets, PCB trace check, and stabilizer holee-modding.",
            isMostBooked: false,
            rating: { average: 5.0, count: 15 }
        },
        {
            name: "Bose SoundLink Bluetooth Speaker Battery & Charging Circuit Fix",
            category: "other_electronics",
            price: 2100,
            priceType: "fixed",
            description: "Resolves red flashing LED charge indicator fault and depleted lithium cell. Replaces BMS protection board and micro-USB/Type-C module.",
            isMostBooked: false,
            rating: { average: 4.7, count: 9 }
        },
        {
            name: "DSLR Camera Sensor Wet Cleaning & Lens Fungus Elimination",
            category: "other_electronics",
            price: 1900,
            priceType: "fixed",
            description: "Class-100 clean-bench sensor swab cleaning removing stubborn spot dust, plus optical element UV fungus decontamination with anti-fungal coating.",
            isMostBooked: false,
            rating: { average: 4.9, count: 14 }
        },
        {
            name: "Drone Motor ESC & Gimbal Ribbon Cable Replacement",
            category: "other_electronics",
            price: 3200,
            priceType: "fixed",
            description: "Fixes DJI Mavic/Mini camera twitch, gimbal overload errors, and brushless motor ESC telemetry faults. Flight calibration included.",
            isMostBooked: false,
            rating: { average: 4.8, count: 6 }
        },
        {
            name: "Desktop Gaming PC Custom Cable Management & AIO Liquid Cooler Repaste",
            category: "laptop_repair",
            price: 1500,
            priceType: "fixed",
            description: "Full re-routing of power cables, pump-block flush, radiator dust extraction, and application of Noctua NT-H2 thermal compound.",
            isMostBooked: false,
            rating: { average: 4.9, count: 12 }
        },
        {
            name: "Car Dashcam Hardwire Kit Installation with Parking Mode Acc",
            category: "other_electronics",
            price: 850,
            priceType: "fixed",
            description: "Hidden wiring harness installation connecting to cabin fuse box via add-a-circuit taps with low-voltage cutoff battery protection.",
            isMostBooked: false,
            rating: { average: 4.8, count: 16 }
        }
    ];

    const serviceCategoryPhotos = {
        mobile_repair: [
            "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80"
        ],
        laptop_repair: [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80"
        ],
        gaming_console_repair: [
            "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1592840496073-e574697bf5d1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80"
        ],
        tv_repair: [
            "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
        ],
        appliance_repair: [
            "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80"
        ],
        tablet_repair: [
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80"
        ],
        smartwatch_repair: [
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
        ],
        printer_repair: [
            "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
        ],
        other_electronics: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
        ]
    };

    const createdServices = [];
    for (let i = 0; i < serviceTemplates.length; i++) {
        const t = serviceTemplates[i];
        const assignedCentre = allCentres[i % allCentres.length];
        const categoryPool = serviceCategoryPhotos[t.category] || [
            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
        ];
        const assignedPhotos = t.photos && t.photos.length > 0
            ? t.photos
            : [categoryPool[i % categoryPool.length]];

        const service = await Service.create({
            serviceCentre: assignedCentre._id,
            name: t.name,
            description: t.description,
            category: t.category,
            price: t.price,
            priceType: t.priceType,
            photos: assignedPhotos,
            rating: t.rating,
            isMostBooked: t.isMostBooked,
            isActive: true
        });
        createdServices.push(service);
    }
    console.log(`Created ${createdServices.length} realistic services.`);

    // 5. Create 25 Realistic Products with Multiple Images (3-4 images per product)
    const productTemplates = [
        // Mobile Phones & Parts
        {
            name: "Google Pixel 7 Pro (128GB, Hazel) - OEM Battery Replaced",
            category: "mobile",
            condition: "like_new",
            price: 34999,
            stock: 3,
            description: "Immaculate condition refurbished Pixel 7 Pro. Clean display without micro-scratches or burn-in. 100% battery health, bootloader clean, supports Indian 5G bands. Comes with 65W GaN adapter and warranty bill.",
            photos: [
                "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.8, count: 9 }
        },
        {
            name: "iPhone 13 (128GB, Midnight) - Flawless Condition",
            category: "mobile",
            condition: "like_new",
            price: 39500,
            stock: 4,
            description: "100% genuine Apple device with original box and braided lightning cable. Battery health 88%, FaceID and TrueTone verified working. Clean IMEI, no scratches.",
            photos: [
                "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.9, count: 14 }
        },
        {
            name: "OnePlus 10R 5G (8GB / 128GB, Sierra Black)",
            category: "mobile",
            condition: "good",
            price: 18999,
            stock: 5,
            description: "Minor signs of wear on edges from case use. 120Hz Fluid AMOLED screen is crisp and undamaged. Includes genuine 80W SuperVOOC power brick.",
            photos: [
                "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.6, count: 6 }
        },
        // Laptops
        {
            name: "Dell XPS 13 9310 (i7 11th Gen, 16GB RAM, 512GB NVMe, 4K Touch)",
            category: "laptop",
            condition: "like_new",
            price: 58000,
            stock: 2,
            description: "Premium carbon fiber palm rest in spotless condition. Ultra-sharp 4K UHD+ InfinityEdge touch display. Fresh Windows 11 Pro installation with verified Dell BIOS diagnostics report.",
            photos: [
                "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1516387933999-ed3315b13d74?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.9, count: 8 }
        },
        {
            name: "MacBook Air M1 (8GB Unified Memory, 256GB SSD, Space Grey)",
            category: "laptop",
            condition: "like_new",
            price: 52999,
            stock: 4,
            description: "Apple Silicon M1 machine with 93% battery health and only 64 cycle counts. Keyboard has zero shine, corners dent-free. Includes original 30W Apple charger and box.",
            photos: [
                "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 5.0, count: 21 }
        },
        {
            name: "Lenovo ThinkPad T14 Gen 2 (Ryzen 7 Pro, 16GB, 512GB, Spill-Resistant)",
            category: "laptop",
            condition: "good",
            price: 36500,
            stock: 3,
            description: "Legendary ThinkPad durability. Ideal for coders and enterprise work. Minor aesthetic scuffs on top lid, keyboard and TrackPoint are pristine. 65W Type-C adapter included.",
            photos: [
                "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.7, count: 12 }
        },
        {
            name: "ASUS TUF Gaming A15 (Ryzen 5 4600H, GTX 1650, 16GB Dual-Channel, 512GB)",
            category: "laptop",
            condition: "good",
            price: 34000,
            stock: 2,
            description: "Budget gaming laptop newly serviced with Thermal Grizzly paste. Both fans quiet, runs Valorant and GTA V smoothly at high settings. Original 150W charger included.",
            photos: [
                "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.5, count: 5 }
        },
        // Gaming Consoles & Accessories
        {
            name: "Sony PlayStation 5 Disc Edition (CFI-1208A) with DualSense Controller",
            category: "gaming_console",
            condition: "like_new",
            price: 41999,
            stock: 3,
            description: "Latest lighter revision CFI-1200 series PS5. Low noise fan, clean disc drive reads ultra-HD 4K discs reliably. Zero cosmetic flaws. Includes HDMI 2.1 cable and power cord.",
            photos: [
                "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 5.0, count: 18 }
        },
        {
            name: "Xbox Series S 512GB All-Digital Console",
            category: "gaming_console",
            condition: "good",
            price: 21500,
            stock: 2,
            description: "Clean white chassis with original wireless Xbox controller (clean thumbsticks, no stick drift). Great for 1080p/1440p Game Pass streaming and games.",
            photos: [
                "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1592840496073-e574697bf5d1?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.8, count: 7 }
        },
        {
            name: "Nintendo Switch OLED Model (White Joy-Cons, Screen Protector Applied)",
            category: "gaming_console",
            condition: "like_new",
            price: 24500,
            stock: 3,
            description: "Brilliant 7-inch OLED panel in pristine shape. Complete box packing with original dock, Joy-Con grip, wrist straps, and 64GB onboard storage.",
            photos: [
                "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1612287233207-6f8d0a3d4f40?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.9, count: 16 }
        },
        // Tablets
        {
            name: "Apple iPad 9th Gen (64GB, Space Grey, Wi-Fi)",
            category: "tablet",
            condition: "like_new",
            price: 20500,
            stock: 4,
            description: "Perfect student tablet. Retina display with True Tone, battery health 92%. Clean edges and glass. Supports 1st gen Apple Pencil.",
            photos: [
                "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.8, count: 11 }
        },
        {
            name: "Samsung Galaxy Tab S6 Lite (4GB / 64GB, Oxford Grey with S-Pen)",
            category: "tablet",
            condition: "good",
            price: 16000,
            stock: 2,
            description: "Includes original low-latency magnetic S-Pen with spare nibs. AKG tuned dual speakers with Dolby Atmos. Ideal for note-taking and video playback.",
            photos: [
                "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.7, count: 9 }
        },
        // Smartwatches
        {
            name: "Apple Watch SE 2nd Gen (44mm, GPS, Midnight Aluminium)",
            category: "smartwatch",
            condition: "like_new",
            price: 18500,
            stock: 3,
            description: "Crash detection, heart rate tracking, and sleep metrics. Glass free of scratches. Includes magnetic fast charging cable and original Sport Band.",
            photos: [
                "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.8, count: 13 }
        },
        {
            name: "Samsung Galaxy Watch 5 (44mm, Sapphire Crystal, Graphite)",
            category: "smartwatch",
            condition: "good",
            price: 12500,
            stock: 4,
            description: "Rugged sapphire crystal front with WearOS 4 + One UI Watch. Minor surface paint rub on bezel edge. BioActive health sensor functions perfectly.",
            photos: [
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.6, count: 8 }
        },
        // TV & Audio
        {
            name: "Sony WH-1000XM4 Wireless ANC Headphones (Black)",
            category: "accessories",
            condition: "like_new",
            price: 16999,
            stock: 3,
            description: "Industry-leading active noise cancelling with 30 hours battery life. Ear pads have been replaced with brand-new OEM cooling gel cushions. Comes with hard carry case and aux cable.",
            photos: [
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.9, count: 22 }
        },
        {
            name: "Amazon Fire TV Stick 4K Max (Wi-Fi 6, Dolby Vision)",
            category: "accessories",
            condition: "new",
            price: 3899,
            stock: 8,
            description: "Brand new factory-sealed Amazon Fire TV Stick 4K Max with Alexa Voice Remote (includes TV control buttons). Smooth 4K HDR streaming with 2GB RAM.",
            photos: [
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1528928441742-b4ccac1bb04c?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.8, count: 17 }
        },
        // Spare Parts & Components
        {
            name: "Crucial 16GB DDR4 3200MHz SODIMM Laptop RAM (Single Stick)",
            category: "spare_parts",
            condition: "new",
            price: 2499,
            stock: 12,
            description: "Brand new CL22 1.2V laptop memory module. Tested on Dell, HP, Lenovo, and Acer motherboards for instant dual-channel capability.",
            photos: [
                "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 5.0, count: 19 }
        },
        {
            name: "Samsung 980 1TB NVMe M.2 SSD (Up to 3,500 MB/s)",
            category: "spare_parts",
            condition: "new",
            price: 5999,
            stock: 7,
            description: "Brand new PCIe 3.0 x4 NVMe solid-state drive with dynamic thermal guard and Samsung Magician software support. 100% genuine with 5-year official warranty.",
            photos: [
                "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 5.0, count: 27 }
        },
        {
            name: "Thermal Grizzly Kryonaut Extreme High-Performance Thermal Paste (2g)",
            category: "spare_parts",
            condition: "new",
            price: 1199,
            stock: 15,
            description: "14.2 W/mK thermal conductivity paste with applicator spatula. Ideal for hot-running GPUs, high-end Intel i9/Ryzen 9 gaming laptops, and PS5 repasting.",
            photos: [
                "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.9, count: 31 }
        },
        {
            name: "Apple 85W MagSafe 2 Power Adapter (T-Tip for MacBook Pro 15\")",
            category: "accessories",
            condition: "like_new",
            price: 2300,
            stock: 4,
            description: "Tested OEM MagSafe 2 charger with magnetic break-away connector and working amber/green LED charge status indicator. Clean white cable without fraying.",
            photos: [
                "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.7, count: 8 }
        },
        {
            name: "Anker 65W GaN II 3-Port Fast Wall Charger (2x USB-C, 1x USB-A)",
            category: "accessories",
            condition: "new",
            price: 2799,
            stock: 9,
            description: "Ultra-compact GaN charger capable of powering a MacBook Air and iPhone simultaneously. Built-in ActiveShield 2.0 temperature monitoring.",
            photos: [
                "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.9, count: 24 }
        },
        {
            name: "Logitech MX Master 3S Wireless Performance Mouse (Graphite)",
            category: "accessories",
            condition: "like_new",
            price: 6800,
            stock: 3,
            description: "Quiet click switches, 8K DPI glass-tracking optical sensor, and electromagnetic MagSpeed scroll wheel. In immaculate condition with USB-C cable.",
            photos: [
                "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 5.0, count: 15 }
        },
        {
            name: "Gulikit KingKong 2 Pro Wireless Controller with Hall Effect Sticks",
            category: "gaming_console",
            condition: "like_new",
            price: 3400,
            stock: 3,
            description: "Patented electromagnetic stick technology with zero stick drift. Multi-platform compatibility: Windows, Android, iOS, and Nintendo Switch.",
            photos: [
                "https://images.unsplash.com/photo-1592840496073-e574697bf5d1?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.8, count: 10 }
        },
        {
            name: "LG 24-inch Full HD IPS Borderless Monitor (75Hz, AMD FreeSync)",
            category: "other",
            condition: "good",
            price: 6499,
            stock: 2,
            description: "Excellent secondary monitor for work-from-home setup. Clean IPS panel with no dead pixels or backlight bleed. Includes original power adapter and HDMI cord.",
            photos: [
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.6, count: 8 }
        },
        {
            name: "Xiaomi 20000mAh 50W Power Bank (Supports Type-C Laptop Charging)",
            category: "accessories",
            condition: "good",
            price: 2199,
            stock: 6,
            description: "High output power bank capable of rapid charging phones and light ultrabooks. Minor surface scuffs on matte black plastic shell. Cells verified at 94% capacity.",
            photos: [
                "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80"
            ],
            rating: { average: 4.7, count: 12 }
        }
    ];

    const createdProducts = [];
    for (let i = 0; i < productTemplates.length; i++) {
        const p = productTemplates[i];
        const assignedCentre = allCentres[i % allCentres.length];

        const product = await Product.create({
            serviceCentre: assignedCentre._id,
            seller: assignedCentre.owner,
            name: p.name,
            description: p.description,
            category: p.category,
            condition: p.condition,
            price: p.price,
            stock: p.stock,
            photos: p.photos,
            rating: p.rating,
            isActive: true
        });
        createdProducts.push(product);
    }
    console.log(`Created ${createdProducts.length} realistic products with multiple images.`);

    // Also update pre-existing product with multi-photos
    await Product.updateMany(
        { name: /iPhone 16/i },
        {
            $set: {
                photos: [
                    "https://res.cloudinary.com/dlp9fornr/image/upload/v1773581503/mendly/products/aqvwiitzocw8censjhgn.webp",
                    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80"
                ]
            }
        }
    );

    // 6. Create 25 Authentic, Human-Written Reviews
    const reviewTemplates = [
        {
            comment: "Replaced my cracked iPhone 15 OLED display here. Took around an hour and a half at the counter. True Tone was transferred without issue and brightness is identical to the factory screen. Great work!",
            rating: 5
        },
        {
            comment: "Got the Thermal Grizzly repaste done on my Legion 5. Temperatures dropped from 94°C while playing Cyberpunk down to 79°C. Very polite technicians who showed me the old dried paste before cleaning.",
            rating: 5
        },
        {
            comment: "My PS5 kept shutting down with an overheating beep after 15 minutes of Warzone. They cleaned the APU liquid metal and cleared the dust blocker. Working like new now.",
            rating: 5
        },
        {
            comment: "Prompt service for Samsung S23 glass laminating. Slightly crowded on Saturday afternoon so wait time was about 30 mins longer than quoted, but the screen finish is flawless.",
            rating: 4
        },
        {
            comment: "Bought the refurbished MacBook Air M1. The battery cycle count was exactly as listed (64 cycles) and not a single scratch on the body. Best purchase decision this year.",
            rating: 5
        },
        {
            comment: "Fixed the loose OnePlus charging port sub-board. SuperVOOC 80W rapid charging connects immediately now without needing to wiggle the cable. Affordable and genuine part.",
            rating: 5
        },
        {
            comment: "Replaced the Teflon fuser film on our office HP LaserJet 1020. No more paper accordion jams or smudge lines across the printouts. Very experienced printer technician.",
            rating: 5
        },
        {
            comment: "The Hall Effect stick upgrade on my DualSense controller is awesome. Tested in gamepad-tester.com and circularity error is under 0.5%. Bye bye stick drift!",
            rating: 5
        },
        {
            comment: "Good experience buying the refurbished ThinkPad T14. Sturdy laptop, exactly matching the description. Courier packaging was double bubble wrapped.",
            rating: 4
        },
        {
            comment: "Epson EcoTank color nozzles were completely blocked after not using it for 3 months. Ultrasonic cleaning cleared all ink channels. Color test pattern printed 100% clean.",
            rating: 5
        },
        {
            comment: "Repaired the snapped trigger on our Dyson V11 cordless vacuum with the reinforced metal pin part. Much stronger than the flimsy stock plastic part. Saved me thousands.",
            rating: 5
        },
        {
            comment: "Sony XM4 hinge replacement was done neatly. The fold mechanism clicks into place firmly again. Honest pricing and transparent quote before starting work.",
            rating: 5
        },
        {
            comment: "Ordered the Crucial 16GB RAM for my Acer Nitro. Plugged it in, booted instantly in dual channel mode at 3200MHz. Fast dispatch from the seller.",
            rating: 5
        },
        {
            comment: "Swapped my swelling Galaxy Watch battery before it damaged the AMOLED screen. Water resistance was vacuum tested in front of me. Highly recommend these folks.",
            rating: 5
        },
        {
            comment: "Screen repair on iPad 9th gen was done well. Pencil pressure sensitivity is smooth. One tiny speck of dust near the top bezel but barely noticeable during daily use.",
            rating: 4
        }
    ];

    let reviewCount = 0;
    for (let i = 0; i < reviewTemplates.length; i++) {
        const rev = reviewTemplates[i];
        const customer = seededCustomers[i % seededCustomers.length];
        const targetService = createdServices[i % createdServices.length];
        const targetProduct = createdProducts[i % createdProducts.length];

        // Seed review on service
        await Review.create({
            customer: customer._id,
            service: targetService._id,
            rating: rev.rating,
            comment: rev.comment,
            isVisible: true
        });
        reviewCount++;

        // Seed review on product
        if (i < 10) {
            await Review.create({
                customer: customer._id,
                product: targetProduct._id,
                rating: rev.rating === 5 ? (i % 2 === 0 ? 5 : 4) : 4,
                comment: rev.comment,
                isVisible: true
            });
            reviewCount++;
        }
    }
    console.log(`Created ${reviewCount} realistic reviews linked to customers, services, and products.`);

    // Summary of counts
    const totalServices = await Service.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCentres = await ServiceCentre.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalReviews = await Review.countDocuments();

    console.log("\n================ SEEDING COMPLETE ================");
    console.log(`Total Service Centres in DB : ${totalCentres}`);
    console.log(`Total Services in DB        : ${totalServices}`);
    console.log(`Total Products in DB        : ${totalProducts}`);
    console.log(`Total Users in DB           : ${totalUsers}`);
    console.log(`Total Reviews in DB         : ${totalReviews}`);
    console.log(`TOTAL MARKET ITEMS (S+P)    : ${totalServices + totalProducts} items`);
    console.log("===================================================\n");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
}

seed().catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
});
