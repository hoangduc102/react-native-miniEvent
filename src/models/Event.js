import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        caption: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 0,
            max: 5,
        },
        location: {
            type: String,
        },
        description: {
            type: String,
            required: true,
        },
        tags: {
            type: [String],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    }, 
    {timestamps: true}
);


const Event = mongoose.model("Event", eventSchema);

export default Event;

