const User = require("../models/user");

exports.getUserById = async (req, res, next, id) => {
  try {
    const user = await User.findById(id).exec();
    if (!user) {
      return res.status(400).json({ error: "User not found in DB" });
    }
    req.profile = user;
    next();
  } catch (err) {
    return res.status(400).json({ error: "User not found in DB" });
  }
};

exports.getUser = (req, res) => {
  const { salt, encry_password, createdAt, updatedAt, ...profile } = req.profile.toObject();
  return res.json(profile);
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      { _id: req.profile._id },
      { $set: req.body },
      { new: true, useFindAndModify: false }
    ).exec();
    if (!user) {
      return res.status(400).json({ error: "You are not authorized for this action" });
    }
    const { salt, encry_password, createdAt, updatedAt, ...updatedProfile } = user.toObject();
    res.json(updatedProfile);
  } catch (err) {
    return res.status(400).json({ error: "You are not authorized for this action" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { name: 1, favourites: 1 }).exec();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const users = await User.find({}, { favourites: 1 }).exec();
    const data = {};
    users.forEach(user => {
      const obj = {};
      user.favourites.forEach(fav => {
        obj[fav.id] = fav.rating;
      });
      data[user._id] = obj;
    });
    console.log(data);
    const rec = recommendation_eng(data, req.profile._id, pearson_correlation);
    console.log(rec);
    res.json(rec[1]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
};

/*---------------------------  Recommendation System  --------------------------*/

const euclidean_score = (dataset, p1, p2) => {
  const existp1p2 = {};
  for (const key in dataset[p1]) {
    if (key in dataset[p2]) {
      existp1p2[key] = 1;
    }
  }
  if (Object.keys(existp1p2).length === 0) return 0;
  const sum_of_euclidean_dist = [];
  for (const item in dataset[p1]) {
    if (item in dataset[p2]) {
      sum_of_euclidean_dist.push(Math.pow(dataset[p1][item] - dataset[p2][item], 2));
    }
  }
  const sum = sum_of_euclidean_dist.reduce((acc, val) => acc + val, 0);
  return 1 / (1 + Math.sqrt(sum));
};

const pearson_correlation = (dataset, p1, p2) => {
  const existp1p2 = {};
  for (const item in dataset[p1]) {
    if (item in dataset[p2]) {
      existp1p2[item] = 1;
    }
  }
  const num_existence = Object.keys(existp1p2).length;
  if (num_existence === 0) return 0;
  let p1_sum = 0,
    p2_sum = 0,
    p1_sq_sum = 0,
    p2_sq_sum = 0,
    prod_p1p2 = 0;
  for (const item in existp1p2) {
    p1_sum += dataset[p1][item];
    p2_sum += dataset[p2][item];
    p1_sq_sum += Math.pow(dataset[p1][item], 2);
    p2_sq_sum += Math.pow(dataset[p2][item], 2);
    prod_p1p2 += dataset[p1][item] * dataset[p2][item];
  }
  const numerator = prod_p1p2 - (p1_sum * p2_sum) / num_existence;
  const st1 = p1_sq_sum - Math.pow(p1_sum, 2) / num_existence;
  const st2 = p2_sq_sum - Math.pow(p2_sum, 2) / num_existence;
  const denominator = Math.sqrt(st1 * st2);
  return denominator === 0 ? 0 : numerator / denominator;
};

const similar_user = (dataset, person, num_user, distance) => {
  const scores = [];
  for (const others in dataset) {
    if (others !== person && typeof dataset[others] !== "function") {
      const val = distance(dataset, person, others);
      scores.push({ val, p: others });
    }
  }
  scores.sort((a, b) => b.val - a.val);
  return scores.slice(0, num_user);
};

const recommendation_eng = (dataset, person, distance) => {
  const totals = {
    setDefault(props, value) {
      if (!this[props]) {
        this[props] = 0;
      }
      this[props] += value;
    }
  };
  const simsum = {
    setDefault(props, value) {
      if (!this[props]) {
        this[props] = 0;
      }
      this[props] += value;
    }
  };
  const rank_lst = [];
  for (const other in dataset) {
    if (other === person) continue;
    const similar = distance(dataset, person, other);
    if (similar <= 0) continue;
    for (const item in dataset[other]) {
      if (!(item in dataset[person]) || dataset[person][item] === 0) {
        totals.setDefault(item, dataset[other][item] * similar);
        simsum.setDefault(item, similar);
      }
    }
  }
  for (const item in totals) {
    if (typeof totals[item] !== "function") {
      const val = totals[item] / simsum[item];
      rank_lst.push({ val, items: item });
    }
  }
  rank_lst.sort((a, b) => b.val - a.val);
  return [rank_lst, rank_lst.map(rank => rank.items)];
};