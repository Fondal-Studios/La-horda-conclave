# Informe del juez de arte

Generado por `python3 tools/art-judge.py`. Mide el arte implementado en las cartas; **no reemplaza la aprobación humana**.

| | A | B | C | D |
|---|---|---|---|---|
| Guardianes (41) | 41 | 0 | 0 | 0 |
| Monstruos (87) | 30 | 11 | 45 | 1 |

- Monstruos en píxeles exactos: **40** · con suavizado/borrosos: **38** · variantes teñidas: **33**
- **Brecha de estilo guardián ↔ monstruo** (0 = idéntico): promedio **1.29**, límite recomendado 1.5; 7 de 87 monstruos la superan.

## Monstruos con peor nota

| Carta | Nota | Motivos | Brecha |
|---|---|---|---|
| Anguila de Escarcha (`anguila_escarcha`) | D 35 | reescalado con suavizado (borroso); el sujeto ocupa solo 23% del alto de la carta; muy apaisado (4.0:1) para un marco vertical; variante teñida de otro sprite (arte reutilizado) | 1.13 |
| Imp Pirómano (`imp`) | C 60 | reescalado con suavizado (borroso); variante teñida de otro sprite (arte reutilizado) | 1.18 |
| Demonio de Ceniza (`demonio_ceniza`) | C 60 | reescalado con suavizado (borroso); variante teñida de otro sprite (arte reutilizado) | 1.18 |
| Reina Micelial (`reina_micelial`) | C 60 | sprite nativo diminuto (18 px de ancho) ampliado x8; variante teñida de otro sprite (arte reutilizado); paleta lejos del canon de los guardianes (brillo/saturación) | 1.59 |
| Saqueador (`cm_saqueador`) | C 70 | reescalado con suavizado (borroso) | 1.12 |
| Perro de Cloaca (`cm_perro`) | C 70 | reescalado con suavizado (borroso) | 1.12 |
| Planidera (`cm_planidera`) | C 70 | reescalado con suavizado (borroso) | 1.16 |
| Raptor (`cm_raptor`) | C 70 | reescalado con suavizado (borroso) | 1.08 |
| Acechante (`cm_acechante`) | C 70 | reescalado con suavizado (borroso) | 1.15 |
| Sectario (`cm_sectario`) | C 70 | reescalado con suavizado (borroso) | 1.15 |
| Espectro (`cm_espectro`) | C 70 | reescalado con suavizado (borroso) | 1.18 |
| Servo de Cristal (`cristal_servo`) | C 70 | reescalado con suavizado (borroso) | 1.11 |
| Engendro (`engendro`) | C 70 | reescalado con suavizado (borroso) | 1.12 |
| Cristal Volador (`cristal_volador`) | C 70 | reescalado con suavizado (borroso) | 1.14 |
| Devoraluz (`mn_devoraluz`) | C 70 | reescalado con suavizado (borroso) | 1.17 |
| Gólem de Cristal (`golem_cristal`) | C 70 | reescalado con suavizado (borroso) | 1.16 |
| Duende del Bosque (`duende_bosque`) | C 70 | reescalado con suavizado (borroso) | 1.14 |
| Bestia del Bosque (`bestia_bosque`) | C 70 | reescalado con suavizado (borroso) | 1.11 |
| Cù-Sìth (`cu_sith`) | C 70 | reescalado con suavizado (borroso) | 1.16 |
| Dama del Bosque (`dama_bosque`) | C 70 | reescalado con suavizado (borroso) | 1.09 |
| Gólem de Piedra (`golem_piedra`) | C 70 | reescalado con suavizado (borroso) | 1.10 |
| Medusa (`medusa`) | C 70 | reescalado con suavizado (borroso) | 1.09 |
| Druida de Arena (`druida_arena`) | C 70 | reescalado con suavizado (borroso) | 1.14 |
| Esfinge (`esfinge`) | C 70 | reescalado con suavizado (borroso) | 1.10 |
| Lobo Ártico (`lobo_artico`) | C 70 | reescalado con suavizado (borroso) | 1.13 |

## Guardianes con observaciones

| Carta | Nota | Motivos |
|---|---|---|

## Los 12 monstruos más alejados del estilo de los guardianes

| Carta | Brecha | Notas |
|---|---|---|
| Reina Micelial | 1.59 | sprite nativo diminuto (18 px de ancho) ampliado x8; variante teñida de otro sprite (arte reutilizado); paleta lejos del canon de los guardianes (brillo/saturación) |
| Rompehielos | 1.55 | variante teñida de otro sprite (arte reutilizado); paleta lejos del canon de los guardianes (brillo/saturación) |
| Reina de Escarcha | 1.55 | variante teñida de otro sprite (arte reutilizado); paleta lejos del canon de los guardianes (brillo/saturación) |
| Escorpión Gigante | 1.53 | — |
| Campanero | 1.52 | — |
| Ingeniero de Minas | 1.51 | el sujeto ocupa solo 38% del alto de la carta; variante teñida de otro sprite (arte reutilizado) |
| Horno de Cristal | 1.51 | el sujeto ocupa solo 38% del alto de la carta; variante teñida de otro sprite (arte reutilizado) |
| Ent | 1.50 | sprite nativo diminuto (20 px de ancho) ampliado x6 |
| Líder de la Turba | 1.50 | sprite nativo diminuto (32 px de ancho) ampliado x3; variante teñida de otro sprite (arte reutilizado) |
| Micelio Vivo | 1.50 | sprite nativo diminuto (20 px de ancho) ampliado x6; variante teñida de otro sprite (arte reutilizado) |
| Jinete Sin Cabeza | 1.49 | (invocación) |
| Lobo Espectral | 1.49 | (invocación) |
