/**
 * Farkle Game Controller
 * Manages game state, turns, and rule enforcement
 */

class Game {
    constructor() {
        this.players = {
            human: { score: 0, onBoard: false },
            ai: { score: 0, onBoard: false }
        };

        this.currentPlayer = 'human';
        this.turnTotal = 0;
        this.currentRollScore = 0;
        this.gameState = 'START'; // START, ROLLING, SELECTING, BANKING, GAME_OVER
        this.isRolling = false; // Guard for async roll overlap
        this.maxScore = 10000;
        this.diceManager = new DiceManager('dice-container');

        window.game = this; // Expose for global state checks (e.g. Die selection)
        this.init();
    }

    init() {
        document.addEventListener('diceSelected', () => this.handleDiceSelection());
    }

    async startTurn() {
        console.log(`Starting turn for ${this.currentPlayer}`);
        this.turnTotal = 0;
        this.diceManager.resetAll();
        this.gameState = 'START';
        this.updateUI();

        if (this.currentPlayer === 'human') {
            setTimeout(() => this.roll(), 1000);
        } else {
            AI.playTurn(this);
        }
    }

    async roll() {
        if (this.gameState !== 'START' && this.gameState !== 'SELECTING') return;
        if (this.isRolling) return;
        this.isRolling = true;

        // Before rolling again, we must have selected some scoring dice from previous roll
        if (this.gameState === 'SELECTING' && this.currentRollScore === 0) {
            UI.showMessage("Select at least one scoring die!");
            this.isRolling = false;
            return;
        }

        // Add previous selection to turn total
        this.turnTotal += this.currentRollScore;
        this.currentRollScore = 0;

        // Lock selected dice
        this.diceManager.lockSelected();

        // Handle Hot Dice (all dice used)
        if (this.diceManager.allLocked()) {
            UI.showMessage("HOT DICE! Roll all 6 again!");
            this.diceManager.resetAll();
        }

        this.gameState = 'ROLLING';
        UI.updateControls();

        const values = await this.diceManager.rollAvailable();
        const availableDice = this.diceManager.getAvailableDice().map(d => d.value);

        // Check for Farkle
        const checkResult = Scoring.calculateScore(availableDice);
        if (checkResult.score === 0) {
            this.handleFarkle();
        } else {
            this.gameState = 'SELECTING';
            UI.showMessage("Select scoring dice to keep.");
            this.updateUI();
        }
        this.isRolling = false;
    }

    handleDiceSelection() {
        if (this.gameState !== 'SELECTING') return;

        const selectedValues = this.diceManager.getSelectedValues();
        const result = Scoring.calculateScore(selectedValues);

        // Only count valid combinations
        // Note: Real Farkle rules say all selected dice must be part of a combo
        // If they select [1, 1, 2], only the 1s count, and the 2 is invalid to select.
        if (result.usedCount === selectedValues.length) {
            this.currentRollScore = result.score;
        } else {
            this.currentRollScore = 0; // Invalid selection
        }

        this.updateUI();
    }

    bank() {
        if (this.gameState !== 'SELECTING' || this.currentRollScore === 0) return;

        const totalThisTurn = this.turnTotal + this.currentRollScore;
        const player = this.players[this.currentPlayer];

        player.score += totalThisTurn;
        player.onBoard = true;

        UI.addHistory(this.currentPlayer, totalThisTurn);
        UI.showMessage(`${this.currentPlayer.toUpperCase()} banked ${totalThisTurn} points!`);

        if (player.score >= this.maxScore) {
            this.endGame();
        } else {
            this.switchPlayer();
        }
    }

    handleFarkle() {
        this.gameState = 'START';
        this.turnTotal = 0;
        this.currentRollScore = 0;

        UI.addHistory(this.currentPlayer, 0, true);

        UI.showFarkle(this.currentPlayer, () => {
            this.switchPlayer();
        });
    }

    switchPlayer() {
        this.currentPlayer = (this.currentPlayer === 'human') ? 'ai' : 'human';
        this.turnTotal = 0;
        this.currentRollScore = 0;
        this.gameState = 'START';
        this.diceManager.resetAll();
        this.updateUI();

        if (this.currentPlayer === 'ai') {
            AI.playTurn(this);
        } else {
            // Automatic roll for player
            setTimeout(() => {
                if (this.currentPlayer === 'human' && this.gameState === 'START') {
                    this.roll();
                }
            }, 1000);
        }
    }

    endGame() {
        this.gameState = 'GAME_OVER';
        UI.showWinner(this.currentPlayer, this.players);
    }

    updateUI() {
        UI.updateScores(this.players, this.currentPlayer);
        UI.updateTurnScore(this.turnTotal + this.currentRollScore, this.players[this.currentPlayer].onBoard);
        UI.updateControls();
    }
}
