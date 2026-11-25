# La Horda: Cónclave — auditoría, diseño y propuestas (boceto v0.1)

Repositorio original: **sin cambios** (`git status` limpio). Todo lo nuevo vive en una carpeta aparte
(`scratchpad/game/`) y copia solo los assets que usa.

## 1. Auditoría de La Horda (qué hay y qué sirve para un juego de cartas)

**Qué es hoy:** ARPG de horda en HTML5/Canvas puro (+ prototipo de MOBA 4v4), sin build ni frameworks; 10 arenas,
jefes con regla propia, progresión en `localStorage`, tienda, códice, cuentas/pagos/ranking en un servidor Node.
Tamaño: 2,6 GB, ~9.900 PNG + ~1.700 WebP (casi todo duplicado en ambos formatos), ~1.650 JS (con herramientas).

### Reutilizable (lo que da valor al juego nuevo)
| Activo | Estado | Uso en Cónclave |
|---|---|---|
| 43 guardianes con ficha del Códice (`assets/ui/codex/champions/*.png`, 1774×887, misma plantilla) | Excelente: ilustración + hoja de sprites + paleta | Arte de carta (se recorta la ilustración izquierda). 41 entran; los 2 Fundadores (`nano_gm`, `facu_gm`) no, por contrato (no transferibles). |
| Nombre/título/frase/origen de cada guardián (`js/data/champion-identity.js`) | 29 de 43 completos | Texto de carta. **12 sin entrada** (aelith, aurelia, brakk, bront, khepri, morveth, oriel, saelis, solciju, velmira, veyra, vhal) + los 2 Fundadores: para esos 12 leí el título impreso en su ficha del Códice; sin frase ni historia. |
| Bestiario: 46 enemigos en `ENEMY_BASE` + 57 carpetas de sprites (normales/subélite/élite/jefes) | Bueno pero **inconsistente**: algunos son atlas, otros frames sueltos, otros 42×33 px | 39 monstruos con arte limpio. Extraje el primer cuadro de cada atlas con un script (`tools/monstruos.py`). |
| 10 portadas de arena (`assets/ui/codex/arenas`, 1440×630) | Muy buenas | Fondos de linaje y cartas de Campo. |
| Audio: 73 SFX + 6 músicas, todo CC0 con créditos | Limpio legalmente | 8 SFX en el boceto. |
| Servidor: salas por código, cuentas, tienda, ranking, entitlements, pagos | Sólido | Base para cuentas, colección y matchmaking (ver §4). |
| Cultura de *gates* (balance, arte, habilidades) | Fuerte | Repliqué la idea: `tools/gate.js` (puntos, arte, mazos, 1.800 partidas bot-vs-bot). |

### Riesgos y deuda detectados
1. **El relay actual no sirve para cartas competitivas.** `server/relay.js` es un "cartero": el anfitrión simula todo y los
   invitados confían en él. En un duelo de cartas con mano oculta eso permite hacer trampa trivialmente (el anfitrión ve la mano
   rival). Hace falta servidor **autoritativo** (hecho en el boceto: `server/duel-server.js`).
2. **Plantel fragmentado:** solo 12 guardianes están en `CLASSES` (`champions.js`); el resto se registra en `portadores`,
   `expedition`, `ascension`, `quality-five`, `siete`. No hay una tabla única "id → rol/linaje/costo" legible sin ejecutar el juego.
   Roles y linajes de unos 24 guardianes en el boceto son **juicio mío a partir del título/imagen, provisional** (nombres y títulos sí son los de la ficha).
3. **Estado de lanzamiento:** Ilsa, Vorn y Kora están en TESTING (excluidos); Ascensión tiene regla de "arte pendiente".
   Reusarlos en un producto nuevo requiere decidir licencias/estado de cada uno.
4. **Arte heterogéneo:** los sprites de enemigos tienen escalas y formatos distintos; los alias visuales temporales
   (`visualAlias`) siguen en datos. Para cartas conviene un ilustrado por monstruo (hoy son sprites pixel-art ampliados).
