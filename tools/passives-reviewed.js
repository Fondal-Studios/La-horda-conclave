"use strict";
/* tools/passives-reviewed.js — efecto en el DUELO de la PASIVA de cada guardián (nombre y texto originales en tools/repo-passives.json).
   Disparadores: inicio (tu turno) · golpeado (recibe daño y sigue vivo) · ataque (usa su Ataque) · uso (usa una habilidad/definitiva) ·
   muerte | muerteAliada | muerteEnemiga · sobrevive (una vez por partida, evita caer a 0).
   Estáticas (stat): dr (reduce el daño recibido) · vs (+daño contra unidades con un estado) · lowhp (+ATK con poca vida) · healLow (curas más fuertes a aliados heridos).
   Opciones: every N = cada N activaciones · max N = tope de activaciones por partida · cycle = alterna listas de efectos. */
function B(atk, hp, temp, to) { var o = { op: "buff", to: to || "self" }; if (atk) o.atk = atk; if (hp) o.hp = hp; if (temp) o.temp = 1; return o; }
var T = "target";
module.exports = {
  tanque:     { stat: { k: "dr", scope: "allies", n: 1 } },
  guerrero:   { stat: { k: "vs", st: "poison", n: 1 } },
  mago:       { stat: { k: "vs", st: "frozen", n: 1 } },
  soporte:    { stat: { k: "healLow", n: 2 } },
  segador:    { trig: "golpeado", max: 4, ops: [B(1)] },
  axiom:      { trig: "muerteEnemiga", max: 4, ops: [{ op: "crystal", n: 1 }] },
  profeta:    { trig: "ataque", every: 3, ops: [{ op: "dmg", mult: 0.5, to: "enemyAll" }] },
  musashi:    { trig: "ataque", max: 3, ops: [B(1)] },
  cazadora:   { trig: "ataque", max: 3, ops: [B(1)] },
  nigromante: { trig: "muerteAliada", max: 3, ops: [{ op: "summon", id: "esqueleto", n: 1 }] },
  libertador: { trig: "sobrevive" },
  ilkan:      { stat: { k: "lowhp", pct: 0.25, atk: 2 } },
  vesper:     { trig: "ataque", ops: [{ op: "poison", n: 1, turns: 2, to: T }] },
  nahir:      { trig: "ataque", every: 2, ops: [{ op: "dmg", n: 1, to: T }] },
  baltra:     { trig: "golpeado", max: 3, ops: [B(1)] },
  maura:      { trig: "ataque", every: 2, ops: [{ op: "heal", n: 1, to: "allyAll" }] },
  dariel:     { trig: "uso", every: 2, max: 6, ops: [B(1, 0, 1, "allyAll")] },
  orsa:       { trig: "ataque", every: 2, ops: [{ op: "dmg", n: 1, to: "targetRow" }] },
  tibor:      { trig: "inicio", ops: [{ op: "heal", n: 1, to: "allyAll" }] },
  zahra:      { trig: "inicio", max: 3, ops: [B(1)] },
  renko:      { trig: "ataque", every: 2, ops: [{ op: "dmg", n: 1, to: "targetCol" }] },
  sira:       { trig: "ataque", every: 3, max: 2, ops: [{ op: "draw", n: 1 }] },
  aurelia:    { trig: "uso", every: 2, max: 2, ops: [{ op: "summon", id: "token_torreta", n: 1 }] },
  khepri:     { trig: "muerte", max: 4, ops: [B(1)] },
  velmira:    { trig: "uso", cycle: [[B(1, 0, 1, "allyAll")], [{ op: "debuff", atk: 1, to: "randEnemy" }], [{ op: "give", kw: "shield", to: "randAlly" }], [{ op: "freeze", n: 1, to: "randEnemy" }]] },
  vhal:       { trig: "uso", max: 4, ops: [{ op: "debuff", atk: 1, to: "randEnemy" }] },
  bront:      { trig: "golpeado", every: 2, max: 4, ops: [{ op: "give", kw: "shield", to: "self" }] },
  oriel:      { trig: "uso", max: 3, ops: [{ op: "give", kw: "shield", to: "randAlly" }] },
  saelis:     { trig: "uso", ops: [{ op: "heal", n: 2, to: "randAlly" }] },
  solciju:    { trig: "ataque", every: 2, ops: [{ op: "poison", n: 1, turns: 3, to: T }] },
  veyra:      { stat: { k: "lowhp", pct: 0.4, atk: 1 } },
  brakk:      { stat: { k: "dr", scope: "self", n: 1, cond: "token" } },
  morveth:    { trig: "muerteEnemiga", max: 4, ops: [{ op: "poison", n: 1, turns: 3, to: "randEnemy" }] },
  aelith:     { trig: "uso", every: 3, ops: [{ op: "cdDown", n: 1, to: "self" }] },
  // --- el ARPG no tiene pasiva escrita para estos 7 (portadores): propuestas mías ---
  eslabon:    { proposed: "Vínculo de custodia", flavor: "El Eslabón comparte el golpe con quien está a su lado: los aliados de su fila reciben 1 menos de daño.", stat: { k: "dr", scope: "row", n: 1 } },
  brasa:      { proposed: "Reciclaje de latón", flavor: "Nada se desperdicia en la Fábrica: cuando cae un aliado, monta una torreta con las piezas.", trig: "muerteAliada", max: 2, ops: [{ op: "summon", id: "token_torreta", n: 1 }] },
  farolero:   { proposed: "Luz de guardia", flavor: "Sus faroles cuidan al grupo: al inicio de tu turno protege con un escudo a un aliado.", trig: "inicio", max: 4, ops: [{ op: "give", kw: "shield", to: "randAlly" }] },
  iria:       { proposed: "Hilos tensos", flavor: "Cada tercer golpe deja un hilo tenso que traba al enemigo un turno.", trig: "ataque", every: 3, ops: [{ op: "freeze", n: 1, to: T }] },
  morwen:     { proposed: "Reacción en cadena", flavor: "Sus reactivos reaccionan con lo que ya está infectado: +1 de daño contra unidades envenenadas.", stat: { k: "vs", st: "poison", n: 1 } },
  myla:       { proposed: "Yogur pegajoso", flavor: "Cada tercer golpe que recibe salpica yogur y congela a un enemigo al azar.", trig: "golpeado", every: 3, ops: [{ op: "freeze", n: 1, to: "randEnemy" }] },
  ynara:      { proposed: "Paciencia infinita", flavor: "Nunca pide perdón, pero siempre cuida: al inicio de tu turno cura 2 a un aliado al azar.", trig: "inicio", ops: [{ op: "heal", n: 2, to: "randAlly" }] }
};
