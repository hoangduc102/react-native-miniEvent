import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters long" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }
    // check if user already exists

   
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //get random avt
    const profileImage = `https://api.dicebear.com/9.x/thumbs/svg?seed=${username}`;

    const user = new User({ 
        username, 
        email, 
        password,
        profileImage,
     });

     await user.save();

     const token = generateToken(user._id);
     res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
     });
  } catch (error) {
    console.log("Error in register route", error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    //check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    //check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    //generate token    
    const token = generateToken(user._id);
    
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log("Error in login route", error.message);
    res.status(500).json({ message: error.message });
  }
});

export default router;
