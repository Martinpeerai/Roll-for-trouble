package at.martinjpeer.rollfortrouble;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.io.PrintWriter;
import java.io.StringWriter;

public class MainActivity extends Activity {
    private WebView webView;
    private Thread.UncaughtExceptionHandler previousExceptionHandler;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        installCrashRecorder();
        showLauncher(null);
    }

    private void installCrashRecorder() {
        previousExceptionHandler = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            try {
                StringWriter sw = new StringWriter();
                throwable.printStackTrace(new PrintWriter(sw));
                getSharedPreferences("rft_diag", MODE_PRIVATE)
                    .edit()
                    .putString("last_native_crash", sw.toString())
                    .apply();
            } catch (Throwable ignored) {}
            if (previousExceptionHandler != null) {
                previousExceptionHandler.uncaughtException(thread, throwable);
            }
        });
    }

    private TextView makeText(String value, int sizeSp) {
        TextView tv = new TextView(this);
        tv.setText(value);
        tv.setTextColor(Color.rgb(238, 232, 216));
        tv.setTextSize(sizeSp);
        tv.setGravity(Gravity.CENTER);
        tv.setPadding(28, 12, 28, 12);
        return tv;
    }

    private Button makeButton(String label) {
        Button b = new Button(this);
        b.setText(label);
        b.setAllCaps(false);
        b.setTextSize(17);
        b.setPadding(30, 18, 30, 18);
        return b;
    }

    private void showLauncher(String runtimeError) {
        if (webView != null) {
            try { webView.stopLoading(); } catch (Throwable ignored) {}
            try { webView.destroy(); } catch (Throwable ignored) {}
            webView = null;
        }

        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setPadding(40, 32, 40, 32);
        root.setBackgroundColor(Color.rgb(11, 11, 12));

        TextView title = makeText("ROLL FOR TROUBLE", 28);
        TextView version = makeText("Android 0.3 · Stabilitäts- und Diagnosebuild", 15);

        Button normal = makeButton("Spiel starten");
        normal.setOnClickListener(v -> startGame(false));

        Button safe = makeButton("Safe Mode starten");
        safe.setOnClickListener(v -> startGame(true));

        root.addView(title, new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
        root.addView(version, new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));

        if (runtimeError != null && !runtimeError.isEmpty()) {
            TextView error = makeText("Letzter WebView-Fehler:\n" + runtimeError, 13);
            error.setTextColor(Color.rgb(255, 170, 150));
            root.addView(error, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
        }

        String nativeCrash = getSharedPreferences("rft_diag", MODE_PRIVATE)
            .getString("last_native_crash", "");
        if (nativeCrash != null && !nativeCrash.isEmpty()) {
            String compact = nativeCrash.length() > 1800 ? nativeCrash.substring(0, 1800) : nativeCrash;
            TextView nativeError = makeText("Letzter nativer Fehler:\n" + compact, 11);
            nativeError.setTextColor(Color.rgb(255, 190, 150));
            root.addView(nativeError, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
            getSharedPreferences("rft_diag", MODE_PRIVATE).edit().remove("last_native_crash").apply();
        }

        LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        bp.setMargins(30, 10, 30, 10);
        root.addView(normal, bp);
        root.addView(safe, bp);

        TextView help = makeText(
            "Wenn der normale Start wieder abbricht, Safe Mode verwenden. " +
            "Bei einem Renderer-Absturz kehrt die App auf diese Seite zurück, statt neu zu laden.",
            12
        );
        root.addView(help, new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));

        setContentView(root);
    }

    private void startGame(boolean safeMode) {
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        hideSystemUi();

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(11, 11, 12));

        if (safeMode) {
            webView.setLayerType(View.LAYER_TYPE_SOFTWARE, null);
        }

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setSupportZoom(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setUserAgentString(s.getUserAgentString() + " RFT-Android/0.3");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                final String msg =
                    "Renderer beendet. didCrash=" + detail.didCrash() +
                    ", priority=" + detail.rendererPriorityAtExit() +
                    ", mode=" + (safeMode ? "SAFE" : "NORMAL");
                runOnUiThread(() -> showLauncher(msg));
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new AndroidGameBridge(), "AndroidGame");

        setContentView(webView);
        webView.loadUrl("file:///android_asset/www/index.html?android=1");
    }

    private void hideSystemUi() {
        if (android.os.Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN |
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            );
        }
    }

    private void js(String code) {
        if (webView != null) {
            try { webView.evaluateJavascript(code, null); } catch (Throwable ignored) {}
        }
    }

    @Override
    protected void onPause() {
        js("window.__RFT_ANDROID&&window.__RFT_ANDROID.pause()");
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            hideSystemUi();
            webView.onResume();
            js("window.__RFT_ANDROID&&window.__RFT_ANDROID.resume()");
        }
    }

    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        webView.evaluateJavascript(
            "(window.__RFT_ANDROID&&window.__RFT_ANDROID.back())===true",
            value -> {
                if (!"true".equals(value)) {
                    runOnUiThread(() -> showLauncher(null));
                }
            }
        );
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            try { webView.destroy(); } catch (Throwable ignored) {}
            webView = null;
        }
        super.onDestroy();
    }

    public class AndroidGameBridge {
        @JavascriptInterface
        public void haptic(int milliseconds) {
            try {
                Vibrator vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
                if (vibrator == null) return;
                int ms = Math.max(1, Math.min(milliseconds, 60));
                if (android.os.Build.VERSION.SDK_INT >= 26) {
                    vibrator.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    vibrator.vibrate(ms);
                }
            } catch (Throwable ignored) {}
        }

        @JavascriptInterface
        public String version() {
            return "0.3";
        }
    }
}
