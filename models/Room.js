import mongoose from "mongoose";

export const RoomSchema = new mongoose.Schema({
  roomType: { type: String, required: true },
  price: { type: Number, required: true },
  maxGuest: { type: Number, required: true },
  bedType: { type: String, required: true },
  images:[String]
});

export const Room = mongoose.model("Room",RoomSchema);