5. **Peso:** 2,6 GB. Un juego de cartas web debe cargar < 30 MB: usar solo WebP, recortar, atlas.
6. **Arquitectura global sin módulos** (scripts en orden, todo en el espacio global): no conviene copiarla. El motor nuevo
   es puro/determinista/sin DOM (mismo archivo en navegador y servidor).
7. **Procedencia del arte:** parte de las fichas del Códice parece generada/pintada por una "fábrica" interna. Antes de
   publicar un producto comercial separado, confirmar derechos y política de uso (hay `legal/` y `docs/legal/`, no lo auditó a fondo).

## 2. El juego: reglas del boceto

**Fórmula:** TFT en el *qué* (linajes con sinergia por cantidad, economía de cristales, curva de poder) + cartas por turnos en
el *cómo* (1v1, mazo de 30, mano oculta). Se puede cambiar a auto-battler puro (ver propuestas).

* **Santuario** 40 PV. Mazo 30 cartas (máx. 5 guardianes únicos; monstruos ≤3 copias si cuestan ≤3, si no ≤2; resto ≤2).
* **Cristales** +1 por turno hasta 10. Tablero de 5 lugares. Mano máx. 8. Fatiga creciente.
* **Iniciativa:** quien abre empieza con 3 cartas y sin robo en el turno 1; quien responde con 5 + **Chispa** (+1 cristal).
  (Con 4 cartas y sin Chispa, abrir ganaba el 71 % en simulación; ahora 53 %.)
* **Monstruos** (39, costo 1–5): ATK/VID + palabras clave (Provocar, Rápido, Escudo, Robovida, Congela) + Ingreso / Al morir.
* **Guardianes** (41, costo 4–8, únicos): regla de puntos (ATK + VID + valor de palabras clave):
  monstruo ≤ 2·costo+2 (máx. 12) · guardián ≥ round(2,6·costo+3) y costo ≥ 4 (mín. 13) ⇒ **todo guardián supera a todo monstruo**
  (verificado por el gate: mínimo 13 vs. máximo 12). Además cada guardián tiene **Ingreso** de su linaje, **Habilidad** de rol
  (1 cristal, 1/turno) y **Definitiva** única por partida con carga (3 turnos; Ascensión: 2). Ascensión = +3 puntos de stats.
* **Roles** → Tanque (Provocar, Muralla), Asesino (Rápido, Tajo, Ejecución), Mago (Chispa Arcana, Cataclismo), Soporte (Sanar, Alba).
* **Linajes (sinergia TFT):** 2 unidades del mismo linaje en mesa → +1 ATK a todas; 3 → +1 VID; 4 → +1 ATK más. Seis linajes
  (Ciudad, Forja/Minas, Bosque/Hongos, Laberinto, Marea/Hielo, Infernal/Criptas) con un ingreso de guardián distinto.
* **Magia (21 cartas):**
  * *Hechizos*: Rayo, Llamarada, Escarcha, Tormenta de Cristal.
  * *Bonus que empoderan guardianes*: Corazón de Ceniza (+2/+2), Égida Ancestral (+0/+3 y Escudo), Sello de Mando (+3/+1 y Rápido); y de equipo: Bendición, Furia, Banquete, Piedra.
  * *Maldiciones que debilitan*: Debilitar, Podredumbre, Veneno, Silencio, Cadenas, Marchitar.
  * *Campos* (arena global): Gélida, Bosque Antiguo, Infernal.

## 3. Cómo se verificó (y qué NO)
* `node tools/gate.js 60` → 1.800 partidas bot-vs-bot: sin errores de invariantes (tablero ≤5, sin NaN, todas terminan),
  gana quien empieza 54 %, tasas por mazo 44–58 % (marea e infernal, 58 %, son los más fuertes), turnos totales promedio 13,8.
* `node tools/online-test.js` → dos clientes WebSocket juegan una partida completa contra el servidor: emparejamiento,
  acciones ilegales y fuera de turno rechazadas, **ninguna fuga de mano/mazo/semilla rival**.
