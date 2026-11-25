# Informe del juez de arte

Generado por `python3 tools/art-judge.py`. Mide el arte implementado en las cartas; **no reemplaza la aprobación humana**.

| | A | B | C | D |
|---|---|---|---|---|
| Guardianes (41) | 41 | 0 | 0 | 0 |
| Monstruos (87) | 47 | 20 | 19 | 1 |

- Monstruos en píxeles exactos: **62** · con suavizado/borrosos: **9** · variantes teñidas: **33**
- **Brecha de estilo guardián ↔ monstruo** (0 = idéntico): promedio **1.38**, límite recomendado 1.5; 12 de 87 monstruos la superan.

## Monstruos con peor nota

| Carta | Nota | Motivos | Brecha |
|---|---|---|---|
| Anguila de Escarcha (`anguila_escarcha`) | D 35 | reescalado con suavizado (borroso); el sujeto ocupa solo 23% del alto de la carta; muy apaisado (4.0:1) para un marco vertical; variante teñida de otro sprite (arte reutilizado) | 1.13 |
| Imp Pirómano (`imp`) | C 60 | reescalado con suavizado (borroso); variante teñida de otro sprite (arte reutilizado) | 1.18 |
| Demonio de Ceniza (`demonio_ceniza`) | C 60 | reescalado con suavizado (borroso); variante teñida de otro sprite (arte reutilizado) | 1.18 |
| Reina Micelial (`reina_micelial`) | C 60 | sprite nativo diminuto (18 px de ancho) ampliado x8; variante teñida de otro sprite (arte reutilizado); paleta lejos del canon de los guardianes (brillo/saturación) | 1.59 |
| Perro de Cloaca (`cm_perro`) | C 70 | reescalado con suavizado (borroso) | 1.14 |
| Devoraluz (`mn_devoraluz`) | C 70 | reescalado con suavizado (borroso) | 1.10 |
| Dama del Bosque (`dama_bosque`) | C 70 | sprite nativo diminuto (18 px de ancho) ampliado x8; paleta lejos del canon de los guardianes (brillo/saturación) | 1.59 |
| Esfinge (`esfinge`) | C 70 | reescalado con suavizado (borroso) | 1.14 |
| Dragoncito de Hielo (`dragoncito_hielo`) | C 70 | sprite nativo diminuto (18 px de ancho) ampliado x8; paleta lejos del canon de los guardianes (brillo/saturación) | 1.50 |
| Medusa Eléctrica (`medusa_electrica`) | C 70 | sprite nativo diminuto (34 px de ancho) ampliado x5; paleta lejos del canon de los guardianes (brillo/saturación) | 1.49 |
| Demonio Menor (`demonio_menor`) | C 70 | reescalado con suavizado (borroso) | 1.18 |
| Demonio Hechicero (`demonio_mago`) | C 70 | reescalado con suavizado (borroso) | 1.17 |
| Devoraluz Ancestral (`boss_devoraluz`) | C 70 | reescalado con suavizado (borroso); (invocación) | 1.10 |
| Lobo Alfa (`lobo_alfa`) | C 70 | sprite nativo diminuto (18 px de ancho) ampliado x7; variante teñida de otro sprite (arte reutilizado) | 1.49 |
| Líder de la Turba (`lider_turba`) | C 70 | sprite nativo diminuto (32 px de ancho) ampliado x3; variante teñida de otro sprite (arte reutilizado) | 1.50 |
| Capitana de la Guardia (`capitana_guardia`) | C 70 | sprite nativo diminuto (33 px de ancho) ampliado x3; variante teñida de otro sprite (arte reutilizado) | 1.48 |
| Trampero (`trampero`) | C 70 | sprite nativo diminuto (31 px de ancho) ampliado x5; variante teñida de otro sprite (arte reutilizado) | 1.43 |
| Hongo Saltarín (`hongo_saltarin`) | C 70 | sprite nativo diminuto (31 px de ancho) ampliado x5; variante teñida de otro sprite (arte reutilizado) | 1.43 |
| Esporero (`esporero`) | C 70 | sprite nativo diminuto (25 px de ancho) ampliado x8; variante teñida de otro sprite (arte reutilizado) | 1.46 |
| Micelio Vivo (`micelio_vivo`) | C 70 | sprite nativo diminuto (20 px de ancho) ampliado x6; variante teñida de otro sprite (arte reutilizado) | 1.50 |
| Ingeniero de Minas (`ingeniero`) | B 75 | el sujeto ocupa solo 38% del alto de la carta; variante teñida de otro sprite (arte reutilizado) | 1.51 |
| Horno de Cristal (`horno_cristal`) | B 75 | el sujeto ocupa solo 38% del alto de la carta; variante teñida de otro sprite (arte reutilizado) | 1.51 |
| Planidera (`cm_planidera`) | B 80 | sprite nativo diminuto (33 px de ancho) ampliado x3 | 1.54 |
| Sectario (`cm_sectario`) | B 80 | sprite nativo diminuto (32 px de ancho) ampliado x3 | 1.50 |
| Espectro (`cm_espectro`) | B 80 | sprite nativo diminuto (33 px de ancho) ampliado x3 | 1.48 |

## Guardianes con observaciones

| Carta | Nota | Motivos |
|---|---|---|

## Los 12 monstruos más alejados del estilo de los guardianes

| Carta | Brecha | Notas |
|---|---|---|
| Dama del Bosque | 1.59 | sprite nativo diminuto (18 px de ancho) ampliado x8; paleta lejos del canon de los guardianes (brillo/saturación) |
| Reina Micelial | 1.59 | sprite nativo diminuto (18 px de ancho) ampliado x8; variante teñida de otro sprite (arte reutilizado); paleta lejos del canon de los guardianes (brillo/saturación) |
| Acechante | 1.55 | — |
| Gólem de Hielo | 1.55 | paleta lejos del canon de los guardianes (brillo/saturación) |
| Ángel de Hielo | 1.55 | paleta lejos del canon de los guardianes (brillo/saturación) |
| Rompehielos | 1.55 | variante teñida de otro sprite (arte reutilizado); paleta lejos del canon de los guardianes (brillo/saturación) |
| Reina de Escarcha | 1.55 | variante teñida de otro sprite (arte reutilizado); paleta lejos del canon de los guardianes (brillo/saturación) |
| Planidera | 1.54 | sprite nativo diminuto (33 px de ancho) ampliado x3 |
| Escorpión Gigante | 1.53 | — |
| Engendro | 1.51 | el sujeto ocupa solo 38% del alto de la carta |
| Ingeniero de Minas | 1.51 | el sujeto ocupa solo 38% del alto de la carta; variante teñida de otro sprite (arte reutilizado) |
| Horno de Cristal | 1.51 | el sujeto ocupa solo 38% del alto de la carta; variante teñida de otro sprite (arte reutilizado) |
