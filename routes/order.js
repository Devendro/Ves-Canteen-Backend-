const controller = require("../controller/Order");
const express = require("express");
const router = express.Router();
require("../config/passport");
const trimRequest = require("trim-request");
const passport = require("passport");
const requireAuth = passport.authenticate("jwt", {
  session: false,
});

/*
 * create order in database
 */
router.post(
  "/createOrder",
  requireAuth,
  trimRequest.all,
  controller.createOrder
);

/*
 * update payment status of order
 */
router.put(
  "/updateOrderPaymentStatus",
  requireAuth,
  trimRequest.all,
  controller.updateOrderPaymentStatus
);

module.exports = router;