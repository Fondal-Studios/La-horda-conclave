"use strict";
/* tools/adventure-sim.js — simula N aventuras completas (bot que juega y elige recompensas con una política simple)
   para ver qué nodos son demasiado duros o fáciles. Reintentos ilimitados (como en el juego). Uso: node tools/adventure-sim.js [aventuras=30] */
var D = require("../data.js"), E = require("../engine.js")(D.CARDS, D.MAPS, D.SUMMONER), AI = require("../ai.js")(E);
var N = parseInt(process.argv[2] || "30", 10), seed = 5000;
var rng = (function () { var a = 12345; return function () { a = (a * 1103515245 + 12345) & 0x7fffffff; return a / 0x7fffffff; }; })();
function pick(a, n) { var c = a.slice(), o = []; while (o.length < n && c.length) o.push(c.splice(Math.floor(rng() * c.length), 1)[0]); return o; }
function copies(deck, id) { return deck.filter(function (x) { return x === id; }).length; }
function maxCopies(id) { var c = D.CARDS[id]; return c.kind === "guardian" ? 1 : c.kind === "bicho" ? (c.cost <= 3 ? 3 : 2) : 2; }
var companions = ["tanque", "guerrero", "mago", "soporte"], stats = {}, fullRuns = 0, totalTries = 0;
for (var run = 0; run < N; run++) {
  var deck = D.advStarter(companions[run % 4]), ok = true;
  for (var ch = 0; ch < D.CHAPTERS.length && ok; ch++) for (var ni = 0; ni < D.NODES.length; ni++) {
    var node = D.NODES[ni], key = ch + "." + ni;
    stats[key] = stats[key] || { tries: 0, wins: 0, first: 0, first_n: 0, node: node.t };
    if (node.t === "fight" || node.t === "boss") {
      var enc = D.encounter(ch, ni), tries = 0, won = false;
      while (!won && tries < 6) {
        tries++; var first = rng() < .5;
        var s = E.newGame(first ? [deck, enc.deck] : [enc.deck, deck], seed++, null, enc.map, { hand: first ? [enc.bonusHand, 0] : [0, enc.bonusHand], hp: first ? [enc.php, enc.hp] : [enc.hp, enc.php], pre: enc.pre.map(function (x) { return { p: first ? 1 : 0, id: x.id, cell: x.cell }; }) });
        var steps = 0; while (!s.over && steps < 3000 && s.turn < 80) { E.apply(s, AI.choose(s, 1.0)); steps++; }
        var me = first ? 0 : 1; won = s.over && s.winner === me; stats[key].tries++; if (won) stats[key].wins++;
        if (tries === 1) { stats[key].first_n++; if (won) stats[key].first++; }
      }
      totalTries += tries;
      if (!won) { ok = false; break; }
      // captura: el bicho más caro del enemigo que todavía se pueda sumar; el jefe regala un guardián
      if (node.t === "fight") { var opts = Array.from(new Set(enc.deck.filter(function (id) { return D.CARDS[id].kind === "bicho" && copies(deck, id) < maxCopies(id); }))); opts.sort(function (a, b) { return D.CARDS[b].cost - D.CARDS[a].cost; }); if (opts[0]) deck.push(opts[0]); }
    }
    if (node.t === "ally" || node.t === "boss") {
      var gs = Object.keys(D.CARDS).filter(function (id) { return D.CARDS[id].kind === "guardian" && D.CARDS[id].origin === D.CHAPTERS[ch].lin && deck.indexOf(id) < 0; }), gin = deck.filter(function (id) { return D.CARDS[id].kind === "guardian"; }).length;
      var o3 = pick(gs, 3).sort(function (a, b) { return D.CARDS[b].cost - D.CARDS[a].cost; });
      if (gin < 5 && o3[0]) deck.push(o3[0]);
    }
    if (node.t === "cache") { var sp = Object.keys(D.CARDS).filter(function (id) { return D.CARDS[id].type === "spell" && !D.CARDS[id].coin && copies(deck, id) < 2; }); var c3 = pick(sp, 3); if (c3[0]) deck.push(c3[0]); }
  }
  if (ok) fullRuns++;
}
console.log("aventuras completadas:", fullRuns + "/" + N, "· intentos totales por aventura:", (totalTries / N).toFixed(1));
Object.keys(stats).forEach(function (k) {
  var s = stats[k]; if (s.node !== "fight" && s.node !== "boss") return;
  var f = s.first_n ? Math.round(100 * s.first / s.first_n) : 0;
  console.log(" cap " + k.split(".")[0] + " nodo " + k.split(".")[1] + " (" + s.node + "): gana a la 1ª " + f + "% · intentos prom " + (s.tries / Math.max(1, s.first_n)).toFixed(2));
});