* `tools/ui-test.js` y `tools/ui-scenario.js` (Playwright, Chromium): menú → colección → partida → jugar/atacar/habilidad/definitiva, sin errores de consola.
* **Limitaciones honestas:** el bot es voraz de 1 jugada (no lee bien combos ni guarda mano), así que los porcentajes
  solo indican "sin desastres", no balance de humanos. No probé dos navegadores reales contra el servidor, ni móvil, ni latencia.
  Solo hay 6 mazos prefabricados (+ "Caos" aleatorio en el motor, sin UI), sin constructor de mazos ni colección persistente.
  Las cartas de magia usan íconos emoji (arte pendiente). No es multijugador hasta que levantes el servidor.

## 4. Online 1v1 (diseño)
```
Cliente (UI)  ──intención {t:play|attack|ab|ult|end, uid, target}──▶  Servidor autoritativo (Node + ws)
     ▲                                                                   │ valida contra legalActions()
     └── {state: vista filtrada, legal[], events[], deadline} ◀──────────┘ aplica con RNG semillado
```
* El servidor corre `engine.js` (el mismo del cliente). El cliente es "tonto": solo muestra y envía intenciones.
* Cada jugador recibe **solo su vista** (la mano/mazo rival nunca viaja). Temporizador de turno de 60 s (el servidor cierra el turno).
* Reutilizable del repo: `ws`, salas por código, cuentas, sesiones, ranking, `entitlements.js` (qué guardianes posee cada cuenta).
* Falta para producción: reconexión (token ya emitido en cada `state`), MMR/emparejamiento por rango, persistencia de partidas/replays
  (el log de acciones + semilla alcanza para reproducir), anti-abuso por cuenta, versión de contrato (`PROTOCOL`), pruebas con latencia real.

## 5. Propuestas de mejora (ordenadas por impacto)
1. **Modo TFT real (auto-battler 1v1 "Horda")**: tienda de 5 cartas cada ronda, venta, fusión de 3 copias → ★2, y combate
   automático por turnos. Reutiliza todo el catálogo y las sinergias. Es el modo más fiel a lo que pediste; el duelo de cartas queda como modo "Cónclave".
2. **Constructor de mazos + colección persistente** con sobres/Tienda del juego actual (precios ya definidos en `pricing.js`).
3. **Jefes como cartas "Invocación"** (Leviatán, Minotauro, Jinete Sin Cabeza…): costo 8–10, un uso, con su regla propia como efecto.
4. **Habilidades reales de los guardianes** (hoy cada uno tiene 3 habilidades + definitiva en el ARPG): convertirlas en 1 habilidad + 1 definitiva distinta por guardián en vez de la plantilla por rol. Es el gran salto de identidad (y de trabajo).
5. **Posicionamiento 2×5 (frente/fondo) y rango** para que Tanques/Magos importen de verdad; ahora el tablero es una fila.
6. **Cartas de hechizo con arte propio** (usar los íconos de habilidad de `art-source/entregas/.../iconos/habilidades`: 183 PNG ya hechos).
7. **Temporadas/ranking** con el servidor actual; **modo coop PvE** contra una arena (reusa jefes) para onboarding.
8. **Pipeline de arte**: un único script `tools/monstruos.py` hoy extrae el primer cuadro; ideal pasarlo a un atlas WebP por linaje y a ilustrar los monstruos.
9. **Un gate de habilidades** al estilo `tools/bible/ability-gate.js` del repo: cada carta de magia con efecto visible y texto auto-generado verificado.

## 6. Cómo correrlo
```
# solo vs Bot: abrir index.html (o servirlo con cualquier servidor estático)
# online:  cd server && npm i && node duel-server.js   → en el menú: ws://localhost:8787
node tools/gate.js 60          # reglas de puntos + arte + mazos + 1.800 partidas
node tools/online-test.js      # prueba de protocolo online completa
```

---

# v0.2 — constructor de mazos, combate con posición y movimientos, mapas, modo Aventura

## Qué cambió
* **Constructor de mazos + colección + sobres** (`localStorage`): empezás con un linaje, ganás oro, abrís sobres (100 oro), armás hasta 6 mazos
  (filtros, curva de costos, "Completar", validación de reglas y de lo que tenés). "Modo prueba" desbloquea todo.
