import mongoose from "mongoose";

const GuideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nic: { type: String, required: true },
  contact: [String],
  profilePic: String,
  images: [String],
  specializeArea: String,
  province: String,
  district: String,
  city: String,
  guideLicenceImg: String,
  nicImg: String,
  policeClearanceImg: String,
});

const guide = mongoose.model("Guide",GuideSchema);

export default guide;