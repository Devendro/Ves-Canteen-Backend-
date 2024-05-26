const { validationResult } = require("../../middleware/utils");
const { check } = require("express-validator");

exports.createOrder = [
  check("name")
    .optional()
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
  (req, res, next) => {
    validationResult(req, res, next);
  },
];
