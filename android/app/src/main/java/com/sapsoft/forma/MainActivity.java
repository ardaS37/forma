package com.sapsoft.forma;

import android.app.Activity;
import android.content.Intent;
import android.content.ComponentName;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.Insets;
import android.graphics.RectF;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.view.MotionEvent;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import org.json.JSONObject;
import org.json.JSONArray;
import java.util.ArrayList;
import java.util.List;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Collections;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** An offline Android shell: all content is served from packaged app assets. */
public final class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String HOME = "https://" + HOST + "/assets/web/index.html";
    private static final int SAVE_PNG = 101;
    private final ExecutorService fileWorker = Executors.newSingleThreadExecutor();
    private WebView webView;
    private FrameLayout root;
    private byte[] pendingPng;
    private boolean exportBusy;
    private String pendingLauncherAccent;
    private boolean stylusButtonPressed;
    private RectF nativeCanvasBounds;
    private List<RectF> nativeInkExclusions = new ArrayList<>();
    private float nativeCssScale = 1;
    private final StylusButtonState stylusState = new StylusButtonState();

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        pendingLauncherAccent = LauncherIconPalette.select(
                getSharedPreferences("forma-launcher", MODE_PRIVATE).getString("launcherAccent", "lavender"), null);
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.WHITE);
        webView = new DrawingWebView(this);
        webView.setHapticFeedbackEnabled(false);
        webView.setOnLongClickListener(view -> true);
        webView.setLongClickable(false);
        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
        } else {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        }
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                Insets bars = insets.getInsets(WindowInsets.Type.systemBars());
                Insets ime = insets.getInsets(WindowInsets.Type.ime());
                view.setPadding(bars.left, bars.top, bars.right, Math.max(bars.bottom, ime.bottom));
            } else {
                view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                        insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            }
            return insets;
        });
        root.requestApplyInsets();
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(false);
        webView.setBackgroundColor(Color.WHITE);
        webView.addJavascriptInterface(new NativeBridge(), "FormaAndroid");
        webView.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                if (HOME.equals(url)) notifySystemTheme();
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !isLocal(request.getUrl());
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!isLocal(uri) || !"GET".equals(request.getMethod())) return blocked();
                String path = uri.getPath().substring("/assets/".length());
                if (path.contains("..") || path.contains("\\") || path.indexOf('\0') >= 0) return blocked();
                try {
                    String type = path.endsWith(".html") ? "text/html" : path.endsWith(".css") ? "text/css"
                            : path.endsWith(".js") ? "application/javascript" : path.endsWith(".ttf") ? "font/ttf"
                            : path.endsWith(".svg") ? "image/svg+xml" : "application/octet-stream";
                    return new WebResourceResponse(type, "UTF-8", 200, "OK",
                            Collections.singletonMap("Content-Security-Policy",
                                    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
                                    + "font-src 'self'; img-src 'self' data: blob:; connect-src 'none'; "
                                    + "frame-src 'none'; object-src 'none'; base-uri 'none'"),
                            getAssets().open(path));
                } catch (IOException error) { return blocked(); }
            }
        });
        applyTheme(systemTheme());
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }
        webView.loadUrl(HOME);
    }

    // Keep Samsung barrel-button state available even when WebView omits button bits.
    // Observe events without consuming them so pressure, drawing and scrolling remain native.
    private void observeStylusButton(MotionEvent event) {
        boolean stylus = false;
        for (int i = 0; i < event.getPointerCount(); i++) {
            int type = event.getToolType(i);
            if (type == MotionEvent.TOOL_TYPE_STYLUS || type == MotionEvent.TOOL_TYPE_ERASER) {
                stylus = true;
                break;
            }
        }
        if (!stylus) return;
        boolean wasPressed = stylusButtonPressed;
        updateStylusButton(stylusState.update(event.getActionMasked(),
                event.getButtonState(), event.getActionButton()));
        int action = event.getActionMasked();
        if (wasPressed != stylusButtonPressed && (action == MotionEvent.ACTION_BUTTON_PRESS
                || action == MotionEvent.ACTION_BUTTON_RELEASE) && webView instanceof DrawingWebView)
            ((DrawingWebView) webView).queueButtonChange();
    }
    private void updateStylusButton(boolean pressed) {
        if (stylusButtonPressed == pressed) return;
        stylusButtonPressed = pressed;
        if (webView != null) webView.evaluateJavascript(
                "if(typeof setStylusButtonPressed==='function')setStylusButtonPressed(" + pressed + ");", null);
    }
    @Override public boolean dispatchTouchEvent(MotionEvent event) {
        observeStylusButton(event);
        return super.dispatchTouchEvent(event);
    }
    @Override public boolean dispatchGenericMotionEvent(MotionEvent event) {
        observeStylusButton(event);
        return super.dispatchGenericMotionEvent(event);
    }
    @Override public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (!hasFocus) { if (webView instanceof DrawingWebView) ((DrawingWebView) webView).cancelNativeInk(); stylusState.reset(); updateStylusButton(false); }
    }

    /** Canvas pen contact bypasses WebView's right-button/context-menu handling. */
    private final class DrawingWebView extends WebView {
        private boolean nativeDrawing, flushScheduled;
        private int nativePointer;
        private float lastX, lastY, lastPressure;
        private JSONArray pending = new JSONArray();
        private final Runnable flush = () -> {
            flushScheduled = false;
            if (pending.length() == 0) return;
            String samples = pending.toString();
            pending = new JSONArray();
            evaluateJavascript("if(typeof handleNativePenBatch==='function')handleNativePenBatch(" + samples + ");", null);
        };
        DrawingWebView(android.content.Context context) { super(context); }
        private void queue(String phase, float x, float y, float pressure, int id, boolean erase) {
            JSONArray sample = new JSONArray();
            try {
            sample.put(phase); sample.put((double)x); sample.put((double)y);
            sample.put((double)pressure); sample.put(id); sample.put(erase);
            } catch (org.json.JSONException invalidSample) { return; }
            pending.put(sample);
            if (!flushScheduled) { flushScheduled = true; postOnAnimation(flush); }
        }
        void queueButtonChange() {
            if (nativeDrawing) queue("move",lastX,lastY,lastPressure,nativePointer,stylusButtonPressed);
        }
        void cancelNativeInk() {
            // Preserve samples already queued, including a completed tap in this frame.
            removeCallbacks(flush);
            if (nativeDrawing) queue("cancel",lastX,lastY,0,nativePointer,false);
            nativeDrawing = false;
            removeCallbacks(flush); flush.run();
        }
        @Override public boolean onTouchEvent(MotionEvent event) {
            observeStylusButton(event);
            int action = event.getActionMasked(), index = event.getActionIndex(), type = event.getToolType(index);
            boolean pen = type == MotionEvent.TOOL_TYPE_STYLUS || type == MotionEvent.TOOL_TYPE_ERASER;
            float x = event.getX(index) / nativeCssScale, y = event.getY(index) / nativeCssScale;
            if (action == MotionEvent.ACTION_DOWN) {
                nativeDrawing = pen && nativeCanvasBounds != null && nativeCanvasBounds.contains(x,y);
                for (RectF r : nativeInkExclusions) if (r.contains(x,y)) nativeDrawing = false;
                nativePointer = 1000 + event.getPointerId(index);
            }
            if (nativeDrawing) {
                // Additional finger contacts never join the pen gesture.
                int penIndex = event.findPointerIndex(nativePointer - 1000);
                if (penIndex < 0) { cancelNativeInk(); return true; }
                index = penIndex;
                type = event.getToolType(index);
                x = event.getX(index) / nativeCssScale; y = event.getY(index) / nativeCssScale;
                boolean erase = stylusButtonPressed || type == MotionEvent.TOOL_TYPE_ERASER;
                if (action == MotionEvent.ACTION_MOVE) for (int h = 0; h < event.getHistorySize(); h++)
                    queue("move",event.getHistoricalX(index,h)/nativeCssScale,event.getHistoricalY(index,h)/nativeCssScale,
                            event.getHistoricalPressure(index,h),nativePointer,erase);
                boolean ends = action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_POINTER_UP && event.getActionIndex() == index;
                String phase = action == MotionEvent.ACTION_DOWN ? "down" : action == MotionEvent.ACTION_CANCEL ? "cancel" : ends ? "up" : "move";
                queue(phase,x,y,event.getPressure(index),nativePointer,erase);
                lastX = x; lastY = y; lastPressure = event.getPressure(index);
                if (ends || action == MotionEvent.ACTION_CANCEL) nativeDrawing = false;
                return true;
            }
            return super.onTouchEvent(event);
        }
        @Override public boolean onGenericMotionEvent(MotionEvent event) {
            observeStylusButton(event);
            return super.onGenericMotionEvent(event);
        }
    }

    private boolean isLocal(Uri uri) {
        return "https".equals(uri.getScheme()) && HOST.equals(uri.getHost())
                && uri.getPath() != null && uri.getPath().startsWith("/assets/");
    }

    private WebResourceResponse blocked() {
        return new WebResourceResponse("text/plain", "UTF-8", 403, "Forbidden",
                Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
    }

    private String systemTheme() {
        return (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK)
                == Configuration.UI_MODE_NIGHT_YES ? "dark" : "light";
    }

    private void notifySystemTheme() {
        if (webView != null) webView.evaluateJavascript(
                "window.setAndroidSystemTheme?.('" + systemTheme() + "')", null);
    }

    @Override public void onConfigurationChanged(Configuration configuration) {
        super.onConfigurationChanged(configuration);
        notifySystemTheme();
    }

    private void applyTheme(String mode) {
        boolean amoled = "amoled".equals(mode);
        boolean dark = amoled || "dark".equals(mode);
        int color = amoled ? Color.BLACK : dark ? Color.rgb(26, 35, 45) : Color.WHITE;
        root.setBackgroundColor(color);
        webView.setBackgroundColor(color);
        getWindow().setStatusBarColor(color);
        getWindow().setNavigationBarColor(color);
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                int mask = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                        | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
                controller.setSystemBarsAppearance(dark ? 0 : mask, mask);
            }
        } else {
            int mask = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            int flags = getWindow().getDecorView().getSystemUiVisibility();
            getWindow().getDecorView().setSystemUiVisibility(dark ? flags & ~mask : flags | mask);
        }
    }

    private void handleBack() {
        webView.evaluateJavascript("(()=>{const d=document.querySelector('dialog[open]');"
                + "if(d){if(typeof closeDialog==='function')closeDialog(d);else d.close();return true;}"
                + "if(typeof closeTopFloatingWindow==='function'&&closeTopFloatingWindow())return true;"
                + "const rp=document.getElementById('ruler-palette');if(rp&&!rp.hidden){closeRulerPalette();return true;}"
                + "const ep=document.getElementById('eraser-palette');if(ep&&!ep.hidden){closeEraserPalette();return true;}"
                + "const pp=document.getElementById('pen-palette');if(pp&&!pp.hidden){closePenPalette();return true;}"
                + "const n=document.getElementById('notes-page');if(n&&!n.hidden){home();return true;}"
                + "const w=document.getElementById('workspace');"
                + "if(w&&!w.hidden){document.getElementById('back').click();return true;}return false;})()",
                handled -> { if (!"true".equals(handled)) finish(); });
    }
    @Override public void onBackPressed() { handleBack(); }

    @Override protected void onPause() {
        if (webView instanceof DrawingWebView) ((DrawingWebView) webView).cancelNativeInk();
        stylusState.reset();
        updateStylusButton(false);
        webView.evaluateJavascript("(()=>{const w=document.getElementById('workspace');"
                + "if(w&&!w.hidden&&typeof save==='function')save();})()", null);
        webView.onPause();
        super.onPause();
    }
    @Override protected void onStop() {
        super.onStop();
        // Commit after leaving the app: some launchers restart a task when its alias changes.
        if (!isChangingConfigurations() && !exportBusy) applyLauncherAccent();
    }

    private void applyLauncherAccent() {
        PackageManager manager = getPackageManager();
        String selected = LauncherIconPalette.alias(pendingLauncherAccent);
        try {
            boolean matches = true;
            for (String alias : LauncherIconPalette.ALIASES)
                if (launcherAliasEnabled(manager, alias) != alias.equals(selected)) matches = false;
            if (matches) return;
            if (Build.VERSION.SDK_INT >= 33) {
                List<PackageManager.ComponentEnabledSetting> changes = new ArrayList<>();
                for (String alias : LauncherIconPalette.ALIASES) {
                    ComponentName component = new ComponentName(this, getPackageName() + "." + alias);
                    int desired = alias.equals(selected) ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED
                            : PackageManager.COMPONENT_ENABLED_STATE_DISABLED;
                    boolean enabled = launcherAliasEnabled(manager, alias);
                    if (enabled != alias.equals(selected)) changes.add(new PackageManager.ComponentEnabledSetting(
                            component, desired, PackageManager.DONT_KILL_APP));
                }
                if (!changes.isEmpty()) manager.setComponentEnabledSettings(changes);
            } else {
                // Enable the replacement first, keeping a launchable entry throughout the swap.
                ComponentName target = new ComponentName(this, getPackageName() + "." + selected);
                if (manager.getComponentEnabledSetting(target) != PackageManager.COMPONENT_ENABLED_STATE_ENABLED)
                    manager.setComponentEnabledSetting(target, PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                            PackageManager.DONT_KILL_APP);
                for (String alias : LauncherIconPalette.ALIASES) {
                    if (alias.equals(selected)) continue;
                    ComponentName component = new ComponentName(this, getPackageName() + "." + alias);
                    int state = manager.getComponentEnabledSetting(component);
                    if (state != PackageManager.COMPONENT_ENABLED_STATE_DISABLED)
                        manager.setComponentEnabledSetting(component, PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                                PackageManager.DONT_KILL_APP);
                }
            }
        } catch (RuntimeException error) {
            Log.w("Forma", "Launcher icon update deferred", error);
        }
    }

    private boolean launcherAliasEnabled(PackageManager manager, String alias) {
        int state = manager.getComponentEnabledSetting(new ComponentName(this, getPackageName() + "." + alias));
        return state == PackageManager.COMPONENT_ENABLED_STATE_ENABLED
                || state == PackageManager.COMPONENT_ENABLED_STATE_DEFAULT && alias.equals("LauncherLavender");
    }

    @Override protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
        notifySystemTheme();
    }
    @Override protected void onDestroy() {
        if (webView != null) { webView.removeJavascriptInterface("FormaAndroid"); webView.destroy(); }
        fileWorker.shutdown();
        super.onDestroy();
    }

    private void exportResult(String result) {
        if (isFinishing() || isDestroyed()) return;
        webView.evaluateJavascript("window.dispatchEvent(new CustomEvent('forma:export-result',"
                + "{detail:" + JSONObject.quote(result) + "}));", null);
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request != SAVE_PNG) return;
        final byte[] bytes = pendingPng;
        pendingPng = null;
        if (result != RESULT_OK || data == null || data.getData() == null || bytes == null) {
            exportBusy = false;
            exportResult("cancelled");
            return;
        }
        final Uri uri = data.getData();
        fileWorker.execute(() -> {
            String outcome;
            try (OutputStream output = getContentResolver().openOutputStream(uri, "wt")) {
                if (output == null) throw new IOException("No output stream");
                output.write(bytes);
                outcome = "saved";
            } catch (IOException | RuntimeException error) { outcome = "failed"; }
            final String status = outcome;
            runOnUiThread(() -> { exportBusy = false; exportResult(status); });
        });
    }

    public final class NativeBridge {
        @JavascriptInterface public void setLauncherAccent(String accent, String customColor) {
            final String selected = LauncherIconPalette.select(accent, customColor);
            runOnUiThread(() -> {
                pendingLauncherAccent = selected;
                getSharedPreferences("forma-launcher", MODE_PRIVATE).edit().putString("launcherAccent", selected).apply();
            });
        }
        @JavascriptInterface public String getSystemTheme() {
            return systemTheme();
        }
        @JavascriptInterface public void setDrawingBounds(String json) {
            try {
                JSONObject value = new JSONObject(json);
                final float scale = (float)value.optDouble("scale",1);
                if (!Float.isFinite(scale) || scale < .25f || scale > 8) return;
                JSONArray bounds = value.optJSONArray("bounds");
                final RectF rect = bounds == null ? null : new RectF((float)bounds.getDouble(0),
                        (float)bounds.getDouble(1),(float)bounds.getDouble(2),(float)bounds.getDouble(3));
                final List<RectF> exclusions = new ArrayList<>();
                JSONArray excluded = value.optJSONArray("excluded");
                if (excluded != null) for (int i=0; i<Math.min(40,excluded.length()); i++) {
                    JSONArray r = excluded.getJSONArray(i);
                    exclusions.add(new RectF((float)r.getDouble(0),(float)r.getDouble(1),(float)r.getDouble(2),(float)r.getDouble(3)));
                }
                runOnUiThread(() -> { nativeCssScale=scale; nativeCanvasBounds=rect; nativeInkExclusions=exclusions; });
            } catch (Exception ignored) { }
        }
        @JavascriptInterface public void setTheme(String mode) {
            if ("light".equals(mode) || "dark".equals(mode) || "amoled".equals(mode)) runOnUiThread(() -> applyTheme(mode));
        }
        @JavascriptInterface public void savePng(String dataUrl, String fileName) {
            if (dataUrl == null || !dataUrl.startsWith("data:image/png;base64,") || dataUrl.length() > 40_000_000) {
                runOnUiThread(() -> exportResult("failed")); return;
            }
            final byte[] bytes;
            try { bytes = Base64.decode(dataUrl.substring(22), Base64.DEFAULT); }
            catch (IllegalArgumentException error) { runOnUiThread(() -> exportResult("failed")); return; }
            if (bytes.length < 8 || bytes[0] != (byte) 137 || bytes[1] != 80 || bytes[2] != 78 || bytes[3] != 71) {
                runOnUiThread(() -> exportResult("failed")); return;
            }
            final String safeName = fileName == null ? "forma-not.png" : fileName.replaceAll("[\\\\/\\r\\n]", "_");
            runOnUiThread(() -> {
                if (exportBusy) { exportResult("busy"); return; }
                exportBusy = true;
                pendingPng = bytes;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("image/png");
                intent.putExtra(Intent.EXTRA_TITLE, safeName.endsWith(".png") ? safeName : safeName + ".png");
                try { startActivityForResult(intent, SAVE_PNG); }
                catch (RuntimeException error) { exportBusy = false; pendingPng = null; exportResult("failed"); }
            });
        }
    }
}
