"use strict";
/* tools/power-scan.js — ¿qué guardianes y cartas pesan demasiado? Para cada guardián lo mete en un mazo base (reemplazando al guardián más barato
   que no sea él) y mide la tasa de victoria del bot contra los 6 mazos iniciales. Sirve para detectar cartas que no se pueden vender/regalar sin romper el juego.
   Ruido: con N partidas el error estándar es ~ 50/sqrt(N) puntos (N=96 → ±5). Uso: node tools/power-scan.js [partidas=96] */
var D = require("../data.js"), E = require("../engine.js")(D.CARDS, D.MAPS, D.SUMMONER), AI = require("../ai.js")(E);
var N = parseInt(process.argv[2] || "96", 10), seed = 300000, opp = Object.keys(D.DECKS);
function wr(deck) { var w = 0, g = 0; for (var i = 0; i < N; i++) { var od = D.DECKS[opp[i % 6]], first = i % 2 === 0, s = E.newGame(first ? [deck, od] : [od, deck], seed++, null, Object.keys(D.MAPS)[i % 6], { sk: [["voz", "egida"], ["voz", "egida"]] }), st = 0; while (!s.over && st < 3000 && s.turn < 110) { E.apply(s, AI.choose(s, 1.0)); st++; } if (s.over) { g++; if (s.winner === (first ? 0 : 1)) w++; } } return g ? 100 * w / g : 0; }
var base = D.DECKS.ciudad, gs = Object.keys(D.CARDS).filter(function (k) { return D.CARDS[k].kind === "guardian"; }), out = [];
var baseG = base.filter(function (id) { return D.CARDS[id].kind === "guardian"; }), b0 = wr(base);
gs.forEach(function (g) {
  var deck = base.slice();
  if (deck.indexOf(g) < 0) { var cheapest = baseG.slice().sort(function (a, b) { return D.CARDS[a].cost - D.CARDS[b].cost; })[0]; deck[deck.indexOf(cheapest)] = g; }
  out.push([g, D.CARDS[g].tier, D.CARDS[g].cost, D.CARDS[g].role, wr(deck) - b0]);
});
out.sort(function (a, b) { return b[4] - a[4]; });
console.log("mazo base (Ciudad):", b0.toFixed(1) + "% · ruido esperado ±" + (50 / Math.sqrt(N)).toFixed(1) + " puntos");
console.log("MÁS FUERTES (diferencia contra el mazo base):"); out.slice(0, 8).forEach(function (r) { console.log("  +" + r[4].toFixed(1).padStart(5), r[0].padEnd(12), r[1], "costo", r[2], r[3]); });
console.log("MÁS DÉBILES:"); out.slice(-6).forEach(function (r) { console.log("  " + r[4].toFixed(1).padStart(6), r[0].padEnd(12), r[1], "costo", r[2], r[3]); });
var mean = out.reduce(function (a, r) { return a + r[4]; }, 0) / out.length, sd = Math.sqrt(out.reduce(function (a, r) { return a + Math.pow(r[4] - mean, 2); }, 0) / out.length);
var asc = out.filter(function (r) { return r[1] === "Ascensión"; }), std = out.filter(function (r) { return r[1] !== "Ascensión"; });
var avg = function (a) { return a.reduce(function (x, r) { return x + r[4]; }, 0) / Math.max(a.length, 1); };
console.log("desvío entre guardianes: " + sd.toFixed(1) + " puntos (ruido ~" + (50 / Math.sqrt(N) * 1.0).toFixed(1) + ") · promedio Ascensión " + avg(asc).toFixed(1) + " vs. comunes " + avg(std).toFixed(1));
