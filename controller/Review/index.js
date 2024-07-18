const reviewModel = require("../../models/Review")

exports.createRating = async (req, res) => {
    try {
        const user = req?.user?._id
        const reviewData = { ...req?.body, user: user }
        const review = new reviewModel(reviewData)
        const result = await review.save();
        res.status(201).json(result)
    } catch (e) {

    }
}