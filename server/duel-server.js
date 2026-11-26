"use strict";
/* duel-server.js — servidor AUTORITATIVO para duelos 1v1 de "La Horda: Cónclave".
   Diferencia clave con server/relay.js de La Horda (cartero que reenvía al anfitrión): aquí el servidor corre
   el motor, valida cada acción contra legalActions() y manda a cada jugador SOLO su vista (la mano y el mazo
   del rival nunca salen del servidor). Mismo engine.js que el cliente.
   Mensajes cliente→servidor: {t:"queue",name,deck,map?} · {t:"create",name,deck} · {t:"join",code,name,deck}
                              {t:"act",action} · {t:"resign"} · {t:"rejoin",token}
   Servidor→cliente: {t:"waiting",code} · {t:"state",you,view,legal,events,deadline} · {t:"over",winner,reason} · {t:"error",msg}
   Lo que falta para producción está en docs/DISENO.md (cuentas, MMR, persistencia, reconexión completa).      */
var http = require("http"), crypto = require("crypto"), fs = require("fs"), path = require("path");
var ROOT = path.resolve(__dirname, ".."), SERVE_STATIC = process.env.NO_STATIC !== "1";
var MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ogg": "audio/ogg", ".mp3": "audio/mpeg", ".wav": "audio/wav", ".webmanifest": "application/manifest+json", ".ico": "image/x-icon" };
var WebSocketServer = require("ws").WebSocketServer;
var D = require("../data.js"), E = require("../engine.js")(D.CARDS, D.MAPS, D.SUMMONER), AI = require("../ai.js")(E);

var TURN_MS = parseInt(process.env.TURN_MS || "60000", 10);
var rooms = new Map(), queue = [];

function code() { var c; do { c = crypto.randomBytes(3).toString("hex").toUpperCase(); } while (rooms.has(c)); return c; }
function send(ws, o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }
function cleanName(n) { return String(n || "Jugador").replace(/[^\p{L}\p{N} _\-]/gu, "").slice(0, 16) || "Jugador"; }

