"use strict";
/* engine.js v2 — motor determinista y SIN DOM de "La Horda: Cónclave" (duelo con posición + movimientos + mapas).
   Mismo archivo en el navegador (modo vs Bot) y en el servidor (online 1v1 autoritativo).
   Estado = JSON puro; toda la aleatoriedad sale de s.rng.
   TABLERO: 6 casillas por lado. Casillas 0-2 = fila de FRENTE, 3-5 = fila de FONDO (columna = casilla % 3).
   Cada unidad actúa UNA vez por turno eligiendo un movimiento (como en Pokémon): Ataque básico, 3 habilidades, definitiva.
   Movimientos CUERPO A CUERPO: solo desde la fila de frente y contra la fila de frente rival (con Provocar obligatorio);
   si el frente rival está vacío alcanzan el fondo y el Santuario. A DISTANCIA: cualquier fila, cualquier unidad (menos las
   que están en terreno "oscuridad"); al Santuario solo si el frente rival está vacío.
   Acciones: {t:"play",uid,cell?|target?} {t:"use",uid,mv,target?} {t:"move",uid,cell} {t:"end"}
   Objetivos: uid de unidad (número) o "f0"/"f1" (Santuario).                                                                 */
(function (root) {
  function createEngine(CARDS, MAPS, SUMMONER) {
    SUMMONER = SUMMONER || {};
    var E = { CARDS: CARDS, MAPS: MAPS, SUMMONER: SUMMONER, HAND_MAX: 8, HP: 40, CR_MAX: 10, CELLS: 6, MOVE_COST: 1 };
    var FRONT = [0, 1, 2], BACK = [3, 4, 5];
    function rowOf(c) { return c < 3 ? 0 : 1; }
    function colOf(c) { return c % 3; }
    E.rowOf = rowOf; E.colOf = colOf;

    function rand(s) {
      s.rng = (s.rng + 0x6D2B79F5) | 0;
      var t = Math.imul(s.rng ^ (s.rng >>> 15), 1 | s.rng);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    function rint(s, n) { return Math.floor(rand(s) * n); }
    E.rand = rand;
    function shuffle(s, a) { for (var i = a.length - 1; i > 0; i--) { var j = rint(s, i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function ev(s, o) { s.events.push(o); }
    function clone(s) { return JSON.parse(JSON.stringify(s)); }
    E.clone = clone;
    function units(s, p) { return s.players[p].cells.filter(Boolean); }
    E.units = units;

    E.newGame = function (decks, seed, names, mapId, opts) {
      var s = { seed: seed, rng: (seed >>> 0) || 1, turn: 0, active: 0, over: false, winner: null, nextUid: 1, events: [], map: mapId || "ciudad", pq: [],
        players: [0, 1].map(function (i) { return { name: (names && names[i]) || "Jugador " + (i + 1), hp: (opts && opts.hp && opts.hp[i]) || E.HP, maxHp: (opts && opts.hp && opts.hp[i]) || E.HP, maxCr: 0, cr: 0, deck: [], hand: [], cells: [null, null, null, null, null, null], fatigue: 0, traps: [], sk: ((opts && opts.sk && opts.sk[i]) || ["voz", "egida"]).slice(), skcd: [0, 0] }; }) };
      [0, 1].forEach(function (i) {
        var p = s.players[i];
        p.deck = shuffle(s, decks[i].map(function (id) { return { uid: s.nextUid++, id: id }; }));
        for (var k = 0; k < (i === 0 ? 3 : 5) + ((opts && opts.hand && opts.hand[i]) || 0); k++) p.hand.push(p.deck.pop());
      });
      s.players[1].hand.push({ uid: s.nextUid++, id: "chispa" });
      ((opts && opts.pre) || []).forEach(function (x) { var u = place(s, x.p, x.id, x.cell); u.sick = false; });   // p.ej. jefe ya en mesa
      startTurn(s, 0);
      return s;
    };
    E.mapOf = function (s) { return MAPS[s.map]; };

    // ---------- estadísticas efectivas (sinergia de linaje) ----------
    function synBonus(n) { return { atk: (n >= 2 ? 1 : 0) + (n >= 4 ? 1 : 0), hp: n >= 3 ? 1 : 0 }; }
    E.synBonus = synBonus;
    function synCount(s, u) { var n = 0; if (!u.origin) return 0; units(s, u.owner).forEach(function (x) { if (x.origin === u.origin) n++; }); return n; }
    function matchF(u, f) { if (!f) return true; if (f.tag && (u.tags || []).indexOf(f.tag) < 0) return false; if (f.token && !CARDS[u.id].token) return false; return true; }
    function hasStatus(u, st) { return st === "poison" ? !!u.poison : st === "frozen" ? !!(u.frozen || u.iced) : st === "burn" ? !!u.burn : false; }
    function pstat(u) { var p = CARDS[u.id].passive; return p && !u.silenced && p.stat ? p.stat : null; }
    function atkOf(s, u) {
      var a = u.atk + (u.tmpAtk || 0) + synBonus(synCount(s, u)).atk, st = pstat(u);
      if (st && st.k === "lowhp" && (u.hp0 + synBonus(synCount(s, u)).hp - u.dmg) <= (u.hp0 + synBonus(synCount(s, u)).hp) * st.pct) a += st.atk;
      if (st && st.k === "perTag") units(s, u.owner).forEach(function (x) { if (x !== u && (x.tags || []).indexOf(st.tag) >= 0) a += st.atk; });
      return Math.max(0, a);
    }
    function maxHpOf(s, u) { return u.hp0 + synBonus(synCount(s, u)).hp; }
    function hpOf(s, u) { return maxHpOf(s, u) - u.dmg; }
    E.atkOf = atkOf; E.hpOf = hpOf; E.maxHpOf = maxHpOf;
    function terrainOf(s, u) { var m = MAPS[s.map]; return (rowOf(u.cell) === 0 ? m.front : m.back) || null; }
    E.terrainOf = terrainOf;

    function mkUnit(s, id, owner, cell) {
      var c = CARDS[id], kw = JSON.parse(JSON.stringify(c.kw || {}));
      return { uid: s.nextUid++, id: id, owner: owner, cell: cell, name: c.name, kind: c.kind, origin: c.origin, role: c.role || null,
        atk: c.atk, hp0: c.hp, dmg: 0, kw: kw, acted: false, sick: !kw.rush, moved: false, frozen: 0, poison: null,
        cd: (c.moves || []).map(function () { return 0; }), usedUlt: false, charge: 0, silenced: false, tmpAtk: 0, pc: 0, pn: 0, pused: false, burn: null, tags: (c.tags || []).slice() };
    }
    function place(s, p, id, cell) { var u = mkUnit(s, id, p, cell); s.players[p].cells[cell] = u; return u; }
    function find(s, uid) {
      for (var p = 0; p < 2; p++) { var c = s.players[p].cells; for (var i = 0; i < 6; i++) if (c[i] && c[i].uid === uid) return { u: c[i], p: p, i: i }; }
      return null;
    }
    E.find = find;
    function faceOf(t) { return typeof t === "string" && t[0] === "f" ? parseInt(t[1], 10) : null; }

    // ---------- daño / curación ----------
    function hitFace(s, p, n) { if (n <= 0) return 0; s.players[p].hp -= n; ev(s, { e: "face", p: p, n: n }); return n; }
    function hitUnit(s, u, n) {
      if (n <= 0) return 0;
      var tr = terrainOf(s, u); if (tr && tr.t === "cover") n = Math.max(1, n - tr.n);
      var dr = 0; units(s, u.owner).forEach(function (a) {
        var st = pstat(a); if (!st || st.k !== "dr") return;
        if (st.cond === "token" && !units(s, a.owner).some(function (x) { return CARDS[x.id].token; })) return;
        if (st.scope === "allies" || (st.scope === "self" && a === u) || (st.scope === "row" && rowOf(a.cell) === rowOf(u.cell))) dr += st.n;
      });
      if (dr) n = Math.max(1, n - dr);
      if (u.kw.shield) { delete u.kw.shield; ev(s, { e: "shield", uid: u.uid }); return 0; }
      u.dmg += n; ev(s, { e: "dmg", uid: u.uid, n: n });
      var pp = CARDS[u.id].passive; if (pp && pp.trig === "golpeado") s.pq.push(u.uid);
      return n;
    }
    function healUnit(s, u, n) { var h = Math.min(n, u.dmg); u.dmg -= h; if (h) ev(s, { e: "heal", uid: u.uid, n: h }); return h; }
    function healFace(s, p, n) { var P = s.players[p], h = Math.min(n, (P.maxHp || E.HP) - P.hp); P.hp += h; if (h) ev(s, { e: "healface", p: p, n: h }); }
    function moveDamage(s, src, mult) {
      var n = Math.round(atkOf(s, src) * mult), tr = terrainOf(s, src);
      if (tr && tr.t === "amp") n += tr.n; if (tr && tr.t === "frost") n -= tr.n;
      return Math.max(1, n);
    }

    function checkWin(s) {
      var a = s.players[0].hp <= 0, b = s.players[1].hp <= 0;
      if (a || b) { s.over = true; s.winner = a && b ? -1 : a ? 1 : 0; ev(s, { e: "over", winner: s.winner }); }
    }
    function resolveDeaths(s) {
      for (var guard = 0; guard < 50; guard++) {
        for (var q = 0; q < 20 && s.pq.length; q++) { var uid = s.pq.shift(), rr = find(s, uid); if (rr && hpOf(s, rr.u) > 0) pFire(s, rr.u, "golpeado", null); }
        [0, 1].forEach(function (p) { units(s, p).forEach(function (u) {
          var pa = CARDS[u.id].passive;
          if (hpOf(s, u) <= 0 && pa && pa.trig === "sobrevive" && !u.pused && !u.silenced) { u.pused = true; u.dmg = maxHpOf(s, u) - 1; u.kw.shield = 1; ev(s, { e: "buff", uid: u.uid }); }
        }); });
        var dead = [];
        [0, 1].forEach(function (p) { units(s, p).forEach(function (u) { if (hpOf(s, u) <= 0) dead.push(u); }); });
        if (!dead.length) break;
        dead.forEach(function (u) { s.players[u.owner].cells[u.cell] = null; ev(s, { e: "die", uid: u.uid, id: u.id, p: u.owner, cell: u.cell }); });
        dead.forEach(function (u) { var c = CARDS[u.id]; if (c.ultimo && !u.silenced) exec(s, c.ultimo, { owner: u.owner, src: u }); });
        dead.forEach(function (d) { [0, 1].forEach(function (p) { units(s, p).forEach(function (a) { pFire(s, a, a.owner === d.owner ? "muerteAliada" : "muerteEnemiga", null, d); }); }); });
      }
      checkWin(s);
    }
    function pFire(s, u, trig, tgt, subject) {
      var p = CARDS[u.id].passive; if (!p || u.silenced || !p.ops && !p.cycle) return;
      if (p.filter && !(subject && matchF(subject, p.filter))) return;
      if (p.trig !== trig && !(p.trig === "muerte" && (trig === "muerteAliada" || trig === "muerteEnemiga"))) return;
      u.pc++; if (p.every && u.pc % p.every) return; if (p.max && u.pn >= p.max) return; u.pn++;
      ev(s, { e: "passive", uid: u.uid, name: p.name });
      exec(s, p.cycle ? p.cycle[(u.pn - 1) % p.cycle.length] : p.ops, { owner: u.owner, src: u, target: tgt });
    }
    // TRAMPAS: se colocan boca abajo (máx. 2) y se disparan solas cuando el rival hace algo que coincide con su condición
    function allyDeployed(s, nu) {
      units(s, nu.owner).forEach(function (a) { if (a !== nu) pFire(s, a, "despliegueAliado", nu.uid, nu); });
    }
    function fireTrap(s, defender, trig, targetUid) {
      var P = s.players[defender];
      for (var i = 0; i < P.traps.length; i++) {
        var d = CARDS[P.traps[i].id]; if (d.trig !== trig) continue;
        P.traps.splice(i, 1); ev(s, { e: "trap", p: defender, id: d.id, name: d.name });
        if (d.ops && d.ops.length) exec(s, d.ops, { owner: defender, src: null, target: targetUid });
        units(s, defender).forEach(function (a) { pFire(s, a, "trampaPropia", null, null); });
        return d;
      }
      return null;
    }
    function emptyCell(s, p) { var c = s.players[p].cells, i; for (i = 0; i < 6; i++) if (!c[i]) return i; return -1; }

    // ---------- operaciones ----------
    function sameRow(s, t) { return units(s, t.owner).filter(function (x) { return rowOf(x.cell) === rowOf(t.cell); }); }
    function targetsOf(s, to, ctx) {
      var me = ctx.owner, foe = 1 - me;
      switch (to) {
        case "target": {
          var f = faceOf(ctx.target); if (f !== null) return [{ face: f }];
          var r = find(s, ctx.target); return r ? [{ u: r.u }] : [];
        }
        case "targetRow": { var r1 = find(s, ctx.target); return r1 ? sameRow(s, r1.u).map(function (u) { return { u: u }; }) : []; }
        case "targetCol": {
          var r2 = find(s, ctx.target); if (!r2) return [];
          var o = s.players[r2.p].cells[(r2.u.cell + 3) % 6], l = [{ u: r2.u }]; if (o) l.push({ u: o }); return l;
        }
        case "self": return ctx.src ? [{ u: ctx.src }] : [];
        case "allyAll": return units(s, me).map(function (u) { return { u: u }; });
        case "enemyAll": return units(s, foe).map(function (u) { return { u: u }; });
        case "randEnemy": case "randAlly": {
          var cand = units(s, to === "randEnemy" ? foe : me).filter(function (u) { return u !== ctx.src; });
          return cand.length ? [{ u: cand[rint(s, cand.length)] }] : [];
        }
        case "allyTag": return units(s, me).filter(function (u) { return (u.tags || []).indexOf(ctx.tag) >= 0; }).map(function (u) { return { u: u }; });
        case "enemyFrozen": return units(s, foe).filter(function (u) { return u.frozen || u.iced; }).map(function (u) { return { u: u }; });
        case "enemyBurning": return units(s, foe).filter(function (u) { return u.burn; }).map(function (u) { return { u: u }; });
        case "enemyPoisoned": return units(s, foe).filter(function (u) { return u.poison; }).map(function (u) { return { u: u }; });   // v0.8 (esporas)
        case "enemyFace": return [{ face: foe }];
        case "allyFace": return [{ face: me }];
      }
      return [];
    }
    function swapRow(s, u) {
      var P = s.players[u.owner], to = (u.cell + 3) % 6, o = P.cells[to];
      P.cells[u.cell] = o; if (o) o.cell = u.cell; P.cells[to] = u; u.cell = to; ev(s, { e: "moved", uid: u.uid });
    }
    function exec(s, ops, ctx) {
      ops.forEach(function (op) {
        if (s.over) return;
        if (op.op === "draw") { for (var i = 0; i < op.n; i++) draw(s, ctx.owner); return; }
        if (op.op === "crystal") { var P = s.players[ctx.owner]; P.cr = Math.min(E.CR_MAX, P.cr + op.n); return; }
        if (op.op === "summon") {
          for (var k = 0; k < op.n; k++) {
            var cell = emptyCell(s, ctx.owner); if (cell < 0) break;
            var nu = place(s, ctx.owner, op.id, cell); ev(s, { e: "summon", uid: nu.uid, id: nu.id, p: ctx.owner, cell: cell }); allyDeployed(s, nu);
          }
          return;
        }
        if (op.op === "cdDown") { if (ctx.src) ctx.src.cd = ctx.src.cd.map(function (x) { return Math.max(0, x - op.n); }); return; }
        if (op.op === "swapRow") { if (ctx.src && s.players[ctx.src.owner].cells[ctx.src.cell] === ctx.src) swapRow(s, ctx.src); return; }
        ctx.tag = op.tag;
        if (op.op === "sacrifice") { var vic = units(s, ctx.owner).filter(function (x) { return CARDS[x.id].token; })[0]; if (vic) { vic.dmg += 999; ev(s, { e: "sacrifice", uid: vic.uid }); resolveDeaths(s); } else { ctx.fizzle = true; } return; }
        if (ctx.fizzle) return;
        targetsOf(s, op.to, ctx).forEach(function (t) {
          if (t.face !== undefined) {
            if (op.op === "dmg") { var nf = op.n !== undefined ? op.n : moveDamage(s, ctx.src, op.mult); hitFace(s, t.face, nf); }
            else if (op.op === "heal") healFace(s, t.face, op.n);
            return;
          }
          var u = t.u;
          switch (op.op) {
            case "dmg": {
              if (op.only && !hasStatus(u, op.only)) break;
              var n = op.n !== undefined ? op.n : moveDamage(s, ctx.src, op.mult);
              if (op.ifStatus && hasStatus(u, op.ifStatus.st)) n += op.ifStatus.n;
              var sp = ctx.src && pstat(ctx.src); if (sp && sp.k === "vs" && hasStatus(u, sp.st)) n += sp.n;
              var d = hitUnit(s, u, n);
              if (d && ctx.src) { if (ctx.src.kw.lifesteal) healFace(s, ctx.src.owner, d); if (ctx.src.kw.freezeHit && ctx.src.owner !== u.owner) u.frozen = Math.max(u.frozen, 1); }
              break;
            }
            case "heal": { var hn = op.n, hs = ctx.src && pstat(ctx.src); if (hs && hs.k === "healLow" && u.owner === ctx.owner && hpOf(s, u) <= maxHpOf(s, u) * 0.35) hn += hs.n; healUnit(s, u, hn); break; }
            case "buff":
              if (op.temp) u.tmpAtk += op.atk || 0; else { u.atk += op.atk || 0; u.hp0 += op.hp || 0; }
              ev(s, { e: "buff", uid: u.uid }); break;
            case "debuff": u.atk = Math.max(0, u.atk - (op.atk || 0)); u.hp0 -= op.hp || 0; ev(s, { e: "debuff", uid: u.uid }); break;
            case "give": u.kw[op.kw] = 1; if (op.kw === "rush") u.sick = false; ev(s, { e: "buff", uid: u.uid }); break;
            case "refresh": u.acted = false; ev(s, { e: "buff", uid: u.uid }); break;
            case "freeze": if (u.owner !== ctx.owner || op.to === "self") { u.frozen = Math.max(u.frozen, op.n); ev(s, { e: "freeze", uid: u.uid }); } break;
            case "burn": u.burn = { n: op.n, turns: op.turns }; ev(s, { e: "burn", uid: u.uid }); break;
            case "poison": u.poison = { n: op.n, turns: op.turns }; ev(s, { e: "poison", uid: u.uid }); break;
            case "silence": u.silenced = true; u.kw = {}; ev(s, { e: "silence", uid: u.uid }); break;
          }
        });
      });
      resolveDeaths(s);
    }

    function draw(s, p) {
      var P = s.players[p];
      if (!P.deck.length) { P.fatigue++; hitFace(s, p, P.fatigue); checkWin(s); return; }
      var c = P.deck.pop();
      if (P.hand.length >= E.HAND_MAX) { ev(s, { e: "burn", p: p, id: c.id }); return; }
      P.hand.push(c); ev(s, { e: "draw", p: p });
    }

    // ---------- turnos ----------
    function startTurn(s, p) {
      s.turn++; s.active = p;
      var P = s.players[p];
      P.maxCr = Math.min(E.CR_MAX, P.maxCr + 1); P.cr = P.maxCr;
      P.skcd = P.skcd.map(function (x) { return Math.max(0, x - 1); });
      units(s, p).forEach(function (u) {
        u.acted = false; u.moved = false; u.sick = false; u.iced = false;
        for (var i = 0; i < u.cd.length; i++) if (u.cd[i] > 0) u.cd[i]--;
        if (u.kind === "guardian") u.charge++;
        if (u.frozen > 0) { u.acted = true; u.iced = true; u.frozen--; ev(s, { e: "thaw", uid: u.uid }); }
        if (u.poison) { hitUnit(s, u, u.poison.n); u.poison.turns--; if (u.poison.turns <= 0) u.poison = null; }
        if (u.burn) { hitUnit(s, u, u.burn.n); u.burn.turns--; if (u.burn.turns <= 0) u.burn = null; }
      });
      units(s, p).forEach(function (u) { pFire(s, u, "inicio", null); });
      resolveDeaths(s);
      if (!s.over && s.turn > 1) draw(s, p);
      ev(s, { e: "turn", p: p, turn: s.turn });
    }
    function endTurn(s) {
      var p = s.active, m = MAPS[s.map];
      units(s, p).forEach(function (u) {
        u.tmpAtk = 0;
        var tr = terrainOf(s, u);
        if (tr && tr.t === "burn" && u.origin !== m.home) hitUnit(s, u, tr.n);
        if (tr && tr.t === "heal") healUnit(s, u, tr.n);
      });
      resolveDeaths(s);
      if (s.over) return;
      startTurn(s, 1 - p);
    }

    // ---------- legalidad ----------
    function targetList(s, spec, me) {
      var foe = 1 - me, out = [];
      function us(p, f) { units(s, p).forEach(function (u) { if (!f || f(u)) out.push(u.uid); }); }
      switch (spec) {
        case "enemyUnit": us(foe); break;
        case "enemyAny": us(foe); out.push("f" + foe); break;
        case "allyUnit": us(me); break;
        case "allyGuardian": us(me, function (u) { return u.kind === "guardian"; }); break;
        case "allyAny": us(me); out.push("f" + me); break;
      }
      return out;
    }
    // objetivos de un movimiento enemigo según alcance (la regla central de la posición)
    function enemyTargets(s, me, reach, allowFace) {
      var foe = 1 - me, C = s.players[foe].cells, out = [], front = FRONT.map(function (i) { return C[i]; }).filter(Boolean), back = BACK.map(function (i) { return C[i]; }).filter(Boolean);
      if (reach === "melee") {
        var taunts = front.filter(function (u) { return u.kw.taunt; });
        if (taunts.length) return taunts.map(function (u) { return u.uid; });
        (front.length ? front : back).forEach(function (u) { out.push(u.uid); });
      } else {
        front.concat(back).forEach(function (u) { var tr = terrainOf(s, u); if (!(tr && tr.t === "dark")) out.push(u.uid); });
      }
      if (allowFace && !front.length) out.push("f" + foe);
      return out;
    }
    E.enemyTargets = enemyTargets;
    E.moveCost = function (s, u, mv) {
      var m = CARDS[u.id].moves[mv], tr = terrainOf(s, u);
      return m.cost + (!m.basic && tr && tr.t === "slow" ? tr.n : 0);
    };
    E.moveCdTurns = function (s, m) { return m.cd + (MAPS[s.map].cdPlus || 0); };
    // por qué no se puede usar (para la interfaz); null = se puede
    E.whyNot = function (s, u, mv) {
      var P = s.players[u.owner], m = CARDS[u.id].moves[mv], c = CARDS[u.id];
      if (s.active !== u.owner) return "no es tu turno";
      if (u.sick) return "recién llegó (mareada)"; if (u.iced) return "congelada";
      if (u.acted) return "ya actuó este turno";
      if (u.silenced && !m.basic) return "silenciada";
      if (m.ult) { if (u.usedUlt) return "ya usada"; var need = c.ultNeed || 3; if (u.charge < need) return "carga " + u.charge + "/" + need; }
      else if (u.cd[mv] > 0) return "enfriamiento " + u.cd[mv];
      if (P.cr < E.moveCost(s, u, mv)) return "faltan cristales";
      if (m.tgt === "enemy") {
        if (m.reach === "melee" && u.cell >= 3) return "cuerpo a cuerpo: pasá a la fila de frente";
        if (!enemyTargets(s, u.owner, m.reach, !!m.basic).length) return "sin objetivos";
      }
      if (m.tgt === "ally" && !units(s, u.owner).length) return "sin aliados";
      return null;
    };
    E.legalActions = function (s, opt) {
      var out = [], compact = opt && opt.compact;
      if (s.over) return out;
      var me = s.active, P = s.players[me];
      P.hand.forEach(function (c) {
        var d = CARDS[c.id]; if (d.cost > P.cr) return;
        if (d.type === "unit") {
          var seenRow = {};
          for (var i = 0; i < 6; i++) if (!P.cells[i]) { if (compact && seenRow[rowOf(i)]) continue; seenRow[rowOf(i)] = 1; out.push({ t: "play", uid: c.uid, cell: i }); }
          return;
        }
        if (d.req === "token" && !units(s, me).some(function (u) { return CARDS[u.id].token; })) return;
        if (d.type === "trap") { if (P.traps.length < 2) out.push({ t: "play", uid: c.uid }); return; }
        if (d.target === "none") { out.push({ t: "play", uid: c.uid }); return; }
        targetList(s, d.target, me).forEach(function (tg) { out.push({ t: "play", uid: c.uid, target: tg }); });
      });
      units(s, me).forEach(function (u) {
        var c = CARDS[u.id];
        c.moves.forEach(function (m, mv) {
          if (E.whyNot(s, u, mv)) return;
          if (m.tgt === "enemy") enemyTargets(s, me, m.reach, !!m.basic).forEach(function (tg) { out.push({ t: "use", uid: u.uid, mv: mv, target: tg }); });
          else if (m.tgt === "ally") units(s, me).forEach(function (a) { out.push({ t: "use", uid: u.uid, mv: mv, target: a.uid }); });
          else out.push({ t: "use", uid: u.uid, mv: mv });
        });
        if (!u.moved && P.cr >= E.MOVE_COST) {
          var seen = {};
          for (var i = 0; i < 6; i++) {
            if (i === u.cell) continue; var o = P.cells[i];
            if (compact) { var key = rowOf(i) + (o ? "o" : "e"); if (seen[key]) continue; seen[key] = 1; }
            out.push({ t: "move", uid: u.uid, cell: i });
          }
        }
      });
      P.sk.forEach(function (id, i) {
        var m = SUMMONER[id]; if (!m || E.sumWhyNot(s, me, i)) return;
        if (m.tgt === "none") out.push({ t: "sum", i: i });
        else if (m.tgt === "allyUnit") units(s, me).forEach(function (u) { out.push({ t: "sum", i: i, target: u.uid }); });
        else if (m.tgt === "allyActed") units(s, me).forEach(function (u) { if (u.acted && !u.iced) out.push({ t: "sum", i: i, target: u.uid }); });
        else if (m.tgt === "enemyUnit") units(s, 1 - me).forEach(function (u) { out.push({ t: "sum", i: i, target: u.uid }); });
        else if (m.tgt === "move") units(s, me).forEach(function (u) {
          var seen = {};
          for (var c = 0; c < 6; c++) { if (c === u.cell) continue; if (compact) { var key = rowOf(c) + (P.cells[c] ? "o" : "e"); if (seen[key]) continue; seen[key] = 1; } out.push({ t: "sum", i: i, uid: u.uid, cell: c }); }
        });
      });
      out.push({ t: "end" });
      return out;
    };
    E.sumWhyNot = function (s, p, i) {
      var P = s.players[p], m = SUMMONER[P.sk[i]]; if (!m) return "sin habilidad";
      if (s.active !== p) return "no es tu turno"; if (P.skcd[i] > 0) return "enfriamiento " + P.skcd[i]; if (P.cr < m.cost) return "faltan cristales";
      if (m.tgt === "enemyUnit" && !units(s, 1 - p).length) return "sin objetivos";
      if ((m.tgt === "allyUnit" || m.tgt === "move") && !units(s, p).length) return "sin aliados";
      if (m.tgt === "allyActed" && !units(s, p).some(function (u) { return u.acted && !u.iced; })) return "ninguna unidad ya actuó";
      return null;
    };

    // ---------- aplicar acción (muta s) ----------
    E.apply = function (s, a) {
      s.events = [];
      if (s.over) return { ok: false, error: "partida terminada" };
      var me = s.active, P = s.players[me];
      if (a.t === "end") { endTurn(s); return { ok: true, events: s.events }; }
      if (a.t === "play") {
        var hi = -1; for (var i = 0; i < P.hand.length; i++) if (P.hand[i].uid === a.uid) hi = i;
        if (hi < 0) return { ok: false, error: "carta no está en mano" };
        var card = P.hand[hi], d = CARDS[card.id];
        P.hand.splice(hi, 1); P.cr -= d.cost;
        ev(s, { e: "play", p: me, id: card.id });
        if (d.type === "unit") {
          var u = place(s, me, card.id, a.cell); ev(s, { e: "summon", uid: u.uid, id: u.id, p: me, cell: a.cell }); allyDeployed(s, u);
          if (d.ingreso) exec(s, d.ingreso, { owner: me, src: u }); else resolveDeaths(s);
          if (!s.over && P.cells[a.cell] === u) fireTrap(s, 1 - me, "despliegue", u.uid);
        } else if (d.type === "trap") { P.traps.push({ uid: card.uid, id: card.id }); ev(s, { e: "trapSet", p: me });
        } else {
          var spellCancel = false;
          if (d.cat === "hechizo" || d.cat === "maldicion") { var tr0 = fireTrap(s, 1 - me, "hechizo", null); if (tr0 && tr0.cancel) spellCancel = true; }
          if (!spellCancel && !s.over) exec(s, d.ops, { owner: me, src: null, target: a.target });
        }
        return { ok: true, events: s.events };
      }
      if (a.t === "sum") {
        var sm = SUMMONER[P.sk[a.i]]; P.cr -= sm.cost; P.skcd[a.i] = sm.cd;
        ev(s, { e: "sum", p: me, name: sm.name, target: a.target === undefined ? null : a.target });
        if (sm.tgt === "move") {
          var mu = find(s, a.uid).u, mo = P.cells[a.cell], mf = mu.cell; P.cells[mf] = mo; if (mo) mo.cell = mf; P.cells[a.cell] = mu; mu.cell = a.cell; ev(s, { e: "moved", uid: mu.uid, from: mf, cell: a.cell });
        } else exec(s, sm.ops, { owner: me, src: null, target: a.target });
        return { ok: true, events: s.events };
      }
      var r = find(s, a.uid); if (!r || r.p !== me) return { ok: false, error: "unidad inválida" };
      var un = r.u;
      if (a.t === "move") {
        P.cr -= E.MOVE_COST; un.moved = true;
        var o = P.cells[a.cell], from = un.cell;
        P.cells[from] = o; if (o) o.cell = from; P.cells[a.cell] = un; un.cell = a.cell;
        ev(s, { e: "moved", uid: un.uid, from: from, cell: a.cell });
        return { ok: true, events: s.events };
      }
      if (a.t === "use") {
        var m = CARDS[un.id].moves[a.mv];
        P.cr -= E.moveCost(s, un, a.mv); un.acted = true;
        if (m.ult) un.usedUlt = true; else un.cd[a.mv] = E.moveCdTurns(s, m) - 0;
        ev(s, { e: "use", uid: un.uid, mv: a.mv, name: m.name, target: a.target === undefined ? null : a.target, ult: !!m.ult });
        var cancelled = false, trp = null;
        if (m.tgt === "enemy" && a.target !== undefined) {
          trp = faceOf(a.target) === 1 - me ? fireTrap(s, 1 - me, "ataqueFace", un.uid) : fireTrap(s, 1 - me, "ataque", un.uid);
          if (!trp && !m.basic) trp = fireTrap(s, 1 - me, "habilidad", un.uid);
          if (trp && trp.cancel) cancelled = true;
          if (s.players[me].cells[un.cell] !== un) cancelled = true;   // el atacante cayó por la trampa
        }
        if (cancelled) { ev(s, { e: "cancel", uid: un.uid }); return { ok: true, events: s.events }; }
        exec(s, m.ops, { owner: me, src: un, target: a.target });
        if (!s.over && s.players[me].cells[un.cell] === un) pFire(s, un, m.basic ? "ataque" : "uso", a.target);
        return { ok: true, events: s.events };
      }
      return { ok: false, error: "acción desconocida" };
    };
    E.isLegal = function (s, a) { var k = JSON.stringify(a); return E.legalActions(s).some(function (x) { return JSON.stringify(x) === k; }); };
    E.view = function (s, p) {
      var v = clone(s); delete v.rng; delete v.seed;
      var q = v.players[1 - p];
      q.handCount = q.hand.length; q.hand = q.hand.map(function () { return null; }); q.deckCount = q.deck.length; q.deck = [];
      var m = v.players[p]; m.deckCount = m.deck.length; m.deck = [];
      q.traps = q.traps.map(function (x) { return { uid: x.uid }; });   // las trampas rivales son secretas
      v.you = p; return v;
    };
    return E;
  }
  if (typeof module !== "undefined") module.exports = createEngine; else root.createHordaEngine = createEngine;
})(typeof window !== "undefined" ? window : globalThis);
