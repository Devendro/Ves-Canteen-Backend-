const controller = require("../controller/Review");
const express = require("express");
const router = express.Router();
require("../config/passport");
const trimRequest = require("trim-request");
const passport = require("passport");
const requireAuth = passport.authenticate("jwt", {
    session: false,
});

/*
 * create rating in database
 */
router.post(
    "/createRating",
    requireAuth,
    trimRequest.all,
    controller.createRating
);

router.get(
    "/getUserRatings",
    requireAuth,
    trimRequest.all,
    controller.getUserRatings
);

module.exports = router;