* **Combate tipo Pokémon con posición**: tablero 2 filas × 3 casillas. Cada unidad actúa 1 vez por turno y elige **Ataque, 3 habilidades o definitiva**.
  Cuerpo a cuerpo solo desde el frente y contra el frente rival (Provocar obliga); a distancia desde cualquier fila. Santuario expuesto solo si el frente rival está vacío.
  Mover/intercambiar cuesta 1 cristal. Habilidades de área pegan a toda la fila; las de línea, al objetivo y a quien está detrás.
* **Habilidades reales de cada guardián**: `tools/repo-skills.json` (extraído de las 43 fichas del ARPG: 3 habilidades + definitiva) → `tools/build-moves.js`
  conserva el **nombre** real y elige el **efecto** por arquetipo (cura, escudo, control, área, línea, invocación, desplazamiento…) leyendo la descripción original.
  **Es una traducción automática**: 164 movimientos, a revisar a mano guardián por guardián (p. ej. "Muro de Fuego" del mago quedó como daño de fila).
* **6 mapas = arenas de La Horda**, con terreno por fila: Ciudad (parapeto), Minas (oscuridad + terreno pesado), Infernal (brasas + fragua), Bosque (claro curativo),
  Laberinto (muros: frente inapuntable a distancia), Gélida (enfriamientos +1, escarcha). En línea cada jugador propone mapa y el servidor sortea.
* **Aventura** (6 capítulos = 6 arenas, 6 nodos cada uno): mazo inicial de 18 cartas + 1 guardián compañero a elección. Combates (**capturás un monstruo** del enemigo),
  aliados (**reclutás un guardián** del linaje), cofres (magia) y **jefe** ya en mesa (Campanero, Jinete Sin Cabeza, Devoraluz, Minotauro, Mago Gélido, Demonio Mayor; arte del bestiario).
  Todo lo ganado se suma también a la colección → segunda vía para conseguir cartas además de los sobres. El texto de historia es provisional.
* **Aventura acompañada (co-op)**: el anfitrión crea sala con el encuentro; un amigo entra con código. Juegan **como equipo** (misma mano y tablero) contra el bot del servidor.
  Al ganar, el anfitrión avanza su aventura y el invitado se lleva una carta a su colección.

## Verificación v0.2 (y límites)
* `node tools/gate.js 60`: puntos (guardián mín. 13 > monstruo máx. 12), arte, mazos, invariantes y 1.800 partidas bot-vs-bot con mapas rotando: mazos 42–56 %, quien abre 49 %, ~20 turnos totales, sin errores.
  Se ajustaron cartas del linaje Infernal (sin Rápido en los esqueletos) porque ganaba 70 %.
* `node tools/online-test.js` (1v1 autoritativo con mapa) y `node tools/coop-test.js` (anfitrión + invitado + bot en servidor; rechaza encuentros inválidos): OK, sin fugas de mano.
* `tools/ui-test.js` y `tools/ui-adv.js` (Playwright): constructor, sobres, preparación, partida completa y un capítulo entero de aventura (combates, aliado, cofre, jefe, pase al capítulo 2), sin errores de consola.
* `node tools/adventure-sim.js`: un bot simple completa ~25 % de las aventuras (reintentos ilimitados, política de recompensas básica). Los jefes son duros para ese bot; para humanos es una estimación, no una medición.
  Los jefes necesitaron ajustes (ATK 2, +3 cartas iniciales, +vida del jugador) porque con tablero propio desde el turno 1 eran casi imposibles.
* **No probado**: dos navegadores reales, móvil/vertical, latencia, reconexión, que el servidor mantenga cuentas/colección (hoy todo es `localStorage` y el co-op confía en el cliente para las recompensas: es PvE).

---

# v0.3 — cuestionario del invocador, "monstruos", revisión de habilidades
* **Cuestionario inicial del invocador** (pantalla de apertura que le habla al jugador, "cuarta pared"): nombre + 7 preguntas, cada respuesta suma a 4 roles y 6 linajes.
  Resultado: un título ("Invocador Muralla / de Filo / Estratega / de Cobijo"), el linaje favorito y **3 guardianes iniciales** (solo guardianes comunes de costo ≤ 5, máx. 2 del mismo rol).
  Con eso se arma el mazo inicial (25 cartas del linaje + los 3 héroes + relleno) y esos mismos 3 son los compañeros a elegir al empezar la Aventura. Se puede rehacer desde el inicio
  (suma los nuevos héroes a la colección sin tocar el resto). Verificado: 400 combinaciones aleatorias de puntajes dan siempre mazo válido y 3 héroes.
  Las preguntas y las respuestas del narrador son texto provisional: conviene que las revise quien escriba el tono del juego.
