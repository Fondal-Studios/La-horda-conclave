"use strict";
/* tools/economy-sim.js — ¿cuánto pesa tener más cartas? (riesgo de "pay to win")
   Parte 1: arma el mejor mazo posible (heurística simple) con colecciones de distinto tamaño y mide la tasa de victoria del bot contra los 6 mazos iniciales.
            Si la tasa sube mucho con la colección, comprar cartas = ganar. Si sube poco, la monetización por sobres es sana.
   Parte 2: curva de colección de un jugador gratis (partidas por día) con la economía actual (sobre = 100 de oro; victoria +80, derrota +30).
   Uso: node tools/economy-sim.js [colecciones por nivel=10]   */
var D = require("../data.js"), E = require("../engine.js")(D.CARDS, D.MAPS, D.SUMMONER), AI = require("../ai.js")(E);
var WIN = parseInt(process.env.WIN || "80", 10), LOSS = parseInt(process.env.LOSS || "30", 10);
var NCOL = parseInt(process.argv[2] || "10", 10), seed = 90000;
var rs = 12345; function rnd() { rs = (rs * 1664525 + 1013904223) >>> 0; return rs / 4294967296; }
function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
var ALL = Object.keys(D.CARDS).filter(function (id) { var c = D.CARDS[id]; return !c.coin && !c.token; });
function maxC(id) { var c = D.CARDS[id]; return c.kind === "guardian" ? 1 : c.kind === "bicho" ? (c.cost <= 3 ? 3 : 2) : 2; }
var TOTAL = ALL.reduce(function (n, id) { return n + maxC(id); }, 0);

// colección = mazo inicial del linaje + copias al azar hasta llegar a la fracción f del total posible
function collection(lin, f) {
  var own = {}; D.DECKS[lin].forEach(function (id) { own[id] = (own[id] || 0) + 1; });
  var have = Object.keys(own).reduce(function (n, id) { return n + own[id]; }, 0), want = Math.round(TOTAL * f), pool = [];
  ALL.forEach(function (id) { for (var i = 0; i < maxC(id); i++) pool.push(id); }); shuffle(pool);
  pool.forEach(function (id) { if (have < want && (own[id] || 0) < maxC(id)) { own[id] = (own[id] || 0) + 1; have++; } });
  return own;
}
// armador de mazos: elige el linaje con más cartas propias, 5 guardianes, y rellena priorizando linaje, sinergias y curva
function build(own) {
  var lins = Object.keys(D.LINAJES), best = null, bs = -1;
  lins.forEach(function (l) { var s = ALL.reduce(function (n, id) { return n + ((own[id] || 0) && D.CARDS[id].origin === l ? Math.min(own[id], maxC(id)) * (D.CARDS[id].kind === "guardian" ? 3 : 1) : 0); }, 0); if (s > bs) { bs = s; best = l; } });
  var base = D.DECKS[best], baseSet = {}; base.forEach(function (id) { baseSet[id] = 1; });
  function pts(id) { var c = D.CARDS[id]; return D.points(c) || 0; }
  var gs = ALL.filter(function (id) { return D.CARDS[id].kind === "guardian" && own[id]; });
  gs.sort(function (a, b) { return ((D.CARDS[b].origin === best) - (D.CARDS[a].origin === best)) * 6 + (pts(b) - pts(a)) * 0.2 - (D.CARDS[b].cost > 6 ? 1.5 : 0) + (D.CARDS[a].cost > 6 ? 1.5 : 0); });
  var deck = gs.slice(0, 5), cnt = {};
  function add(id) { cnt[id] = (cnt[id] || 0) + 1; deck.push(id); }
  function score(id) {
    var c = D.CARDS[id], s = 0; if (c.origin === best) s += 3; if (baseSet[id]) s += 2;
    if (c.kind === "bicho") s += (pts(id) - (2 * c.cost + 2)) * 0.4 + (c.cost <= 3 ? 1.5 : 0) + (c.syn ? 1 : 0);
    else s += 2;                              // magia/trampas: valor medio
    D.COMBOS.forEach(function (cb) { if (cb.cards.indexOf(id) >= 0) s += cb.cards.filter(function (x) { return deck.indexOf(x) >= 0 || baseSet[x]; }).length * 0.5; });
    return s;
  }
  var cands = ALL.filter(function (id) { return D.CARDS[id].kind !== "guardian" && own[id]; });
  var monsters = 0, spells = 0;
  for (var round = 0; round < 40 && deck.length < 30; round++) {
    var ok = cands.filter(function (id) { return (cnt[id] || 0) < Math.min(own[id], maxC(id)) && (D.CARDS[id].kind === "bicho" ? monsters < 15 : spells < 11); });
    if (!ok.length) ok = cands.filter(function (id) { return (cnt[id] || 0) < Math.min(own[id], maxC(id)); });
    if (!ok.length) break;
    ok.sort(function (a, b) { return score(b) - score(a); }); var pick = ok[0]; add(pick); if (D.CARDS[pick].kind === "bicho") monsters++; else spells++;
  }
  return { deck: deck, lin: best };
}
function winrate(deck, N) {
  var w = 0, g = 0, opp = Object.keys(D.DECKS);
  for (var i = 0; i < N; i++) {
    var od = D.DECKS[opp[i % opp.length]], first = i % 2 === 0, map = Object.keys(D.MAPS)[i % 6];
    var s = E.newGame(first ? [deck, od] : [od, deck], seed++, null, map, { sk: [["voz", "egida"], ["voz", "egida"]] }), st = 0;
    while (!s.over && st < 3000 && s.turn < 110) { E.apply(s, AI.choose(s, 1.0)); st++; }
    if (s.over) { g++; if (s.winner === (first ? 0 : 1)) w++; }
  }
  return g ? w / g : 0;
}
console.log("=== Parte 1: tasa de victoria según el tamaño de la colección (bot, mejor mazo armado con lo que se tiene) ===");
var lins = Object.keys(D.LINAJES), table = [];
[0.28, 0.40, 0.55, 0.75, 1.0].forEach(function (f) {
  var wr = [], sizes = [];
  for (var k = 0; k < (process.env.SKIP1 ? 0 : NCOL); k++) { var lin = lins[k % lins.length], own = collection(lin, f), b = build(own); if (D.validateDeck(b.deck).length) { console.log("mazo inválido", D.validateDeck(b.deck)[0]); continue; } wr.push(winrate(b.deck, 12)); sizes.push(Object.keys(own).length); }
  var m = wr.reduce(function (a, b) { return a + b; }, 0) / wr.length;
  table.push([f, m]); console.log("  colección " + Math.round(f * 100) + "% (~" + Math.round(sizes.reduce(function (a, b) { return a + b; }, 0) / sizes.length) + " cartas distintas): victorias " + (100 * m).toFixed(1) + "%");
});
var delta = table[table.length - 1][1] - table[0][1];
console.log("  → de la colección inicial (28%) a la completa (100%) la tasa de victoria sube " + (100 * delta).toFixed(1) + " puntos");

