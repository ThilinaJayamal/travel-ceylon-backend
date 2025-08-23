import guideModel from "../models/Guide.js";
import ServiceProvider from "../models/ServiceProvider.js";

export const guideRegister = async (req, res) => {
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

        // Create new guide
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

        // Link the guide to the service provider
        provider.serviceId = newGuide._id;
        provider.serviceType = "guide";
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
