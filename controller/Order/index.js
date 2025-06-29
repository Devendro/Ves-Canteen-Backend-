const orderModel = require("../../models/Order");
const crypto = require("crypto");
const OrderLog = require("../../models/OrderLog");
const { sendNotification } = require("../../middleware/pushNotification");
const mongoose = require("mongoose")

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


exports.getAllOrdersForChef = async (req, res) => {
  console.log(req.query)
  try {
    const {
      orderCompleted,
      orderCanceled,
      paymentSuccess,
      user,
      startDate,
      endDate,
      foodCategory,
      orderStatus,
      search, // <- this will be used for orderId search
      page = 1,
      limit = 10,
    } = req.query;

    const pipeline = [];

    const matchStage = { deleted: { $ne: true } };

    if (orderCompleted !== undefined)
      matchStage.orderCompleted = orderCompleted === "true";

    if (orderCanceled !== undefined)
      matchStage.orderCanceled = orderCanceled === "true";

    if (paymentSuccess !== undefined)
      matchStage.paymentSuccess = paymentSuccess === "true";

    if (user) matchStage.user = new mongoose.Types.ObjectId(user);

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    // Search by orderId (case-insensitive partial match)
    if (search) {
      matchStage.orderId = {
        $regex: new RegExp(search, "i"), // i = case-insensitive
      };
    }

    pipeline.push({ $match: matchStage });

    pipeline.push({ $unwind: "$order" });

    pipeline.push({
      $lookup: {
        from: "foods",
        localField: "order.food",
        foreignField: "_id",
        as: "order.foodDetails",
      },
    });
    pipeline.push({ $unwind: "$order.foodDetails" });

    if (foodCategory) {
      pipeline.push({
        $match: {
          "order.foodDetails.category": new mongoose.Types.ObjectId(foodCategory),
        },
      });
    }

    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "order.foodDetails.category",
        foreignField: "_id",
        as: "order.foodDetails.categoryDetails",
      },
    });
    pipeline.push({ $unwind: "$order.foodDetails.categoryDetails" });

    if (orderStatus) {
      pipeline.push({
        $match: {
          "order.orderStatus": orderStatus,
        },
      });
    }

    pipeline.push({
      $group: {
        _id: "$_id",
        orderCompleted: { $first: "$orderCompleted" },
        orderCanceled: { $first: "$orderCanceled" },
        paymentSuccess: { $first: "$paymentSuccess" },
        deleted: { $first: "$deleted" },
        orderId: { $first: "$orderId" },
        user: { $first: "$user" },
        order: { $push: "$order" },
        amount: { $first: "$amount" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        paymentId: { $first: "$paymentId" },
      },
    });

    pipeline.push({
      $project: {
        _id: 1,
        orderCompleted: 1,
        orderCanceled: 1,
        paymentSuccess: 1,
        deleted: 1,
        orderId: 1,
        user: 1,
        order: 1,
        amount: 1,
        createdAt: 1,
        updatedAt: 1,
        paymentId: 1,
      },
    });

    pipeline.push({ $sort: { createdAt: -1 } });

    const aggregatePipeline = orderModel.aggregate(pipeline);
    const result = await orderModel.aggregatePaginate(aggregatePipeline, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json(result);
  } catch (e) {
    console.error("Error fetching chef orders:", e);
    res.status(500).json({ error: "Something went wrong" });
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const orderData = req?.body
    const user = req?.user
    const order = await orderModel.findOneAndUpdate({ "order._id": orderData.orderId }, { $set: { "order.$.orderStatus": orderData?.newStatus } }, { new: true })
    if (order) {
      global.io.emit("orderStatusUpdate", { mainOrderId: order?._id, orderId: orderData.orderId, orderStatus: orderData?.newStatus, user: order?.user })
      const orderLog = new OrderLog({
        orderId: orderData.orderId,
        mainOrderId: order?._id,
        user: order.user,
        chef: user?._id,
        log: orderData?.newStatus,
        completed: orderData?.completed == "true" || orderData?.completed == true ? true : false
      })

      let body = "";
      switch (orderData?.newStatus) {
        case "Preparing":
          body = "Your food is being prepared.";
          break;

        case "Complete":
          body = "Your order is ready for pickup.";
          break;

        case "Collected":
          body = "Your order has been collected. Enjoy your meal!";
          break;

        default:
          console.log("Invalid order status.");
      }
      await sendNotification(
        user?.notificationToken,
        { title: "Order " + orderData?.newStatus, body: body }
      );
      await orderLog.save();
    }
    res.status(201).json(order)
  }
  catch (e) { }
}