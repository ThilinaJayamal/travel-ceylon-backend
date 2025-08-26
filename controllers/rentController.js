import RentModel from "../models/Rent.js";
import ServiceProvider from "../models/ServiceProvider.js";

export const rentRegister = async (req, res) => {
  try {
    if (!req?.user) {
      return res.status(401).json("Not authorized");
    }

    // Find the service provider
    const provider = await ServiceProvider.findById(req.user);
    if (!provider) {
      return res.status(404).json("Service Provider Not Found");
    }

    // Check if provider already linked to a service
    if (provider.serviceId) {
      return res
        .status(400)
        .json("Can't create multiple services using a single account");
    }

    // Create new Rent service
    const newRent = await RentModel.create({
      name: req.body.name,
      contact: req.body.contact || [],
      profilePic: req.body.profilePic,
      nic: req.body.nic,
      nicImg: req.body.nicImg,
      vehicles: req.body.vehicles || [], // must be array of VehicleSchema objects
    });

    // Link the rent service to the service provider
    provider.serviceId = newRent._id;
    provider.serviceType = "rent";
    await provider.save();

    res.status(201).json({
      message: "Rent service registered successfully",
      rent: newRent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Server Error");
  }
};
