# La Horda: Cónclave

Duelo de cartas por turnos 1 contra 1, hecho con el arte y los datos de **La Horda** (Fondal Studios). Boceto jugable **v0.4**.

## Qué es
- Sos un **Invocador** con puntos de vida; tus **guardianes** y **monstruos** son quienes le hacen daño al Invocador rival.
- **Tablero** de 2 filas × 3 casillas por lado (frente / fondo). Cada unidad actúa una vez por turno y elige un movimiento, como en Pokémon: Ataque propio, 3 habilidades y definitiva.
- **41 guardianes** con las habilidades, pasivas y ataques de La Horda, **39 monstruos**, hechizos, bonus (empoderan guardianes) y maldiciones (debilitan enemigos).
- **6 mapas** (arenas de La Horda) con terreno por fila: Ciudad, Minas, Infernal, Bosque, Laberinto, Gélida.
- **Invocador**: 2 habilidades de apoyo a elección entre 8; el rango sube la vida con las victorias (no en 1v1 entre personas).
- **Cuestionario inicial**, **constructor de mazos**, **colección y sobres**, **Aventura** (6 arenas, capturás monstruos y reclutás guardianes) solo o **acompañado** (cooperativo).
- **Online 1v1** con servidor autoritativo (la mano rival nunca sale del servidor).

## Cómo jugarlo
Contra el Bot no hace falta instalar nada: servir la carpeta con cualquier servidor estático y abrir `index.html`
(o abrir el archivo directamente en el navegador).

```bash
python3 -m http.server 8000     # y abrir http://localhost:8000
```

### Online 1v1 y cooperativo
```bash
cd server && npm install && node duel-server.js   # escucha en :8787
```
En el menú, poner `ws://localhost:8787`. Variables: `PORT`, `TURN_MS` (tiempo de turno, 60 s por defecto).

## Estructura
```
index.html        interfaz (menú, cuestionario, constructor, colección, aventura, partida)
engine.js         motor determinista sin DOM (mismo archivo en navegador y servidor)
data.js           cartas, mapas, aventura, habilidades del invocador
movesets.js       movimientos de los guardianes (GENERADO por tools/build-moves.js)
passives.js       pasivas, ataques básicos y estadísticas (GENERADO por tools/build-passives.js)
ai.js             bot voraz (rival del navegador y jugador de pruebas)
server/           duel-server.js: 1v1 autoritativo + cooperativo (Node + ws)
assets/           ilustraciones de guardianes (g/), monstruos y jefes (b/), arenas (a/), efectos de sonido (sfx/)
tools/            pruebas y generadores (ver abajo)
docs/             DISENO.md (auditoría y diseño) · HABILIDADES.md (original vs. duelo)
```

## Pruebas (Node ≥ 18)
```bash
node tools/gate.js 60            # puntos (guardián > monstruo), arte, mazos, 1.800 partidas bot-vs-bot, balance por mazo y mapa
node tools/passive-test.js       # las 41 pasivas funcionan
node tools/adventure-sim.js 30   # dificultad de la aventura con un bot simple
cd server && npm install && cd ..
node tools/online-test.js        # 1v1 online completo + sin fugas de información oculta
node tools/coop-test.js          # aventura acompañada
# pruebas de interfaz (necesitan Playwright + Chromium): tools/ui-test.js, ui-adv.js, ui-quiz.js, clarity-test.js
```
`clarity-test.js` es un jugador novato automático que usa solo lo que muestra la pantalla; **no reemplaza una prueba con personas**.

## Regenerar datos
Los kits salen de La Horda: `tools/repo-skills.json`, `repo-passives.json` y `repo-stats.json` están extraídos del repo original.
`tools/moves-reviewed.js`, `passives-reviewed.js` y `basics-reviewed.js` son la traducción a mano al duelo.
```bash
node tools/build-moves.js > movesets.js
node tools/build-passives.js > passives.js
node tools/make-skills-doc.js    # docs/HABILIDADES.md
```

## Estado y límites (honestos)
- Boceto: el progreso (oro, colección, mazos, aventura) vive en `localStorage` del navegador; no hay cuentas ni persistencia de servidor.
- El servidor no tiene reconexión, matchmaking por rango ni chat; en cooperativo confía en el cliente para las recompensas (es PvE).
- El balance se midió con un bot simple, no con personas. Roles/linajes de varios guardianes y 7 pasivas son propuestas (ver `docs/`).
- Los textos de historia y del cuestionario son provisionales. Las cartas de magia usan íconos emoji como arte provisional.
- No se probó en celular ni con latencia real.

## Créditos y procedencia
Ilustraciones, sprites y datos de guardianes/monstruos: repositorio **La Horda** de Fondal Studios. Efectos de sonido: CC0 (OpenGameArt), ver créditos en el repo original.
Confirmar derechos de uso del arte antes de cualquier publicación comercial independiente.
