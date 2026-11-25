const { chromium } = require('playwright');
const OUT = process.argv[2] || require('os').tmpdir();
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.cwd() + '/index.html'); await p.waitForTimeout(400);
  const click = (sel, i = 0) => p.evaluate(([s, i]) => { const l = document.querySelectorAll(s); const e = l[i < 0 ? l.length + i : i]; if (!e) return false; e.click(); return true; }, [sel, i]);
  const count = (sel) => p.evaluate((s) => document.querySelectorAll(s).length, sel);
    await p.evaluate(() => { newSave('marea'); show('home'); }); await p.waitForTimeout(200);
  await p.screenshot({ path: OUT + '/u2-home.png' });
  await click('#hColl'); await click('#unlockAll'); await p.waitForTimeout(800); await p.screenshot({ path: OUT + '/u3-coll.png' });
  await p.evaluate(() => show('home')); await click('#hDeck'); await p.waitForTimeout(300);
  await click('#dClear'); await click('[data-t="guardian"]', 0); await click('#bPool .prow', 0); await click('#bPool .prow', 1); await click('[data-t="all"]'); await p.waitForTimeout(200);
  await click('#dAuto'); await p.waitForTimeout(200); await p.screenshot({ path: OUT + '/u4-builder.png' });
  const deckState = await p.evaluate(() => ({ n: curDeck().cards.length, errs: deckErrors(curDeck().cards, true) }));
  console.log('mazo autocompletado:', JSON.stringify(deckState));
  await p.evaluate(() => show('home')); await click('#hPlay'); await click('.mapc[data-map="infernal"]'); await p.waitForTimeout(200); await p.screenshot({ path: OUT + '/u5-setup.png' });
  await click('#sDeck option', 0); 
  await p.evaluate(() => { SAVE.sel = 0; });
  await click('#playBot'); await p.waitForTimeout(1500);
  let shot = 0;
  for (let t = 0; t < 10; t++) {
    for (let k = 0; k < 8; k++) {
      if (!(await count('.handrow .card.go'))) break;
      await click('.handrow .card.go', -1); await p.waitForTimeout(120);
      if (await count('.cell.dep')) { await click('.cell.dep', 0); await p.waitForTimeout(120); }
      else if (await count('.tile.tgt, .tile.tgtally, .face.tgt, .face.tgtally')) { await click('.tile.tgt, .tile.tgtally, .face.tgt, .face.tgtally', 0); await p.waitForTimeout(120); }
    }
    for (let k = 0; k < 6; k++) {
      if (!(await count('#rMF .tile.ready, #rMB .tile.ready'))) break;
      await click('#rMF .tile.ready, #rMB .tile.ready', 0); await p.waitForTimeout(80);
      if (!(await click('.mvb:not([disabled]):not([data-reposition]):not(.basic)', -1))) await click('.mvb.basic:not([disabled])', 0);
      await p.waitForTimeout(80);
      if (await count('.tile.tgt')) await click('.tile.tgt', 0); else if (await count('.tile.tgtally')) await click('.tile.tgtally', 0); else if (await count('.face.tgt')) await click('.face.tgt', 0);
      await p.waitForTimeout(120);
      if (!shot && await count('#mp .mvb')) { await click('#rMF .tile, #rMB .tile', 0); await p.waitForTimeout(100); if (t >= 3) { await p.screenshot({ path: OUT + '/u6-game.png' }); shot = 1; } }
    }
    await click('#endBtn:not([disabled])', 0); await p.waitForTimeout(8000);
    if (await count('#over.on')) break;
  }
  await p.screenshot({ path: OUT + '/u7-after.png' });
  console.log('errors:', JSON.stringify(errs)); console.log('over:', (await count('#over.on')) ? await p.textContent('#overT') : 'no');
  await b.close();
})();
