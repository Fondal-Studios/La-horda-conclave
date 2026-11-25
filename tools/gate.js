"use strict";
/* tools/gate.js — "gate" de cartas (mismo espíritu que tools/balance/*-gate.js del repo):
   1) regla de puntos: todo guardián > todo monstruo; presupuesto por costo
   2) arte presente para cada carta
   3) mazos iniciales válidos
   4) invariantes del motor con partidas bot-vs-bot (tablero <=5, sin NaN, termina)
   5) balance: tasa de victoria por mazo y por quien empieza
   Uso: node tools/gate.js [partidasPorPareja=20]            */
var fs = require("fs"), path = require("path");
var D = require("../data.js"), E = require("../engine.js")(D.CARDS, D.MAPS, D.SUMMONER), AI = require("../ai.js")(E);
var N = parseInt(process.argv[2] || "20", 10), fails = [], warn = [];
var root = path.join(__dirname, "..");

// 1) puntos
var gMin = 1e9, bMax = 0, gMinId, bMaxId;
Object.keys(D.CARDS).forEach(function (id) {
  var c = D.CARDS[id]; if (c.type !== "unit" || c.token) return;
  var p = D.points(c);
  if (c.kind === "guardian") {
    if (c.cost < 4) fails.push(id + ": guardián con costo < 4");
    if (p < D.guardianPoints(c.cost)) fails.push(id + ": " + p + " pts < presupuesto " + D.guardianPoints(c.cost));
    if (p < gMin) { gMin = p; gMinId = id; }
  } else {
    if (c.cost > 5) fails.push(id + ": monstruo con costo > 5");
    if (p > 2 * c.cost + 2) fails.push(id + ": " + p + " pts > presupuesto " + (2 * c.cost + 2));
    if (p > bMax) { bMax = p; bMaxId = id; }
  }
});
if (!(gMin > bMax)) fails.push("el guardián más flojo (" + gMinId + ", " + gMin + ") no supera al monstruo más fuerte (" + bMaxId + ", " + bMax + ")");
console.log("puntos: guardián mínimo", gMin, "(" + gMinId + ") > monstruo máximo", bMax, "(" + bMaxId + ")");

// 2) arte
var nArt = 0;
Object.keys(D.CARDS).forEach(function (id) {
  var c = D.CARDS[id]; if (c.type !== "unit" || c.token) return;
  if (!fs.existsSync(path.join(root, c.art))) fails.push(id + ": falta arte " + c.art); else nArt++;
});
console.log("arte presente:", nArt, "cartas de unidad");

// 3) mazos
Object.keys(D.DECKS).forEach(function (l) { D.validateDeck(D.DECKS[l]).forEach(function (e) { fails.push("mazo " + l + ": " + e); }); });
var seedR = 7; function rr() { seedR = (seedR * 16807) % 2147483647; return seedR / 2147483647; }
for (var k = 0; k < 20; k++) D.validateDeck(D.chaosDeck(rr)).forEach(function (e) { fails.push("mazo caos: " + e); });

