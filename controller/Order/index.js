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
      order: orderItems,
      amount: req.body.amount,
      paymentId: req.body.paymentId,
    };

    // // Save order to the database
    const newOrder = new orderModel(orderData);
    await newOrder.save();

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
    console.log(response);
    res.status(201).json({ msg: "Order Status Updated Successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Failed to create order", error: e.message });
  }
};
