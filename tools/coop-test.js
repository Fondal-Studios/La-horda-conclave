"use strict";
/* tools/coop-test.js — aventura acompañada: anfitrión crea sala con un encuentro (jefe incluido), invitado se une con el código;
   los dos ven el mismo tablero, el anfitrión juega (el invitado también podría), el bot enemigo juega en el servidor. */
var path = require("path"), WebSocket = require(path.join(__dirname, "../server/node_modules/ws"));
var D = require("../data.js"), srv = require("../server/duel-server.js"), fails = [];
(async function () {
  var s = await srv.makeServer(0), port = s.port, e = D.encounter(0, 5), deck = D.advStarter("tanque").concat(["guerrero", "mago", "cm_espectro", "cm_raptor"]);
  var enc = { name: e.name, kind: "boss", deck: deck, enemy: e.deck, map: e.map, hp: [e.php, e.hp], pre: e.pre, hand: [e.bonusHand, 0] };
  function mk(name) { var ws = new WebSocket("ws://127.0.0.1:" + port), st = { name: name, ws: ws, states: 0, leaks: 0, over: null, start: null, errors: [], legalSeen: 0 }; return st; }
  var A = mk("Ana"), B = mk("Beto");
  function rnd(l) { var n = l.filter(function (a) { return a.t !== "end"; }); return Math.random() < 0.12 || !n.length ? { t: "end" } : n[Math.floor(Math.random() * n.length)]; }
  function wire(st, host) {
    st.ws.on("message", function (raw) {
      var m = JSON.parse(raw);
      if (m.t === "error") st.errors.push(m.msg);
      if (m.t === "waiting" && host) st.code = m.code, B.ws.send(JSON.stringify({ t: "coop_join", code: m.code, name: "Beto" }));
      if (m.t === "coopstart") st.start = m;
      if (m.t === "over") { st.over = m; }
      if (m.t === "state") {
        st.states++; var foe = m.view.players[1]; if (foe.hand.some(function (c) { return c !== null; }) || foe.deck.length) st.leaks++;
        if (m.legal.length) { st.legalSeen++; if (host) st.ws.send(JSON.stringify({ t: "act", action: rnd(m.legal) })); }
      }
    });
  }
  wire(A, true); wire(B, false);
  A.ws.on("open", function () { A.ws.send(JSON.stringify({ t: "coop_create", name: "Ana", enc: enc })); });
  var t0 = Date.now(); while ((!A.over || !B.over) && Date.now() - t0 < 100000) await new Promise(function (r) { setTimeout(r, 200); });
  [A, B].forEach(function (c) {
    console.log(c.name, "estados:", c.states, "· turnos con acciones disponibles:", c.legalSeen, "· fugas:", c.leaks, "· encuentro:", c.start && c.start.name, "· resultado:", JSON.stringify(c.over));
    if (!c.over) fails.push(c.name + " sin fin"); if (c.leaks) fails.push(c.name + " fuga"); if (!c.start) fails.push(c.name + " sin coopstart"); if (!c.legalSeen) fails.push(c.name + " nunca recibió acciones legales");
  });
  // encuentro inválido rechazado
  var C = mk("Cami"); await new Promise(function (r) { C.ws.on("open", r); });
  C.ws.on("message", function (raw) { var m = JSON.parse(raw); if (m.t === "error") C.errors.push(m.msg); });
  C.ws.send(JSON.stringify({ t: "coop_create", name: "Cami", enc: { deck: ["carta_falsa"], enemy: [] } })); await new Promise(function (r) { setTimeout(r, 300); });
  if (!C.errors.length) fails.push("encuentro inválido no rechazado");
  s.wss.close(); s.httpServer.close();
  if (fails.length) { console.log("FALLA:", fails); process.exit(1); } console.log("COOP OK"); process.exit(0);
})();
