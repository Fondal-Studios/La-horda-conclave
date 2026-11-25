const { chromium } = require('playwright');
const OUT = process.argv[2] || '.';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.cwd() + '/index.html');
  const click = (sel, i = 0) => p.evaluate(([s, i]) => { const l = document.querySelectorAll(s); const e = l[i < 0 ? l.length + i : i]; if (!e) throw new Error('no ' + s); e.click(); }, [sel, i]);
  const win = () => p.evaluate(() => { S.over = true; S.winner = ctx.me; S.players[1 - ctx.me].hp = 0; onState(E.view(S, ctx.me), [], [], 0); });
  await p.evaluate(() => newSave('ciudad')); await p.evaluate(() => show('home')); await click('#hAdv'); await p.waitForTimeout(200);
  await p.screenshot({ path: OUT + '/a1-start.png' });
  await click('[data-comp="mago"]'); await click('#advBegin'); await p.waitForTimeout(200);
  const log = [];
  for (let i = 0; i < 6; i++) {   // un capítulo completo: 2 combates, aliado, combate, cofre, jefe
    const node = await p.evaluate(() => SAVE.adv.node);
    if (i === 0) await p.screenshot({ path: OUT + '/a2-map.png' });
    await click('#advGo'); await p.waitForTimeout(250);
    if (await p.evaluate(() => document.getElementById('game').classList.contains('on'))) { await win(); await p.waitForTimeout(200); await click('#overB'); await p.waitForTimeout(250); }
    if (i === 2) await p.screenshot({ path: OUT + '/a3-reward.png' });
    await click('#rew [data-pick]'); await p.waitForTimeout(250);
    log.push(await p.evaluate(() => JSON.stringify({ ch: SAVE.adv.ch, node: SAVE.adv.node, deck: SAVE.adv.deck.length, gold: SAVE.gold })));
  }
  console.log(log.join('\n')); console.log('errors:', JSON.stringify(errs));
  await p.screenshot({ path: OUT + '/a4-next.png' });
  await b.close();
})();
