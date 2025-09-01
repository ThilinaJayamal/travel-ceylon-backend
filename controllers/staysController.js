import staysModel from "../models/Stays.js";
import roomModel from "../models/Room.js";
import serviceProviderModel from "../models/ServiceProvider.js";
import staysBookingModel from "../models/Bookings/StaysBooking.js";

// ------------------------- Stays -------------------------
export const registerStays = async (req, res) => {
  try {
    if (!req?.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    if (req.role !== "provider") {
      return res.status(403).json({ success: false, message: "You are not allowed" });
    }

    const provider = await serviceProviderModel.findById(req.user);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Service provider not found" });
    }

    if (provider.serviceId) {
      return res.status(400).json({ success: false, message: "Can't create multiple services using a single account" });
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

    res.status(201).json({ success: true, message: "Stay registered successfully", data: newStay });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateStays = async (req, res) => {
  try {
    if (!req?.user) return res.status(401).json({ success: false, message: "Not authorized" });

    const provider = await serviceProviderModel.findById(req.user);
    if (!provider) return res.status(404).json({ success: false, message: "Service provider not found" });

    const stay = await staysModel.findById(provider?.serviceId);
    if (!stay) return res.status(404).json({ success: false, message: "Stay not found" });

    const fields = ["name", "location", "contact", "website", "facilities", "images", "description", "profilePic"];
    fields.forEach(field => {
      if (req.body[field] !== undefined) stay[field] = req.body[field];
    });

    await stay.save();
    res.status(200).json({ success: true, message: "Stay updated successfully", data: stay });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getStaysProfile = async (req, res) => {
  try {
    const provider = await serviceProviderModel.findById(req.user);
    if (!provider) return res.status(404).json({ success: false, message: "Service provider not found" });

    const stay = await staysModel.findById(provider.serviceId).populate("rooms");
    if (!stay) return res.status(404).json({ success: false, message: "Stay profile not found" });

    res.status(200).json({ success: true, data: stay });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getAllStays = async (req, res) => {
  try {
    const stays = await staysModel.find({});
    res.status(200).json({ success: true, count: stays.length, data: stays });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ------------------------- Rooms -------------------------
export const addRoom = async (req, res) => {
  try {
    if (req.role !== "provider") return res.status(403).json({ success: false, message: "You are not allowed" });

    const { roomType, price, maxGuest, bedType, images, features } = req.body;
    const provider = await serviceProviderModel.findById(req.user);
    if (!provider) return res.status(404).json({ success: false, message: "Service provider not found" });

    const stay = await staysModel.findById(provider.serviceId).populate("rooms");
    if (!stay) return res.status(404).json({ success: false, message: "Stay not found" });

    const newRoom = await roomModel.create({ roomType, price, maxGuest, bedType, images, features });
    stay.rooms.push(newRoom._id);
    await stay.save();

    res.status(201).json({ success: true, message: "Room added successfully", data: { room: newRoom, stay } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    if (req.role !== "provider") return res.status(403).json({ success: false, message: "You are not allowed" });

    const { roomId } = req.params;
    const provider = await serviceProviderModel.findById(req.user);
    if (!provider) return res.status(404).json({ success: false, message: "Service provider not found" });

    const stay = await staysModel.findById(provider.serviceId);
    if (!stay || !stay.rooms.includes(roomId)) return res.status(403).json({ success: false, message: "Not authorized" });

    const updatedRoom = await roomModel.findByIdAndUpdate(roomId, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: "Room updated successfully", data: updatedRoom });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    if (req.role !== "provider") return res.status(403).json({ success: false, message: "You are not allowed" });

    const { roomId } = req.params;
    const provider = await serviceProviderModel.findById(req.user);
    if (!provider) return res.status(404).json({ success: false, message: "Service provider not found" });

    const stay = await staysModel.findById(provider.serviceId);
    if (!stay || !stay.rooms.includes(roomId)) return res.status(403).json({ success: false, message: "Not authorized" });

    await roomModel.findByIdAndDelete(roomId);
    stay.rooms = stay.rooms.filter(id => id.toString() !== roomId.toString());
    await stay.save();

    res.status(200).json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ------------------------- Booking -------------------------
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
      return res.status(400).json({ success: false, message: "Please provide start_date, end_date, and location" });
    }

    const guestCount = numberOfGuest ? parseInt(numberOfGuest) : 1;
    const roomCount = numberOfRooms ? parseInt(numberOfRooms) : 1;
    const minPriceFilter = minPrice ? parseFloat(minPrice) : null;
    const maxPriceFilter = maxPrice ? parseFloat(maxPrice) : null;

    const staysFilters = { location };
    if (staysFacilities?.length > 0) staysFilters.facilities = { $all: staysFacilities };

    const roomsFilters = { path: "rooms" };
    if (roomFacilities?.length > 0) roomsFilters.match = { features: { $all: roomFacilities } };

    const allStays = await staysModel.find(staysFilters).populate(roomsFilters);

    const bookings = await staysBookingModel.find({
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { start_date: { $lte: new Date(end_date), $gte: new Date(start_date) } },
        { end_date: { $lte: new Date(end_date), $gte: new Date(start_date) } },
        { start_date: { $lte: new Date(start_date) }, end_date: { $gte: new Date(end_date) } }
      ]
    });

    const result = allStays.map(stay => {
      const bookedRoomIds = bookings
        .filter(b => b.serviceId.toString() === stay._id.toString())
        .map(b => b.roomId?.toString())
        .filter(Boolean);

      let availableRooms = stay.rooms.filter(room => !bookedRoomIds.includes(room._id.toString()));

      if (minPriceFilter !== null || maxPriceFilter !== null) {
        availableRooms = availableRooms.filter(room => {
          const price = room.price || 0;
          return (minPriceFilter === null || price >= minPriceFilter) && (maxPriceFilter === null || price <= maxPriceFilter);
        });
      }

      if (availableRooms.length < roomCount) return null;

      availableRooms.sort((a, b) => (b.maxGuest || 0) - (a.maxGuest || 0));
      const selectedRooms = availableRooms.slice(0, roomCount);
      const totalCapacity = selectedRooms.reduce((sum, room) => sum + (room.maxGuest || 0), 0);
      if (totalCapacity < guestCount) return null;

      const lowestPrice = Math.min(...availableRooms.map(r => r.price || 0));
      return { stay, rooms: availableRooms, totalAvailableRooms: availableRooms.length, starting_from: lowestPrice };
    }).filter(Boolean);

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const bookRoom = async (req, res) => {
  try {
    if (req.role !== "user") return res.status(403).json({ success: false, message: "You are not allowed to book services" });

    const { stayId, roomId, start_date, end_date } = req.body;
    if (!stayId || !roomId || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: "Please provide stayId, roomId, start_date and end_date" });
    }

    const stay = await staysModel.findById(stayId).populate("rooms");
    if (!stay) return res.status(404).json({ success: false, message: "Stay not found" });

    if (!stay.rooms.some(r => r._id.toString() === roomId)) {
      return res.status(400).json({ success: false, message: "Room does not belong to this stay" });
    }

    const conflict = await staysBookingModel.findOne({
      serviceId: stayId,
      roomId,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { start_date: { $lte: new Date(end_date), $gte: new Date(start_date) } },
        { end_date: { $lte: new Date(end_date), $gte: new Date(start_date) } },
        { start_date: { $lte: new Date(start_date) }, end_date: { $gte: new Date(end_date) } }
      ]
    });

    if (conflict) return res.status(400).json({ success: false, message: "Room is already booked for these dates" });

    const newBooking = await staysBookingModel.create({ user: req.user, serviceId: stayId, roomId, start_date, end_date, status: "pending" });
    res.status(201).json({ success: true, message: "Booking successful", data: newBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const changeBookingState = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (req.role !== "provider") return res.status(403).json({ success: false, message: "Not authorized" });

    const provider = await serviceProviderModel.findById(req.user);
    if (!provider) return res.status(404).json({ success: false, message: "Service provider not found" });

    const booking = await staysBookingModel.findById(bookingId);
    if (!booking || booking.serviceId.toString() !== provider.serviceId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this booking" });
    }

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid booking status" });
    }

    booking.status = status;
    await booking.save();
    res.status(200).json({ success: true, message: "Booking status updated successfully", data: booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
