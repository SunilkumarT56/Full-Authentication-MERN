import User from "../models/User.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
import { generateToken } from "../utils/generateToken.js";
import transporter from "../config/nodemailer.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      throw new Error("All fields are required");
    if (password.length < 6)
      throw new Error("Password must be at least 6 characters long");
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) throw new Error("User already exists");
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    generateToken(res, user._id); //it generate jwt token and set the cookie
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to SCS",
      text: `Welcome to SCS website. Your account been created with email id: ${email}`,
    };
    await transporter.sendMail(mailOptions);
    res.status(201).json({
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res
        .status(400)
        .json({ status: false, message: "Invalid credentials" });
    generateToken(res, user._id); //it generate jwt token and set the cookie
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
    });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account already verified",
      });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpiresAt = Date.now() + 3600000;
    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is: ${otp}`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;
    if (!userId || !otp) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verifyOtp !== otp || user.verifyOtp === "") {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }
    if (user.verifyOtpExpiresAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP has expired",
      });
    }
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiresAt = 0;
    await user.save();
    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "User is authenticated",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({
      success: false,
      message: "Email is required",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.json({
        success: false,
        message: "User not found",
      });
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000;
    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "reset password  reset OTP",
      text: `Your reset password OTP is: ${otp}`,
    };
    await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
export const resetPassword = async (req, res) => {
  const { otp, newPassword, email } = req.body;
  if (!otp || !newPassword || !email) {
    return res.json({
      success: false,
      message: "All fields are required",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.json({
        success: false,
        message: "User not found",
      });
    }
    if (user.resetOtp !== otp || user.resetOtp === "") {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }
    if (user.resetOtpExpiresAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP has expired",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.resetOtp = "";
    user.resetOtpExpiresAt = 0;
    user.password = hashedPassword;
    await user.save();
    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
