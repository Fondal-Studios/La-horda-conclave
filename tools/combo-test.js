"use strict";
/* tools/combo-test.js — comprueba que cada COMBO de data.js funciona de verdad en el motor (no solo en el texto). */
var D = require("../data.js"), E = require("../engine.js")(D.CARDS, D.MAPS, D.SUMMONER), fails = [], ok = 0;
function game() { return E.newGame([D.DECKS.ciudad, D.DECKS.ciudad], 3, null, "ciudad"); }
var uid = 5000;
function hand(s, p, id) { var c = { uid: uid++, id: id }; s.players[p].hand.push(c); return c; }
function put(s, p, id, cell) { var c = D.CARDS[id]; var u = { uid: uid++, id: id, owner: p, cell: cell, name: c.name, kind: c.kind, origin: c.origin, role: c.role || null, atk: c.atk, hp0: c.hp, dmg: 0, kw: JSON.parse(JSON.stringify(c.kw || {})), acted: false, sick: false, moved: false, frozen: 0, poison: null, cd: c.moves.map(function () { return 0; }), usedUlt: false, charge: 0, silenced: false, tmpAtk: 0, pc: 0, pn: 0, pused: false, burn: null, tags: (c.tags || []).slice() }; s.players[p].cells[cell] = u; return u; }
function cast(s, p, id, target, cell) { s.active = p; s.players[p].cr = 10; var c = hand(s, p, id), a = { t: "play", uid: c.uid }; if (target !== undefined) a.target = target; if (cell !== undefined) a.cell = cell; if (!E.isLegal(s, a)) return { ok: false, illegal: true }; return E.apply(s, a); }
function check(name, cond, info) { if (cond) ok++; else fails.push(name + (info ? " — " + info : "")); }
var SB = function (n) { return E.synBonus(n).atk; };
var a = function (s, u) { return E.atkOf(s, u); }, h = function (s, u) { return E.hpOf(s, u); };

(function manadaAlfa() { var s = game(), al = put(s, 0, "lobo_alfa", 0); cast(s, 0, "manada", undefined);
  var lobos = E.units(s, 0).filter(function (u) { return u.id === "token_lobo"; }); check("manada+alfa: invoca 2 lobos", lobos.length === 2);
  check("manada+alfa: cada lobo recibe +1/+1", lobos.every(function (l) { return a(s, l) >= 4 && h(s, l) >= 3; }), lobos.map(function (l) { return a(s, l) + "/" + h(s, l); }).join(",")); })();
(function rugido() { var s = game(), b = put(s, 0, "bestia_bosque", 0); b.sick = true; b.exhausted = true; var a0 = a(s, b); cast(s, 0, "rugido");
  check("rugido: +2 ATK a Bestias", a(s, b) === a0 + 2); check("rugido: da Rápido", !!b.kw.rush && !b.sick); })();
(function incendio() { var s = game(), t = put(s, 1, "golem", 3), t2 = put(s, 1, "golem", 4); cast(s, 0, "chispa_ignea", t.uid); check("incendio: Chispa quema", !!t.burn);
  var d0 = t.dmg; cast(s, 0, "combustion", t.uid); check("incendio: Combustión pega 5 a quien arde", t.dmg - d0 === 5, "pegó " + (t.dmg - d0));
  var e0 = t2.dmg; cast(s, 0, "combustion", t2.uid); check("incendio: Combustión pega solo 2 si no arde", t2.dmg - e0 === 2); })();
(function pira() { var s = game(), t = put(s, 1, "golem", 3), t2 = put(s, 1, "golem", 4); cast(s, 0, "imp", undefined, 0); check("pira: Imp prende a un enemigo", E.units(s, 1).some(function (u) { return u.burn; }));
  var burning = E.units(s, 1).filter(function (u) { return u.burn; })[0], other = E.units(s, 1).filter(function (u) { return !u.burn; })[0]; var d0 = burning.dmg, o0 = other ? other.dmg : 0; cast(s, 0, "pira");
  check("pira: Pira daña solo a lo que arde", burning.dmg - d0 === 3 && (!other || other.dmg === o0)); })();
(function pirotecnia() { var s = game(), t = put(s, 1, "golem", 3), p = put(s, 0, "piromante", 0); s.active = 0; s.players[0].cr = 10; var d0 = t.dmg; E.apply(s, { t: "use", uid: p.uid, mv: 0, target: t.uid }); var plain = t.dmg - d0;
  var s2 = game(), t2 = put(s2, 1, "golem", 3), p2 = put(s2, 0, "piromante", 0); t2.burn = { n: 1, turns: 3 }; s2.active = 0; s2.players[0].cr = 10; E.apply(s2, { t: "use", uid: p2.uid, mv: 0, target: t2.uid });
  check("piromante: +2 de daño contra unidades en llamas", t2.dmg === plain + 2, t2.dmg + " vs " + plain); })();
