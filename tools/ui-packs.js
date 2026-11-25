const { chromium } = require('playwright');
const OUT = process.argv[2] || require('os').tmpdir();
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.cwd() + '/index.html');
  const click = (sel, i = 0) => p.evaluate(([s, i]) => { const l = document.querySelectorAll(s); const e = l[i < 0 ? l.length + i : i]; if (!e) throw new Error('no ' + s); e.click(); }, [sel, i]);
  await p.evaluate(() => { newSave('ciudad'); SAVE.seenTut = true; SAVE.seenBld = true; show('home'); });
  await click('#hColl'); await p.waitForTimeout(200);
  await click('[data-cm="shop"]'); await p.waitForTimeout(200);
  await p.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true));
  await p.screenshot({ path: OUT + '/s1-tienda.png', fullPage: false });
  await click('#giveBrasas'); await p.waitForTimeout(100);
  // abrir el de invierno (premium): confirmación → compra
  await click('[data-buy="tema_marea"]'); await p.waitForTimeout(150);
  const confirmOn = await p.evaluate(() => getComputedStyle(document.getElementById('confirmPack')).display !== 'none');
  await click('#cpOk'); await p.waitForTimeout(2300); await p.screenshot({ path: OUT + '/s2-apertura.png' });
  const st = await p.evaluate(() => ({ brasas: SAVE.brasas, dust: SAVE.dust, opened: SAVE.stats.opened, premium: SAVE.stats.premium, pity: JSON.stringify(SAVE.pity), cards: document.querySelectorAll('#revC .card').length }));
  await click('#revClose');
  // oro: sobre estándar
  await p.evaluate(() => { SAVE.gold = 1000; persist(); buildShop(); }); await click('[data-buy="estandar"]'); await p.waitForTimeout(200); await click('#revClose');
  // fabricar
  await p.evaluate(() => { SAVE.dust = 5000; persist(); }); await click('[data-cm="craft"]'); await p.waitForTimeout(200);
  const before = await p.evaluate(() => Object.keys(SAVE.owned).length); await click('[data-craft]'); await p.waitForTimeout(100);
  const after = await p.evaluate(() => Object.keys(SAVE.owned).length); await p.screenshot({ path: OUT + '/s3-fabricar.png' });
  // límite diario
  await p.evaluate(() => { SAVE.limit = 1; SAVE.stats.today = 1; persist(); }); await click('[data-cm="shop"]'); await click('[data-buy="tema_bosque"]');
  const limitBlocked = await p.evaluate(() => getComputedStyle(document.getElementById('confirmPack')).display === 'none');
  // interruptor por región
  await p.evaluate(() => { PAID_RANDOM_ENABLED = false; buildShop(); }); const prem = await p.evaluate(() => document.querySelectorAll('[data-buy="tema_marea"]').length);
  // colección con gemas
  await p.evaluate(() => { PAID_RANDOM_ENABLED = true; }); await click('[data-cm="coll"]'); await p.waitForTimeout(150); await p.screenshot({ path: OUT + '/s4-coleccion.png' });
  console.log(JSON.stringify({ confirmOn, st, craftNuevaCarta: after >= before, limitBlocked, premiumOcultoSinRegion: prem === 0 }), 'errores:', JSON.stringify(errs));
  await b.close();
})();
