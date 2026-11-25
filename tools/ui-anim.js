const { chromium } = require('playwright');
const OUT = process.argv[2] || require('os').tmpdir();
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.cwd() + '/index.html');
  await p.evaluate(() => {
    newSave('ciudad'); SAVE.seenTut = true; show('home');
    ctx = { mode: 'bot', me: 0 }; S = E.newGame([D.DECKS.ciudad, D.DECKS.marea], 5, ['Tú', 'Bot'], 'ciudad', { sk: [['voz', 'egida'], ['voz', 'mal']] }); show('game');
    const mk = (id, p, cell) => { const c = D.CARDS[id]; const u = { uid: S.nextUid++, id, owner: p, cell, name: c.name, kind: c.kind, origin: c.origin, role: c.role || null, atk: c.atk, hp0: c.hp, dmg: 0, kw: JSON.parse(JSON.stringify(c.kw || {})), acted: false, sick: false, moved: false, frozen: 0, poison: null, cd: c.moves.map(() => 0), usedUlt: false, charge: 0, silenced: false, tmpAtk: 0, pc: 0, pn: 0, pused: false }; S.players[p].cells[cell] = u; return u; };
    window.A1 = mk('guerrero', 0, 1); window.A2 = mk('mago', 0, 4); window.B1 = mk('zombie', 1, 1);
    S.players[0].cr = 10; S.players[1].traps.push({ uid: 999, id: 'espinas' });
    onState(E.view(S, 0), E.legalActions(S), [], 0);
  });
  const shot = async (name, ms) => { await p.waitForTimeout(ms); await p.screenshot({ path: OUT + '/' + name }); };
  // 1) choque cuerpo a cuerpo (Kael ataca al Zombi; el rival tiene Trampa de Espinas)
  await p.evaluate(() => submit({ t: 'use', uid: A1.uid, mv: 0, target: B1.uid }));
  await shot('an1-choque.png', 560); await p.waitForTimeout(900);
  // 2) cristal: matamos el frente y atacamos al invocador a distancia con el mago
  await p.evaluate(() => { S.players[1].cells[1] = null; onState(E.view(S, 0), E.legalActions(S), [], 0); });
  await p.waitForTimeout(200);
  await p.evaluate(() => { const u = S.players[0].cells[4]; submit({ t: 'use', uid: u.uid, mv: 0, target: 'f1' }); });
  await shot('an2-cristal.png', 520); await p.waitForTimeout(1000);
  const st = await p.evaluate(() => JSON.stringify({ foeHp: S.players[1].hp, busy: animBusy, trapsLeft: S.players[1].traps.length, kael: E.hpOf(S, A1) + '/' + E.maxHpOf(S, A1) }));
  console.log(st, 'errores:', JSON.stringify(errs));
  await b.close();
})();
