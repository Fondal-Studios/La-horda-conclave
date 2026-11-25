# Habilidades de los guardianes: original vs. duelo

Generado por `node tools/make-skills-doc.js`. Cada guardián tiene **Ataque básico propio** (gratis) + **Pasiva** + 3 habilidades + definitiva (nombres y textos del kit real de La Horda; 7 pasivas no existen en el ARPG y son propuestas, marcadas).
El efecto del duelo está escrito a mano en `tools/moves-reviewed.js` (revisión de la v0.2). Costos en cristales ✦, `cd` = turnos entre usos. Las mecánicas que no existen en cartas
(proyectiles que atraviesan, estelas, transformaciones, velocidad, probabilidad de crítico) se tradujeron a lo más parecido: daño de fila o de columna, congelar, veneno, invocar, cambiar de fila, escudo.

## Aldric — el Último Bastión (`tanque`, tanque, Guardián, costo 5, 2/11)

- **Ataque «Golpe de Escudo»** (Cuerpo a cuerpo · Daña ×0.6 ATK a toda la fila del objetivo)
- **Pasiva «Bastión»**: Reduce 1 el daño que reciben tus unidades (mín. 1) — original: Los aliados a menos de 200 u de Aldric reciben 8% menos daño.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Torbellino (2✦, cd 2) | Gira sin parar dañando a su alrededor | Cuerpo a cuerpo · Daña ×0.9 ATK a toda la fila del objetivo |
| 2 | Embestida (2✦, cd 1) | Carga, arrastra y golpea a un enemigo | Cuerpo a cuerpo · Daña ×1.3 ATK al objetivo. Cambia de fila |
| 3 | Grito de Guerra (2✦, cd 2) | Grito que aumenta armadura, vida máxima y su tamaño | Da +2 VID a este guardián. Da Provocar a este guardián |
| ★ | Grito Provocador | Provoca a los enemigos, se agiganta y gana armadura y vida máxima | Da +3 VID a tus unidades. Da Provocar a este guardián. Da Escudo a este guardián |

## Kael — la Daga Carmesí (`guerrero`, asesino, Guardián, costo 4, 4/6)

- **Ataque «Puñalada»** (Cuerpo a cuerpo · Daña ×1.2 ATK al objetivo)
- **Pasiva «Depredador»**: +1 de daño a unidades envenenadas — original: Sus ataques básicos hacen 15% más de daño a enemigos que sangran o están envenenados.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Corte Sangrante (2✦, cd 1) | Aplica un sangrado profundo y cura 4% de tu vida máxima al conectar | Cuerpo a cuerpo · Daña ×1.2 ATK al objetivo. Envenena al objetivo (1 por turno, 3 turnos) |
| 2 | Triple Golpe (2✦, cd 2) | Tres golpes veloces; el último causa +300% de daño. Cura 7% de tu vida máxima al conectar | Cuerpo a cuerpo · Daña ×1.9 ATK al objetivo |
| 3 | Trampa de Área (2✦, cd 2) | Coloca una trampa que explota y encadena daño | A distancia · Daña ×1.1 ATK a toda la fila del objetivo |
| ★ | Pestilencia Sombría | Sigilo total y un triple golpe que envenena y encadena sangrado | Cuerpo a cuerpo · Daña ×2.4 ATK al objetivo. Envenena al objetivo (2 por turno, 3 turnos) |

## Elyra — la Guardiana del Alba (`soporte`, soporte, Guardián, costo 4, 3/8)

- **Ataque «Rayo de Alba»** (A distancia · Daña ×0.8 ATK al objetivo. Cura 1 a tus unidades)
- **Pasiva «Gracia del Alba»**: Sus curas a aliados con 35% de vida o menos curan +2 — original: Sus curaciones a aliados con menos de 35% de vida curan 25% más.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Alba Purificadora (2✦, cd 2) | Un pulso de luz cura a los aliados en 260 u y daña a todos los enemigos en 160 u por el 120% de su daño. Ambos radios crecen con la maestría. | Cura 2 a tus unidades. Daña ×0.5 ATK a las unidades enemigas |
| 2 | Bendición de Guerra (2✦, cd 2) | Aumenta el daño de los aliados cercanos | Da +1 ATK este turno a tus unidades |
| 3 | Escudo Sagrado (2✦, cd 2) | Aumenta la defensa de los aliados cercanos | A un aliado · Da Escudo al objetivo |
| ★ | Bendición Suprema | Cura y bendice a todo el equipo con ataque y defensa | Cura 6 a tus unidades. Da +1 ATK y +1 VID a tus unidades. Roba 1 |

## Ynara — la Médica de los Refugios (`ynara`, soporte, Guardián, costo 4, 2/9)

- **Ataque «Halo Nacarado»** (A distancia · Daña ×0.7 ATK al objetivo. Cura 1 a tus unidades)
- **Pasiva «Paciencia infinita»** *(propuesta: el ARPG no tiene una escrita)*: Al inicio de tu turno: Cura 2 a una unidad aliada al azar

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Mirada fulminante (1✦, cd 1) | Un abanico de luz daña y ralentiza 30% durante 1,5 s. Empuja comunes cercanos; jefes resisten el empuje y limitan el freno al 12%. | A distancia · Daña ×0.6 ATK a toda la fila del objetivo. Congela al objetivo |
| 2 | Estrogonof reparador (2✦, cd 2) | Sirve estrogonof de pollo: cada 600 ms cura 1% de vida y su vapor daña. Dentro reduce daño 8%. Máximo una fuente por Ynara. | Cura 2 a tus unidades |
| 3 | No quiero seguir esta conversación (1✦, cd 2) | Se desliza por terreno seguro y limpia ralentización. Deja una cortina de agua que daña y frena. No cruza muros ni vacíos. | Da Escudo a este guardián. Cambia de fila |
| ★ | Santa Paciencia | Santuario móvil: cura 0,8% por pulso y daña cada 0,6 s. Cada golpe que reciben los aliados adentro carga paciencia (máx. 8); al final estalla una onda | Cura 6 a tus unidades. Da +1 ATK y +1 VID a tus unidades. Roba 1 |

## Myla — la Niña de la Cuchara (`myla`, mago, Guardián, costo 5, 4/10)

- **Ataque «Cuchara Encantada»** (A distancia · Daña ×0.5 ATK a toda la fila del objetivo)
- **Pasiva «Yogur pegajoso»** *(propuesta: el ARPG no tiene una escrita)*: Al recibir daño (cada 3 veces): Congela a una unidad enemiga al azar

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Torre de Yogur (2✦, cd 2) | Invoca una torre de yogur que dispara y ralentiza. Máximo dos; la tercera reemplaza la más antigua. | Invoca un Torreta |
| 2 | Yogurazo (2✦, cd 1) | Lanza yogur al punto elegido: salpica y deja un charco pegajoso que daña y ralentiza. | A distancia · Daña ×0.7 ATK a toda la fila del objetivo. Congela al objetivo |
| 3 | Burbuja Cremosa (1✦, cd 2) | Se envuelve en yogur protector: obtiene un escudo y limpia su ralentización. | Da Escudo a este guardián |
| ★ | BERRINCHE | En pañales y más grande, llora durante 6,5 segundos: cada onda de llanto daña y salpica yogur a su alrededor. Puede moverse; los jefes resisten parte  | Daña ×1 ATK a las unidades enemigas. Congela a las unidades enemigas |

