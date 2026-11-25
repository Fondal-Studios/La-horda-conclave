/* tools/clarity-test.js — PRUEBA DE CLARIDAD con un "jugador novato" automático que SOLO usa lo que la pantalla muestra:
   el texto de la barra dorada (coach), los bordes verdes/rojos, los botones habilitados y el panel de movimientos. No conoce el motor.
   Comprueba: (1) hay instrucción en todo momento, (2) lo que dice la barra coincide con lo que se ve (cartas/unidades con borde verde),
   (3) cada clic lleva a un estado con una siguiente acción visible (sin callejones sin salida), (4) el botón Terminar turno siempre está disponible en tu turno,
   (5) el tutorial aparece la primera vez y se puede cerrar, (6) clics hasta la primera jugada, (7) se llega al final de la partida siguiendo solo las pistas.
   NO reemplaza una prueba con personas: mide que la interfaz sea coherente y operable, no que a alguien le guste ni lo entienda a la primera. */
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [], issues = [], m = { decisiones: 0, clics: 0, clicsHastaPrimeraJugada: null, turnosRival: 0, sinInstruccion: 0, incoherencias: 0, callejones: 0, habilidadesInvocador: 0, pasivasVistas: 0 };
  p.on('pageerror', e => errs.push(e.message)); p.on('console', x => { if (x.type() === 'error') errs.push(x.text()); });
  await p.goto('file://' + process.cwd() + '/index.html');
  const ev = (f, a) => p.evaluate(f, a);
  const click = async (sel, i = 0) => { m.clics++; return ev(([s, i]) => { const l = document.querySelectorAll(s); const e = l[i < 0 ? l.length + i : i]; if (!e) return false; e.click(); return true; }, [sel, i]); };
  const count = (sel) => ev((s) => document.querySelectorAll(s).length, sel);
  const coach = () => ev(() => document.getElementById('coachT').textContent);
  await ev(() => { newSave('marea'); SAVE.name = 'Novata'; show('home'); });
  await click('#hPlay'); await p.waitForTimeout(150); await click('#playBot'); await p.waitForTimeout(1500);
  // (5) tutorial primera vez
  const tutOn = await ev(() => document.getElementById('tut').classList.contains('on')); if (!tutOn) issues.push('el tutorial no apareció en la primera partida');
  else { for (let i = 0; i < 6; i++) { await click('#tutNext'); await p.waitForTimeout(40); } if (await ev(() => document.getElementById('tut').classList.contains('on'))) issues.push('el tutorial no se pudo cerrar'); }
  await p.screenshot({ path: OUT + '/c1-inicio.png' });
  let firstPlay = false, startClics = m.clics;
  for (let turn = 0; turn < 16; turn++) {
    // esperar mi turno o el fin
    for (let w = 0; w < 80; w++) { const my = await ev(() => !!ctx && !!V && V.active === ctx.me && !lock); if (my || await count('#over.on')) break; m.turnosRival += w === 0 ? 1 : 0; if (!(await coach())) m.sinInstruccion++; await p.waitForTimeout(250); }
    if (await count('#over.on')) break;
    for (let step = 0; step < 14; step++) {
      m.decisiones++;
      const ct = await coach(); if (!ct) { m.sinInstruccion++; issues.push('turno ' + turn + ': sin texto de ayuda'); }
      if (!(await count('#endBtn:not([disabled])'))) { m.callejones++; issues.push('turno ' + turn + ': Terminar turno deshabilitado en mi turno'); }
      // (2) coherencia texto ↔ pantalla
      const nCards = await count('.handrow .card.go'), nReady = await count('#rMF .tile.ready, #rMB .tile.ready');
      if (/carta/.test(ct) && /borde verde/.test(ct) && nCards < 1) { m.incoherencias++; issues.push('el texto habla de cartas con borde verde pero no hay: "' + ct.slice(0, 60) + '"'); }
      if (/unidad(es)? lista/.test(ct) && nReady < 1) { m.incoherencias++; issues.push('el texto habla de unidades listas pero ninguna tiene borde verde'); }
      if (/No te queda nada/.test(ct)) { if (nCards || nReady) { m.incoherencias++; issues.push('dice que no queda nada pero hay cartas/unidades listas'); } break; }
      let did = false;
      if (nCards) {
        const before = await count('.handrow .card'); await click('.handrow .card.go', -1); await p.waitForTimeout(120);
        if (await count('.cell.dep')) { await click('.cell.dep', 0); await p.waitForTimeout(150); }
        else if (await count('#oppBoard .tile.tgt, .tile.tgt, .tile.tgtally, .face.tgt, .face.tgtally')) { await click('.tile.tgt, .tile.tgtally, .face.tgt, .face.tgtally', 0); await p.waitForTimeout(150); }
        const after = await count('.handrow .card');
        if (after < before) { did = true; if (!firstPlay) { firstPlay = true; m.clicsHastaPrimeraJugada = m.clics - startClics; } } else { m.callejones++; issues.push('turno ' + turn + ': tocar una carta con borde verde no hizo nada'); await ev(() => { pend = null; render(); }); }
      }
      if (!did && nReady) {
        await click('#rMF .tile.ready, #rMB .tile.ready', 0); await p.waitForTimeout(100);
        const mv = await count('#mp .mvb:not([disabled]):not([data-reposition])');
        if (!mv) { m.callejones++; issues.push('unidad con borde verde sin movimientos habilitados'); await ev(() => { sel = null; render(); }); }
        else {
          const hasUlt = await count('#mp .mvb.ult:not([disabled])'); if (await count('#mp .pasivaChk')) m.pasivasVistas++;
          await click(hasUlt ? '#mp .mvb.ult:not([disabled])' : '#mp .mvb:not([disabled]):not([data-reposition])', hasUlt ? 0 : -1); await p.waitForTimeout(100);
          if (await count('.tile.tgt, .tile.tgtally, .face.tgt, .face.tgtally')) { await click('.tile.tgt, .tile.tgtally, .face.tgt, .face.tgtally', 0); await p.waitForTimeout(150); }
          did = true;
        }
      }
      if (!did && await count('.skb:not([disabled])')) {
        await click('.skb:not([disabled])', 0); await p.waitForTimeout(100); m.habilidadesInvocador++;
        if (await count('.tile.tgt, .tile.tgtally, .cell.dep, .face.tgtally')) { await click('.tile.tgt, .tile.tgtally, .cell.dep, .face.tgtally', 0); await p.waitForTimeout(150); }
        did = true;
      }
      if (!did) break;
    }
    if (turn === 3) await p.screenshot({ path: OUT + '/c2-turno.png' });
    await click('#endBtn:not([disabled])', 0); await p.waitForTimeout(300);
  }
  await p.screenshot({ path: OUT + '/c3-final.png' });
  const over = await count('#over.on');
  console.log('MÉTRICAS', JSON.stringify(m));
  console.log('partida terminada siguiendo las pistas:', over ? 'sí' : 'no (se cortó a los 16 turnos, normal)');
  console.log('PROBLEMAS DE CLARIDAD:', issues.length ? '\n - ' + [...new Set(issues)].slice(0, 12).join('\n - ') : 'ninguno detectado');
  console.log('errores de consola:', JSON.stringify(errs));
  await b.close(); process.exit(issues.length || errs.length ? 1 : 0);
})();
