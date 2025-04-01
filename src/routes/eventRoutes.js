import express from "express";
import cloudinary from "../lib/cloudinary.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, image, rating, location, description, tags } = req.body;
        
        if(!title || !caption || !image || !rating || !location || !description || !tags) {
            return res.status(400).json({ message: "Please provide all fields" });
        }

        //upload image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;
        //save event to database
        
        const newEvent = new Event({
            title,
            caption,
            image: imageUrl,
            rating,
            location,
            description,
            tags,
            user: req.user._id,
        })
        
        await newEvent.save()
        res.status(201).json(newEvent);
    } catch (error) {
        console.log("Error in create event route", error.message);
        res.status(500).json({ message: error.message });
    }   
});
//example call from react native - frontend
//const reponse = await fetch("https://localhost:3000/api/events?page=1&limit=5");

//pagination => infinite loading
router.get("/", protectRoute, async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;

        const skip = (page - 1) * limit;


        const events = await Event.find()
        .sort({ createdAt: -1 }) //descending order
        .skip(skip)
        .limit(limit)
        .populate("user", "username profileImage");

        const totalEvents = await Event.countDocuments();
        res.send({
            events,
            currentPage: page,
            totalEvents,
            totalPages: Math.ceil(totalEvents/ limit),
        });
    } catch (error) {
        console.log("Error in get events route", error.message);
        res.status(500).json({ message: error.message });
    }
});

//get recommended events by the logged in user
router.get("/user", protectRoute, async (req, res) => {
    try {
        const events = await Event.find({ user: req.user._id }).sort({ createdAt: -1 });
       
        res.json(events);
    } catch (error) {
        console.log("Get user events error", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if(!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // check if user is the owner of the event
        if(event.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "You are not authorized to delete this event" });
        }

        //delete image from cloudinary
        if(event.image && event.image.includes("cloudinary")) {
            try {
                const publicId = event.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.log("Error in deleting image from cloudinary", error.message);
            }
        }

        await event.deleteOne();

        res.json({ message: "Event deleted successfully" });
    }catch (error) {
        console.log("Error in delete event route", error.message);
        res.status(500).json({ message: error.message });
    }
});

export default router;
