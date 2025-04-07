import mongoose from "mongoose";

const BetSchema = mongoose.Schema({
    playerId: {type: String, required: true},
    betAmount: {type: Number, required: true},
    betChoice: {type: Boolean, required: true},
    createdAt: {type: Date, default: Date.now},
    gameNumber: {type: Number, required: true},
    result: {type: Boolean, default: null}, // unknown until the round is over
    payout: {type: Number, default: null} 
});

export default mongoose.model("Lucky7Bet", BetSchema);
