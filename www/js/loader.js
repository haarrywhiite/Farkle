/**
 * Asset Loader
 * Preloads critical images and audio before the game starts
 */
class AssetLoader {
    constructor(assets, onProgress, onComplete) {
        this.assets = assets;
        this.onProgress = onProgress;
        this.onComplete = onComplete;
        this.total = assets.length;
        this.loaded = 0;
    }

    start() {
        if (this.total === 0) {
            this.onComplete();
            return;
        }

        this.assets.forEach(url => {
            const ext = url.split('.').pop().toLowerCase();
            if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext)) {
                this.loadImage(url);
            } else if (['mp3', 'wav', 'ogg'].includes(ext)) {
                this.loadAudio(url);
            } else {
                // Unknown type, just mark as loaded
                this.markLoaded();
            }
        });
    }

    loadImage(url) {
        const img = new Image();
        img.onload = () => this.markLoaded();
        img.onerror = () => {
            console.warn(`Failed to load image: ${url}`);
            this.markLoaded();
        };
        img.src = url;
    }

    loadAudio(url) {
        const audio = new Audio();
        audio.oncanplaythrough = () => this.markLoaded();
        audio.onerror = () => {
            console.warn(`Failed to load audio: ${url}`);
            this.markLoaded();
        };
        audio.src = url;
        // Some browsers need load() to start preloading
        audio.load();
    }

    markLoaded() {
        this.loaded++;
        const percent = Math.round((this.loaded / this.total) * 100);
        if (this.onProgress) this.onProgress(percent);
        
        if (this.loaded >= this.total) {
            this.onComplete();
        }
    }
}

// Initialize loader
window.addEventListener('DOMContentLoaded', () => {
    const assetsToLoad = [
        'img/table.png',
        'img/parchment.png',
        'img/leather.png',
        'img/icon-192.png',
        'https://www.chosic.com/wp-content/uploads/2021/07/Medieval-Feast.mp3'
    ];

    const loader = new AssetLoader(
        assetsToLoad,
        (percent) => {
            const progressBar = document.getElementById('loader-progress-fill');
            const progressText = document.getElementById('loader-percent');
            if (progressBar) progressBar.style.width = `${percent}%`;
            if (progressText) progressText.textContent = `${percent}%`;
        },
        () => {
            // Give a tiny delay for the "100%" to be visible
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                const startMenu = document.getElementById('start-menu');
                if (loadingScreen) {
                    loadingScreen.classList.add('fade-out');
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        // Only show start menu if we're not resuming a game
                        // UI.init will handle showing the app if state exists
                    }, 500);
                }
            }, 300);
        }
    );

    loader.start();
});
