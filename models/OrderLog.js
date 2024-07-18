const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const mongoose_delete = require("mongoose-delete");
const OrderLogSchema = new mongoose.Schema({
    orderId: {
        type: String,
        index: true
    },
    mainOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "orders",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    chef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    log: {
        type: String
    },
    completed: {
        type: Boolean,
        default: false
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

OrderLogSchema.plugin(mongoosePaginate);
OrderLogSchema.plugin(aggregatePaginate);
OrderLogSchema.plugin(mongoose_delete);
module.exports = mongoose.model("OrderLog", OrderLogSchema);
