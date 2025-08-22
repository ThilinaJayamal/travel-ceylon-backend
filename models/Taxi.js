import mongoose from "mongoose";

const TaxiSchema = new mongoose.Schema({
  driverName: { type: String, required: true },
  nic: { type: String, required: true },
  drivingId: { type: String, required: true },
  nicImg: String,
  drivingIdImg: String,
  contact: [String],
  website: String,
  vehicle: {
    images: [String],
    chasyNo: { type: String, required: true },
    vehicleNo: { type: String, required: true },
    province: String,
    vehicleType: { type: String, required: true },
  },
});

const taxi = mongoose.model("Taxi", TaxiSchema);

export default taxi;