function startRoom(a, b, id) {
  var seed = crypto.randomBytes(4).readUInt32LE(0);
  var order = crypto.randomInt(2) === 0 ? [a, b] : [b, a];            // quién empieza es sorteo del servidor
  var room = { id: id, seats: order, tokens: order.map(function () { return crypto.randomBytes(8).toString("hex"); }), timer: null, over: false };
  var prefs = [order[0].map, order[1].map].filter(function (m) { return D.MAPS[m]; });             // cada jugador propone un mapa; si coinciden se usa; si no, sorteo del servidor
  var mapId = prefs.length ? prefs[crypto.randomInt(prefs.length)] : Object.keys(D.MAPS)[crypto.randomInt(Object.keys(D.MAPS).length)];
  room.s = E.newGame([order[0].deck, order[1].deck], seed, [order[0].name, order[1].name], mapId, { sk: [order[0].sk, order[1].sk] });   // habilidades del invocador: las que cada uno eligió (validadas); sin bonus de vida en 1v1
  order.forEach(function (c, i) { c.room = room; c.seat = i; });
  rooms.set(id, room);
  pushState(room, []);
  return room;
}
function pushState(room, events) {
  var s = room.s;
  clearTimeout(room.timer);
  var deadline = s.over ? 0 : Date.now() + TURN_MS;
  room.seats.forEach(function (c, i) {
    var seat = room.coop ? 0 : i;                 // en cooperativo los dos humanos comparten el asiento 0 (mano y tablero comunes)
    send(c.ws, { t: "state", you: seat, view: E.view(s, seat), legal: s.active === seat && !s.over ? E.legalActions(s) : [], events: events, deadline: deadline, token: room.tokens[i] });
  });
  if (s.over) { room.over = true; room.seats.forEach(function (c) { send(c.ws, { t: "over", winner: s.winner, reason: "fin" }); }); return; }
  if (room.coop && s.active === 1) { room.timer = setTimeout(function () { botStep(room); }, 800); return; }   // turno del bot (servidor)
  room.timer = setTimeout(function () {                                // tiempo agotado: el servidor cierra el turno
    var r = E.apply(s, { t: "end" }); pushState(room, r.events);
  }, TURN_MS);
}
function botStep(room) {
  var s = room.s; if (room.over || s.over || s.active !== 1) return;
  var a = AI.choose(s, 1.0), r = E.apply(s, a); pushState(room, r.events);
}
// Aventura acompañada: el anfitrión manda el encuentro (mazo del grupo, mazo enemigo, mapa, vida, jefe). Es PvE: el servidor solo
// valida que las cartas existan y los límites; las recompensas las guarda cada cliente (no hay economía competitiva en juego).
function validEncounter(enc) {
  if (!enc || !Array.isArray(enc.deck) || !Array.isArray(enc.enemy)) return "encuentro inválido";
  if (enc.deck.length < 10 || enc.deck.length > 40 || enc.enemy.length < 10 || enc.enemy.length > 40) return "tamaño de mazo inválido";
  var ok = enc.deck.concat(enc.enemy).every(function (id) { return D.CARDS[id] && !D.CARDS[id].coin; });
  if (!ok) return "carta desconocida";
  if (!D.MAPS[enc.map]) return "mapa inválido";
  var hp = enc.hp || [40, 40]; if (!(hp[0] >= 20 && hp[0] <= 80 && hp[1] >= 20 && hp[1] <= 80)) return "vida inválida";
  var pre = enc.pre || []; if (pre.length > 2 || !pre.every(function (x) { return x.p === 1 && D.CARDS[x.id] && D.CARDS[x.id].boss && x.cell >= 0 && x.cell < 6; })) return "jefe inválido";
  return null;
}
function startCoop(host, guest, enc, id) {
  var room = { id: id, coop: true, seats: [host, guest], tokens: [crypto.randomBytes(8).toString("hex"), crypto.randomBytes(8).toString("hex")], timer: null, over: false, enc: enc };
  room.s = E.newGame([enc.deck, enc.enemy], crypto.randomBytes(4).readUInt32LE(0), [host.name + " y " + guest.name, enc.name || "Enemigo"], enc.map, { hp: enc.hp || [40, 40], pre: enc.pre || [], hand: enc.hand || [0, 0], sk: [host.sk, D.validLoadout(enc.eSk) ? enc.eSk : ["voz", "mal"]] });
  [host, guest].forEach(function (c) { c.room = room; c.seat = 0; send(c.ws, { t: "coopstart", name: enc.name, enemy: enc.enemy, kind: enc.kind || "fight", mates: [host.name, guest.name] }); });
  rooms.set(id, room); pushState(room, []);
}
function act(c, action) {
  var room = c.room; if (!room || room.over) return send(c.ws, { t: "error", msg: "sin partida" });
  var s = room.s; if (s.active !== c.seat) return send(c.ws, { t: "error", msg: "no es tu turno" });
  if (room.coop && room.seats.indexOf(c) < 0) return;
  if (!E.isLegal(s, action)) return send(c.ws, { t: "error", msg: "acción ilegal" });   // nunca confiar en el cliente
  var r = E.apply(s, action); pushState(room, r.events);
}
function finish(room, winnerSeat, reason) {
  if (room.over) return; room.over = true; clearTimeout(room.timer);
  room.seats.forEach(function (c) { send(c.ws, { t: "over", winner: winnerSeat, reason: reason }); });
}

