const { validationResult } = require("../../middleware/utils");
const { check } = require("express-validator");

exports.createFood = [
  check("name")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY"),
  check("category")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY"),
  check("description")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY"),
  check("price")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY"),
  check("veg")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .isBoolean()
    .withMessage("MUST_BE_BOOLEAN"),
  check("preparation_time")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .isNumeric()
    .withMessage("MUST_BE_NUMBER"),
  check("daily_availibility")
    .optional()
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .isNumeric()
    .withMessage("MUST_BE_NUMBER"),
  check("available")
    .optional()
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .isBoolean()
    .withMessage("MUST_BE_BOOLEAN"),
  (req, res, next) => {
    validationResult(req, res, next);
  },
];
