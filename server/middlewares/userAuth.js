import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const userAuth = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (decoded.id) {
      req.user = { id: decoded.id };
    } else {
      return res.json({ success: false, message: "Unauthorized" });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
