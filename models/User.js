const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const validator = require("validator");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const mongoose_delete = require("mongoose-delete");
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      validate: {
        validator: validator.isEmail,
        message: "EMAIL_IS_NOT_VALID",
      },
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "staff", "student", "cashier", "chef", "outsider"],
      default: "student",
    },
    image: {
      type: String,
    },
    passwordtoken: {
      type: String,
    },
    lastpasswordtoken: {
      type: String,
    },
    passwordexpiretime: {
      type: Number,
    },
    isLogOut: {
      type: Boolean,
      default: true,
    },
    accountStatus: {
      type: Boolean,
      default: true,
    },
    notificationToken: {
      type: String
    }
  },
  {
    versionKey: false,
    timestamps: true,
    // timestamps: { createdAt: false, updatedAt: false },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collation: { locale: "en" },
  }
);

const hash = (user, salt, next) => {
  bcrypt.hash(user.password, salt, null, (error, newHash) => {
    if (error) {
      return next(error);
    }
    user.password = newHash;
    return next();
  });
};

const genSalt = (user, SALT_FACTOR, next) => {
  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) {
      return next(err);
    }
    return hash(user, salt, next);
  });
};

UserSchema.pre("save", function (next) {
  const that = this;
  const SALT_FACTOR = 5;
  if (!that.isModified("password")) {
    return next();
  }
  return genSalt(that, SALT_FACTOR, next);
});

UserSchema.methods.comparePassword = function (passwordAttempt, cb) {
  bcrypt.compare(passwordAttempt, this.password, (err, isMatch) =>
    err ? cb(err) : cb(null, isMatch)
  );
};
UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(aggregatePaginate);
UserSchema.plugin(mongoose_delete);
module.exports = mongoose.model("User", UserSchema);
