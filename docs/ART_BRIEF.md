# Brief de arte: ilustraciones canon para los monstruos y jefes

> Para quien dibuja (una persona, Anakin u otra IA). El objetivo es que **cada monstruo se vea de la misma familia que los guardianes**. Ver `docs/ANALISIS_Y_MONETIZACION.md` §4 y `docs/ART_JUDGE_REPORT.md`.

## Canon visual (copiado de lo que ya tienen los 41 guardianes: mirar `assets/g/*.webp`, por ejemplo `mago`, `tanque`, `segador`)
- **Formato**: PNG o WebP **opaco**, idealmente **600×680** (mínimo 300×340), proporción ≈ 0,88 (retrato). Sin transparencia.
- **Estilo**: ilustración **pintada** estilo *chibi* (cuerpo de ~2,5 cabezas, ojos expresivos), trazo suave con textura de pintura digital. **No** pixel art, **no** 3D, **no** foto, **no** estilo vector plano.
- **Composición**: criatura de cuerpo completo en 3/4, centrada, ocupa 65–80 % del alto, pisando tierra y piedras. Fondo: **ruinas de torres a contraluz con una luna grande detrás** (marrón/ocre), banderas rotas y polvo; cambia el escenario según el linaje (tabla abajo) pero conserva la composición.
- **Paleta**: cálida (marrones, ocres, negros) con el color del personaje como acento. Medidas del juez para los guardianes: saturación media ≈ 0,43, brillo medio ≈ 0,34.
- **Sin** texto, firma, marco, logotipo ni marca de agua. **Sin** copiar personajes de otras franquicias.
- **Fidelidad**: conservar la silueta y el color característico del sprite actual (`assets/b/<id>.png`) para que el jugador lo reconozca. Los jefes: más grandes y amenazantes, mismo fondo.

## Escenario por linaje

| Linaje | Escenario |
|---|---|
| Ciudad Maldita | calles y murallas de la Ciudad Maldita, faroles, ladrillo oscuro |
| Forja y Minas | túneles de minas con cristales, vagonetas y linternas |
| Bosque y Hongos | ruinas célticas cubiertas de musgo, niebla verde y árboles antiguos |
| Laberinto | muros de arena y piedra con símbolos, espejos rotos, luz dorada |
| Marea y Hielo | costa y glaciar: nieve, hielo azulado y agua oscura |
| Infernal y Criptas | brasas, grietas de lava y cielo rojo; criptas |

## Flujo (cada imagen)
1. Generar/dibujar y guardar como `assets/art-incoming/<id>.png` (el id es la primera columna de la tabla).
2. `python3 tools/art-intake.py --judge` → el juez califica (A/B pasan, C/D se rehacen).
3. **Una persona revisa** las A y B mirando la imagen.
4. `python3 tools/art-intake.py --approve <id>[,<id>]` → entra a la carta (queda registrada en `art-overrides.js`; el original va a `assets/art-archive/`).
5. `node tools/gate.js 20` y `python3 tools/art-judge.py` → commit.

Plantilla de instrucción (adaptar):
```
Painted chibi-style fantasy illustration of {NOMBRE}, {DESCRIPCIÓN}. Full body, three-quarter view, centered, standing on dirt and stones.
Background: {ESCENARIO}, tall ruined towers silhouetted against a huge dusky moon, torn banners, dust. Warm brown/ochre palette with the creature's own color as accent.
Soft digital-paint texture, clean readable silhouette, expressive eyes. No text, no signature, no frame, no pixel art, no 3D render.
```

## Producción (peor arte primero) — 65 pendientes