* **"Bicho" → "Monstruo"** en toda la interfaz y los documentos (internamente el tipo de carta sigue llamándose `bicho` en el código, es solo una clave).
* **Revisión manual de habilidades** de los 41 guardianes (`tools/moves-reviewed.js`): la traducción automática de la v0.2 dejaba errores (p. ej. habilidades de salto sin cambio de fila,
  invocaciones tratadas como daño). Ahora cada movimiento tiene efecto escrito a mano y se agregaron 3 invocaciones (Lobo Espectral, Granadero Espectral, Gólem de Carne).
  Tabla completa original vs. duelo en `docs/HABILIDADES.md` (generada con `node tools/make-skills-doc.js`).
  Sigue siendo una **traducción**: lo que en el ARPG es velocidad, crítico, estelas o transformación aquí es daño por fila/columna, congelar, veneno, escudo o invocar.
  Tras la revisión: mazos 42–58 %, quien abre 48 %, 1.800 partidas sin errores.

---

# v0.4 — pasivas, ataques propios, vidas distintas, invocador con vida y habilidades, prueba de claridad
* **Pasiva de cada guardián** (41): 34 con el nombre y texto reales del ARPG (`tools/repo-passives.json`) y **7 propuestas mías** donde el ARPG no tiene una escrita
  (Eslabón, Brasa, Farolero, Iria, Morwen, Myla, Ynara; marcadas en `docs/HABILIDADES.md`). Disparadores: inicio de turno, al recibir daño, al atacar, al usar habilidad,
  al caer unidades, "sobrevive una vez" (San Martín) y estáticas (reducción de daño, +daño a envenenados/congelados, +ATK con poca vida, curas más fuertes).
  Verificado con `node tools/passive-test.js`: las 31 pasivas activables se disparan y las estáticas se comprueban contra el motor.
* **Ataque básico distinto por guardián**: nombre real (identity o arma del ARPG) y forma propia (golpe simple, fila, columna, doble golpe, golpe + veneno, golpe + cura al equipo);
  el alcance (cuerpo a cuerpo / distancia) sale del alcance real en el ARPG (≥ 200 u = distancia).
* **Vidas y ataques distintos**: el reparto ATK/VIDA de cada guardián sale de su relación daño/vida real (`tools/repo-stats.json`), no de una fórmula única por rol
  (p. ej. Bront 4/17, Segador 3/10, San Martín 10/6, Vhal 12/13). El presupuesto de puntos por costo no cambia (el gate sigue exigiendo guardián mín. 13 > monstruo máx. 12).
* **Invocador con vida**: la vida del Invocador (🔮, antes "Santuario") es lo que los guardianes tienen que bajar. Base 40. **Rango**: +2 de vida máxima cada 2 victorias (hasta +12)
  contra el Bot, en la Aventura y en cooperativo; en el 1v1 entre personas nadie recibe bonus. (Interpretación mía de "agregar puntos de vida al invocador al ganar"; es una perilla en `summonerBonus`.)
* **Habilidades del invocador**: 8 disponibles (Égida, Voz de Mando, Aliento, Paso Táctico, Llamado a la Horda, Mal de Ojo, Soplo Gélido, Segundo Aliento); cada jugador lleva **2**
  que elige antes de jugar. Cuestan cristales, tienen enfriamiento y no gastan la acción de ninguna unidad. El servidor valida el par elegido; en las 1.800 partidas de balance se usaron las 8.