function makeServer(port) {
  var httpServer = http.createServer(function (req, res) {
    if (req.url === "/health") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ ok: true, rooms: rooms.size, queue: queue.length })); }
    if (!SERVE_STATIC || req.method !== "GET") { res.writeHead(404); return res.end(); }
    // LAN: el mismo servidor entrega el juego, asi los celulares del Wi-Fi abren http://IP-de-la-PC:8787 y juegan contra esta sala
    var rel = decodeURIComponent(String(req.url).split("?")[0]); if (rel === "/") rel = "/index.html";
    var f = path.resolve(ROOT, "." + rel), ext = path.extname(f).toLowerCase();
    if (f.indexOf(ROOT + path.sep) !== 0 || /[\\\/](\.|server|tools|node_modules)/.test(f.slice(ROOT.length)) || !MIME[ext]) { res.writeHead(404); return res.end(); }
    fs.readFile(f, function (err, buf) {
      if (err) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { "content-type": MIME[ext], "cache-control": ext === ".html" ? "no-cache" : "max-age=3600" }); res.end(buf);
    });
  });
  var wss = new WebSocketServer({ server: httpServer, maxPayload: 8 * 1024 });
  wss.on("connection", function (ws) {
    var c = { ws: ws, name: "Jugador", deck: null, room: null, seat: -1, hits: 0, t0: Date.now() };
    ws.on("message", function (raw) {
      if (++c.hits > 600 && Date.now() - c.t0 < 60000) return ws.close();      // límite de ritmo simple
      var m; try { m = JSON.parse(raw); } catch (e) { return; }
      if (m.t === "queue" || m.t === "create" || m.t === "join") {
        if (c.room) return send(ws, { t: "error", msg: "ya estás en partida" });
        c.name = cleanName(m.name);
        var errs = Array.isArray(m.deck) ? D.validateDeck(m.deck) : ["mazo inválido"];
        if (errs.length) return send(ws, { t: "error", msg: "mazo: " + errs[0] });
        c.deck = m.deck.slice(); c.sk = D.validLoadout(m.sk) ? m.sk.slice() : null; c.map = typeof m.map === "string" ? m.map : null;
        if (m.t === "queue") {
          var other = queue.shift();
          if (other && other.ws.readyState === 1) startRoom(other, c, code()); else queue.push(c);
          if (!c.room) send(ws, { t: "waiting", code: null });
        } else if (m.t === "create") {
          var id = code(); rooms.set(id, { pending: c, id: id, seats: [], over: false }); c.pendingCode = id; send(ws, { t: "waiting", code: id });
        } else {
          var r = rooms.get(String(m.code || "").toUpperCase());
          if (!r || !r.pending) return send(ws, { t: "error", msg: "sala inexistente" });
          var host = r.pending; rooms.delete(r.id); startRoom(host, c, r.id);
        }
      } else if (m.t === "coop_create") {
        if (c.room) return send(ws, { t: "error", msg: "ya estás en partida" });
        c.name = cleanName(m.name); c.sk = D.validLoadout(m.sk) ? m.sk.slice() : null; var er = validEncounter(m.enc); if (er) return send(ws, { t: "error", msg: er });
        var cid = code(); c.pendingCode = cid; rooms.set(cid, { pending: c, id: cid, seats: [], over: false, coopEnc: m.enc }); send(ws, { t: "waiting", code: cid });
      } else if (m.t === "coop_join") {
        if (c.room) return send(ws, { t: "error", msg: "ya estás en partida" });
        c.name = cleanName(m.name); var rr = rooms.get(String(m.code || "").toUpperCase());
        if (!rr || !rr.pending || !rr.coopEnc) return send(ws, { t: "error", msg: "sala inexistente" });
        var h = rr.pending; rooms.delete(rr.id); h.pendingCode = null; startCoop(h, c, rr.coopEnc, rr.id);
      } else if (m.t === "act" && m.action) act(c, m.action);
      else if (m.t === "resign" && c.room) finish(c.room, c.room.coop ? 1 : 1 - c.seat, "rendición");
    });
    ws.on("close", function () {
      var qi = queue.indexOf(c); if (qi >= 0) queue.splice(qi, 1);
      if (c.pendingCode) rooms.delete(c.pendingCode);
      if (c.room && c.room.coop) { var ri = c.room.seats.indexOf(c); if (ri >= 0) c.room.seats.splice(ri, 1); if (!c.room.seats.length) { c.room.over = true; clearTimeout(c.room.timer); } }
      else if (c.room && !c.room.over) finish(c.room, 1 - c.seat, "desconexión");  // v0.1: sin ventana de reconexión (ver diseño)
    });
  });
  return new Promise(function (ok) { httpServer.listen(port, function () { ok({ httpServer: httpServer, wss: wss, port: httpServer.address().port }); }); });
}
if (require.main === module) makeServer(parseInt(process.env.PORT || "8787", 10)).then(function (x) {
  console.log("duelos en :" + x.port);
  var ips = []; var ni = require("os").networkInterfaces();
  Object.keys(ni).forEach(function (k) { ni[k].forEach(function (a) { if (a.family === "IPv4" && !a.internal) ips.push(a.address); }); });
  ips.forEach(function (ip) { console.log("  desde el celular (mismo Wi-Fi): http://" + ip + ":" + x.port); });
});
module.exports = { makeServer: makeServer };
