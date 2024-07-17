const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const mongoose_delete = require("mongoose-delete");
const PaymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      index: true,
    },
    orderId: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    paymentStatus: {
      type: Boolean,
    },
    amount: {
      type: Number,
    },
    method: {
      type: String,
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

PaymentSchema.plugin(mongoosePaginate);
PaymentSchema.plugin(aggregatePaginate);
PaymentSchema.plugin(mongoose_delete);
module.exports = mongoose.model("Payment", PaymentSchema);
