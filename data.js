"use strict";
/* ============================================================
   data.js — catálogo de cartas de "La Horda: Cónclave" (boceto v0.1)
   Fuente de arte: guardianes = ilustración del Códice (assets/g/<id>.webp, recorte de
   assets/ui/codex/champions/<id>.png del repo); monstruos = sprite de enemigo (assets/b/<id>.png).
   REGLA DE PUNTOS (la comprueba tools/gate.js): puntos = ATK + VIDA + costo de palabras clave.
     monstruo    : puntos <= 2*costo + 2   (máximo absoluto: 12, un monstruo de costo 5)
     guardián : puntos >= round(2.6*costo + 3) y costo >= 4 (mínimo absoluto: 13)
   => el peor guardián siempre tiene más puntos que el mejor monstruo.
   ============================================================ */
(function (root) {
  var MOV = root.HORDA_MOVES || (typeof require !== "undefined" ? require("./movesets.js") : {});
  var PAS = root.HORDA_PASSIVES || (typeof require !== "undefined" ? require("./passives.js") : {});
  var KW_PTS = { taunt: 1, rush: 1, shield: 1, lifesteal: 1, freezeHit: 1, ingreso: 2, ultimo: 2, inicio: 2 };
  var LINAJES = {
    ciudad:    { name: "Ciudad Maldita",  color: "#c9a14a", arena: "ciudad" },
    forja:     { name: "Forja y Minas",   color: "#d9803a", arena: "minas" },
    bosque:    { name: "Bosque y Hongos", color: "#7fc06a", arena: "bosque" },
    laberinto: { name: "Laberinto",       color: "#d6b45a", arena: "laberinto" },
    marea:     { name: "Marea y Hielo",   color: "#6fb4e8", arena: "hielo" },
    infernal:  { name: "Infernal y Criptas", color: "#d9503a", arena: "infernal" }
  };
  var KW_NAME = { taunt: "Provocar", rush: "Rápido", shield: "Escudo", lifesteal: "Robovida", freezeHit: "Congela" };
  var TO = { enemyFrozen: "las unidades enemigas congeladas", enemyBurning: "las unidades enemigas en llamas", targetRow: "toda la fila del objetivo", targetCol: "el objetivo y quien está detrás", target: "el objetivo", self: "este guardián", allyAll: "tus unidades", enemyAll: "las unidades enemigas",
    randEnemy: "una unidad enemiga al azar", randAlly: "una unidad aliada al azar", enemyFace: "el Santuario enemigo",
    allyFace: "tu Santuario", enemyEverything: "todo el bando enemigo" };

  function describe(ops) {
    return ops.map(function (o) {
      var to = o.to === "allyTag" ? "tus unidades tipo " + o.tag : (TO[o.to] || "");
      switch (o.op) {
        case "dmg": return (o.mult !== undefined ? "Daña ×" + o.mult + " ATK a " + to : "Inflige " + o.n + " a " + to) + (o.ifStatus ? " (+" + o.ifStatus.n + " si está " + ST_ADJ[o.ifStatus.st] + ")" : "");
        case "burn": return "Quema a " + to + " (" + o.n + " por turno, " + o.turns + " turnos)";
        case "sacrifice": return "Sacrificá una de tus invocaciones";
        case "swapRow": return "Cambia de fila";
        case "heal": return "Cura " + o.n + " a " + to;
        case "buff": return (o.temp ? "Da " : "Da ") + (o.atk ? "+" + o.atk + " ATK" : "") + (o.atk && o.hp ? " y " : "") + (o.hp ? "+" + o.hp + " VID" : "") + (o.temp ? " este turno" : "") + " a " + to;
        case "debuff": return "Quita " + (o.atk ? o.atk + " ATK" : "") + (o.atk && o.hp ? " y " : "") + (o.hp ? o.hp + " VID" : "") + " a " + to;
        case "give": return "Da " + KW_NAME[o.kw] + " a " + to;
        case "freeze": return "Congela " + (o.n > 1 ? o.n + " turnos " : "") + "a " + to;
        case "poison": return "Envenena a " + to + " (" + o.n + " por turno, " + o.turns + " turnos)";
        case "silence": return "Silencia a " + to;
        case "draw": return "Roba " + o.n;
        case "summon": return "Invoca " + (o.n > 1 ? o.n + " " : "un ") + (CARDS[o.id] ? CARDS[o.id].name : o.id);
        case "crystal": return "+" + o.n + " cristal este turno";
        case "refresh": return "Permite actuar otra vez a " + to;
        case "cdDown": return "Acorta " + o.n + " turno el enfriamiento de sus habilidades";
      }
      return "";
    }).join(". ").replace(/ a el /g, " al ").replace(/ a las unidades/g, " a las unidades");
  }

  var ST_ADJ = { burn: "en llamas", frozen: "congelada", poison: "envenenada" };
  var CARDS = {};
  var ART_G = "assets/g/", ART_B = "assets/b/";

  // ---------- GUARDIANES ----------
  // [id, nombre, título, rol, linaje, costo, ascensión?]  (rol/linaje provisionales: ver docs)
  var G = [
    ["tanque","Aldric","el Último Bastión","tanque","ciudad",5],
    ["guerrero","Kael","la Daga Carmesí","asesino","ciudad",4],
    ["soporte","Elyra","la Guardiana del Alba","soporte","ciudad",4],
    ["ynara","Ynara","la Médica de los Refugios","soporte","ciudad",4],
    ["myla","Myla","la Niña de la Cuchara","mago","ciudad",5],
    ["dariel","Dáriel","el Último Compás","soporte","ciudad",5],
    ["vesper","Vesper","la Costurera de Sombras","asesino","ciudad",6],
    ["aurelia","Aurelia","la Arquitecta Solar","mago","ciudad",7,1],
    ["brasa","Brasa","la Mecánica Fugitiva","mago","forja",5],
    ["zahra","Zahra","la Mano de la Válvula","mago","forja",5],
    ["eslabon","Garren","el Eslabón","tanque","forja",5],
    ["brakk","Brakk","el Arquitecto del Fin","tanque","forja",6],
    ["farolero","Tobías","el Farolero","soporte","forja",4],
    ["orsa","Orsa","la Guardacables","asesino","forja",5],
    ["bront","Bront","la Fortaleza Viviente","tanque","forja",7,1],
    ["cazadora","Sylva","la Cazadora del Bosque","asesino","bosque",4],
    ["maura","Maura","la Pastora de Espinas","soporte","bosque",5],
    ["morwen","Morwen","la Destiladora de Ecos","mago","bosque",5],
    ["tibor","Tibor","el Rey sin Corona","soporte","bosque",5],
    ["khepri","Khepri","el Portador del Enjambre","asesino","bosque",7,1],
    ["oriel","Oriel","la Portera de las Cicatrices","tanque","bosque",8,1],
    ["musashi","Musashi","el Rōnin del Bokken","asesino","laberinto",5],
    ["ilkan","Ilkan","el Caminante de Dunas","asesino","laberinto",6],
    ["nahir","Nahir","el Restaurador de Espejos","mago","laberinto",4],
    ["sira","Sira","la Cartógrafa del Regreso","soporte","laberinto",4],
    ["iria","Iria","la Tejedora de Límites","mago","laberinto",5],
    ["axiom","Axiom","el Reescritor","mago","laberinto",6],
    ["profeta","Ismara","la Profeta Ciega","soporte","laberinto",5],
    ["mago","Thalen","el Tejedor Elemental","mago","marea",4],
    ["baltra","Baltra","la Campana Sumergida","tanque","marea",5],
    ["aelith","Aelith","la Ladrona de Segundos","asesino","marea",4],
    ["solciju","Solciju","la Enóloga","soporte","marea",5],
    ["veyra","Veyra","la Última Herida","asesino","marea",6],
    ["velmira","Velmira","la Reina de las Máscaras","mago","marea",7,1],
    ["vhal","Vhal","el Astrónomo Caído","mago","marea",8,1],
    ["nigromante","Ilvar","el Señor de las Criptas","mago","infernal",6],
    ["segador","Segador","el Olvidado","tanque","infernal",5],
    ["renko","Renko","el Jardinero de Nombres","soporte","infernal",4],
    ["morveth","Morveth","el Jardinero de la Peste","mago","infernal",5],
    ["libertador","San Martín","el Libertador","asesino","infernal",6],
    ["saelis","Saelis","la Heraldo del Plumaje","soporte","infernal",7,1]
  ];
  var ROLE = {
    tanque:  { share: .30, kw: ["taunt"],  ab: { name: "Muralla", cost: 1, target: "allyUnit", ops: [{ op: "buff", hp: 2, to: "target" }, { op: "give", kw: "taunt", to: "target" }] },
               ult: { name: "Último Bastión", target: "none", ops: [{ op: "buff", hp: 3, to: "allyAll" }, { op: "give", kw: "taunt", to: "self" }, { op: "heal", n: 5, to: "allyFace" }] } },
    asesino: { share: .52, kw: ["rush"],   ab: { name: "Tajo Certero", cost: 1, target: "enemyUnit", ops: [{ op: "dmg", n: 2, to: "target" }] },
               ult: { name: "Ejecución", target: "enemyUnit", ops: [{ op: "dmg", n: 6, to: "target" }] } },
    mago:    { share: .42, kw: [],         ab: { name: "Chispa Arcana", cost: 1, target: "none", ops: [{ op: "dmg", n: 1, to: "enemyAll" }] },
               ult: { name: "Cataclismo", target: "none", ops: [{ op: "dmg", n: 3, to: "enemyAll" }, { op: "dmg", n: 3, to: "enemyFace" }] } },
    soporte: { share: .36, kw: [],         ab: { name: "Sanar", cost: 1, target: "allyAny", ops: [{ op: "heal", n: 3, to: "target" }, { op: "buff", atk: 1, temp: 1, to: "target" }] },
               ult: { name: "Alba", target: "none", ops: [{ op: "heal", n: 8, to: "allyAll" }, { op: "buff", atk: 1, hp: 1, to: "allyAll" }, { op: "draw", n: 1 }] } }
  };
  var LIN_INGRESO = {
    ciudad:    [{ op: "draw", n: 1 }, { op: "buff", atk: 1, temp: 1, to: "allyAll" }],
    forja:     [{ op: "buff", atk: 1, hp: 1, to: "allyAll" }],
    bosque:    [{ op: "buff", atk: 1, to: "allyAll" }],
    laberinto: [{ op: "freeze", n: 1, to: "randEnemy" }, { op: "dmg", n: 1, to: "randEnemy" }],
    marea:     [{ op: "dmg", n: 1, to: "randEnemy" }],
    infernal:  [{ op: "summon", id: "esqueleto", n: 1 }]
  };
  function BASIC(reach, name, ops) { return { name: name || "Ataque", basic: true, cost: 0, cd: 1, tgt: "enemy", reach: reach, ops: ops || [{ op: "dmg", mult: 1, to: "target" }] }; }
  function pa0(id) { return PAS[id] || {}; }
  function guardianPoints(c) { return Math.round(2.6 * c + 3); }
  G.forEach(function (g, k) {
    var id = g[0], role = ROLE[g[3]], c = g[5], asc = !!g[6];
    var kwp = role.kw.length;                               // 1 punto por palabra clave de rol
    var S = guardianPoints(c) - 2 - kwp + (asc ? 3 : 0);    // 2 = ingreso del linaje
    // reparto ATK/VIDA: sale de la relación daño/vida REAL del guardián en el ARPG (tanques = mucha vida, tiradores = mucho ataque)
    var r = (pa0(id).ratio) || 0.1, share = Math.max(0.2, Math.min(0.62, 0.18 + (r - 0.045) / 0.14 * 0.5));
    var atk = Math.max(1, Math.round(S * share)), hp = S - atk, dd = Math.max(-1, Math.min(1, Math.round(((pa0(id).repoHp || 108) - 108) / 25)));
    if (atk - dd >= 1) { atk -= dd; hp += dd; }   // más vida real → un punto de ATK pasa a VIDA (y al revés)
    if (hp < 3) { hp = 3; atk = S - 3; }
    var kw = {}; role.kw.forEach(function (x) { kw[x] = 1; });
    var pa = PAS[id] || {}, basicReach = pa.ranged ? "ranged" : "melee";
    var moves = [BASIC(basicReach, pa.basic, pa.basicOps)].concat(MOV[id] || []);
    CARDS[id] = {
      id: id, type: "unit", kind: "guardian", name: g[1], title: g[2], role: g[3], origin: g[4], cost: c,
      atk: atk, hp: hp, kw: kw, ingreso: LIN_INGRESO[g[4]], moves: moves, reach: basicReach, passive: PAS[id] ? PAS[id].passive : null,
      rarity: asc ? "ascension" : "guardian", art: ART_G + id + ".webp", ultNeed: asc ? 2 : 3,
      tier: asc ? "Ascensión" : "Guardián"
    };
  });

  // ---------- MONSTRUOS ----------
  // [id, nombre, linaje, costo, atk, hp, kw[], ingreso[], ultimo[], rango]
  var B = [
    ["cm_saqueador","Saqueador","ciudad",1,2,1,[],null,null],
    ["cm_perro","Perro de Cloaca","ciudad",2,3,2,["rush"],null,null],
    ["cm_planidera","Planidera","ciudad",2,1,2,[],[{op:"debuff",atk:1,to:"randEnemy"}],null],
    ["cm_raptor","Raptor","ciudad",3,2,3,[],[{op:"draw",n:1}],null],
    ["cm_acechante","Acechante","ciudad",3,4,2,["rush"],null,null],
    ["cm_sectario","Sectario","ciudad",3,3,2,[],null,[{op:"dmg",n:2,to:"randEnemy"}]],
    ["cm_campanero","Campanero","ciudad",4,3,4,[],[{op:"heal",n:2,to:"allyAll"}],null],
    ["cm_espectro","Espectro","ciudad",4,4,4,["lifesteal"],null,null],
    ["cristal_servo","Servo de Cristal","forja",1,1,2,[],null,null],
    ["engendro","Engendro","forja",2,3,2,[],null,null],
    ["cristal_volador","Cristal Volador","forja",2,3,2,["rush"],null,null],
    ["mn_devoraluz","Devoraluz","forja",3,3,3,["freezeHit"],null,null],
    ["golem_cristal","Gólem de Cristal","forja",4,3,6,["taunt"],null,null],
    ["duende_bosque","Duende del Bosque","bosque",1,2,1,[],null,null],
    ["bestia_bosque","Bestia del Bosque","bosque",2,3,2,["rush"],null,null],
    ["cu_sith","Cù-Sìth","bosque",3,4,3,["rush"],null,null],
    ["dama_bosque","Dama del Bosque","bosque",4,3,4,[],[{op:"heal",n:3,to:"allyAll"}],null],
    ["ent","Ent","bosque",5,4,7,["taunt"],null,null],
    ["escorpion_gigante","Escorpión Gigante","laberinto",2,2,2,["freezeHit"],null,null],
    ["golem_piedra","Gólem de Piedra","laberinto",3,2,5,["taunt"],null,null],
    ["medusa","Medusa","laberinto",3,2,3,[],[{op:"freeze",n:1,to:"randEnemy"}],null],
    ["druida_arena","Druida de Arena","laberinto",4,2,4,[],[{op:"buff",atk:1,hp:1,to:"allyAll"}],null],
    ["esfinge","Esfinge","laberinto",5,5,5,["shield"],null,null],
    ["lobo_artico","Lobo Ártico","marea",1,2,1,["rush"],null,null],
    ["hada_escarcha","Hada de Escarcha","marea",1,1,1,[],[{op:"freeze",n:1,to:"randEnemy"}],null],
    ["tiburon_joven","Tiburón Joven","marea",2,3,2,["rush"],null,null],
    ["golem_hielo","Gólem de Hielo","marea",3,2,4,["taunt","freezeHit"],null,null],
    ["dragoncito_hielo","Dragoncito de Hielo","marea",3,3,3,[],[{op:"dmg",n:1,to:"randEnemy"}],null],
    ["angel_hielo","Ángel de Hielo","marea",4,3,4,["shield","lifesteal"],null,null],
    ["tiburon_blanco","Tiburón Blanco","marea",4,5,4,[],null,null],
    ["dragon_hielo","Tundraverx","marea",5,5,5,["freezeHit"],null,null],
    ["medusa_electrica","Medusa Eléctrica","marea",3,3,3,[],[{op:"dmg",n:1,to:"randEnemy"}],null],
    ["cangrejo_acorazado","Cangrejo Acorazado","marea",3,1,6,["taunt"],null,null],
    ["esqueleto","Esqueleto","infernal",1,2,2,[],null,null],
    ["zombie","Zombi","infernal",2,2,3,["taunt"],null,null],
    ["esqueleto_h","Esqueleto Cornudo","infernal",3,3,4,[],null,null],
    ["demonio_menor","Demonio Menor","infernal",3,4,4,[],null,null],
    ["demonio_mago","Demonio Hechicero","infernal",4,3,4,[],[{op:"dmg",n:2,to:"randEnemy"}],null],
    ["golem","Gólem","infernal",5,5,6,["taunt"],null,null]
  ];
  var RANGED_B = ["dama_bosque", "druida_arena", "esfinge", "cristal_volador", "dragoncito_hielo", "angel_hielo", "demonio_mago", "medusa", "sirena_abisal"];
  B.forEach(function (b) {
    var kw = {}; b[6].forEach(function (x) { kw[x] = 1; });
    CARDS[b[0]] = {
      id: b[0], type: "unit", kind: "bicho", name: b[1], origin: b[2], cost: b[3], atk: b[4], hp: b[5], kw: kw,
      ingreso: b[7] || null, ultimo: b[8] || null, reach: RANGED_B.indexOf(b[0]) >= 0 ? "ranged" : "melee",
      moves: [BASIC(RANGED_B.indexOf(b[0]) >= 0 ? "ranged" : "melee")],
      rarity: b[3] <= 2 ? "normal" : b[3] === 3 ? "subelite" : "elite", art: ART_B + b[0] + ".png", tier: "Monstruo"
    };
  });

  CARDS.token_muro = { id: "token_muro", type: "unit", kind: "bicho", token: 1, name: "Muro", origin: null, cost: 0, atk: 0, hp: 4, kw: { taunt: 1 }, ingreso: null, ultimo: null, reach: "melee", moves: [], rarity: "normal", art: ART_B + "golem_piedra.png", tier: "Invocación" };
  CARDS.token_torreta = { id: "token_torreta", type: "unit", kind: "bicho", token: 1, name: "Torreta", origin: null, cost: 0, atk: 2, hp: 2, kw: {}, ingreso: null, ultimo: null, reach: "ranged", moves: [BASIC("ranged")], rarity: "normal", art: ART_B + "cristal_servo.png", tier: "Invocación" };


  // ---------- JEFES (cartas especiales: solo aparecen en el modo Aventura, ya en mesa) ----------
  var BOSS = [
    ["boss_campanero", "El Gran Campanero", "cm_campanero", 2, 8, "ranged", { name: "Campanada", cost: 2, cd: 3, tgt: "none", ops: [{ op: "dmg", mult: 0.4, to: "enemyAll" }] }],
    ["boss_jinete", "Jinete Sin Cabeza", "jinete_sin_cabeza", 2, 8, "melee", { name: "Galope", cost: 2, cd: 3, tgt: "enemy", reach: "melee", ops: [{ op: "dmg", mult: 1.2, to: "targetCol" }] }],
    ["boss_devoraluz", "Devoraluz Ancestral", "mn_devoraluz", 2, 9, "ranged", { name: "Apagón", cost: 2, cd: 3, tgt: "enemy", reach: "ranged", ops: [{ op: "dmg", mult: 0.5, to: "target" }, { op: "freeze", n: 1, to: "target" }] }],
    ["boss_minotauro", "Minotauro", "minotauro", 2, 10, "melee", { name: "Embestida", cost: 2, cd: 3, tgt: "enemy", reach: "melee", ops: [{ op: "dmg", mult: 1.4, to: "target" }] }],
    ["boss_mago", "El Mago Gélido", "mago_hielo_cristal", 2, 8, "ranged", { name: "Ventisca", cost: 2, cd: 3, tgt: "none", ops: [{ op: "dmg", mult: 0.4, to: "enemyAll" }] }],
    ["boss_demonio", "Demonio Mayor", "demonio_mayor", 2, 11, "melee", { name: "Fuego infernal", cost: 2, cd: 3, tgt: "enemy", reach: "ranged", ops: [{ op: "dmg", mult: 0.8, to: "targetRow" }] }]
  ];
  BOSS.forEach(function (b) {
    CARDS[b[0]] = { id: b[0], type: "unit", kind: "bicho", token: 1, boss: 1, name: b[1], origin: null, cost: 0, atk: b[3], hp: b[4], kw: {}, ingreso: null, ultimo: null, reach: b[5],
      moves: [BASIC(b[5]), { name: b[6].name, cost: b[6].cost, cd: b[6].cd, tgt: b[6].tgt, reach: b[6].reach, ops: b[6].ops }], rarity: "elite", art: ART_B + b[2] + ".png", tier: "Jefe" };
  });

  // ---------- MODO AVENTURA ----------
  // Capítulos = arenas de La Horda. Se avanza por nodos: combates (capturás monstruos), aliados (reclutás guardianes), cofres (magia) y el jefe.
  // El texto narrativo es provisional: reemplazar por el de docs/lore/ cuando se decida el guion.
  var CHAPTERS = [
    { id: "ciudad", lin: "ciudad", map: "ciudad", name: "Ciudad Maldita", boss: "boss_campanero", blurb: "La Horda cayó sobre la ciudad. Las campanas no paran de sonar y los guardianes que quedan se esconden en los refugios.", bossText: "El Gran Campanero llama a toda la Horda con cada campanada." },
    { id: "bosque", lin: "bosque", map: "bosque", name: "Ruinas del Bosque", boss: "boss_jinete", blurb: "Más allá de la muralla, el bosque guarda ruinas viejas. Algo galopa entre los árboles sin hacer ruido.", bossText: "El Jinete Sin Cabeza cabalga por las ruinas y no se detiene." },
    { id: "forja", lin: "forja", map: "minas", name: "Minas Profundas", boss: "boss_devoraluz", blurb: "Abajo la luz es territorio: quien la controla, controla la mina. Algo se está comiendo los faroles.", bossText: "El Devoraluz Ancestral apaga todo lo que brilla." },
    { id: "laberinto", lin: "laberinto", map: "laberinto", name: "Laberinto", boss: "boss_minotauro", blurb: "Muros que se mueven, caminos que no vuelven. Los reflejos de las galerías te señalan por dónde ir.", bossText: "El Minotauro vigila el centro del laberinto." },
    { id: "marea", lin: "marea", map: "hielo", name: "Arena Gélida", boss: "boss_mago", blurb: "El frío es el enemigo. Cada paso en la nieve cuesta el doble y las novas heladas llegan sin aviso.", bossText: "El Mago Gélido congela todo lo que ve." },
    { id: "infernal", lin: "infernal", map: "infernal", name: "Arena Infernal", boss: "boss_demonio", blurb: "Último tramo. El suelo arde y los muertos caminan. Quien llega acá ya no pelea solo.", bossText: "El Demonio Mayor espera en el centro del fuego." }
  ];
  // plantilla de nodos de cada capítulo
  var NODES = [
    { t: "fight", title: "Emboscada", tier: 0, hp: 28, text: "Una patrulla de la Horda te cierra el paso." },
    { t: "fight", title: "Campamento", tier: 0, hp: 34, text: "Un campamento enemigo. Quizá puedas capturar a alguno." },
    { t: "ally", title: "Un guardián pide ayuda", text: "Un guardián de la zona se une a tu causa. Elegí a tu nuevo compañero." },
    { t: "fight", title: "Retaguardia", tier: 1, hp: 38, text: "Los refuerzos enemigos llegan con un guardián caído a la cabeza." },
    { t: "cache", title: "Cofre abandonado", text: "Un cofre con hechizos y reliquias. Llevate una." },
    { t: "boss", title: "Jefe de la arena", tier: 1, hp: 30, php: 46, bonusHand: 3, text: "" }
  ];
  function advStarter(companion) {
    return [companion, "cm_saqueador", "cm_saqueador", "esqueleto", "esqueleto", "duende_bosque", "duende_bosque", "lobo_artico", "lobo_artico", "zombie", "zombie", "cm_perro", "tiburon_joven", "piedra", "piedra", "rayo", "banquete", "debilitar"];
  }
  function enemyDeck(ch, nodeIdx) {
    var C = CHAPTERS[ch], N = NODES[nodeIdx], base = DECKS[C.lin];
    var gs = base.filter(function (id) { return CARDS[id].kind === "guardian"; }).sort(function (a, b) { return CARDS[a].cost - CARDS[b].cost; });
    var non = base.filter(function (id) { return CARDS[id].kind !== "guardian"; });
    var tier = Math.min(5, (N.tier || 0) + (ch >= 5 ? 1 : 0));
    return non.concat(gs.slice(0, tier));
  }
  function encounter(ch, nodeIdx) {
    var C = CHAPTERS[ch], N = NODES[nodeIdx];
    var enc = { name: N.t === "boss" ? CARDS[C.boss].name : N.title + " · " + C.name, deck: enemyDeck(ch, nodeIdx), map: C.map, hp: N.hp + ch, php: N.php || 40, bonusHand: N.bonusHand || 0, pre: [] };
    if (N.t === "boss") enc.pre.push({ p: 1, id: C.boss, cell: 1 });
    return enc;
  }

  CARDS.token_lobo = { id: "token_lobo", type: "unit", kind: "bicho", token: 1, name: "Lobo Espectral", origin: null, cost: 0, atk: 3, hp: 2, kw: { rush: 1 }, ingreso: null, ultimo: null, reach: "melee", moves: [BASIC("melee")], rarity: "normal", art: ART_B + "lobo_artico.png", tier: "Invocación" };
  CARDS.token_granadero = { id: "token_granadero", type: "unit", kind: "bicho", token: 1, name: "Granadero Espectral", origin: null, cost: 0, atk: 2, hp: 3, kw: {}, ingreso: null, ultimo: null, reach: "melee", moves: [BASIC("melee")], rarity: "normal", art: ART_B + "esqueleto_h.png", tier: "Invocación" };
  CARDS.token_golem = { id: "token_golem", type: "unit", kind: "bicho", token: 1, name: "Gólem de Carne", origin: null, cost: 0, atk: 3, hp: 4, kw: { taunt: 1 }, ingreso: null, ultimo: null, reach: "melee", moves: [BASIC("melee")], rarity: "normal", art: ART_B + "golem_piedra.png", tier: "Invocación" };


  // ---------- ETIQUETAS (tipos) de monstruos: las usan las cartas con sinergia ----------
  var TAGS = {
    Bestia: ["lobo_artico", "bestia_bosque", "cu_sith", "tiburon_joven", "tiburon_blanco", "cm_perro", "escorpion_gigante", "token_lobo"],
    Planta: ["duende_bosque", "ent", "dama_bosque"],
    Esqueleto: ["esqueleto", "esqueleto_h"],
    Demonio: ["demonio_menor", "demonio_mago", "demonio_hielo_fuego"],
    Hielo: ["lobo_artico", "hada_escarcha", "golem_hielo", "dragoncito_hielo", "angel_hielo", "demonio_hielo_fuego", "dragon_hielo"],
    Ciudadano: ["cm_saqueador", "cm_planidera", "cm_raptor", "cm_sectario", "cm_acechante", "cm_campanero"],
    Cristal: ["cristal_servo", "cristal_volador", "golem_cristal"],
    Golem: ["golem", "golem_hielo", "golem_cristal", "golem_piedra", "token_golem"],
    "Máquina": ["token_torreta"], "Construcción": ["token_muro"]
  };
  Object.keys(TAGS).forEach(function (tg) { TAGS[tg].forEach(function (id) { if (CARDS[id]) { CARDS[id].tags = CARDS[id].tags || []; CARDS[id].tags.push(tg); } }); });

  // ---------- HECHIZOS / BONUS / MALDICIONES / CAMPOS ----------
  function S(id, name, cat, cost, target, ops, extra) {
    var c = { id: id, type: cat === "campo" ? "field" : "spell", cat: cat, name: name, cost: cost, target: target, ops: ops, rarity: cat, tier: ({ hechizo: "Hechizo", bonus: "Bonus", maldicion: "Maldición", campo: "Campo" })[cat] };
    for (var k in (extra || {})) c[k] = extra[k];
    CARDS[id] = c;
  }
  S("chispa", "Chispa de Horda", "bonus", 0, "none", [{ op: "crystal", n: 1 }], { coin: 1 });
  S("rayo", "Rayo del Alba", "hechizo", 2, "enemyAny", [{ op: "dmg", n: 3, to: "target" }]);
  S("llamarada", "Llamarada", "hechizo", 4, "none", [{ op: "dmg", n: 2, to: "enemyAll" }]);
  S("escarcha", "Escarcha", "hechizo", 2, "enemyUnit", [{ op: "dmg", n: 1, to: "target" }, { op: "freeze", n: 1, to: "target" }]);
  S("tormenta", "Tormenta de Cristal", "hechizo", 6, "none", [{ op: "dmg", n: 4, to: "enemyAll" }, { op: "dmg", n: 2, to: "enemyFace" }]);
  S("corazon", "Corazón de Ceniza", "bonus", 3, "allyGuardian", [{ op: "buff", atk: 2, hp: 2, to: "target" }]);
  S("egida", "Égida Ancestral", "bonus", 2, "allyGuardian", [{ op: "buff", hp: 3, to: "target" }, { op: "give", kw: "shield", to: "target" }]);
  S("sello", "Sello de Mando", "bonus", 4, "allyGuardian", [{ op: "buff", atk: 3, hp: 1, to: "target" }, { op: "give", kw: "rush", to: "target" }]);
  S("bendicion", "Bendición del Alba", "bonus", 3, "none", [{ op: "buff", atk: 1, hp: 1, to: "allyAll" }]);
  S("furia", "Furia de la Horda", "bonus", 2, "none", [{ op: "buff", atk: 2, temp: 1, to: "allyAll" }]);
  S("banquete", "Banquete Fúngico", "bonus", 1, "allyAny", [{ op: "heal", n: 4, to: "target" }]);
  S("piedra", "Piedra de Resonancia", "bonus", 1, "allyUnit", [{ op: "buff", atk: 1, hp: 1, to: "target" }]);
  S("debilitar", "Debilitar", "maldicion", 1, "enemyUnit", [{ op: "debuff", atk: 2, to: "target" }]);
  S("podredumbre", "Podredumbre", "maldicion", 3, "none", [{ op: "debuff", atk: 1, hp: 1, to: "enemyAll" }]);
  S("veneno", "Veneno de Cripta", "maldicion", 2, "enemyUnit", [{ op: "poison", n: 2, turns: 3, to: "target" }]);
  S("silencio", "Silencio", "maldicion", 2, "enemyUnit", [{ op: "silence", to: "target" }, { op: "debuff", atk: 1, to: "target" }]);
  S("cadenas", "Cadenas", "maldicion", 2, "enemyUnit", [{ op: "freeze", n: 2, to: "target" }]);
  S("marchitar", "Marchitar", "maldicion", 4, "enemyUnit", [{ op: "debuff", atk: 3, hp: 3, to: "target" }]);
  S("inspiracion", "Inspiración", "bonus", 2, "none", [{ op: "draw", n: 2 }]);
  S("segunda", "Segunda Oportunidad", "bonus", 2, "none", [{ op: "draw", n: 1 }, { op: "crystal", n: 1 }]);
  S("robovida", "Robo de Vida", "hechizo", 3, "enemyUnit", [{ op: "dmg", n: 3, to: "target" }, { op: "heal", n: 3, to: "allyFace" }]);
  S("fuego", "Fuego Directo", "hechizo", 3, "none", [{ op: "dmg", n: 4, to: "enemyFace" }]);
  S("invierno", "Invierno", "hechizo", 5, "none", [{ op: "dmg", n: 1, to: "enemyAll" }, { op: "freeze", n: 1, to: "enemyAll" }]);
  S("marea", "Marea Curativa", "bonus", 3, "none", [{ op: "heal", n: 3, to: "allyAll" }]);
  S("manada", "Manada", "bonus", 3, "none", [{ op: "summon", id: "token_lobo", n: 2 }]);
  S("muro_piedra", "Muro de Piedra", "bonus", 2, "none", [{ op: "summon", id: "token_muro", n: 1 }]);
  S("pacto", "Pacto de Sangre", "bonus", 1, "allyGuardian", [{ op: "buff", atk: 3, hp: -2, to: "target" }]);
  // TRAMPAS: boca abajo (máx. 2); se disparan solas. "esa unidad" = la que activó la trampa.
  var TRIG_TXT_T = { ataque: "Cuando una unidad rival ataca a una de tus unidades", ataqueFace: "Cuando una unidad rival ataca a tu Invocador", hechizo: "Cuando el rival juega un hechizo o una maldición", despliegue: "Cuando el rival despliega una unidad", habilidad: "Cuando una unidad rival usa una habilidad" };
  function T(id, name, cost, trig, cancel, ops) { CARDS[id] = { id: id, type: "trap", cat: "trampa", name: name, cost: cost, trig: trig, cancel: !!cancel, ops: ops, rarity: "trampa", tier: "Trampa", text: TRIG_TXT_T[trig] + ": " + (cancel ? "anula la acción" + (ops.length ? ". " : "") : "") + describe(ops).replace(/ el objetivo/g, " esa unidad").replace(/ al objetivo/g, " a esa unidad").replace(/ a esa unidad$/, " a esa unidad") }; }
  T("espinas", "Trampa de Espinas", 2, "ataque", false, [{ op: "dmg", n: 3, to: "target" }]);
  T("muro_hielo", "Muro de Escarcha", 2, "ataqueFace", true, [{ op: "freeze", n: 1, to: "target" }]);
  T("barrera", "Barrera Sagrada", 2, "ataqueFace", true, [{ op: "heal", n: 3, to: "allyFace" }]);
  T("espejo", "Espejo Arcano", 3, "hechizo", true, []);
  T("emboscada", "Emboscada", 3, "despliegue", false, [{ op: "dmg", n: 3, to: "target" }]);
  T("red", "Red de Cazador", 2, "habilidad", false, [{ op: "freeze", n: 1, to: "target" }, { op: "dmg", n: 2, to: "target" }]);

  for (var id in CARDS) { var c = CARDS[id]; if (!c.text) c.text = ""; }
  // texto automático
  Object.keys(CARDS).forEach(function (id) {
    var c = CARDS[id], parts = [];
    if (c.type === "unit") {
      Object.keys(c.kw).forEach(function (k) { parts.push(KW_NAME[k]); });
      if (c.ingreso) parts.push("Ingreso: " + describe(c.ingreso));
      if (c.ultimo) parts.push("Al morir: " + describe(c.ultimo));
      c.text = parts.join(". ");
    } else if (c.type === "spell") c.text = describe(c.ops);
  });

  function describeMove(m) {
    var parts = [];
    if (m.tgt === "enemy") parts.push(m.reach === "melee" ? "Cuerpo a cuerpo" : "A distancia");
    else if (m.tgt === "ally") parts.push("A un aliado");
    else if (m.tgt === "self") parts.push("A sí mismo");
    parts.push(describe(m.ops));
    return parts.join(" · ");
  }
  var TRIG_TXT = { despliegueAliado: "Cuando desplegás un aliado", trampaPropia: "Cuando se dispara una de tus trampas", inicio: "Al inicio de tu turno", golpeado: "Al recibir daño", ataque: "Al usar su Ataque", uso: "Al usar una habilidad", muerte: "Cuando muere cualquier unidad", muerteAliada: "Cuando cae un aliado", muerteEnemiga: "Cuando cae un enemigo", sobrevive: "Una vez por partida, si fuera a caer" };
  var ST_TXT = { poison: "envenenadas", frozen: "congeladas", burn: "en llamas" }, SC_TXT = { allies: "tus unidades", row: "las unidades de su fila", self: "sí mismo" };
  function describePassive(p) {
    if (!p) return "";
    if (p.stat) {
      var s = p.stat;
      if (s.k === "dr") return "Reduce " + s.n + " el daño que reciben " + SC_TXT[s.scope] + (s.cond === "token" ? " mientras tengas una invocación en mesa" : "") + " (mín. 1)";
      if (s.k === "vs") return "+" + s.n + " de daño a unidades " + ST_TXT[s.st];
      if (s.k === "perTag") return "+" + s.atk + " ATK por cada otro aliado tipo " + s.tag;
      if (s.k === "lowhp") return "Con " + Math.round(s.pct * 100) + "% de vida o menos: +" + s.atk + " ATK";
      if (s.k === "healLow") return "Sus curas a aliados con 35% de vida o menos curan +" + s.n;
    }
    if (p.trig === "sobrevive") return TRIG_TXT.sobrevive + " a 0, queda con 1 de vida y Escudo";
    var pre = TRIG_TXT[p.trig] + (p.filter ? (p.filter.tag ? " tipo " + p.filter.tag : p.filter.token ? " que sea una invocación" : "") : "") + (p.every ? " (cada " + p.every + (p.trig === "inicio" ? " turnos" : " veces") + ")" : "") + ": ";
    var body = p.cycle ? "alterna: " + p.cycle.map(describe).join(" → ") : describe(p.ops);
    return pre + body + (p.max ? " (máx. " + p.max + " por partida)" : "");
  }
  function points(c) {
    if (c.type !== "unit") return null;
    var p = c.atk + c.hp;
    Object.keys(c.kw).forEach(function (k) { p += KW_PTS[k]; });
    if (c.ingreso) p += KW_PTS.ingreso;
    if (c.ultimo) p += KW_PTS.ultimo;
    if (c.kind === "bicho" && c.passive) p += 2;      // la pasiva de un monstruo cuenta como un efecto
    return p;
  }

  // ---------- MAZOS INICIALES (uno por linaje) ----------
  function dk(g, b, s) { var d = []; [g, b, s].forEach(function (grp) { grp.forEach(function (e) { for (var i = 0; i < (e[1] || 1); i++) d.push(e[0]); }); }); return d; }
  var DECKS = {
    ciudad: dk([["guerrero"],["soporte"],["tanque"],["ynara"],["vesper"]],
      [["cm_saqueador",3],["agitador",3],["cm_espectro"],["cm_raptor"],["cm_acechante",2],["cm_sectario"],["lider_turba",2],["cm_campanero"]],
      [["estampida",2],["furia"],["emboscada"],["espinas"],["debilitar"],["rayo"],["bendicion",2],["corazon"],["piedra"]]),
    forja: dk([["eslabon"],["brakk"],["brasa"],["zahra"],["bront"]],
      [["cristal_servo",3],["cristal_volador",2],["cristal_resonante",2],["engendro",2],["ingeniero",2],["mn_devoraluz"],["golem_cristal",2]],
      [["veta",2],["muro_piedra",2],["sobrecarga",2],["egida"],["corazon"],["marchitar"],["silencio"],["barrera"]]),
    bosque: dk([["cazadora"],["maura"],["tibor"],["morwen"],["khepri"]],
      [["duende_bosque",2],["bestia_bosque",3],["cu_sith",2],["lobo_alfa",2],["dama_bosque"],["raiz_madre",2],["ent",2]],
      [["manada"],["rugido",2],["marea"],["banquete"],["bendicion",2],["zarzas"],["rayo"],["piedra"],["corazon"]]),
    laberinto: dk([["musashi"],["ilkan"],["nahir"],["sira"],["axiom"]],
      [["escorpion_gigante",3],["golem_piedra",2],["medusa",2],["druida_arena"],["esfinge"],["cartografo",3],["guardia_laberinto",2]],
      [["espinas",2],["pasillo",2],["espejismo"],["espejo"],["cadenas"],["silencio"],["robovida"],["debilitar"],["egida"]]),
    marea: dk([["mago"],["baltra"],["aelith"],["velmira"],["solciju"]],
      [["lobo_artico",3],["hada_escarcha",2],["golem_hielo",2],["rompehielos",2],["dragoncito_hielo"],["angel_hielo"],["reina_escarcha",2],["tiburon_joven"]],
      [["escarcha",2],["quebrar",2],["ventisca"],["cadenas"],["muro_hielo"],["rayo"],["segunda"],["corazon"],["debilitar"]]),
    infernal: dk([["nigromante"],["segador"],["morveth"],["libertador"],["renko"]],
      [["esqueleto",3],["imp",2],["piromante",2],["demonio_ceniza"],["capataz",2],["rey_esqueleto"],["demonio_menor"],["zombie",2]],
      [["chispa_ignea",2],["combustion",2],["pira"],["osario"],["pared_fuego"],["rayo"],["debilitar"],["corazon"],["egida"]])
  };
  // Mazo "Caos": 5 guardianes al azar de cualquier linaje (cubre a los 41) + mitad del mazo de un linaje.
  function chaosDeck(rng) {
    var gs = Object.keys(CARDS).filter(function (k) { return CARDS[k].kind === "guardian"; });
    var pick = [], pool = gs.slice();
    while (pick.length < 5) pick.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
    var lin = Object.keys(DECKS)[Math.floor(rng() * 6)];
    var rest = DECKS[lin].filter(function (id) { return CARDS[id].kind !== "guardian"; });
    return pick.concat(rest);
  }
  function validateDeck(ids) {
    var err = [], cnt = {}, gcount = 0;
    if (ids.length !== 30) err.push("el mazo debe tener 30 cartas (tiene " + ids.length + ")");
    ids.forEach(function (id) {
      var c = CARDS[id]; if (!c) { err.push("carta desconocida " + id); return; }
      if (c.coin) err.push("la Chispa no entra a mazos");
      cnt[id] = (cnt[id] || 0) + 1;
      if (c.kind === "guardian") gcount++;
    });
    Object.keys(cnt).forEach(function (id) {
      var c = CARDS[id], max = maxCopiesOf(id);
      if (cnt[id] > max) err.push(id + " x" + cnt[id] + " (máx " + max + ")");
    });
    if (gcount > 5) err.push("máximo 5 guardianes por mazo");
    return err;
  }

  // ---------- HABILIDADES DEL INVOCADOR: cada jugador lleva 2 a la partida (las elige antes de jugar) para apoyar a sus guardianes ----------
  // Se usan desde la barra del invocador, cuestan cristales y tienen enfriamiento; no gastan la acción de ninguna unidad.
  var SUMMONER = {
    egida:    { id: "egida", name: "Égida del Invocador", cost: 2, cd: 2, tgt: "allyUnit", ops: [{ op: "give", kw: "shield", to: "target" }], icon: "🛡", about: "Una unidad aliada gana Escudo (absorbe el próximo golpe)." },
    voz:      { id: "voz", name: "Voz de Mando", cost: 1, cd: 1, tgt: "allyUnit", ops: [{ op: "buff", atk: 2, temp: 1, to: "target" }], icon: "📣", about: "Una unidad aliada gana +2 ATK este turno." },
    aliento:  { id: "aliento", name: "Aliento del Invocador", cost: 2, cd: 2, tgt: "allyUnit", ops: [{ op: "heal", n: 5, to: "target" }], icon: "💚", about: "Cura 5 a una unidad aliada." },
    paso:     { id: "paso", name: "Paso Táctico", cost: 1, cd: 1, tgt: "move", ops: [], icon: "↔", about: "Mové una unidad aliada a otra casilla (o intercambiala) sin gastar su movimiento." },
    llamado:  { id: "llamado", name: "Llamado a la Horda", cost: 3, cd: 3, tgt: "none", ops: [{ op: "draw", n: 2 }], icon: "📜", about: "Robás 2 cartas." },
    mal:      { id: "mal", name: "Mal de Ojo", cost: 2, cd: 2, tgt: "enemyUnit", ops: [{ op: "debuff", atk: 2, to: "target" }], icon: "👁", about: "Una unidad enemiga pierde 2 ATK de forma permanente." },
    soplo:    { id: "soplo", name: "Soplo Gélido", cost: 2, cd: 3, tgt: "enemyUnit", ops: [{ op: "freeze", n: 1, to: "target" }], icon: "❄", about: "Congela a una unidad enemiga: no actúa en su próximo turno." },
    segundo:  { id: "segundo", name: "Segundo Aliento", cost: 3, cd: 4, tgt: "allyActed", ops: [{ op: "refresh", to: "target" }], icon: "⟳", about: "Una unidad aliada que ya actuó puede actuar de nuevo este turno." }
  };
  var SUMMONER_IDS = Object.keys(SUMMONER);
  function validLoadout(l) { return Array.isArray(l) && l.length === 2 && l[0] !== l[1] && l.every(function (x) { return !!SUMMONER[x]; }); }
  // vida extra del invocador por rango (solo en partidas contra el Bot, aventura y cooperativo; nunca en 1v1 entre personas)
  function summonerBonus(wins) { return Math.min(12, 2 * Math.floor((wins || 0) / 2)); }


  // ---------- SINERGIAS: monstruos con efectos que reaccionan a otros (ver COMBOS) ----------
  // [id, nombre, linaje, costo, atk, hp, kw, ingreso, ultimo, tags, pasiva, arte, filtro CSS del arte]
  var P = function (name, o) { o.name = name; return o; };
  var SYN = [
    ["lobo_alfa", "Lobo Alfa", "bosque", 3, 3, 3, [], null, null, ["Bestia"], P("Líder de manada", { trig: "despliegueAliado", filter: { tag: "Bestia" }, max: 4, ops: [{ op: "buff", atk: 1, hp: 1, to: "target" }] }), "cu_sith", "hue-rotate(35deg) saturate(1.3)"],
    ["raiz_madre", "Raíz Madre", "bosque", 4, 2, 5, ["taunt"], null, null, ["Planta"], P("Savia ancestral", { trig: "inicio", max: 4, ops: [{ op: "buff", hp: 1, to: "randAlly" }] }), "guardian_ancestral", ""],
    ["imp", "Imp Pirómano", "infernal", 2, 2, 2, [], [{ op: "burn", n: 1, turns: 3, to: "randEnemy" }], null, ["Demonio"], null, "demonio_menor", "hue-rotate(-25deg) saturate(1.6) brightness(1.1)"],
    ["piromante", "Piromante", "infernal", 3, 2, 4, [], null, null, ["Demonio"], P("Maestro del fuego", { stat: { k: "vs", st: "burn", n: 2 } }), "hechicero", ""],
    ["demonio_ceniza", "Demonio de Ceniza", "infernal", 4, 4, 4, [], null, [{ op: "burn", n: 1, turns: 3, to: "enemyAll" }], ["Demonio"], null, "demonio_menor", "grayscale(.85) brightness(.9)"],
    ["capataz", "Capataz de Huesos", "infernal", 3, 2, 3, [], null, null, ["Esqueleto"], P("Hueso sobre hueso", { stat: { k: "perTag", tag: "Esqueleto", atk: 1 } }), "esqueleto_h", "hue-rotate(190deg) saturate(1.4)"],
    ["rey_esqueleto", "Rey Esqueleto", "infernal", 5, 4, 5, ["taunt"], null, null, ["Esqueleto"], P("Rey de los huesos", { trig: "muerteAliada", filter: { tag: "Esqueleto" }, max: 4, ops: [{ op: "buff", atk: 1, to: "self" }] }), "esqueleto_h", "sepia(1) saturate(2.2) brightness(1.1)"],
    ["rompehielos", "Rompehielos", "marea", 3, 3, 3, [], [{ op: "dmg", n: 3, to: "enemyFrozen" }], null, ["Hielo"], null, "golem_hielo", "hue-rotate(-40deg) saturate(1.4)"],
    ["reina_escarcha", "Reina de Escarcha", "marea", 5, 4, 6, [], null, null, ["Hielo"], P("Reina del invierno", { trig: "inicio", every: 2, max: 3, ops: [{ op: "freeze", n: 1, to: "randEnemy" }] }), "angel_hielo", "hue-rotate(45deg) saturate(1.5)"],
    ["agitador", "Agitador", "ciudad", 2, 2, 2, [], null, null, ["Ciudadano"], P("Contagia la turba", { stat: { k: "perTag", tag: "Ciudadano", atk: 1 } }), "cm_saqueador", "hue-rotate(120deg) saturate(1.3)"],
    ["lider_turba", "Líder de la Turba", "ciudad", 4, 4, 4, [], null, null, ["Ciudadano"], P("¡A ellos!", { trig: "despliegueAliado", filter: { tag: "Ciudadano" }, max: 4, ops: [{ op: "give", kw: "rush", to: "target" }] }), "cm_sectario", "hue-rotate(160deg) saturate(1.3)"],
    ["ingeniero", "Ingeniero de Minas", "forja", 3, 2, 4, [], null, null, ["Máquina"], P("Mejora en el sitio", { trig: "despliegueAliado", filter: { token: true }, max: 4, ops: [{ op: "buff", atk: 1, hp: 1, to: "target" }] }), "engendro", "hue-rotate(160deg) saturate(1.5)"],
    ["cristal_resonante", "Cristal Resonante", "forja", 3, 2, 4, [], null, null, ["Cristal"], P("Resonancia", { stat: { k: "perTag", tag: "Cristal", atk: 1 } }), "golem_cristal", "hue-rotate(110deg) saturate(1.5)"],
    ["cartografo", "Cartógrafo de Trampas", "laberinto", 3, 2, 4, [], null, null, ["Explorador"], P("Sabe dónde pisar", { trig: "trampaPropia", max: 3, ops: [{ op: "draw", n: 1 }] }), "druida_arena", "hue-rotate(80deg) saturate(1.3)"],
    ["guardia_laberinto", "Guardia del Laberinto", "laberinto", 4, 2, 5, ["taunt"], null, null, ["Golem"], P("Muros que curan", { trig: "trampaPropia", max: 4, ops: [{ op: "heal", n: 3, to: "self" }] }), "guardian_laberinto", ""]
  ];
  SYN.forEach(function (b) {
    var kw = {}; b[6].forEach(function (x) { kw[x] = 1; });
    var rv = b[3] <= 2 ? "normal" : b[3] === 3 ? "subelite" : "elite";
    CARDS[b[0]] = { id: b[0], type: "unit", kind: "bicho", name: b[1], origin: b[2], cost: b[3], atk: b[4], hp: b[5], kw: kw, ingreso: b[7], ultimo: b[8], tags: b[9], passive: b[10], reach: "melee", moves: [BASIC("melee")], rarity: rv, art: ART_B + b[11] + ".png", artFx: b[12], tier: "Monstruo", syn: 1 };
  });
  S("chispa_ignea", "Chispa Ígnea", "hechizo", 1, "enemyUnit", [{ op: "burn", n: 1, turns: 3, to: "target" }]);
  S("combustion", "Combustión", "hechizo", 2, "enemyUnit", [{ op: "dmg", n: 2, to: "target", ifStatus: { st: "burn", n: 3 } }]);
  S("pira", "Pira Funeraria", "hechizo", 3, "none", [{ op: "dmg", n: 3, to: "enemyBurning", only: "burn" }]);
  S("quebrar", "Quebrar", "hechizo", 2, "enemyUnit", [{ op: "dmg", n: 2, to: "target", ifStatus: { st: "frozen", n: 3 } }]);
  S("ventisca", "Ventisca Menor", "hechizo", 2, "none", [{ op: "freeze", n: 1, to: "randEnemy" }, { op: "freeze", n: 1, to: "randEnemy" }]);
  S("sobrecarga", "Sobrecarga", "hechizo", 2, "enemyUnit", [{ op: "sacrifice" }, { op: "dmg", n: 4, to: "target" }], { req: "token" });
  S("rugido", "Rugido de la Manada", "bonus", 3, "none", [{ op: "buff", atk: 2, temp: 1, to: "allyTag", tag: "Bestia" }, { op: "give", kw: "rush", to: "allyTag", tag: "Bestia" }]);
  S("estampida", "Estampida", "bonus", 3, "none", [{ op: "buff", atk: 2, temp: 1, to: "allyTag", tag: "Ciudadano" }, { op: "give", kw: "rush", to: "allyTag", tag: "Ciudadano" }]);
  S("osario", "Osario", "bonus", 3, "none", [{ op: "summon", id: "esqueleto", n: 2 }]);
  S("veta", "Veta de Cristal", "bonus", 2, "none", [{ op: "summon", id: "cristal_servo", n: 2 }]);
  T("zarzas", "Zarzas Venenosas", 2, "ataque", false, [{ op: "poison", n: 2, turns: 3, to: "target" }]);
  T("pared_fuego", "Pared de Fuego", 2, "ataque", false, [{ op: "burn", n: 1, turns: 3, to: "target" }]);
  T("pasillo", "Pasillo sin Salida", 2, "ataque", false, [{ op: "freeze", n: 1, to: "target" }, { op: "debuff", atk: 1, to: "target" }]);
  T("espejismo", "Espejismo", 3, "ataque", true, []);

  Object.keys(CARDS).forEach(function (id) { var c = CARDS[id]; if (c.type === "spell" && !c.text) c.text = describe(c.ops) + (c.req === "token" ? " (necesita una invocación tuya en mesa)" : ""); });

  // ---------- COMBOS: cartas que se potencian entre sí (el constructor los detecta y sugiere los que faltan) ----------
  var COMBOS = [
    { id: "manada_alfa", name: "Manada Alfa", cards: ["manada", "lobo_alfa"], text: "Manada invoca 2 lobos; Lobo Alfa les da +1/+1 a cada uno (y a toda Bestia que despliegues)." },
    { id: "rugido", name: "Rugido de la Manada", cards: ["rugido", "lobo_alfa", "manada"], text: "Rugido da +2 ATK y Rápido a todas tus Bestias: con una manada en mesa, ataque inmediato." },
    { id: "savia", name: "Bosque que cura", cards: ["raiz_madre", "marea", "banquete"], text: "Raíz Madre sube la vida de tus unidades cada turno y las curas las mantienen vivas." },
    { id: "incendio", name: "Incendio", cards: ["chispa_ignea", "combustion"], text: "Chispa Ígnea quema a un enemigo; Combustión le pega 5 si está en llamas (y el fuego sigue ardiendo)." },
    { id: "pira", name: "Pira", cards: ["imp", "demonio_ceniza", "pira"], text: "Imp y Demonio de Ceniza prenden fuego; Pira Funeraria daña a todo enemigo en llamas." },
    { id: "pirotecnia", name: "Maestro del fuego", cards: ["piromante", "chispa_ignea", "pared_fuego"], text: "Piromante pega +2 a quien arde: Chispa Ígnea y Pared de Fuego le dan blancos." },
    { id: "huesos", name: "Hueso sobre hueso", cards: ["osario", "capataz", "rey_esqueleto"], text: "Osario invoca 2 esqueletos; el Capataz suma ATK por cada uno y el Rey crece cuando cae uno." },
    { id: "quiebre", name: "Quiebre de hielo", cards: ["quebrar", "rompehielos", "escarcha", "ventisca"], text: "Congelá primero (Escarcha, Ventisca Menor, Reina de Escarcha) y después Quebrar o Rompehielos castigan a lo congelado." },
    { id: "invierno", name: "Reina del invierno", cards: ["reina_escarcha", "quebrar", "rompehielos"], text: "La Reina congela cada 2 turnos: siempre hay un blanco para Quebrar y Rompehielos." },
    { id: "turba", name: "Turba", cards: ["agitador", "lider_turba", "estampida"], text: "Agitador suma ATK por cada Ciudadano; Líder de la Turba les da Rápido; Estampida los empuja a todos." },
    { id: "cristal", name: "Veta resonante", cards: ["veta", "cristal_resonante", "cristal_servo"], text: "Veta de Cristal invoca 2 Cristales; Cristal Resonante gana ATK por cada uno." },
    { id: "chatarra", name: "Chatarra explosiva", cards: ["sobrecarga", "muro_piedra", "ingeniero"], text: "Invocaciones baratas (Muro de Piedra, torretas) que el Ingeniero mejora… y Sobrecarga convierte una en 4 de daño." },
    { id: "laberinto", name: "Laberinto cerrado", cards: ["cartografo", "guardia_laberinto", "espinas", "pasillo", "espejismo"], text: "Cada trampa que se dispara hace robar al Cartógrafo y curar al Guardia: poné trampas y dejá que el rival las pise." }
  ];

  // ---------- MAPAS (las arenas de La Horda). Cada fila (frente / fondo) tiene un terreno que afecta a quien la ocupa. ----------
  // Terrenos: burn n = al final de TU turno, 1·n de daño a quien esté ahí (los del linaje local son inmunes) · heal n = cura n
  //           cover n = recibe n menos de daño (mín. 1) · amp n = sus movimientos hacen +n · slow n = sus habilidades cuestan +n cristal
  //           dark = no se le puede apuntar a distancia · frost n = sus movimientos hacen -n (mín. 1)
  var TERRAIN_TXT = { burn: "Brasas", heal: "Claro curativo", cover: "Parapeto", amp: "Fragua", slow: "Terreno pesado", dark: "Oscuridad", frost: "Escarcha" };
  var MAPS = {
    ciudad:    { id: "ciudad",    name: "Ciudad Maldita",   arena: "ciudad",    home: "ciudad",    front: { t: "cover", n: 1 }, back: null, cdPlus: 0, desc: "Barricadas: la primera fila recibe 1 de daño menos." },
    minas:     { id: "minas",     name: "Minas Profundas",  arena: "minas",     home: "forja",     front: { t: "slow", n: 1 },  back: { t: "dark", n: 0 }, cdPlus: 0, desc: "La luz es territorio: la fila de atrás no puede ser apuntada a distancia; la de adelante paga +1 cristal por habilidad." },
    infernal:  { id: "infernal",  name: "Arena Infernal",   arena: "infernal",  home: "infernal",  front: { t: "burn", n: 1 },  back: { t: "amp", n: 1 }, cdPlus: 0, desc: "Ignición: la primera fila arde (1 al final de tu turno); la de atrás hace +1 de daño. Los del linaje Infernal son inmunes." },
    bosque:    { id: "bosque",    name: "Ruinas del Bosque", arena: "bosque",   home: "bosque",    front: null, back: { t: "heal", n: 1 }, cdPlus: 0, desc: "Regeneración: la fila de atrás se cura 1 al final de tu turno." },
    laberinto: { id: "laberinto", name: "Laberinto",        arena: "laberinto", home: "laberinto", front: { t: "dark", n: 0 }, back: null, cdPlus: 0, desc: "Muros: la primera fila no puede ser apuntada a distancia (solo cuerpo a cuerpo)." },
    hielo:     { id: "hielo",     name: "Arena Gélida",     arena: "hielo",     home: "marea",     front: { t: "frost", n: 1 }, back: null, cdPlus: 1, desc: "Novas gélidas: todos los enfriamientos duran 1 turno más y la primera fila hace 1 de daño menos." }
  };


  // ================= RAREZA, PAQUETES Y POLVO =================
  // Decisión del dueño (v0.7): hay paquetes premium ALEATORIOS por tema (p. ej. Paquete de Invierno). Es una caja sorpresa de pago:
  // por eso este sistema trae probabilidades visibles, garantías, protección de repetidas (polvo), fabricación de cualquier carta y un
  // interruptor por región. La rareza NO es poder: el poder sale del costo (gate de puntos), no de la rareza.
  var RARITY = {
    1: { id: "comun", name: "Común", color: "#9aa0a6", dis: 3, craft: 40 },
    2: { id: "poco", name: "Poco común", color: "#6fcf6f", dis: 10, craft: 100 },
    3: { id: "rara", name: "Rara", color: "#5aa9ff", dis: 40, craft: 400 },
    4: { id: "epica", name: "Épica", color: "#b57cff", dis: 100, craft: 1000 },
    5: { id: "legendaria", name: "Legendaria", color: "#ffc94a", dis: 200, craft: 2000 }
  };
  function rarityOf(c) {
    if (c.type === "unit" && c.kind === "guardian") return c.rarity === "ascension" ? 5 : (c.cost <= 4 ? 3 : 4);
    if (c.type === "unit") { var r = c.cost <= 3 ? 1 : c.cost === 4 ? 2 : 3; if ((c.passive || c.ingreso || c.ultimo) && c.cost >= 2) r = Math.min(4, r + 1); return r; }
    if (c.type === "trap") return c.cost >= 3 ? 3 : 2;
    return c.cost <= 2 ? 1 : c.cost === 3 ? 2 : 3;
  }
  Object.keys(CARDS).forEach(function (id) { var c = CARDS[id]; if (!c.coin && !c.token) c.rar = rarityOf(c); });

  // Paquetes. odds = probabilidad de cada rareza POR CARTA (suman 100). minRar = garantía por paquete. pity = cada cuántos paquetes
  // se garantiza al menos una Épica y una Legendaria (contador por grupo, se reinicia al obtenerla).
  var PACKS = {
    estandar: { id: "estandar", name: "Sobre estándar", icon: "📦", currency: "oro", price: 100, group: "std", cards: 5, odds: [62, 25, 9.5, 3.1, 0.4], minRar: 2, pityEpic: 25, pityLeg: 120, theme: null, desc: "Se compra con oro ganado jugando. Cartas de todos los linajes." },
    dorado: { id: "dorado", name: "Paquete Dorado", icon: "👑", currency: "brasas", price: 450, group: "gold", cards: 5, odds: [0, 0, 70, 24, 6], minRar: 3, pityEpic: 3, pityLeg: 15, theme: null, desc: "Todas las cartas son Raras o mejores. Una Épica o mejor garantizada cada 3 paquetes." }
  };
  var THEMED = [
    ["tema_marea", "Paquete de Invierno", "❄", "marea", ["Hielo"], "Más chances de las mejores cartas invernales: Escarcha, Rompehielos, Reina de Escarcha, Quebrar y los guardianes de la Marea."],
    ["tema_bosque", "Paquete del Bosque", "🌲", "bosque", ["Bestia", "Planta"], "Más chances de Lobo Alfa, Manada, Raíz Madre y los guardianes del Bosque."],
    ["tema_infernal", "Paquete de Fuego y Huesos", "🔥", "infernal", ["Demonio", "Esqueleto"], "Más chances de Combustión, Pira, Rey Esqueleto y los guardianes Infernales."],
    ["tema_ciudad", "Paquete de la Ciudad", "🏙", "ciudad", ["Ciudadano"], "Más chances de Líder de la Turba, Estampida y los guardianes de la Ciudad."],
    ["tema_forja", "Paquete de la Forja", "⚒", "forja", ["Cristal", "Máquina"], "Más chances de Cristal Resonante, Sobrecarga y los guardianes de la Forja."],
    ["tema_laberinto", "Paquete del Laberinto", "🪞", "laberinto", ["Explorador", "Golem"], "Más chances de trampas, Cartógrafo y los guardianes del Laberinto."],
    ["tema_verano", "Paquete de Verano", "☀", ["infernal", "bosque"], ["Planta", "Demonio"], "Sol, calor y cosecha: más chances de Rayo del Alba, Llamarada, Fuego Directo, Marea Curativa, Bendición del Alba, Raíz Madre y los guardianes del Bosque y del Infierno.", ["rayo", "llamarada", "fuego", "marea", "bendicion", "chispa_ignea", "combustion", "banquete", "corazon"]],
    ["tema_otono", "Paquete de Otoño", "🍂", ["laberinto", "ciudad"], ["Esqueleto", "Golem"], "Hojas secas y cosecha oscura: más chances de Veneno de Cripta, Podredumbre, Marchitar, Osario, Pira Funeraria y los guardianes del Laberinto y de la Ciudad.", ["veneno", "podredumbre", "marchitar", "osario", "pira"]],
    ["tema_primavera", "Paquete de Primavera", "🌸", ["bosque", "forja"], ["Bestia", "Cristal"], "Todo florece: más chances de Manada, Rugido de la Manada, Banquete Fúngico, Inspiración, Veta de Cristal y los guardianes del Bosque y de la Forja.", ["manada", "rugido", "banquete", "inspiracion", "veta", "bendicion"]]
  ];
  THEMED.forEach(function (x) {
    PACKS[x[0]] = { id: x[0], name: x[1], icon: x[2], currency: "brasas", price: 150, group: "prem", cards: 5, odds: [46, 30, 15, 7.2, 1.8], minRar: 3, pityEpic: 10, pityLeg: 40,
      theme: { linaje: x[3], tags: x[4], ids: x[6] || [], onTheme: [0.45, 0.5, 0.7, 0.8, 0.9] }, desc: x[5] };
  });
  function collectible() { return Object.keys(CARDS).filter(function (id) { var c = CARDS[id]; return !c.coin && !c.token && c.rar; }); }
  function isFeatured(c, th) { return (th.linaje && [].concat(th.linaje).indexOf(c.origin) >= 0) || (th.ids || []).indexOf(c.id) >= 0 || (c.tags || []).some(function (tg) { return th.tags.indexOf(tg) >= 0; }); }
  function pickRarity(odds, rnd) { var x = rnd() * odds.reduce(function (a, b) { return a + b; }, 0), acc = 0; for (var i = 0; i < odds.length; i++) { acc += odds[i]; if (x < acc) return i + 1; } return odds.length; }
  // Abre un paquete. st.pity = { grupo: { epic, leg } } (se actualiza). Devuelve { cards, forced } y no toca la colección.
  function openPack(packId, st, rnd) {
    var P = PACKS[packId], pool = collectible(), byR = {}, th = P.theme;
    pool.forEach(function (id) { (byR[CARDS[id].rar] = byR[CARDS[id].rar] || []).push(id); });
    st.pity = st.pity || {}; var pc = st.pity[P.group] = st.pity[P.group] || { epic: 0, leg: 0 };
    var rars = []; for (var i = 0; i < P.cards; i++) rars.push(pickRarity(P.odds, rnd));
    var forced = [];
    if (Math.max.apply(null, rars) < P.minRar) { rars[rars.indexOf(Math.min.apply(null, rars))] = P.minRar; forced.push("garantía de " + RARITY[P.minRar].name); }   // al menos UNA carta de esa rareza o mejor
    if (pc.leg + 1 >= P.pityLeg && Math.max.apply(null, rars) < 5) { rars[rars.indexOf(Math.min.apply(null, rars))] = 5; forced.push("Legendaria garantizada"); }
    else if (pc.epic + 1 >= P.pityEpic && Math.max.apply(null, rars) < 4) { rars[rars.indexOf(Math.min.apply(null, rars))] = 4; forced.push("Épica garantizada"); }
    var out = [];
    rars.forEach(function (r) {
      var all = byR[r] || [], pick = all;
      if (th && rnd() < th.onTheme[r - 1]) { var f = all.filter(function (id) { return isFeatured(CARDS[id], th); }); if (f.length) pick = f; }
      out.push(pick[Math.floor(rnd() * pick.length)]);
    });
    var mx = Math.max.apply(null, rars);
    pc.epic = mx >= 4 ? 0 : pc.epic + 1; pc.leg = mx >= 5 ? 0 : pc.leg + 1;
    return { cards: out, forced: forced };
  }
  function maxCopiesOf(id) { var c = CARDS[id]; return c.kind === "guardian" || c.rar === 5 ? 1 : c.kind === "bicho" ? (c.cost <= 3 ? 3 : 2) : 2; }
  // Reparte cartas a una colección; las que superan el máximo se convierten en polvo. Devuelve { dust, dups }.
  function grantCards(owned, ids) { var dust = 0, dups = []; ids.forEach(function (id) { if ((owned[id] || 0) < maxCopiesOf(id)) owned[id] = (owned[id] || 0) + 1; else { dust += RARITY[CARDS[id].rar].dis; dups.push(id); } }); return { dust: dust, dups: dups }; }
  // Probabilidad por carta de una rareza dentro de un paquete (para mostrar "chances de cada carta destacada")
  function packTable(packId) { var P = PACKS[packId], tot = P.odds.reduce(function (a, b) { return a + b; }, 0); return P.odds.map(function (o, i) { return { rar: i + 1, name: RARITY[i + 1].name, pct: Math.round(1000 * o / tot) / 10 }; }); }
  // Chances de que UNA carta concreta de la rareza r aparezca en un slot, con y sin el tema (para el cartel de probabilidades)
  function featuredChance(packId, rar) { var P = PACKS[packId]; if (!P.theme) return null; var pool = collectible().filter(function (id) { return CARDS[id].rar === rar; }), f = pool.filter(function (id) { return isFeatured(CARDS[id], P.theme); }); if (!f.length) return null; var on = P.theme.onTheme[rar - 1], inTheme = on / f.length + (1 - on) / pool.length, base = 1 / pool.length; return { n: f.length, inTheme: inTheme, base: base, boost: inTheme / base }; }

  // arte aprobado por tools/art-intake.py (reemplaza al sprite original y al filtro de color)
  var AO = root.HORDA_ART || (typeof require !== "undefined" ? require("./art-overrides.js") : {});
  Object.keys(AO).forEach(function (id) { if (CARDS[id]) { CARDS[id].art = AO[id].art; CARDS[id].artFx = ""; if (AO[id].illus) CARDS[id].illus = true; } });

  root.HORDA_DATA = { RARITY: RARITY, PACKS: PACKS, openPack: openPack, grantCards: grantCards, maxCopiesOf: maxCopiesOf, packTable: packTable, featuredChance: featuredChance, isFeatured: isFeatured, collectible: collectible, COMBOS: COMBOS, SUMMONER: SUMMONER, SUMMONER_IDS: SUMMONER_IDS, validLoadout: validLoadout, summonerBonus: summonerBonus, describePassive: describePassive, CHAPTERS: CHAPTERS, NODES: NODES, advStarter: advStarter, enemyDeck: enemyDeck, encounter: encounter, describeMove: describeMove, MAPS: MAPS, TERRAIN_TXT: TERRAIN_TXT,  CARDS: CARDS, LINAJES: LINAJES, DECKS: DECKS, KW_NAME: KW_NAME, KW_PTS: KW_PTS, points: points,
    guardianPoints: guardianPoints, chaosDeck: chaosDeck, validateDeck: validateDeck, describe: describe };
  if (typeof module !== "undefined") module.exports = root.HORDA_DATA;
})(typeof window !== "undefined" ? window : globalThis);
