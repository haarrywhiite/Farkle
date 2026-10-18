/**
 * Settings
 * Persistent user preferences: display mode (full screen / windowed),
 * tavern music, volume, animations and gameplay options.
 * Saved in localStorage under 'farkleSettings' so they survive restarts.
 * Works in plain browsers (PWA), Electron (via window.desktopAPI) and Capacitor.
 */

const Settings = {
    STORAGE_KEY: 'farkleSettings',

    defaults: {
        displayMode: 'windowed', // 'windowed' | 'fullscreen'
        musicOn: false,
        musicVolume: 60,         // 0 - 100
        animations: true,        // false = reduced motion
        confirmBank: false       // ask before banking points
    },

    data: {},
    listeners: [],

    init() {
        this.data = Object.assign({}, this.defaults);

        try {
            if (typeof localStorage !== 'undefined') {
                const saved = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
                for (const key of Object.keys(this.defaults)) {
                    if (saved && typeof saved[key] === typeof this.defaults[key]) {
                        this.data[key] = saved[key];
                    }
                }
            }
        } catch (e) {
            // Corrupted storage: keep the defaults.
        }

        if (typeof document !== 'undefined') {
            this.applyAnimations();
            this.applyMusic();
            this.watchNativeFullScreen();

            // Browsers only allow full screen after a user gesture, so a saved
            // "fullscreen" preference is applied on the first click or tap.
            if (this.data.displayMode === 'fullscreen' && !this.isDesktopApp()) {
                document.addEventListener('pointerdown', () => this.applyDisplayMode(), { once: true });
            }

            // Same for music: browsers block autoplay until the first user
            // gesture, so retry playing the tavern music on the first tap.
            if (this.data.musicOn) {
                document.addEventListener('pointerdown', () => this.applyMusic(), { once: true });
            }
        }
    },

    get(key) {
        return this.data[key];
    },

    set(key, value) {
        if (!(key in this.defaults) || this.data[key] === value) return;
        this.data[key] = value;
        this.save();

        if (key === 'displayMode') this.applyDisplayMode();
        if (key === 'musicOn' || key === 'musicVolume') this.applyMusic();
        if (key === 'animations') this.applyAnimations();

        this.listeners.forEach(fn => fn(key, value));
    },

    onChange(callback) {
        this.listeners.push(callback);
    },

    save() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            }
        } catch (e) { /* storage unavailable */ }
    },

    /** True when running inside the Electron desktop app. */
    isDesktopApp() {
        return typeof window !== 'undefined' && !!window.desktopAPI;
    },

    /* ---------- Display mode (full screen / windowed) ---------- */

    applyDisplayMode() {
        const wantFullscreen = this.data.displayMode === 'fullscreen';

        // Electron: the main process owns the window, so toggle it via IPC.
        if (this.isDesktopApp()) {
            window.desktopAPI.setFullScreen(wantFullscreen);
            return;
        }

        if (typeof document === 'undefined') return;

        const active = !!(document.fullscreenElement || document.webkitFullscreenElement);
        const root = document.documentElement;

        if (wantFullscreen && !active) {
            const request = root.requestFullscreen || root.webkitRequestFullscreen;
            if (request) {
                const result = request.call(root);
                if (result && result.catch) result.catch(() => { /* needs a user gesture */ });
            }
        } else if (!wantFullscreen && active) {
            const exit = document.exitFullscreen || document.webkitExitFullscreen;
            if (exit) {
                const result = exit.call(document);
                if (result && result.catch) result.catch(() => { /* ignore */ });
            }
        }
    },

    /**
     * Keep the saved preference in sync when the user enters or leaves full
     * screen by other means (Esc / F11, window manager, etc.).
     */
    watchNativeFullScreen() {
        if (this.isDesktopApp()) {
            if (typeof window.desktopAPI.onFullScreenChange === 'function') {
                window.desktopAPI.onFullScreenChange((isActive) => {
                    this.set('displayMode', isActive ? 'fullscreen' : 'windowed');
                });
            }
            return;
        }

        const sync = () => {
            const active = !!(document.fullscreenElement || document.webkitFullscreenElement);
            this.set('displayMode', active ? 'fullscreen' : 'windowed');
        };
        document.addEventListener('fullscreenchange', sync);
        document.addEventListener('webkitfullscreenchange', sync);
    },

    /* ---------- Music ---------- */

    applyMusic() {
        if (typeof document === 'undefined') return;
        const music = document.getElementById('tavern-music');
        if (!music) return;

        music.volume = Math.min(1, Math.max(0, (this.data.musicVolume || 0) / 100));

        if (this.data.musicOn) {
            if (music.paused) {
                const result = music.play();
                if (result && result.catch) result.catch(() => { /* blocked until first gesture */ });
            }
        } else if (!music.paused) {
            music.pause();
        }
    },

    /* ---------- Animations ---------- */

    applyAnimations() {
        if (typeof document === 'undefined') return;
        document.body.classList.toggle('reduce-motion', this.data.animations === false);
    }
};

Settings.init();
