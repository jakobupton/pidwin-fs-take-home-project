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

async function updateUserWinStreak(user, bet){
    if (bet.result){
        user.winStreak += 1;
        user.bestStreak = Math.max(user.winStreak, user.bestStreak);
    }else{
        user.winStreak = 0;
    }
    await user.save();
}

async function resolveBet(isLucky7){
    const bets = await Lucky7Bet.find({ gameNumber: gameCounter, result: null });
    for (const bet of bets){
        if (isLucky7 == bet.betChoice){
            bet.result = true;
            bet.payout = bet.betAmount * 2; // Assuming a 2x payout for a win
        }else{
            bet.result = false;
            bet.payout = 0;
        }
        await bet.save();
        const user = await User.findOne({id: bet.playerId});
        updateUserWinStreak(user, bet);
        console.log(`Bet resolved for game number ${bet.gameNumber}; user(${user.id}): ${bet.result ? 'Win' : 'Lose'}`);
    }

}

async function initializeGameCounter() {
    const lastGameNumber = await lastSavedGameNumber();
    if (lastGameNumber){
        gameCounter = lastGameNumber;
    }else{
        gameCounter = 1; // Start from 1 if no games exist
    }
    console.log(`Starting Lucky7 from game number: ${gameCounter}`);
}

const lucky7init = async () => {
    await initializeGameCounter();
    const lucky7loop = async () => {
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

        await resolveBet(isLucky7);

        gameCounter++;
        nextGameTime = rolledAt.getTime() + 15000; // Set the next game time to 15 seconds later
    }
    lucky7loop();
    setInterval(lucky7loop, 15000);
};

export function getNextGameNumber(){
    return gameCounter;
}

export function getNextGameTime(){
    return nextGameTime;
}

export default lucky7init;