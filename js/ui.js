/**
 * UI Controller
 * Manages DOM updates and user interactions with a medieval theme
 */

const UI = {
    // DOM Elements
    elements: {
        playerScore: document.getElementById('player-grand-total'),
        aiScore: document.getElementById('ai-grand-total'),
        playerCard: document.getElementById('player-score-card'),
        aiCard: document.getElementById('ai-score-card'),
        turnScore: document.getElementById('turn-total'),
        turnIndicator: document.getElementById('turn-indicator'),
        message: document.getElementById('game-message'),
        threshold: document.getElementById('threshold-notice'),
        rollBtn: document.getElementById('roll-btn'),
        bankBtn: document.getElementById('bank-btn'),
        history: document.getElementById('game-history'),
        rulesModal: document.getElementById('rules-modal'),
        gameOverModal: document.getElementById('game-over-modal'),
        startMenu: document.getElementById('start-menu'),
        app: document.getElementById('app'),
        startGameBtn: document.getElementById('start-game-btn'),
        backToMenuBtn: document.getElementById('back-to-menu-btn'),
        confirmModal: document.getElementById('confirm-modal'),
        globalTarget: document.getElementById('global-target-display'),
        farkleModal: null // Removed
    },

    init(game) {
        this.game = game;

        // Mode Selection - Show goal section after selection
        document.querySelectorAll('.select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.select-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // Show goal section
                document.getElementById('goal-section').style.display = 'block';
            });
        });

        document.querySelectorAll('.score-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.score-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Start Game
        this.elements.startGameBtn.addEventListener('click', () => {
            const activeTypeBtn = document.querySelector('.select-btn.active');
            const activeScoreBtn = document.querySelector('.score-btn.active');

            // Validate selections
            if (!activeTypeBtn) {
                UI.showMessage("Select a game mode first!");
                return;
            }
            if (!activeScoreBtn) {
                UI.showMessage("Select a winning goal first!");
                return;
            }

            const activeType = activeTypeBtn.dataset.type;
            const activeScore = parseInt(activeScoreBtn.dataset.score);

            this.game.gameType = activeType;
            this.game.maxScore = activeScore;

            // Setup Players based on mode
            if (activeType === 'pv-ai') {
                this.game.players = [
                    { name: "Thou", score: 0, onBoard: false, isAI: false },
                    { name: "The King", score: 0, onBoard: false, isAI: true }
                ];
            } else if (activeType === 'pvp') {
                this.game.players = [
                    { name: "Player 1", score: 0, onBoard: false, isAI: false },
                    { name: "Player 2", score: 0, onBoard: false, isAI: false }
                ];
            } else if (activeType === 'tournament') {
                // Random selection from famous medieval names
                const medievalNames = [
                    "King Arthur", "Sir Lancelot", "Sir Galahad", "Sir Gawain",
                    "Lady Guinevere", "Merlin", "Sir Percival", "Sir Bedivere",
                    "Lady Morgan", "Sir Tristan", "Lady Isolde", "Sir Kay",
                    "Robin Hood", "Maid Marian", "Little John", "Friar Tuck",
                    "William Wallace", "Richard Lionheart", "Joan of Arc", "Charlemagne"
                ];

                // Shuffle and pick 4
                const shuffled = medievalNames.sort(() => Math.random() - 0.5);
                const selected = shuffled.slice(0, 4);

                this.showBracket(selected, activeScore);
                return; // Don't start game yet - wait for bracket button
            }

            // Update Target Display
            this.elements.globalTarget.textContent = `Goal: ${this.game.maxScore.toLocaleString()}`;

            this.elements.startMenu.classList.add('hidden');
            this.elements.app.classList.remove('hidden');
            this.game.startTurn();
        });

        // Event Listeners
        this.elements.rollBtn.addEventListener('click', () => game.roll());
        this.elements.bankBtn.addEventListener('click', () => game.bank());

        document.getElementById('rules-btn').addEventListener('click', () => this.toggleModal('rules-modal', true));
        document.getElementById('show-rules-btn').addEventListener('click', () => this.toggleModal('rules-modal', true));
        document.getElementById('close-rules-btn').addEventListener('click', () => this.toggleModal('rules-modal', false));
        this.elements.backToMenuBtn.addEventListener('click', () => this.returnToMenu());
        document.getElementById('restart-btn').addEventListener('click', () => window.location.reload());

        // Click outside to close modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.toggleModal(modal.id, false);
                }
            });
        });

        // Audio Toggle
        const music = document.getElementById('tavern-music');
        let soundOn = false;
        this.elements.soundBtn = document.getElementById('sound-btn');

        this.elements.soundBtn.addEventListener('click', () => {
            soundOn = !soundOn;
            if (soundOn) {
                music.play();
                this.elements.soundBtn.textContent = '🔊';
            } else {
                music.pause();
                this.elements.soundBtn.textContent = '🔇';
            }
        });


        // Set initial random favicon
        this.setRandomFavicon();
    },

    updateScores(players, currentPlayerIndex) {
        const p1 = players[0];
        const p2 = players[1];

        this.elements.playerScore.textContent = p1.score;
        this.elements.aiScore.textContent = p2.score;

        // Update Labels
        this.elements.playerCard.querySelector('.label').textContent = p1.name.toUpperCase();
        this.elements.aiCard.querySelector('.label').textContent = p2.name.toUpperCase();

        this.elements.playerCard.classList.toggle('active', currentPlayerIndex === 0);
        this.elements.aiCard.classList.toggle('active', currentPlayerIndex === 1);

        const currentPlayer = players[currentPlayerIndex];
        this.elements.turnIndicator.textContent = `${currentPlayer.name.toUpperCase()}'S TURN`;
        this.elements.turnIndicator.style.color = currentPlayer.isAI ? "var(--primary)" : "var(--accent)";
    },

    updateTurnScore(score) {
        this.elements.turnScore.textContent = score;
    },

    updateControls() {
        const player = this.game.players[this.game.currentPlayerIndex];
        const isHuman = !player.isAI;
        const isSelecting = this.game.gameState === 'SELECTING';
        const hasSelectedScoring = (this.game.currentRollScore > 0);

        this.elements.rollBtn.disabled = !isHuman ||
            (this.game.gameState !== 'SELECTING' && this.game.gameState !== 'START') ||
            (isSelecting && !hasSelectedScoring);

        // Bank button is disabled if not human, or not selecting, or no scoring dice picked
        this.elements.bankBtn.disabled = !isHuman || !isSelecting || !hasSelectedScoring;

        this.elements.bankBtn.classList.toggle('ready-to-bank', !this.elements.bankBtn.disabled);
    },

    showMessage(msg, type = 'info') {
        this.elements.message.textContent = msg;
        this.elements.message.style.color = type === 'error' ? 'var(--primary)' : '#451a03';

        if (type === 'error') {
            document.body.classList.add('farkle-flash');
            setTimeout(() => document.body.classList.remove('farkle-flash'), 500);
        }

        // Add a rustic pop animation
        this.elements.message.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.elements.message.style.transform = 'scale(1)';
        }, 200);
    },

    addHistory(playerName, score, isFarkle = false) {
        const item = document.createElement('div');
        item.className = 'history-item';

        if (isFarkle) {
            item.innerHTML = `<span>${playerName}</span>: <span style="color:var(--primary)">FARKLE!</span>`;
        } else {
            item.innerHTML = `<span>${playerName}</span>: +${score} Gold`;
        }

        this.elements.history.prepend(item);
    },

    showFarkle(playerName, onClosed) {
        // Clear message area and show FARKLE
        this.elements.message.textContent = "!!! FARKLE !!!";
        this.elements.message.classList.add('error');

        // Visual flash (handled by CSS class on body)
        document.body.classList.add('farkle-flash');

        // Brief delay before switching player
        setTimeout(() => {
            document.body.classList.remove('farkle-flash');
            this.elements.message.classList.remove('error');
            if (onClosed) onClosed();
        }, 1200);
    },

    toggleModal(id, show) {
        const modal = document.getElementById(id);
        if (show) {
            modal.classList.remove('hidden');
        } else {
            modal.classList.add('hidden');
        }
    },

    showWinner(players) {
        const winner = players.find(p => p.score >= this.game.maxScore);
        const titleLabel = "VICTORY!";
        const msg = winner.isAI ?
            `${winner.name} has outwitted thee. Thy purse is empty.` :
            `${winner.name} hast bested the opponent and claimed the gold!`;

        document.getElementById('winner-title').textContent = titleLabel;
        document.getElementById('winner-message').textContent = msg;
        document.getElementById('final-player-score').textContent = players[0].score.toLocaleString();
        document.getElementById('final-ai-score').textContent = players[1].score.toLocaleString();

        const trophy = document.querySelector('.winner-trophy');
        if (!winner.isAI) {
            trophy.textContent = '🏆';
            trophy.style.filter = 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.6))';
        } else {
            trophy.textContent = '💀';
            trophy.style.filter = 'drop-shadow(0 0 20px rgba(153, 27, 27, 0.6))';
        }

        this.toggleModal('game-over-modal', true);
    },

    showConfirm(title, message, onConfirm) {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;

        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-no');

        // Clone buttons to clear existing listeners
        const newYes = yesBtn.cloneNode(true);
        const newNo = noBtn.cloneNode(true);
        yesBtn.parentNode.replaceChild(newYes, yesBtn);
        noBtn.parentNode.replaceChild(newNo, noBtn);

        this.toggleModal('confirm-modal', true);

        newYes.onclick = () => {
            this.toggleModal('confirm-modal', false);
            onConfirm();
        };

        newNo.onclick = () => {
            this.toggleModal('confirm-modal', false);
        };
    },

    returnToMenu() {
        this.showConfirm(
            "Retire to Tavern?",
            "Dost thou wish to abandon this duel and return to the tavern?",
            () => window.location.reload()
        );
    },

    /**
     * Draws a random dice face and sets it as the browser favicon
     */
    setRandomFavicon() {
        const val = Math.floor(Math.random() * 6) + 1;
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Draw Die Base
        const radius = 12;
        ctx.fillStyle = '#f5f5dc'; // Beige/Parchment
        ctx.strokeStyle = '#2c1810'; // Dark Brown
        ctx.lineWidth = 4;

        // Rounded Rect
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(64 - radius, 0);
        ctx.quadraticCurveTo(64, 0, 64, radius);
        ctx.lineTo(64, 64 - radius);
        ctx.quadraticCurveTo(64, 64, 64 - radius, 64);
        ctx.lineTo(radius, 64);
        ctx.quadraticCurveTo(0, 64, 0, 64 - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw Pips
        ctx.fillStyle = '#2c1810';
        const pipSize = 7;
        const patterns = {
            1: [[32, 32]],
            2: [[16, 16], [48, 48]],
            3: [[16, 16], [32, 32], [48, 48]],
            4: [[16, 16], [48, 16], [16, 48], [48, 48]],
            5: [[16, 16], [48, 16], [32, 32], [16, 48], [48, 48]],
            6: [[16, 16], [48, 16], [16, 32], [48, 32], [16, 48], [48, 48]]
        };

        (patterns[val] || []).forEach(p => {
            ctx.beginPath();
            ctx.arc(p[0], p[1], pipSize, 0, Math.PI * 2);
            ctx.fill();
        });

        const favicon = document.getElementById('favicon');
        favicon.href = canvas.toDataURL('image/x-icon');
    },

    showBracket(playerNames, goalScore) {
        // Put "Thou" (the player) as p1, others are AI opponents
        const opponents = playerNames;
        document.getElementById('bracket-p1').textContent = "Thou";
        document.getElementById('bracket-p2').textContent = opponents[0];
        document.getElementById('bracket-p3').textContent = opponents[1];
        document.getElementById('bracket-p4').textContent = opponents[2];

        // Show bracket overlay
        document.getElementById('start-menu').classList.add('hidden');
        document.getElementById('bracket-overlay').classList.remove('hidden');

        // Handle "Begin Tournament" button
        document.getElementById('start-tournament-btn').onclick = () => {
            this.game.maxScore = goalScore;
            this.elements.globalTarget.textContent = `Goal: ${goalScore.toLocaleString()}`;

            // Hide bracket, show game
            document.getElementById('bracket-overlay').classList.add('hidden');
            this.elements.app.classList.remove('hidden');

            // Start tournament with player as participant
            this.game.initTournamentWithPlayer(["Thou", opponents[0], opponents[1], opponents[2]]);
        };
    }
};

// Initialize everything when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    UI.init(game);
});