* **Prueba de claridad** (`node tools/clarity-test.js`): un jugador novato automático que solo usa lo que muestra la pantalla (barra dorada de instrucciones, bordes verdes/rojos, botones habilitados, panel de movimientos).
  Resultado: instrucción en el 100 % de los puntos de decisión (77), 0 incoherencias entre lo que dice la barra y lo que se ve, 0 callejones sin salida, "Terminar turno" siempre disponible, el tutorial aparece la primera vez y se cierra.
  **Esto no reemplaza una prueba con personas**: mide coherencia y operabilidad, no si alguien lo entiende a la primera. Lo que se agregó por la revisión: barra de ayuda contextual, tutorial de 5 pasos (botón "? Cómo se juega"),
  botón "Terminar turno" que parpadea cuando no queda nada por hacer, etiquetas "Invocador" y vida actual/máxima, y los paneles movidos para no tapar la ayuda.

---

# v0.5 — animaciones de combate, trampas, más cartas con efectos, ayuda de maná
* **Animación de combate**: la carta que actúa se levanta. Si ataca a otra unidad cuerpo a cuerpo, **se levantan las dos y chocan** en el medio (💥); si es a distancia, sale un proyectil y la otra se levanta y se sacude.
  Si ataca al Invocador, **sale su cristal 🔮 (la vida)** y la carta se lanza y le pega. Apoyos y habilidades sin objetivo: la unidad se levanta y brilla. Se reproduce sobre el tablero anterior y después se pinta el nuevo (los clics se ignoran ~1 s).
* **Trampas** (6, tipo de carta nuevo): se colocan boca abajo (máx. 2), son secretas para el rival (el servidor ni siquiera le manda cuál es) y se disparan solas:
  Trampa de Espinas (ataque a una unidad), Muro de Escarcha y Barrera Sagrada (ataque al Invocador; anulan el ataque), Espejo Arcano (anula un hechizo/maldición), Emboscada (al desplegar una unidad), Red de Cazador (al usar una habilidad).
* **9 cartas nuevas con efectos**: Inspiración, Segunda Oportunidad, Robo de Vida, Fuego Directo, Invierno, Marea Curativa, Manada, Muro de Piedra, Pacto de Sangre. Los 6 mazos iniciales incluyen trampas y cartas nuevas.
* **Constructor**: botón grande **"＋ Crear mazo nuevo"**, panel de reglas del mazo, hasta 8 mazos, pestaña de Trampas y una explicación la primera vez que se entra.
* **Maná explicado**: el maná (cristales ✦) es **del Invocador, no de los guardianes**; qué se paga con cristales, qué es gratis (Ataque y definitiva con carga) y **cómo se activa una habilidad** (unidad con borde verde → movimiento en el panel → objetivo). Está en el tutorial (6 pasos), en las reglas, en el resultado del cuestionario y en el primer ingreso al constructor.
* Verificado: balance 1.800 partidas (todas terminan, trampas colocadas y disparadas), pruebas de pasivas, 1v1 y cooperativo (sin fuga de trampas rivales), prueba de claridad (0 incoherencias, 0 callejones; descubrió que los clics durante una animación se ignoraban y se ajustó la prueba),
  y capturas de las animaciones (`tools/ui-anim.js`).
* **No probado**: sensación real de las animaciones en celular/equipos lentos; balance con personas (las trampas dependen de que el rival juegue "tonto"; el bot las usa por valoración simple).

---

# v0.6 — sinergias y combos (mazos de arquetipo)
* **Tipos (etiquetas) de monstruos**: Bestia, Planta, Esqueleto, Demonio, Hielo, Ciudadano, Cristal, Golem, Máquina, Construcción. Las cartas con sinergia reaccionan a ellos.
* **Mecánicas nuevas del motor**: estado **quemado 🔥** (daño cada turno, como el veneno); disparadores *cuando desplegás un aliado (de cierto tipo o invocación)* y *cuando se dispara una de tus trampas*;
  bonus por cantidad (*+1 ATK por cada otro aliado de tipo X*); daño extra contra un estado (*si está en llamas / congelada*); efectos que apuntan a un tipo (*todas tus Bestias*) o a un estado (*enemigos congelados / en llamas*); sacrificar una invocación.
  La pasiva de un monstruo cuenta 2 puntos en el presupuesto (el gate lo verifica).
