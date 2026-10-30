"""Build index.html from template.html and assets.json.

Run from the repo root: python3 src/build.py
"""
import json
from pathlib import Path

SRC = Path(__file__).parent
ROOT = SRC.parent

HEAD = """<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}</style>
"""

template = (SRC / "template.html").read_text()
assets = json.loads((SRC / "assets.json").read_text())
images = {k: v for k, v in assets.items() if k not in ("logo", "qr")}
page = (template.replace("{{logo}}", assets["logo"])
                .replace("{{qr}}", assets["qr"])
                .replace("{{IMGS}}", json.dumps(images)))
# Template opens with <title>, metas and <style>; the rest is body content.
split = page.index('<div class="ribbon">')
(ROOT / "index.html").write_text(HEAD + page[:split] + "</head>\n<body>\n" + page[split:] + "\n</body>\n</html>\n")
print("Wrote index.html")
