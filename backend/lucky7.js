import Lucky7Game from './src/models/lucky7.js';
import Lucky7Bet from './src/models/bet.js';
import User from './src/models/user.js';

class Lucky7 {
    constructor(io) {
        this.io = io
        this.gameCounter = null;
        this.nextGameTime = null;
    }
    async #lastSavedGameNumber() { // Function to pull last game number from DB
        const lastGame = await Lucky7Game.findOne().sort({gameNumber: -1}).limit(1);
        if (lastGame?.gameNumber){
            return lastGame.gameNumber + 1;
        }
    }
    async #updateUserWinStreak(user, bet){
        if (bet.result){
            user.winStreak += 1;
            user.bestStreak = Math.max(user.winStreak, user.bestStreak);
        }else{
            user.winStreak = 0;
        }
        await user.save();
    }

    async #resolveBet(isLucky7){
        const bets = await Lucky7Bet.find({ gameNumber: this.gameCounter, result: null });
        const results = [];

        for (const bet of bets){
            if (isLucky7 == bet.betChoice){
                bet.result = true;
                bet.payout = bet.betAmount * 2; // Assuming a 2x payout for a win
                results.push({
                    userId: bet.playerId,
                    payout: bet.payout
                })
                
            }else{
                bet.result = false;
                bet.payout = 0;
            }
            await bet.save();
            const user = await User.findOne({id: bet.playerId});
            this.#updateUserWinStreak(user, bet);
            console.log(`Bet resolved for game number ${bet.gameNumber}; user(${user.id}): ${bet.result ? 'Win' : 'Lose'}`);
            
        }
        this.io.emit('hello');
        // this.io.emit( {
        //     gameNumber: this.gameNumber,
        //     isLucky7,
        //     results
        // })
    }

    async #initializeGameCounter() {
        const lastGameNumber = await this.#lastSavedGameNumber();
        if (lastGameNumber){
            this.gameCounter = lastGameNumber;
        }else{
            this.gameCounter = 1; // Start from 1 if no games exist
        }
        console.log(`Starting Lucky7 from game number: ${this.gameCounter}`);
    }

    async #lucky7loop() {
        const gameNumber = this.gameCounter;
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const diceSum = dice1 + dice2;
        const isLucky7 = diceSum === 7;

        const rolledAt = new Date();
        this.nextGameTime = new Date(rolledAt.getTime() + 15000); 

        const lucky7Game = new Lucky7Game({
            gameNumber,
            dice1,
            dice2,
            diceSum,
            isLucky7,
            rolledAt
        });

        try {
            await lucky7Game.save();
            console.log(`Game number ${gameNumber} saved with dice1: ${dice1}, dice2: ${dice2}, sum: ${diceSum}, isLucky7: ${isLucky7}`);
            await this.#resolveBet(isLucky7);
            this.gameCounter++;
        } catch (error) {
            console.error("Error saving game:", error);
        }
    }

    getNextGameNumber() {
        return this.gameCounter;
    }
    getNextGameTime() {
        return this.nextGameTime;
    }
    async init() {
        await this.#initializeGameCounter();
        await this.#lucky7loop(); // Start the first game immediately
        setInterval(async () => {
            await this.#lucky7loop();
        }, 15000); // 15 seconds interval for the game loop
    }
}
export default Lucky7