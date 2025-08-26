import mongoose from "mongoose";
import { RoomSchema } from "./Room.js";

const StaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  contact: String,
  website: String,
  facilities: [String],
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room"
    }
  ],
  images: [String],
  description: String,
  profilePic: String,
});

const stays = mongoose.model("Stays", StaySchema);

export default stays;
