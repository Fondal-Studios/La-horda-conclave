"use strict";
/* tools/economy-sim2.js — jugador gratis vs. jugador que paga, con rareza, paquetes premium temáticos, pity y polvo.
   Responde: ¿cuánto más tiene el que paga, y cuánto tarda el gratis en tener lo mismo? Supuestos explícitos abajo (NO son mediciones de jugadores reales).
   Uso: node tools/economy-sim2.js [jugadores por perfil=30] */
var D = require("../data.js"), N = parseInt(process.argv[2] || "30", 10), s = 777;
function rnd() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }
var E = process.env, WIN = +(E.WIN || 25), LOSS = +(E.LOSS || 10), QUEST = +(E.QUEST || 50), GAMES = +(E.GAMES || 5), WINRATE = 0.5, DUSTM = +(E.DUSTM || 1);            // oro por victoria/derrota, misión diaria, partidas por día, tasa de victoria
var ALL = D.collectible(), TOTAL_C = ALL.length, LEG = ALL.filter(function (id) { return D.CARDS[id].rar === 5; });
function profile(name, usdPerMonth, theme) {
  return { name: name, usd: usdPerMonth, theme: theme };
}
var PROFILES = [profile("Gratis (5 partidas/día)", 0, null), profile("Paga US$ 10/mes", 10, "tema_marea"), profile("Paga US$ 20/mes", 20, "tema_marea"), profile("Paga US$ 100/mes", 100, "tema_marea")];
function sim(pr, days) {
  var save = { owned: {}, pity: {}, dust: 0 }, gold = 400, brasas = 0, out = {}, favored = pr.theme ? D.PACKS[pr.theme].theme : { linaje: "marea", tags: ["Hielo"] };
  D.DECKS.marea.forEach(function (id) { save.owned[id] = (save.owned[id] || 0) + 1; });
  function featured(id) { var c = D.CARDS[id]; return D.isFeatured(c, favored); }
  function craftPolicy() {       // el jugador gasta el polvo en lo que más le falta del linaje que juega, de la rareza más alta que pueda pagar
    var guard = 0; while (guard++ < 50) {
      var miss = ALL.filter(function (id) { return (save.owned[id] || 0) < D.maxCopiesOf(id) && D.RARITY[D.CARDS[id].rar].craft <= save.dust && featured(id) && D.CARDS[id].rar >= 3; }).sort(function (a, b) { return D.CARDS[b].rar - D.CARDS[a].rar; });
      if (!miss.length) break; var id = miss[0]; save.dust -= D.RARITY[D.CARDS[id].rar].craft; save.owned[id] = (save.owned[id] || 0) + 1;
    }
  }
  for (var d = 1; d <= days; d++) {
    for (var g = 0; g < GAMES; g++) gold += rnd() < WINRATE ? WIN : LOSS; gold += QUEST;
    while (gold >= 100) { gold -= 100; var r = D.openPack("estandar", save, rnd); save.dust += Math.round(D.grantCards(save.owned, r.cards).dust * DUSTM); }
    if (pr.usd && d % 30 === 1) brasas += pr.usd * 100;                   // 1 ✦ ≈ US$ 0,01
    while (pr.usd && brasas >= 150) { brasas -= 150; var r2 = D.openPack(pr.theme, save, rnd); save.dust += Math.round(D.grantCards(save.owned, r2.cards).dust * DUSTM); }
    craftPolicy();
    if ([30, 90, 180].indexOf(d) >= 0) {
      var have = ALL.filter(function (id) { return save.owned[id] > 0; }), byR = {};
      have.forEach(function (id) { var r = D.CARDS[id].rar; byR[r] = (byR[r] || 0) + 1; });
      var ft = ALL.filter(function (id) { return featured(id) && D.CARDS[id].rar >= 4; });
      out[d] = { pct: have.length / TOTAL_C, leg: LEG.filter(function (id) { return save.owned[id]; }).length, epic: have.filter(function (id) { return D.CARDS[id].rar === 4; }).length, themeTop: ft.filter(function (id) { return save.owned[id]; }).length / ft.length };
    }
  }
  return out;
}
console.log("Supuestos: DUSTM=" + DUSTM + " · " + GAMES + " partidas/día al " + 100 * WINRATE + "% · oro " + WIN + "/" + LOSS + " + misión " + QUEST + " · sobre estándar 100 de oro · paquete temático 150 ✦ (1 ✦ ≈ US$ 0,01) · el jugador fabrica con polvo lo mejor de su linaje (Marea)");
console.log("Total coleccionable: " + TOTAL_C + " cartas distintas (" + LEG.length + " Legendarias).\n");
PROFILES.forEach(function (pr) {
  var acc = { 30: [], 90: [], 180: [] };
  for (var i = 0; i < N; i++) { var o = sim(pr, 180); [30, 90, 180].forEach(function (d) { acc[d].push(o[d]); }); }
  var avg = function (arr, k) { return arr.reduce(function (a, x) { return a + x[k]; }, 0) / arr.length; };
  console.log(pr.name + ":");
  [30, 90, 180].forEach(function (d) { console.log("   día " + d + ": " + (100 * avg(acc[d], "pct")).toFixed(0) + "% de las cartas · " + avg(acc[d], "epic").toFixed(1) + "/" + ALL.filter(function (id) { return D.CARDS[id].rar === 4; }).length + " Épicas · " + avg(acc[d], "leg").toFixed(1) + "/" + LEG.length + " Legendarias · " + (100 * avg(acc[d], "themeTop")).toFixed(0) + "% de las Épicas+ de Invierno"); });
});
