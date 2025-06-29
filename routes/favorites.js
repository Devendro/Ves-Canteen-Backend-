const controller = require("../controller/Favorites");
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
  "/updateFavorite",
  requireAuth,
  trimRequest.all,
  controller.updateFavorite
);

module.exports = router;