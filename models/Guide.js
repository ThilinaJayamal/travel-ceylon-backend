import mongoose from "mongoose";

const GuideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nic: { type: String, required: true },
  contact: { type: [String], required: true },
  profilePic: { type: String },
  images: { type: [String], required: true },
  specializeArea: { type: String, required: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  languages: { type: [String], required: true },
  guideLicenceImg: { type: String, required: true },
  nicImg: { type: String, required: true },
  policeClearanceImg: { type: String, required: true },
  price: { type: Number, required: true },
});

const guide = mongoose.model("Guide", GuideSchema);

export default guide;