import rentModel from "../models/Rent.js";
import serviceProviderModel from "../models/ServiceProvider.js";
import vehicleModel from "../models/Vehicle.js";
import rentBookingModel from "../models/Bookings/RentBooking.js"

export const rentRegister = async (req, res) => {
  try {
    if (!req?.user || req.role === "user") {
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

    const newRent = await rentModel.create({
      name: req.body.name,
      contact: req.body.contact || [],
      profilePic: req.body.profilePic,
      nic: req.body.nic,
      nicImg: req.body.nicImg,
      vehicles: req.body.vehicles || [],
    });

    provider.serviceId = newRent._id;
    provider.serviceType = "Rent";
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

export const getRentProfile = async (req, res) => {
  try {
    const serviceProvider = await serviceProviderModel.findById(req.user)
    if (!serviceProvider) {
      return res.status(404).json({ message: "service provider not found" })
    }

    const rent = await rentModel.findById(serviceProvider?.serviceId);
    if (!rent) {
      return res.status(404).json({ message: "rent profile not found" });
    }

    return res.status(200).json({
      success: true,
      rent: rent
    })
  } catch (error) {
    res.status(500).json("Server Error")
  }
}

export const getAllRents = async (req, res) => {
  try {
    const rents = await rentModel.find({});

    return res.status(200).json({
      success: true,
      count: rents.length,
      rents: rents
    })
  } catch (error) {
    res.status(500).json("Server Error")
  }
}

export const updateRent = async (req, res) => {
  try {
    if (!req?.user || req.role === "user") {
      return res.status(401).json("Not authorized");
    }

    const serviceprovider = await serviceProviderModel.findById(req.user);
    if (!serviceprovider) {
      return res.status(404).json({ message: "Service provider account not found" });
    }

    const rent = await rentModel.findById(serviceprovider.serviceId);
    if (!rent) {
      return res.status(404).json({ message: "Rent profile not found" });
    }

    const { name, contact, profilePic } = req.body;

    if (name) rent.name = name;
    if (contact) rent.contact = contact;
    if (profilePic) rent.profilePic = profilePic;

    await rent.save();

    res.status(200).json({
      message: "Rent profile updated successfully",
      rent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Server Error");
  }
};


export const addVehicle = async (req, res) => {
  try {
    const serviceProvider = await serviceProviderModel.findById(req.user);
    if (!serviceProvider) {
      return res.status(404).json({ message: "Service provider account not found" });
    }

    const rent = await rentModel.findById(serviceProvider?.serviceId);
    if (!rent) {
      return res.status(404).json({ message: "Rent accont is not belongs to this service account" });
    }

    const { images, chasyNo, vehicleNo, province, vehicleType } = req.body;

    const newVehicle = new vehicleModel({
      images: images || [],
      chasyNo,
      vehicleNo,
      province,
      vehicleType,
    });

    await newVehicle.save();

    rent.vehicles.push(newVehicle._id);
    await rent.save();

    return res.status(201).json({
      message: "Vehicle added successfully",
      vehicle: newVehicle,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const updateVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const serviceProvider = await serviceProviderModel.findById(req.user);
    if (!serviceProvider) {
      return res.status(404).json({ message: "Service provider account not found" });
    }

    const rent = await rentModel.findById(serviceProvider?.serviceId);
    if (!rent) {
      return res.status(404).json({ message: "Rent accont is not belongs to this service account" });
    }

    if (!rent.vehicles.includes(vehicleId)) {
      return res.status(403).json({ message: "This vehicle does not belong to the given Rent" });
    }

    const updateData = {
      images: req.body.images,
      chasyNo: req.body.chasyNo,
      vehicleNo: req.body.vehicleNo,
      province: req.body.province,
      vehicleType: req.body.vehicleType,
    };

    const updatedVehicle = await vehicleModel.findByIdAndUpdate(
      vehicleId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    return res.status(200).json({
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const deleteVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const serviceProvider = await serviceProviderModel.findById(req.user);
    if (!serviceProvider) {
      return res.status(404).json({ message: "Service provider account not found" });
    }

    const rent = await rentModel.findById(serviceProvider?.serviceId);
    if (!rent) {
      return res.status(404).json({ message: "Rent accont is not belongs to this service account" });
    }

    if (!rent.vehicles.includes(vehicleId)) {
      return res.status(403).json({ message: "This vehicle does not belong to the given Rent" });
    }

    const deletedVehicle = await vehicleModel.findByIdAndDelete(vehicleId);
    if (!deletedVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    rent.vehicles = rent.vehicles.filter(
      (id) => id.toString() !== vehicleId.toString()
    );
    await rent.save();

    return res.status(200).json({
      message: "Vehicle deleted successfully",
      vehicle: deletedVehicle,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getAvailableVehicles = async (req, res) => {
  try {
    const { pickup, returnDate, area } = req.query;

    if (!pickup || !returnDate) {
      return res.status(400).json({ message: "Please provide pickup and return dates" });
    }

    const pickupDate = new Date(pickup);
    const return_Date = new Date(returnDate);

    if (pickupDate >= return_Date) {
      return res.status(400).json({ message: "Return date must be after pickup date" });
    }

    // 1. Find vehicles that have overlapping bookings
    const conflictingBookings = await rentBookingModel.find({
      $or: [
        { pickup: { $lte: return_Date }, return: { $gte: pickupDate } } // overlap
      ],
      status: { $in: ["pending", "confirmed"] } // only active bookings
    });

    const bookedVehicleIds = conflictingBookings.map(b => b.serviceId.toString());

    // 2. Fetch all vehicles
    const allVehicles = await vehicleModel.find();

    // 3. Filter out booked vehicles
    const availableVehicles = allVehicles.filter(
      v => !bookedVehicleIds.includes(v._id.toString())
    );

    return res.status(200).json({
      total: availableVehicles.length,
      vehicles: availableVehicles,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const createRentBooking = async (req, res) => {
  try {
    const { vehicleId, pickup, returnDate, area } = req.body;

    if (!vehicleId || !pickup || !returnDate || !area) {
      return res.status(400).json({ message: "vehicleId, pickup, returnDate, and area are required" });
    }

    const pickupDate = new Date(pickup);
    const return_Date = new Date(returnDate);

    if (pickupDate >= return_Date) {
      return res.status(400).json({ message: "Return date must be after pickup date" });
    }

    // 1. Check vehicle exists
    const vehicle = await vehicleModel.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // 2. Check for conflicting bookings
    const conflict = await rentBookingModel.findOne({
      serviceId: vehicleId,
      status: { $in: ["pending", "confirmed"] }, // only active
      $or: [
        { pickup: { $lte: return_Date }, return: { $gte: pickupDate } } // overlap condition
      ]
    });

    if (conflict) {
      return res.status(400).json({ message: "Vehicle not available for selected dates" });
    }

    // 3. Create booking
    const booking = new rentBookingModel({
      user: req.user,
      serviceId: vehicleId,
      pickup: pickupDate,
      return: return_Date,
      area,
      status: "pending"
    });

    await booking.save();

    return res.status(201).json({
      message: "Booking created successfully",
      booking
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};