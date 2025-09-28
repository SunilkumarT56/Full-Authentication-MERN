import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";


const app = express();
const PORT = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
await connectDB();

//routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes)

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}` );
});
