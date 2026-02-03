/**
 * Farkle Scoring Engine
 * Implements standard rules including bonuses for straights, pairs, and multiples.
 */

const Scoring = {
    /**
     * Calculates the score for a set of dice.
     * @param {number[]} dice - Array of dice values (1-6)
     * @returns {Object} { score, usedCount }
     */
    calculateScore(dice) {
        if (!dice || dice.length === 0) return { score: 0, usedCount: 0 };

        const counts = this.getCounts(dice);
        let score = 0;
        let usedCount = 0;

        // 1. Check for 6-die specials
        if (dice.length === 6) {
            // Straight 1-6
            if (Object.keys(counts).length === 6) {
                return { score: 1500, usedCount: 6 };
            }

            // Three pairs
            const pairCount = Object.values(counts).filter(v => v === 2).length;
            if (pairCount === 3) {
                return { score: 1500, usedCount: 6 };
            }

            // Two triplets
            const tripletCount = Object.values(counts).filter(v => v === 3).length;
            if (tripletCount === 2) {
                return { score: 2500, usedCount: 6 };
            }
        }

        // 2. Check for Multiples (3 or more of a kind)
        for (let val = 1; val <= 6; val++) {
            const count = counts[val] || 0;
            if (count >= 3) {
                let baseScore = (val === 1) ? 1000 : val * 100;
                
                if (count === 3) {
                    score += baseScore;
                } else if (count === 4) {
                    score += baseScore * 2;
                } else if (count === 5) {
                    score += baseScore * 3;
                } else if (count === 6) {
                    score += baseScore * 4;
                }
                
                usedCount += count;
                counts[val] = 0; // Consume these dice
            }
        }

        // 3. Check for remaining Singles (1s and 5s)
        if (counts[1]) {
            score += counts[1] * 100;
            usedCount += counts[1];
        }
        if (counts[5]) {
            score += counts[5] * 50;
            usedCount += counts[5];
        }

        return { score, usedCount };
    },

    /**
     * Utility to count occurrences of each die value
     */
    getCounts(dice) {
        const counts = {};
        dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
        return counts;
    },

    /**
     * Determines if a set of dice contains ANY scoring combination
     */
    hasScoringDice(dice) {
        return this.calculateScore(dice).score > 0;
    },

    /**
     * Finds which specific dice are part of scoring combinations
     * Useful for UI feedback and AI
     */
    getScoringIndices(dice) {
        const indices = [];
        const counts = this.getCounts(dice);
        
        // Straights, three pairs, two triplets (all dice score)
        const result = this.calculateScore(dice);
        if (result.usedCount === dice.length && result.score > 0) {
            return dice.map((_, i) => i);
        }

        // Multiples
        for (let val = 1; val <= 6; val++) {
            if (counts[val] >= 3) {
                dice.forEach((d, i) => {
                    if (d === val) indices.push(i);
                });
            }
        }

        // Singles
        dice.forEach((d, i) => {
            if (!indices.includes(i) && (d === 1 || d === 5)) {
                indices.push(i);
            }
        });

        return indices;
    }
};

// Export if in Node, otherwise attach to window
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Scoring;
}
