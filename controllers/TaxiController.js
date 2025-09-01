import serviceProviderModel from "../models/ServiceProvider.js";
import taxiModel from "../models/Taxi.js";
import taxiBookingModel from "../models/Bookings/TaxiBooking.js";
import { getDistanceORS } from "../config/calculateDistance.js";

// Register a new taxi
export const registerTaxi = async (req, res) => {
  try {
    if (!req?.user) return res.status(401).json("Not authorized");
    if (req.role !== "provider")
      return res.status(401).json({ success: false, message: "You are not allowed" });

    const provider = await serviceProviderModel.findById(req.user);
    if (!provider) return res.status(404).json("Service Provider Not Found");
    if (provider.serviceId) return res.status(400).json("Can't create multiple services using a single account");

    const {
      driverName,
      nic,
      drivingId,
      nicImg,
      drivingIdImg,
      contact,
      website,
      profilePic,
      perKm,
      location,
      chasyNo,
      vehicleNo,
      province,
      vehicleType
    } = req.body;

    const taxiUser = await taxiModel.create({
      driverName,
      nic,
      drivingId,
      nicImg,
      drivingIdImg,
      contact,
      website,
      profilePic,
      perKm,
      location,
      chasyNo,
      vehicleNo,
      province,
      vehicleType
    });

    provider.serviceId = taxiUser._id;
    provider.serviceType = "Taxi";
    await provider.save();

    res.status(201).json({ message: "Taxi registered successfully", taxi: taxiUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get taxi profile for a provider
export const getTaxiProfile = async (req, res) => {
  try {
    const serviceProvider = await serviceProviderModel.findById(req.user);
    if (!serviceProvider) return res.status(404).json({ message: "service provider not found" });

    const taxi = await taxiModel.findById(serviceProvider?.serviceId);
    if (!taxi) return res.status(404).json({ message: "taxi profile not found" });

    return res.status(200).json({ success: true, taxi });
  } catch (error) {
    res.status(500).json("Server Error");
  }
};

// Get all taxis
export const getAllTaxi = async (req, res) => {
  try {
    const taxi = await taxiModel.find({});
    return res.status(200).json({ success: true, count: taxi.length, taxi });
  } catch (error) {
    res.status(500).json("Server Error");
  }
};

// Update taxi profile
export const updateTaxi = async (req, res) => {
  try {
    if (req.role !== "provider")
      return res.status(401).json({ success: false, message: "You are not allowed" });

    const provider = await serviceProviderModel.findById(req.user);
    const taxi = await taxiModel.findById(provider.serviceId);
    if (!taxi) return res.status(404).json({ message: "Taxi not found" });

    const { driverName, contact, website, profilePic, location } = req.body;

    if (driverName) taxi.driverName = driverName;
    if (contact) taxi.contact = contact;
    if (website) taxi.website = website;
    if (profilePic) taxi.profilePic = profilePic;
    if (location) taxi.location = location;

    await taxi.save();
    res.status(200).json({ message: "Taxi updated successfully", taxi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get available taxis based on date, vehicleType, pickup, and price
export const getAvailableTaxis = async (req, res) => {
  try {
    const { date, minPrice, maxPrice, vehicleType, pickup } = req.query;
    if (!date || !vehicleType || !pickup)
      return res.status(400).json({ message: "Please provide a date, vehicleType and pickup location" });

    // Find all booked taxis for this date
    const bookedTaxis = await taxiBookingModel.find({
      status: { $in: ["pending", "confirmed"] },
      date: new Date(date),
    }).select("serviceId");

    const bookedTaxiIds = bookedTaxis.map((b) => b.serviceId.toString());

    // Build filter object
    const filters = {
      _id: { $nin: bookedTaxiIds },
      vehicleType,
      location: pickup?.toLowerCase()
    };

    if (minPrice || maxPrice) {
      filters.perKm = {};
      if (minPrice) filters.perKm.$gte = Number(minPrice);
      if (maxPrice) filters.perKm.$lte = Number(maxPrice);
    }

    const available = await taxiModel.find(filters);
    res.status(200).json({ available });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create taxi booking
export const createTaxiBooking = async (req, res) => {
  try {
    if (req.role !== "user")
      return res.status(401).json({ success: false, message: "You are not allowed to book services" });

    const { taxiId, pickup, dropup, date, time } = req.body;
    const userId = req.user;

    if (!taxiId || !pickup || !dropup || !date)
      return res.status(400).json({ message: "All fields are required" });

    const distance = await getDistanceORS(pickup, dropup);
    if (distance == -1)
      return res.status(401).json({ message: "Please check your pickup & dropup location names" });

    const existingBooking = await taxiBookingModel.findOne({
      status: { $in: ["pending", "confirmed"] },
      serviceId: taxiId,
      date: new Date(date),
    });
    if (existingBooking) return res.status(400).json({ message: "Taxi is already booked for this date" });

    const selectedTaxi = await taxiModel.findById(taxiId);
    const newBooking = await taxiBookingModel.create({
      user: userId,
      serviceId: taxiId,
      pickup,
      dropup,
      distance,
      amount: distance * selectedTaxi?.perKm,
      time,
      date: new Date(date),
      status: "pending",
    });

    res.status(201).json({ message: "Taxi booked successfully", booking: newBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Change booking status
export const changeBookingState = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (req?.role !== "provider")
      return res.status(401).json({ success: false, message: "Not authorized" });

    const serviceProvider = await serviceProviderModel.findById(req?.user);
    if (!serviceProvider) return res.status(404).json({ success: false, message: "Service account not found" });

    const bookings = await taxiBookingModel.find({ serviceId: serviceProvider?.serviceId });
    const bookingIds = bookings?.map(b => b?._id.toString());
    if (!bookingIds.includes(bookingId))
      return res.status(401).json({ success: false, message: "Not authorized" });

    const validStatuses = ["completed", "confirmed", "cancelled"];
    if (!validStatuses.includes(status))
      return res.status(404).json({ success: false, message: "Invalid booking status" });

    const booking = await taxiBookingModel.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, message: "Successfully updated booking status" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
