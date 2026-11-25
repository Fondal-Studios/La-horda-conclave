const { chromium } = require('playwright');
const OUT = process.argv[2] || '.';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/index.html');
  await p.evaluate(() => {
    newSave('ciudad'); show('home'); SAVE.decks[0].cards = D.DECKS.ciudad.slice();
    ctx = { mode: 'bot', me: 0 }; S = E.newGame([D.DECKS.ciudad, D.DECKS.marea], 5, ['Tú', 'Bot · Marea y Hielo'], 'infernal'); show('game');
    const P = S.players[0]; P.cr = 20; P.maxCr = 10;
    ['tanque', 'mago', 'cm_perro', 'cm_acechante'].forEach((id, i) => P.hand.push({ uid: 900 + i, id }));
    const Q = S.players[1]; Q.cr = 5;
    [['zombie', 1], ['dragoncito_hielo', 4], ['golem_hielo', 0]].forEach(([id, c], i) => { const u = E.apply; });
    onState(E.view(S, 0), E.legalActions(S), [], 0);
  });
  const click = (sel, i = 0) => p.evaluate(([s, i]) => { const l = document.querySelectorAll(s); const e = l[i < 0 ? l.length + i : i]; if (!e) throw new Error('no ' + s); e.click(); }, [sel, i]);
  // desplegar: Aldric al frente (casilla 1), Thalen al fondo (4), perro al frente (0)
  await click('[data-huid="900"]'); await click('#rMF .cell.dep', 1);
  await click('[data-huid="901"]'); await click('#rMB .cell.dep', 1);
  await click('[data-huid="902"]'); await click('#rMF .cell.dep', 0);
  // el rival juega algo para tener blancos
  await p.evaluate(() => { S.players[1].cells[0] = null; });
  await p.evaluate(() => { onState(E.view(S, 0), E.legalActions(S), [], 0); });
  await click('#end', 0).catch(() => {});
  await p.evaluate(() => { submit({ t: 'end' }); });
  await p.waitForTimeout(9000);
  await p.evaluate(() => { onState(E.view(S, 0), S.active === 0 ? E.legalActions(S) : [], [], 0); });
  await p.waitForTimeout(300);
  await click('#rMB .tile', 0); await p.waitForTimeout(150);
  await p.screenshot({ path: OUT + '/g1-panel.png' });
  const mvs = await p.evaluate(() => [...document.querySelectorAll('#mp .mvb')].map(x => x.innerText.replace(/\n/g, ' | ').slice(0, 110)));
  console.log(mvs.join('\n'), '\nerrors:', JSON.stringify(errs));
  // usar la habilidad en fila del mago
  const n = await p.evaluate(() => document.querySelectorAll('#mp .mvb:not([disabled])').length); console.log('movs habilitados:', n);
  await click('#mp .mvb:not([disabled]):not([data-reposition])', 1).catch(()=>{}); await p.waitForTimeout(200);
  await p.screenshot({ path: OUT + '/g2-target.png' });
  await b.close();
})();
