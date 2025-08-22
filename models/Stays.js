import mongoose from "mongoose";

const StaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  contact: String,
  website: String,
  facilities: [String],
  rooms: [RoomSchema],
  images: [String],
  description: String,
  profilePic: String,
});

const stays = mongoose.model("Stays",StaySchema);

export default stays;