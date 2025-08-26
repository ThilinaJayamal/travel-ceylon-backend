import mongoose from "mongoose";

export const VehicleSchema = new mongoose.Schema({
  images: [String],
  chasyNo: { type: String, required: true },
  vehicleNo: { type: String, required: true },
  province: String,
  vehicleType: { type: String, required: true },
});