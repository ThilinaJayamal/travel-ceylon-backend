import reviewModel from "../models/Review.js";
import userModel from "../models/User.js";

export const addReview = async (req, res) => {
    console.log(req.body)
    try {
        const user = await userModel.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { serviceId, serviceType, comment, rating } = req.body;

        const review = reviewModel.findOne({
            user: user,
            serviceId: serviceId,
            serviceType: serviceType
        });
        if (review) {
            return res.status(401).json({ message: "You have alredy reviewed this service" })
        }

        if (!serviceId || !serviceType || rating === undefined) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newReview = await reviewModel.create({
            user: user._id,
            serviceId,
            serviceType,
            comment,
            rating
        });

        return res.status(201).json(newReview);

    } catch (error) {
        console.error("Error adding review:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, rating } = req.body;

        const review = await reviewModel.findById(id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.user.toString() !== req.user) {
            return res.status(403).json({ message: "You can only update your own review" });
        }

        if (comment !== undefined) {
            review.comment = comment;
        }
        if (rating !== undefined) {
            review.rating = rating;
        }

        await review.save();

        return res.status(200).json({ message: "Review updated successfully", review });

    } catch (error) {
        console.error("Error updating review:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await reviewModel.findById(id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.user.toString() !== req.user) {
            return res.status(403).json({ message: "You can only delete your own review" });
        }

        await review.deleteOne();

        return res.status(200).json({ message: "Review deleted successfully" });

    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const getAllReviews = async (req, res) => {
    try {
        const { serviceId, serviceType } = req.params;

        if (!serviceId || !serviceType) {
            return res.status(400).json({ message: "serviceId and serviceType are required" });
        }

        const reviews = await reviewModel.find(
            {
                serviceId: serviceId,
                serviceType: serviceType
            }
        )
        return res.status(200).json(reviews);

    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};


