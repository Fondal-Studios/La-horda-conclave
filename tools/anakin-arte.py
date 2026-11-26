#!/usr/bin/env python3
"""tools/anakin-arte.py — le PIDE a Anakin (API de proyectos) las ilustraciones de cartas.

Cómo dibuja (img2img, para que el monstruo se reconozca):
  1. arma una "placa" con la composición canon de los guardianes (luna grande, torres en ruinas, suelo), teñida según el linaje;
  2. apoya encima el sprite actual de la carta, ampliado y suavizado, pisando el suelo;
  3. el modelo lo repinta como ilustración chibi pintada (denoising ~0.6): conserva silueta, colores y lugar.
  Las cartas de magia no tienen sprite: se pinta el efecto sobre la placa con más fuerza.

Uso:
  python tools/anakin-arte.py --ids imp,cm_perro [--n 3] [--fuerza 0.62] [--out carpeta]
  python tools/anakin-arte.py --grupo monstruos|magia|nuevas [--n 3]
  Deja <out>/<id>_<k>.png (528x600) y <out>/_hoja_<grupo>.png para elegir. La elegida se copia a assets/art-incoming/<id>.png
  y sigue el flujo de siempre: tools/art-intake.py --judge / --approve (la aprobación es de una persona).
Desde el 25/11 todo se PIDE a Anakin por su API de proyectos (neon-panel/docs/API_PROYECTOS.md, clave en ANAKIN_API_KEY):
Anakin toma el turno de la placa y aprende de cada dibujo. Nunca hablar directo con sd-server.
Monstruos: imagen a imagen con init= (boceto con su sprite) y fuerza_init; magia: desde texto. --ref <guardian> suma referencia de estilo.
  python tools/anakin-arte.py --opinar ../conclave-arte-candidatas/_elegidas.txt   (le cuenta a Anakin cuales se eligieron)
"""
import io, json, os, random, subprocess, sys, time, urllib.error, urllib.parse, urllib.request, zlib
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
W, H = 512, 768   # formato 'vertical' de la API de Anakin
ESCENA = {
    "ciudad": "streets and walls of a cursed medieval city, old lanterns, dark brick",
    "forja": "mine tunnels with glowing blue crystals, mine carts and lanterns",
    "bosque": "mossy celtic ruins, green fog and ancient trees",
    "laberinto": "sandstone labyrinth walls with carved symbols, broken mirrors, golden light",
    "marea": "frozen coast and glacier, snow, bluish ice and dark water",
    "infernal": "embers, lava cracks and a red sky, old crypts",
    "fungico": "giant glowing mushrooms, purple spores and roots, fungal kingdom ruins",
}
# (cielo arriba, cielo abajo, luna, suelo) por linaje
TINTE = {
    "ciudad": ((38, 28, 24), (120, 78, 48), (205, 140, 80), (70, 52, 38)),
    "forja": ((24, 26, 32), (96, 74, 52), (200, 150, 90), (62, 50, 42)),
    "bosque": ((26, 34, 26), (98, 92, 58), (200, 160, 96), (60, 56, 36)),
    "laberinto": ((50, 36, 22), (160, 112, 56), (232, 176, 96), (110, 82, 50)),
    "marea": ((30, 36, 46), (112, 104, 100), (214, 190, 160), (150, 160, 170)),
    "infernal": ((36, 14, 12), (140, 48, 28), (220, 110, 60), (60, 30, 24)),
    "fungico": ((30, 22, 36), (104, 70, 84), (210, 150, 120), (64, 48, 52)),
}
POS = ("(chibi:1.2) painted fantasy illustration of (({d})), full body, three-quarter view, centered, standing on dirt and stones, "
       "{e}, tall ruined towers silhouetted against a huge dusky moon, torn banners, dust, warm brown and ochre palette, "
       "soft digital painting, expressive eyes, clean readable silhouette, dark fantasy game card art, masterpiece, best quality")
POS_MAGIA = ("close-up of {d}, the magic effect fills the frame, glowing, dramatic, painted fantasy card illustration, "
             "dark fantasy game card art, soft digital painting, warm ochre and dusk tones, simple blurred background of {e}, "
             "masterpiece, best quality")
NEG = ("text, letters, words, watermark, signature, logo, frame, border, card frame, ui, pixel art, pixelated, 3d render, photo, "
       "photorealistic, blurry, lowres, jpeg artifacts, multiple characters, duplicate, cropped, deformed, extra limbs, bad anatomy, nsfw, nude")


def cartas():
    js = "var D=require('./data.js');var o={};Object.keys(D.CARDS).forEach(function(i){var c=D.CARDS[i];o[i]={name:c.name,type:c.type,art:c.art||null,boss:!!c.boss,origin:c.origin||null}});process.stdout.write(JSON.stringify(o))"
    return json.loads(subprocess.check_output(["node", "-e", js], cwd=ROOT))


