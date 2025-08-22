import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomType: { type: String, required: true },
  price: { type: Number, required: true },
  maxGuest: { type: Number, required: true },
  bedType: { type: String, required: true },
  images:[String]
});

const Room = mongoose.model("Room",RoomSchema);

export default Room;