/**
 * Preload script for the Electron desktop build.
 * Exposes a minimal, context-isolated bridge for window controls
 * so the renderer can toggle full screen / windowed mode.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
    setFullScreen(enabled) {
        ipcRenderer.send('window:set-fullscreen', !!enabled);
    },

    isFullScreen() {
        return ipcRenderer.invoke('window:is-fullscreen');
    },

    onFullScreenChange(callback) {
        const handler = (_event, isActive) => callback(!!isActive);
        ipcRenderer.on('window:fullscreen-changed', handler);
        return () => ipcRenderer.removeListener('window:fullscreen-changed', handler);
    }
});
