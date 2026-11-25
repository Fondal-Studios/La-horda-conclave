#!/usr/bin/env python3
"""tools/art-judge.py — JUEZ DE ARTE de las cartas.

Mide el arte que YA está implementado en cada carta (guardianes y monstruos) y el que se vaya a producir, y avisa de lo que desentona:
  · resolución real del sprite (tamaño nativo) y si está reescalado con suavizado (borroso) o con píxeles exactos
  · escala del sujeto dentro del marco (¿se ve diminuto o recortado?)
  · variantes teñidas de otro sprite (arte reutilizado con filtro)
  · coherencia de paleta con el canon de los guardianes
  · restos de la ficha del Códice en las ilustraciones (texto/bordes)
  · BRECHA DE ESTILO guardián ↔ monstruo: un guardián pintado contra un monstruo en pixel art "no pega"; se mide y se lista

Uso:
  python3 tools/art-judge.py                      # informe en docs/ART_JUDGE_REPORT.md y tools/art-judge-report.json
  python3 tools/art-judge.py --gate               # falla (exit 1) si algún guardián es D, o hay monstruos borrosos / brecha de estilo > umbral
  python3 tools/art-judge.py --image ruta.png --kind ilustracion|monstruo|guardian   # juzga UNA imagen candidata (p. ej. generada con Runway)

El juez automático NO reemplaza la mirada humana: ordena y descarta lo evidente; la aprobación final de arte sigue siendo de una persona.
"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
GATE = "--gate" in sys.argv

def load_rgba(path):
    return np.array(Image.open(path).convert("RGBA"))

def laplacian_var(gray):
    g = gray.astype(np.float32)
    lap = -4 * g[1:-1, 1:-1] + g[:-2, 1:-1] + g[2:, 1:-1] + g[1:-1, :-2] + g[1:-1, 2:]
    return float(lap.var())

def rgb_to_hsv_stats(rgb):
    x = rgb.astype(np.float32) / 255.0
    mx, mn = x.max(2), x.min(2)
    v = mx
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    return float(s.mean()), float(v.mean())

def block_size(crop):
    """Mayor k (2..8) tal que la imagen es un re-escalado EXACTO por vecino más cercano; 1 si no lo es (suavizada o nativa)."""
    h, w = crop.shape[:2]
    best = 1
    for k in range(8, 1, -1):
        hh, ww = (h // k) * k, (w // k) * k
        if hh < k * 4 or ww < k * 4:
            continue
        sm = crop[:hh:k, :ww:k]
        up = np.repeat(np.repeat(sm, k, 0), k, 1)
        d = np.abs(up.astype(np.int16) - crop[:hh, :ww].astype(np.int16)).mean()
        if d < 2.5:
            best = k
            break
    return best

def analyze_monster(path, art_fx=""):
    a = load_rgba(path)
    alpha = a[:, :, 3] > 20
    if not alpha.any():
        return {"error": "sin píxeles opacos"}
    ys, xs = np.where(alpha)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    crop = a[y0:y1, x0:x1]
    bw, bh = x1 - x0, y1 - y0
    k = block_size(crop)
    sub = crop[:, :, :3][crop[:, :, 3] > 20]
    q = (sub >> 3).astype(np.uint32)
    colors = len(np.unique(q[:, 0] * 1024 + q[:, 1] * 32 + q[:, 2]))
    s, v = rgb_to_hsv_stats(sub.reshape(-1, 1, 3))
    gray = (0.299 * crop[:, :, 0] + 0.587 * crop[:, :, 1] + 0.114 * crop[:, :, 2])
    sharp = laplacian_var(gray)
    return {"kind": "monstruo", "canvas": [a.shape[1], a.shape[0]], "bbox": [int(bw), int(bh)], "k": int(k),
            "native_w": round(bw / k, 1) if k > 1 else None, "native_h": round(bh / k, 1) if k > 1 else None,
            "fill": round(bh / a.shape[0], 2), "aspect": round(bw / max(bh, 1), 2), "colors": int(colors), "sat": round(s, 3), "val": round(v, 3),
            "sharp": round(sharp, 1), "pixelated": k > 1, "smooth_upscale": (k == 1 and bw > 130), "tinted": bool(art_fx), "pix": 1.0 if k > 1 else 0.0}

def analyze_guardian(path):
    a = load_rgba(path)
    rgb = a[:, :, :3]
    h, w = rgb.shape[:2]
    s, v = rgb_to_hsv_stats(rgb)
    gray = (0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2])
    # restos de la ficha del Códice: la línea divisoria vertical queda a veces en el borde derecho del recorte
    g16 = gray.astype(np.int16); vline = 0.0
    for x in range(int(w * 0.90), w - 2):
        vline = max(vline, float((np.abs(g16[:, x] - g16[:, x - 3]) > 22).mean()))
    q = (rgb[::2, ::2] >> 4).astype(np.uint32)
    colors = len(np.unique(q[:, :, 0] * 256 + q[:, :, 1] * 16 + q[:, :, 2]))
    # la nitidez se mide a la escala del canon (guardianes 300x340): la varianza del laplaciano baja sola al subir la resolucion
    if w > 320:
        gray = np.array(Image.fromarray(gray.astype(np.uint8)).resize((300, round(300 * h / w)), Image.LANCZOS), dtype=np.float32)
    return {"kind": "guardian", "canvas": [w, h], "colors": int(colors), "sat": round(s, 3), "val": round(v, 3), "sharp": round(laplacian_var(gray), 1),
            "vline": round(vline, 2), "pix": 0.0, "has_bg": 1.0}

def grade_monster(m, card, gcent):
    score, why = 100, []
    if "error" in m:
        return 0, ["sin píxeles"]
    if m["smooth_upscale"]:
        score -= 30; why.append("reescalado con suavizado (borroso)")
    if m["pixelated"] and m["native_w"] and m["native_w"] < 40:
        score -= 20; why.append("sprite nativo diminuto (%d px de ancho) ampliado x%d" % (m["native_w"], m["k"]))
    elif m["pixelated"] and m["k"] >= 5:
        score -= 10; why.append("ampliado x%d (pixeles muy grandes frente a los guardianes)" % m["k"])
    if m["fill"] < 0.45:
        score -= 15; why.append("el sujeto ocupa solo %d%% del alto de la carta" % int(m["fill"] * 100))
    if m["aspect"] > 2.2:
        score -= 10; why.append("muy apaisado (%.1f:1) para un marco vertical" % m["aspect"])
    if m["tinted"]:
        score -= 10; why.append("variante teñida de otro sprite (arte reutilizado)")
    dv = abs(m["val"] - gcent["val"]) + abs(m["sat"] - gcent["sat"])
    if dv > 0.45:
        score -= 10; why.append("paleta lejos del canon de los guardianes (brillo/saturación)")
    if card.get("token"):
        why.append("(invocación)")
    return max(score, 0), why

def grade_guardian(g):
    score, why = 100, []
    # (la "línea de la ficha" se descartó como criterio: detectaba bastones y armas verticales, es decir, falsos positivos)
    if g["canvas"][0] < 300:
        score -= 10; why.append("resolución baja")
    return max(score, 0), why

def analyze_illustration(path):
    """Ilustración candidata con escenario (el formato canon: como la de los guardianes)."""
    img = Image.open(path)
    a = np.array(img.convert("RGBA"))
    rgb = a[:, :, :3]
    h, w = rgb.shape[:2]
    opaque = float((a[:, :, 3] > 250).mean())
    border = np.concatenate([rgb[:12].reshape(-1, 3), rgb[-12:].reshape(-1, 3), rgb[:, :12].reshape(-1, 3), rgb[:, -12:].reshape(-1, 3)])
    has_bg = bool(border.std(axis=0).mean() > 8)
    k = block_size(a)
    base = analyze_guardian(path)
    base.update({"kind": "ilustracion", "aspect": round(w / h, 2), "opaque": round(opaque, 3), "has_bg": has_bg, "k": int(k), "pixelated": k > 1})
    return base

def grade_illustration(f, gcent):
    score, why = 100, []
    w, h = f["canvas"]
    if w < 300 or h < 340:
        score -= 25; why.append("resolución baja (%dx%d; mínimo 300x340, ideal 600x680)" % (w, h))
    if not (0.80 <= f["aspect"] <= 0.95):
        score -= 15; why.append("proporción %.2f (la carta usa ~0.88, como los guardianes)" % f["aspect"])
    if f["opaque"] < 0.98:
        score -= 25; why.append("tiene transparencia: el canon es una ilustración con escenario de fondo")
    if not f["has_bg"]:
        score -= 20; why.append("sin escenario: falta el fondo de ruinas/paisaje del canon")
    if f["pixelated"]:
        score -= 30; why.append("se ve como pixel art ampliado (el canon es pintado)")
    if abs(f["val"] - gcent["val"]) + abs(f["sat"] - gcent["sat"]) > 0.35:
        score -= 15; why.append("paleta lejos del canon (brillo/saturación)")
    if f["sharp"] < 0.35 * gcent["sharp"]:
        score -= 15; why.append("borrosa frente a las ilustraciones de los guardianes")
    if f["colors"] < 0.5 * gcent["colors"]:
        score -= 10; why.append("paleta pobre (pocos colores)")
    return max(score, 0), why

def letter(s):
    return "A" if s >= 90 else "B" if s >= 75 else "C" if s >= 60 else "D"

def style_vec(f):
    return np.array([f["pix"], np.log1p(f["colors"]) / 8.0, f["sat"], f["val"], min(f.get("sharp", 0) / 4000.0, 1.0), f.get("has_bg", 0.0)], dtype=np.float32)

def main():
    if "--image" in sys.argv:
        p = sys.argv[sys.argv.index("--image") + 1]
        kind = sys.argv[sys.argv.index("--kind") + 1] if "--kind" in sys.argv else "monstruo"
        gs = [json.load(open(os.path.join(ROOT, "tools/art-judge-report.json")))] if os.path.exists(os.path.join(ROOT, "tools/art-judge-report.json")) else []
        gcent = gs[0]["guardian_centroid"] if gs else {"sat": 0.35, "val": 0.4, "colors": 700, "sharp": 600}
        if kind == "ilustracion":
            f = analyze_illustration(p); sc, why = grade_illustration(f, gcent)
        elif kind == "guardian":
            f = analyze_guardian(p); sc, why = grade_guardian(f)
        else:
            f = analyze_monster(p); sc, why = grade_monster(f, {}, gcent)
        print(json.dumps({"archivo": p, "nota": letter(sc), "puntaje": sc, "motivos": why, "medidas": f}, ensure_ascii=False, indent=1))
        return
    cards = json.loads(subprocess.check_output(["node", os.path.join(ROOT, "tools/dump-cards.js")]))
    gfeat, rows = {}, []
    for c in cards:
        if c["kind"] != "guardian":
            continue
        gfeat[c["id"]] = analyze_guardian(os.path.join(ROOT, c["art"]))
    gcent = {k: float(np.mean([f[k] for f in gfeat.values()])) for k in ("sat", "val", "colors", "sharp")}
    gvec = np.mean([style_vec(f) for f in gfeat.values()], axis=0)
    for c in cards:
        path = os.path.join(ROOT, c["art"])
        if c["kind"] == "guardian":
            f = gfeat[c["id"]]; sc, why = grade_guardian(f); gap = 0.0
        else:
            f = analyze_monster(path, c["artFx"]); sc, why = grade_monster(f, c, gcent)
            gap = float(np.linalg.norm(style_vec({**f, "has_bg": 0.0}) - gvec)) if "error" not in f else 9.9
        rows.append({"id": c["id"], "name": c["name"], "kind": c["kind"], "token": c["token"], "boss": c["boss"], "art": c["art"], "score": sc, "grade": letter(sc), "why": why, "gap": round(gap, 2), "metrics": f})
    mon = [r for r in rows if r["kind"] != "guardian"]
    gua = [r for r in rows if r["kind"] == "guardian"]
    gaps = sorted(mon, key=lambda r: -r["gap"])
    GAP_LIM = 1.5
    res = {"guardian_centroid": gcent, "guardians": len(gua), "monsters": len(mon),
           "grades_guardians": {g: sum(1 for r in gua if r["grade"] == g) for g in "ABCD"}, "grades_monsters": {g: sum(1 for r in mon if r["grade"] == g) for g in "ABCD"},
           "pixelated_monsters": sum(1 for r in mon if r["metrics"].get("pixelated")), "smooth_monsters": sum(1 for r in mon if r["metrics"].get("smooth_upscale")),
           "tinted_monsters": sum(1 for r in mon if r["metrics"].get("tinted")), "mean_gap": round(float(np.mean([r["gap"] for r in mon])), 2), "gap_limit": GAP_LIM,
           "over_gap": [r["id"] for r in mon if r["gap"] > GAP_LIM], "rows": rows}
    json.dump(res, open(os.path.join(ROOT, "tools/art-judge-report.json"), "w"), ensure_ascii=False, indent=1, default=lambda o: o.item() if hasattr(o, "item") else str(o))
    md = ["# Informe del juez de arte", "", "Generado por `python3 tools/art-judge.py`. Mide el arte implementado en las cartas; **no reemplaza la aprobación humana**.", "",
          "| | A | B | C | D |", "|---|---|---|---|---|",
          "| Guardianes (%d) | %s |" % (len(gua), " | ".join(str(res["grades_guardians"][g]) for g in "ABCD")),
          "| Monstruos (%d) | %s |" % (len(mon), " | ".join(str(res["grades_monsters"][g]) for g in "ABCD")), "",
          "- Monstruos en píxeles exactos: **%d** · con suavizado/borrosos: **%d** · variantes teñidas: **%d**" % (res["pixelated_monsters"], res["smooth_monsters"], res["tinted_monsters"]),
          "- **Brecha de estilo guardián ↔ monstruo** (0 = idéntico): promedio **%.2f**, límite recomendado %.1f; %d de %d monstruos la superan." % (res["mean_gap"], GAP_LIM, len(res["over_gap"]), len(mon)), "",
          "## Monstruos con peor nota", "", "| Carta | Nota | Motivos | Brecha |", "|---|---|---|---|"]
    for r in sorted(mon, key=lambda r: r["score"])[:25]:
        md.append("| %s (`%s`) | %s %d | %s | %.2f |" % (r["name"], r["id"], r["grade"], r["score"], "; ".join(r["why"]) or "—", r["gap"]))
    md += ["", "## Guardianes con observaciones", "", "| Carta | Nota | Motivos |", "|---|---|---|"]
    for r in sorted(gua, key=lambda r: r["score"]):
        if r["why"]:
            md.append("| %s | %s %d | %s |" % (r["name"], r["grade"], r["score"], "; ".join(r["why"])))
    md += ["", "## Los 12 monstruos más alejados del estilo de los guardianes", "", "| Carta | Brecha | Notas |", "|---|---|---|"]
    for r in gaps[:12]:
        md.append("| %s | %.2f | %s |" % (r["name"], r["gap"], "; ".join(r["why"]) or "—"))
    open(os.path.join(ROOT, "docs/ART_JUDGE_REPORT.md"), "w", encoding="utf8").write("\n".join(md) + "\n")
    print("guardianes", res["grades_guardians"], "· monstruos", res["grades_monsters"], "· borrosos", res["smooth_monsters"], "· teñidos", res["tinted_monsters"], "· brecha media", res["mean_gap"])
    if GATE:
        bad = []
        if res["grades_guardians"]["D"]: bad.append("hay guardianes con nota D")
        if res["smooth_monsters"]: bad.append("%d monstruos con suavizado" % res["smooth_monsters"])
        if res["over_gap"]: bad.append("%d monstruos superan la brecha de estilo" % len(res["over_gap"]))
        if bad:
            print("GATE DE ARTE FALLA:", "; ".join(bad)); sys.exit(1)
        print("GATE DE ARTE OK")

main()
