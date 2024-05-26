const Razorpay = require("razorpay");
const Payment = require("../../models/Payment");
const razorpayInstance = new Razorpay({
  key_id: process.env.razorpay_key,
  key_secret: process.env.razorpay_secret,
});

exports.createPaymentOrder = async (req, res) => {
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
        key_id: process.env.razorpay_key,
        name: req.user.name,
        email: req.user.email,
      });
    } else {
      res.status(400).json({ success: false, msg: "Something went wrong" });
    }
  });
};

exports.createPayment = async (req, res) => {
  try {
    let paymentdata = req.body;
    paymentdata.user = req.user._id;
    const newPayment = new Payment(paymentdata);
    await newPayment.save();
    res.status(201).json({msg: "Payment Created Succesfully"})
  } catch (e) {

  }
};
