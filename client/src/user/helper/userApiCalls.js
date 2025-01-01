// userApiCalls.js

import { API } from "../../backend";

const handleResponse = async (res) => {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
  }
  return res.json();
};

export const getUserFavourites = (token, user) => {
  return fetch(`${API}/api/track/favourites/${user._id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  })
  .then(handleResponse)
  .catch(err => {
    console.error("Error fetching user favourites:", err);
    return { error: "Failed to fetch user favourites" };
  });
};

export const getNewTracks = (token) => {
  return fetch(`${API}/api/track/new`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  })
  .then(handleResponse)
  .catch(err => {
    console.error("Error fetching new tracks:", err);
    return { error: "Failed to fetch new tracks" };
  });
};

export const getFeaturedTracks = (token) => {
  return fetch(`${API}/api/track/featured`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  })
  .then(handleResponse)
  .catch(err => {
    console.error("Error fetching featured tracks:", err);
    return { error: "Failed to fetch featured tracks" };
  });
};

export const getTrackById = (token, id) => {
  return fetch(`${API}/api/track/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  })
  .then(handleResponse)
  .catch(err => {
    console.error("Error fetching track by ID:", err);
    return { error: "Failed to fetch track by ID" };
  });
};

export const getRecommendationTracks = (token, user) => {
  return fetch(`${API}/api/user/${user._id}/recommendations`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  })
  .then(handleResponse)
  .catch(err => {
    console.error("Error fetching recommendation tracks:", err);
    return { error: "Failed to fetch recommendation tracks" };
  });
};

export const getSearchQueryResults = (token, user, query) => {
  return fetch(`${API}/api/track/${user._id}/search?query=${query}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  })
  .then(handleResponse)
  .catch(err => {
    console.error("Error fetching search query results:", err);
    return { error: "Failed to fetch search query results" };
  });
};

export const getAllUsersFavs = (token) => {
  return fetch(`${API}/api/admin/all-favourites`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  })
  .then(handleResponse)
  .catch(err => {
    console.error("Error fetching all users' favourites:", err);
    return { error: "Failed to fetch all users' favourites" };
  });
};