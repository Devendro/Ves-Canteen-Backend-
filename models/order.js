const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const mongoose_delete = require("mongoose-delete");
const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      index: true
    },
    order: [
      {
        orderId: {
          type: String,
          index: true
        },
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "food",
        },
        count: {
          type: Number,
          default: 1
        },
        preparationNote: {
          type: String
        },
        orderStatus: {
          type: String,
          default: "Order Received"
        },
        orderCompleted: {
          type: Boolean,
          default: false,
        },
        orderCanceled: {
          type: Boolean,
          default: false,
        },
      },
    ],
    amount: {
      type: Number,
    },
    orderStatus: {
      type: String,
    },
    orderCompleted: {
      type: Boolean,
      default: false,
    },
    orderCanceled: {
      type: Boolean,
      default: false,
    },
    paymentSuccess: {
      type: Boolean,
      default: false
    },
    paymentId: {
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

OrderSchema.plugin(mongoosePaginate);
OrderSchema.plugin(aggregatePaginate);
OrderSchema.plugin(mongoose_delete);
module.exports = mongoose.model("Order", OrderSchema);
