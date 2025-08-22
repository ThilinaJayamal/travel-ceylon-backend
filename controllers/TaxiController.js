import ServiceProviderModel from "../models/ServiceProvider.js";
import TaxiModel from "../models/Taxi.js";

const registerTaxi = async (req, res) => {
  try {
    if (!req?.user) {
      return res.status(401).json("Not authorized");
    }

    const provider = await ServiceProviderModel.findById(req.user);
    if (!provider) {
      return res.status(404).json("Service Provider Not Found");
    }

    if (provider.serviceId) {
      return res.status(400).json("Can't create multiple services using a single account");
    }

    const { driverName, nic, drivingId, nicImg, drivingIdImg, contact, website, vehicle } = req.body;

    const taxiUser = await TaxiModel.create({
      driverName,
      nic,
      drivingId,
      nicImg,
      drivingIdImg,
      contact,
      website,
      vehicle,
    });

    provider.serviceId = taxiUser._id;
    provider.serviceType = "taxi";
    await provider.save();

    res.status(201).json({ message: "Taxi registered successfully", taxi: taxiUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export default registerTaxi;
