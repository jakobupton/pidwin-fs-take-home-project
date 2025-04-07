import express from "express";
import User from "../models/user.js";

const router = express.Router();

router.get("/top-streaks", async (req, res) => {
    const topusers = await User.find().sort({bestStreak: -1}).limit(10);
    if (topusers.length === 0) {
        return res.status(404).json({ message: "No users found." });
    }
    res.json(topusers.map(user => ({
        userId: user.id,
        bestStreak: user.bestStreak
    })));
});

export default router;