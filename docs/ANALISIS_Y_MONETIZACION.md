# La Horda: Cónclave — análisis del juego, encaje con La Horda y monetización

Estado analizado: boceto v0.6 (rama `claude/dreamy-meitner-ui51qq`). Todo lo medido sale de las herramientas del repo; lo que es opinión o supuesto de industria está marcado como tal.

## 1. Resumen
1. **Hay un juego con identidad propia**: duelo de cartas donde importan la posición (2 filas), el movimiento elegido por unidad (estilo Pokémon, con las habilidades reales de los 41 guardianes), el Invocador (vida, rango, 2 habilidades de apoyo), las trampas y los combos por arquetipo. Eso lo separa de un clon de Hearthstone.
2. **El mayor riesgo visible es el arte**: los guardianes son ilustraciones pintadas con escenario y los monstruos son sprites de pixel art de 18–37 px ampliados hasta ×8. El juez de arte lo cuantifica (§4). Hoy una carta de guardián enfrentada a un monstruo "no pega", como dijiste.
3. **La economía actual no se puede monetizar**: con 6 partidas por día un jugador gratis tiene el 91 % de las copias a los 30 días (§5.3).
4. **Hay un conflicto de política que conviene decidir antes de vender sobres**: la política de precios de La Horda dice *"sin cajas sorpresa, sin probabilidades ocultas"* y *"Brasas solo compran apariencia, nunca poder"*. **Todo sobre de cartas al azar es una caja sorpresa** (se pague con oro o con dinero). Hay tres caminos y recomiendo el A, sin azar (§5.2).
5. **Recomendación**: lanzarlo primero como **complemento dentro de La Horda** (misma cuenta, billetera, guardianes y servidor), validar retención, y recién después evaluar un producto aparte.

## 2. Qué mide hoy el juego (y qué no)
| Medido | Resultado |
|---|---|
| Balance entre los 6 mazos iniciales (1.800 partidas, bot, mapas rotando) | 36–60 %; Ciudad (Turba) es el más flojo (~36 %), Infernal el más fuerte (~60 %) |
| Quien abre gana | ~52 % |
| Largo de partida | ~25 turnos entre ambos jugadores (≈12 cada uno) |
| Poder por guardián (`tools/power-scan.js`) | La dispersión entre guardianes (5,3 pts) es igual al ruido de la medición (5,1): **no se detectan guardianes rotos**. Los de Ascensión no rinden más que los comunes (−0,4 vs +0,6) |
| ¿Tener más cartas gana? (`tools/economy-sim.js`) | Con el armador de mazos heurístico, la tasa de victoria **no sube** con la colección (52 % → 52 %). **Inconcluso**: el armador no supera a los mazos iniciales curados, así que no prueba que "más cartas no ayuda", solo que los mazos iniciales ya son competitivos |
| Pruebas automáticas | Motor, pasivas (31/31), combos (64 comprobaciones), online sin fuga de mano ni trampas, cooperativo, claridad (0 callejones) |

**No está medido**: cómo juega y qué entiende una persona (la prueba de claridad es automática); balance contra humanos (el bot no arma combos a propósito); sensación en celular; latencia real; retención.

### Fortalezas
- Motor determinista y servidor autoritativo: la mano del rival nunca sale del servidor (base para ranking y para no permitir trampas).
- Profundidad por capas: posición × movimiento × maná del Invocador × trampas × combos, y una ayuda contextual y un tutorial.
- Reutiliza lo caro de La Horda: 41 guardianes con kit, pasivas y estadísticas reales, 10 arenas, audio CC0.

### Riesgos (ordenados)
1. **Arte incoherente** (alto, visible desde la primera pantalla).
2. **Complejidad de entrada**: filas, alcances, cristales, habilidades, definitivas con carga, trampas, tipos, estados. Es mucho para una primera partida; falta la prueba con personas.
3. **Duración**: ~12 turnos por jugador es largo para celular. Conviene un modo corto (vida 25, mano inicial mayor) o límite de tiempo por turno.
4. **Balance medido solo con un bot voraz**: un meta humano va a encontrar combos que el bot no ve. Hace falta telemetría de partidas y parches rápidos.
5. **Persistencia**: oro, colección y mazos viven en `localStorage`. Con cualquier valor real hay que moverlos a cuentas y servidor (el servidor de La Horda ya tiene cuentas, billetera y entitlements).
6. **Derechos del arte**: las ilustraciones del Códice parecen generadas o asistidas por IA. Para vender, conviene saber qué se puede registrar como propio y documentar el proceso (no es asesoría legal).
7. **Contenido**: 106 cartas de unidad + 33 hechizos/bonus/maldiciones/trampas. Alcanza para un arranque, no para sostener temporadas sin un plan de contenido (§6).

