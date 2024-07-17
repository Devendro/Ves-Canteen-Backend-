const orderModel = require("../../models/Order");
const utils = require("../../middleware/utils");
const crypto = require("crypto");

exports.createOrder = async (req, res) => {
  try {
    // Generate main orderId
    const timestamp = Date.now().toString(36); // Convert timestamp to base36
    const randomString = crypto.randomBytes(3).toString("hex"); // Generate a random 3-byte hex string
    const mainOrderId = `${timestamp}${randomString}`;

    // Generate orderIds for each item in the order array
    const orderItems = req.body.order.map((item) => {
      const itemTimestamp = Date.now().toString(36); // Convert timestamp to base36
      const itemRandomString = crypto.randomBytes(3).toString("hex"); // Generate a random 3-byte hex string
      const itemOrderId = `${itemTimestamp}${itemRandomString}`;

      return {
        ...item,
        orderId: itemOrderId,
      };
    });

    // Create order object
    const orderData = {
      orderId: mainOrderId,
      user: req?.user?._id,
      order: orderItems,
      amount: req.body.amount,
      paymentId: req.body.paymentId,
    };

    // Save order to the database
    const newOrder = new orderModel(orderData);
    const response = await newOrder.save();

    res
      .status(201)
      .json({ msg: "Order Created Successfully", orderId: newOrder.orderId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Failed to create order", error: e.message });
  }
};

exports.updateOrderPaymentStatus = async (req, res) => {
  try {
    const { orderId, paymentSuccess, paymentId } = req.body;
    const response = await orderModel.findOneAndUpdate(
      { orderId, orderId },
      { paymentSuccess, paymentId }
    );
    res.status(201).json({ msg: "Order Status Updated Successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Failed to create order", error: e.message });
  }
};

exports.getAllOrdersForUser = async (req, res) => {
  try {
    const user = req?.user?._id;

    let pipeline = [
      {
        $match: {
          user: user,
        },
      },
      {
        $unwind: "$order",
      },
      {
        $lookup: {
          from: "foods",
          localField: "order.food",
          foreignField: "_id",
          as: "order.foodDetails",
        },
      },
      {
        $unwind: "$order.foodDetails",
      },
      {
        $lookup: {
          from: "categories",
          localField: "order.foodDetails.category",
          foreignField: "_id",
          as: "order.foodDetails.categoryDetails",
        },
      },
      {
        $unwind: "$order.foodDetails.categoryDetails",
      },
      {
        $group: {
          _id: "$_id",
          orderCompleted: { $first: "$orderCompleted" },
          orderCanceled: { $first: "$orderCanceled" },
          paymentSuccess: { $first: "$paymentSuccess" },
          deleted: { $first: "$deleted" },
          orderId: { $first: "$orderId" },
          user: { $first: "$user" },
          orders: { $push: "$order" },
          amount: { $first: "$amount" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          paymentId: { $first: "$paymentId" },
        },
      },
      {
        $project: {
          _id: 1,
          orderCompleted: 1,
          orderCanceled: 1,
          paymentSuccess: 1,
          deleted: 1,
          orderId: 1,
          user: 1,
          orders: 1,
          amount: 1,
          createdAt: 1,
          updatedAt: 1,
          paymentId: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];

    const aggregatePipeline = orderModel.aggregate(pipeline);
    const result = await orderModel.aggregatePaginate(aggregatePipeline);
    res.status(200).json(result);
  } catch (e) {
    console.log(e);
  }
};
