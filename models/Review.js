const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const mongoose_delete = require("mongoose-delete");
const ReviewSchema = new mongoose.Schema({
    orderId: {
        type: String,
        index: true
    },
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "food",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    }
},
    {
        versionKey: false,
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        collation: { locale: "en" },
    }
);

ReviewSchema.plugin(mongoosePaginate);
ReviewSchema.plugin(aggregatePaginate);
ReviewSchema.plugin(mongoose_delete);
module.exports = mongoose.model("Review", ReviewSchema);