## 3. Cónclave y La Horda: ¿complemento o juego aparte?
| | **Complemento dentro de La Horda** | **Producto aparte** |
|---|---|---|
| Cuenta, billetera (oro y Brasas), entitlements, pagos, pase | Ya existen: se reutilizan | Hay que replicarlos o exponerlos como servicio |
| Guardianes | Los que tenés en La Horda pueden ser tus cartas (sinergia entre juegos) | Se rehace la adquisición |
| Audiencia | La que ya tiene el ARPG | Nueva, hay que adquirirla |
| Riesgo | Diluye el foco del ARPG; hay que cuidar que no compita por la misma billetera | Costo de lanzamiento y soporte duplicado |
| Política de monetización | Hereda "sin poder por dinero" | Puede definir la suya (pero La Horda es la marca) |

**Recomendación (opinión)**: fase 1 como **modo "Cónclave" dentro de La Horda**, con progresión cruzada simple (ganar partidas da oro y apariencias; los guardianes que ya tenés aparecen desbloqueados como cartas). Si la retención del modo es buena, fase 2: versión independiente (móvil/Steam) con el mismo servidor. El modo Aventura (solo/cooperativo) es el puente natural para jugadores del ARPG.

## 4. Arte: el juez y el plan
### Lo que midió el juez (`python3 tools/art-judge.py`, informe en `docs/ART_JUDGE_REPORT.md`)
- **Guardianes (41)**: nota A en todos. (Una versión anterior del juez marcaba 16 por "restos de la ficha"; era un falso positivo —detectaba bastones y armas verticales— y se quitó ese criterio.)
- **Monstruos (65)**: 35 A · 17 B · 13 C. **47 son pixel art ampliado**, de **18 a 37 px nativos** (hasta ×8); **8 están reescalados con suavizado (borrosos)**; **12 son variantes teñidas** de otro sprite (los monstruos de sinergia que agregué: es provisorio).
- **Brecha de estilo guardián ↔ monstruo**: todos los monstruos están lejos del canon (pixel vs. pintado, sin escenario, otra paleta). Peores: Dama del Bosque (18 px ×8, casi ilegible), Dragoncito de Hielo, Medusa Eléctrica, Lobo Alfa, Líder de la Turba.
- `python3 tools/art-judge.py --gate` **hoy falla** (borrosos + brecha), a propósito: marca el trabajo pendiente.

### Cómo evitar que un guardián "no pegue" con un monstruo
1. **Un canon único** para todas las cartas: ilustración chibi pintada, escenario de ruinas al atardecer (el de los guardianes), mismo marco y proporción. Los monstruos se re-ilustran a ese canon (65 + 8 jefes + íconos de hechizos).
2. **Flujo de producción con juez**: generar con referencia (guardianes como referencia de estilo) → `art-judge.py --image` descarta lo evidente (resolución, fondo, paleta, escala) → revisión visual → **aprobación de una persona** → recién ahí entra a la carta. El juez automático ordena; no reemplaza al director de arte.
3. **El juez también audita lo ya implementado** (como arriba) y se puede enganchar al gate de CI para que ninguna carta nueva entre con nota menor a B.

### Sobre "Anakin dibujante"
No lo encontré: no está en tus conectores, no aparece en el registro de conectores ni en el repo de La Horda. Lo que **sí** tengo conectado para generar imágenes es **Runway** (modelos de imagen) y **Hugging Face**. Puedo hacer un **piloto de 3–4 monstruos** con Runway usando los guardianes como referencia de estilo y pasarlos por el juez. **Eso consume créditos de la organización, por eso no lo hice sin que me lo confirmes.** Si "Anakin" es otra herramienta (por ejemplo Anakin.ai), habría que conectarla o pasarme una clave.

