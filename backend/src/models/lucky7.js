import mongoose from "mongoose";

const Lucky7Schema = new mongoose.Schema({
    gameNumber: {type: Number, required: true},
    dice1: {type: Number, required: true},
    dice2: {type: Number, required: true},
    diceSum: {type: Number, required: true},
    isLucky7: {type: Boolean, required: true},
    rolledAt: {type: Date, default: Date.now}
});

export default mongoose.model("Lucky7Game", Lucky7Schema);