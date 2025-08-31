import serviceProviderModel from "../models/ServiceProvider.js";
import taxiModel from "../models/Taxi.js";
import taxiBookingModel from "../models/Bookings/TaxiBooking.js";

export const registerTaxi = async (req, res) => {
  try {
    if (!req?.user) {
      return res.status(401).json("Not authorized");
    }

    const provider = await serviceProviderModel.findById(req.user);
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

    const taxiUser = await taxiModel.create({
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
    provider.serviceType = "Taxi";
    await provider.save();

    res.status(201).json({ message: "Taxi registered successfully", taxi: taxiUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getTaxiProfile = async (req, res) => {
  try {
    const serviceProvider = await serviceProviderModel.findById(req.user)
    if (!serviceProvider) {
      return res.status(404).json({ message: "service provider not found" })
    }

    const taxi = await taxiModel.findById(serviceProvider?.serviceId);
    if (!taxi) {
      return res.status(404).json({ message: "taxi profile not found" });
    }

    return res.status(200).json({
      success: true,
      taxi: taxi
    })
  } catch (error) {
    res.status(500).json("Server Error")
  }
}


export const getAllTaxi = async (req, res) => {
  try {
    const taxi = await taxiModel.find({});

    return res.status(200).json({
      success: true,
      count: taxi.length,
      taxi: taxi
    })
  } catch (error) {
    res.status(500).json("Server Error")
  }
}

export const updateTaxi = async (req, res) => {
  try {
    const provider = await serviceProviderModel.findById(req.user);

    const taxi = await taxiModel.findById(provider.serviceId);
    if (!taxi) {
      return res.status(404).json({ message: "Taxi not found" });
    }

    const { driverName, contact, website, profilePic } = req.body;

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

export const getAvailableTaxis = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Please provide a date" });
    }

    // Find all booked taxis for this date
    const bookedTaxis = await taxiBookingModel.find({
      date: new Date(date)/*{ $gte: targetDate, $lt: nextDate }*/,
    }).select("serviceId");

    const bookedTaxiIds = bookedTaxis.map((b) => b.serviceId.toString());

    // Find all taxis NOT booked on that date
    const available = await taxiModel.find({
      _id: { $nin: bookedTaxiIds },
    });

    res.status(200).json({ available });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const createTaxiBooking = async (req, res) => {
  try {
    const { taxiId, pickup, dropup, date, time } = req.body;
    const userId = req.user;

    if (!taxiId || !pickup || !dropup || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the taxi is already booked for this date
    const existingBooking = await taxiBookingModel.findOne({
      serviceId: taxiId,
      date: new Date(date),
    });

    if (existingBooking) {
      return res.status(400).json({ message: "Taxi is already booked for this date" });
    }

    // Create new booking
    const newBooking = await taxiBookingModel.create({
      user: userId,
      serviceId: taxiId,
      pickup,
      dropup,
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
