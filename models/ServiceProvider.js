import mongoose from "mongoose";

const ServiceProviderSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  serviceType: {
    type: String,
    required: true,
    enum: ["taxi", "stays", "rent", "guide"]
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "serviceType"
  },
  verify: { type: Boolean, default: false },
});

const serviceProvider = mongoose.model("ServiceProvider", ServiceProviderSchema);

export default serviceProvider;