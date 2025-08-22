import { generateToken } from "../config/generateToken.js";
import serviceProviderModel from "../models/ServiceProvider.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
    try {
        const { email, password, serviceType, serviceId, verify } = req.body;

        // Check if user already exists
        const existingUser = await serviceProviderModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await serviceProviderModel.create({
            email,
            password: hashPassword,
            serviceType,
            serviceId,
            verify
        });

        // Generate token
        const token = generateToken(user._id);

        // Send token as secure cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            _id: user._id,
            email: user.email,
            serviceType: user.serviceType,
            serviceId: user.serviceId,
            verify: user.verify
        });

    } catch (error) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await serviceProviderModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate token
        const token = generateToken(user._id);

        // Set token as cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Send response
        res.status(200).json({
            _id: user._id,
            email: user.email,
            serviceType: user.serviceType,
            serviceId: user.serviceId,
            verify: user.verify
        });

    } catch (error) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};
