import { generateToken } from "../config/generateToken.js";
import userModel from "../models/User.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { name, email, password, profilePic, phone } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await userModel.create({
      name,
      email,
      password: hashPassword,
      phone,
      profilePic,
    });

    // Generate token
    const token = generateToken(user._id, "user");

    // Send token as secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic,
      role: "user"
    });

  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id, "user");

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
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic,
      role: "user"
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
    if (req.role !== "user") {
      return res.status(401).json({ message: "You are not allowed to acess" })
    }

    const user = await userModel.findById(req.user).select("-password");
    if (!user) {
      return res.status(404).json({ message: "profile not found" })
    }

    return res.status(200).json({
      success: true,
      profile: user,
      role:"user"
    })
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
}


export const updateUser = async (req, res) => {
  try {
    if (req.role !== "user") {
      return res.status(401).json({ message: "You are not allowed to acess" })
    }
    
    const { name, email, password, profilePic, phone } = req.body;

    // Find the user
    const user = await userModel.findById(req?.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (profilePic) user.profilePic = profilePic;

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Save updated user
    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      profilePic: updatedUser.profilePic,
    });

  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};
