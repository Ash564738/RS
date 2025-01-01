import { API } from "../../backend";

const handleResponse = async (res) => {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
  }
  return res.json();
};

export const addToFavourites = (user, token, track, rating) => {
  let bodyData, newTrack = { ...track, rating };
  if (user.favourites) {
    let ind = user.favourites.findIndex(t => t.id == track.id);
    if (ind !== -1) {
      user.favourites[ind] = newTrack;
      bodyData = { favourites: user.favourites };
    } else {
      bodyData = { favourites: [...user.favourites, newTrack] };
    }
  } else {
    bodyData = { favourites: [newTrack] };
  }

  return fetch(`${API}/api/user/${user._id}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(bodyData)
  })
  .then(handleResponse)
  .catch(err => {
    console.error("Error adding to favourites:", err);
    return { error: "Failed to add to favourites" };
  });
};

export const removeFromFavourites = (user, token, id) => {
  user.favourites = user.favourites.filter(track => track.id !== id);
  const bodyData = { favourites: user.favourites };

  return fetch(`${API}/api/user/${user._id}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(bodyData)
  })
  .then(handleResponse)
  .catch(err => {
    console.error("Error removing from favourites:", err);
    return { error: "Failed to remove from favourites" };
  });
};