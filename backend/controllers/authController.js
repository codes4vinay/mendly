import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (role === "admin") return res.status(403).json({ message: "Cannot self-register as admin" });

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role });

        if (user) {
            res.status(201).json({ message: "User registered" });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt:", email, password);

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);

        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(user._id, user.role);
        res.json({ token, role: user.role, name: user.name });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
