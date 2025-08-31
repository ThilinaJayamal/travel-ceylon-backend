import guideModel from "../models/Guide.js";
import serviceProviderModel from "../models/ServiceProvider.js";
import guideBookingModel from "../models/Bookings/GuideBooking.js"

export const guideRegister = async (req, res) => {
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

        const newGuide = await guideModel.create({
            name: req.body.name,
            nic: req.body.nic,
            contact: req.body.contact || [],
            profilePic: req.body.profilePic,
            images: req.body.images || [],
            specializeArea: req.body.specializeArea,
            province: req.body.province,
            district: req.body.district,
            city: req.body.city,
            languages: req.body.languages,
            guideLicenceImg: req.body.guideLicenceImg,
            nicImg: req.body.nicImg,
            policeClearanceImg: req.body.policeClearanceImg,
        });

        provider.serviceId = newGuide._id;
        provider.serviceType = "Guide";
        await provider.save();

        res.status(201).json({
            message: "Guide registered successfully",
            guide: newGuide,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json("Server Error");
    }
};

export const getGuideProfile = async (req, res) => {
    try {
        const serviceProvider = await serviceProviderModel.findById(req.user)
        if (!serviceProvider) {
            return res.status(404).json({ message: "service provider not found" })
        }

        const guide = await guideModel.findById(serviceProvider?.serviceId);
        if (!guide) {
            return res.status(404).json({ message: "guide profile not found" });
        }

        return res.status(200).json({
            success: true,
            guide: guide,
        })
    } catch (error) {
        res.status(500).json("Server Error")
    }
}

export const getGuideProfilePublic = async (req, res) => {
    try {
        const guide = await serviceProviderModel
            .find({ serviceType: "Stays" })
            .populate({
                path: "serviceId",
                populate: {
                    path: "rooms",
                }
            })
            .select("-password");

        return res.status(200).json({
            success: true,
            guide: guide
        })
    } catch (error) {
        res.status(500).json("Server Error")
    }
}

export const getAllGuides = async (req, res) => {
    try {
        const guides = await guideModel.find({});

        return res.status(200).json({
            success: true,
            count: guides.length,
            guides: guides
        })
    } catch (error) {
        res.status(500).json("Server Error")
    }
}

export const updateGuide = async (req, res) => {
    try {
        const serviceProvider = await serviceProviderModel.findById(req.user);
        if (!serviceProvider) {
            return res.status(404).json({ message: "Service provider account not found" });
        }

        const guide = await guideModel.findById(serviceProvider.serviceId);
        if (!guide) {
            return res.status(404).json({ message: "Guide account not found" });
        }

        const {
            name,
            profilePic,
            images,
            specializeArea,
            province,
            district,
            city,
            languages,
            contact
        } = req.body;

        if (name) guide.name = name;
        if (contact) guide.contact = contact;
        if (profilePic) guide.profilePic = profilePic;
        if (images) guide.images = images;
        if (specializeArea) guide.specializeArea = specializeArea;
        if (province) guide.province = province;
        if (district) guide.district = district;
        if (city) guide.city = city;
        if (languages) guide.languages = languages;

        await guide.save();

        res.status(200).json({ message: "Guide updated successfully", guide });
    } catch (error) {
        console.error(error);
        res.status(500).json("Server Error");
    }
};

export const getAvailableGuides = async (req, res) => {
    try {
        const { date, time } = req.query;

        if (!date || !time) {
            return res.status(400).json({ message: "Please provide both date and time" });
        }

        // Find all guides
        const allGuides = await guideModel.find();

        // Find all bookings that match this date + time (and not cancelled)
        const bookedGuides = await guideBookingModel.find({
            date: new Date(date),
            status: { $in: ["pending", "confirmed"] } // block only active bookings
        }).select("serviceId");

        const bookedGuideIds = bookedGuides.map(b => b.serviceId.toString());

        // Filter only available guides
        const available = allGuides.filter(
            g => !bookedGuideIds.includes(g._id.toString())
        );

        res.status(200).json(available);

    } catch (error) {
        console.error("Error checking guide availability:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createGuideBooking = async (req, res) => {
    try {
        if(req.role !== "user"){
            return res.status(401).json({
                success:false,
                message:"You are not allowed to book services"
            })
        }

        const { serviceId, date, time, requests } = req.body;
        const userId = req.user; // assuming you use JWT auth

        // Check if guide already booked
        const existingBooking = await guideBookingModel.findOne({
            serviceId,
            date: new Date(date),
            time,
            status: { $in: ["pending", "confirmed"] }
        });

        if (existingBooking) {
            return res.status(400).json({ message: "Guide is not available at this time" });
        }

        // Create new booking
        const newBooking = await guideBookingModel.create({
            user: userId,
            serviceId,
            date,
            time,
            requests
        });

        res.status(201).json(newBooking);
    } catch (error) {
        console.error("Error creating guide booking:", error);
        res.status(500).json({ message: "Server error" });
    }
};
