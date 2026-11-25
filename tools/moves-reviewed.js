"use strict";
/* tools/moves-reviewed.js — REVISIÓN MANUAL de los movimientos de cada guardián (3 habilidades + definitiva, en el orden del kit
   original de La Horda; los nombres y el texto original salen de tools/repo-skills.json).
   Cada entrada define el EFECTO en el duelo por turnos. Criterio: conservar la idea de la habilidad original
   (control, área, invocación, desplazamiento, curación…) con números simples y comparables.
   Formato: H.tipo(costo, enfriamiento, potencia, alcance "m"=cuerpo a cuerpo | "r"=distancia). Las definitivas no cuestan cristales. */
function dmg(m, to) { return { op: "dmg", mult: m, to: to }; }
var H = {
  hit:   function (c, cd, m, r) { return { tgt: "enemy", reach: r === "m" ? "melee" : "ranged", cost: c, cd: cd, ops: [dmg(m, "target")] }; },
  row:   function (c, cd, m, r) { return { tgt: "enemy", reach: r === "m" ? "melee" : "ranged", cost: c, cd: cd, ops: [dmg(m, "targetRow")] }; },
  col:   function (c, cd, m, r) { return { tgt: "enemy", reach: r === "m" ? "melee" : "ranged", cost: c, cd: cd, ops: [dmg(m, "targetCol")] }; },
  frz:   function (c, cd, m, r) { return { tgt: "enemy", reach: r === "m" ? "melee" : "ranged", cost: c, cd: cd, ops: [dmg(m, "target"), { op: "freeze", n: 1, to: "target" }] }; },
  frzrow:function (c, cd, m, r) { return { tgt: "enemy", reach: r === "m" ? "melee" : "ranged", cost: c, cd: cd, ops: [dmg(m, "targetRow"), { op: "freeze", n: 1, to: "target" }] }; },
  frzcol:function (c, cd, m, r) { return { tgt: "enemy", reach: r === "m" ? "melee" : "ranged", cost: c, cd: cd, ops: [dmg(m, "targetCol"), { op: "freeze", n: 1, to: "target" }] }; },
  psn:   function (c, cd, m, r, n, t) { return { tgt: "enemy", reach: r === "m" ? "melee" : "ranged", cost: c, cd: cd, ops: [dmg(m, "target"), { op: "poison", n: n, turns: t, to: "target" }] }; },
  rowpsn:function (c, cd, m, r, n, t) { return { tgt: "enemy", reach: r === "m" ? "melee" : "ranged", cost: c, cd: cd, ops: [dmg(m, "targetRow"), { op: "poison", n: n, turns: t, to: "target" }] }; },
  dash:  function (c, cd, m, r) { return { tgt: "enemy", reach: r === "m" ? "melee" : "ranged", cost: c, cd: cd, ops: [dmg(m, "target"), { op: "swapRow", to: "self" }] }; },
  leech: function (c, cd, m, r, h) { return { tgt: "enemy", reach: r === "m" ? "melee" : "ranged", cost: c, cd: cd, ops: [dmg(m, "target"), { op: "heal", n: h, to: "allyFace" }] }; },
  all:   function (c, cd, m) { return { tgt: "none", reach: "ranged", cost: c, cd: cd, ops: [dmg(m, "enemyAll")] }; },
  heal:  function (c, cd, n) { return { tgt: "ally", cost: c, cd: cd, ops: [{ op: "heal", n: n, to: "target" }] }; },
  healall: function (c, cd, n) { return { tgt: "none", cost: c, cd: cd, ops: [{ op: "heal", n: n, to: "allyAll" }] }; },
  shield: function (c, cd) { return { tgt: "ally", cost: c, cd: cd, ops: [{ op: "give", kw: "shield", to: "target" }] }; },
  shieldself: function (c, cd, h) { return { tgt: "none", cost: c, cd: cd, ops: [{ op: "give", kw: "shield", to: "self" }].concat(h ? [{ op: "heal", n: h, to: "self" }] : []) }; },
  shieldall: function (c, cd) { return { tgt: "none", cost: c, cd: cd, ops: [{ op: "give", kw: "shield", to: "allyAll" }] }; },
  taunt: function (c, cd) { return { tgt: "none", cost: c, cd: cd, ops: [{ op: "buff", hp: 2, to: "self" }, { op: "give", kw: "taunt", to: "self" }] }; },
  buffall: function (c, cd, a) { return { tgt: "none", cost: c, cd: cd, ops: [{ op: "buff", atk: a, temp: 1, to: "allyAll" }] }; },
  buffself: function (c, cd, a, perm) { return { tgt: "none", cost: c, cd: cd, ops: [perm ? { op: "buff", atk: a, to: "self" } : { op: "buff", atk: a, temp: 1, to: "self" }] }; },
  swap:  function (c, cd, a) { return { tgt: "none", cost: c, cd: cd, ops: [{ op: "swapRow", to: "self" }, { op: "buff", atk: a || 1, temp: 1, to: "self" }] }; },
  summon: function (c, cd, id, n) { return { tgt: "none", cost: c, cd: cd, ops: [{ op: "summon", id: id, n: n || 1 }] }; },
  custom: function (tgt, reach, c, cd, ops) { var o = { tgt: tgt, cost: c, cd: cd, ops: ops }; if (reach) o.reach = reach === "m" ? "melee" : "ranged"; return o; }
};
// definitivas
var U = {
  fort: function () { return { tgt: "none", cost: 0, cd: 99, ops: [{ op: "buff", hp: 3, to: "allyAll" }, { op: "give", kw: "taunt", to: "self" }, { op: "give", kw: "shield", to: "self" }] }; },
  apoyo: function (h) { return { tgt: "none", cost: 0, cd: 99, ops: [{ op: "heal", n: h || 6, to: "allyAll" }, { op: "buff", atk: 1, hp: 1, to: "allyAll" }, { op: "draw", n: 1 }] }; },
  storm: function (m, freeze) { var o = [dmg(m, "enemyAll")]; if (freeze) o.push({ op: "freeze", n: 1, to: "enemyAll" }); return { tgt: "none", reach: "ranged", cost: 0, cd: 99, ops: o }; },
  exec: function (m, r, extra) { return { tgt: "enemy", reach: r === "m" ? "melee" : "ranged", cost: 0, cd: 99, ops: [dmg(m, "target")].concat(extra || []) }; },
  raw: function (tgt, reach, ops) { var o = { tgt: tgt, cost: 0, cd: 99, ops: ops }; if (reach) o.reach = reach === "m" ? "melee" : "ranged"; return o; }
};
var ALL_ENEMY_FREEZE = { op: "freeze", n: 1, to: "enemyAll" };

