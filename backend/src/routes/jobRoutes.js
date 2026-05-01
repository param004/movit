const express = require("express");
const Job = require("../models/Job");
const City = require("../models/City");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

const router = express.Router();

// Create new job (User)
router.post("/", auth(["User"]), async (req, res, next) => {
  try {
    const {
      fromCity,
      fromAddress,
      toCity,
      toAddress,
      imageUrl,
      description,
    } = req.body;

    let fromCityDoc;
    let toCityDoc;

    // If request sends a valid ObjectId, look up by id; otherwise treat it as a name.
    if (mongoose.Types.ObjectId.isValid(fromCity)) {
      fromCityDoc = await City.findById(fromCity);
    } else if (typeof fromCity === "string" && fromCity.trim()) {
      fromCityDoc = await City.findOne({ name: fromCity.trim() });
    }

    if (mongoose.Types.ObjectId.isValid(toCity)) {
      toCityDoc = await City.findById(toCity);
    } else if (typeof toCity === "string" && toCity.trim()) {
      toCityDoc = await City.findOne({ name: toCity.trim() });
    }

    // If a city does not exist yet, create it automatically using the provided
    // name string so users can freely type new city names.
    if (!fromCityDoc && typeof fromCity === "string" && fromCity.trim()) {
      fromCityDoc = await City.create({ name: fromCity.trim() });
    }
    if (!toCityDoc && typeof toCity === "string" && toCity.trim()) {
      toCityDoc = await City.create({ name: toCity.trim() });
    }

    if (!fromCityDoc || !toCityDoc) {
      return res.status(400).json({ message: "Invalid city values" });
    }

    const job = await Job.create({
      user: req.user._id,
      fromCity: fromCityDoc._id,
      fromAddress,
      toCity: toCityDoc._id,
      toAddress,
      imageUrl,
      description,
    });

    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
});

// List jobs (open jobs for transporters or user's own)
router.get("/", auth(), async (req, res, next) => {
  try {
    const { mine } = req.query;
    const filter = {};

    if (mine === "true") {
      filter.user = req.user._id;
    } else if (req.user.type === "Transporter") {
      filter.isCanceled = false;
      filter.isCompleted = false;
    }

    const jobs = await Job.find(filter)
      .populate("fromCity")
      .populate("toCity")
      .populate("user", "email type");
    res.json(jobs);
  } catch (err) {
    next(err);
  }
});

// Job details
router.get("/:id", auth(), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("fromCity")
      .populate("toCity")
      .populate("user", "email type");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (err) {
    next(err);
  }
});

// Cancel job (User)
router.post("/:id/cancel", auth(["User"]), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (!job.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Not your job" });
    }
    job.isCanceled = true;
    await job.save();
    res.json(job);
  } catch (err) {
    next(err);
  }
});

// Complete job (User)
router.post("/:id/complete", auth(["User"]), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (!job.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Not your job" });
    }
    job.isCompleted = true;
    await job.save();
    res.json(job);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

