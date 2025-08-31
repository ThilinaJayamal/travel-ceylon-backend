import mongoose from "mongoose";

const rentBookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    pickup: { type: Date, required: true },
    return: { type: Date, required: true },
    area: { type: String, required: true },
    amount: { type: Number },
    status: { type: String, default: "pending", enum: ["pending", "confirmed", "cancelled", "completed"] },
});

const booking = mongoose.model("RentBooking", rentBookingSchema);

export default booking;