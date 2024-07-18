const controller = require("../controller/Auth");
const validate = require("../controller/Auth/validation");
const express = require("express");
const router = express.Router();
require("../config/passport");
const trimRequest = require("trim-request");
const passport = require("passport");
const requireAuth = passport.authenticate("jwt", {
  session: false,
});

const requireAdminAuth = passport.authenticate("jwt-admin", {
  session: false,
});

/*
 * Register route
 */
router.post(
  "/register",
  trimRequest.all,
  validate.register,
  controller.register
);

/*
 * Login route
 */
router.post("/login", trimRequest.all, validate.login, controller.login);

/*
 * change Password route
 */
router.post(
  "/changePassword",
  requireAuth,
  trimRequest.all,
  validate.changePassword,
  controller.changePassword
);

/*
 * change Password route
 */
router.put(
  "/updateNotificationToken",
  requireAuth,
  trimRequest.all,
  controller.updateNotificationToken
);


// /*
//  * logout route
//  */
// router.get("/logout", requireAuth, trimRequest.all, controller.logout);

// /*
//  * forgot Password route
//  */
// router.post(
//   "/forgotPassword",
//   trimRequest.all,
//   validate.forgotPassword,
//   controller.forgotPassword
// );



// /*
//  * forgot Password route
//  */
// router.post(
//   "/resetPassword",
//   trimRequest.all,
//   validate.resetPassword,
//   controller.resetPassword
// );

// /*
//  * Account Setup Update
//  */
// router.post(
//   "/accountUpdate",
//   trimRequest.all,
//   validate.accountUpdate,
//   controller.accountUpdate
// );

// /*
//  * password expired route
//  */
// router.post(
//   "/passwordExpired",
//   trimRequest.all,
//   validate.passwordExpired,
//   controller.passwordExpired
// );

module.exports = router;
