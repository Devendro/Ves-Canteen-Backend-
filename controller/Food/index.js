const foodModel = require("../../models/Food");
const utils = require("../../middleware/utils");
const mongoose = require("mongoose");
const { sendNotification } = require("../../middleware/pushNotification");
var elasticsearch = require("elasticsearch");
var client = new elasticsearch.Client({
  hosts: [`${process.env.ELASTIC_HOST}`],
});

/**
 * Create Food function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.createFood = async (req, res) => {
  try {
    const data = req.body;
    data.image = "/food/" + req?.file?.filename;
    const newFood = new foodModel(req.body);
    const response = await newFood.save();
    global.io.emit("fooditem", { data: response });
    res.status(201).json(response);
  } catch (error) {
    console.log(error);
    utils.handleError(res, error);
  }
};

/**
 * Get Food function called by route
 * @param {Object} req - request object
 * @param {Object} res - response array
 */
exports.getFoods = async (req, res) => {
  try {
    const options = {
      page: req?.query.page || 1,
      limit: req?.query?.limit || 10,
    };

    let pipeline = [];

    if (req?.query?.category) {
      pipeline.push({
        $match: {
          category: mongoose.Types.ObjectId(req?.query?.category),
        },
      });
    }

    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryData",
      },
    });

    let aggregatePipeline = foodModel.aggregate(pipeline);

    const result = await foodModel.aggregatePaginate(
      aggregatePipeline,
      options
    );
    res.status(200).json(result);
  } catch (error) {
    utils.handleError(res, error);
  }
};

exports.sendNotification = async (req, res) => {
  try {
    const response = await sendNotification(
      "ExponentPushToken[mUMHs6JfowXVtRW9eaAow4]",
      "hello"
    );
    return res.status(200).json(response);
  } catch (error) {}
};

exports.searchFoods = async (req, res) => {
  try {
    var condition = [];
    if (req?.query?.name) {
      condition.push({
        multi_match: {
          fields: ["name", "description"],
          query: req.query.name,
          fuzziness: "AUTO",
          prefix_length: 3, // Adjust as needed
          max_expansions: 50, // Adjust as needed
          operator: "OR",
        },
      });
    }
    const results = await client.search({
      index: "foods",
      body: {
        query: {
          bool: {
            must: condition,
          },
        },
      },
    });

    console.log(results);
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    utils.handleError(res, error);
  }
};
