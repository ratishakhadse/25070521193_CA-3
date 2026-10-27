
const express = require("express");
const mongoose = require("mongoose");
const StudySession = require("../models/StudySession");
const Subject = require("../models/Subject");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

// Get all study sessions
router.get("/", async (req, res) => {
  try {
    const sessions = await StudySession.find({
      user: req.user._id,
    })
      .populate("subject", "name color")
      .sort({ createdAt: 1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch study sessions.",
    });
  }
});

// Create a study session
router.post("/", async (req, res) => {
  try {
    const { subjectId, day, time } = req.body;

    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    if (!subjectId || !day || !time) {
      return res.status(400).json({
        message: "Subject, day and time are required.",
      });
    }

    if (!mongoose.isValidObjectId(subjectId)) {
      return res.status(400).json({
        message: "Invalid subject ID.",
      });
    }

    if (!validDays.includes(day)) {
      return res.status(400).json({
        message: "Invalid day.",
      });
    }

    const subject = await Subject.findOne({
      _id: subjectId,
      user: req.user._id,
    });

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found.",
      });
    }

    const session = await StudySession.create({
      subject: subject._id,
      day,
      time,
      user: req.user._id,
    });

    await session.populate("subject", "name color");

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create study session.",
    });
  }
});

// Delete a study session
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid session ID.",
      });
    }

    const session = await StudySession.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        message: "Study session not found.",
      });
    }

    res.json({
      message: "Study session deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete study session.",
    });
  }
});

module.exports = router;
