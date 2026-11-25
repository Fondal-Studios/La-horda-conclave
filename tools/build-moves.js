"use strict";
/* tools/build-moves.js — convierte las 3 habilidades + definitiva REALES de cada guardián del ARPG (repo La Horda,
   extraídas a tools/repo-skills.json) en movimientos del duelo por turnos. Conserva el NOMBRE y una frase de la
   descripción original; el EFECTO sale de un arquetipo elegido según lo que la habilidad hace (cura, escudo, control,
   área, línea, invocación, desplazamiento...). Es una traducción automática: revisarla a mano es la mejora nº1.
   Uso: node tools/build-moves.js > movesets.js                                                              */
var S = require("./repo-skills.json");
var ROLE = { tanque:1, asesino:1, mago:1, soporte:1 };
var ROLES = require("./roles.json");   // id -> rol del boceto (data.js)

function cls(sk, role, isUlt) {
  var t = ((sk.name || "") + " " + (sk.desc || "")).toLowerCase(), mult = sk.mult || 0, r = sk.radius || 0;
  var f = {
    heal: /cura|sana|regenera|restaura|revierte|recupera/.test(t),
    shield: /escudo|armadura|reduce|reduc|inmune|guardia|absorbe|protege|amortigua|defensa|resiste|menos daño|recibe menos/.test(t),
    buff: /aument|bendi|velocidad|potencia|inspira|más daño|\+\d+% de daño/.test(t),
    ctrl: /ralentiza|frena|congela|aturde|inmoviliza|atrae|engancha|empuja|desorienta|enraíz|aparta/.test(t),
    summon: /torre|torreta|invoca|construye|coloca|levanta|farol|gólem|hongo|ancla|nodo|reflejo|cristaliza|nube|barrica|montículo|trampa|placa|surco|sello|santuario|fortific|ciudadela/.test(t),
    dash: /avanza|teletransp|traslada|paso |salto|aparece|atraviesa a un enemigo|se desplaza|carga|embestida|embiste/.test(t),
    area: r >= 90 || /área|circular|nova|onda|cono|alrededor|pulso|todos|lluvia|abanico|anillo|barrido|torbellino/.test(t),
    line: /línea|atraviesa|perno|rayo|flecha|haz|trazo|cadena de|salta entre|abre una/.test(t),
    dmg: mult >= 0.3 || /daña|golpe|corte|ataque|inflige|dispar|estalla|descarga/.test(t),
    ally: /aliado|equipo|aliados|compañero/.test(t)
  };
  return f;
}
function reachOf(sk, role) {
  var rg = sk.range;
  if (rg !== undefined && rg >= 200) return "ranged";
  if (rg !== undefined && rg > 0 && rg <= 130 && (role === "tanque" || role === "asesino")) return "melee";
  return (role === "tanque" || role === "asesino") ? "melee" : "ranged";
}
function cdTurns(ms, isUlt) { return isUlt ? 99 : Math.max(1, Math.ceil((ms || 6000) / 7000)); }
function crystals(c) { return !c ? 0 : c <= 27 ? 1 : c <= 38 ? 2 : 3; }
function heavy(sk) { var m = sk.mult || 0; return m >= 3 ? 1.2 : m >= 1.8 ? 1.1 : m > 0 && m < 0.6 ? 0.9 : 1; }
function first(d) { d = (d || "").replace(/\s+/g, " "); var i = d.search(/[.!?]\s/); return (i > 20 && i < 110 ? d.slice(0, i + 1) : d.slice(0, 100) + (d.length > 100 ? "…" : "")); }

