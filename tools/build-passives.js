"use strict";
/* tools/build-passives.js — une las pasivas REALES del repo (tools/repo-passives.json) con su efecto en el duelo
   (tools/passives-reviewed.js) y los nombres de Ataque (identity.basic o arma). Uso: node tools/build-passives.js > passives.js */
var ST = require("./repo-stats.json"), BS = require("./basics-reviewed.js"), R = require("./repo-passives.json"), V = require("./passives-reviewed.js"), roles = require("./roles.json"), out = {};
function short(d) { d = (d || "").replace(/\s+/g, " "); var i = d.search(/[.!?]\s/); return i > 20 && i < 140 ? d.slice(0, i + 1) : d.slice(0, 130) + (d.length > 130 ? "…" : ""); }
Object.keys(roles).forEach(function (id) {
  var v = V[id]; if (!v) throw new Error("falta pasiva " + id);
  var r = R[id] || {}, p = { name: v.proposed || (r.passive && r.passive.name), flavor: v.flavor || short(r.passive && r.passive.desc), proposed: !!v.proposed };
  ["trig", "ops", "every", "max", "cycle", "stat"].forEach(function (k) { if (v[k] !== undefined) p[k] = v[k]; });
  var b = BS[id]; if (!b) throw new Error("falta básico " + id);
  out[id] = { passive: p, basic: b.name || r.basic || r.weapon || "Ataque", basicOps: b.ops, ranged: (ST[id].range || 0) >= 200, ratio: Math.round(1000 * ST[id].dmg / ST[id].hp) / 1000, repoHp: ST[id].hp, repoDmg: ST[id].dmg };
});
process.stdout.write('"use strict";\n/* GENERADO por tools/build-passives.js. No editar a mano. */\n(function(root){root.HORDA_PASSIVES=' + JSON.stringify(out) + ';if(typeof module!=="undefined")module.exports=root.HORDA_PASSIVES;})(typeof window!=="undefined"?window:globalThis);\n');
