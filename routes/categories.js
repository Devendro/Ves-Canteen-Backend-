const controller = require("../controller/Categories");
const validate = require("../controller/Categories/validation");
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
    cb(null, "./assets/categories");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const uploadStrategy = multer({ storage: storage });

router.post(
  "/createCategory",
  requireAuth,
  trimRequest.all,
  uploadStrategy.single("image"),
  validate.createCategory,
  controller.createCategory
);

router.get(
  "/getCategories",
  // requireAuth,
  trimRequest.all,
  controller.getCategories
);

module.exports = router;
