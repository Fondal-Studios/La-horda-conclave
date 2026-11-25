const { chromium } = require('playwright');
const OUT = process.argv[2] || '.';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.cwd() + '/index.html');
  await p.evaluate(() => { newSave('infernal'); SAVE.seenBld = true; SAVE.seenTut = true; allCardIds().forEach(id => SAVE.owned[id] = 2); show('home'); });
  await p.evaluate(() => document.getElementById('hDeck').click()); await p.waitForTimeout(300);
  await p.evaluate(() => { document.querySelector('[data-t="bicho"]').click(); });
  await p.waitForTimeout(150);
  const n = await p.evaluate(() => ({ combos: document.querySelectorAll('#deckP .note').length, rayos: document.querySelectorAll('#bPool .prow').length, sin: [...document.querySelectorAll('#bPool .prow b')].filter(b => b.textContent.startsWith('⚡')).length }));
  await p.screenshot({ path: OUT + '/k1-combos.png' });
  // hover sobre una carta de sinergia muestra la línea ⚡
  await p.hover('#bPool .prow[data-id="capataz"]').catch(() => {}); await p.waitForTimeout(200); await p.screenshot({ path: OUT + '/k2-preview.png' });
  // partida: bosque con Lobo Alfa + Manada
  console.log(JSON.stringify(n), 'errores:', JSON.stringify(errs)); await b.close();
})();