## 5. Monetización sin pay-to-win
### 5.1 Principios
1. **El poder se gana jugando**; el dinero compra identidad y comodidad. Es la política que ya tiene La Horda.
2. **Todo lo que afecte una partida debe poder conseguirse sin pagar** y en un tiempo razonable.
3. **Sin FOMO de poder**: lo que sale en un pase o evento vuelve a estar disponible.
4. **Transparencia**: contenido o probabilidades visibles, con garantías.

### 5.2 Cómo se consiguen cartas y qué se vende (corregido)
**Aclaración importante**: un sobre de cartas al azar *es* una caja sorpresa, se pague con dinero real o con oro ganado jugando. En una versión anterior de este documento propuse un "sobre de oro" aleatorio como si fuera inocuo; no lo es. Lo que cambia entre pagar con oro y con dinero es el **riesgo** (con oro no hay gasto real ni regulación de apuestas), no la **mecánica**. Además el prototipo actual abre sobres aleatorios con oro como *placeholder*: hay que decidir qué se hace con eso.

La política de La Horda dice "sin cajas sorpresa, sin probabilidades ocultas". Hay tres caminos; **la decisión es del dueño**:

| Camino | Cómo se consiguen las cartas | Qué se vende por dinero | Riesgo |
|---|---|---|---|
| **A. Sin azar (recomendado: coherente con la política)** | Aventura (capturar y reclutar), misiones, pase, **tienda de cartas con oro** (precio fijo por rareza), **polvo** para fabricar, mazos iniciales de contenido fijo, y "elegí 1 de 3" | Cosméticos (marcos, reversos, fondos de tablero, avatares, efectos), pase de temporada (ruta premium cosmética), **mazos/paquetes de contenido fijo** (se ve qué trae antes de comprar) | Bajo. Es más difícil que "abrir sobres" sea el gancho: la emoción pasa a la Aventura, a elegir y a armar combos |
| **B. Azar solo con moneda blanda** | Sobres aleatorios comprados **solo con oro ganado jugando** (el oro nunca se vende), con probabilidades visibles y garantías | Igual que A (cosméticos, pase, paquetes fijos) | Medio. Sigue siendo una mecánica de caja sorpresa y hay que vigilar que el oro no se pueda comprar ni indirectamente |
| **C. Azar con dinero real** | Sobres aleatorios de pago | Sobres | Alto: contradice la política; regulado o prohibido en varios países (por ejemplo Bélgica y Países Bajos); las tiendas exigen publicar probabilidades. **No lo recomiendo** |

Productos que valen en cualquiera de los caminos (no tienen azar):
| Producto | Se paga con | Contenido | ¿Riesgo de pay-to-win? |
|---|---|---|---|
| **Mazo de linaje (contenido fijo)** | Oro o dinero real | 30 cartas armadas de un arquetipo, visibles antes de comprar | Bajo si las mismas cartas se ganan jugando |
| **Carta suelta en la tienda** | Oro | Una carta elegida, precio fijo por rareza | Ninguno (se gana jugando) |
| **Elegí 1 de 3** | Recompensa de Aventura / pase | Se muestran 3 cartas y te llevás 1 | Ninguno |
| **Sobre de apariencia** | Brasas ✦ / dinero real | Variantes visuales de cartas que **ya tenés**; si se quiere evitar el azar, mostrar el contenido | Ninguno (sin estadísticas) |
| **Cosméticos**: fondo de tablero, reverso, avatar de Invocador, efectos de combate, emotes | Brasas ✦ | Solo apariencia | Ninguno |
| **Pase de temporada** | Brasas ✦ (ruta premium) | **Ruta gratis**: cartas nuevas + oro. **Ruta premium**: cosméticos + Brasas | Ninguno si las cartas están en la ruta gratis |

### 5.3 La economía hoy no soporta esto (medido, `tools/economy-sim.js`)
Con 80 de oro por victoria, 30 por derrota y sobres de 100 de oro:
| Partidas por día | Copias coleccionadas a los 30 días | Guardianes a los 30 días |
|---|---|---|
| 3 | 76 % | 28/41 |
| 6 | **91 %** | 32/41 |
| 10 | 98 % | 39/41 |

