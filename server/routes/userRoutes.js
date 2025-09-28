import express from "express";
const router = express.Router();
import { getUserData } from "../controllers/userController.js";
import { userAuth } from "../middlewares/userAuth.js";

router.get("/get-user-data", userAuth, getUserData);

export default router;
