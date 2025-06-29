const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const mongoose_delete = require("mongoose-delete");
const FavoritesSchema = new mongoose.Schema(
    {
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "food",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
    },
    {
        versionKey: false,
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        collation: { locale: "en" },
    }
);

FavoritesSchema.plugin(mongoosePaginate);
FavoritesSchema.plugin(aggregatePaginate);
FavoritesSchema.plugin(mongoose_delete);
module.exports = mongoose.model("Favorites", FavoritesSchema);
