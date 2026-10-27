
const express = require("express");
const mongoose = require("mongoose");
const Subject = require("../models/Subject");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

// Get the logged-in student's subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user._id }).sort({
      createdAt: 1,
    });

    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subjects." });
  }
});

// Add a subject
router.post("/", async (req, res) => {
  try {
    const name =
      typeof req.body.name === "string" ? req.body.name.trim() : "";

    if (!name) {
      return res.status(400).json({ message: "Subject name is required." });
    }

    const subject = await Subject.create({
      name,
      color: req.body.color || "#8065E8",
      user: req.user._id,
    });

    res.status(201).json(subject);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This subject already exists.",
      });
    }

    res.status(500).json({ message: "Failed to create subject." });
  }
});

// Delete a subject if it belongs to the logged-in student
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid subject ID." });
    }

    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    res.json({ message: "Subject deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete subject." });
  }
});

module.exports = router;