## Dáriel — el Último Compás (`dariel`, soporte, Guardián, costo 5, 3/11)

- **Ataque «Diapasón del telón»** (A distancia · Daña ×0.5 ATK a toda la fila del objetivo)
- **Pasiva «Contrapunto»**: Al usar una habilidad (cada 2 veces): Da +1 ATK este turno a tus unidades (máx. 6 por partida) — original: Alternar habilidades distintas acumula hasta 3 notas; repetir la misma no añade notas.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Nota discordante (1✦, cd 1) | Cono sonoro: daño y −8% de daño enemigo durante 1,5 s; jefes −4%. | A distancia · Daña ×0.6 ATK a toda la fila del objetivo. Quita 1 ATK al objetivo |
| 2 | Marcha de salida (2✦, cd 2) | Aliados cercanos: escudo 4% sin acumular y velocidad +8%. | Da Escudo a tus unidades |
| 3 | Volver al estribillo (2✦, cd 2) | Daño circular y cura 1% +0,6% por nota consumida; máximo 2,8%. | Cura 2 a tus unidades. Daña ×0.4 ATK a las unidades enemigas |
| ★ | Todavía hay una salida | Seis pulsos alternan daño y cura de 1% con escudo de 2%, sin acumulación. | Cura 6 a tus unidades. Da +1 ATK y +1 VID a tus unidades. Roba 1 |

## Vesper — la Costurera de Sombras (`vesper`, asesino, Guardián, costo 6, 6/10)

- **Ataque «Tijeras de luto»** (Cuerpo a cuerpo · Daña ×1 ATK al objetivo)
- **Pasiva «Hilván»**: Al usar su Ataque: Envenena al objetivo (1 por turno, 2 turnos) — original: Los básicos dejan hasta 3 puntadas por objetivo y dueña durante 5 s.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Agujas de penumbra (1✦, cd 1) | Abanico de agujas: daño y una puntada por enemigo. | A distancia · Daña ×0.9 ATK a toda la fila del objetivo |
| 2 | Costura de fuga (2✦, cd 2) | Avanza por terreno seguro y deja una costura que daña en 4 pulsos. | Cuerpo a cuerpo · Daña ×1 ATK al objetivo. Envenena al objetivo (1 por turno, 2 turnos). Cambia de fila |
| 3 | Deshilachar (2✦, cd 2) | Consume las puntadas cercanas: +20% de daño por puntada. Después queda afilada: +15% de daño 3 s. | Cuerpo a cuerpo · Daña ×2 ATK al objetivo |
| ★ | La última puntada | Cuatro cortes circulares; el último consume las marcas para amplificarse. Los aliados cercanos ganan +15% de velocidad mientras dura. | Cuerpo a cuerpo · Daña ×2.8 ATK al objetivo |

## Aurelia — la Arquitecta Solar (`aurelia`, mago, Ascensión, costo 7, 10/12)

