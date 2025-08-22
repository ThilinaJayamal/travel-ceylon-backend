import staysModel from "../models/Stays.js";
import ServiceProviderModel from "../models/ServiceProvider.js";

export const registerStays = async (req, res) => {
  try {
    if (!req?.user) {
      return res.status(401).json("Not authorized");
    }

    const provider = await ServiceProviderModel.findById(req.user);
    if (!provider) {
      return res.status(404).json("Service Provider Not Found");
    }

    if (provider.serviceId) {
      return res
        .status(400)
        .json("Can't create multiple services using a single account");
    }

    // Create new stay
    const newStay = await staysModel.create({
      name: req.body.name,
      location: req.body.location,
      contact: req.body.contact,
      website: req.body.website,
      facilities: req.body.facilities || [],
      rooms: req.body.rooms || [],
      images: req.body.images || [],
      description: req.body.description,
      profilePic: req.body.profilePic,
    });

    // Link the stay to the service provider
    provider.serviceId = newStay._id;
    provider.serviceType = "stays";
    await provider.save();

    res.status(201).json({
      message: "Stay registered successfully",
      stay: newStay,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Server Error");
  }
};
