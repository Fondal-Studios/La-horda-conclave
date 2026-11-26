"use strict";
// Vuelca las cartas con arte a JSON (lo usa tools/art-judge.py)
var D = require("../data.js"), out = [];
Object.keys(D.CARDS).forEach(function (id) { var c = D.CARDS[id]; if (c.type !== "unit" && process.argv.indexOf("--all") < 0) return;
  out.push({ id: id, name: c.name, kind: c.kind, token: !!c.token, boss: !!c.boss, rarity: c.rarity, cost: c.cost, origin: c.origin || null, art: c.art, artFx: c.artFx || "", syn: !!c.syn, tags: c.tags || [] }); });
process.stdout.write(JSON.stringify(out));
