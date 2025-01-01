let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();
const User = require('../models/user');
const request = require('request');

let access_token = '';

exports.setAccessToken = (token) => {
  access_token = token;
  console.log('Access token set:', access_token); // Log the access token for debugging
};

const refreshAccessToken = () => {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

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

  return new Promise((resolve, reject) => {
    request.post(options, (err, res, body) => {
      if (err) {
        console.error('Failed to refresh access token:', err);
        reject(err);
      } else {
        const token = JSON.parse(body).access_token;
        setAccessToken(token);
        console.log('Spotify API access token refreshed:', token);
        resolve(token);
      }
    });
  });
};

const fetchWithToken = async (url, options) => {
  let response = await fetch(url, options);
  if (response.status === 401) {
    console.log('Access token expired, refreshing token...');
    await refreshAccessToken();
    options.headers.Authorization = `Bearer ${access_token}`;
    response = await fetch(url, options);
  }
  return response;
};

exports.getTrackById = async (req, res, next, id) => {
  try {
    const response = await fetchWithToken(`https://api.spotify.com/v1/tracks/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`
      }
    });
    const data = await response.json();
    req.track = getCleanTrack(data);
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch track by ID' });
  }
};

exports.getTrack = (req, res) => {
  return res.json(req.track);
};

exports.getNewTracks = async (req, res) => {
  try {
    const limit = 20;
    const artists = [];
    const tracksList = [];
    let responseArtist = await fetchWithToken(`https://api.spotify.com/v1/browse/new-releases?limit=${limit}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`
      }
    });
    responseArtist = await responseArtist.json();

    if (responseArtist && responseArtist.albums && responseArtist.albums.items) {
      responseArtist.albums.items.forEach(item => artists.push([item.artists[0].id, item.available_markets.includes("IN") ? "IN" : "US"]));
      for (const [ind, artist] of artists.entries()) {
        let responseTrack = await fetchWithToken(`https://api.spotify.com/v1/artists/${artist[0]}/top-tracks?country=${artist[1]}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`
          }
        });
        responseTrack = await responseTrack.json();
        if (responseTrack && responseTrack.tracks && responseTrack.tracks[0]) {
          tracksList.push(getCleanTrack(responseTrack.tracks[0]));
        }
        if (ind === limit - 1) {
          res.status(200).json(tracksList);
        }
      }
    } else {
      console.error('Failed to fetch new releases: Invalid response structure', responseArtist);
      res.status(500).json({ error: 'Failed to fetch new releases' });
    }
  } catch (err) {
    console.error('Failed to fetch new tracks:', err);
    res.status(500).json({ error: 'Failed to fetch new tracks' });
  }
};

exports.getFeaturedTracks = async (req, res) => {
  try {
    const response = await fetchWithToken(`https://api.spotify.com/v1/browse/featured-playlists`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`
      }
    });
    const data = await response.json();
    const tracks = data.albums.items.map(track => getCleanTrack(track));
    res.status(200).json(tracks);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch featured tracks' });
  }
};

exports.getUserFavourites = async (req, res) => {
  try {
    const user = await User.findById(req.profile._id).exec();
    if (!user) {
      return res.status(400).json({ error: "User not found in DB" });
    }
    user.salt = undefined;
    user.encry_password = undefined;
    user.createdAt = undefined;
    user.updatedAt = undefined;
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch user favourites' });
  }
};

exports.getSearchQueryResults = async (req, res) => {
  try {
    const url = new URL(`https://api.spotify.com/v1/search`);
    const params = { q: req.query.q, type: 'track' };
    url.search = new URLSearchParams(params).toString();
    const response = await fetchWithToken(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`
      }
    });
    const data = await response.json();
    if (data && data.tracks) {
      const results = data.tracks.items.map(item => item.id);
      res.status(200).json(results);
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch search query results' });
  }
};

const getCleanTrack = (track) => {
  try {
    return {
      artist: track.artists[0].name,
      duration: Math.round(track.duration_ms / 1000),
      id: track.id,
      name: track.name,
      image: track.album.images[1].url
    };
  } catch (e) {
    return;
  }
};