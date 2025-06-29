const foodModel = require("../../models/Food");
const utils = require("../../middleware/utils");
const mongoose = require("mongoose");
const { sendNotification } = require("../../middleware/pushNotification");

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
    const userId = req?.query?.user
    console.log(userId)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let pipeline = [];
    let compoundQuery = { filter: [], must: [] };

    if (req.query.keyword) {
      compoundQuery.should = [
        {
          text: {
            path: "name",
            query: req.query.keyword,
            fuzzy: {},
          },
        },
      ];
    }

    if (req.query.category) {
      compoundQuery.filter.push({
        equals: {
          path: "category",
          value: mongoose.Types.ObjectId(req.query.category),
        },
      });
    }

    if (req.query._id) {
      compoundQuery.mustNot = [
        {
          equals: {
            path: "_id",
            value: mongoose.Types.ObjectId(req.query._id),
          },
        },
      ];
    }

    // If there are any query parameters, use the $search aggregation stage.
    if (req.query._id || req.query.category || req.query.keyword) {
      pipeline.push({
        $search: {
          index: "default",
          compound: compoundQuery,
        },
      });

      pipeline.push(
        {
          $addFields: {
            score: { $meta: "searchScore" },
          },
        },
        {
          $sort: {
            score: -1,
          },
        }
      );
    }

    pipeline.push(
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } }
    );

    // Check if food item is in user's favorites
    if (userId) {
      console.log("wewere")
      pipeline.push({
        $lookup: {
          from: "favorites", // Assuming "favorites" is the name of your separate collection
          let: { food: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", mongoose.Types.ObjectId(userId)] },
                    { $eq: ["$food", "$$food"] }
                  ]
                }
              }
            },
            { $project: { _id: 0, foodId: 1 } }
          ],
          as: "likedData"
        }
      });

      // Add a liked field based on whether there's a match in likedData
      pipeline.push({
        $addFields: {
          liked: { $gt: [{ $size: "$likedData" }, 0] }
        }
      });

      // Remove likedData field as it is no longer needed
      pipeline.push({ $unset: "likedData" });
    } else {
      // If user is not authenticated, set liked as false for all items
      pipeline.push({
        $addFields: {
          liked: false
        }
      });
    }

    // Clone the pipeline for counting total documents without pagination.
    const totalDocsPipeline = [...pipeline];
    totalDocsPipeline.push({ $count: "totalCount" });

    // Execute the aggregation pipeline with pagination.
    const result = await foodModel.aggregate(pipeline).skip(skip).limit(limit);

    // Execute the total documents count pipeline.
    const totalDocsResult = await foodModel.aggregate(totalDocsPipeline);
    const totalDocs = totalDocsResult[0]?.totalCount || 0;

    // Calculate pagination values
    const totalPages = Math.ceil(totalDocs / limit);
    const pagingCounter = skip + 1;
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    res.status(200).json({
      totalDocs,
      limit,
      page,
      totalPages,
      pagingCounter,
      hasPrevPage,
      hasNextPage,
      offset: skip,
      prevPage,
      nextPage,
      docs: result,
    });
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
  } catch (error) { }
};

exports.searchFoods = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let pipeline = [];

    // Add the $search stage to the pipeline
    pipeline.push({
      $search: {
        index: "default",
        compound: {
          should: [
            {
              text: {
                query: req.query.name,
                path: "name",
                fuzzy: {},
              },
            },
            {
              text: {
                query: req.query.name,
                path: "description",
                fuzzy: {},
              },
            },
          ],
        },
      },
    });

    // Add $project and $sort stages
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
          score: -1, // Sort by search score
        },
      }
    );

    // Manually apply pagination with $skip and $limit
    pipeline.push(
      { $skip: skip },
      { $limit: limit }
    );

    // Execute the aggregation pipeline
    const result = await foodModel.aggregate(pipeline);

    // Count total documents without applying skip and limit
    const totalResultsPipeline = pipeline.slice(0, -2); // Remove $skip and $limit for total count
    totalResultsPipeline.push({ $count: "total" });
    const totalResults = await foodModel.aggregate(totalResultsPipeline);

    const totalDocs = totalResults[0]?.total || 0;
    const totalPages = Math.ceil(totalDocs / limit);
    const pagingCounter = skip + 1;
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    res.status(200).json({
      totalDocs,
      limit,
      page,
      totalPages,
      pagingCounter,
      hasPrevPage,
      hasNextPage,
      offset: skip,
      prevPage,
      nextPage,
      docs: result,
    });
  } catch (error) {
    console.log(error);
    utils.handleError(res, error);
  }
};
