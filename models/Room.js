import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomType: { type: String, required: true },
  price: { type: Number, required: true },
  maxGuest: { type: Number, required: true },
  bedType: { type: String, required: true },
  features: { type: [String], enum: ["AC", "WI-FI"] },
  images: [String]
});

const room = mongoose.model("Room", RoomSchema);

export default room