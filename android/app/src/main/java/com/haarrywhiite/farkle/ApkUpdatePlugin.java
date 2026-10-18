package com.haarrywhiite.farkle;

import android.content.Intent;
import android.net.Uri;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.zip.ZipFile;

/**
 * Lets the packaged APK self-update from GitHub Releases:
 * download() streams the new APK into the app cache so the web layer stays
 * responsive, and install() hands it to the Android package installer via
 * the FileProvider registered in AndroidManifest.xml.
 */
@CapacitorPlugin(name = "ApkUpdate")
public class ApkUpdatePlugin extends Plugin {

    static final String UPDATE_DIR = "farkle_updates";

    @PluginMethod
    public void download(PluginCall call) {
        final String url = call.getString("url");
        final String fileName = call.getString("fileName");
        if (url == null || fileName == null) {
            call.reject("Missing url or fileName");
            return;
        }

        new Thread(() -> {
            try {
                File dir = new File(getContext().getCacheDir(), UPDATE_DIR);
                if (!dir.exists()) dir.mkdirs();
                File out = new File(dir, fileName);
                if (out.exists()) out.delete();

                HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(30000);
                conn.setInstanceFollowRedirects(true);
                conn.setRequestProperty("User-Agent", "Farkle-Game-Updater");
                int code = conn.getResponseCode();
                if (code < 200 || code >= 300) {
                    call.reject("Download failed: HTTP " + code);
                    conn.disconnect();
                    return;
                }

                try (InputStream in = conn.getInputStream();
                     FileOutputStream outStream = new FileOutputStream(out)) {
                    byte[] buffer = new byte[16384];
                    int read;
                    while ((read = in.read(buffer)) != -1) {
                        outStream.write(buffer, 0, read);
                    }
                }
                conn.disconnect();

                // Fail fast if we somehow saved a corrupt/non-APK payload
                try (ZipFile zip = new ZipFile(out)) {
                    if (zip.getEntry("AndroidManifest.xml") == null) {
                        call.reject("Saved file is not a valid APK");
                        return;
                    }
                }

                JSObject result = new JSObject();
                result.put("path", out.getAbsolutePath());
                result.put("bytes", out.length());
                call.resolve(result);
            } catch (Exception e) {
                call.reject("APK download failed: " + e.getMessage());
            }
        }).start();
    }

    @PluginMethod
    public void install(PluginCall call) {
        final String fileName = call.getString("fileName");
        if (fileName == null) {
            call.reject("Missing fileName");
            return;
        }
        try {
            File apk = new File(new File(getContext().getCacheDir(), UPDATE_DIR), fileName);
            if (!apk.exists()) {
                call.reject("Downloaded update not found");
                return;
            }
            Uri uri = FileProvider.getUriForFile(
                    getContext(),
                    getContext().getPackageName() + ".fileprovider",
                    apk);
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Install failed: " + e.getMessage());
        }
    }
}
