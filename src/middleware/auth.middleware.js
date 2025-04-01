import jwt from "jsonwebtoken";
import User from "../models/User.js";



const protectRoute = async (req, res, next) => {
    try {
        //get token 
        const token = req.headers("Authorization").replace("Bearer", "");
        if(!token) {
            return res.status(401).json({ message: "No authorization token, access denied" });
        }

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //find user by id
        const user = await User.findById(decoded.id).select("-password");

        if(!user) {
            return res.status(401).json({ message: "User not found" });
        }


        req.user = user;
        next();
        
    }catch(error) {
        console.log("Authentication error", error.message);
        res.status(401).json({ message: "Token is not valid" });
    }
}

export default protectRoute;

