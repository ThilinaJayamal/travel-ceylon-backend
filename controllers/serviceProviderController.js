import { generateToken } from "../config/generateToken.js";
import serviceProviderModel from "../models/ServiceProvider.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
    try {
        const { email, password, serviceType, serviceId, verify } = req.body;

        const existingUser = await serviceProviderModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const user = await serviceProviderModel.create({
            email,
            password: hashPassword,
            serviceType,
            serviceId,
            verify,
        });

        const token = generateToken(user._id, "provider");

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            _id: user._id,
            email: user.email,
            serviceType: user.serviceType,
            serviceId: user.serviceId,
            verify: user.verify,
            role: "provider"
        });

    } catch (error) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const updateServiceProvider = async (req, res) => {
    try {
         if (req.role !== "provider") {
            return res.status(401).json({ message: "You are not allowed to acess" })
        }
        
        const serviceProvider = await serviceProviderModel.findById(req.user);
        if (!serviceProvider) {
            return res.status(404).json({ message: "Service provider account not found" });
        }

        if (req.body.email) {
            serviceProvider.email = req.body.email;
        }
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            serviceProvider.password = await bcrypt.hash(req.body.password, salt);
        }

        await serviceProvider.save();

        res.status(200).json({
            _id: serviceProvider._id,
            email: serviceProvider.email,
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


// export const verifyAccount = async (req, res) => {
//     const { serviceProviderId } = req.params;
//     try {
//         const serviceProvider = await serviceProviderModel.findById(serviceProviderId);
//         if (!serviceProvider) {
//             return res.status(404).json({ message: "Service provider account not found" });
//         }

//         serviceProvider.verify = true;
//         await serviceProvider.save();

//         res.status(200).json({ message: "Account verified successfully" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error" });
//     }
// };



export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await serviceProviderModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user._id, "provider");

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            _id: user._id,
            email: user.email,
            serviceType: user.serviceType,
            serviceId: user.serviceId,
            verify: user.verify,
            role: "provider"
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


export const getMe = async (req, res) => {
    try {
        if (req.role !== "provider") {
            return res.status(401).json({ message: "You are not allowed to acess" })
        }

        const provider = await serviceProviderModel.findById(req.user).select("-password");
        if (!provider) {
            return res.status(404).json({ message: "profile not found" })
        }

        return res.status(200).json({
            success: true,
            profile: provider,
            role:"provider"
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "Server error" });
    }
}