import mongoose from "mongoose";

const RentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: [String],
  vehicles: [VehicleSchema],
  profilePic: String,
  nic: { type: String, required: true },
  nicImg: String,
});

const rent = mongoose.model("Rent",RentSchema);

export default rent;