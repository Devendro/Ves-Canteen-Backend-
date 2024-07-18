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

/*
 * get order of user from database
 */
router.get(
  "/getAllOrdersForUser",
  requireAuth,
  trimRequest.all,
  controller.getAllOrdersForUser
);


/*
 * get order for chef from database
 */
router.get(
  "/getAllOrdersForChef",
  // requireAuth,
  trimRequest.all,
  controller.getAllOrdersForChef
);


/*
 * update order status 
 */
router.put(
  "/updateOrderStatus",
  requireAuth,
  trimRequest.all,
  controller.updateOrderStatus
);

module.exports = router;