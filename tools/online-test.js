"use strict";
/* tools/online-test.js — dos clientes WebSocket juegan una partida completa contra el servidor autoritativo.
   Comprueba: emparejamiento, que ninguna vista contenga la mano/mazo rival, que las acciones ilegales y fuera de
   turno sean rechazadas, y que la partida termine con un ganador. */
var path = require("path"), WebSocket = require(path.join(__dirname, "../server/node_modules/ws"));
var D = require("../data.js"), srv = require("../server/duel-server.js");
var fails = [];
function client(port, name, deck, pickFn) {
  return new Promise(function (resolve) {
    var ws = new WebSocket("ws://127.0.0.1:" + port), st = { name: name, states: 0, errors: [], over: null, leaks: 0 };
    ws.on("open", function () { ws.send(JSON.stringify({ t: "queue", name: name, deck: deck, map: "infernal" })); });
    ws.on("message", function (raw) {
      var m = JSON.parse(raw);
      if (m.t === "error") st.errors.push(m.msg);
      if (m.t === "over") { st.over = m; ws.close(); resolve(st); }
      if (m.t === "state") {
        st.states++;
        var foe = m.view.players[1 - m.you];
        if (foe.hand.some(function (c) { return c !== null; }) || foe.deck.length || (foe.traps || []).some(function (t) { return t.id; })) st.leaks++;
        if (m.view.map !== "infernal") st.leaks++; if (m.view.rng !== undefined || m.view.seed !== undefined) st.leaks++;
        if (m.legal.length) {
          if (st.states === 3) { ws.send(JSON.stringify({ t: "act", action: { t: "play", uid: 99999 } })); }   // acción ilegal a propósito
          ws.send(JSON.stringify({ t: "act", action: pickFn(m.legal) }));
        } else if (st.states === 2) ws.send(JSON.stringify({ t: "act", action: { t: "end" } }));               // fuera de turno a propósito
      }
    });
  });
}
(async function () {
  var s = await srv.makeServer(0), port = s.port;
  function rnd(l) { var nonEnd = l.filter(function (a) { return a.t !== "end"; }); return Math.random() < 0.15 || !nonEnd.length ? { t: "end" } : nonEnd[Math.floor(Math.random() * nonEnd.length)]; }
  var res = await Promise.all([client(port, "Ana", D.DECKS.ciudad, rnd), client(port, "Beto", D.DECKS.marea, rnd)]);
  res.forEach(function (r) {
    console.log(r.name, "estados:", r.states, "· errores esperados:", r.errors.length, "· fugas de info oculta:", r.leaks, "· resultado:", JSON.stringify(r.over));
    if (r.leaks) fails.push(r.name + " recibió información oculta");
    if (!r.over) fails.push(r.name + " no recibió fin de partida");
  });
  if (res[0].errors.length + res[1].errors.length < 2) fails.push("no se rechazaron las acciones ilegales/fuera de turno");
  s.wss.close(); s.httpServer.close();
  if (fails.length) { console.log("FALLA:", fails); process.exit(1); }
  console.log("ONLINE OK"); process.exit(0);
})();