- **Ataque «Compás de Luz Sólida»** (A distancia · Daña ×1 ATK al objetivo)
- **Pasiva «Convergencia»**: Al usar una habilidad (cada 2 veces): Invoca un Torreta (máx. 2 por partida) — original: Sus habilidades dejan Nodos Solares (máx.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Prisma (2✦, cd 2) | Cristaliza un Nodo Solar en el punto elegido (máx. 3) con un pequeño estallido. | Invoca un Torreta |
| 2 | Refracción (1✦, cd 1) | Rayo en línea; cada nodo que toca lo refracta hacia el enemigo más cercano. | A distancia · Daña ×1.3 ATK al objetivo y quien está detrás |
| 3 | Paso Luminal (1✦, cd 1) | Se traslada al nodo más lejano (o al punto elegido) y crea un nodo donde estaba. Ella y los aliados cercanos ganan +15% de daño 4 s (Luz Sólida). | A distancia · Daña ×1 ATK al objetivo. Cambia de fila |
| ★ | Catedral del Sol | Los nodos se elevan en una catedral geométrica de luz: pulsos de daño dentro y regeneración para aliados. | Daña ×1 ATK a las unidades enemigas. Cura 3 a tus unidades |

## Brasa — la Mecánica Fugitiva (`brasa`, mago, Guardián, costo 5, 5/9)

- **Ataque «Remachadora»** (A distancia · Daña ×1 ATK al objetivo)
- **Pasiva «Reciclaje de latón»** *(propuesta: el ARPG no tiene una escrita)*: Cuando cae un aliado: Invoca un Torreta (máx. 2 por partida)

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Centinela de Latón (2✦, cd 2) | Monta una torreta fija con vida propia. Máximo dos; una tercera retira la más antigua. | Invoca un Torreta |
| 2 | Purga de Vapor (2✦, cd 2) | Cono de vapor: descarga la presión y empuja comunes; ralentiza a jefes sin moverlos. | A distancia · Daña ×0.8 ATK a toda la fila del objetivo. Congela al objetivo |
| 3 | Desmontaje Rápido (1✦, cd 1) | Retira la torreta más cercana, recupera parte de su recarga y acelera. Sin torreta también acelera. | Da +2 ATK este turno a este guardián. Cura 2 a este guardián |
| ★ | Turno de Emergencia | Sobrecarga sus torretas. Sin ninguna, monta una temporal. Después deben enfriarse. | Invoca 2 Torreta. Da +1 ATK este turno a tus unidades |

## Zahra — la Mano de la Válvula (`zahra`, mago, Guardián, costo 5, 5/9)

- **Ataque «Guante de horno»** (A distancia · Daña ×0.6 ATK a toda la fila del objetivo)
- **Pasiva «Calor prestado»**: Al inicio de tu turno: Da +1 ATK a este guardián (máx. 3 por partida) — original: Calor 0–100: desde 60, +15% de daño.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Boca de horno (1✦, cd 1) | Cono ardiente. Genera 30 de calor. | A distancia · Daña ×1.2 ATK a toda la fila del objetivo |
| 2 | Enfriar (1✦, cd 1) | Consume el calor y extingue sus líneas cercanas; escudo de 4% a 12% según calor. | Da Escudo a este guardián. Cura 2 a este guardián |
| 3 | Paso de ceniza (1✦, cd 2) | Avanza por suelo seguro y deja 4 pulsos de ceniza. Genera 25 de calor. | A distancia · Daña ×0.9 ATK al objetivo. Cambia de fila |
| ★ | Abrir todas las válvulas | Consume el calor en 4 pulsos; +0,4% de daño por punto consumido. El vapor escuda 5% a los aliados cercanos. | Daña ×1.3 ATK a las unidades enemigas |

## Garren — el Eslabón (`eslabon`, tanque, Guardián, costo 5, 2/11)

- **Ataque «Cadena de Grilletes»** (Cuerpo a cuerpo · Daña ×1.1 ATK al objetivo)
- **Pasiva «Vínculo de custodia»** *(propuesta: el ARPG no tiene una escrita)*: Reduce 1 el daño que reciben las unidades de su fila (mín. 1)

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Cadena de Retorno (1✦, cd 1) | Engancha y acerca un enemigo. Los jefes reciben daño y ralentización, pero nunca se desplazan. | A distancia · Daña ×0.9 ATK al objetivo. Congela al objetivo |
| 2 | Línea Infranqueable (2✦, cd 2) | Tiende una cadena que frena a quienes la cruzan. No bloquea el movimiento aliado. | Cuerpo a cuerpo · Daña ×0.5 ATK a toda la fila del objetivo. Congela al objetivo |
| 3 | Custodia (1✦, cd 2) | Absorbe parte del daño del aliado elegido, con presupuesto limitado. Solo, obtiene una guardia menor. | A un aliado · Da Escudo al objetivo |
| ★ | Nadie Queda Atrás | Un anillo móvil empuja comunes hacia afuera y protege aliados dentro. Reduce su velocidad mientras dura. | Da +3 VID a tus unidades. Da Provocar a este guardián. Da Escudo a este guardián |

## Brakk — el Arquitecto del Fin (`brakk`, tanque, Guardián, costo 6, 2/14)

- **Ataque «Martillo de obra»** (Cuerpo a cuerpo · Daña ×1 ATK al objetivo)
- **Pasiva «Cimientos firmes»**: Reduce 1 el daño que reciben sí mismo mientras tengas una invocación en mesa (mín. 1) — original: Recibe 8% menos daño mientras permanece a 120 unidades de una construcción propia.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Muro de asedio (2✦, cd 2) | Levanta un muro destructible que daña al aparecer y bloquea enemigos durante 4,5 s. Máximo dos. | Invoca un Muro |
| 2 | Torreta de clavos (2✦, cd 2) | Construye una torreta destructible. Dispara seis ráfagas que dañan hasta tres enemigos cercanos. Máximo dos. | Invoca un Torreta |
| 3 | Apuntalar (1✦, cd 2) | Repara sus construcciones cercanas y obtiene 15% de armadura durante 3 s. | Cura 4 a este guardián. Da +1 VID a tus unidades |
| ★ | Demolición final | Sacrifica construcciones cercanas, golpea y ralentiza enemigos y obtiene un escudo. No acumula daño por cada construcción. | Daña ×0.8 ATK a las unidades enemigas. Congela a las unidades enemigas. Da Escudo a este guardián |

## Tobías — el Farolero (`farolero`, soporte, Guardián, costo 4, 2/9)

- **Ataque «Piqueta de Guardia»** (Cuerpo a cuerpo · Daña ×0.5 ATK a toda la fila del objetivo)
- **Pasiva «Luz de guardia»** *(propuesta: el ARPG no tiene una escrita)*: Al inicio de tu turno: Da Escudo a una unidad aliada al azar (máx. 4 por partida)

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Farol de Guardia (1✦, cd 1) | Coloca un farol, máximo uno, que protege cerca y da luz débil local. No enciende braseros ni elimina oscuridad especial. | A un aliado · Da Escudo al objetivo |
| 2 | Destello (1✦, cd 2) | Cono que desorienta comunes; contra jefes solo aplica ralentización reducida. | A distancia · Daña ×0.5 ATK a toda la fila del objetivo. Congela al objetivo |
| 3 | Paso Seguro (2✦, cd 3) | Senda que amortigua daño ambiental y ralentizaciones. No atraviesa vacíos ni evita peligros letales. | Da Escudo a tus unidades |
| ★ | Vigilia | Círculo móvil de luz y pequeños escudos periódicos. No concede inmunidad ni borra mecánicas de arena. | Da +2 VID a tus unidades. Da Escudo a tus unidades |

## Orsa — la Guardacables (`orsa`, asesino, Guardián, costo 5, 5/8)

- **Ataque «Ballesta de bobina»** (A distancia · Daña ×0.8 ATK al objetivo y quien está detrás)
- **Pasiva «Carga conductora»**: Al usar su Ataque (cada 2 veces): Inflige 1 a toda la fila del objetivo — original: Los básicos dejan hasta 3 cargas por blanco y dueña durante 5 s.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Perno conductor (1✦, cd 1) | Perno lineal que atraviesa varios enemigos y añade una carga. | A distancia · Daña ×1.3 ATK al objetivo y quien está detrás |
| 2 | Apoyar la culata (1✦, cd 2) | Los próximos 3 básicos causan +25%; velocidad −25% mientras dure la postura. Además gana +20% de daño mientras dura la postura. | Da +1 ATK a este guardián |
| 3 | Cerrar el circuito (2✦, cd 2) | Consume cargas cercanas para aumentar daño; la descarga salta a 2 vecinos como máximo, con presupuesto total de 12 blancos. Siempre da un golpe en áre | A distancia · Daña ×1.1 ATK a toda la fila del objetivo |
| ★ | Tormenta de rescate | Tres barridos cargan objetivos; una descarga final consume las marcas cercanas. Frena a los enemigos y da +15% de velocidad a los aliados. | Daña ×1 ATK a las unidades enemigas |

## Bront — la Fortaleza Viviente (`bront`, tanque, Ascensión, costo 7, 3/18)

- **Ataque «Puño de Bastión»** (Cuerpo a cuerpo · Daña ×1.1 ATK al objetivo)
- **Pasiva «Bastión»**: Al recibir daño (cada 2 veces): Da Escudo a este guardián (máx. 4 por partida) — original: Al recibir daño desprende placas (una cada 2,5 s, máx.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Placa Arrojada (1✦, cd 1) | Lanza una placa que daña en línea y queda en el suelo como placa defensiva. | A distancia · Daña ×1.2 ATK al objetivo y quien está detrás |
| 2 | Muro de Placas (2✦, cd 2) | Levanta una muralla de placas frente a él: los enemigos que la cruzan reciben daño y se frenan mucho. | Invoca un Muro |
| 3 | Pulso del Cristal (1✦, cd 1) | El cristal del pecho late: daña a su alrededor, aparta a los comunes y aturde un instante a los élites. Él y los aliados cercanos ganan 20% de armadur | Cuerpo a cuerpo · Daña ×0.7 ATK a toda la fila del objetivo. Congela al objetivo |
| ★ | Ciudadela | Se ancla y se transforma en fortificación: +40% de reducción de daño, murallas alrededor y refugio para aliados. | Da +3 VID a tus unidades. Da Provocar a este guardián. Da Escudo a este guardián |

## Sylva — la Cazadora del Bosque (`cazadora`, asesino, Guardián, costo 4, 5/5)

- **Ataque «Flecha»** (A distancia · Daña ×0.8 ATK al objetivo y quien está detrás)
- **Pasiva «Instinto de Caza»**: Al usar su Ataque: Da +1 ATK a este guardián (máx. 3 por partida) — original: Rastreo marca a su Presa e Impulso crece mientras se mueve o ataca: más velocidad y cadencia.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Flecha Perforante (2✦, cd 1) | Mantené pulsado para cargar: más carga = más daño, velocidad, alcance y penetración. A carga máxima atraviesa varios enemigos | A distancia · Daña ×1.4 ATK al objetivo y quien está detrás |
| 2 | Trampa del Bosque (1✦, cd 2) | Coloca una trampa de raíces; inmoviliza (o ralentiza mucho a bosses) al primer enemigo que la pise | A distancia · Daña ×0.6 ATK al objetivo. Congela al objetivo |
| 3 | Lluvia de la Cazadora (2✦, cd 2) | Tras un breve retraso, una lluvia de flechas cae sobre la zona; prioriza a su Presa si está cerca | A distancia · Daña ×1.2 ATK a toda la fila del objetivo |
| ★ | Cacería Salvaje | Impulso al máximo fijo, puede correr y disparar a la vez, invoca a un Lobo Espectral que persigue a su Presa | A distancia · Daña ×2 ATK al objetivo. Invoca un Lobo Espectral |

## Maura — la Pastora de Espinas (`maura`, soporte, Guardián, costo 5, 2/12)

- **Ataque «Cayado de zarza»** (Cuerpo a cuerpo · Daña ×1 ATK al objetivo)
- **Pasiva «Semillero»**: Al usar su Ataque (cada 2 veces): Cura 1 a tus unidades — original: Impactos directos generan hasta 5 semillas, como máximo una cada 500 ms.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Raíces de paso (1✦, cd 1) | Una línea de raíces daña, frena y deja un suelo de espinas temporal. | A distancia · Daña ×0.8 ATK al objetivo y quien está detrás. Congela al objetivo |
| 2 | Corteza prestada (2✦, cd 2) | Escudo de 10% de vida; al expirar libera una sola descarga si sigue viva. | A un aliado · Da Escudo al objetivo. Cura 2 al objetivo |
| 3 | Poda necesaria (1✦, cd 1) | Corte circular que consume semillas; cura 1% por semilla, máximo 5%. | A distancia · Daña ×0.8 ATK a toda la fila del objetivo. Cura 1 a tus unidades |
| ★ | El bosque camina | Seis pulsos móviles de espinas. No aumenta la hitbox ni crea un ejército. | Daña ×0.8 ATK a las unidades enemigas. Cura 4 a tus unidades |

## Morwen — la Destiladora de Ecos (`morwen`, mago, Guardián, costo 5, 5/9)

- **Ataque «Aguja de Vidrio»** (A distancia · Daña ×0.6 ATK al objetivo. Envenena al objetivo (1 por turno, 2 turnos))
- **Pasiva «Reacción en cadena»** *(propuesta: el ARPG no tiene una escrita)*: +1 de daño a unidades envenenadas

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Resina Amarga (1✦, cd 1) | Un frasco marca y ralentiza. Combinar Resina y Catalizador detona una sola reacción y consume ambos. | A distancia · Daña ×0.6 ATK al objetivo. Envenena al objetivo (1 por turno, 3 turnos) |
| 2 | Sal de Ruptura (2✦, cd 2) | Cono de catalizador. Reacciona con Resina, causa daño inmediato y debilita brevemente. | A distancia · Daña ×1.3 ATK a toda la fila del objetivo |
| 3 | Destilación (1✦, cd 2) | Consume residuos para ganar escudo y limpiar ralentización o quemadura. Sin residuos da una cubierta menor. | Da Escudo a este guardián. Cura 2 a este guardián |
| ★ | Alambique del Silencio | Área que prolonga reactivos y permite una onda secundaria por reacción. Sin propagación infinita. | Daña ×0.7 ATK a las unidades enemigas. Envenena a las unidades enemigas (1 por turno, 3 turnos) |

## Tibor — el Rey sin Corona (`tibor`, soporte, Guardián, costo 5, 5/9)

- **Ataque «Incensario de apicultor»** (A distancia · Daña ×0.6 ATK al objetivo. Envenena al objetivo (1 por turno, 2 turnos))
- **Pasiva «Colonia viva»**: Al inicio de tu turno: Cura 1 a tus unidades — original: Fuerza de colonia 0–100.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Nube obrera (2✦, cd 2) | Coloca una nube que daña cada 600 ms hasta agotarse o expirar. | Invoca un Torreta |
| 2 | Volvé a casa (1✦, cd 1) | Retira la nube, daña su recorrido y recupera 20 de fuerza. Escudo 7%; sin nube, 3%. | Da Escudo a este guardián. Cura 3 a este guardián |
| 3 | Polen de aviso (1✦, cd 1) | Salpicadura que daña, frena y mueve la nube al punto elegido. | A distancia · Daña ×0.6 ATK a toda la fila del objetivo. Congela al objetivo |
| ★ | El cielo zumba | Rellena la fuerza y reemplaza la nube por otra mayor durante 6 s. | Cura 6 a tus unidades. Da +1 ATK y +1 VID a tus unidades. Roba 1 |

## Khepri — el Portador del Enjambre (`khepri`, asesino, Ascensión, costo 7, 8/13)

- **Ataque «Hoces de Élitro»** (Cuerpo a cuerpo · Daña ×0.6 ATK al objetivo. Daña ×0.6 ATK al objetivo)
- **Pasiva «Carroñeros»**: Cuando muere cualquier unidad: Da +1 ATK a este guardián (máx. 4 por partida) — original: Cada enemigo que muere cerca alimenta el enjambre (máx.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Enjambre (1✦, cd 1) | Envía el enjambre al punto elegido: atraviesa el campo, envuelve a los enemigos y vuelve. | A distancia · Daña ×1.2 ATK al objetivo y quien está detrás |
| 2 | Caparazón Vivo (1✦, cd 2) | Los escarabajos forman una armadura: escudo según el enjambre (consume 15). | Da Escudo a este guardián |
| 3 | Vuelo de Élitros (1✦, cd 1) | Salto rasante: los escarabajos muerden todo lo que cruza. | Cuerpo a cuerpo · Daña ×1.4 ATK al objetivo. Cambia de fila |
| ★ | Eclipse de Escarabajos | Khepri se descompone en enjambre y cubre una región: daño continuo y −60% de daño recibido mientras dura. | Daña ×1 ATK a las unidades enemigas. Da Escudo a este guardián |

## Oriel — la Portera de las Cicatrices (`oriel`, tanque, Ascensión, costo 8, 9/15)

- **Ataque «Llave de las Cicatrices»** (A distancia · Daña ×1 ATK al objetivo)
- **Pasiva «Paso entre Cicatrices»**: Al usar una habilidad: Da Escudo a una unidad aliada al azar (máx. 3 por partida) — original: Los aliados que atraviesan sus portales salen del otro lado con escudo y +20% de velocidad (3 s).

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Abrir Cicatriz (1✦, cd 1) | Abre un portal donde está y otro en el punto elegido. Aliados que entran salen por el otro; enemigos son rechazados. | Cambia de fila. Da Escudo a este guardián |
| 2 | Eco de la Cicatriz (1✦, cd 1) | Cada portal abierto pulsa: daña enemigos y cura un poco a los aliados cercanos. | Cuerpo a cuerpo · Daña ×0.9 ATK a toda la fila del objetivo. Cura 1 a tus unidades |
| 3 | Paso entre Mundos (1✦, cd 1) | Oriel aparece en su otro portal (o en el punto elegido) y deja una grieta que daña. | Cuerpo a cuerpo · Daña ×1.1 ATK al objetivo. Cambia de fila |
| ★ | La Gran Cicatriz | Abre una Cicatriz gigante: enemigos dentro se frenan y reciben daño; ecos de campeones caídos salen a golpear y los aliados dentro reciben −20% de dañ | Da +3 VID a tus unidades. Daña ×0.6 ATK a las unidades enemigas. Congela a las unidades enemigas |

## Musashi — el Rōnin del Bokken (`musashi`, asesino, Guardián, costo 5, 5/8)

- **Ataque «Combo del Bokken»** (Cuerpo a cuerpo · Daña ×0.7 ATK al objetivo. Daña ×0.7 ATK al objetivo)
- **Pasiva «Marca de Duelo»**: Al usar su Ataque: Da +1 ATK a este guardián (máx. 3 por partida) — original: Marca a su rival: golpearlo acumula Concentración (hasta 10), que aumenta su daño contra ese objetivo.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Corte del Rōnin (1✦, cd 1) | Avanza y ejecuta un corte horizontal único y extremadamente rápido | Cuerpo a cuerpo · Daña ×2 ATK al objetivo |
| 2 | Paso Fantasma (1✦, cd 2) | Atraviesa a un enemigo y aparece detrás suyo; el siguiente básico gana probabilidad de crítico. Si se activa justo antes de recibir un golpe, es un Pa | Cuerpo a cuerpo · Daña ×1.3 ATK al objetivo. Cambia de fila |
| 3 | Mil Cortes (2✦, cd 2) | Ráfaga de cortes alrededor suyo que prioriza a su objetivo de duelo; cuantos menos enemigos haya, más cortes recibe cada uno | Cuerpo a cuerpo · Daña ×1 ATK a toda la fila del objetivo |
| ★ | Último Duelo | Se transporta con su objetivo de duelo a una arena privada: 1 contra 1 hasta que uno de los dos caiga o se acabe el tiempo | Cuerpo a cuerpo · Daña ×3 ATK al objetivo |

## Ilkan — el Caminante de Dunas (`ilkan`, asesino, Guardián, costo 6, 4/12)

- **Ataque «Hoces Gemelas»** (Cuerpo a cuerpo · Daña ×0.6 ATK al objetivo. Daña ×0.6 ATK al objetivo)
- **Pasiva «Sed de Horizonte»**: Con 25% de vida o menos: +2 ATK — original: Con menos de 25% de vida gana velocidad, daño y más Tormenta.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Lanza-Pendón (1✦, cd 1) | Mantené para apuntar y soltá: arroja la lanza y sale disparado tras su pendón de arena. Durante el vuelo, volvé a usarla para una SEGUNDA lanza con ca | Cuerpo a cuerpo · Daña ×1.5 ATK al objetivo. Cambia de fila |
| 2 | Piel de Duna (1✦, cd 2) | Por un momento recibís menos daño y cada golpe que te dan carga MUCHA más Tormenta. No es invulnerabilidad: es exponerse para transformarse antes | Da Escudo a este guardián. Cura 1 a este guardián |
| 3 | Grito de Caravana (2✦, cd 2) | Grito de caravana: más velocidad, daño y Tormenta (más fuerte con poca vida). Los aliados cercanos reciben una parte | Da +1 ATK este turno a tus unidades |
| ★ | Coloso de Arena | Con la Tormenta llena se transforma en el Coloso de Arena: golpes en área, Alud, Hundimiento, Marcha de Dunas y regeneración. Llenar la Tormenta de nu | Da +3 ATK y +3 VID a este guardián. Daña ×0.9 ATK a las unidades enemigas |

## Nahir — el Restaurador de Espejos (`nahir`, mago, Guardián, costo 4, 4/7)

- **Ataque «Hojas de espejo»** (Cuerpo a cuerpo · Daña ×0.6 ATK a toda la fila del objetivo)
- **Pasiva «Ángulo muerto»**: Al usar su Ataque (cada 2 veces): Inflige 1 al objetivo — original: Cambiar al menos 60° el ángulo de ataque contra el mismo enemigo añade 15% de daño; recarga interna 900 ms.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Astillas errantes (1✦, cd 1) | Proyecta astillas en abanico contra la horda. | A distancia · Daña ×0.9 ATK a toda la fila del objetivo |
| 2 | Reflejo fugitivo (1✦, cd 1) | Paso seguro que deja un reflejo inmóvil; máximo 3. Al dejarlo gana ventaja: +15% de daño 3 s. | Cambia de fila. Da +1 ATK este turno a este guardián |
| 3 | Corte cruzado (2✦, cd 2) | Corte lineal propio y ecos al 25% desde los reflejos; un eco por reflejo y objetivo. | A distancia · Daña ×1.4 ATK al objetivo y quien está detrás |
| ★ | Galería de nadie | Coloca 3 reflejos por 6 s. No son aliados adicionales ni copias autónomas. Cada reflejo estalla en área y frena; Nahir gana +15% de daño mientras dura | Daña ×0.9 ATK a las unidades enemigas. Invoca un Torreta |

## Sira — la Cartógrafa del Regreso (`sira`, soporte, Guardián, costo 4, 4/7)

- **Ataque «Pluma de agrimensor»** (A distancia · Daña ×0.7 ATK al objetivo y quien está detrás)
- **Pasiva «Trazado reciente»**: Al usar su Ataque (cada 3 veces): Roba 1 (máx. 2 por partida) — original: Conserva hasta 12 puntos de los últimos 4 s.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Línea de tinta (1✦, cd 1) | Trazo recto que atraviesa hasta 12 enemigos. | A distancia · Daña ×0.9 ATK al objetivo y quien está detrás |
| 2 | Volver sobre los pasos (1✦, cd 1) | Recorre hacia atrás hasta 170 unidades del trazo válido. Comprueba cada paso contra muros y vacíos. Sin trazo, retrocede un tramo corto; siempre gana  | Cambia de fila. Cura 2 a este guardián |
| 3 | Borrar el camino (2✦, cd 2) | Consume el trazo e impacta una sola vez por objetivo; sin ruta usa un círculo de radio 80. | A distancia · Daña ×1 ATK a toda la fila del objetivo |
| ★ | Atlas de los ausentes | Tres pulsos sobre una copia de la ruta; sin ruta dibuja un rombo local. No altera el mapa. Frena a los enemigos cercanos y da +15% de velocidad a los  | Daña ×0.9 ATK a las unidades enemigas. Congela a las unidades enemigas |

## Iria — la Tejedora de Límites (`iria`, mago, Guardián, costo 5, 5/9)

- **Ataque «Aguja Rúnica»** (A distancia · Daña ×0.8 ATK al objetivo y quien está detrás)
- **Pasiva «Hilos tensos»** *(propuesta: el ARPG no tiene una escrita)*: Al usar su Ataque (cada 3 veces): Congela al objetivo

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Ancla (1✦, cd 2) | Coloca un sello, máximo tres. Las anclas cercanas se unen en orden; sus hilos no son paredes. | Invoca un Torreta |
| 2 | Tensión (1✦, cd 2) | Activa los hilos: ralentizan y marcan a quien cruza. Con menos de dos anclas funciona cerca de Iria. | A distancia · Daña ×0.5 ATK a toda la fila del objetivo. Congela al objetivo |
| 3 | Corte de Hilo (2✦, cd 2) | Consume el ancla más cercana al punto elegido y descarga sus hilos. Cada enemigo recibe un solo golpe. | A distancia · Daña ×1.6 ATK al objetivo y quien está detrás |
| ★ | Sello de los Tres Caminos | Activa un triángulo de daño y control. Sin tres anclas válidas crea uno pequeño propio; no encierra ni desplaza jugadores. | Daña ×1 ATK a las unidades enemigas. Congela a las unidades enemigas |

## Axiom — el Reescritor (`axiom`, mago, Guardián, costo 6, 10/7)

- **Ataque «Paquete Corrupto»** (A distancia · Daña ×0.7 ATK al objetivo. Envenena al objetivo (1 por turno, 2 turnos))
- **Pasiva «Recompilar»**: Cuando cae un enemigo: +1 cristal este turno (máx. 4 por partida) — original: Cada enemigo que muere por sus habilidades le devuelve 3 de energía (hasta 15 por segundo).

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Error 404 (2✦, cd 2) | Marca una zona; tras una breve demora, colapsa y daña/ralentiza en un área | A distancia · Daña ×0.8 ATK a toda la fila del objetivo. Congela al objetivo |
| 2 | Sobrescribir (1✦, cd 1) | Infecta al enemigo más cercano con código corrupto: se contagia de enemigo en enemigo y sigue dañando con el tiempo (más saltos y más daño al mejorarl | A distancia · Daña ×0.8 ATK al objetivo. Envenena al objetivo (1 por turno, 3 turnos) |
| 3 | Teletransporte (1✦, cd 1) | Axiom se desplaza al instante en la dirección en la que mira; casi sin enfriamiento al llevarla al máximo | Cambia de fila. Da +1 ATK este turno a este guardián |
| ★ | Force Quit | Fuerza el cierre de la realidad: 4 segundos de colores invertidos donde nadie más se mueve — al terminar, todo el daño cae de golpe sobre los enemigos | Daña ×1 ATK a las unidades enemigas. Congela a las unidades enemigas |

## Ismara — la Profeta Ciega (`profeta`, soporte, Guardián, costo 5, 4/10)

- **Ataque «Hoja del Augurio»** (Cuerpo a cuerpo · Daña ×1 ATK al objetivo)
- **Pasiva «Presagio»**: Al usar su Ataque (cada 3 veces): Daña ×0.5 ATK a las unidades enemigas — original: Cada 4 golpes básicos consecutivos dispara sola un giro extra que golpea en área.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Destino Restaurado (2✦, cd 2) | Cura al instante al aliado más herido. Si está gravemente herido, además revierte parte del daño reciente que recibió | A un aliado · Cura 6 al objetivo |
| 2 | Visión del Inmortal (2✦, cd 2) | Un aliado cercano se vuelve inmune a todo daño y a efectos negativos por unos segundos; al terminar, recibe una pequeña regeneración | A un aliado · Da Escudo al objetivo. Cura 2 al objetivo |
| 3 | Danza del Augurio (2✦, cd 2) | Gira con su hoja y genera daño de área a su alrededor; si un enemigo está muy cerca, lo aturde brevemente | A distancia · Daña ×0.9 ATK a toda la fila del objetivo |
| ★ | Ascensión del Elegido | Se fusiona con un aliado: él recibe una gran curación, mucho más daño, velocidad de ataque y resistencia, y recarga sus habilidades casi al instante m | A un aliado · Cura 8 al objetivo. Da +3 ATK y +2 VID al objetivo |

## Thalen — el Tejedor Elemental (`mago`, mago, Guardián, costo 4, 6/5)

- **Ataque «Proyectil Arcano»** (A distancia · Daña ×1 ATK al objetivo)
- **Pasiva «Maestro Elemental»**: +1 de daño a unidades congeladas — original: Las reacciones que provoca (Vapor, Quiebre, Conducción) pegan más: su bonus de daño crece 50%.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Muro de Fuego (2✦, cd 2) | Crea un anillo de fuego que quema al pisarlo | A distancia · Daña ×0.8 ATK a toda la fila del objetivo. Envenena al objetivo (1 por turno, 2 turnos) |
| 2 | Nova de Escarcha (2✦, cd 2) | Congela a los enemigos cercanos | A distancia · Daña ×0.7 ATK a toda la fila del objetivo. Congela al objetivo |
| 3 | Cadena de Relámpago (2✦, cd 1) | Salta entre enemigos | A distancia · Daña ×1.3 ATK al objetivo y quien está detrás |
| ★ | Cataclismo Elemental | 3 novas de hielo, lluvia de rayos por 5s y armadura de fuego | Daña ×1 ATK a las unidades enemigas. Congela a las unidades enemigas |

## Baltra — la Campana Sumergida (`baltra`, tanque, Guardián, costo 5, 2/11)

- **Ataque «Badajo de salvamento»** (Cuerpo a cuerpo · Daña ×1.1 ATK al objetivo)
- **Pasiva «Resonancia de rescate»**: Al recibir daño: Da +1 ATK a este guardián (máx. 3 por partida) — original: Recibir daño efectivo en vida o escudo suma vibración: máximo 5, una cada 500 ms.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Bronce vivo (2✦, cd 2) | Onda circular que consume vibración: +12% de daño por carga. | Cuerpo a cuerpo · Daña ×1 ATK a toda la fila del objetivo |
| 2 | Bajo la campana (1✦, cd 2) | Guardia frontal de 25%; velocidad −20% mientras dura. | Da +2 VID a este guardián. Da Provocar a este guardián |
| 3 | Badajo de retorno (2✦, cd 2) | Golpe en cono: consume vibración y frena enemigos; jefes máximo 12%. | Cuerpo a cuerpo · Daña ×1.1 ATK al objetivo. Congela al objetivo |
| ★ | Que todos la escuchen | Tres tañidos; el último empuja comunes. No desplaza jefes. Escuda 6% a los aliados cercanos y frena a los enemigos. | Da +2 VID a tus unidades. Da Escudo a este guardián. Daña ×0.5 ATK a las unidades enemigas |

## Aelith — la Ladrona de Segundos (`aelith`, asesino, Guardián, costo 4, 4/6)

- **Ataque «Péndulo»** (A distancia · Daña ×0.9 ATK al objetivo)
- **Pasiva «Segundos hurtados»**: Al usar una habilidad (cada 3 veces): Acorta 1 turno el enfriamiento de sus habilidades — original: Cada tercer lanzamiento reduce 0,5 s las otras habilidades activas, sin bajar de 1 s ni alterar la definitiva.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Instante roto (1✦, cd 1) | Daña un área y deja un eco que repite 30% del daño tras 0,8 s. Máximo dos ecos. | A distancia · Daña ×1 ATK al objetivo. Daña ×0.5 ATK al objetivo |
| 2 | Fractura de segundos (2✦, cd 2) | Abre una línea que daña y ralentiza a sus enemigos durante 1,8 s. | A distancia · Daña ×0.8 ATK al objetivo y quien está detrás. Congela al objetivo |
| 3 | Tiempo prestado (1✦, cd 2) | Gana 25% de velocidad y 10% de armadura durante 3 s. Después sufre 15% de lentitud durante 0,8 s. | Da +2 ATK este turno a este guardián. Da Escudo a este guardián |
| ★ | La hora imposible | Tres pulsos dañan y ralentizan enemigos. Escuda a aliados dentro del círculo. | Daña ×0.6 ATK a las unidades enemigas. Congela a las unidades enemigas. Da Escudo a tus unidades |

## Solciju — la Enóloga (`solciju`, soporte, Guardián, costo 5, 5/9)

- **Ataque «Copa de vino»** (A distancia · Daña ×0.6 ATK al objetivo. Envenena al objetivo (1 por turno, 2 turnos))
- **Pasiva «Fermentación»**: Al usar su Ataque (cada 2 veces): Envenena al objetivo (1 por turno, 3 turnos) — original: Básicos y vino añaden hasta tres marcas por objetivo durante 5 s.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Vino maldito (1✦, cd 1) | Salpica vino en un área y añade una marca de fermentación. | A distancia · Daña ×0.6 ATK al objetivo. Envenena al objetivo (1 por turno, 3 turnos) |
| 2 | Barrica añeja (2✦, cd 2) | Coloca una barrica que estalla tras 2,4 s. Máximo dos; reemplazar una no la detona. | A distancia · Daña ×1.2 ATK a toda la fila del objetivo |
| 3 | Brindis a solas (1✦, cd 2) | Obtiene 15% de armadura durante 3 s y recupera 4% de vida máxima. | Da Escudo a este guardián. Cura 4 a este guardián |
| ★ | Gran Reserva | Cuatro pulsos de vino dañan y ralentizan enemigos. Protege a aliados dentro del área. | Daña ×0.8 ATK a las unidades enemigas. Congela a las unidades enemigas |

## Veyra — la Última Herida (`veyra`, asesino, Guardián, costo 6, 8/8)

- **Ataque «Navaja escarlata»** (Cuerpo a cuerpo · Daña ×1.2 ATK al objetivo)
- **Pasiva «Al filo»**: Con 40% de vida o menos: +1 ATK — original: Sus habilidades y sangrados infligen 15% más daño cuando tiene menos de 40% de vida.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Abrir la herida (1✦, cd 1) | Corta en abanico y provoca tres pulsos de sangrado. | Cuerpo a cuerpo · Daña ×0.8 ATK a toda la fila del objetivo. Envenena al objetivo (1 por turno, 3 turnos) |
| 2 | Paso escarlata (1✦, cd 1) | Se desplaza sin atravesar muros y hiere a quienes cruza. | Cuerpo a cuerpo · Daña ×1.2 ATK al objetivo. Cambia de fila |
| 3 | Pacto de dolor (1✦, cd 2) | Sacrifica 8% de su vida actual para ganar 25% de velocidad y 10% de armadura durante 3 s. | Da +2 ATK a este guardián. Inflige 2 a este guardián |
| ★ | La última herida | Daña y ralentiza a enemigos cercanos. Recupera 2% de vida y consume sangrados para sanar 1% adicional por herida, hasta 6% total. | Cuerpo a cuerpo · Daña ×2.8 ATK al objetivo. Congela al objetivo |

## Velmira — la Reina de las Máscaras (`velmira`, mago, Ascensión, costo 7, 7/15)

- **Ataque «Cetro de Bambalinas»** (A distancia · Daña ×0.9 ATK al objetivo)
- **Pasiva «Mil Rostros»**: Al usar una habilidad: alterna: Da +1 ATK este turno a tus unidades → Quita 1 ATK a una unidad enemiga al azar → Da Escudo a una unidad aliada al azar → Congela a una unidad enemiga al azar — original: Lleva una máscara activa: Inspiración, Terror, Silencio o Protección.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Máscara Arrojada (1✦, cd 1) | Lanza la máscara activa en línea: daña y aplica su efecto a enemigos y aliados que toca. | A distancia · Daña ×1.2 ATK al objetivo y quien está detrás |
| 2 | Coro de Rostros (2✦, cd 2) | Las máscaras giran a su alrededor: aliados reciben el beneficio y enemigos el castigo de la máscara activa. | Da +1 ATK este turno a tus unidades. Daña ×0.4 ATK a las unidades enemigas |
| 3 | Cambio de Rostro (1✦, cd 1) | Cambia a la siguiente máscara con un pequeño salto: la próxima habilidad se potencia un 30%. | Cambia de fila. Da +2 ATK este turno a este guardián |
| ★ | El Gran Teatro | Cuatro máscaras espectrales gigantes actúan en secuencia: Inspiración, Terror, Silencio y Protección. | Daña ×0.8 ATK a las unidades enemigas. Congela a las unidades enemigas. Da +1 ATK y +1 VID a tus unidades |

## Vhal — el Astrónomo Caído (`vhal`, mago, Ascensión, costo 8, 12/13)

- **Ataque «Astrolabio Roto»** (A distancia · Daña ×0.8 ATK al objetivo y quien está detrás)
- **Pasiva «Masa Crítica»**: Al usar una habilidad: Quita 1 ATK a una unidad enemiga al azar (máx. 4 por partida) — original: Sus habilidades acumulan Masa en los enemigos (máx.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Estrella Errante (1✦, cd 1) | Proyectil estelar en línea: daña y añade 1 de Masa. | A distancia · Daña ×1.3 ATK al objetivo y quien está detrás |
| 2 | Pozo Gravitatorio (2✦, cd 2) | Pozo en el punto elegido: atrae comunes al centro y daña; la Masa aumenta la atracción. | A distancia · Daña ×0.6 ATK a toda la fila del objetivo. Congela al objetivo |
| 3 | Órbita (1✦, cd 1) | Se desplaza en arco alrededor del punto elegido dejando una estela que añade Masa. Al cerrar la órbita gana +15% de daño 4 s. | Cambia de fila. Da +1 ATK a este guardián |
| ★ | Colapso | Una estrella crece, se vuelve singularidad y colapsa: el estallido final escala con la Masa consumida. Mientras atrae, frena; los aliados cercanos gan | Daña ×1.4 ATK a las unidades enemigas |

## Ilvar — el Señor de las Criptas (`nigromante`, mago, Guardián, costo 6, 6/11)

- **Ataque «Proyectil de Hueso»** (A distancia · Daña ×1.1 ATK al objetivo)
- **Pasiva «Necromancia»**: Cuando cae un aliado: Invoca un Esqueleto (máx. 3 por partida) — original: Los enemigos caídos dejan cadáveres: sus esqueletos se levantan solos de los cuerpos cercanos.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Cosecha de Almas (2✦, cd 1) | Arranca almas en un cono: daña, ralentiza y suelta almas. PASIVA: tus esqueletos se levantan solos de los cadáveres cercanos (hasta 6 al mejorarla) | A distancia · Daña ×0.9 ATK a toda la fila del objetivo. Cura 2 a tu Santuario |
| 2 | Gólem de Carne (2✦, cd 2) | Arma un gólem con los cadáveres cercanos (más cuerpos, más vida). Si ya tenés uno: salta al punto apuntado y APLASTA (daño y aturdimiento) | Invoca un Gólem de Carne |
| 3 | Plaga de los Condenados (2✦, cd 2) | Maldice un área: daño continuo y más daño recibido; si un maldito muere, contagia a los cercanos | Envenena a las unidades enemigas (1 por turno, 3 turnos) |
| ★ | Encarnación del Abismo | Absorbe temporalmente a todo tu ejército y te transforma en un Demonio Nigromántico; tu poder escala con cuántos absorbiste | Da +4 ATK y +4 VID a este guardián. Daña ×0.8 ATK a las unidades enemigas |

## Segador — el Olvidado (`segador`, tanque, Guardián, costo 5, 2/11)

- **Ataque «Siega»** (Cuerpo a cuerpo · Daña ×0.7 ATK a toda la fila del objetivo)
- **Pasiva «Furia»**: Al recibir daño: Da +1 ATK a este guardián (máx. 4 por partida) — original: No regenera energía sola: la Furia se gana golpeando y recibiendo daño.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Tajo del Segador (2✦, cd 1) | Corte horizontal amplio; golpea a varios enemigos frente a él | Cuerpo a cuerpo · Daña ×1.2 ATK a toda la fila del objetivo |
| 2 | Armadura de la Furia (1✦, cd 2) | Recibe menos daño; cada golpe recibido genera más Furia | Da Escudo a este guardián. Da +1 ATK a este guardián |
| 3 | Último Aliento (1✦, cd 2) | Intensifica su furor: más daño mientras dura, cura una porción al lanzarlo | Cura 4 a este guardián. Da +2 ATK este turno a este guardián |
| ★ | Segador de Almas | Furia máxima: daño e impacto enormes, resiste el control y roba vida. Cada baja alarga la duración | Cuerpo a cuerpo · Daña ×2.2 ATK al objetivo. Cura 4 a tu Santuario |

## Renko — el Jardinero de Nombres (`renko`, soporte, Guardián, costo 4, 1/10)

- **Ataque «Pala de nombres»** (Cuerpo a cuerpo · Daña ×1.1 ATK al objetivo)
- **Pasiva «Tierra removida»**: Al usar su Ataque (cada 2 veces): Inflige 1 al objetivo y quien está detrás — original: Un básico contra un blanco junto a sus surcos produce una sacudida de ×0,25; recarga interna 900 ms.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Surco de contención (1✦, cd 1) | Traza una línea que daña, frena y deja tierra removida; máximo 3. | A distancia · Daña ×0.9 ATK al objetivo y quien está detrás. Congela al objetivo |
| 2 | Montículo (1✦, cd 2) | Zona no sólida: reduce 8% el daño a aliados dentro. No se acumula con otros montículos. Renko queda cubierto: −20% de daño recibido 3 s. | Da +1 VID a tus unidades. Cura 1 a tus unidades |
| 3 | Devolver a la tierra (2✦, cd 2) | Consume hasta 3 surcos para aumentar el daño circular un 20% por surco. | A distancia · Daña ×1.2 ATK a toda la fila del objetivo |
| ★ | Aquí siguen los nombres | Tres sacudidas. La última aturde comunes 300 ms; los jefes no se aturden. Escuda 5% a los aliados cercanos. | Daña ×0.8 ATK a las unidades enemigas. Congela a las unidades enemigas. Da Escudo a tus unidades |

## Morveth — el Jardinero de la Peste (`morveth`, mago, Guardián, costo 5, 5/9)

- **Ataque «Esporas»** (A distancia · Daña ×0.6 ATK al objetivo. Envenena al objetivo (1 por turno, 2 turnos))
- **Pasiva «Contagio terminal»**: Cuando cae un enemigo: Envenena a una unidad enemiga al azar (1 por turno, 3 turnos) (máx. 4 por partida) — original: Cuando muere un enemigo infectado contagia hasta tres vecinos.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Huerto maldito (2✦, cd 2) | Planta un hongo destructible que libera seis pulsos de esporas. Máximo tres hongos. | Invoca un Torreta |
| 2 | Exhalación de peste (2✦, cd 1) | Daña un abanico e infecta a sus víctimas durante tres pulsos. | A distancia · Daña ×0.8 ATK a toda la fila del objetivo. Envenena al objetivo (1 por turno, 3 turnos) |
| 3 | Simbiosis (1✦, cd 2) | Obtiene 15% de armadura y sana 2% de vida. Consume un hongo cercano para sanar 4% en total. | Da Escudo a este guardián. Cura 2 a este guardián |
| ★ | Jardín de la peste | Cuatro pulsos infectan, dañan y ralentizan. Los aliados dentro del jardín reciben protección. | Daña ×0.7 ATK a las unidades enemigas. Envenena a las unidades enemigas (1 por turno, 3 turnos) |

## San Martín — el Libertador (`libertador`, asesino, Guardián, costo 6, 10/6)

- **Ataque «Fusil de Granadero»** (A distancia · Daña ×1.3 ATK al objetivo)
- **Pasiva «Soldado Cabral»**: Una vez por partida, si fuera a caer a 0, queda con 1 de vida y Escudo — original: Una vez por partida, un golpe mortal lo deja en 1 de vida, invulnerable 2 s y más rápido.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Bayoneta (1✦, cd 1) | Mantené para apuntar y soltá: embestida corta con la bayoneta. Mucho daño, sangrado y un pequeño tambaleo; se detiene al conectar | Cuerpo a cuerpo · Daña ×1.6 ATK al objetivo. Envenena al objetivo (1 por turno, 2 turnos) |
| 2 | ¡Granaderos, a la carga! (2✦, cd 2) | Levanta el sable, suena el clarín y aparecen Granaderos espectrales: +velocidad, +velocidad de ataque, +daño y resistencia al control para vos y tus a | Invoca un Granadero Espectral. Da +1 ATK este turno a tus unidades |
| 3 | Carga de San Lorenzo (2✦, cd 2) | Monta su caballo blanco y carga en línea: atraviesa y empuja a los comunes, aturde a los élite y baja la defensa de los jefes | Cuerpo a cuerpo · Daña ×1.5 ATK al objetivo y quien está detrás |
| ★ | Cruce de los Andes | Carga con Granaderos espectrales entre nieve y escarcha y queda 10 s a caballo: sable corvo, más velocidad y daño, menos daño recibido | Daña ×1 ATK a las unidades enemigas. Invoca 2 Granadero Espectral |

## Saelis — la Heraldo del Plumaje (`saelis`, soporte, Ascensión, costo 7, 8/14)

- **Ataque «Báculo de Plumas»** (A distancia · Daña ×0.5 ATK a toda la fila del objetivo)
- **Pasiva «Muda Celeste»**: Al usar una habilidad: Cura 2 a una unidad aliada al azar — original: Sus habilidades dejan Plumas en el suelo (máx.

| # | Habilidad | Original | En el duelo |
|---|---|---|---|
| 1 | Abanico de Plumas (1✦, cd 1) | Lanza cinco plumas en abanico: cada una daña a los dos primeros enemigos que cruza y queda clavada en el suelo como Pluma. | A distancia · Daña ×0.8 ATK a toda la fila del objetivo |
| 2 | Ráfaga Ascendente (2✦, cd 2) | Bate las alas: aparta a los comunes, frena a los élites, bendice a los aliados cercanos y dispara cada Pluma cercana contra el enemigo más próximo. | Da +1 ATK este turno a tus unidades. Cura 1 a tus unidades |
| 3 | Llamado del Plumaje (1✦, cd 1) | Todas sus Plumas vuelan de regreso: dañan a los enemigos del camino y cada una le acorta 0,2 s las recargas. Aunque no haya plumas, gana +20% de veloc | A distancia · Daña ×1 ATK al objetivo y quien está detrás. Cura 2 a este guardián |
| ★ | Cielo de Plumas | Abre un cielo sobre la zona: caen plumas sobre los enemigos de adentro, los aliados quedan bendecidos y al final seis Plumas quedan en el suelo. | Daña ×1 ATK a las unidades enemigas. Cura 4 a tus unidades |
