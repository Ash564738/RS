const express = require("express");
const mongoose = require("mongoose");
const request = require('request');
const querystring = require('querystring');
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const spotifyRoutes = require("./routes/spotify");
const { setAccessToken } = require("./controllers/spotify");

// Connect to MongoDB
mongoose
    .connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected..."))
    .catch(err => console.log(err));

const app = express();

// Init middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors()); // Enable CORS

// Logger
app.use("/", (req, res, next) => {
    console.log(`${req.protocol}://${req.get("host")}${req.originalUrl}`);
    next();
});

// Routes:
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", spotifyRoutes);

// Listen to req
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at Port ${PORT}`);
    authSpotifyApi();
});

const client_id = process.env.SPOTIFY_CLIENT_ID; // Your client id
const client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret

function authSpotifyApi() {
    const options = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            grant_type: 'client_credentials'
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
        }
    };

    request.post(options, (err, res, body) => {
        if (err) {
            console.error('Failed to authenticate with Spotify API:', err);
        } else {
            const token = JSON.parse(body).access_token;
            setAccessToken(token);
            console.log('Spotify API access token set:', token);
        }
    });
}