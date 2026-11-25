const { chromium } = require('playwright');
const OUT = process.argv[2] || '.';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.cwd() + '/index.html'); await p.waitForTimeout(300);
  const click = (sel, i = 0) => p.evaluate(([s, i]) => { const l = document.querySelectorAll(s); const e = l[i < 0 ? l.length + i : i]; if (!e) throw new Error('no ' + s); e.click(); }, [sel, i]);
  await p.screenshot({ path: OUT + '/q1-intro.png' });
  await p.fill('#qName', 'Mariano'); await click('#qGo'); await p.waitForTimeout(200);
  await p.screenshot({ path: OUT + '/q2-pregunta.png' });
  for (let i = 0; i < 7; i++) { await click('.qa', i % 3); await p.waitForTimeout(i === 0 ? 400 : 100); if (i === 0) await p.screenshot({ path: OUT + '/q3-reaccion.png' }); await p.waitForTimeout(1700); }
  await p.waitForTimeout(300); await p.screenshot({ path: OUT + '/q4-resultado.png' });
  await click('#qFin'); await p.waitForTimeout(300);
  const st = await p.evaluate(() => ({ name: SAVE.name, heroes: SAVE.heroes, deck: SAVE.decks[0].cards.length, errs: deckErrors(SAVE.decks[0].cards, true), profile: SAVE.profile, lin: SAVE.lin }));
  console.log('guardado:', JSON.stringify(st));
  // todas las combinaciones razonables producen un mazo inicial válido
  const bad = await p.evaluate(() => { const out = []; const lins = Object.keys(LIN), roles = ['tanque', 'asesino', 'mago', 'soporte'];
    for (let n = 0; n < 400; n++) { const role = {}, lin = {}; roles.forEach(r => role[r] = Math.floor(Math.random() * 9)); lins.forEach(l => lin[l] = Math.floor(Math.random() * 9));
      const h = pickHeroes(role, lin), L = topKey(lin), d = starterDeck(L, h); const e = D.validateDeck(d); if (e.length || h.length < 3) out.push([L, h, e[0]]); }
    return out.slice(0, 3); });
  console.log('mazos iniciales inválidos en 400 combinaciones:', JSON.stringify(bad));
  await click('#hAdv'); await p.waitForTimeout(300); await p.screenshot({ path: OUT + '/q5-aventura.png' });
  console.log('errors:', JSON.stringify(errs)); await b.close();
})();
