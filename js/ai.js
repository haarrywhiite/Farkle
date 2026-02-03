/**
 * Farkle AI Opponent
 * Implements strategy for robot moves
 */

const AI = {
    difficulty: 'medium', // 'easy', 'medium', 'hard'

    isThinking: false,

    async playTurn(game) {
        if (this.isThinking) return;
        this.isThinking = true;

        try {
            UI.showMessage("AI is thinking...");
            await this.delay(1000);

            let keepGoing = true;
            let rollCount = 0;

            while (keepGoing && game.gameState !== 'GAME_OVER' && rollCount < 20) {
                rollCount++;

                const prevState = game.gameState;
                // 1. Roll the dice
                await game.roll();

                // If roll didn't happen or state didn't change as expected, break
                if (game.gameState === prevState && game.gameState !== 'START') break;
                if (game.gameState === 'START') break; // FARKLE happened

                await this.delay(800);

                // 2. Select scoring dice
                this.selectBestDice(game);
                await this.delay(800);

                // 3. Decide: Bank or Roll again?
                keepGoing = this.shouldContinue(game);

                if (keepGoing) {
                    UI.showMessage("AI decides to roll again!");
                    await this.delay(1000);
                } else {
                    game.bank();
                    break;
                }
            }
        } catch (error) {
            console.error("AI Error:", error);
            UI.showMessage("The Oracle is confused! Opponent banks to clear the fog.", "error");
            // Safety measure: Try to bank if possible to avoid turn deadlock
            if (game.gameState === 'SELECTING' && game.currentRollScore > 0) {
                game.bank();
            } else {
                game.switchPlayer();
            }
        } finally {
            this.isThinking = false;
        }
    },

    /**
     * AI selects which dice to keep. 
     * Strategy: Always keep ALL scoring dice to maximize points and reach Hot Dice.
     */
    selectBestDice(game) {
        const availableDice = game.diceManager.getAvailableDice();
        const diceValues = availableDice.map(d => d.value);
        const scoringIndices = Scoring.getScoringIndices(diceValues);

        scoringIndices.forEach(idx => {
            availableDice[idx].toggleSelection();
        });

        game.handleDiceSelection();
    },

    /**
     * Core AI Decision Logic
     */
    shouldContinue(game) {
        const turnTotal = game.turnTotal + game.currentRollScore;
        // Correct diceRemaining: it should just be the count of available (unselected/unlocked) dice
        const diceRemaining = game.diceManager.getAvailableDice().length;

        // Hot Dice! Always continue if 0 dice are left (they will all reset)
        if (diceRemaining === 0) return true;

        const threshold = this.getThreshold(diceRemaining);
        return turnTotal < threshold;
    },

    getThreshold(diceCount, onBoard) {
        // Thresholds based on number of dice we'd be rolling
        const thresholds = {
            1: 150,  // Very risky to roll 1 die
            2: 250,
            3: 350,
            4: 500,
            5: 600,
            6: 800
        };

        let val = thresholds[diceCount] || 300;

        // Adjust for difficulty
        if (this.difficulty === 'easy') val *= 0.7;
        if (this.difficulty === 'hard') val *= 1.2;

        return val;
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    getAdvice(game) {
        if (game.gameState === 'ROLLING') return "Wait for the dice to settle, child.";
        if (game.gameState === 'START') return "Cast the bones and let fate decide!";

        const isSelecting = game.gameState === 'SELECTING';
        if (!isSelecting) return "The Oracle sleeps. Play thy turn.";

        const currentScore = game.currentRollScore;
        const turnTotal = game.turnTotal + currentScore;
        const diceValues = game.diceManager.getSelectedValues();
        const availableDice = game.diceManager.getAvailableDice().length - diceValues.length;

        if (currentScore === 0) {
            return "Thou must select scoring dice before the Oracle can see.";
        }

        const shouldBank = !this.shouldContinue(game);

        if (availableDice === 0) {
            return "Hot Dice! The fire is with thee. Roll all six again!";
        }

        if (shouldBank) {
            return `Bank thy ${turnTotal} Gold. A wise merchant knows when to fold and keep the coin.`;
        } else {
            return `The winds of the tavern favor thee. Risk the remaining ${availableDice} dice for more!`;
        }
    }
};
