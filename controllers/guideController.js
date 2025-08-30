import guideModel from "../models/Guide.js";
import serviceProviderModel from "../models/ServiceProvider.js";

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

export const getAllGuides = async (req,res) => {
    try {
        const guides = await guideModel.find({});

        return res.status(200).json({
            success: true,
            count:guides.length,
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
