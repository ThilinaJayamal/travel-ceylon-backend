import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema({
  images: [String],
  chasyNo: { type: String, required: true },
  vehicleNo: { type: String, required: true },
  province: String,
  vehicleType: { type: String, required: true },
});

const vehicle = mongoose.model('Vehicle',VehicleSchema);

export default vehicle;