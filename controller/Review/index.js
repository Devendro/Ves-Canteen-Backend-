const mongoose = require("mongoose")
const reviewModel = require("../../models/Review")
const utils = require("../../middleware/utils")

exports.createRating = async (req, res) => {
    try {
        const user = req?.user?._id
        const reviewData = { ...req?.body, user: user }
        const review = new reviewModel(reviewData)
        const result = await review.save();
        res.status(201).json(result)
    } catch (error) {
        utils.handleError(res, error);
    }
}

exports.getUserRatings = async (req, res) => {
    try {
        const user = req?.user?._id
        const options = {
            page: req?.query.page || 1,
            limit: req?.query?.limit || 10,
        };

        let pipeline = []
        pipeline.push({
            $match: {
                user: mongoose.Types.ObjectId(user)
            }
        })

        let aggregatePipeline = reviewModel.aggregate(pipeline);
        const result = await reviewModel.aggregatePaginate(
            aggregatePipeline,
            options
        );

        return res.status(200).json(result)
    } catch (error) {
        utils.handleError(res, error);
    }
}