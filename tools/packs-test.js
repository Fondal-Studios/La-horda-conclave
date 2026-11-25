"use strict";
/* tools/packs-test.js — los paquetes cumplen lo que dicen: garantías, pity (cartel de "garantizada en N"), refuerzo temático, sin cartas prohibidas,
   repetidas → polvo y toda carta fabricable. También imprime los números que se muestran al jugador. */
var D = require("../data.js"), fails = [], seedv = 123456789;
function rnd() { seedv = (seedv * 1664525 + 1013904223) >>> 0; return seedv / 4294967296; }
function ck(c, m) { if (!c) fails.push(m); }
var N = 20000;
Object.keys(D.PACKS).forEach(function (pid) {
  var P = D.PACKS[pid], st = {}, sinceE = 0, sinceL = 0, maxE = 0, maxL = 0, hist = [0, 0, 0, 0, 0, 0], bad = 0, gotL = 0, firstL = [], cnt = 0, onTheme = 0, rarePlus = 0;
  for (var i = 0; i < N; i++) {
    var r = D.openPack(pid, st, rnd), rs = r.cards.map(function (id) { return D.CARDS[id].rar; });
    if (r.cards.length !== P.cards) bad++;
    if (Math.max.apply(null, rs) < P.minRar) bad++;
    r.cards.forEach(function (id) { var c = D.CARDS[id]; hist[c.rar]++; if (c.token || c.coin || c.boss) bad++; if (c.rar >= 3) { rarePlus++; if (P.theme && D.isFeatured(c, P.theme)) onTheme++; } });
    var mx = Math.max.apply(null, rs); sinceE = mx >= 4 ? 0 : sinceE + 1; sinceL = mx >= 5 ? 0 : sinceL + 1; maxE = Math.max(maxE, sinceE); maxL = Math.max(maxL, sinceL);
    cnt++; if (mx >= 5) { gotL++; }
  }
  ck(!bad, pid + ": paquetes con garantía rota o cartas prohibidas (" + bad + ")");
  ck(maxE < P.pityEpic, pid + ": pasaron " + (maxE + 1) + " paquetes sin Épica (pity " + P.pityEpic + ")");
  ck(maxL < P.pityLeg, pid + ": pasaron " + (maxL + 1) + " paquetes sin Legendaria (pity " + P.pityLeg + ")");
  var tot = hist.slice(1).reduce(function (a, b) { return a + b; }, 0);
  console.log((pid + "                ").slice(0, 15), "precio", P.price, P.currency === "oro" ? "oro" : "✦", "· por carta:", hist.slice(1).map(function (h, k) { return D.RARITY[k + 1].name.slice(0, 3) + " " + (100 * h / tot).toFixed(1) + "%"; }).join(" · "), "· Legendaria en " + (N / Math.max(gotL, 1)).toFixed(0) + " paq. de media (máx. " + (maxL + 1) + ")" + (P.theme ? " · Rara+ de tema: " + (100 * onTheme / rarePlus).toFixed(0) + "%" : ""));
  if (P.theme) ck(onTheme / rarePlus > 0.55, pid + ": el refuerzo temático no se nota (" + (100 * onTheme / rarePlus).toFixed(0) + "% de Rara+ de tema)");
});
// el refuerzo temático frente a un paquete sin tema
var st2 = {}, base = 0, baseN = 0, th = D.PACKS.tema_marea.theme;
for (var j = 0; j < 8000; j++) D.openPack("dorado", st2, rnd).cards.forEach(function (id) { var c = D.CARDS[id]; baseN++; if (D.isFeatured(c, th)) base++; });
console.log("sin tema, las cartas de invierno son el " + (100 * base / baseN).toFixed(0) + "% de las Raras+ (en el Paquete de Invierno suben al ~70-90%)");
// repetidas y fabricación
var own = {}, g = D.grantCards(own, ["lobo_alfa", "lobo_alfa", "lobo_alfa", "lobo_alfa", "vhal", "vhal"]);
ck(own.lobo_alfa === 3 && g.dust === D.RARITY[D.CARDS.lobo_alfa.rar].dis + D.RARITY[5].dis, "las repetidas no se convierten bien en polvo: " + JSON.stringify(g));
D.collectible().forEach(function (id) { ck(D.RARITY[D.CARDS[id].rar] && D.RARITY[D.CARDS[id].rar].craft > 0, id + " no se puede fabricar"); });
var byR = {}; D.collectible().forEach(function (id) { byR[D.CARDS[id].rar] = (byR[D.CARDS[id].rar] || 0) + 1; });
D.collectible().filter(function (id) { return D.CARDS[id].rar === 5; }).forEach(function (id) { ck(D.maxCopiesOf(id) === 1, id + ": las legendarias deben ser de 1 copia"); });
console.log("cartas por rareza:", Object.keys(byR).map(function (k) { return D.RARITY[k].name + " " + byR[k]; }).join(" · "));
if (fails.length) { console.log("FALLA:"); fails.forEach(function (f) { console.log(" -", f); }); process.exit(1); }
console.log("PAQUETES OK");
