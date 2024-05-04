const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const mongoose_delete = require("mongoose-delete");
const CategoriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
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

CategoriesSchema.plugin(mongoosePaginate);
CategoriesSchema.plugin(aggregatePaginate);
CategoriesSchema.plugin(mongoose_delete);
module.exports = mongoose.model("Categories", CategoriesSchema);
