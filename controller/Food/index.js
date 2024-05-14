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
    let compoundQuery = {};

    console.log(req?.query?.keyword)
    if (req?.query?.keyword) {
      compoundQuery = {
        ...compoundQuery,
        should: [
          {
            text: {
              path: "name",
              query: req?.query?.keyword,
              fuzzy: {},
            },
          },
        ],
      };
    }

    if (req?.query?.category) {
      compoundQuery = {
        ...compoundQuery,
        must: [
          {
            equals: {
              path: "category",
              value: mongoose.Types.ObjectId(req?.query?.category),
            },
          },
        ],
      };
    }

    if (req?.query?._id) {
      compoundQuery = {
        ...compoundQuery,
        mustNot: [
          {
            equals: {
              path: "_id",
              value: mongoose.Types.ObjectId(req?.query?._id),
            },
          },
        ],
      };
    }

    pipeline.push({
      $search: {
        index: "default",
        compound: compoundQuery,
      },
    });

    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryData",
      },
    });

    pipeline.push(
      {
        $addFields: {
          score: { $meta: "searchScore" }, // you are already adding the field here.
        },
      },
      {
        $sort: {
          score: -1, // use the new computed field here.
        },
      }
    );

    let aggregatePipeline = foodModel.aggregate(pipeline);

    const result = await foodModel.aggregatePaginate(
      aggregatePipeline,
      options
    );
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    utils.handleError(res, error);
  }
};

exports.sendNotification = async (req, res) => {
  try {
    const response = await sendNotification(
      "ExponentPushToken[Niz_RUAjwt1KexCIe_OYSy]",
      "hello Sid gadkar"
    );
    return res.status(200).json(response);
  } catch (error) {}
};

exports.searchFoods = async (req, res) => {
  try {
    let pipeline = [];

    pipeline.push({
      $search: {
        index: "default",
        compound: {
          should: [
            {
              text: {
                query: req?.query?.name,
                path: "name",
                fuzzy: {},
              },
            },
            {
              text: {
                query: req?.query?.name,
                path: "description",
                fuzzy: {},
              },
            },
          ],
        },
      },
    });

    pipeline.push(
      {
        $project: {
          name: 1,
          description: 1,
          score: { $meta: "searchScore" },
        },
      },
      {
        $sort: {
          score: -1, // use the new computed field here.
        },
      },
      {
        $limit: 10,
      }
    );

    let aggregatePipeline = foodModel.aggregate(pipeline);

    const result = await foodModel.aggregatePaginate(aggregatePipeline);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    utils.handleError(res, error);
  }
};
