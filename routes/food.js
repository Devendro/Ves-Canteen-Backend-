const controller = require("../controller/Food");
const validate = require("../controller/Food/validation");
const express = require("express");
const router = express.Router();
require("../config/passport");
const trimRequest = require("trim-request");
const passport = require("passport");
const multer = require("multer");
const path = require("path");

const requireAuth = passport.authenticate("jwt", {
  session: false,
});

const requireAdminAuth = passport.authenticate("jwt-admin", {
  session: false,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./assets/food");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const uploadStrategy = multer({ storage: storage });

// Route to create a food item by admin
router.post(
  "/createFood",
  requireAuth,
  trimRequest.all,
  uploadStrategy.single("image"),
  validate.createFood,
  controller.createFood
);

// Route to get a food list 
router.get(
  "/getFoods",
  trimRequest.all,
  controller.getFoods
);

// Route to get a food list 
router.post(
  "/sendNotification",
  trimRequest.all,
  controller.sendNotification
);

// Route to get a food list 
router.get(
  "/searchFoods",
  trimRequest.all,
  controller.searchFoods
);

module.exports = router;