* **15 monstruos y 14 cartas de magia/trampa nuevos** (29 en total), armados en 6 arquetipos que son los mazos iniciales de cada linaje:
  | Linaje | Arquetipo | Piezas clave |
  |---|---|---|
  | Bosque | Manada y raíces | Lobo Alfa + Manada (+1/+1 a cada lobo), Rugido de la Manada (+2 ATK y Rápido a todas las Bestias), Raíz Madre, Marea Curativa, Zarzas Venenosas |
  | Infernal | Fuego y huesos | Chispa Ígnea → Combustión (5 a lo que arde), Imp Pirómano, Demonio de Ceniza, Pira Funeraria, Piromante (+2 vs fuego); Osario + Capataz + Rey Esqueleto |
  | Marea | Hielo quebradizo | Escarcha / Ventisca / Reina de Escarcha congelan; Quebrar y Rompehielos castigan lo congelado |
  | Ciudad | Turba | Agitador (+1 ATK por cada Ciudadano), Líder de la Turba (da Rápido al que desplegás), Estampida |
  | Forja | Fábrica de cristal | Veta de Cristal + Cristal Resonante; Ingeniero de Minas mejora invocaciones; Sobrecarga las convierte en 4 de daño |
  | Laberinto | Trampas y espejos | Cartógrafo (roba) y Guardia del Laberinto (cura) cuando se dispara una trampa tuya; Espinas, Pasillo sin Salida, Espejismo |
* **Constructor**: panel **⚡ Sinergias de tu mazo** (qué combos tenés completos y cuáles te faltan, marcando lo que ya poseés), ⚡ en la lista de cartas que completan un combo con tu mazo y línea "⚡ Combina con…" en la vista grande de cada carta.
  Hay 13 combos definidos (`COMBOS` en `data.js`).
* **Verificación**: `node tools/combo-test.js` (64 comprobaciones: cada combo funciona en el motor, no solo en el texto), gate de 1.800 partidas con los nuevos mazos (todas terminan, mazos 36–60 %), pasivas, 1v1, cooperativo, claridad y animaciones.
* **Límites**: el Ciudad queda en ~36 % contra el bot (el más flojo; se probó cambiar guardianes y su Ingreso sin resolverlo del todo) e Infernal en ~60 %. Los monstruos nuevos reutilizan sprites existentes (3 con arte nuevo extraído de jefes; el resto con un filtro de color) hasta que haya arte propio.
  El bot no planifica combos: los porcentajes miden solidez, no el techo de cada arquetipo con una persona.

---

# v0.7 — rareza, paquetes premium temáticos, polvo y fabricación
* **Rareza** (gema de color en la carta; 41 Comunes · 37 Poco comunes · 30 Raras · 26 Épicas · 7 Legendarias): sale del tipo y el costo (guardianes costo ≤ 4 Raras, ≥ 5 Épicas, Ascensión Legendarias; los monstruos con efecto suben un nivel). **No cambia el poder**. Las Legendarias van de a 1 copia por mazo (también en el servidor).
* **Sobres**: estándar (oro), **6 paquetes premium temáticos** (Invierno, Bosque, Fuego y Huesos, Ciudad, Forja, Laberinto; más chances de las mejores cartas del tema) y **Paquete Dorado**. Probabilidades, garantías (pity) y refuerzo del tema a la vista; compra con confirmación; límite diario; interruptor por región. Pagos reales no conectados (Brasas de prueba).
* **Polvo y fabricación**: las repetidas se convierten en polvo y con él se fabrica cualquier carta o se recicla lo que sobra.
* **Economía** del prototipo: 15/5 de oro por victoria/derrota (Aventura 20 y 60 por jefe), 400 de oro iniciales.
* **Verificación**: `node tools/packs-test.js` (20.000 aperturas por paquete: garantías, pity, refuerzo del tema, sin cartas prohibidas, repetidas → polvo, todo fabricable), `node tools/economy-sim2.js` (gratis vs. paga), prueba de interfaz de la tienda (`tools/ui-packs.js`) y las regresiones anteriores.
* **Límites**: el refuerzo del tema y el pity son diseño mío, no medidos con jugadores; el ingreso real depende de contenido por temporada; hay que pasar por revisión legal antes de cobrar (ver §5.7 del análisis).
