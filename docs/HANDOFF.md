# Traspaso: cómo seguir en otra sesión

Última actualización: v0.6 + análisis/monetización + flujo de arte. Todo está en `main`.

## Contexto
- **Qué es**: "La Horda: Cónclave", duelo de cartas por turnos 1v1 hecho con el arte y los datos de **La Horda** (ARPG de Fondal Studios). Nació como boceto jugable fuera del repo original y se cargó acá.
- **Quién decide**: el dueño de Fondal Studios (habla español rioplatense; prefiere probar cosas jugables y dar feedback sobre ellas). Cambios de política, precios, arte final y qué va a `main` los decide él.
- **Link de prueba** (página privada de Claude, versión del momento): https://claude.ai/artifact/AZLP7RbEHPnfZqUNtvHLU3 — solo para el dueño; es una copia de `index.html` con scripts embebidos. El juego de verdad es este repo.

## Lo que el dueño pidió y está hecho (ver `docs/DISENO.md`, v0.1 → v0.6)
Constructor de mazos y colección; combate con posición y movimientos por unidad (habilidades reales de los 41 guardianes); 6 mapas (arenas); Aventura solo y cooperativo; cuestionario inicial "invocador"; pasivas y ataques básicos propios; Invocador con vida, rango y 2 habilidades de apoyo; animaciones de combate (levantarse y chocar / cristal de vida); trampas; sinergias y combos por arquetipo; ayuda de maná y de cómo activar habilidades; "monstruos" en vez de "bichos".

## Estado de calidad (medido; ver README y docs)
- Balance con bot (1.800 partidas): mazos 36–60 %, quien abre ~52 %. **Ciudad (Turba) es el más flojo (~36 %)**, Infernal el más fuerte (~60 %).
- Pasivas 31/31, combos 64 comprobaciones, 1v1 online y cooperativo sin fuga de información oculta, prueba de claridad automática sin callejones.
- **Sin medir**: personas reales, celular, latencia, balance humano, retención.

## Decisiones abiertas (el dueño tiene que decidir)
1. **Sobres de cartas = cajas sorpresa**, y la política de La Horda dice "sin cajas sorpresa". Caminos A (sin azar, recomendado), B (azar solo con oro ganado) y C (azar con dinero real, no recomendado) en `docs/ANALISIS_Y_MONETIZACION.md` §5.2. **El prototipo hoy abre sobres aleatorios con oro como placeholder.**
2. **Economía**: demasiado generosa (91 % de la colección a los 30 días con 6 partidas por día). Propuesta en §5.3 (menos oro por partida, polvo de cartas).
3. **Cónclave como complemento dentro de La Horda o producto aparte** (§3; se recomienda complemento).
4. **Arte**: unificar los 65 monstruos y jefes al canon de los guardianes (§4 del análisis y `docs/ART_BRIEF.md`).
5. Publicar en GitHub Pages (hay que activarlo en Settings → Pages; el modo online necesita un servidor aparte).

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
1. Decidir el punto 1 (política de sobres) y adaptar la pestaña "Colección y sobres" en consecuencia.
2. Prueba con 10–15 personas (tiempo hasta el primer ataque, % que termina el tutorial, dónde se traban).
3. Arte: piloto de 4 monstruos por el flujo de arriba, luego tandas de 10.
4. Mover oro/colección/mazos del navegador al servidor (cuentas) antes de que tengan valor.
5. Ajustar Ciudad (Turba) e Infernal; modo corto de partida; ranking simple.
6. Contenido de temporada 1 (Reino Fúngico + guardianes Ilsa, Vorn, Kora en prueba en La Horda).

## Entorno
Node ≥ 18, Python 3 con Pillow y NumPy. Pruebas de interfaz: Playwright + Chromium. Servidor: `cd server && npm install && node duel-server.js`.
El repo original (La Horda) no se tocó; sus datos extraídos están en `tools/repo-*.json`.
