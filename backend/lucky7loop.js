import Lucky7Game from './src/models/lucky7.js';
import Lucky7Bet from './src/models/bet.js';
import User from './src/models/user.js';

let gameCounter = null;
let nextGameTime = null;

async function lastSavedGameNumber() { // function to pull last game number from DB
    const lastGame = await Lucky7Game.findOne().sort({rolledAt: -1}).limit(1);
    if (lastGame?.gameNumber){
        return lastGame.gameNumber + 1;
    }
}

const lucky7loop = () => {
    const gameCounterPromise = lastSavedGameNumber();
    gameCounterPromise.then((initialGameNumber) => {
        gameCounter = initialGameNumber || 1; // Start from the last saved game number or 1 if none exists
        console.log("Starting Lucky7 Game Loop, starting from game " + gameCounter);
    })
    setInterval(async () => {
        const gameNumber = gameCounter;
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const diceSum = dice1 + dice2;
        const isLucky7 = diceSum === 7;
        const rolledAt = new Date();
        const lucky7Entry = new Lucky7Game({
            gameNumber,
            dice1,
            dice2,
            diceSum,
            isLucky7,
            rolledAt
        });
        console.log(`Game Number: ${gameNumber}, Dice 1: ${dice1}, Dice 2: ${dice2}, Sum: ${diceSum}, Lucky7: ${isLucky7}`);
        await lucky7Entry.save();



        // Resolve Bets
        const bets = await Lucky7Bet.find({ gameNumber: gameCounter, result: null });  // Find bets for this round that aren't paid
        for (const bet of bets){
            const user = await User.findOne({ id: bet.playerId });
            if (bet.betChoice === isLucky7){ // if betChoice matches outcome
                bet.result = true;
                bet.payout = bet.betAmount * 2; // Could change, but for now it's 2x payout
            }else{
                bet.result = false;
                bet.payout = 0; // No payout
            }
            await bet.save();

            // Update user win streaks
            if (user){
                if (bet.result === true){
                    user.winStreak += 1;
                    user.bestStreak = Math.max(user.winStreak, user.bestStreak);
                }else{
                    user.winStreak = 0;
                }
                await user.save();

            }
        }
        gameCounter++;
        nextGameTime = rolledAt.getTime() + 15000; // Set the next game time to 15 seconds later
    }, 15000); // Roll every 15 seconds
};

export function getNextGameNumber(){
    return gameCounter;
}

export function getNextGameTime(){
    return nextGameTime;
}

export default lucky7loop;