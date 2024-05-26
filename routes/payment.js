const controller = require("../controller/Payment");
const express = require("express");
const router = express.Router();
require("../config/passport");
const trimRequest = require("trim-request");
const passport = require("passport");
const requireAuth = passport.authenticate("jwt", {
  session: false,
});

/*
 * create Payment Order Id in Razorpay
 */
router.post(
  "/createPaymentOrder",
  requireAuth,
  trimRequest.all,
  controller.createPaymentOrder
);

/*
 * create Payment in database
 */
router.post(
  "/createPayment",
  requireAuth,
  trimRequest.all,
  controller.createPayment
);

module.exports = router;