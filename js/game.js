/**
 * Farkle Game Controller
 * Manages game state, turns, and rule enforcement
 */

class Game {
    constructor() {
        this.players = []; // Array of objects: { name, score, onBoard, isAI }
        this.currentPlayerIndex = 0;
        this.gameType = 'pv-ai';
        this.maxScore = 10000;

        // Tournament State
        this.tournament = {
            active: false,
            bracket: [], // Array of match objects
            round: 0,
            winner: null
        };

        this.turnTotal = 0;
        this.currentRollScore = 0;
        this.gameState = 'START';
        this.isRolling = false;
        this.diceManager = new DiceManager('dice-container');

        window.game = this;
        this.init();
    }

    init() {
        document.addEventListener('diceSelected', () => this.handleDiceSelection());
    }

    async startTurn() {
        const player = this.players[this.currentPlayerIndex];
        console.log(`Starting turn for ${player.name}`);
        this.turnTotal = 0;
        this.currentRollScore = 0;
        this.diceManager.resetAll();
        this.gameState = 'START';
        this.updateUI();

        if (player.isAI) {
            AI.playTurn(this);
        } else {
            // Auto-roll for human player
            UI.showMessage(`${player.name.toUpperCase()}'S TURN`);
            setTimeout(() => this.roll(), 1000);
        }
    }

    async roll() {
        console.log("Roll called. State:", this.gameState, "isRolling:", this.isRolling);
        if (this.gameState !== 'START' && this.gameState !== 'SELECTING') {
            console.log("Blocked by gameState:", this.gameState);
            return;
        }
        if (this.isRolling) {
            console.log("Blocked by isRolling");
            return;
        }
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

    handleFarkle() {
        this.gameState = 'START';
        this.turnTotal = 0;
        this.currentRollScore = 0;

        const player = this.players[this.currentPlayerIndex];
        UI.addHistory(player.name, 0, true);

        UI.showFarkle(player.name, () => {
            this.switchPlayer();
        });
    }

    bank() {
        if (this.gameState !== 'SELECTING') return;

        // Add current selection to total if valid
        this.turnTotal += this.currentRollScore;

        const player = this.players[this.currentPlayerIndex];
        player.score += this.turnTotal;
        UI.addHistory(player.name, this.turnTotal);

        if (player.score >= this.maxScore) {
            if (this.tournament.active) {
                this.handleMatchWin();
            } else {
                this.gameState = 'GAME_OVER';
                UI.showWinner(this.players);
            }
        } else {
            this.switchPlayer();
        }
    }

    switchPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.turnTotal = 0;
        this.currentRollScore = 0;
        this.gameState = 'START';
        this.diceManager.resetAll();
        this.updateUI();
        this.startTurn();
    }

    updateUI() {
        UI.updateScores(this.players, this.currentPlayerIndex);
        UI.updateTurnScore(this.turnTotal + this.currentRollScore);
        UI.updateControls();
    }

    /* Tournament Logic with AI Auto-Sim */
    initTournamentWithPlayer(playerNames) {
        this.tournament.active = true;
        this.tournament.playerName = "Thou"; // The human player
        this.tournament.round = 1;
        this.tournament.bracket = [
            { p1: playerNames[0], p2: playerNames[1], winner: null }, // Match 1: Thou vs AI
            { p1: playerNames[2], p2: playerNames[3], winner: null }, // Match 2: AI vs AI (auto-sim)
            { p1: null, p2: null, winner: null } // Finals
        ];

        // Auto-simulate Match 2 (AI vs AI)
        const match2 = this.tournament.bracket[1];
        const aiWinner = Math.random() < 0.5 ? match2.p1 : match2.p2;
        match2.winner = aiWinner;
        this.tournament.bracket[2].p2 = aiWinner;

        UI.showMessage(`${aiWinner} wins the other Semi-Final!`);

        // Start player's match after a delay
        setTimeout(() => {
            this.startMatch(0);
        }, 2500);
    }

    startMatch(matchIndex) {
        const match = this.tournament.bracket[matchIndex];
        this.tournament.currentMatchIndex = matchIndex;

        const playerInMatch = match.p1 === "Thou" || match.p2 === "Thou";

        this.players = [
            { name: match.p1, score: 0, isAI: match.p1 !== "Thou" },
            { name: match.p2, score: 0, isAI: match.p2 !== "Thou" }
        ];

        this.currentPlayerIndex = 0;
        UI.showMessage(`MATCH: ${match.p1} VS ${match.p2}`);
        setTimeout(() => this.startTurn(), 2000);
    }

    handleMatchWin() {
        const winner = this.players[this.currentPlayerIndex];
        const match = this.tournament.bracket[this.tournament.currentMatchIndex];
        match.winner = winner.name;

        if (this.tournament.currentMatchIndex === 2) {
            // Tournament complete
            this.tournament.winner = winner.name;
            if (winner.name === "Thou") {
                UI.showMessage(`THOU ART THE KINGDOM CHAMPION!`);
            } else {
                UI.showMessage(`${winner.name} HAS DEFEATED THEE!`);
            }
            UI.showWinner(this.players);
        } else {
            // Semi-final complete - advance to finals
            const finalMatch = this.tournament.bracket[2];
            if (this.tournament.currentMatchIndex === 0) {
                finalMatch.p1 = winner.name;
            }

            if (winner.name === "Thou") {
                UI.showMessage(`THOU ADVANCES TO THE FINAL!`);
            } else {
                UI.showMessage(`${winner.name} ADVANCES! Thou hast been eliminated!`);
                setTimeout(() => UI.showWinner(this.players), 3000);
                return;
            }

            // Start finals
            setTimeout(() => {
                this.startMatch(2);
            }, 3000);
        }
    }
}