def placa(lin, seed):   # (se usaba como base del img2img directo; queda para cuando la API acepte imagen)
    top, bot, luna, suelo = TINTE.get(lin, TINTE["ciudad"]); rnd = random.Random(seed)
    im = Image.new("RGB", (W, H)); d = ImageDraw.Draw(im)
    for y in range(H):
        t = min(1, y / (H * 0.75)); d.line([(0, y), (W, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    cx, cy, r = W // 2 + rnd.randint(-40, 40), int(H * 0.36), int(W * 0.36)
    halo = Image.new("L", (W, H), 0); ImageDraw.Draw(halo).ellipse([cx - r * 1.3, cy - r * 1.3, cx + r * 1.3, cy + r * 1.3], fill=90)
    im = Image.composite(Image.new("RGB", (W, H), luna), im, halo.filter(ImageFilter.GaussianBlur(40))); d = ImageDraw.Draw(im)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=tuple(int(luna[i] * 0.8 + top[i] * 0.2) for i in range(3)))
    sil = tuple(max(0, int(c * 0.45)) for c in top)
    x = -10
    while x < W:   # torres en ruinas
        w = rnd.randint(22, 60); h = rnd.randint(int(H * 0.25), int(H * 0.62)); y0 = int(H * 0.78) - h
        d.rectangle([x, y0, x + w, H], fill=sil)
        for k in range(rnd.randint(1, 3)):
            x0 = x + rnd.randint(0, w - 8); d.rectangle([x0, y0 - rnd.randint(6, 26), x0 + rnd.randint(4, 8), y0], fill=sil)
        if rnd.random() < 0.4: d.polygon([(x + w // 2, y0 - 40), (x + w // 2 + 26, y0 - 30), (x + w // 2, y0 - 18)], fill=sil)
        x += w + rnd.randint(10, 70)
    gy = int(H * 0.8)
    d.rectangle([0, gy, W, H], fill=suelo)
    for k in range(40):
        px, py = rnd.randint(0, W), rnd.randint(gy, H); s = rnd.randint(4, 16)
        d.ellipse([px - s, py - s // 2, px + s, py + s // 2], fill=tuple(max(0, c - 25) for c in suelo))
    return im.filter(ImageFilter.GaussianBlur(2))


def con_sprite(base, art, jefe):
    sp = Image.open(os.path.join(ROOT, art)).convert("RGBA"); b = sp.getbbox(); sp = sp.crop(b) if b else sp
    alto, ancho = H * (0.74 if jefe else 0.64), W * 0.86
    s = min(alto / sp.height, ancho / sp.width)
    sp = sp.resize((max(1, round(sp.width * s)), max(1, round(sp.height * s))), Image.NEAREST).filter(ImageFilter.GaussianBlur(1.6))
    out = base.copy(); out.paste(sp, ((W - sp.width) // 2, int(H * 0.9) - sp.height), sp)
    return out


API = os.environ.get("ANAKIN_API", "http://127.0.0.1:8778/core/v1")
PROYECTO = "La-Horda-Conclave"


def clave():
    k = os.environ.get("ANAKIN_API_KEY", "")
    if not k and os.name == "nt":   # variable de usuario creada despues de abrir esta terminal
        try:
            import winreg
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment") as r: k = winreg.QueryValueEx(r, "ANAKIN_API_KEY")[0]
        except OSError: pass
    if not k: sys.exit("falta la variable de entorno ANAKIN_API_KEY (ver neon-panel/docs/API_PROYECTOS.md)")
    return k


def api(ruta, **q):
    req = urllib.request.Request(API + "/" + ruta + "?" + urllib.parse.urlencode(q), headers={"X-Anakin-Key": clave()})
    for intento in range(60):   # si el nucleo se esta reiniciando, esperarlo (nunca levantarlo desde aca)
        try:
            with urllib.request.urlopen(req, timeout=120) as r: return json.load(r)
        except (urllib.error.URLError, TimeoutError) as e:   # el nucleo atiende de a uno: si esta ocupado, la respuesta tarda
            if isinstance(e, urllib.error.HTTPError) or intento == 59: raise
            print("  nucleo de Anakin sin respuesta, espero:", getattr(e, "reason", e), flush=True); time.sleep(30)


def dibujar_api(prompt, registro, cid, k, **extra):
    """Le PIDE el dibujo a Anakin (/core/v1/dibujar): Anakin toma turno de placa en la fila, lo registra en sus creaciones
    con el proyecto y aprende de la opinion que le devolvamos (--opinar). No arranca servidores ni toca la placa por su cuenta."""
    t0 = time.time()
    while time.time() - t0 < 3 * 3600:   # si el doctor juega, Anakin no dibuja: esperar sin pelear por la placa
        r = api("dibujar", prompt=prompt[:900], evitar=NEG, formato="vertical", proyecto=PROYECTO, **extra)
        if not r.get("ok"): raise RuntimeError(r.get("error") or r)
        registro["%s_%d" % (cid, k)] = r["id"]
        while True:
            time.sleep(8); e = api("dibujo", id=r["id"])
            if e.get("estado") == "listo": return Image.open(e["archivo"]).convert("RGB")
            if e.get("estado") == "error": break
        err = str(e.get("error"))
        if "de nuevo" not in err and "ocupad" not in err: raise RuntimeError(err)
        print("  Anakin ocupado:", err, flush=True); time.sleep(60)   # hoy no encola: avisa que esta ocupado y hay que volver a pedir
    raise TimeoutError("tres horas sin turno")


def hoja(out, ids, n, nombre):
    t = 176; cols = n; filas = len(ids)
    sh = Image.new("RGB", (cols * t + 150, filas * (t * H // W + 4)), (30, 30, 30)); d = ImageDraw.Draw(sh); th = t * H // W
    for i, cid in enumerate(ids):
        d.text((4, i * (th + 4) + 4), cid[:20], fill=(255, 220, 0))
        for k in range(n):
            p = os.path.join(out, "%s_%d.png" % (cid, k))
            if os.path.exists(p): sh.paste(Image.open(p).resize((t, th)), (150 + k * t, i * (th + 4)))
    sh.save(os.path.join(out, "_hoja_%s.png" % nombre))


def main():
    a = sys.argv[1:]; arg = lambda k, dflt=None: a[a.index(k) + 1] if k in a else dflt
    ped = json.load(open(os.path.join(ROOT, "tools/arte-pedidos.json"), encoding="utf8"))
    nuevas = os.path.join(ROOT, "tools/arte-nuevas.json")
    if os.path.exists(nuevas):
        for x in json.load(open(nuevas, encoding="utf8")):
            g = "monstruos" if x.get("tipo") == "monstruo" else "magia"
            lin = {"Ciudad Maldita": "ciudad", "Forja y Minas": "forja", "Bosque y Hongos": "bosque", "Laberinto": "laberinto", "Marea y Hielo": "marea", "Infernal y Criptas": "infernal"}.get(x.get("linaje"), x.get("linaje") or "fungico")
            ped.setdefault(g, {}).setdefault(x["id"], [lin if lin in ESCENA else "fungico", x["desc_en"]])
            ped.setdefault("nuevas", {})[x["id"]] = ped[g][x["id"]]
    cs = cartas(); n = int(arg("--n", 3)); out = arg("--out", os.path.join(ROOT, "..", "conclave-arte-candidatas")); os.makedirs(out, exist_ok=True)
    todos = {**ped["monstruos"], **ped["magia"]}
    if "--ids" in a: ids = arg("--ids").split(","); nombre = arg("--nombre", "ids")
    else: nombre = arg("--grupo", "monstruos"); ids = list(ped[nombre].keys())
    regp = os.path.join(out, "_api_ids.json"); registro = json.load(open(regp)) if os.path.exists(regp) else {}
    if "--opinar" in a:   # "--opinar elegidas.txt": las elegidas por una persona se aprueban y el resto se rechaza; Anakin aprende
        el = {tuple(l.split()[:2]) for l in open(arg("--opinar"), encoding="utf8") if l.strip()}
        for key, did in registro.items():
            cid, k = key.rsplit("_", 1); bien = (cid, k) in el
            if any(c == cid for c, _ in el) or bien:
                print(key, api("dibujo_opinion", id=did, ok="1" if bien else "0", motivo="elegida para la carta" if bien else "otra candidata fue elegida").get("msg"))
        return
    ref = arg("--ref")   # opcional (IP-Adapter). OJO: un guardian con cara como referencia le contagia la cara al monstruo (probado 25/11): no usar
    for cid in ids:
        lin, desc = todos[cid]; c = cs[cid]; es_unidad = c["type"] == "unit" and c["art"]
        for k in range(n):
            dst = os.path.join(out, "%s_%d.png" % (cid, k))
            if os.path.exists(dst) and "--rehacer" not in a: continue
            fz = float(arg("--fuerza", ([0.5, 0.58, 0.66][k % 3]) if es_unidad else 0))
            seed = zlib.crc32(("%s|%d|%.2f" % (cid, k, fz)).encode()) % 2 ** 31
            extra = {"semilla": seed}
            if es_unidad:   # imagen a imagen: placa canon (luna y ruinas) + sprite encima; Anakin lo repinta y el monstruo se reconoce
                bd = os.path.join(os.path.abspath(out), "_bocetos"); os.makedirs(bd, exist_ok=True)
                bp = os.path.join(bd, "%s_%d.png" % (cid, k)); con_sprite(placa(lin, seed), c["art"], c["boss"]).save(bp)
                extra.update(init=bp, fuerza_init="%.2f" % fz)
                if ref: extra.update(referencia=os.path.abspath(os.path.join(ROOT, ref)), fuerza_ref=arg("--fuerza-ref", "0.3"))
                pr = POS.format(d=desc, e=ESCENA[lin])
            else: pr = POS_MAGIA.format(d=desc, e=ESCENA[lin])
            t0 = time.time()
            try: dibujar_api(pr, registro, cid, k, **extra).save(dst)
            except Exception as e: print("x", cid, k, e, flush=True); continue
            finally: json.dump(registro, open(regp, "w"), indent=0)
            print("ok %s_%d %.0fs" % (cid, k, time.time() - t0), flush=True)
    hoja(out, ids, n, nombre); print("hoja:", os.path.join(out, "_hoja_%s.png" % nombre))


if __name__ == "__main__":
    main()