module.exports = {
  // ---- originales ----
  tanque:   [H.row(2, 2, 0.9, "m"), H.dash(2, 1, 1.3, "m"), H.taunt(2, 2), U.fort()],
  guerrero: [H.psn(2, 1, 1.2, "m", 1, 3), H.hit(2, 2, 1.9, "m"), H.row(2, 2, 1.1, "r"), U.exec(2.4, "m", [{ op: "poison", n: 2, turns: 3, to: "target" }])],
  soporte:  [H.custom("none", "r", 2, 2, [{ op: "heal", n: 2, to: "allyAll" }, dmg(0.5, "enemyAll")]), H.buffall(2, 2, 1), H.shield(2, 2), U.apoyo(6)],
  mago:     [H.rowpsn(2, 2, 0.8, "r", 1, 2), H.frzrow(2, 2, 0.7, "r"), H.col(2, 1, 1.3, "r"), U.storm(1.0, true)],
  segador:  [H.row(2, 1, 1.2, "m"), H.custom("none", null, 1, 2, [{ op: "give", kw: "shield", to: "self" }, { op: "buff", atk: 1, to: "self" }]), H.custom("none", null, 1, 2, [{ op: "heal", n: 4, to: "self" }, { op: "buff", atk: 2, temp: 1, to: "self" }]), U.exec(2.2, "m", [{ op: "heal", n: 4, to: "allyFace" }])],
  axiom:    [H.frzrow(2, 2, 0.8, "r"), H.psn(1, 1, 0.8, "r", 1, 3), H.swap(1, 1, 1), U.storm(1.0, true)],
  profeta:  [H.heal(2, 2, 6), H.custom("ally", null, 2, 2, [{ op: "give", kw: "shield", to: "target" }, { op: "heal", n: 2, to: "target" }]), H.row(2, 2, 0.9, "r"), U.raw("ally", null, [{ op: "heal", n: 8, to: "target" }, { op: "buff", atk: 3, hp: 2, to: "target" }])],
  musashi:  [H.hit(1, 1, 2.0, "m"), H.dash(1, 2, 1.3, "m"), H.row(2, 2, 1.0, "m"), U.exec(3.0, "m")],
  cazadora: [H.col(2, 1, 1.4, "r"), H.frz(1, 2, 0.6, "r"), H.row(2, 2, 1.2, "r"), U.raw("enemy", "r", [dmg(2.0, "target"), { op: "summon", id: "token_lobo", n: 1 }])],
  nigromante: [H.custom("enemy", "r", 2, 1, [dmg(0.9, "targetRow"), { op: "heal", n: 2, to: "allyFace" }]), H.summon(2, 2, "token_golem"), H.custom("none", "r", 2, 2, [{ op: "poison", n: 1, turns: 3, to: "enemyAll" }]), U.raw("none", "r", [{ op: "buff", atk: 4, hp: 4, to: "self" }, dmg(0.8, "enemyAll")])],
  libertador: [H.psn(1, 1, 1.6, "m", 1, 2), H.custom("none", null, 2, 2, [{ op: "summon", id: "token_granadero", n: 1 }, { op: "buff", atk: 1, temp: 1, to: "allyAll" }]), H.col(2, 2, 1.5, "m"), U.raw("none", "r", [dmg(1.0, "enemyAll"), { op: "summon", id: "token_granadero", n: 2 }])],
  ilkan:    [H.dash(1, 1, 1.5, "m"), H.shieldself(1, 2, 1), H.buffall(2, 2, 1), U.raw("none", "r", [{ op: "buff", atk: 3, hp: 3, to: "self" }, dmg(0.9, "enemyAll")])],
  // ---- Portadores / Expedición ----
  renko:    [H.frzcol(1, 1, 0.9, "r"), H.custom("none", null, 1, 2, [{ op: "buff", hp: 1, to: "allyAll" }, { op: "heal", n: 1, to: "allyAll" }]), H.row(2, 2, 1.2, "r"), U.raw("none", "r", [dmg(0.8, "enemyAll"), ALL_ENEMY_FREEZE, { op: "give", kw: "shield", to: "allyAll" }])],
  ynara:    [H.frzrow(1, 1, 0.6, "r"), H.healall(2, 2, 2), H.custom("none", null, 1, 2, [{ op: "give", kw: "shield", to: "self" }, { op: "swapRow", to: "self" }]), U.apoyo(6)],
  myla:     [H.summon(2, 2, "token_torreta"), H.frzrow(2, 1, 0.7, "r"), H.shieldself(1, 2, 0), U.storm(1.0, true)],
  brasa:    [H.summon(2, 2, "token_torreta"), H.frzrow(2, 2, 0.8, "r"), H.custom("none", null, 1, 1, [{ op: "buff", atk: 2, temp: 1, to: "self" }, { op: "heal", n: 2, to: "self" }]), U.raw("none", "r", [{ op: "summon", id: "token_torreta", n: 2 }, { op: "buff", atk: 1, temp: 1, to: "allyAll" }])],
  eslabon:  [H.frz(1, 1, 0.9, "r"), H.frzrow(2, 2, 0.5, "m"), H.shield(1, 2), U.fort()],
  dariel:   [H.custom("enemy", "r", 1, 1, [dmg(0.6, "targetRow"), { op: "debuff", atk: 1, to: "target" }]), H.shieldall(2, 2), H.custom("none", "r", 2, 2, [{ op: "heal", n: 2, to: "allyAll" }, dmg(0.4, "enemyAll")]), U.apoyo(6)],
  vesper:   [H.row(1, 1, 0.9, "r"), H.custom("enemy", "m", 2, 2, [dmg(1.0, "target"), { op: "poison", n: 1, turns: 2, to: "target" }, { op: "swapRow", to: "self" }]), H.hit(2, 2, 2.0, "m"), U.exec(2.8, "m")],
  zahra:    [H.row(1, 1, 1.2, "r"), H.shieldself(1, 1, 2), H.dash(1, 2, 0.9, "r"), U.storm(1.3, false)],
  baltra:   [H.row(2, 2, 1.0, "m"), H.taunt(1, 2), H.frz(2, 2, 1.1, "m"), U.raw("none", "r", [{ op: "buff", hp: 2, to: "allyAll" }, { op: "give", kw: "shield", to: "self" }, dmg(0.5, "enemyAll")])],
  maura:    [H.frzcol(1, 1, 0.8, "r"), H.custom("ally", null, 2, 2, [{ op: "give", kw: "shield", to: "target" }, { op: "heal", n: 2, to: "target" }]), H.custom("enemy", "r", 1, 1, [dmg(0.8, "targetRow"), { op: "heal", n: 1, to: "allyAll" }]), U.raw("none", "r", [dmg(0.8, "enemyAll"), { op: "heal", n: 4, to: "allyAll" }])],
  morwen:   [H.psn(1, 1, 0.6, "r", 1, 3), H.row(2, 2, 1.3, "r"), H.shieldself(1, 2, 2), U.raw("none", "r", [dmg(0.7, "enemyAll"), { op: "poison", n: 1, turns: 3, to: "enemyAll" }])],
  tibor:    [H.summon(2, 2, "token_torreta"), H.shieldself(1, 1, 3), H.frzrow(1, 1, 0.6, "r"), U.apoyo(6)],
  farolero: [H.shield(1, 1), H.frzrow(1, 2, 0.5, "r"), H.shieldall(2, 3), U.raw("none", null, [{ op: "buff", hp: 2, to: "allyAll" }, { op: "give", kw: "shield", to: "allyAll" }])],
  orsa:     [H.col(1, 1, 1.3, "r"), H.buffself(1, 2, 1, true), H.row(2, 2, 1.1, "r"), U.storm(1.0, false)],
  iria:     [H.summon(1, 2, "token_torreta"), H.frzrow(1, 2, 0.5, "r"), H.col(2, 2, 1.6, "r"), U.storm(1.0, true)],
  sira:     [H.col(1, 1, 0.9, "r"), H.custom("none", null, 1, 1, [{ op: "swapRow", to: "self" }, { op: "heal", n: 2, to: "self" }]), H.row(2, 2, 1.0, "r"), U.storm(0.9, true)],
  nahir:    [H.row(1, 1, 0.9, "r"), H.custom("none", null, 1, 1, [{ op: "swapRow", to: "self" }, { op: "buff", atk: 1, temp: 1, to: "self" }]), H.col(2, 2, 1.4, "r"), U.raw("none", "r", [dmg(0.9, "enemyAll"), { op: "summon", id: "token_torreta", n: 1 }])],
  // ---- Ascensión ----
  aurelia:  [H.summon(2, 2, "token_torreta"), H.col(1, 1, 1.3, "r"), H.dash(1, 1, 1.0, "r"), U.raw("none", "r", [dmg(1.0, "enemyAll"), { op: "heal", n: 3, to: "allyAll" }])],
  khepri:   [H.col(1, 1, 1.2, "r"), H.shieldself(1, 2, 0), H.dash(1, 1, 1.4, "m"), U.raw("none", "r", [dmg(1.0, "enemyAll"), { op: "give", kw: "shield", to: "self" }])],
  velmira:  [H.col(1, 1, 1.2, "r"), H.custom("none", "r", 2, 2, [{ op: "buff", atk: 1, temp: 1, to: "allyAll" }, dmg(0.4, "enemyAll")]), H.swap(1, 1, 2), U.raw("none", "r", [dmg(0.8, "enemyAll"), ALL_ENEMY_FREEZE, { op: "buff", atk: 1, hp: 1, to: "allyAll" }])],
  vhal:     [H.col(1, 1, 1.3, "r"), H.frzrow(2, 2, 0.6, "r"), H.custom("none", null, 1, 1, [{ op: "swapRow", to: "self" }, { op: "buff", atk: 1, to: "self" }]), U.storm(1.4, false)],
  bront:    [H.col(1, 1, 1.2, "r"), H.summon(2, 2, "token_muro"), H.frzrow(1, 1, 0.7, "m"), U.fort()],
  oriel:    [H.custom("none", null, 1, 1, [{ op: "swapRow", to: "self" }, { op: "give", kw: "shield", to: "self" }]), H.custom("enemy", "m", 1, 1, [dmg(0.9, "targetRow"), { op: "heal", n: 1, to: "allyAll" }]), H.dash(1, 1, 1.1, "m"), U.raw("none", "r", [{ op: "buff", hp: 3, to: "allyAll" }, dmg(0.6, "enemyAll"), ALL_ENEMY_FREEZE])],
  saelis:   [H.row(1, 1, 0.8, "r"), H.custom("none", null, 2, 2, [{ op: "buff", atk: 1, temp: 1, to: "allyAll" }, { op: "heal", n: 1, to: "allyAll" }]), H.custom("enemy", "r", 1, 1, [dmg(1.0, "targetCol"), { op: "heal", n: 2, to: "self" }]), U.raw("none", "r", [dmg(1.0, "enemyAll"), { op: "heal", n: 4, to: "allyAll" }])],
  // ---- Calidad cinco ----
  aelith:   [H.custom("enemy", "r", 1, 1, [dmg(1.0, "target"), dmg(0.5, "target")]), H.frzcol(2, 2, 0.8, "r"), H.custom("none", null, 1, 2, [{ op: "buff", atk: 2, temp: 1, to: "self" }, { op: "give", kw: "shield", to: "self" }]), U.raw("none", "r", [dmg(0.6, "enemyAll"), ALL_ENEMY_FREEZE, { op: "give", kw: "shield", to: "allyAll" }])],
  brakk:    [H.summon(2, 2, "token_muro"), H.summon(2, 2, "token_torreta"), H.custom("none", null, 1, 2, [{ op: "heal", n: 4, to: "self" }, { op: "buff", hp: 1, to: "allyAll" }]), U.raw("none", "r", [dmg(0.8, "enemyAll"), ALL_ENEMY_FREEZE, { op: "give", kw: "shield", to: "self" }])],
  morveth:  [H.summon(2, 2, "token_torreta"), H.rowpsn(2, 1, 0.8, "r", 1, 3), H.shieldself(1, 2, 2), U.raw("none", "r", [dmg(0.7, "enemyAll"), { op: "poison", n: 1, turns: 3, to: "enemyAll" }])],
  solciju:  [H.psn(1, 1, 0.6, "r", 1, 3), H.row(2, 2, 1.2, "r"), H.shieldself(1, 2, 4), U.storm(0.8, true)],
  veyra:    [H.rowpsn(1, 1, 0.8, "m", 1, 3), H.dash(1, 1, 1.2, "m"), H.custom("none", null, 1, 2, [{ op: "buff", atk: 2, to: "self" }, { op: "dmg", n: 2, to: "self" }]), U.exec(2.8, "m", [{ op: "freeze", n: 1, to: "target" }])]
};
