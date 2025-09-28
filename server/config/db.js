import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB is successfully connected");
    });
    await mongoose.connect(`${process.env.MONGO_URL}/userAuthentication`);
  } catch (error) {
    console.log(error);
  }
};
export default connectDB;

