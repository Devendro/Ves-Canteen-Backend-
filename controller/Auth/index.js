const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");

/**
 * Generates a token
 * @param {Object} user - user object
 */
const generateToken = (user) => {
  // Gets expiration time
  const expiration = Math.floor(Date.now() / 1000) + 60 * 14400;

  // returns signed and encrypted token
  return auth.encrypt(
    jwt.sign(
      {
        data: {
          _id: user,
        },
        exp: expiration,
      },
      "VesitCanteen"
    )
  );
};

exports.register = async (req, res) => {
  const userExist = await User.findOne({ email: req?.body?.email });
  if (userExist) {
    res.status(400).json({ error: { msg: "user already exist" } });
  } else {
    const response = await User.create(req?.body);
    res.status(201).json({ msg: "Account Created Succesfully" });
  }
};

exports.login = async (req, res) => {
  try {
    const userExist = await User.findOne({ email: req?.body?.email });
    if (userExist) {
      const isPasswordMatch = await auth.checkPassword(
        req?.body?.password,
        userExist
      );
      if (isPasswordMatch) {
        if (userExist?.accountStatus) {
          const data = {
            ...userExist.toObject(),
            token: generateToken(userExist?._id, "user"),
          };
          return res.status(200).json({ msg: "Login Succesfull", data: data });
        } else {
          return res
            .status(400)
            .json({ error: { msg: "Account is Inactive" } });
        }
      } else {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }
    } else {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.changePassword = async (req, res) => {
  const userExist = await User.findById(
    mongoose.Types.ObjectId(req?.user?._id)
  );
  const data = req?.body;
  if (userExist) {
    const isPasswordMatch = await auth.checkPassword(
      data?.oldPassword,
      userExist
    );
    if (isPasswordMatch) {
      if (userExist?.accountStatus) {
        var salt = bcrypt.genSaltSync(5);
        data.password = bcrypt.hashSync(data?.password, salt);
        delete data.oldPassword;
        res
          .status(200)
          .json(
            await User.findByIdAndUpdate(
              mongoose.Types.ObjectId(req?.user?._id),
              data
            )
          );
        return res.status(200).json({ msg: "Login Succesfull", data: data });
      } else {
        return res.status(400).json({ error: { msg: "Account is Inactive" } });
      }
    } else {
      return res.status(400).json({ msg: "Incorrect Password" });
    }
  } else {
    return res.status(400).json({ msg: "Invalid Credentials" });
  }
};
