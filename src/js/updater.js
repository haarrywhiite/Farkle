/**
 * APK self-updater (only active inside the Android build; the PWA and the
 * Windows exe update through the service worker / electron-updater instead).
 *
 * Flow: reads the stamped www/version.json, asks GitHub Releases for the
 * latest published version, and if a newer APK is attached offers a themed
 * in-game modal. Accepting downloads the APK via the native ApkUpdate plugin
 * and hands it to the Android package installer.
 */
(() => {
    const RELEASE_API = 'https://api.github.com/repos/haarrywhiite/Farkle/releases/latest';
    let busy = false;

    function isApkBuild() {
        return !!(window.Capacitor &&
            window.Capacitor.isNativePlatform &&
            typeof window.Capacitor.isNativePlatform === 'function' &&
            window.Capacitor.isNativePlatform() &&
            window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'android');
    }

    function plugin() {
        return window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins.ApkUpdate : null;
    }

    /** Positive when `latest` is a strictly newer semver than `current`. */
    function isNewer(current, latest) {
        const a = String(current).split(/[.\-]/).map(x => parseInt(x, 10) || 0);
        const b = String(latest).split(/[.\-]/).map(x => parseInt(x, 10) || 0);
        const len = Math.max(a.length, b.length);
        for (let i = 0; i < len; i++) {
            const d = (b[i] || 0) - (a[i] || 0);
            if (d > 0) return true;
            if (d < 0) return false;
        }
        return false;
    }

    async function checkForUpdate() {
        if (!isApkBuild() || busy) return;

        let currentVersion = null;
        try {
            const res = await fetch('version.json', { cache: 'no-store' });
            if (res.ok) currentVersion = (await res.json()).version;
        } catch (e) { /* dev / offline: stay silent */ }
        if (!currentVersion) return;

        let release = null;
        try {
            release = await (await fetch(RELEASE_API, { headers: { 'Accept': 'application/vnd.github+json' } })).json();
        } catch (e) { return; }

        const latest = (release && release.tag_name ? release.tag_name : '').replace(/^v/, '');
        const asset = (release && release.assets || []).find(a => a.name.endsWith('.apk'));

        if (!latest || !asset || !isNewer(currentVersion, latest)) return;
        offerUpdate(latest, asset);
    }

    function offerUpdate(version, asset) {
        const modal = document.getElementById('update-modal');
        const message = document.getElementById('update-message');
        const nowBtn = document.getElementById('update-now-btn');
        const laterBtn = document.getElementById('update-later-btn');
        if (!modal || !message || !nowBtn || !laterBtn) return;

        message.textContent = I18N.t('update_msg', { version: version });
        if (window.UI && UI.toggleModal) UI.toggleModal('update-modal', true);
        else modal.classList.remove('hidden');

        const resetLabels = () => {
            nowBtn.textContent = I18N.t('update_now');
            laterBtn.textContent = I18N.t('update_later');
        };

        laterBtn.onclick = () => {
            if (window.UI && UI.toggleModal) UI.toggleModal('update-modal', false);
            else modal.classList.add('hidden');
        };

        nowBtn.onclick = async () => {
            if (busy) return;
            busy = true;
            const ApkUpdate = plugin();
            if (!ApkUpdate) { window.open(asset.browser_download_url, '_blank'); busy = false; return; }

            nowBtn.textContent = I18N.t('update_fetching');
            try {
                const fileName = asset.name;
                await ApkUpdate.download({ url: asset.browser_download_url, fileName });
                nowBtn.textContent = I18N.t('update_installing');
                await ApkUpdate.install({ fileName });
                if (window.UI && UI.toggleModal) UI.toggleModal('update-modal', false);
                else modal.classList.add('hidden');
            } catch (e) {
                // Fall back to letting the browser/system download it directly
                window.open(asset.browser_download_url, '_blank');
            }
            busy = false;
            resetLabels();
        };
    }

    // Check shortly after the tavern has loaded; retries aren't necessary
    // since each app launch re-checks.
    const schedule = () => setTimeout(checkForUpdate, 2500);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', schedule);
    } else {
        schedule();
    }
})();
