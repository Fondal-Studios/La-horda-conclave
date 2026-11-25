"use strict";
var D = require("../data.js"), S = require("./repo-skills.json"), RP = require("./repo-passives.json"), fs = require("fs");
var out = ["# Habilidades de los guardianes: original vs. duelo", "",
  "Generado por `node tools/make-skills-doc.js`. Cada guardián tiene **Ataque básico propio** (gratis) + **Pasiva** + 3 habilidades + definitiva (nombres y textos del kit real de La Horda; 7 pasivas no existen en el ARPG y son propuestas, marcadas).",
  "El efecto del duelo está escrito a mano en `tools/moves-reviewed.js` (revisión de la v0.2). Costos en cristales ✦, `cd` = turnos entre usos. Las mecánicas que no existen en cartas",
  "(proyectiles que atraviesan, estelas, transformaciones, velocidad, probabilidad de crítico) se tradujeron a lo más parecido: daño de fila o de columna, congelar, veneno, invocar, cambiar de fila, escudo.", ""];
var ids = Object.keys(D.CARDS).filter(function (k) { return D.CARDS[k].kind === "guardian"; });
ids.forEach(function (id) {
  var c = D.CARDS[id]; out.push("## " + c.name + " — " + c.title + " (`" + id + "`, " + c.role + ", " + c.tier + ", costo " + c.cost + ", " + c.atk + "/" + c.hp + ")", "",
    "- **Ataque «" + c.moves[0].name + "»** (" + D.describeMove(c.moves[0]) + ")",
    "- **Pasiva «" + c.passive.name + "»**" + (c.passive.proposed ? " *(propuesta: el ARPG no tiene una escrita)*" : "") + ": " + D.describePassive(c.passive) + (c.passive.proposed ? "" : " — original: " + c.passive.flavor), "", "| # | Habilidad | Original | En el duelo |", "|---|---|---|---|");
  c.moves.slice(1).forEach(function (m, i) {
    var o = (S[id].skills[i].desc || "").replace(/\s+/g, " ").replace(/\|/g, "/").slice(0, 150);
    out.push("| " + (m.ult ? "★" : i + 1) + " | " + m.name + (m.ult ? "" : " (" + m.cost + "✦, cd " + D.CARDS[id].moves[i + 1].cd + ")") + " | " + o + " | " + D.describeMove(m).replace(/\|/g, "/") + " |");
  });
  out.push("");
});
fs.writeFileSync(__dirname + "/../docs/HABILIDADES.md", out.join("\n")); console.log("docs/HABILIDADES.md", ids.length, "guardianes");