Con 25/10 de oro por victoria/derrota: 41 %, 59 % y 71 % (guardianes 15, 19 y 23). Con 15/5: 31 %, 43 % y 58 %. **Un objetivo razonable** (opinión): un jugador de 5–6 partidas por día debería tener ~40–50 % de la colección a los 30 días y completarla en 4–6 meses. Para eso: bajar el oro por partida, añadir **polvo de cartas** (los repetidos se convierten en polvo para fabricar cualquier carta: evita que el azar sea lo único), misiones diarias y un tope diario de oro.

### 5.4 Escenarios de ingreso (supuestos de industria, NO mediciones de este juego)
Ingreso mensual ≈ jugadores activos × % que paga × gasto medio de quien paga.
| Jugadores activos | % que paga | Gasto medio mensual | Ingreso mensual |
|---|---|---|---|
| 5.000 | 2 % | US$ 8 | ~US$ 800 |
| 5.000 | 4 % | US$ 12 | ~US$ 2.400 |
| 50.000 | 3 % | US$ 10 | ~US$ 15.000 |
Referencias de precio dentro de La Horda: 1 Brasa ✦ ≈ US$ 0,01; skins de 300 a 1.200 ✦ (US$ 3–12); pase provisorio en 950 ✦. Costos a considerar: re-ilustrar 65 monstruos, servidor, soporte y las comisiones de las tiendas (~30 %).

### 5.5 Contenido por temporada (lo que pediste: "en cada pasada ir incluyendo cartas")
Cada temporada (8 semanas): **~12 cartas** (un arquetipo: 4 monstruos, 4 hechizos o bonus, 2 trampas, 2 guardianes), **1 mapa nuevo**, una línea de cosméticos y un ajuste de balance. Todas las cartas nuevas entran a la ruta **gratis** del pase. Orden sugerido, aprovechando las arenas de La Horda que todavía no están en el juego: T1 *Reino Fúngico* (esporas), T2 *Arena Acuática* (mareas), T3 *Abismo*, T4 *Fábrica Sin Fin*. Los guardianes en prueba (Ilsa, Vorn, Kora) pueden debutar como estrellas de T1.

### 5.6 Cumplimiento (no es asesoría legal)
Probabilidades visibles, sin compras de un toque para menores, reembolsos según la tienda, y confirmar la titularidad del arte antes de cobrar por él.

## 6. Hoja de ruta sugerida (90 días)
1. **Semanas 1–2 — validar con personas**: 10–15 jugadores, medir tiempo hasta el primer ataque, % que termina el tutorial, partidas por sesión, dónde se traban. Es la prueba que falta.
2. **Semanas 2–6 — arte**: canon único, piloto de 4 monstruos con juez, después los 65 por tandas de 10 con revisión humana.
3. **Semanas 4–8 — cuentas y economía**: pasar colección y oro al servidor, economía lenta + polvo, probabilidades visibles.
4. **Semanas 8–12 — temporada 1** y modo corto; ranking simple.
Métricas de salida: retención día 1/7, partidas por jugador activo, % que prueba la Aventura, conversión a pagador, y la dispersión de tasas de victoria por mazo (que ningún arquetipo pase del 55 % con humanos).

## 7. Qué hice y qué no
Hice: el juez de arte (`tools/art-judge.py`), el simulador de economía y el análisis de poder por guardián, y este documento. **No hice**: generar imágenes (necesito tu confirmación por los créditos y saber qué es "Anakin"), pruebas con personas, ni medir nada de ingresos reales.

### 5.7 Decisión del dueño (v0.7): paquetes premium aleatorios por tema + rareza
**Decisión**: se vende **azar con dinero real** (Camino C de §5.2): paquetes premium temáticos —por ejemplo el **Paquete de Invierno**, con más chances de las mejores cartas de hielo— y un **sistema de rareza** (Común, Poco común, Rara, Épica, Legendaria). Esto reemplaza, **solo para Cónclave**, la política "sin cajas sorpresa" de La Horda (que sigue vigente en el ARPG). Está registrado en `docs/DECISIONES.md`. Sigue siendo una caja sorpresa de pago y tiene riesgo regulatorio: por eso se construyó con estas protecciones, todas verificadas por pruebas:

