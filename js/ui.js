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
        adviceText: document.getElementById('ai-advice'),
        adviceBtn: document.getElementById('get-advice-btn'),
        globalTarget: document.getElementById('global-target-display')
    },

    init(game) {
        this.game = game;

        // Start Game
        this.elements.startGameBtn.addEventListener('click', () => {
            const activeMode = document.querySelector('.mode-btn.active');
            this.game.maxScore = parseInt(activeMode.dataset.max);

            // Update Target Display
            const targetText = `Goal: ${this.game.maxScore.toLocaleString()}`;
            this.elements.globalTarget.textContent = targetText;

            this.elements.startMenu.classList.add('hidden');
            this.elements.app.classList.remove('hidden');
            this.game.startTurn();
        });

        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
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

        // Advice
        this.elements.adviceBtn.addEventListener('click', () => {
            const advice = AI.getAdvice(this.game);
            this.elements.adviceText.textContent = advice;
            this.elements.adviceText.classList.add('pop');
            setTimeout(() => this.elements.adviceText.classList.remove('pop'), 300);
        });
    },

    updateScores(players, currentPlayer) {
        this.elements.playerScore.textContent = players.human.score;
        this.elements.aiScore.textContent = players.ai.score;

        this.elements.playerCard.classList.toggle('active', currentPlayer === 'human');
        this.elements.aiCard.classList.toggle('active', currentPlayer === 'ai');

        this.elements.turnIndicator.textContent =
            currentPlayer === 'human' ? "THY TURN" : "OPPONENT PLAYS";
        this.elements.turnIndicator.style.color =
            currentPlayer === 'human' ? "var(--accent)" : "var(--primary)";
    },

    updateTurnScore(score) {
        this.elements.turnScore.textContent = score;
    },

    updateControls() {
        const isHuman = this.game.currentPlayer === 'human';
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

    addHistory(player, score, isFarkle = false) {
        const item = document.createElement('div');
        item.className = 'history-item';
        const playerClass = player === 'human' ? 'player' : 'ai';
        const playerName = player === 'human' ? 'Thou' : 'Opponent';

        if (isFarkle) {
            item.innerHTML = `<span class="${playerClass}">${playerName}</span>: <span style="color:var(--primary)">FARKLE!</span>`;
        } else {
            item.innerHTML = `<span class="${playerClass}">${playerName}</span>: +${score} Gold`;
        }

        this.elements.history.prepend(item);
    },

    toggleModal(id, show) {
        const modal = document.getElementById(id);
        if (show) {
            modal.classList.remove('hidden');
        } else {
            modal.classList.add('hidden');
        }
    },

    showWinner(winner, players) {
        const title = winner === 'human' ? "VICTORY!" : "DEFEAT";
        const msg = winner === 'human' ?
            "Thou hast bested thy opponent and claimed the gold!" :
            "The opponent has outwitted thee. Thy purse is empty.";

        document.getElementById('winner-title').textContent = title;
        document.getElementById('winner-message').textContent = msg;
        document.getElementById('final-player-score').textContent = players.human.score;
        document.getElementById('final-ai-score').textContent = players.ai.score;

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
    }
};

// Initialize everything when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    UI.init(game);
});
