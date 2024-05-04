const passport = require("passport");
const User = require("../models/User");
const auth = require("../middleware/auth");
const JwtStrategy = require("passport-jwt").Strategy;

/**
 * Extracts token from: header, body or query
 * @param {Object} req - request object
 * @returns {string} token - decrypted token
 */
const jwtExtractor = (req) => {
  let token = null;
  if (req.headers.authorization) {
    token = req.headers.authorization.replace("Bearer ", "").trim();
  } else if (req.body.token) {
    token = req.body.token.trim();
  } else if (req.query.token) {
    token = req.query.token.trim();
  }
  if (token) {
    // Decrypts token
    token = auth.decrypt(token);
  }
  return token;
};

/**
 * Options object for jwt middleware for users
 */
const jwtUserOptions = {
  jwtFromRequest: jwtExtractor,
  secretOrKey: "VesitCanteen",
};

/**
 * Login with JWT middleware for users
 */
const jwtUserLogin = new JwtStrategy(jwtUserOptions, (payload, done) => {
  User.findById(payload.data._id, async (err, user) => {
    if (err) {
      return done(err, false);
    }
    user.tokenType = payload?.data?.tokenType;
    return !user ? done(null, false) : done(null, user);
  })
    .lean();
});

passport.use("jwt", jwtUserLogin);
