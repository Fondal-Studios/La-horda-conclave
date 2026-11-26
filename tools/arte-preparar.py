"""Pasa las candidatas elegidas a assets/art-incoming/ listas para el juez.
Lee ../conclave-arte-candidatas/_elegidas.txt (lineas "id k [brillo]"; brillo < 1 oscurece y baja un poco la saturacion), recorta 4% de borde (firmas fantasma del modelo),
lleva a 600x680 y aplica una nitidez suave. Uso: python tools/arte-preparar.py [--cand DIR] [--nitidez 100]
No aprueba nada: despues va `python tools/art-intake.py --judge` y una persona decide con --approve."""
import os, sys
from PIL import Image, ImageFilter, ImageEnhance
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a = sys.argv[1:]; arg = lambda k, d: a[a.index(k) + 1] if k in a else d
src = arg("--cand", os.path.join(ROOT, "..", "conclave-arte-candidatas")); pct = int(arg("--nitidez", 100))
dst = os.path.join(ROOT, "assets", "art-incoming"); os.makedirs(dst, exist_ok=True); n = 0
for l in open(os.path.join(src, "_elegidas.txt"), encoding="utf8"):
    l = l.split()
    if len(l) < 2: continue
    i, k = l[0], l[1]; p = os.path.join(src, "%s_%s.png" % (i, k))
    if not os.path.exists(p): print("falta", p); continue
    im = Image.open(p).convert("RGB"); w, h = im.size; m = int(w * .04)
    im = im.crop((m, m, w - m, h - m)).resize((600, 680), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2, percent=pct, threshold=2))
    if len(l) > 2:
        f = float(l[2]); im = ImageEnhance.Color(ImageEnhance.Brightness(im).enhance(f)).enhance(min(1.0, 0.25 + 0.75 * f))
    im.save(os.path.join(dst, i + ".png")); n += 1
print("listas en art-incoming:", n)
