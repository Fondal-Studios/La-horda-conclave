# Traspaso: cómo seguir en otra sesión

Última actualización: v0.7 (rareza, paquetes premium temáticos, polvo) + análisis/monetización + flujo de arte.

## Contexto
- **Qué es**: "La Horda: Cónclave", duelo de cartas por turnos 1v1 hecho con el arte y los datos de **La Horda** (ARPG de Fondal Studios). Nació como boceto jugable fuera del repo original y se cargó acá.
- **Quién decide**: el dueño de Fondal Studios (habla español rioplatense; prefiere probar cosas jugables y dar feedback sobre ellas). Cambios de política, precios, arte final y qué va a `main` los decide él.
- **Link de prueba** (página privada de Claude, versión del momento): https://claude.ai/artifact/AZLP7RbEHPnfZqUNtvHLU3 — solo para el dueño; es una copia de `index.html` con scripts embebidos. El juego de verdad es este repo.

## Lo que el dueño pidió y está hecho (ver `docs/DISENO.md`, v0.1 → v0.6)
Constructor de mazos y colección; combate con posición y movimientos por unidad (habilidades reales de los 41 guardianes); 6 mapas (arenas); Aventura solo y cooperativo; cuestionario inicial "invocador"; pasivas y ataques básicos propios; Invocador con vida, rango y 2 habilidades de apoyo; animaciones de combate (levantarse y chocar / cristal de vida); trampas; sinergias y combos por arquetipo; ayuda de maná y de cómo activar habilidades; "monstruos" en vez de "bichos".

## Estado de calidad (medido; ver README y docs)
- Balance con bot (v0.8, `gate.js 20`): mazos 46–55 %, quien abre ~54 %. Ciudad e Infernal se ajustaron en la v0.8 (expansión Reino Fúngico, 41 cartas; ver `docs/DISENO.md`). Arte pendiente de las cartas nuevas: `tools/arte-nuevas.json`.
- Pasivas 31/31, combos 64 comprobaciones, 1v1 online y cooperativo sin fuga de información oculta, prueba de claridad automática sin callejones.
- **Sin medir**: personas reales, celular, latencia, balance humano, retención.

## Decisiones
**Tomada (v0.7)**: se venden **paquetes premium aleatorios por tema** (p. ej. Paquete de Invierno) y hay **rareza**; ver `docs/DECISIONES.md` y `docs/ANALISIS_Y_MONETIZACION.md` §5.7 (protecciones, números y lista legal). Los pagos reales **no** están conectados.
**Abiertas**: (1) ¿Las Legendarias (Ascensión) pierden el +3 de puntos antes de venderse? (2) regiones permitidas y edad mínima, con asesoría legal; (3) proveedor de pagos, precio de las Brasas y economía final; (4) complemento de La Horda o producto aparte; (5) orden de producción del arte; (6) GitHub Pages.

## Trabajo de arte con Anakin (IA local del dueño) u otra herramienta
1. Leer `docs/ART_BRIEF.md` (canon visual, escenarios por linaje, lista de 65 pendientes ordenada por peor arte).
2. Guardar cada ilustración como `assets/art-incoming/<id>.png` (600×680, opaca, pintada, con escenario).
3. `python3 tools/art-intake.py --judge` → nota A–D y motivos (`docs/ART_INTAKE.md`).
4. El dueño (o una persona) mira las A/B. Aprobadas: `python3 tools/art-intake.py --approve id1,id2` (normaliza a `assets/ilus/<id>.webp`, archiva el original, escribe `art-overrides.js`).
5. `node tools/gate.js 20` y `python3 tools/art-judge.py`; commit.
- Probar `python3 tools/art-judge.py --image archivo.png --kind ilustracion` antes de generar tandas grandes.
- Ojo: `python3 tools/art-judge.py --gate` **falla a propósito** hoy (monstruos borrosos y brecha de estilo); pasará cuando se complete el arte.
- Los guardianes ya cumplen el canon (nota A); no hay que redibujarlos.

## Próximos pasos sugeridos (en orden)
1. Revisión legal y de regiones de los paquetes de pago; decidir el bonus de las Legendarias; conectar un proveedor de pagos **solo** después.
2. Prueba con 10–15 personas (tiempo hasta el primer ataque, % que termina el tutorial, dónde se traban).
3. Arte: piloto de 4 monstruos por el flujo de arriba, luego tandas de 10.
4. Mover oro/colección/mazos del navegador al servidor (cuentas) antes de que tengan valor.
5. Ajustar Ciudad (Turba) e Infernal; modo corto de partida; ranking simple.
6. Contenido de temporada 1 (Reino Fúngico + guardianes Ilsa, Vorn, Kora en prueba en La Horda).

## Entorno
Node ≥ 18, Python 3 con Pillow y NumPy. Pruebas de interfaz: Playwright + Chromium. Servidor: `cd server && npm install && node duel-server.js`.
Prompts listos para abrir otra sesión: `docs/PROMPTS_PROXIMAS_SESIONES.md`. El repo original (La Horda) no se tocó; sus datos extraídos están en `tools/repo-*.json`.
