from pathlib import Path
import json, base64

root = Path('/tmp/rft-project/Roll_for_Trouble_Android_0.1')
index = root / 'app/src/main/assets/www/index.html'
html = index.read_text(encoding='utf-8')

marker = 'window.__RFT_EMBED_ASSETS='
start = html.find(marker)
if start < 0:
    raise SystemExit('Embedded asset block not found')
end = html.find('</script>', start)
if end < 0:
    raise SystemExit('Embedded asset script end not found')

payload = html[start + len(marker):end]
if payload.endswith(';'):
    payload = payload[:-1]
assets = json.loads(payload)

count = 0
total = 0
for rel, data_url in assets.items():
    _, b64 = data_url.split(',', 1)
    raw = base64.b64decode(b64)
    out = root / 'app/src/main/assets/www' / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(raw)
    count += 1
    total += len(raw)

html = html[:start] + 'window.__RFT_EMBED_ASSETS={};' + html[end:]
html = html.replace('Android Port 0.1', 'Android Port 0.2')
html = html.replace('Android-Port 0.1', 'Android-Port 0.2')
html = html.replace('Android-Testfassung 0.1', 'Android-Testfassung 0.2')
html = html.replace("version:'0.1'", "version:'0.2'")
index.write_text(html, encoding='utf-8')

if index.stat().st_size > 5_000_000:
    raise SystemExit(f'Optimized HTML still too large: {index.stat().st_size}')

java_path = root / 'app/src/main/java/at/martinjpeer/rollfortrouble/MainActivity.java'
java = java_path.read_text(encoding='utf-8')
if 'import android.webkit.RenderProcessGoneDetail;' not in java:
    java = java.replace('import android.webkit.JavascriptInterface;', 'import android.webkit.JavascriptInterface;\nimport android.webkit.RenderProcessGoneDetail;')
if 'import android.widget.Toast;' not in java:
    java = java.replace('import android.webkit.WebViewClient;', 'import android.webkit.WebViewClient;\nimport android.widget.Toast;')
if 'setRendererPriorityPolicy' not in java:
    java = java.replace(
        'webView.setBackgroundColor(0xFF0B0B0C);',
        'webView.setBackgroundColor(0xFF0B0B0C);\n        if (android.os.Build.VERSION.SDK_INT >= 26) {\n            webView.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, true);\n        }'
    )
old_client = 'webView.setWebViewClient(new WebViewClient());'
new_client = '''webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                Toast.makeText(MainActivity.this,
                    "Roll for Trouble: WebView wurde neu gestartet.",
                    Toast.LENGTH_LONG).show();
                if (view != null) view.destroy();
                recreate();
                return true;
            }
        });'''
if old_client in java:
    java = java.replace(old_client, new_client)
java = java.replace('RFT-Android/0.1', 'RFT-Android/0.2')
java = java.replace('return "0.1";', 'return "0.2";')
java_path.write_text(java, encoding='utf-8')

gradle_path = root / 'app/build.gradle'
gradle = gradle_path.read_text(encoding='utf-8')
gradle = gradle.replace('versionCode 1', 'versionCode 2')
gradle = gradle.replace('versionName "0.1"', 'versionName "0.2"')
gradle_path.write_text(gradle, encoding='utf-8')

print(f'Externalized {count} assets, {total/1024/1024:.1f} MiB')
print(f'Optimized HTML: {index.stat().st_size/1024/1024:.2f} MiB')