(function huesos() { var s = game(), cap = put(s, 0, "capataz", 0), base = a(s, cap); cast(s, 0, "osario"); check("huesos: Capataz suma 1 ATK por cada Esqueleto", a(s, cap) === base + 2 + SB(3) - SB(1), base + " → " + a(s, cap));
  var rey = put(s, 0, "rey_esqueleto", 1), r0 = rey.atk, esq = E.units(s, 0).filter(function (u) { return u.id === "esqueleto"; })[0]; esq.dmg += 99; E.apply(s, { t: "end" }); // fuerza resolver muertes
  check("huesos: Rey Esqueleto crece cuando cae un Esqueleto", rey.atk === r0 + 1, r0 + " → " + rey.atk); })();
(function quiebre() { var s = game(), t = put(s, 1, "golem", 3), t2 = put(s, 1, "golem", 4); cast(s, 0, "escarcha", t.uid); var d0 = t.dmg; cast(s, 0, "quebrar", t.uid); check("quiebre: Quebrar pega 5 a lo congelado", t.dmg - d0 === 5, "pegó " + (t.dmg - d0));
  t2.frozen = 1; var e0 = t2.dmg; cast(s, 0, "rompehielos", undefined, 0); check("quiebre: Rompehielos daña 3 a los congelados", t2.dmg - e0 === 3); })();
(function invierno() { var s = game(), t = put(s, 1, "golem", 3), rq = put(s, 0, "reina_escarcha", 0); var f = 0; for (var i = 0; i < 6; i++) { s.active = 1; E.apply(s, { t: "end" }); if (E.units(s, 1).some(function (u) { return u.frozen || u.iced; })) f++; s.active = 0; E.apply(s, { t: "end" }); }
  check("reina de escarcha: congela cada 2 turnos (máx. 3)", f >= 1, "turnos con congelado: " + f); })();
(function turba() { var s = game(), ag = put(s, 0, "agitador", 0), base = a(s, ag); put(s, 0, "cm_saqueador", 1); put(s, 0, "cm_raptor", 2); check("turba: Agitador suma ATK por cada Ciudadano", a(s, ag) === base + 2 + SB(3) - SB(1), base + " → " + a(s, ag));
  put(s, 0, "lider_turba", 3); cast(s, 0, "cm_planidera", undefined, 4); var pl = E.units(s, 0).filter(function (u) { return u.id === "cm_planidera"; })[0]; check("turba: Líder de la Turba da Rápido a un Ciudadano desplegado", pl && !!pl.kw.rush);
  var b0 = a(s, ag); cast(s, 0, "estampida"); check("turba: Estampida +2 ATK", a(s, ag) === b0 + 2); })();
(function cristal() { var s = game(), cr = put(s, 0, "cristal_resonante", 0), base = a(s, cr); cast(s, 0, "veta"); check("cristal: Veta invoca 2 Cristales y Resonante gana +2 ATK", a(s, cr) === base + 2 + SB(3) - SB(1), base + " → " + a(s, cr)); })();
(function chatarra() { var s = game(), t = put(s, 1, "golem", 3); var r = cast(s, 0, "sobrecarga", t.uid); check("chatarra: Sobrecarga es ilegal sin invocaciones", r.illegal === true);
  var ing = put(s, 0, "ingeniero", 0); cast(s, 0, "muro_piedra"); var muro = E.units(s, 0).filter(function (u) { return u.id === "token_muro"; })[0]; check("chatarra: Ingeniero mejora la invocación (+1/+1)", muro && h(s, muro) === 5, muro && h(s, muro));
  var d0 = t.dmg; cast(s, 0, "sobrecarga", t.uid); check("chatarra: Sobrecarga sacrifica la invocación y pega 4", t.dmg - d0 === 4 && !E.units(s, 0).some(function (u) { return u.id === "token_muro"; })); })();
(function laberinto() { var s = game(), ca = put(s, 0, "cartografo", 0), g = put(s, 0, "guardia_laberinto", 1); g.dmg = 3; s.players[0].traps.push({ uid: 1, id: "espinas" }); var atk = put(s, 1, "cm_acechante", 0); var hand0 = s.players[0].hand.length;
  s.active = 1; s.players[1].cr = 10; E.apply(s, { t: "use", uid: atk.uid, mv: 0, target: ca.uid });
  check("laberinto: la trampa dispara el robo del Cartógrafo", s.players[0].hand.length === hand0 + 1, hand0 + " → " + s.players[0].hand.length); check("laberinto: la trampa cura al Guardia", g.dmg === 0, "daño " + g.dmg); })();
// los combos listados existen y todas sus cartas son reales
D.COMBOS.forEach(function (c) { c.cards.forEach(function (id) { check("combo " + c.id + ": carta " + id + " existe", !!D.CARDS[id]); }); });
if (fails.length) { console.log("FALLA (" + fails.length + "):"); fails.forEach(function (f) { console.log(" -", f); }); process.exit(1); }
console.log("combos verificados:", ok, "comprobaciones · COMBOS OK");
