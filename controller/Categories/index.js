const categoryModel = require("../../models/Categories");
const utils = require("../../middleware/utils");


exports.createCategory = async (req, res) => {
  try {
    const data = req.body;
    data.image = "/categories/" + req.file.filename;
    const newCategory = new categoryModel(req.body);
    const response = await newCategory.save();
    res.status(201).json(response);
  } catch (error) {
    utils.handleError(res, error);
  }
};

exports.getCategories = async (req, res) => {
  try {
    const options = {
      page: req?.query.page || 1,
      limit: req?.query?.limit || 10,
    };

    const result = await categoryModel.aggregatePaginate([], options);
    res.status(200).json(result);
  } catch (error) {
    utils.handleError(res, error);
  }
};
