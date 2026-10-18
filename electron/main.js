const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

function createWindow() {
    const window = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Let the renderer know when full screen is toggled by other means
    // (F11, window manager, Esc, ...) so the saved setting stays in sync.
    const notifyFullScreenState = () => {
        if (!window.isDestroyed()) {
            window.webContents.send('window:fullscreen-changed', window.isFullScreen());
        }
    };
    window.on('enter-full-screen', notifyFullScreenState);
    window.on('leave-full-screen', notifyFullScreenState);

    window.loadFile(path.join(__dirname, '..', 'www', 'index.html'));

    // The footer version chip fetches version.json, which is blocked over the
    // file:// scheme used here — inject it natively instead.
    window.webContents.on('did-finish-load', () => {
        const version = app.getVersion();
        window.webContents.executeJavaScript(
            `const b = document.getElementById('app-version'); if (b) b.textContent = '· v' + ${JSON.stringify(version)};`
        ).catch(() => { /* page may be navigating */ });
    });
}

function registerWindowIpc() {
    ipcMain.on('window:set-fullscreen', (event, enabled) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (window && !window.isDestroyed()) window.setFullScreen(!!enabled);
    });

    ipcMain.handle('window:is-fullscreen', (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        return window && !window.isDestroyed() ? window.isFullScreen() : false;
    });
}

function configureAutoUpdates() {
    // Development builds have no published update feed. Installed builds check
    // the GitHub Release configured by electron-builder instead.
    if (!app.isPackaged) return;

    autoUpdater.on('error', (error) => {
        console.error('Unable to check for Farkle updates:', error);
    });

    autoUpdater.on('update-downloaded', async () => {
        const { response } = await dialog.showMessageBox({
            type: 'info',
            title: 'Update ready',
            message: 'A new version of Farkle has been downloaded.',
            detail: 'Restart now to install it, or choose Later to install it when the app next closes.',
            buttons: ['Restart now', 'Later'],
            defaultId: 0,
            cancelId: 1,
            noLink: true
        });

        if (response === 0) autoUpdater.quitAndInstall();
    });

    autoUpdater.checkForUpdatesAndNotify().catch((error) => {
        console.error('Unable to start the Farkle update check:', error);
    });
}

app.whenReady().then(() => {
    registerWindowIpc();
    createWindow();
    configureAutoUpdates();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
