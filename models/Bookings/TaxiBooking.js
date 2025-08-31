import mongoose from "mongoose";

const taxiBookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    pickup: { type: String, required: true },
    dropup: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, default: "pending", enum: ["pending", "confirmed", "cancelled", "completed"] },
});

const booking = mongoose.model("TaxiBooking", taxiBookingSchema);

export default booking;