console.log("\n=== Parte 2: curva de colección de un jugador gratis (economía actual: sobre 100 de oro, victoria +80, derrota +30) ===");
function packCards() { var out = [], hasG = false; for (var i = 0; i < 5; i++) { var r = rnd(), pool; if (r < 0.13) pool = ALL.filter(function (id) { return D.CARDS[id].kind === "guardian"; }); else if (r < 0.58) pool = ALL.filter(function (id) { return D.CARDS[id].kind === "bicho"; }); else pool = ALL.filter(function (id) { return D.CARDS[id].type === "spell" || D.CARDS[id].type === "trap"; }); out.push(pool[Math.floor(rnd() * pool.length)]); } return out; }
[3, 6, 10].forEach(function (gpd) {
  var own = {}; D.DECKS.ciudad.forEach(function (id) { own[id] = (own[id] || 0) + 1; }); var gold = 400, line = [], gu = 0;
  var gAll = ALL.filter(function (id) { return D.CARDS[id].kind === "guardian"; }).length;
  for (var day = 1; day <= 120; day++) {
    for (var gme = 0; gme < gpd; gme++) gold += rnd() < 0.5 ? WIN : LOSS;
    while (gold >= 100) { gold -= 100; packCards().forEach(function (id) { if ((own[id] || 0) < maxC(id)) own[id] = (own[id] || 0) + 1; }); }
    if ([7, 14, 30, 60, 120].indexOf(day) >= 0) { var have = Object.keys(own).reduce(function (n, id) { return n + own[id]; }, 0); var gh = ALL.filter(function (id) { return D.CARDS[id].kind === "guardian" && own[id]; }).length; line.push("día " + day + ": " + Math.round(100 * have / TOTAL) + "% de las copias, " + gh + "/" + gAll + " guardianes"); }
  }
  console.log("  " + gpd + " partidas por día → " + line.join(" · "));
});
console.log("\n(el total posible de copias coleccionables es " + TOTAL + " sobre " + ALL.length + " cartas distintas)");
