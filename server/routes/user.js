const express = require("express");
const router = express.Router();

const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { getUserById, getUser, updateUser, getRecommendations, getAllUsers } = require("../controllers/user");

// Parameter extractor
router.param("userId", getUserById);

// User routes
router.get("/user/:userId", isSignedIn, isAuthenticated, getUser);
router.get("/user/:userId/recommendations", isSignedIn, isAuthenticated, getRecommendations);
router.get("/user/:userId/all", isSignedIn, isAuthenticated, getAllUsers);
router.put("/user/:userId", isSignedIn, isAuthenticated, updateUser);

module.exports = router;