import staysModel from "../models/Stays.js";
import roomModel from "../models/Room.js";
import serviceProviderModel from "../models/ServiceProvider.js";

// -------------------------Stays---------------------------------------

export const registerStays = async (req, res) => {
  try {
    if (!req?.user) {
      return res.status(401).json("Not authorized");
    }

    const provider = await serviceProviderModel.findById(req.user);
    if (!provider) {
      return res.status(404).json("Service Provider Not Found");
    }

    if (provider.serviceId) {
      return res
        .status(400)
        .json("Can't create multiple services using a single account");
    }

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

export const updateStays = async (req, res) => {
  try {
    if (!req?.user) {
      return res.status(401).json("Not authorized");
    }

    const serviceProvider = await serviceProviderModel.findById(req.user);
    if (!serviceProvider) {
      return res.status(404).json("Service provider account is not found");
    }

    const stays = await staysModel.findById(serviceProvider?.serviceId);
    if (!stays) {
      return res.status(404).json("Stays account is not found");
    }

    const {
      name,
      location,
      contact,
      website,
      facilities,
      images,
      description,
      profilePic,
    } = req.body;

    if (name) stays.name = name;
    if (location) stays.location = location;
    if (contact) stays.contact = contact;
    if (website) stays.website = website;
    if (facilities) stays.facilities = facilities;
    if (images) stays.images = images;
    if (description) stays.description = description;
    if (profilePic) stays.profilePic = profilePic;

    await stays.save();

    res.status(200).json({
      message: "Stay updated successfully",
      stays
    });

  } catch (error) {
    console.error(error);
    res.status(500).json("Server Error");
  }
};

export const getStaysProfile = async (req, res) => {
    try {
        const serviceProvider = await serviceProviderModel.findById(req.user)
        if(!serviceProvider){
            return res.status(404).json({message:"service provider not found"})
        }

        const stays = await staysModel.findById(serviceProvider?.serviceId);
        if(!stays){
            return res.status(404).json({message:"stays profile not found"});
        }

        return res.status(200).json({
            success:true,
            stays:stays
        })
    } catch (error) {
        res.status(500).json("Server Error")
    }
}

export const getAllStays = async (req, res) => {
  try {
    const stays = await staysModel.find({});

    return res.status(200).json({
      success: true,
      count:stays.length,
      stays: stays
    })
  } catch (error) {
    res.status(500).json("Server Error")
  }
}

// -------------------------Rooms-------------------------------

export const addRoom = async (req, res) => {
  try {
    const { roomType, price, maxGuest, bedType, images } = req.body;

    const stay = await staysModel.findById(req.params.id);
    if (!stay) {
      return res.status(404).json({ message: "Stay not found" });
    }

    const newRoom = new roomModel({
      roomType,
      price,
      maxGuest,
      bedType,
      images
    });
    await newRoom.save();

    stay.rooms.push(newRoom._id);
    await stay.save();

    res.status(201).json({
      message: "Room added successfully",
      room: newRoom,
      stay,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { staysId, roomId } = req.params;

    const stay = await staysModel.findById(staysId);
    if (!stay) {
      return res.status(404).json({ message: "Stay not found" });
    }

    if (!stay.rooms.includes(roomId)) {
      return res.status(403).json({ message: "Not authorized to update rooms in this stay" });
    }

    const { roomType, price, maxGuest, bedType, images } = req.body;

    const updatedRoom = await roomModel.findByIdAndUpdate(
      roomId,
      { roomType, price, maxGuest, bedType, images },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { staysId, roomId } = req.params;

    const stays = await staysModel.findById(staysId);
    if (!stays) {
      return res.status(404).json({ message: "Stay not found" });
    }

    if (!stays.rooms.includes(roomId)) {
      return res.status(400).json({ message: "Not authorized to delete rooms in this stay" });
    }

    await roomModel.findByIdAndDelete(roomId);

    stays.rooms = stays.rooms?.filter((id) => id.toString() !== roomId.toString());
    await stays.save();

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
