/**
 * Dice Class
 * Manages individual die behavior and state
 */

class Die {
    constructor(index, container) {
        this.index = index;
        this.container = container;
        this.value = 1;
        this.isSelected = false;
        this.isLocked = false; // Locked means it was kept from a previous roll
        this.isRolling = false;

        this.element = this.createDiceElement();
        this.updateDisplay();
        container.appendChild(this.element);
    }

    createDiceElement() {
        const div = document.createElement('div');
        div.className = 'die';
        div.id = `die-${this.index}`;
        div.innerHTML = `
            <div class="die-inner">
                <div class="pip-grid">
                    <div class="pip"></div><div class="pip"></div><div class="pip"></div>
                    <div class="pip"></div><div class="pip"></div><div class="pip"></div>
                    <div class="pip"></div><div class="pip"></div><div class="pip"></div>
                </div>
            </div>`;

        div.addEventListener('click', () => this.toggleSelection(true));
        return div;
    }

    roll() {
        if (this.isLocked || this.isSelected) return Promise.resolve(this.value);

        this.isRolling = true;
        this.element.classList.add('rolling');

        return new Promise(resolve => {
            // Simulated roll animation time
            setTimeout(() => {
                this.value = Math.floor(Math.random() * 6) + 1;
                this.updateDisplay();
                this.isRolling = false;
                this.element.classList.remove('rolling');
                resolve(this.value);
            }, 600);
        });
    }

    toggleSelection(isUserClick = false) {
        if (this.isLocked || this.isRolling) return;

        // Only allow human to select during their turn via click
        if (isUserClick) {
            const game = window.game;
            if (game && game.players && game.players[game.currentPlayerIndex]?.isAI) return;
            if (game && game.gameState !== 'SELECTING') return;
        }

        // Only allow selecting if it's currently scoring (logic handled in Game.js)
        this.isSelected = !this.isSelected;
        this.updateDisplay();

        // Emit event for Game to re-calculate turn score
        const event = new CustomEvent('diceSelected', {
            detail: { index: this.index, selected: this.isSelected }
        });
        document.dispatchEvent(event);
    }

    lock() {
        this.isLocked = true;
        this.isSelected = false;
        this.updateDisplay();
    }

    reset() {
        this.isLocked = false;
        this.isSelected = false;
        this.updateDisplay();
    }

    updateDisplay() {
        const pips = this.element.querySelectorAll('.pip');

        // Clear all pips
        pips.forEach(p => p.classList.remove('active'));

        // Define pip patterns for 1-6
        const patterns = {
            1: [4],
            2: [0, 8],
            3: [0, 4, 8],
            4: [0, 2, 6, 8],
            5: [0, 2, 4, 6, 8],
            6: [0, 3, 6, 2, 5, 8]
        };

        const activeIndices = patterns[this.value] || [];
        activeIndices.forEach(idx => pips[idx].classList.add('active'));

        this.element.classList.toggle('selected', this.isSelected);
        this.element.classList.toggle('locked', this.isLocked);
    }

    setValue(val) {
        this.value = val;
        this.updateDisplay();
    }
}

class DiceManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.dice = [];
        for (let i = 0; i < 6; i++) {
            this.dice.push(new Die(i, this.container));
        }
    }

    async rollAvailable() {
        const promises = this.dice.map(d => d.roll());
        return await Promise.all(promises);
    }

    getValues() {
        return this.dice.map(d => d.value);
    }

    getSelectedValues() {
        return this.dice
            .filter(d => d.isSelected)
            .map(d => d.value);
    }

    getAvailableDice() {
        return this.dice.filter(d => !d.isLocked && !d.isSelected);
    }

    getLockedDice() {
        return this.dice.filter(d => d.isLocked);
    }

    lockSelected() {
        this.dice.forEach(d => {
            if (d.isSelected) d.lock();
        });
    }

    resetAll() {
        this.dice.forEach(d => d.reset());
    }

    allLocked() {
        return this.dice.every(d => d.isLocked || d.isSelected);
    }

    setDiceValues(values) {
        values.forEach((v, i) => {
            if (this.dice[i]) this.dice[i].setValue(v);
        });
    }
}
