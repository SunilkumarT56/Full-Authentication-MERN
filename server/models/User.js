import mongoose from "mongoose";

const { Schema, model, models, Types } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    verifyOtp: {
      type: String,
      default : ''
    },
    verifyOtpExpiresAt:{
      type: Number,
      default: 0,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    resetOtp: {
      type: String,
      default: "",
    },
    resetOtpExpiresAt: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = models.User || model("User", userSchema);

export default User;
