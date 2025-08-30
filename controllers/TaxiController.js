import ServiceProviderModel from "../models/ServiceProvider.js";
import TaxiModel from "../models/Taxi.js";

export const registerTaxi = async (req, res) => {
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

    const {
      driverName,
      nic,
      drivingId,
      nicImg,
      drivingIdImg,
      contact,
      website,
      vehicle,
      profilePic
    } = req.body;

    const taxiUser = await TaxiModel.create({
      driverName,
      nic,
      drivingId,
      nicImg,
      drivingIdImg,
      contact,
      website,
      vehicle,
      profilePic
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


export const updateTaxi = async (req, res) => {
  try {
    const provider = await ServiceProviderModel.findById(req.user);
   
    const taxi = await TaxiModel.findById(provider.serviceId);
    if (!taxi) {
      return res.status(404).json({ message: "Taxi not found" });
    }

    const { driverName, contact, website,profilePic } = req.body;

    if (driverName) taxi.driverName = driverName;
    if (contact) taxi.contact = contact;
    if (website) taxi.website = website;
    if (profilePic) taxi.profilePic = profilePic;

    await taxi.save();

    res.status(200).json({ message: "Taxi updated successfully", taxi });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
