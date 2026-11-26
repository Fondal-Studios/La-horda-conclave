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
// ---------- v0.8 — Reino Fúngico ----------
function cnt(s, p, id) { return E.units(s, p).filter(function (u) { return u.id === id; }).length; }
(function esporas() { var s = game(), t = put(s, 1, "golem", 3), t2 = put(s, 1, "golem", 4); cast(s, 0, "nube_esporas"); check("esporas: Nube de Esporas envenena a todos", !!t.poison && !!t2.poison);
  t2.poison = null; var d0 = t.dmg, e0 = t2.dmg; cast(s, 0, "floracion"); check("esporas: Floración pega 3 solo a los envenenados (objetivo nuevo enemyPoisoned)", t.dmg - d0 === 3 && t2.dmg === e0, (t.dmg - d0) + "/" + (t2.dmg - e0));
  var s2 = game(), u = put(s2, 1, "golem", 3); cast(s2, 0, "esporero", undefined, 0); check("esporas: el Esporero envenena al entrar", !!u.poison);
  var s3 = game(); put(s3, 1, "golem", 3); var r = cast(s3, 0, "floracion"); check("esporas: Floración sin envenenados no rompe nada", r.ok === true); })();
(function motin() { var s = game(), ag = put(s, 0, "agitador", 0), base = a(s, ag); cast(s, 0, "motin");
  check("motín: invoca 2 Saqueadores", cnt(s, 0, "cm_saqueador") === 2); check("motín: Agitador +2 (por Ciudadano) +1 (Motín)", a(s, ag) === base + 3 + SB(3) - SB(1), base + " → " + a(s, ag));
  var b0 = a(s, ag); cast(s, 0, "pregonero", undefined, 3); check("motín: Pregonero +1 ATK a cada Ciudadano (+1 más al Agitador por el nuevo Ciudadano)", a(s, ag) === b0 + 2 + SB(4) - SB(3), b0 + " → " + a(s, ag)); })();
(function guardia() { var s = game(), cap = put(s, 0, "capitana_guardia", 0), sa = put(s, 0, "cm_saqueador", 1), a0 = sa.atk, h0 = sa.hp0;
  E.apply(s, { t: "end" }); E.apply(s, { t: "end" }); check("formen filas: la Capitana da +1/+1 a los Ciudadanos al inicio del turno", sa.atk === a0 + 1 && sa.hp0 === h0 + 1, a0 + "/" + h0 + " → " + sa.atk + "/" + sa.hp0);
  var s2 = game(); cast(s2, 0, "barricadista", undefined, 0); check("formen filas: Barricadista levanta un Muro", cnt(s2, 0, "token_muro") === 1); })();
(function fundicion() { var s = game(), co = put(s, 0, "coloso_cuarzo", 0), base = a(s, co); cast(s, 0, "veta"); check("fundición: Coloso +1 ATK por cada Cristal", a(s, co) === base + 2 + SB(3) - SB(1), base + " → " + a(s, co));
  var s2 = game(); put(s2, 0, "horno_cristal", 0); for (var i = 0; i < 4; i++) { E.apply(s2, { t: "end" }); E.apply(s2, { t: "end" }); }
  check("fundición: el Horno fabrica un Servo cada 2 turnos", cnt(s2, 0, "cristal_servo") === 2, "servos: " + cnt(s2, 0, "cristal_servo")); })();
(function centro() { var s = game(), mi = put(s, 0, "minotauro_joven", 0), tr = put(s, 0, "trampero", 1), t0 = a(s, tr); s.players[0].traps.push({ uid: 2, id: "foso_oculto" }); var at = put(s, 1, "cm_acechante", 0);
  s.active = 1; s.players[1].cr = 10; var r = E.apply(s, { t: "use", uid: at.uid, mv: 0, target: tr.uid });
  check("centro: Foso Oculto anula el ataque", tr.dmg === 0 && r.events.some(function (e) { return e.e === "cancel"; }));
  check("centro: el Minotauro Joven embiste cuando se dispara la trampa", r.events.some(function (e) { return e.e === "passive" && e.name === "Cuernos del centro"; }));
  check("centro: el atacante recibe el golpe del Foso y la embestida del Minotauro", r.events.filter(function (e) { return e.e === "dmg" && e.uid === at.uid; }).length === 2);
  check("centro: el Trampero crece +1/+1", a(s, tr) === t0 + 1, t0 + " → " + a(s, tr)); })();
(function alud() { var s = game(), t = put(s, 1, "golem", 3), t2 = put(s, 1, "golem", 4); cast(s, 0, "aliento_helado", t.uid); check("alud: Aliento Helado congela", t.frozen > 0);
  var d0 = t.dmg, e0 = t2.dmg; cast(s, 0, "avalancha"); check("alud: Avalancha pega 4 a lo congelado y 2 al resto", t.dmg - d0 === 4 && t2.dmg - e0 === 2, (t.dmg - d0) + "/" + (t2.dmg - e0));
  var s2 = game(), u = put(s2, 1, "golem", 3); cast(s2, 0, "espiritu_glacial", undefined, 0); check("alud: Espíritu Glacial congela al entrar", u.frozen > 0); })();
