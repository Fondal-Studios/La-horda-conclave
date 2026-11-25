"use strict";
// Genera docs/ART_BRIEF.md: canon visual + lista de producción (qué ilustrar, en qué orden, con qué archivo).
var fs = require("fs"), path = require("path"), D = require("../data.js");
var rep = JSON.parse(fs.readFileSync(path.join(__dirname, "art-judge-report.json"), "utf8")), score = {}; rep.rows.forEach(function (r) { score[r.id] = r; });
var ov = require("../art-overrides.js");
var ESC = { ciudad: "calles y murallas de la Ciudad Maldita, faroles, ladrillo oscuro", forja: "túneles de minas con cristales, vagonetas y linternas", bosque: "ruinas célticas cubiertas de musgo, niebla verde y árboles antiguos", laberinto: "muros de arena y piedra con símbolos, espejos rotos, luz dorada", marea: "costa y glaciar: nieve, hielo azulado y agua oscura", infernal: "brasas, grietas de lava y cielo rojo; criptas" };
var rows = Object.keys(D.CARDS).filter(function (id) { var c = D.CARDS[id]; return c.type === "unit" && c.kind !== "guardian" && !ov[id]; }).map(function (id) { return D.CARDS[id]; });
rows.sort(function (a, b) { return (score[a.id] ? score[a.id].score : 100) - (score[b.id] ? score[b.id].score : 100) || a.id.localeCompare(b.id); });
var md = ["# Brief de arte: ilustraciones canon para los monstruos y jefes", "",
"> Para quien dibuja (una persona, Anakin u otra IA). El objetivo es que **cada monstruo se vea de la misma familia que los guardianes**. Ver `docs/ANALISIS_Y_MONETIZACION.md` §4 y `docs/ART_JUDGE_REPORT.md`.", "",
"## Canon visual (copiado de lo que ya tienen los 41 guardianes: mirar `assets/g/*.webp`, por ejemplo `mago`, `tanque`, `segador`)",
"- **Formato**: PNG o WebP **opaco**, idealmente **600×680** (mínimo 300×340), proporción ≈ 0,88 (retrato). Sin transparencia.",
"- **Estilo**: ilustración **pintada** estilo *chibi* (cuerpo de ~2,5 cabezas, ojos expresivos), trazo suave con textura de pintura digital. **No** pixel art, **no** 3D, **no** foto, **no** estilo vector plano.",
"- **Composición**: criatura de cuerpo completo en 3/4, centrada, ocupa 65–80 % del alto, pisando tierra y piedras. Fondo: **ruinas de torres a contraluz con una luna grande detrás** (marrón/ocre), banderas rotas y polvo; cambia el escenario según el linaje (tabla abajo) pero conserva la composición.",
"- **Paleta**: cálida (marrones, ocres, negros) con el color del personaje como acento. Medidas del juez para los guardianes: saturación media ≈ 0,43, brillo medio ≈ 0,34.",
"- **Sin** texto, firma, marco, logotipo ni marca de agua. **Sin** copiar personajes de otras franquicias.",
"- **Fidelidad**: conservar la silueta y el color característico del sprite actual (`assets/b/<id>.png`) para que el jugador lo reconozca. Los jefes: más grandes y amenazantes, mismo fondo.", "",
"## Escenario por linaje", "", "| Linaje | Escenario |", "|---|---|"];
Object.keys(ESC).forEach(function (k) { md.push("| " + D.LINAJES[k].name + " | " + ESC[k] + " |"); });
md.push("", "## Flujo (cada imagen)", "1. Generar/dibujar y guardar como `assets/art-incoming/<id>.png` (el id es la primera columna de la tabla).",
"2. `python3 tools/art-intake.py --judge` → el juez califica (A/B pasan, C/D se rehacen).", "3. **Una persona revisa** las A y B mirando la imagen.", "4. `python3 tools/art-intake.py --approve <id>[,<id>]` → entra a la carta (queda registrada en `art-overrides.js`; el original va a `assets/art-archive/`).", "5. `node tools/gate.js 20` y `python3 tools/art-judge.py` → commit.", "",
"Plantilla de instrucción (adaptar):", "```", "Painted chibi-style fantasy illustration of {NOMBRE}, {DESCRIPCIÓN}. Full body, three-quarter view, centered, standing on dirt and stones.", "Background: {ESCENARIO}, tall ruined towers silhouetted against a huge dusky moon, torn banners, dust. Warm brown/ochre palette with the creature's own color as accent.", "Soft digital-paint texture, clean readable silhouette, expressive eyes. No text, no signature, no frame, no pixel art, no 3D render.", "```", "",
"## Producción (peor arte primero) — " + rows.length + " pendientes", "", "| Prioridad | id | Nombre | Tipos | Linaje | Nota actual | Qué hace (para la descripción) |", "|---|---|---|---|---|---|---|");
rows.forEach(function (c, i) {
  var r = score[c.id] || { grade: "?", score: 0 }, ds = [];
  if (c.kw && Object.keys(c.kw).length) ds.push(Object.keys(c.kw).map(function (k) { return D.KW_NAME[k]; }).join(", "));
  if (c.ingreso) ds.push("Ingreso: " + D.describe(c.ingreso)); if (c.ultimo) ds.push("Al morir: " + D.describe(c.ultimo)); if (c.passive) ds.push("Pasiva " + c.passive.name);
  md.push("| " + (i + 1) + " | `" + c.id + "` | " + c.name + (c.boss ? " (JEFE)" : c.token ? " (invocación)" : "") + " | " + ((c.tags || []).join(", ") || "—") + " | " + (c.origin ? D.LINAJES[c.origin].name : "—") + " | " + r.grade + " " + r.score + " | " + (ds.join(" · ") || "ataque simple") + " |");
});
fs.writeFileSync(path.join(__dirname, "../docs/ART_BRIEF.md"), md.join("\n") + "\n"); console.log("docs/ART_BRIEF.md:", rows.length, "pendientes");
