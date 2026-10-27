
const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const Subject = require("../models/Subject");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

// Get all tasks for the logged-in user
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id })
      .populate("subject", "name color")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks." });
  }
});

// Create a task
router.post("/", async (req, res) => {
  try {
    const { title, subjectId, dueDate, priority } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      !subjectId ||
      !dueDate
    ) {
      return res.status(400).json({
        message: "Title, subject and due date are required.",
      });
    }

    if (!mongoose.isValidObjectId(subjectId)) {
      return res.status(400).json({ message: "Invalid subject ID." });
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

    const validPriorities = ["Low", "Medium", "High"];

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Priority must be Low, Medium or High.",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      subject: subject._id,
      dueDate,
      priority: priority || "Medium",
      user: req.user._id,
    });

    await task.populate("subject", "name color");

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task." });
  }
});

// Update a task (for completing or editing it)
router.patch("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    const updates = {};
    const allowedFields = ["title", "dueDate", "priority", "completed"];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.title !== undefined &&
      (typeof updates.title !== "string" || !updates.title.trim())
    ) {
      return res.status(400).json({ message: "Title cannot be empty." });
    }

    if (
      updates.priority !== undefined &&
      !["Low", "Medium", "High"].includes(updates.priority)
    ) {
      return res.status(400).json({ message: "Invalid priority." });
    }

    if (
      updates.completed !== undefined &&
      typeof updates.completed !== "boolean"
    ) {
      return res.status(400).json({ message: "Invalid completed value." });
    }

    if (updates.title) updates.title = updates.title.trim();

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("subject", "name color");

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task." });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task." });
  }
});

module.exports = router;
