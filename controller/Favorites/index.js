const favoriteModel = require("../../models/Favorites");
const utils = require("../../middleware/utils");
const mongoose = require("mongoose");

/**
 * Update Favorite function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateFavorite = async (req, res) => {
    try {
        const userId = req?.user?._id;
        const { food, like } = req.body;

        console.log(like)
        // Validate userId and food
        if (!userId || !food) {
            return res.status(400).json({ message: "User ID and Food ID are required" });
        }

        if (like) {
            // Add to favorites or update if it exists
            await favoriteModel.updateOne(
                { user: userId, food: food },
                { $set: { user: userId, food: food } },
                { upsert: true }
            );
            return res.status(201).json({ message: "Added to favorites", liked: true });
        } else {
            // Remove from favorites
            await favoriteModel.deleteOne({ user: userId, food: food });
            return res.status(200).json({ message: "Removed from favorites", liked: false });
        }
    } catch (error) {
        utils.handleError(res, error);
    }
};