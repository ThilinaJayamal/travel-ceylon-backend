import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "serviceType" },
  serviceType: { type: String, required: true, enum: ["Taxi", "Stay", "Guide", "Rent"] },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  status: { type: String, default: "pending", enum: ["pending", "confirmed", "cancelled", "completed"] },
});

const booking = mongoose.model("Booking", BookingSchema);

export default booking;