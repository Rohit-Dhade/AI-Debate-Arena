import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already in use",
        err: "User already exists",
        success: false,
      });
    }

    // Create new user
    const newUser = await userModel.create({
      username: username,
      email: email,
      password: password,
    });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" },
    );

    res.cookie("token", token);

    res
      .status(201)
      .json({ message: "User registered successfully", success: true });
  } catch (error) {
    console.error("Error in register controller:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
        err: "User not found",
      });
    }

    // if (!user.verified) {
    //   return res.status(400).json({
    //     message: "Please verify your email before logging in",
    //     success: false,
    //     err: "Email not verified",
    //   });
    // }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
        err: "Incorrect password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" },
    );

    res.cookie("token", token);
    res.status(200).json({
      message: "Login successful",
      success: true,
      name: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        err: "User not found",
      });
    }
    res.status(200).json({
      message: "User details fetched successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error in getMe controller:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
