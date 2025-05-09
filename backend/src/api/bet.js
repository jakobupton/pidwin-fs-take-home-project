import express from 'express';
import Lucky7Bet from '../models/bet.js';
import User from '../models/user.js';

const betRouter = (Lucky7Instance) => {
    const router = express.Router();
    router.post('/bet', async (req, res) => {
        const { playerId, betAmount, betChoice } = req.body;

        const nextGameNumber = Lucky7Instance.getNextGameNumber();
        const timeleft = Lucky7Instance.getNextGameTime() - new Date().getTime();
        if (timeleft <= 5000) { // 5 seconds before next game
            return res.status(400).json({ message: "Betting is closed for this round, please try again in " + Math.ceil(timeleft / 1000) + " seconds." });
        }
    
        const existingBet = await Lucky7Bet.findOne({ playerId, gameNumber: nextGameNumber });
        if (existingBet) {
            return res.status(400).json({ message: "You have already placed a bet for this round." });
        }

        const existingUser = await User.findOne({ id: playerId });
        if (!existingUser) {
            return res.status(400).json({ message: "User not found." });
        }

        if (betAmount < 1) {
            return res.status(400).json({ message: "Minimum bet amount is 1." });
        }
        
        
        
        const bet = new Lucky7Bet({
            playerId,
            betAmount,
            betChoice,
            gameNumber: nextGameNumber,
        });
        try {
            await bet.save();
            res.json({ message: "Bet saved successfully.", bet });   
        } catch (error) {
            console.error("Error saving bet:", error);
            return res.status(500).json({ message: "Error saving bet." });
        }
    
    });
    return router;

}
export default betRouter;