const express = require("express");
const router = express.Router();

const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const {
    getUserFavourites,
    getSearchQueryResults,
    getTrackById,
    getTrack,
    getNewTracks,
    getFeaturedTracks
} = require("../controllers/spotify");
const { getUserById } = require("../controllers/user");

// Parameter extractors
router.param("trackId", getTrackById);
router.param("userId", getUserById);

// Track routes
router.get("/track/favourites/:userId", isSignedIn, isAuthenticated, getUserFavourites);
router.get("/track/:userId/search", isSignedIn, isAuthenticated, getSearchQueryResults);
router.get("/track/new", isSignedIn, getNewTracks);
router.get("/track/featured", isSignedIn, getFeaturedTracks);
router.get("/track/:trackId", isSignedIn, getTrack);

module.exports = router;