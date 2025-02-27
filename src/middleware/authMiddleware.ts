import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthRequest } from "../types/authRequest";
dotenv.config();

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    console.log("Cookies received:", req.cookies); // Debug cookies
    const token = req.cookies.jwt;

    if (!token) {
      console.log("No JWT token found in cookies"); // Debug missing token
      res.status(401).json({ message: "No token provided" });
      return;
    }

    console.log("Token found:", token.substring(0, 20) + "..."); // Debug token (partial)
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log("Decoded token:", decoded); // Debug decoded data

    (req as AuthRequest).user = decoded as { id: string; email: string };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error); // Debug errors
    res.status(401).json({ message: "Invalid token" });
  }
};
