import staysModel from "../models/Stays.js";
import roomModel from "../models/Room.js";
import serviceProviderModel from "../models/ServiceProvider.js";
import staysBookingModel from "../models/Bookings/StaysBooking.js"


export const registerStays = async (req, res) => {
  try {
    if (!req?.user) {
      return res.status(401).json("Not authorized");
    }

    if (req.role !== "provider") {
      return res.status(401).json({
        success: false,
        message: "You are not allowed"
      })
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
    provider.serviceType = "Stays";
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
    if (!serviceProvider) {
      return res.status(404).json({ message: "service provider not found" })
    }

    const stays = await staysModel.find(serviceProvider?.serviceId).populate("rooms");
    if (!stays) {
      return res.status(404).json({ message: "stays profile not found" });
    }

    return res.status(200).json({
      success: true,
      stays: stays
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
      count: stays.length,
      stays: stays
    })
  } catch (error) {
    res.status(500).json("Server Error")
  }
}

// -------------------------Rooms-------------------------------

export const addRoom = async (req, res) => {
  try {
    if (req.role !== "provider") {
      return res.status(401).json({
        success: false,
        message: "You are not allowed"
      })
    }

    const { roomType, price, maxGuest, bedType, images, features } = req.body;

    const serviceProvider = await serviceProviderModel.findById(req.user);
    if (!serviceProvider) {
      return res.status(401).json({ message: "service account not found" })
    }

    const stays = await staysModel.findById(serviceProvider?.serviceId).populate("rooms");
    if (!stays) {
      return res.status(404).json({ message: "stays is not belongs to this service account" });
    }

    const newRoom = new roomModel({
      roomType,
      price,
      maxGuest,
      bedType,
      images,
      features
    });
    await newRoom.save();

    stays.rooms.push(newRoom._id);
    await stays.save();

    res.status(201).json({
      message: "Room added successfully",
      room: newRoom,
      stays,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    if (req.role !== "provider") {
      return res.status(401).json({
        success: false,
        message: "You are not allowed"
      })
    }

    const { roomId } = req.params;

    const serviceProvider = await serviceProviderModel.findById(req.user);
    if (!serviceProvider) {
      return res.status(401).json({ message: "service account not found" })
    }

    const stays = await staysModel.findById(serviceProvider?.serviceId);
    if (!stays) {
      return res.status(404).json({ message: "stays is not belongs to this service account" });
    }

    if (!stays.rooms.includes(roomId)) {
      return res.status(403).json({ message: "Not authorized to update rooms in this stay" });
    }

    const { roomType, price, maxGuest, bedType, images, features } = req.body;

    const updatedRoom = await roomModel.findByIdAndUpdate(
      roomId,
      { roomType, price, maxGuest, bedType, images, features },
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
    if (req.role !== "provider") {
      return res.status(401).json({
        success: false,
        message: "You are not allowed"
      })
    }

    const { roomId } = req.params;

    const serviceProvider = await serviceProviderModel.findById(req.user);
    if (!serviceProvider) {
      return res.status(401).json({ message: "service account not found" })
    }

    const stays = await staysModel.findById(serviceProvider?.serviceId);
    if (!stays) {
      return res.status(404).json({ message: "stays is not belongs to this service account" });
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

export const getAvailableStays = async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      location,
      minPrice,
      maxPrice,
      numberOfGuest,
      numberOfRooms,
      staysFacilities,
      roomFacilities
    } = req.query;

    if (!start_date || !end_date || !location) {
      return res.status(400).json({ message: "Please provide start_date, end_date, and location" });
    }

    // Convert string parameters to numbers
    const guestCount = numberOfGuest ? parseInt(numberOfGuest) : 1;
    const roomCount = numberOfRooms ? parseInt(numberOfRooms) : 1;
    const minPriceFilter = minPrice ? parseFloat(minPrice) : null;
    const maxPriceFilter = maxPrice ? parseFloat(maxPrice) : null;

    const staysFilters = {
      location: location,
    }

    const roomsFilters = {
      path: "rooms"
    }

    if (staysFacilities?.length > 0) {
      staysFilters.facilities = {
        $all: staysFacilities
      }
    }

    if (roomFacilities?.length > 0) {
      roomsFilters.match = {
        features: {
          $all: roomFacilities
        }
      }
    }

    // Fetch all stays with rooms populated
    const allStays = await staysModel.find(staysFilters).populate(roomsFilters);

    // Fetch all bookings that overlap with the requested dates
    const bookings = await staysBookingModel.find({
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { start_date: { $lte: new Date(end_date), $gte: new Date(start_date) } },
        { end_date: { $lte: new Date(end_date), $gte: new Date(start_date) } },
        { start_date: { $lte: new Date(start_date) }, end_date: { $gte: new Date(end_date) } }
      ]
    });

    const result = allStays
      .map(stay => {
        const bookedRoomIds = bookings
          .filter(b => b.serviceId.toString() === stay._id.toString())
          .map(b => b.roomId?.toString())
          .filter(Boolean);

        let availableRooms = stay.rooms.filter(room =>
          !bookedRoomIds.includes(room._id.toString())
        );

        // Apply price filters if provided
        if (minPriceFilter !== null || maxPriceFilter !== null) {
          availableRooms = availableRooms.filter(room => {
            const roomPrice = room.price || 0;
            const withinMinPrice = minPriceFilter === null || roomPrice >= minPriceFilter;
            const withinMaxPrice = maxPriceFilter === null || roomPrice <= maxPriceFilter;
            return withinMinPrice && withinMaxPrice;
          });
        }

        // Check if we have enough available rooms
        if (availableRooms.length < roomCount) {
          return null;
        }

        // Sort available rooms by capacity
        availableRooms.sort((a, b) => (b.maxGuest || 0) - (a.maxGuest || 0));

        // Select best rooms for the request
        const selectedRooms = availableRooms.slice(0, roomCount);
        const totalCapacity = selectedRooms.reduce((sum, room) => sum + (room.maxGuest || 0), 0);

        // Check if selected rooms can accommodate all guests
        if (totalCapacity < guestCount) {
          return null;
        }

        // Calculate starting price
        const availableRoomPrices = availableRooms
          .map(room => room.price || 0)
          .filter(price => price > 0);

        const lowestAvailablePrice = availableRoomPrices.length > 0
          ? Math.min(...availableRoomPrices)
          : null;

        return {
          stays: {
            _id: stay._id,
            name: stay.name,
            location: stay.location,
            contact: stay.contact,
            website: stay.website,
            facilities: stay.facilities
          },
          rooms: availableRooms,
          totalAvailableRooms: availableRooms.length,
          starting_from: lowestAvailablePrice,
          canAccommodateRequest: true
        };
      })
      .filter(Boolean);

    res.status(200).json({
      success: true,
      count: result.length,
      result,
      searchCriteria: {
        location,
        startDate: start_date,
        endDate: end_date,
        numberOfGuests: guestCount,
        numberOfRooms: roomCount,
        minPrice: minPriceFilter,
        maxPrice: maxPriceFilter
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const bookRoom = async (req, res) => {
  try {
    if (req.role !== "user") {
      return res.status(401).json({
        success: false,
        message: "You are not allowed to book services"
      })
    }

    const user = req.user; // from auth middleware
    const { stayId, roomId, start_date, end_date } = req.body;

    if (!stayId || !roomId || !start_date || !end_date) {
      return res.status(400).json({ message: "Please provide stayId, roomId, start_date and end_date" });
    }

    // Fetch the stay
    const stay = await staysModel.findById(stayId).populate("rooms");
    if (!stay) return res.status(404).json({ message: "Stay not found" });

    // Check if room belongs to the stay
    const roomExists = stay.rooms.some(r => r._id.toString() === roomId);
    if (!roomExists) return res.status(400).json({ message: "Room does not belong to this stay" });

    // Check for conflicting bookings
    const conflictingBooking = await staysBookingModel.findOne({
      serviceId: stayId,
      roomId: roomId,
      status: { $in: ["pending", "confirmed"] }, // block only active bookings
      $or: [
        { start_date: { $lte: new Date(end_date), $gte: new Date(start_date) } },
        { end_date: { $lte: new Date(end_date), $gte: new Date(start_date) } },
        { start_date: { $lte: new Date(start_date) }, end_date: { $gte: new Date(end_date) } }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: "Room is already booked for these dates" });
    }

    // Create booking
    const newBooking = await staysBookingModel.create({
      user: user,
      serviceId: stayId,
      roomId,
      start_date,
      end_date,
      status: "pending"
    });

    res.status(201).json({ message: "Booking successful", booking: newBooking });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const changeBookingState = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (req?.role !== "provider") {
      return res.status(401).json({
        success: false,
        message: "Not authorized"
      });
    }

    const serviceProvider = await serviceProviderModel.findById(req?.user);
    if (!serviceProvider) {
      return res.status(404).json({
        success: false,
        message: "service account not found"
      });
    }

    const bookings = await staysBookingModel.find({ serviceId: serviceProvider?.serviceId });
    const bookingIds = bookings?.map(b => b?._id.toString());

    if (!bookingIds.includes(bookingId)) {
      return res.status(401).json({
        success: false,
        message: "Not authorized"
      });
    }

    if (status === "completed" || status === "confirmed" || status === "cancelled") {
      return res.status(404).json({
        success: false,
        message: "invalid booking status"
      })
    }

    const booking = await staysBookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "booking not found"
      })
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "successfully booking status updated"
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}