| Prioridad | id | Nombre | Tipos | Linaje | Nota actual | Qué hace (para la descripción) |
|---|---|---|---|---|---|---|
| 1 | `demonio_ceniza` | Demonio de Ceniza | Demonio | Infernal y Criptas | C 60 | Al morir: Quema a las unidades enemigas (1 por turno, 3 turnos) |
| 2 | `imp` | Imp Pirómano | Demonio | Infernal y Criptas | C 60 | Ingreso: Quema a una unidad enemiga al azar (1 por turno, 3 turnos) |
| 3 | `boss_devoraluz` | Devoraluz Ancestral (JEFE) | — | — | C 70 | ataque simple |
| 4 | `cm_perro` | Perro de Cloaca | Bestia | Ciudad Maldita | C 70 | Rápido |
| 5 | `dama_bosque` | Dama del Bosque | Planta | Bosque y Hongos | C 70 | Ingreso: Cura 3 a tus unidades |
| 6 | `demonio_mago` | Demonio Hechicero | Demonio | Infernal y Criptas | C 70 | Ingreso: Inflige 2 a una unidad enemiga al azar |
| 7 | `demonio_menor` | Demonio Menor | Demonio | Infernal y Criptas | C 70 | ataque simple |
| 8 | `dragoncito_hielo` | Dragoncito de Hielo | Hielo | Marea y Hielo | C 70 | Ingreso: Inflige 1 a una unidad enemiga al azar |
| 9 | `esfinge` | Esfinge | — | Laberinto | C 70 | Escudo |
| 10 | `lider_turba` | Líder de la Turba | Ciudadano | Ciudad Maldita | C 70 | Pasiva ¡A ellos! |
| 11 | `lobo_alfa` | Lobo Alfa | Bestia | Bosque y Hongos | C 70 | Pasiva Líder de manada |
| 12 | `medusa_electrica` | Medusa Eléctrica | — | Marea y Hielo | C 70 | Ingreso: Inflige 1 a una unidad enemiga al azar |
| 13 | `mn_devoraluz` | Devoraluz | — | Forja y Minas | C 70 | Congela |
| 14 | `ingeniero` | Ingeniero de Minas | Máquina | Forja y Minas | B 75 | Pasiva Mejora en el sitio |
| 15 | `boss_mago` | El Mago Gélido (JEFE) | — | — | B 80 | ataque simple |
| 16 | `cartografo` | Cartógrafo de Trampas | Explorador | Laberinto | B 80 | Pasiva Sabe dónde pisar |
| 17 | `cm_espectro` | Espectro | — | Ciudad Maldita | B 80 | Robovida |
| 18 | `cm_planidera` | Planidera | Ciudadano | Ciudad Maldita | B 80 | Ingreso: Quita 1 ATK a una unidad enemiga al azar |
| 19 | `cm_sectario` | Sectario | Ciudadano | Ciudad Maldita | B 80 | Al morir: Inflige 2 a una unidad enemiga al azar |
| 20 | `cu_sith` | Cù-Sìth | Bestia | Bosque y Hongos | B 80 | Rápido |
| 21 | `dragon_hielo` | Tundraverx | Hielo | Marea y Hielo | B 80 | Congela |
| 22 | `duende_bosque` | Duende del Bosque | Planta | Bosque y Hongos | B 80 | ataque simple |
| 23 | `ent` | Ent | Planta | Bosque y Hongos | B 80 | Provocar |
| 24 | `golem_piedra` | Gólem de Piedra | Golem | Laberinto | B 80 | Provocar |
| 25 | `reina_escarcha` | Reina de Escarcha | Hielo | Marea y Hielo | B 80 | Pasiva Reina del invierno |
| 26 | `rompehielos` | Rompehielos | Hielo | Marea y Hielo | B 80 | Ingreso: Inflige 3 a las unidades enemigas congeladas |
| 27 | `token_golem` | Gólem de Carne (invocación) | Golem | — | B 80 | Provocar |
| 28 | `token_muro` | Muro (invocación) | Construcción | — | B 80 | Provocar |
| 29 | `zombie` | Zombi | — | Infernal y Criptas | B 80 | Provocar |
| 30 | `engendro` | Engendro | — | Forja y Minas | B 85 | ataque simple |
| 31 | `agitador` | Agitador | Ciudadano | Ciudad Maldita | A 90 | Pasiva Contagia la turba |
| 32 | `angel_hielo` | Ángel de Hielo | Hielo | Marea y Hielo | A 90 | Escudo, Robovida |
| 33 | `capataz` | Capataz de Huesos | Esqueleto | Infernal y Criptas | A 90 | Pasiva Hueso sobre hueso |
| 34 | `cristal_resonante` | Cristal Resonante | Cristal | Forja y Minas | A 90 | Pasiva Resonancia |
| 35 | `druida_arena` | Druida de Arena | — | Laberinto | A 90 | Ingreso: Da +1 ATK y +1 VID a tus unidades |
| 36 | `golem_hielo` | Gólem de Hielo | Hielo, Golem | Marea y Hielo | A 90 | Provocar, Congela |
| 37 | `rey_esqueleto` | Rey Esqueleto | Esqueleto | Infernal y Criptas | A 90 | Provocar · Pasiva Rey de los huesos |
| 38 | `tiburon_blanco` | Tiburón Blanco | Bestia | Marea y Hielo | A 90 | ataque simple |
| 39 | `tiburon_joven` | Tiburón Joven | Bestia | Marea y Hielo | A 90 | Rápido |
| 40 | `bestia_bosque` | Bestia del Bosque | Bestia | Bosque y Hongos | A 100 | Rápido |
| 41 | `boss_campanero` | El Gran Campanero (JEFE) | — | — | A 100 | ataque simple |
| 42 | `boss_demonio` | Demonio Mayor (JEFE) | — | — | A 100 | ataque simple |
| 43 | `boss_jinete` | Jinete Sin Cabeza (JEFE) | — | — | A 100 | ataque simple |
| 44 | `boss_minotauro` | Minotauro (JEFE) | — | — | A 100 | ataque simple |
| 45 | `cangrejo_acorazado` | Cangrejo Acorazado | — | Marea y Hielo | A 100 | Provocar |
| 46 | `cm_acechante` | Acechante | Ciudadano | Ciudad Maldita | A 100 | Rápido |
| 47 | `cm_campanero` | Campanero | Ciudadano | Ciudad Maldita | A 100 | Ingreso: Cura 2 a tus unidades |
| 48 | `cm_raptor` | Raptor | Ciudadano | Ciudad Maldita | A 100 | Ingreso: Roba 1 |
| 49 | `cm_saqueador` | Saqueador | Ciudadano | Ciudad Maldita | A 100 | ataque simple |
| 50 | `cristal_servo` | Servo de Cristal | Cristal | Forja y Minas | A 100 | ataque simple |
| 51 | `cristal_volador` | Cristal Volador | Cristal | Forja y Minas | A 100 | Rápido |
| 52 | `escorpion_gigante` | Escorpión Gigante | Bestia | Laberinto | A 100 | Congela |
| 53 | `esqueleto` | Esqueleto | Esqueleto | Infernal y Criptas | A 100 | ataque simple |
| 54 | `esqueleto_h` | Esqueleto Cornudo | Esqueleto | Infernal y Criptas | A 100 | ataque simple |
| 55 | `golem` | Gólem | Golem | Infernal y Criptas | A 100 | Provocar |
| 56 | `golem_cristal` | Gólem de Cristal | Cristal, Golem | Forja y Minas | A 100 | Provocar |
| 57 | `guardia_laberinto` | Guardia del Laberinto | Golem | Laberinto | A 100 | Provocar · Pasiva Muros que curan |
| 58 | `hada_escarcha` | Hada de Escarcha | Hielo | Marea y Hielo | A 100 | Ingreso: Congela a una unidad enemiga al azar |
| 59 | `lobo_artico` | Lobo Ártico | Bestia, Hielo | Marea y Hielo | A 100 | Rápido |
| 60 | `medusa` | Medusa | — | Laberinto | A 100 | Ingreso: Congela a una unidad enemiga al azar |
| 61 | `piromante` | Piromante | Demonio | Infernal y Criptas | A 100 | Pasiva Maestro del fuego |
| 62 | `raiz_madre` | Raíz Madre | Planta | Bosque y Hongos | A 100 | Provocar · Pasiva Savia ancestral |
| 63 | `token_granadero` | Granadero Espectral (invocación) | — | — | A 100 | ataque simple |
| 64 | `token_lobo` | Lobo Espectral (invocación) | Bestia | — | A 100 | Rápido |
| 65 | `token_torreta` | Torreta (invocación) | Máquina | — | A 100 | ataque simple |
