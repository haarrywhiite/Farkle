/**
 * UI Controller
 * Manages DOM updates and user interactions with a medieval theme
 */

const UI = {
    // DOM Elements
    elements: {
        confirmModal: document.getElementById('confirm-modal'),
        globalTarget: document.querySelectorAll('.global-target'),
        bracketOverlay: document.getElementById('bracket-overlay'),
        playerScores: document.querySelectorAll('.player-card .value'),
        aiScores: document.querySelectorAll('.ai-card .value'),
        playerCards: document.querySelectorAll('.player-card'),
        aiCards: document.querySelectorAll('.ai-card'),
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
        installPwaBtn: document.getElementById('install-pwa-btn'),
        downloadMenuBtn: document.getElementById('download-menu-btn'),
        downloadOptions: document.getElementById('download-options'),
        farkleModal: null // Removed
    },

    init(game) {
        this.game = game;

        // Ensure any previous game is cancelled when entering fresh
        if (this.game) {
            this.game.clearState();
        }

        // Language Modal Button in Home Screen (next to Scroll of Rules)
        document.getElementById('show-lang-btn')?.addEventListener('click', () => {
            this.updateLangModalState();
            this.toggleModal('language-modal', true);
        });

        // Header Language Toggle Button (opens language pop-up)
        document.querySelectorAll('.toggle-lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.updateLangModalState();
                this.toggleModal('language-modal', true);
            });
        });

        // Language Modal Close Button
        document.getElementById('close-lang-btn')?.addEventListener('click', () => {
            this.toggleModal('language-modal', false);
        });

        // Language Options in Modal
        document.querySelectorAll('.lang-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.currentTarget.dataset.lang;
                if (typeof I18N !== 'undefined') {
                    I18N.setLanguage(lang);
                }
                this.updateLangModalState();
                setTimeout(() => {
                    this.toggleModal('language-modal', false);
                }, 200);
            });
        });

        // Listen for language changes to update dynamic text in-place
        if (typeof I18N !== 'undefined') {
            I18N.onLanguageChange((lang) => {
                this.updateLangModalState();
                const showLangBtn = document.getElementById('show-lang-btn');
                if (showLangBtn) showLangBtn.textContent = I18N.t('btn_language');

                if (this.game && this.game.players && this.game.players.length > 0) {
                    if (this.game.gameType === 'pv-ai') {
                        this.game.players[0].name = I18N.t('thou');
                        this.game.players[1].name = I18N.t('the_king');
                    } else if (this.game.gameType === 'pvp') {
                        this.game.players[0].name = I18N.t('player_1');
                        this.game.players[1].name = I18N.t('player_2');
                    }
                    this.updateScores(this.game.players, this.game.currentPlayerIndex);
                }
                this.elements.globalTarget.forEach(el => {
                    if (this.game && this.game.maxScore) {
                        el.textContent = I18N.t('goal_label', { score: this.game.maxScore.toLocaleString() });
                    }
                });
                this.updateControls();
            });
        }

        // Mode Selection - Show goal section after selection
        document.querySelectorAll('.select-btn:not(.lang-btn)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.select-btn:not(.lang-btn)').forEach(b => b.classList.remove('active'));
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
            const activeTypeBtn = document.querySelector('.select-btn:not(.lang-btn).active');
            const activeScoreBtn = document.querySelector('.score-btn.active');

            // Validate selections
            if (!activeTypeBtn) {
                UI.showMessage(I18N.t('select_mode_first'));
                return;
            }
            if (!activeScoreBtn) {
                UI.showMessage(I18N.t('select_goal_first'));
                return;
            }

            const activeType = activeTypeBtn.dataset.type;
            const activeScore = parseInt(activeScoreBtn.dataset.score);

            this.game.gameType = activeType;
            this.game.maxScore = activeScore;

            // Setup Players based on mode
            if (activeType === 'pv-ai') {
                this.game.players = [
                    { name: I18N.t('thou'), score: 0, onBoard: false, isAI: false },
                    { name: I18N.t('the_king'), score: 0, onBoard: false, isAI: true }
                ];
            } else if (activeType === 'pvp') {
                this.game.players = [
                    { name: I18N.t('player_1'), score: 0, onBoard: false, isAI: false },
                    { name: I18N.t('player_2'), score: 0, onBoard: false, isAI: false }
                ];
            } else if (activeType === 'tournament') {
                const opponentsList = (I18N.translations[I18N.currentLang] && I18N.translations[I18N.currentLang].opponents)
                    ? I18N.translations[I18N.currentLang].opponents
                    : I18N.translations.en.opponents;

                const shuffled = [...opponentsList].sort(() => Math.random() - 0.5);
                const selected = shuffled.slice(0, 4);

                this.showBracket(selected, activeScore);
                return; // Don't start game yet - wait for bracket button
            }

            // Update Target Display across all headers
            this.elements.globalTarget.forEach(el => {
                el.textContent = I18N.t('goal_label', { score: this.game.maxScore.toLocaleString() });
            });

            this.elements.startMenu.classList.add('hidden');
            this.elements.app.classList.remove('hidden');
            this.game.startTurn();
        });

        // Event Listeners
        this.elements.rollBtn.addEventListener('click', () => game.roll());
        this.elements.bankBtn.addEventListener('click', () => game.bank());

        // Universal Listeners (Class-based)
        document.querySelectorAll('.toggle-rules-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleModal('rules-modal', true));
        });

        document.querySelectorAll('.back-to-menu-btn').forEach(btn => {
            btn.addEventListener('click', () => this.returnToMenu());
        });

        document.getElementById('show-rules-btn')?.addEventListener('click', () => this.toggleModal('rules-modal', true));
        document.getElementById('close-rules-btn')?.addEventListener('click', () => this.toggleModal('rules-modal', false));

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.toggleModal('game-over-modal', false);
            // Cancel previous game completely and start fresh
            if (this.game) {
                this.game.clearState();
                if (this.elements.history) this.elements.history.innerHTML = '';
                this.game.players.forEach(p => {
                    p.score = 0;
                    p.onBoard = false;
                });
                this.game.currentPlayerIndex = 0;
                this.game.turnTotal = 0;
                this.game.currentRollScore = 0;
                this.game.gameState = 'START';
                this.game.diceManager.resetAll();
                this.game.updateUI();
                this.game.startTurn();
            }
        });

        document.getElementById('final-menu-btn')?.addEventListener('click', () => {
            this.toggleModal('game-over-modal', false);
            this.returnToMenu();
        });

        // Click outside to close modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modal.id === 'game-over-modal') {
                        this.returnToMenu();
                    } else {
                        this.toggleModal(modal.id, false);
                    }
                }
            });
        });

        // Sound Listeners
        const music = document.getElementById('tavern-music');
        let soundOn = false;

        const playlist = [
            "https://www.chosic.com/wp-content/uploads/2021/07/Medieval-Feast.mp3",
            "https://www.chosic.com/wp-content/uploads/2021/07/The-Bards-Tale.mp3",
            "https://www.chosic.com/wp-content/uploads/2021/07/Renaissance.mp3"
        ];
        let currentTrack = 0;

        if (music) {
            music.addEventListener('ended', () => {
                currentTrack = (currentTrack + 1) % playlist.length;
                music.src = playlist[currentTrack];
                if (soundOn) music.play().catch(e => console.log(e));
            });
        }

        document.querySelectorAll('.toggle-sound-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                soundOn = !soundOn;
                const allSoundBtns = document.querySelectorAll('.toggle-sound-btn');
                if (soundOn) {
                    if (music) music.play().catch(e => console.log(e));
                    allSoundBtns.forEach(b => b.textContent = '🔊');
                } else {
                    if (music) music.pause();
                    allSoundBtns.forEach(b => b.textContent = '🔇');
                }
            });
        });


        // Set initial random favicon
        this.setRandomFavicon();

        this.handleScaling();
        window.addEventListener('resize', () => this.handleScaling());

        // Clean start: any game from before is cancelled upon exiting and entering again
        if (this.game) {
            this.game.clearState();
        }
    },

    returnToMenu() {
        this.showConfirm(
            I18N.t('confirm_retire_title'),
            I18N.t('confirm_retire_msg'),
            () => {
                if (this.game) this.game.clearState();
                window.location.reload();
            }
        );
    },

    handleScaling() {
        if (window.innerWidth <= 600) {
            const scale = window.innerWidth / 500;
            document.documentElement.style.setProperty('--mobile-scale', scale);

            // Use SVH (Small Viewport Height) if possible, or fallback to fixed innerHeight
            // to prevent the "jumping" effect when the address bar toggles.
            // We set it once on load and update on orientation change, not every resize.
            if (!this.viewportHeightLocked || Math.abs(this.lastWidth - window.innerWidth) > 50) {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
                this.viewportHeightLocked = true;
                this.lastWidth = window.innerWidth;
            }
        } else {
            document.documentElement.style.removeProperty('--mobile-scale');
            document.documentElement.style.removeProperty('--vh');
            this.viewportHeightLocked = false;
        }
    },

    updateScores(players, currentPlayerIndex) {
        const p1 = players[0];
        const p2 = players[1];

        this.elements.playerScores.forEach(el => el.textContent = p1.score);
        this.elements.aiScores.forEach(el => el.textContent = p2.score);

        // Update Labels
        this.elements.playerCards.forEach(card => {
            const labelEl = card.querySelector('.label');
            if (p1.name === "Thou" || p1.name === "Tú") {
                labelEl.textContent = I18N.t('you');
            } else {
                labelEl.textContent = p1.name.toUpperCase();
            }
            card.classList.toggle('active', currentPlayerIndex === 0);
        });

        this.elements.aiCards.forEach(card => {
            const labelEl = card.querySelector('.label');
            if (p2.isAI && (p2.name === "The King" || p2.name === "El Rey")) {
                labelEl.textContent = I18N.t('opponent');
            } else {
                labelEl.textContent = p2.name.toUpperCase();
            }
            card.classList.toggle('active', currentPlayerIndex === 1);
        });

        const turnInd = document.getElementById('turn-indicator');
        if (turnInd) {
            const currentPlayer = players[currentPlayerIndex];
            const isHumanUser = !currentPlayer.isAI && (currentPlayer.name === "Thou" || currentPlayer.name === "Tú" || currentPlayer.name === I18N.t('thou'));
            if (isHumanUser) {
                turnInd.textContent = I18N.t('thy_turn');
            } else {
                turnInd.textContent = I18N.t('player_turn', { player: currentPlayer.name.toUpperCase() });
            }
            turnInd.style.color = currentPlayer.isAI ? "var(--primary)" : "var(--accent)";
            
            const notice = document.getElementById('threshold-notice');
            if (notice) {
                notice.textContent = I18N.t('purse_locked');
                notice.title = I18N.t('purse_locked_tip');
                if (!currentPlayer.onBoard) {
                    notice.classList.remove('hidden');
                } else {
                    notice.classList.add('hidden');
                }
            }
        }
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

        // On Board Rule: disable bank if under 500
        const prospectiveScore = this.game.turnTotal + this.game.currentRollScore;
        if (!player.onBoard && prospectiveScore < 500) {
            this.elements.bankBtn.disabled = true;
        }

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
            item.innerHTML = `<span>${playerName}</span>: <span style="color:var(--primary)">${I18N.t('farkle_banner')}</span>`;
        } else {
            const goldWord = I18N.currentLang === 'es' ? 'Oro' : 'Gold';
            item.innerHTML = `<span>${playerName}</span>: +${score.toLocaleString()} ${goldWord}`;
        }

        this.elements.history.prepend(item);
    },

    showFarkle(playerName, onClosed) {
        // Clear message area and show FARKLE
        this.elements.message.textContent = I18N.t('farkle_banner');
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
        const isHumanWinner = winner && !winner.isAI;
        const titleLabel = isHumanWinner ? I18N.t('victory_title') : I18N.t('defeat_title');
        const msg = winner.isAI ?
            I18N.t('winner_ai_msg', { winner: winner.name }) :
            I18N.t('winner_human_msg', { winner: winner.name });

        document.getElementById('winner-title').textContent = titleLabel;
        document.getElementById('winner-message').textContent = msg;
        document.getElementById('final-player-score').textContent = players[0].score.toLocaleString();
        document.getElementById('final-ai-score').textContent = players[1].score.toLocaleString();

        const trophy = document.querySelector('.winner-trophy');
        if (isHumanWinner) {
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

        yesBtn.textContent = I18N.t('confirm_yes');
        noBtn.textContent = I18N.t('confirm_no');

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
        // Handle back button
        const backBtn = document.getElementById('bracket-back-btn');
        if (backBtn) {
            backBtn.onclick = () => {
                this.elements.bracketOverlay.classList.add('hidden');
                this.elements.startMenu.classList.remove('hidden');
            };
        }

        // Put "Thou" / "Tú" (the player) as p1, others are AI opponents
        const humanName = I18N.t('thou');
        const opponents = playerNames;
        document.getElementById('bracket-p1').textContent = humanName;
        document.getElementById('bracket-p2').textContent = opponents[0];
        document.getElementById('bracket-p3').textContent = opponents[1];
        document.getElementById('bracket-p4').textContent = opponents[2];

        // Show bracket overlay
        document.getElementById('start-menu').classList.add('hidden');
        this.elements.bracketOverlay.classList.remove('hidden');

        // Handle "Begin Tournament" button
        document.getElementById('start-tournament-btn').onclick = () => {
            this.game.maxScore = goalScore;
            this.elements.globalTarget.forEach(el => {
                el.textContent = I18N.t('goal_label', { score: goalScore.toLocaleString() });
            });

            // Hide bracket, show game
            document.getElementById('bracket-overlay').classList.add('hidden');
            this.elements.app.classList.remove('hidden');

            // Start tournament with player as participant
            this.game.initTournamentWithPlayer([humanName, opponents[0], opponents[1], opponents[2]]);
        };
    },

    updateLangModalState() {
        if (typeof I18N === 'undefined') return;
        const current = I18N.getLanguage();
        document.querySelectorAll('.lang-option-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === current);
        });
    }
};

// Initialize everything when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    UI.init(game);
});
