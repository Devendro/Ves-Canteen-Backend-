const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const mongoose_delete = require("mongoose-delete");
const mongoosastic = require("mongoosastic")
const FoodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
    },
    description: {
      type: String,
      index: true,
    },
    image: {
      type: String,
    },
    likes: {
      type: Number,
    },
    dislikes: {
      type: Number,
    },
    price: {
      type: Number,
    },
    veg: {
      type: Boolean,
      index: true,
    },
    preparation_time: {
      type: Number,
    },
    daily_availibility: {
      type: Number,
    },
    available: {
      type: Boolean
    },
    totalOrders: {
      default: 0,
      type: Number,
    }
  },
  {
    versionKey: false,
    timestamps: true,
    // timestamps: { createdAt: false, updatedAt: false },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collation: { locale: "en" },
  }
);

FoodSchema.plugin(mongoosePaginate);
FoodSchema.plugin(aggregatePaginate);
FoodSchema.plugin(mongoose_delete);
FoodSchema.plugin(mongoosastic, {
  clientOptions: { nodes: [`${process.env.ELASTIC_HOST}`] },
  type: '_food'
})
module.exports = mongoose.model("Food", FoodSchema);