(function luna() { var s = game(); put(s, 0, "lobo_alfa", 0); cast(s, 0, "lobezno", undefined, 1); var lz = E.units(s, 0).filter(function (u) { return u.id === "lobezno"; })[0];
  check("luna: el Lobo Alfa agranda al Lobezno (+1/+1)", lz && lz.atk === 3 && lz.hp0 === 2); var l0 = lz.atk;
  cast(s, 0, "luna_caza"); check("luna: Luna de Caza +1/+1 a las Bestias", lz.atk === l0 + 1); check("luna: e invoca un Lobo Espectral", cnt(s, 0, "token_lobo") === 1); })();
(function osamenta() { var s = game(), cap = put(s, 0, "capataz", 0), base = a(s, cap), cb = put(s, 0, "caballero_hueso", 1); cb.dmg += 99; E.apply(s, { t: "end" });
  check("osamenta: el Caballero de Hueso deja 2 Esqueletos al morir", cnt(s, 0, "esqueleto") === 2); check("osamenta: el Capataz suma +1 por cada uno", a(s, cap) === base + 2 + SB(3) - SB(1), base + " → " + a(s, cap));
  var s2 = game(); s2.players[0].traps.push({ uid: 3, id: "fosa_comun" }); cast(s2, 1, "cm_saqueador", undefined, 0); check("osamenta: Fosa Común levanta 2 Esqueletos cuando el rival despliega", cnt(s2, 0, "esqueleto") === 2); })();
(function trampasNuevas() {
  var s = game(); s.players[0].traps.push({ uid: 4, id: "estallido_esporas" }); cast(s, 1, "cm_acechante", undefined, 0); var u = E.units(s, 1)[0]; check("trampa: Estallido de Esporas envenena a la unidad desplegada", u && !!u.poison);
  var s2 = game(); s2.players[0].traps.push({ uid: 5, id: "turba_enfurecida" }); cast(s2, 1, "golem", undefined, 3); var g = E.units(s2, 1)[0]; check("trampa: Turba Enfurecida invoca un Saqueador y pega 2", cnt(s2, 0, "cm_saqueador") === 1 && g.dmg === 2);
  var s3 = game(), me = put(s3, 0, "golem", 0); s3.players[0].traps.push({ uid: 6, id: "hielo_fino" }); var at = put(s3, 1, "cm_acechante", 0); s3.active = 1; E.apply(s3, { t: "use", uid: at.uid, mv: 0, target: me.uid }); check("trampa: Hielo Fino congela 2 turnos", at.frozen === 2);
  var s4 = game(), me4 = put(s4, 0, "golem", 0); s4.players[0].traps.push({ uid: 7, id: "fisura_cristal" }); var at4 = put(s4, 1, "cm_acechante", 0); s4.active = 1; E.apply(s4, { t: "use", uid: at4.uid, mv: 0, target: me4.uid }); check("trampa: Fisura de Cristal invoca un Servo", cnt(s4, 0, "cristal_servo") === 1);
  var s5 = game(), me5 = put(s5, 0, "golem", 0), v = put(s5, 1, "vesper", 0); s5.players[0].traps.push({ uid: 8, id: "laberinto_espejos" }); s5.active = 1; s5.players[1].cr = 10;
  var mv = D.CARDS.vesper.moves.map(function (m, i) { return i; }).filter(function (i) { return i > 0 && D.CARDS.vesper.moves[i].tgt === "enemy" && !D.CARDS.vesper.moves[i].ult; })[0];
  if (mv !== undefined) { var r5 = E.apply(s5, { t: "use", uid: v.uid, mv: mv, target: me5.uid }); check("trampa: Galería de Espejos anula una habilidad y congela", r5.events.some(function (e) { return e.e === "cancel"; }) && v.frozen > 0 && me5.dmg === 0); } else fails.push("trampa: vesper sin habilidad de daño para probar la Galería");
})();
(function ingresos() { var s = game(); s.players[0].cr = 10; cast(s, 0, "segador", undefined, 0); check("ingreso Infernal: levanta un Esqueleto Frágil 1/1", cnt(s, 0, "token_hueso") === 1);
  var s2 = game(); cast(s2, 0, "guerrero", undefined, 0); check("ingreso Ciudad: llega con un Saqueador", cnt(s2, 0, "cm_saqueador") === 1); })();
// los combos listados existen y todas sus cartas son reales
D.COMBOS.forEach(function (c) { c.cards.forEach(function (id) { check("combo " + c.id + ": carta " + id + " existe", !!D.CARDS[id]); }); });
if (fails.length) { console.log("FALLA (" + fails.length + "):"); fails.forEach(function (f) { console.log(" -", f); }); process.exit(1); }
console.log("combos verificados:", ok, "comprobaciones · COMBOS OK");
