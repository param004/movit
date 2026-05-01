const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Job = require("../models/Job");
const Bid = require("../models/Bid");

const router = express.Router();

// All admin routes require Admin type
router.use(auth(["Admin"]));

router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.get("/jobs", async (req, res, next) => {
  try {
    const jobs = await Job.find()
      .populate("fromCity")
      .populate("toCity")
      .populate("user", "email type fullName");
    res.json(jobs);
  } catch (err) {
    next(err);
  }
});


router.get("/bids", async (req, res, next) => {
  try {
    const bids = await Bid.find()
      .populate({
        path: "job",
        populate: [
          { path: "fromCity" },
          { path: "toCity" }
        ]
      })
      .populate("user", "email type fullName");
    res.json(bids);
  } catch (err) {
    next(err);
  }
});


module.exports = router;

