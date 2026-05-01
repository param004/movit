const express = require("express");
const Bid = require("../models/Bid");
const Job = require("../models/Job");
const auth = require("../middleware/auth");

const router = express.Router();

// Place bid (Transporter)
router.post("/:jobId", auth(["Transporter"]), async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.isCanceled || job.isCompleted) {
      return res.status(400).json({ message: "Job is not open for bids" });
    }
    const bid = await Bid.create({
      user: req.user._id,
      job: job._id,
      amount,
      description,
    });
    res.status(201).json(bid);
  } catch (err) {
    next(err);
  }
});

// Get bids for a job (owner or admin)
router.get("/job/:jobId", auth(), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Convert both to strings for comparison
    const jobUserId = job.user.toString();
    const currentUserId = req.user._id.toString();

    if (
      jobUserId !== currentUserId &&
      req.user.type !== "Admin"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const bids = await Bid.find({ job: job._id })
      .populate("user", "email type")
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    next(err);
  }
});

// Accept a bid (job owner)
router.post("/:bidId/accept", auth(["User"]), async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.bidId).populate("job");
    if (!bid) return res.status(404).json({ message: "Bid not found" });

    // Convert to strings for comparison
    if (bid.job.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your job" });
    }

    // Mark all bids for this job as not accepted, then this one as accepted
    await Bid.updateMany(
      { job: bid.job._id },
      { $set: { isAccepted: false } }
    );
    bid.isAccepted = true;
    await bid.save();

    res.json(bid);
  } catch (err) {
    next(err);
  }
});

// Get transporter's accepted jobs (Transporter)
router.get("/my-jobs", auth(["Transporter"]), async (req, res, next) => {
  try {
    const acceptedBids = await Bid.find({
      user: req.user._id,
      isAccepted: true,
    })
      .populate({
        path: "job",
        populate: [
          { path: "fromCity", select: "name" },
          { path: "toCity", select: "name" },
          { path: "user", select: "email" }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(acceptedBids);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

