const { chromium } = require('playwright');
const OUT = process.argv[2] || '.';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.cwd() + '/index.html');
  const click = (sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) throw new Error('no ' + s); e.click(); }, sel);
  await p.evaluate(() => { newSave('forja'); show('home'); });
  await click('#hDeck'); await p.waitForTimeout(300);
  const first = await p.evaluate(() => document.getElementById('info').classList.contains('on')); await p.screenshot({ path: OUT + '/b1-primer-ingreso.png' });
  await click('#infoOk'); await click('#bHelp'); await click('#bNew'); await p.waitForTimeout(200);
  await click('[data-t="trampa"]'); await p.waitForTimeout(100); await click('#unlockAll').catch(() => {});
  const r = await p.evaluate(() => ({ decks: SAVE.decks.length, sel: SAVE.sel, cards: curDeck().cards.length, reglas: !document.getElementById('bRules').hidden, trampas: document.querySelectorAll('#bPool .prow').length }));
  await p.screenshot({ path: OUT + '/b2-nuevo.png' });
  console.log('primer ingreso muestra explicación:', first, JSON.stringify(r), 'errores:', JSON.stringify(errs));
  await b.close();
})();
