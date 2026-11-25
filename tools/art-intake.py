#!/usr/bin/env python3
"""tools/art-intake.py — ENTRADA DE ARTE NUEVO (lo usa quien dibuja: una persona, Anakin, Runway, etc.).

Flujo:
  1. Dejar la ilustración en  assets/art-incoming/<id-de-la-carta>.png  (o .webp/.jpg).  Ids en docs/ART_BRIEF.md.
  2. python3 tools/art-intake.py --judge            → el juez califica todo lo que hay en art-incoming/ (docs/ART_INTAKE.md)
  3. Revisión humana de lo que sacó A o B (ver las imágenes). Solo una persona aprueba.
  4. python3 tools/art-intake.py --approve id1,id2   → normaliza a 600x680 WebP en assets/ilus/, guarda el original en assets/art-archive/
                                                        y registra la carta en art-overrides.js (la carta pasa a usar el arte nuevo)
  5. Correr las pruebas (node tools/gate.js 20 · python3 tools/art-judge.py) y commitear.
Otros:  --list (pendientes)  ·  --revert id (vuelve al sprite original)  ·  --force (aprobar aunque la nota sea C)
"""
import json, os, re, shutil, subprocess, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
INC = os.path.join(ROOT, "assets/art-incoming")
ILUS = os.path.join(ROOT, "assets/ilus")
ARCH = os.path.join(ROOT, "assets/art-archive")
OVR = os.path.join(ROOT, "art-overrides.js")
EXT = (".png", ".webp", ".jpg", ".jpeg")

def cards():
    return {c["id"]: c for c in json.loads(subprocess.check_output(["node", os.path.join(ROOT, "tools/dump-cards.js")]))}

def read_ovr():
    t = open(OVR, encoding="utf8").read()
    m = re.search(r"root\.HORDA_ART = (\{.*?\});", t, re.S)
    return json.loads(m.group(1)) if m else {}

def write_ovr(d):
    open(OVR, "w", encoding="utf8").write('"use strict";\n/* GENERADO por tools/art-intake.py al aprobar arte nuevo. No editar a mano.\n   id de carta -> { art: ruta, illus: true }  (illus = ilustración con escenario, se muestra como la de los guardianes) */\n(function (root) { root.HORDA_ART = ' + json.dumps(d, ensure_ascii=False, indent=1) + '; if (typeof module !== "undefined") module.exports = root.HORDA_ART; })(typeof window !== "undefined" ? window : globalThis);\n')

def incoming():
    return sorted(f for f in os.listdir(INC) if f.lower().endswith(EXT))

def judge(path):
    out = subprocess.run([sys.executable, os.path.join(ROOT, "tools/art-judge.py"), "--image", path, "--kind", "ilustracion"], capture_output=True, text=True)
    return json.loads(out.stdout)

def normalize(src, dst):
    im = Image.open(src).convert("RGB"); w, h = im.size; tw, th = 600, 680
    s = max(tw / w, th / h); im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    l, t = (im.width - tw) // 2, (im.height - th) // 2
    im.crop((l, t, l + tw, t + th)).save(dst, quality=88)

def main():
    a = sys.argv[1:]
    cs = cards()
    if "--list" in a:
        ov = read_ovr()
        rep = json.load(open(os.path.join(ROOT, "tools/art-judge-report.json")))
        rows = [r for r in rep["rows"] if r["kind"] != "guardian" and r["id"] not in ov]
        rows.sort(key=lambda r: r["score"])
        print("pendientes de ilustración canon (peor nota primero):", len(rows))
        for r in rows[:80]:
            print("  %-20s %s %3d  %s" % (r["id"], r["grade"], r["score"], "; ".join(r["why"])[:80]))
        print("aprobadas:", len(ov))
        return
    if "--judge" in a:
        res = []
        for f in incoming():
            cid = os.path.splitext(f)[0]
            if cid not in cs:
                res.append((f, None, ["el nombre no coincide con ningún id de carta (ver docs/ART_BRIEF.md)"])); continue
            j = judge(os.path.join(INC, f)); res.append((f, j["nota"], j["motivos"]))
        md = ["# Entrada de arte: resultado del juez", "", "El juez ordena; **la aprobación final es de una persona**.", "", "| Archivo | Nota | Motivos |", "|---|---|---|"]
        for f, n, m in res:
            md.append("| %s | %s | %s |" % (f, n or "—", "; ".join(m) or "sin observaciones"))
            print("%-32s %s  %s" % (f, n or "—", "; ".join(m)[:90]))
        open(os.path.join(ROOT, "docs/ART_INTAKE.md"), "w", encoding="utf8").write("\n".join(md) + "\n")
        if not res: print("no hay archivos en assets/art-incoming/")
        return
    if "--approve" in a:
        ids = a[a.index("--approve") + 1].split(","); ov = read_ovr()
        for cid in ids:
            src = next((os.path.join(INC, f) for f in incoming() if os.path.splitext(f)[0] == cid), None)
            if not src or cid not in cs: print("✖", cid, ": no hay archivo o id inválido"); continue
            j = judge(src)
            if j["nota"] in ("C", "D") and "--force" not in a: print("✖", cid, ": nota", j["nota"], "—", "; ".join(j["motivos"]), "(usar --force solo con aprobación humana explícita)"); continue
            os.makedirs(ARCH, exist_ok=True); dst = os.path.join(ILUS, cid + ".webp"); normalize(src, dst)
            shutil.move(src, os.path.join(ARCH, os.path.basename(src)))
            ov[cid] = {"art": "assets/ilus/" + cid + ".webp", "illus": True}
            print("✔", cid, "aprobada (nota %s)" % j["nota"])
        write_ovr(ov); return
    if "--revert" in a:
        cid = a[a.index("--revert") + 1]; ov = read_ovr()
        if ov.pop(cid, None): write_ovr(ov); print("revertida", cid)
        return
    print(__doc__)

main()
