/**
 * Kingdom Dice - Internationalization (i18n) Engine
 * Full bilingual support (English and Spanish)
 */

const I18N = {
    currentLang: 'en',
    listeners: [],

    translations: {
        en: {
            // App & Meta
            meta_title: "Kingdom Dice - Medieval Farkle",
            meta_description: "A rustic medieval Farkle experience. Risk your gold and outsmart the bot.",
            app_title: "KINGDOM DICE",
            loader_subtitle: "Preparing the Tavern...",

            // Home / Start Menu
            start_subtitle: "A High-Stakes Duel of Luck & Wit",
            select_language: "Select Language",
            lang_en: "🇬🇧 ENGLISH",
            lang_es: "🇪🇸 ESPAÑOL",
            select_mode: "Select Mode",
            mode_pv_ai: "VERSUS KING",
            mode_pvp: "LOCAL DUEL",
            mode_tournament: "TOURNAMENT",
            winning_goal: "Winning Goal",
            enter_tavern: "ENTER THE TAVERN",
            scroll_rules: "Scroll of Rules",
            btn_language: "🌐 Language",
            choose_tongue: "Choose thy tongue:",
            made_by: "Made by Harry White 2026",

            // Headers & Common
            goal_label: "Goal: {score}",
            you: "YOU",
            thou: "Thou",
            opponent: "OPPONENT",
            the_king: "The King",
            player_1: "Player 1",
            player_2: "Player 2",
            btn_rules_title: "Rules",
            btn_sound_title: "Toggle Sound",
            btn_menu_title: "Return to Menu",
            btn_lang_title: "Switch Language / Cambiar Idioma",

            // Tournament Overlay
            tournament_bracket_title: "TOURNAMENT BRACKET",
            semi_finals: "Semi-Finals",
            grand_final: "Grand Final",
            winner_1: "Winner 1",
            winner_2: "Winner 2",
            begin_tournament: "BEGIN TOURNAMENT",
            vs: "VS",
            tournament_other_win: "{winner} wins the other Semi-Final!",
            match_announcement: "MATCH: {p1} VS {p2}",
            champion_msg: "THOU ART THE KINGDOM CHAMPION!",
            champion_defeat_msg: "{winner} HAS DEFEATED THEE!",
            champion_advance_msg: "THOU ADVANCES TO THE FINAL!",
            champion_eliminated_msg: "{winner} ADVANCES! Thou hast been eliminated!",

            // Game Board & Controls
            thy_turn: "THY TURN",
            player_turn: "{player}'S TURN",
            purse_locked: "🔒 Purse Locked (Need 500+)",
            purse_locked_tip: "Thou must score 500+ in one turn to begin hoarding gold!",
            gold_at_risk: "GOLD AT RISK",
            btn_roll: "ROLL",
            btn_bank: "BANK",
            prepare_dice: "Prepare thy dice...",
            farkle_banner: "!!! FARKLE !!!",
            hot_dice: "HOT DICE! Roll all 6 again!",
            select_scoring: "Select scoring dice to keep.",
            select_at_least_one: "Select at least one scoring die!",
            purse_opened: "{player} OPENS THEIR PURSE!",
            need_500_to_board: "Must score 500+ to get on the board!",
            tavern_remembers: "The Tavern remembers thy last game!",
            select_mode_first: "Select a game mode first!",
            select_goal_first: "Select a winning goal first!",

            // AI Decision & Advice Messages
            ai_thinking: "Opponent is thinking...",
            ai_rolls_again: "Opponent decides to roll again!",
            ai_banks: "Opponent decides to bank.",
            ai_confused: "The Oracle is confused! Opponent banks to safety.",
            ai_choosing: "Opponent is choosing dice...",
            advice_wait_dice: "Wait for the dice to settle, child.",
            advice_cast_bones: "Cast the bones and let fate decide!",
            advice_oracle_sleeps: "The Oracle sleeps. Play thy turn.",
            advice_select_first: "Thou must select scoring dice before the Oracle can see.",
            advice_hot_dice: "Hot Dice! The fire is with thee. Roll all six again!",
            advice_bank: "Bank thy {score} Gold. A wise merchant knows when to fold and keep the coin.",
            advice_risk: "The winds of the tavern favor thee. Risk the remaining {dice} dice for more!",

            // History / Chronicle
            chronicle_title: "CHRONICLE",
            history_gold: "{player}: +{score} Gold",
            history_farkle: "{player}: FARKLE!",

            // Sacred Rules Modal
            rules_title: "THE KING'S SACRED RULES",
            rules_scoring: "SCORING",
            rule_single_1: "Single 1:",
            rule_single_5: "Single 5:",
            rule_three_1s: "Three 1s:",
            rule_three_kind: "Three of a Kind:",
            rule_four_kind: "Four of a Kind:",
            rule_five_kind: "Five of a Kind:",
            rule_six_kind: "Six of a Kind:",
            rule_straight: "Straight (1-6):",
            rule_three_pairs: "Three Pairs:",
            rule_two_triplets: "Two Triplets:",
            val_100_gold: "100 Gold",
            val_50_gold: "50 Gold",
            val_1000_gold: "1,000 Gold",
            val_1500_gold: "1,500 Gold",
            val_2500_gold: "2,500 Gold",
            val_face_100: "Face x 100",
            val_2x_triple: "2x Triple",
            val_3x_triple: "3x Triple",
            val_4x_triple: "4x Triple",
            rules_engagement: "RULES OF ENGAGEMENT",
            rule_eng_1: "1. Roll all 6 dice to start. Keep scoring dice.",
            rule_eng_2: "2. Set aside at least one scoring die per roll to continue.",
            rule_eng_3: "3. Roll remaining dice or <strong>Bank thy points</strong>.",
            rule_eng_4: "4. <strong>Farkle!</strong> A score-less roll forfeits all points this turn.",
            rule_eng_5: "5. <strong>Hot Dice!</strong> Use all 6 dice to earn another full roll!",
            close_scroll: "Close Scroll",

            // Game Over Modal
            victory_title: "VICTORY!",
            defeat_title: "DEFEAT!",
            winner_human_msg: "{winner} hast bested the opponent and claimed the gold!",
            winner_ai_msg: "{winner} has outwitted thee. Thy purse is empty.",
            winner_objective: "Thou hast reached the objective!",
            final_thy_gold: "THY GOLD",
            final_opponent: "OPPONENT",
            btn_claim_rematch: "CLAIM THY REWARD & REMATCH",
            btn_return_tavern: "RETURN TO TAVERN",

            // Confirm Modal
            confirm_retire_title: "Retire to Tavern?",
            confirm_retire_msg: "Dost thou wish to abandon this duel and return to the tavern?",
            confirm_yes: "YES, TO THE TAVERN",
            confirm_no: "NO, REMAIN HERE",

            // Medieval Opponents Names
            opponents: [
                "King Arthur", "Sir Lancelot", "Sir Galahad", "Sir Gawain",
                "Lady Guinevere", "Merlin", "Sir Percival", "Sir Bedivere",
                "Lady Morgan", "Sir Tristan", "Lady Isolde", "Sir Kay",
                "Robin Hood", "Maid Marian", "Little John", "Friar Tuck",
                "William Wallace", "Richard Lionheart", "Joan of Arc", "Charlemagne"
            ]
        },

        es: {
            // App & Meta
            meta_title: "Kingdom Dice - Farkle Medieval",
            meta_description: "Una experiencia medieval de Farkle. Arriesga tu oro y supera en astucia a la corona.",
            app_title: "KINGDOM DICE",
            loader_subtitle: "Preparando la Taberna...",

            // Home / Start Menu
            start_subtitle: "Un Duelo de Alto Riesgo de Suerte e Ingenio",
            select_language: "Seleccionar Idioma",
            lang_en: "🇬🇧 ENGLISH",
            lang_es: "🇪🇸 ESPAÑOL",
            select_mode: "Seleccionar Modo",
            mode_pv_ai: "CONTRA EL REY",
            mode_pvp: "DUELO LOCAL",
            mode_tournament: "TORNEO",
            winning_goal: "Meta de Victoria",
            enter_tavern: "ENTRAR A LA TABERNA",
            scroll_rules: "Pergamino de Reglas",
            btn_language: "🌐 Idioma",
            choose_tongue: "Elige tu lengua:",
            made_by: "Creado por Harry White 2026",

            // Headers & Common
            goal_label: "Meta: {score}",
            you: "TÚ",
            thou: "Tú",
            opponent: "RIVAL",
            the_king: "El Rey",
            player_1: "Jugador 1",
            player_2: "Jugador 2",
            btn_rules_title: "Reglas",
            btn_sound_title: "Activar/Desactivar Sonido",
            btn_menu_title: "Volver al Menú",
            btn_lang_title: "Cambiar Idioma / Switch Language",

            // Tournament Overlay
            tournament_bracket_title: "TABLA DEL TORNEO",
            semi_finals: "Semifinales",
            grand_final: "Gran Final",
            winner_1: "Ganador 1",
            winner_2: "Ganador 2",
            begin_tournament: "INICIAR TORNEO",
            vs: "VS",
            tournament_other_win: "¡{winner} gana la otra semifinal!",
            match_announcement: "COMBATE: {p1} VS {p2}",
            champion_msg: "¡ERES EL GRAN CAMPEÓN DEL REINO!",
            champion_defeat_msg: "¡{winner} TE HA DERROTADO!",
            champion_advance_msg: "¡AVANZAS A LA GRAN FINAL!",
            champion_eliminated_msg: "¡{winner} AVANZA! ¡Has sido eliminado!",

            // Game Board & Controls
            thy_turn: "TU TURNO",
            player_turn: "TURNO DE {player}",
            purse_locked: "🔒 Bolsa Cerrada (Mín. 500+)",
            purse_locked_tip: "¡Debes anotar 500+ en un turno para empezar a guardar oro!",
            gold_at_risk: "ORO EN JUEGO",
            btn_roll: "LANZAR",
            btn_bank: "GUARDAR",
            prepare_dice: "Prepara tus dados...",
            farkle_banner: "¡¡¡ FARKLE !!!",
            hot_dice: "¡DADOS ARDIENTES! ¡Lanza los 6 de nuevo!",
            select_scoring: "Selecciona dados con puntos para guardar.",
            select_at_least_one: "¡Selecciona al menos un dado con puntos!",
            purse_opened: "¡{player} ABRE SU BOLSA!",
            need_500_to_board: "¡Debes anotar 500+ para entrar en juego!",
            tavern_remembers: "¡La Taberna recuerda tu última partida!",
            select_mode_first: "¡Primero selecciona un modo de juego!",
            select_goal_first: "¡Primero selecciona una meta de puntos!",

            // AI Decision & Advice Messages
            ai_thinking: "El rival está pensando...",
            ai_rolls_again: "¡El rival decide volver a lanzar!",
            ai_banks: "El rival decide guardar sus puntos.",
            ai_confused: "¡El Oráculo está confundido! El rival guarda por seguridad.",
            ai_choosing: "El rival está escogiendo dados...",
            advice_wait_dice: "Espera a que los dados se detengan, muchacho.",
            advice_cast_bones: "¡Lanza los huesos y deja que el destino decida!",
            advice_oracle_sleeps: "El Oráculo duerme. Juega tu turno.",
            advice_select_first: "Debes seleccionar dados con puntos antes de consultar al Oráculo.",
            advice_hot_dice: "¡Dados ardientes! El fuego te acompaña. ¡Lanza los seis de nuevo!",
            advice_bank: "Guarda tus {score} de oro. Un mercader sabio sabe cuándo retirarse con sus monedas.",
            advice_risk: "Los vientos de la taberna te son favorables. ¡Arriesga los {dice} dados restantes!",

            // History / Chronicle
            chronicle_title: "CRÓNICA",
            history_gold: "{player}: +{score} Oro",
            history_farkle: "{player}: ¡FARKLE!",

            // Sacred Rules Modal
            rules_title: "LAS SAGRADAS REGLAS DEL REY",
            rules_scoring: "PUNTUACIÓN",
            rule_single_1: "Un 1 suelto:",
            rule_single_5: "Un 5 suelto:",
            rule_three_1s: "Tres 1s:",
            rule_three_kind: "Trío (3 iguales):",
            rule_four_kind: "Cuarteto (4 iguales):",
            rule_five_kind: "Quinteto (5 iguales):",
            rule_six_kind: "Sexteto (6 iguales):",
            rule_straight: "Escalera (1-6):",
            rule_three_pairs: "Tres Parejas:",
            rule_two_triplets: "Dos Tríos:",
            val_100_gold: "100 Oro",
            val_50_gold: "50 Oro",
            val_1000_gold: "1.000 Oro",
            val_1500_gold: "1.500 Oro",
            val_2500_gold: "2.500 Oro",
            val_face_100: "Cara x 100",
            val_2x_triple: "2x Trío",
            val_3x_triple: "3x Trío",
            val_4x_triple: "4x Trío",
            rules_engagement: "REGLAS DE DUELO",
            rule_eng_1: "1. Lanza los 6 dados al empezar. Conserva dados con puntuación.",
            rule_eng_2: "2. Separa al menos un dado con puntuación por tirada para seguir.",
            rule_eng_3: "3. Lanza los dados restantes o <strong>Guarda tus puntos</strong>.",
            rule_eng_4: "4. <strong>¡Farkle!</strong> Una tirada sin puntos anula todo el oro de este turno.",
            rule_eng_5: "5. <strong>¡Dados Ardientes!</strong> ¡Usa los 6 dados para ganar otra tirada completa!",
            close_scroll: "Cerrar Pergamino",

            // Game Over Modal
            victory_title: "¡VICTORIA!",
            defeat_title: "¡DERROTA!",
            winner_human_msg: "¡{winner} ha vencido al rival y reclamado el oro!",
            winner_ai_msg: "{winner} te ha superado en astucia. Tu bolsa está vacía.",
            winner_objective: "¡Has alcanzado el objetivo real!",
            final_thy_gold: "TU ORO",
            final_opponent: "RIVAL",
            btn_claim_rematch: "RECLAMAR RECOMPENSA Y REVANCHA",
            btn_return_tavern: "VOLVER A LA TABERNA",

            // Confirm Modal
            confirm_retire_title: "¿Retirarse a la Taberna?",
            confirm_retire_msg: "¿Deseas abandonar este duelo y volver a la taberna?",
            confirm_yes: "SÍ, A LA TABERNA",
            confirm_no: "NO, SEGUIR AQUÍ",

            // Medieval Opponents Names
            opponents: [
                "Rey Arturo", "Sir Lancelot", "Sir Galahad", "Sir Gawain",
                "Dama Ginebra", "Merlín", "Sir Percival", "Sir Bedivere",
                "Dama Morgana", "Sir Tristán", "Dama Isolda", "Sir Kay",
                "Robin Hood", "Lady Marian", "Pequeño Juan", "Fray Tuck",
                "William Wallace", "Ricardo Corazón de León", "Juana de Arco", "Carlomagno"
            ]
        }
    },

    init() {
        // Load saved language or detect browser preference
        let saved = 'en';
        try {
            if (typeof localStorage !== 'undefined') {
                saved = localStorage.getItem('kingdomDiceLang');
            }
            if (!saved && typeof navigator !== 'undefined') {
                const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
                if (navLang.startsWith('es')) saved = 'es';
            }
        } catch (e) {}

        this.setLanguage(saved || 'en', false);
    },

    setLanguage(lang, notify = true) {
        if (!this.translations[lang]) lang = 'en';
        this.currentLang = lang;

        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('kingdomDiceLang', lang);
            }
        } catch (e) {}

        if (typeof document !== 'undefined') {
            document.documentElement.lang = lang;
            document.title = this.t('meta_title');

            // Update active class on language selector buttons
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === lang);
            });

            // Update language badge in header if exists
            document.querySelectorAll('.lang-tag').forEach(tag => {
                tag.textContent = lang.toUpperCase();
            });

            this.updateDOM();
        }

        if (notify) {
            this.listeners.forEach(fn => fn(lang));
        }
    },

    getLanguage() {
        return this.currentLang;
    },

    toggleLanguage() {
        const nextLang = this.currentLang === 'en' ? 'es' : 'en';
        this.setLanguage(nextLang, true);
        return nextLang;
    },

    onLanguageChange(callback) {
        this.listeners.push(callback);
    },

    t(key, params = {}) {
        const dict = this.translations[this.currentLang] || this.translations.en;
        let text = dict[key] || this.translations.en[key] || key;

        if (typeof text === 'string') {
            for (const [pKey, pVal] of Object.entries(params)) {
                text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), pVal);
            }
        }
        return text;
    },

    updateDOM() {
        // Translate text contents
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation) {
                if (/<[a-z][\s\S]*>/i.test(translation)) {
                    el.innerHTML = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });

        // Translate titles / tooltips
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = this.t(key);
            if (translation) el.setAttribute('title', translation);
        });

        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            if (translation) el.setAttribute('placeholder', translation);
        });
    }
};

// Auto initialize as soon as parsed
I18N.init();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18N;
}
