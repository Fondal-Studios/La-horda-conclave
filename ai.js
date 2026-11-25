"use strict";
/* ai.js v2 — bot voraz de 1 jugada: simula cada acción legal (versión compacta) sobre un clon y elige la de mejor
   evaluación; termina el turno cuando nada mejora. Valora la POSICIÓN (cuerpo a cuerpo adelante, distancia atrás,
   frente vacío = Santuario expuesto). Sirve de rival en el navegador y de jugador de pruebas en tools/gate.js. */
(function (root) {
  function createAI(E) {
    var CARDS = E.CARDS;
    function boardVal(s, p) {
      var v = 0, units = E.units(s, p), frontCount = 0;
      units.forEach(function (u) {
        var a = E.atkOf(s, u), h = Math.max(0, E.hpOf(s, u)), c = CARDS[u.id], melee = c.reach === "melee", front = E.rowOf(u.cell) === 0;
        v += a * 1.5 + h * 1.0;
        if (u.kw.taunt) v += front ? 1.8 : 0.2; if (u.kw.shield) v += 1.5; if (u.kw.lifesteal) v += 1.2;
        if (u.frozen) v -= a * 0.8; if (u.poison) v -= u.poison.n * u.poison.turns * 0.5;
        if (u.kind === "guardian") v += 3 + (u.usedUlt ? 0 : 1.5);
        if (melee && !front && c.moves.length) v -= 1.6;              // un cuerpo a cuerpo atrás no pega
        if (!melee && front && u.kind === "guardian") v -= 0.8;       // un tirador adelante está expuesto
        if (front) frontCount++;
        var tr = E.terrainOf(s, u); if (tr) { if (tr.t === "burn") v -= 1.2; if (tr.t === "heal") v += 0.8; if (tr.t === "cover") v += 0.8; if (tr.t === "amp") v += 1; if (tr.t === "dark") v += 0.8; }
      });
      if (!frontCount && units.length) v -= 5;                         // sin frente, el Santuario queda expuesto
      return v;
    }
    function evalState(s, me) {
      if (s.over) return s.winner === me ? 1e5 : s.winner === -1 ? 0 : -1e5;
      var A = s.players[me], B = s.players[1 - me], sc = (A.hp - B.hp) * 2.4;
      if (A.hp <= 12) sc -= (13 - A.hp) * 3.5;
      if (B.hp <= 12) sc += (13 - B.hp) * 3.5;
      sc += boardVal(s, me) - boardVal(s, 1 - me);
      sc += (A.hand.length - B.hand.length) * 1.1;
      return sc;
    }
    function choose(s, noise) {
      var me = s.active, base = evalState(s, me), best = null, bestV = base + 0.01, acts = E.legalActions(s, { compact: true });
      for (var i = 0; i < acts.length; i++) {
        var a = acts[i]; if (a.t === "end") continue;
        var c = E.clone(s); E.apply(c, a);
        var v = evalState(c, me) + (noise ? (E.rand(s) - 0.5) * noise : 0);
        if (a.t === "play") v += 0.5; if (a.t === "move") v -= 0.7;
        if (v > bestV) { bestV = v; best = a; }
      }
      return best || { t: "end" };
    }
    return { choose: choose, evalState: evalState };
  }
  if (typeof module !== "undefined") module.exports = createAI; else root.createHordaAI = createAI;
})(typeof window !== "undefined" ? window : globalThis);