function move(sk, role, isUlt) {
  var f = cls(sk, role, isUlt), rch = reachOf(sk, role), h = heavy(sk), cost = isUlt ? 0 : crystals(sk.cost), m = { name: sk.name, flavor: first(sk.desc), cost: cost, cd: cdTurns(sk.cd, isUlt), ult: !!isUlt };
  function R(x) { return Math.round(x * 100) / 100; }
  if (isUlt) {
    if (f.heal && !f.dmg || (role === "soporte" && f.heal))      { m.arch = "ult_apoyo";   m.tgt = "none"; m.ops = [{ op: "heal", n: 6, to: "allyAll" }, { op: "buff", atk: 1, hp: 1, to: "allyAll" }, { op: "draw", n: 1 }]; }
    else if (role === "tanque" || /ciudadela|fortific|armadura|escudo/.test((sk.name + sk.desc).toLowerCase()) && !f.dmg) { m.arch = "ult_fortaleza"; m.tgt = "none"; m.ops = [{ op: "buff", hp: 3, to: "allyAll" }, { op: "give", kw: "taunt", to: "self" }, { op: "give", kw: "shield", to: "self" }]; }
    else if (f.area || role === "mago")                          { m.arch = "ult_tormenta"; m.tgt = "none"; m.reach = rch; m.ops = [{ op: "dmg", mult: R(1.0 * h), to: "enemyAll" }, { op: "freeze", n: 1, to: "enemyAll" }]; }
    else                                                         { m.arch = "ult_ejecucion"; m.tgt = "enemy"; m.reach = rch; m.ops = [{ op: "dmg", mult: R(2.6 * h), to: "target" }]; }
    return m;
  }
  if (f.heal && !(f.dmg && (sk.mult || 0) >= 0.5)) { m.arch = "curar"; m.tgt = "ally"; m.ops = [{ op: "heal", n: 4, to: "target" }]; if (f.area || /todos|cercanos/.test(sk.desc || "")) { m.tgt = "none"; m.arch = "curar_todos"; m.ops = [{ op: "heal", n: 2, to: "allyAll" }]; } return m; }
  if (f.shield && !f.dmg) {
    if (role === "tanque") { m.arch = "guardia"; m.tgt = "self"; m.ops = [{ op: "buff", hp: 2, to: "self" }, { op: "give", kw: "taunt", to: "self" }]; }
    else if (f.ally || role === "soporte") { m.arch = "escudo"; m.tgt = "ally"; m.ops = [{ op: "give", kw: "shield", to: "target" }]; }
    else { m.arch = "resguardo"; m.tgt = "self"; m.ops = [{ op: "give", kw: "shield", to: "self" }, { op: "heal", n: 2, to: "self" }]; }
    return m;
  }
  if (f.buff && !f.dmg) { m.arch = "potenciar"; m.tgt = "ally"; m.ops = [{ op: "buff", atk: 2, hp: 0, temp: 1, to: "target" }]; return m; }
  if (f.summon && (sk.mult || 0) < 1.0 && !f.line) { m.arch = "invocar"; m.tgt = "none"; m.ops = [{ op: "summon", id: (role === "tanque" || role === "soporte") ? "token_muro" : "token_torreta", n: 1 }]; return m; }
  if (f.dash && !f.area) { m.arch = "embestida"; m.tgt = "enemy"; m.reach = rch; m.ops = [{ op: "dmg", mult: R(1.3 * h), to: "target" }, { op: "swapRow", to: "self" }]; return m; }
  if (f.ctrl && f.area) { m.arch = "control_fila"; m.tgt = "enemy"; m.reach = rch; m.ops = [{ op: "dmg", mult: R(0.7 * h), to: "targetRow" }, { op: "freeze", n: 1, to: "target" }]; return m; }
  if (f.ctrl) { m.arch = "control"; m.tgt = "enemy"; m.reach = rch; m.ops = [{ op: "dmg", mult: R(0.9 * h), to: "target" }, { op: "freeze", n: 1, to: "target" }]; return m; }
  if (f.area) { m.arch = "area_fila"; m.tgt = "enemy"; m.reach = rch; m.ops = [{ op: "dmg", mult: R(1.0 * h), to: "targetRow" }]; return m; }
  if (f.line) { m.arch = "linea"; m.tgt = "enemy"; m.reach = rch; m.ops = [{ op: "dmg", mult: R(1.15 * h), to: "targetCol" }]; return m; }
  m.arch = "golpe"; m.tgt = "enemy"; m.reach = rch; m.ops = [{ op: "dmg", mult: R(1.5 * h), to: "target" }]; return m;
}
var REV = require("./moves-reviewed.js"), out = {}, auto = 0;
Object.keys(ROLES).forEach(function (id) {
  var s = S[id]; if (!s) throw new Error("sin habilidades: " + id);
  var role = ROLES[id], sk = s.skills;
  out[id] = sk.slice(0, 4).map(function (x, i) {
    var r = REV[id] && REV[id][i];
    if (!r) { auto++; return move(x, role, i === 3); }             // sin revisión manual: traducción automática (arquetipo)
    var m = { name: x.name, flavor: first(x.desc), cost: r.cost, cd: r.cd, ult: i === 3, arch: "revisado", tgt: r.tgt, ops: r.ops };
    if (r.reach) m.reach = r.reach; return m;
  });
});
if (auto) process.stderr.write("movimientos sin revisar (automáticos): " + auto + "\n");
process.stdout.write('"use strict";\n/* GENERADO por tools/build-moves.js desde las habilidades reales del repo La Horda. No editar a mano: editar el generador o sobrescribir en data.js (MOVE_OVERRIDES). */\n(function(root){root.HORDA_MOVES=' + JSON.stringify(out) + ';if(typeof module!=="undefined")module.exports=root.HORDA_MOVES;})(typeof window!=="undefined"?window:globalThis);\n');