// 4) y 5) simulaciones
var names = Object.keys(D.DECKS), wins = {}, games = {}, first = [0, 0, 0], turnsSum = 0, total = 0, maxTurn = 0, guardPlays = 0, ultUses = 0, skillUses = 0, reposUses = 0, mapWins = {}, mapGames = {}; Object.keys(D.MAPS).forEach(function (m) { mapWins[m] = [0, 0]; mapGames[m] = 0; });
names.forEach(function (n) { wins[n] = 0; games[n] = 0; });
function invariants(s, tag) {
  s.players.forEach(function (P, i) {
    if (P.cells.length !== 6) fails.push(tag + " celdas != 6");
    P.cells.forEach(function (u, ci) { if (u && u.cell !== ci) fails.push(tag + " celda desincronizada " + u.id); });
    if (P.hand.length > E.HAND_MAX) fails.push(tag + " mano > 8");
    if (!Number.isFinite(P.hp)) fails.push(tag + " hp NaN");
    E.units(s, i).forEach(function (u) { if (!Number.isFinite(E.atkOf(s, u)) || !Number.isFinite(E.hpOf(s, u))) fails.push(tag + " stats NaN " + u.id); });
  });
}
var LOAD = function (n) { var ids = D.SUMMONER_IDS.slice(), a = ids[n % ids.length], b = ids[(n * 3 + 1) % ids.length]; if (a === b) b = ids[(n + 1) % ids.length]; return [a, b]; };
var sumUses = 0, sumBy = {};
function play(da, db, seed, map) {
  var s = E.newGame([da, db], seed, null, map, { sk: [LOAD(seed), LOAD(seed + 5)] }), steps = 0;
  while (!s.over && steps < 4000) {
    var a = AI.choose(s, 1.2);
    if (!E.isLegal(s, a)) { fails.push("acción ilegal del bot " + JSON.stringify(a)); break; }
    if (a.t === "use" && D.CARDS[E.find(s, a.uid).u.id].moves[a.mv].ult) ultUses++; if (a.t === "use" && a.mv > 0) skillUses++; if (a.t === "move") reposUses++; if (a.t === "sum") { sumUses++; var nm = s.players[s.active].sk[a.i]; sumBy[nm] = (sumBy[nm] || 0) + 1; }
    var r = E.apply(s, a); if (!r.ok) { fails.push("apply falló " + r.error); break; }
    invariants(s, "seed" + seed);
    steps++;
    if (s.turn > 60) break;
  }
  return s;
}
var seed = 1000;
for (var i = 0; i < names.length; i++) for (var j = 0; j < names.length; j++) {
  if (i === j) continue;
  for (var g = 0; g < N; g++) {
    var mp = Object.keys(D.MAPS)[g % 6], s = play(D.DECKS[names[i]], D.DECKS[names[j]], seed++, mp); mapGames[mp]++;
    total++; turnsSum += s.turn; maxTurn = Math.max(maxTurn, s.turn);
    if (!s.over) { warn.push("partida sin terminar (" + names[i] + " vs " + names[j] + ")"); first[2]++; continue; }
    games[names[i]]++; games[names[j]]++;
    if (s.winner >= 0) mapWins[mp][s.winner]++; if (s.winner === 0) { wins[names[i]]++; first[0]++; } else if (s.winner === 1) { wins[names[j]]++; first[1]++; } else first[2]++;
  }
}
console.log("\nhabilidades del invocador usadas:", sumUses, JSON.stringify(sumBy));
console.log("habilidades usadas:", skillUses, "· reposicionamientos:", reposUses);
console.log("por mapa (gana quien abre %):", Object.keys(D.MAPS).map(function (m) { return m + " " + (100 * mapWins[m][0] / Math.max(1, mapWins[m][0] + mapWins[m][1])).toFixed(0); }).join(" · "));
console.log("partidas:", total, "· turnos promedio (ambos jugadores):", (turnsSum / total).toFixed(1), "· máx:", maxTurn, "· definitivas usadas:", ultUses);
console.log("gana quien empieza:", (100 * first[0] / total).toFixed(1) + "%", "· segundo:", (100 * first[1] / total).toFixed(1) + "%", "· empate/sin fin:", first[2]);
names.forEach(function (n) {
  var wr = 100 * wins[n] / games[n];
  console.log("  " + (n + "          ").slice(0, 11), wr.toFixed(1) + "%");
  if (wr < 35 || wr > 65) warn.push("deck " + n + " fuera de 35-65%: " + wr.toFixed(1) + "%");
});
if (first[0] / total > 0.58 || first[0] / total < 0.42) warn.push("ventaja de iniciativa fuera de 42-58%");
warn.slice(0, 10).forEach(function (w) { console.log("AVISO:", w); });
if (fails.length) { console.log("\nFALLA (" + fails.length + "):"); fails.slice(0, 25).forEach(function (f) { console.log(" -", f); }); process.exit(1); }
console.log("\nGATE OK (con " + warn.length + " avisos de balance)");
