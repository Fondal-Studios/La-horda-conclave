# Prompts listos para abrir otras sesiones

Copiar y pegar el bloque que corresponda al abrir una sesión nueva sobre este repositorio (`Fondal-Studios/La-horda-conclave`, rama `main`). Cada prompt asume que la sesión lee `CLAUDE.md` y `docs/HANDOFF.md` primero.

---

## 1. Sesión de juego (reglas, balance, interfaz, servidor)

```
Estás trabajando en "La Horda: Cónclave", un duelo de cartas 1v1 por turnos (repo Fondal-Studios/La-horda-conclave, rama main).
Leé primero CLAUDE.md, docs/HANDOFF.md, docs/DECISIONES.md y la última sección de docs/DISENO.md. Hablame en español rioplatense (voseo).

Estado: v0.7 (rareza, paquetes premium temáticos, polvo, trampas, sinergias, aventura solo/cooperativa, constructor de mazos, animaciones).
Todo está probado con herramientas automáticas (node tools/gate.js 20, passive-test, combo-test, packs-test, online-test, coop-test; UI con Playwright), pero NO con personas ni celular.

Quiero que, en este orden, y mostrándome qué probaste de cada cosa:
1. Corré todas las pruebas y confirmá que el repo está sano (si algo falla, decímelo antes de seguir).
2. Ajustá el mazo de Ciudad (Turba), que es el más flojo (~36 % contra el bot) y revisá Infernal (~60 %), sin romper el presupuesto de puntos ni los combos (node tools/combo-test.js).
3. Armá un modo corto de partida (menos vida y mano inicial mayor) para celular y medí su balance con tools/gate.js.
4. Preparame un plan de prueba con 10–15 personas (guion, qué medir: tiempo hasta el primer ataque, % que termina el tutorial, dónde se traban) y una hoja para anotar resultados. No inventes resultados.
5. Prototipá el modo Draft (cartas prestadas, sin colección) como cola sin pay-to-win.
Reglas: no cambies la política de monetización ni conectes pagos reales; no afirmes como resuelto lo que solo midió el bot; commits en español; trabajá en una rama nueva y avisame antes de mergear a main.
```

---

## 2. Sesión de arte (para Anakin, la IA que corre en la computadora del dueño)

```
Sos el ilustrador de "La Horda: Cónclave". Trabajás en el repo Fondal-Studios/La-horda-conclave (clonalo y leé CLAUDE.md y docs/ART_BRIEF.md).
Objetivo: reemplazar los sprites de pixel art de los 65 monstruos y jefes por ilustraciones pintadas que se vean de la misma familia que los 41 guardianes (mirá assets/g/mago.webp, tanque.webp y segador.webp como referencia de estilo).

Para cada carta de la lista de docs/ART_BRIEF.md (empezá por las de peor nota):
1. Generá una ilustración: PNG o WebP OPACO de 600x680 (mínimo 300x340), estilo chibi pintado, criatura de cuerpo completo en 3/4, escenario de ruinas a contraluz con una luna grande (ver el brief por linaje), sin texto ni firma ni marco, conservando la silueta y el color característico del sprite actual (assets/b/<id>.png).
2. Guardala como assets/art-incoming/<id>.png (el id es el de la tabla).
3. Corré: python3 tools/art-intake.py --judge   → te da una nota A-D y los motivos. Rehacé las C y D.
4. NO apruebes nada vos: dejale las A y B al dueño para que las mire. Cuando él confirme: python3 tools/art-intake.py --approve <id>.
Empezá con un piloto de 4 monstruos, mostrame los resultados y esperá mi OK antes de seguir con las tandas de 10.
Reglas: no uses personajes de otras franquicias; no toques las reglas del juego; si el juez marca algo raro, decímelo en vez de tocar el juez.
```

---

## 3. Sesión de legal y monetización (antes de cobrar nada)

```
Trabajás sobre "La Horda: Cónclave" (repo Fondal-Studios/La-horda-conclave). Leé CLAUDE.md, docs/DECISIONES.md y docs/ANALISIS_Y_MONETIZACION.md (§5.7).
El dueño decidió vender paquetes premium ALEATORIOS por tema con rareza (cajas sorpresa de pago). Todavía no hay pagos conectados.
Quiero que:
1. Armes una lista de verificación por país/región (Argentina, resto de LatAm, EE. UU., UE, Reino Unido, Brasil, Bélgica y Países Bajos) con qué exige cada tienda (Apple, Google, Steam) y cada ley sobre cajas con azar, probabilidades, menores y reembolsos. Marcá qué es dato verificado (con fuente) y qué es a confirmar. No es asesoría legal: terminá con las preguntas para un abogado.
2. Revisés el código del interruptor PAID_RANDOM_ENABLED y propongas cómo hacerlo por región y por edad.
3. Propongas el diseño del servidor de pagos y de la billetera (reutilizando el de La Horda: server/payments.js, wallet, entitlements en el repo Fondal-Studios/La-Horda) SIN conectar cobros reales.
4. Revises la tabla de precios y la economía con tools/economy-sim2.js y propongas ajustes con sus supuestos explícitos.
No cambies reglas del juego ni conectes proveedores de pago.
```

---

## Cómo arrancar
1. Abrir una sesión nueva en la computadora (o en Claude Code) sobre el repositorio `Fondal-Studios/La-horda-conclave`.
2. Pegar el prompt 1, 2 o 3.
3. Ver `README.md` para correr el juego y las pruebas.
