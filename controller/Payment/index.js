const Razorpay = require("razorpay");
const Payment = require("../../models/Payment");
const axios = require("axios");
const razorpayInstance = new Razorpay({
  key_id: "rzp_test_SfVaaoQThe4gZv",
  key_secret: "YOYKg2vGJh8tO5EaNhvwwN7Y",
});

exports.createPaymentOrder = async (req, res) => {
  try {
    const amount = req.body.amount * 100;
    const options = {
      amount: amount,
      currency: "INR",
      receipt: req?.user?.email,
    };

    razorpayInstance.orders.create(options, (err, order) => {
      if (!err) {
        res.status(200).json({
          success: true,
          msg: "Order Created",
          order_id: order.id,
          amount: amount,
          key_id: "rzp_test_SfVaaoQThe4gZv",
          name: req.user.name,
          email: req.user.email,
        });
      } else {
        res.status(400).json({ success: false, msg: "Something went wrong" });
      }
    });
  } catch (e) {}
};

const getPaymentDetails = async (paymentId) => {
  try {
    const response = await axios.get(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        auth: {
          username: "rzp_test_SfVaaoQThe4gZv",
          password: "YOYKg2vGJh8tO5EaNhvwwN7Y",
        },
      }
    );

    const paymentDetails = response.data;
    return paymentDetails;
    // Process payment details as needed
  } catch (error) {
    console.error("Error fetching payment details:", error);
  }
};

exports.createPayment = async (req, res) => {
  try {
    let paymentdata = req.body;
    paymentdata.user = req?.user?._id;
    const paymentaDetails = await getPaymentDetails(req?.body?.paymentId);
    paymentdata.amount = paymentaDetails?.amount / 100;
    paymentdata.method = paymentaDetails?.method;
    const newPayment = new Payment(paymentdata);
    await newPayment.save();
    res.status(201).json({ msg: "Payment Created Succesfully" });
  } catch (e) {}
};
