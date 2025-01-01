const User = require("../models/user");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { expressjwt: expressJwt } = require('express-jwt');

exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg
    });
  }

  const user = new User(req.body);
  try {
    const savedUser = await user.save();
    res.json({
      name: savedUser.name,
      email: savedUser.email,
      id: savedUser._id
    });
  } catch (err) {
    return res.status(400).json({
      error: "Unable to save user in DB"
    });
  }
};

exports.signin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg
    });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        error: "User email is not registered"
      });
    }
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Invalid Email / Password"
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    res.cookie("token", token, { expire: new Date() + 9999 });
    return res.json({ token, user });
  } catch (err) {
    return res.status(400).json({
      error: "Error while finding user in DB..."
    });
  }
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    msg: "User signout successful"
  });
};

// Protected routes
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  userProperty: "auth",
  algorithms: ['HS256']
});

// Custom middlewares
exports.isAuthenticated = async (req, res, next) => {
  try {
    const userId = req.auth && req.auth._id;
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    req.profile = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Error in authentication' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role !== 0) {
    return res.status(403).json({
      msg: "You are not Admin, access denied"
    });
  }
  next();
};