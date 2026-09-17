from pathlib import Path
import json, base64, shutil

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
html = html.replace('Android Port 0.1', 'Android Port 0.3')
html = html.replace('Android-Port 0.1', 'Android-Port 0.3')
html = html.replace('Android-Testfassung 0.1', 'Android-Testfassung 0.3')
html = html.replace("version:'0.1'", "version:'0.3'")

old_resize = "function resize(){DPR=Math.min(devicePixelRatio||1,2);canvas.width=Math.floor(innerWidth*DPR);canvas.height=Math.floor(innerHeight*DPR);ctx.setTransform(DPR,0,0,DPR,0,0)}"
new_resize = "function resize(){DPR=/RFT-Android/i.test(navigator.userAgent)?1:Math.min(devicePixelRatio||1,2);canvas.width=Math.floor(innerWidth*DPR);canvas.height=Math.floor(innerHeight*DPR);ctx.setTransform(DPR,0,0,DPR,0,0)}"
if old_resize in html:
    html = html.replace(old_resize, new_resize)

index.write_text(html, encoding='utf-8')
if index.stat().st_size > 5_000_000:
    raise SystemExit(f'Optimized HTML still too large: {index.stat().st_size}')

src_java = Path('tools/MainActivity_03.java')
dst_java = root / 'app/src/main/java/at/martinjpeer/rollfortrouble/MainActivity.java'
shutil.copyfile(src_java, dst_java)

manifest_path = root / 'app/src/main/AndroidManifest.xml'
manifest = manifest_path.read_text(encoding='utf-8')
manifest = manifest.replace('\n            android:screenOrientation="landscape"', '')
manifest_path.write_text(manifest, encoding='utf-8')

gradle_path = root / 'app/build.gradle'
gradle = gradle_path.read_text(encoding='utf-8')
gradle = gradle.replace('versionCode 1', 'versionCode 3')
gradle = gradle.replace('versionName "0.1"', 'versionName "0.3"')
gradle_path.write_text(gradle, encoding='utf-8')

print(f'Externalized {count} assets, {total/1024/1024:.1f} MiB')
print(f'Android 0.3 HTML: {index.stat().st_size/1024/1024:.2f} MiB')
