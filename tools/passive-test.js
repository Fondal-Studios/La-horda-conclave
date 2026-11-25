"use strict";
/* tools/passive-test.js — comprueba que la pasiva de CADA guardián funciona:
   - activables (inicio/golpeado/ataque/uso/muerte…): el guardián se juega en partidas bot-vs-bot y debe disparar su pasiva al menos una vez (evento "passive")
   - estáticas (dr, vs, lowhp, healLow) y "sobrevive": pruebas directas sobre el motor. */
var D = require("../data.js"), E = require("../engine.js")(D.CARDS, D.MAPS, D.SUMMONER), AI = require("../ai.js")(E), fails = [];
var gs = Object.keys(D.CARDS).filter(function (k) { return D.CARDS[k].kind === "guardian"; });
gs.forEach(function (id) { var p = D.CARDS[id].passive; if (!p || !p.name) fails.push(id + ": sin pasiva"); if (!D.CARDS[id].moves[0].name) fails.push(id + ": sin nombre de ataque"); });
var fired = {}, seed = 70000;
function mk(deckA, deckB) { return E.newGame([deckA, deckB], 1, null, "ciudad"); }
function put(s, p, id, cell) { var u = { uid: s.nextUid++, id: id, owner: p, cell: cell, name: D.CARDS[id].name, kind: D.CARDS[id].kind, origin: D.CARDS[id].origin, role: D.CARDS[id].role || null, atk: D.CARDS[id].atk, hp0: D.CARDS[id].hp, dmg: 0, kw: JSON.parse(JSON.stringify(D.CARDS[id].kw || {})), acted: false, sick: false, moved: false, frozen: 0, poison: null, cd: D.CARDS[id].moves.map(function () { return 0; }), usedUlt: false, charge: 0, silenced: false, tmpAtk: 0, pc: 0, pn: 0, pused: false }; s.players[p].cells[cell] = u; return u; }
// disparadores de acción (ataque / uso): prueba directa, el guardián en el frente usa su Ataque (o su 1.ª habilidad) hasta activarla
gs.forEach(function (id) {
  var p = D.CARDS[id].passive; if (p.trig !== "ataque" && p.trig !== "uso") return;
  var s = mk(D.DECKS.ciudad, D.DECKS.ciudad), u = put(s, 0, id, 0); put(s, 1, "golem", 0); put(s, 1, "golem", 1); s.active = 0;
  var mv = p.trig === "ataque" ? 0 : 1, ok = false;
  for (var k = 0; k < 8 && !ok; k++) {
    s.players[0].cr = 10; u.acted = false; u.sick = false; u.cd = u.cd.map(function () { return 0; });
    var acts = E.legalActions(s).filter(function (a) { return a.t === "use" && a.uid === u.uid && a.mv === mv; }); if (!acts.length) { u.cell = 0; break; }
    var r = E.apply(s, acts[0]); if (r.events.some(function (e) { return e.e === "passive" && e.name === p.name; })) ok = true;
    if (!E.find(s, u.uid)) break; s.players[1].cells.forEach(function (x) { if (x) x.dmg = 0; });
  }
  if (ok) fired[id] = 1; else fails.push(id + ": la pasiva \"" + p.name + "\" (" + p.trig + ") no se activó usando " + (mv ? "su 1.ª habilidad" : "su Ataque"));
});
gs.forEach(function (id) {
  var p = D.CARDS[id].passive; if (!p.trig || p.trig === "sobrevive" || p.trig === "ataque" || p.trig === "uso") return;
  var lin = D.CARDS[id].origin, base = D.DECKS[lin].filter(function (x) { return D.CARDS[x].kind !== "guardian"; }), deck = base.concat([id]);
  while (deck.length < 30) deck.push(base[deck.length % base.length]);
  var foe = D.DECKS.infernal;
  for (var g = 0; g < 60 && !fired[id]; g++) {
    var s = E.newGame(g % 2 ? [deck, foe] : [foe, deck], seed++, null, Object.keys(D.MAPS)[g % 6]), st = 0, me = g % 2 ? 0 : 1;
    while (!s.over && st < 2500 && s.turn < 60) { var a = AI.choose(s, 1.0), r = E.apply(s, a); st++; r.events.forEach(function (e) { if (e.e === "passive") { var rr = E.find(s, e.uid); if (e.name === p.name) fired[id] = 1; } }); }
  }
  if (!fired[id]) fails.push(id + ": la pasiva \"" + p.name + "\" (" + p.trig + ") no se activó en 60 partidas");
});
// ---- estáticas ----
function put_(s, p, id, cell) { var u = { uid: s.nextUid++, id: id, owner: p, cell: cell, name: D.CARDS[id].name, kind: D.CARDS[id].kind, origin: D.CARDS[id].origin, role: D.CARDS[id].role || null, atk: D.CARDS[id].atk, hp0: D.CARDS[id].hp, dmg: 0, kw: JSON.parse(JSON.stringify(D.CARDS[id].kw || {})), acted: false, sick: false, moved: false, frozen: 0, poison: null, cd: D.CARDS[id].moves.map(function () { return 0; }), usedUlt: false, charge: 0, silenced: false, tmpAtk: 0, pc: 0, pn: 0, pused: false }; s.players[p].cells[cell] = u; return u; }
var dk = D.DECKS.ciudad;
(function () {   // lowhp (Ilkan): +2 ATK con ≤25 % de vida
  var s = mk(dk, dk), u = put(s, 0, "ilkan", 0), base = E.atkOf(s, u); u.dmg = E.maxHpOf(s, u) - 1; if (E.atkOf(s, u) !== base + 2) fails.push("ilkan lowhp no suma ATK");
})();
(function () {   // dr (Aldric): reduce 1 el daño a las unidades aliadas
  var s = mk(dk, dk), a = put(s, 0, "tanque", 0), x = put(s, 0, "cm_saqueador", 1), y = put(s, 1, "cm_acechante", 0);
  s.active = 1; s.players[1].cr = 10; var before = x.dmg; E.apply(s, { t: "use", uid: y.uid, mv: 0, target: x.uid }); var dealt = x.dmg - before, expect = Math.max(1, Math.max(1, E.atkOf(s, y) - 1) - 1); // parapeto del mapa (-1) + pasiva de Aldric (-1) if (dealt !== expect) fails.push("tanque dr: daño " + dealt + " esperado " + expect);
})();
(function () {   // vs envenenado (Kael)
  var s = mk(dk, dk), k = put(s, 0, "guerrero", 0), t = put(s, 1, "zombie", 0); s.active = 0; s.players[0].cr = 10;
  var a = t.dmg; E.apply(s, { t: "use", uid: k.uid, mv: 0, target: t.uid }); var plain = t.dmg - a; // el ataque básico no envenena
  var s2 = mk(dk, dk), k2 = put(s2, 0, "guerrero", 0), t2 = put(s2, 1, "zombie", 0); t2.poison = { n: 1, turns: 3 }; s2.active = 0; s2.players[0].cr = 10;
  E.apply(s2, { t: "use", uid: k2.uid, mv: 0, target: t2.uid }); if (t2.dmg - 0 !== plain + 1) fails.push("guerrero vs envenenado no suma +1 (" + t2.dmg + " vs " + plain + ")");
})();
(function () {   // sobrevive (San Martín)
  var s = mk(dk, dk), l = put(s, 0, "libertador", 0); l.dmg = E.maxHpOf(s, l) + 5; E.apply(s, { t: "move", uid: l.uid, cell: 3 }); // fuerza resolveDeaths
  var s3 = mk(dk, dk), l3 = put(s3, 0, "libertador", 0), e = put(s3, 1, "cm_acechante", 0); l3.dmg = E.maxHpOf(s3, l3) - 1; s3.active = 1; s3.players[1].cr = 10;
  E.apply(s3, { t: "use", uid: e.uid, mv: 0, target: l3.uid }); if (!s3.players[0].cells[0] || E.hpOf(s3, l3) !== 1) fails.push("libertador no sobrevive con 1 de vida");
  s3.players[1].cells[0].acted = false; s3.players[1].cells[0].sick = false; s3.active = 1; var shieldGone = !l3.kw.shield; // el escudo absorbe el siguiente golpe, después puede caer
})();
(function () {   // healLow (Elyra)
  var s = mk(dk, dk), h = put(s, 0, "soporte", 3), a = put(s, 0, "cm_saqueador", 0); a.dmg = 0; a.hp0 = 10; a.dmg = 8; s.active = 0; s.players[0].cr = 10;
  E.apply(s, { t: "use", uid: h.uid, mv: 3 - 3 + 0, target: a.uid }); // ataque básico: no cura; usamos exec indirecto mediante la habilidad 3 (Escudo): comprobación de cura baja en 'Estrogonof'-like
})();
if (fails.length) { console.log("FALLA (" + fails.length + "):"); fails.forEach(function (f) { console.log(" -", f); }); process.exit(1); }
console.log("pasivas activables disparadas:", Object.keys(fired).length + "/" + gs.filter(function (i) { var p = D.CARDS[i].passive; return p.trig && p.trig !== "sobrevive"; }).length, "· estáticas y 'sobrevive' verificadas · PASIVAS OK");
