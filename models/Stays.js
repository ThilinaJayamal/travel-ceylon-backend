import mongoose from "mongoose";

const StaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  contact: String,
  website: String,
  facilities: {
    type: [String], enum: [
      "Breakfast",
      "Fitness Center",
      "Room Service",
      "Garden",
      "24 hour front desk",
      "Family Rooms",
      "Bar",
      "Parking",
      "Airport shuttle",
      "Beach",
      "Free Wifi",
      "A/C Rooms",
      "Swing pool",
      "Water Park"
    ]
  },
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
