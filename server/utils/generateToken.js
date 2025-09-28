import jwt from "jsonwebtoken";

export const generateToken = (res, id) => {
  const token = jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
  });
  return token;
};