| Protección | Cómo está hecha |
|---|---|
| Probabilidades visibles y reales | Cada paquete muestra el % por rareza, la garantía y el refuerzo del tema; `tools/packs-test.js` mide 20.000 aperturas por paquete y comprueba que coincide |
| Garantías (pity) | Paquete premium: ≥ 1 Rara o mejor; Épica o mejor como máximo cada 10 paquetes y Legendaria cada 40. Estándar: Épica cada 25, Legendaria cada 120. Dorado: Épica cada 3, Legendaria cada 15. El contador se ve en el paquete |
| Repetidas protegidas | Una carta que ya tenés (al máximo de copias) se convierte en **polvo** (3 a 200 según rareza); no se pierde |
| Todo se puede conseguir sin pagar | **Fabricar** cualquier carta con polvo (40 a 2.000), Aventura (capturar y reclutar), sobres de oro ganado jugando |
| Límite y control | Límite diario de paquetes premium elegido por el jugador; confirmación con precio y probabilidades antes de cada compra |
| Interruptor por región | `PAID_RANDOM_ENABLED` (en `index.html`): en `false` los paquetes de pago no se ofrecen (para países donde está prohibido o regulado) |
| La rareza no es poder | El poder sale del costo (gate de puntos): la rareza solo dice qué tan difícil es conseguirla. **Excepción a revisar**: las Legendarias son las 7 cartas de Ascensión, que tienen +3 puntos de estadísticas; si se venden en paquetes conviene quitar ese bonus (el análisis de poder no detecta diferencia, pero es un vector de pay-to-win) |

**Paquetes** (1 ✦ ≈ US$ 0,01, referencia del repo original): Sobre estándar (oro) 100; **Paquete temático** (Invierno, Bosque, Fuego y Huesos, Ciudad, Forja, Laberinto) 150 ✦ ≈ US$ 1,50; **Paquete Dorado** (todas Raras o mejores) 450 ✦ ≈ US$ 4,50. En el Paquete de Invierno una Épica del tema sale en ~21 % de las cartas (×5 que en un sobre común) y una Legendaria del tema en ~46 % (×3). **Los pagos reales no están conectados**: las Brasas del prototipo son de prueba.

**Rareza (141 cartas)**: Común 41 · Poco común 37 · Rara 30 · Épica 26 · Legendaria 7.

**Qué mide la economía** (`tools/economy-sim2.js`, supuestos explícitos, NO jugadores reales; 5 partidas por día al 50 %; el jugador fabrica con polvo lo mejor de su linaje). Con la economía que quedó en el prototipo (15/5 de oro por victoria/derrota, polvo ×0,5; misión diaria de 20 en la simulación):
| Perfil | Día 30 | Día 90 |
|---|---|---|
| Gratis | 54 % de las cartas, 1,8/7 Legendarias | 77 %, 2,5/7 |
| Paga US$ 10/mes | 59 %, 2,0/7 | 80 %, 3,3/7 |
| Paga US$ 20/mes | 64 %, 2,1/7 | 82 %, 2,9/7 |
| Paga US$ 100/mes | 76 %, 2,8/7 | 91 %, 4,3/7 |
Lectura (opinión): la **ventaja de quien paga es chica** (el pozo es de solo 141 cartas y el polvo compensa), lo que baja el riesgo de pay-to-win pero también **limita el ingreso por paquetes**: para que paguen hay que sumar contenido cada temporada (§5.5) y vender también cosméticos y pase. Esto mide **colección**, no tasa de victoria.

**Antes de cobrar con dinero real** (lista de verificación, no es asesoría legal; consultar a un abogado): Bélgica y Países Bajos regulan o prohíben las cajas de pago (desactivar la región); Brasil aprobó en 2025 una ley que prohíbe cajas de recompensa en juegos para menores (verificar vigencia y alcance); Apple y Google exigen publicar las probabilidades; en la UE y Argentina rigen las reglas de consumo (precio claro en moneda real, derecho de arrepentimiento); clasificación por edad con la leyenda de "compras con objetos aleatorios"; control de menores (sin compras de un toque, tope de gasto); soporte y reembolsos; y confirmar la titularidad del arte antes de vender cartas con él.

