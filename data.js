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
  var TO = { targetRow: "toda la fila del objetivo", targetCol: "el objetivo y quien está detrás", target: "el objetivo", self: "este guardián", allyAll: "tus unidades", enemyAll: "las unidades enemigas",
    randEnemy: "una unidad enemiga al azar", randAlly: "una unidad aliada al azar", enemyFace: "el Santuario enemigo",
    allyFace: "tu Santuario", enemyEverything: "todo el bando enemigo" };

  function describe(ops) {
    return ops.map(function (o) {
      var to = TO[o.to] || "";
      switch (o.op) {
        case "dmg": return o.mult !== undefined ? "Daña ×" + o.mult + " ATK a " + to : "Inflige " + o.n + " a " + to;
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
    ciudad:    [{ op: "draw", n: 1 }],
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
  var TRIG_TXT = { inicio: "Al inicio de tu turno", golpeado: "Al recibir daño", ataque: "Al usar su Ataque", uso: "Al usar una habilidad", muerte: "Cuando muere cualquier unidad", muerteAliada: "Cuando cae un aliado", muerteEnemiga: "Cuando cae un enemigo", sobrevive: "Una vez por partida, si fuera a caer" };
  var ST_TXT = { poison: "envenenadas", frozen: "congeladas" }, SC_TXT = { allies: "tus unidades", row: "las unidades de su fila", self: "sí mismo" };
  function describePassive(p) {
    if (!p) return "";
    if (p.stat) {
      var s = p.stat;
      if (s.k === "dr") return "Reduce " + s.n + " el daño que reciben " + SC_TXT[s.scope] + (s.cond === "token" ? " mientras tengas una invocación en mesa" : "") + " (mín. 1)";
      if (s.k === "vs") return "+" + s.n + " de daño a unidades " + ST_TXT[s.st];
      if (s.k === "lowhp") return "Con " + Math.round(s.pct * 100) + "% de vida o menos: +" + s.atk + " ATK";
      if (s.k === "healLow") return "Sus curas a aliados con 35% de vida o menos curan +" + s.n;
    }
    if (p.trig === "sobrevive") return TRIG_TXT.sobrevive + " a 0, queda con 1 de vida y Escudo";
    var pre = TRIG_TXT[p.trig] + (p.every ? " (cada " + p.every + (p.trig === "inicio" ? " turnos" : " veces") + ")" : "") + ": ";
    var body = p.cycle ? "alterna: " + p.cycle.map(describe).join(" → ") : describe(p.ops);
    return pre + body + (p.max ? " (máx. " + p.max + " por partida)" : "");
  }
  function points(c) {
    if (c.type !== "unit") return null;
    var p = c.atk + c.hp;
    Object.keys(c.kw).forEach(function (k) { p += KW_PTS[k]; });
    if (c.ingreso) p += KW_PTS.ingreso;
    if (c.ultimo) p += KW_PTS.ultimo;
    return p;
  }

  // ---------- MAZOS INICIALES (uno por linaje) ----------
  function dk(g, b, s) { var d = []; [g, b, s].forEach(function (grp) { grp.forEach(function (e) { for (var i = 0; i < (e[1] || 1); i++) d.push(e[0]); }); }); return d; }
  var DECKS = {
    ciudad: dk([["guerrero"],["soporte"],["tanque"],["myla"],["vesper"]],
      [["cm_saqueador",2],["cm_perro",2],["cm_planidera",2],["cm_raptor",2],["cm_acechante",2],["cm_sectario",2],["cm_campanero"],["cm_espectro"]],
      [["rayo",2],["debilitar",2],["furia"],["corazon"],["piedra",2],["banquete"],["veneno"],["bendicion"]]),
    forja: dk([["eslabon"],["brakk"],["brasa"],["zahra"],["bront"]],
      [["cristal_servo",3],["engendro",3],["cristal_volador",3],["mn_devoraluz",3],["golem_cristal",2]],
      [["egida",2],["corazon"],["marchitar"],["podredumbre"],["silencio"],["cadenas"],["llamarada"],["piedra"],["bendicion"],["rayo"]]),
    bosque: dk([["cazadora"],["maura"],["tibor"],["morwen"],["khepri"]],
      [["duende_bosque",3],["bestia_bosque",3],["cu_sith",3],["dama_bosque",2],["ent",2]],
      [["bendicion",2],["banquete",2],["rayo"],["corazon"],["egida"],["piedra",2],["veneno"],["debilitar"],["furia"]]),
    laberinto: dk([["musashi"],["ilkan"],["nahir"],["sira"],["axiom"]],
      [["escorpion_gigante",3],["golem_piedra",3],["medusa",3],["druida_arena",2],["esfinge",2]],
      [["cadenas",2],["silencio"],["escarcha"],["veneno"],["rayo"],["debilitar"],["marchitar"],["sello"],["corazon"],["egida"],["banquete"]]),
    marea: dk([["mago"],["baltra"],["aelith"],["velmira"],["solciju"]],
      [["lobo_artico",3],["hada_escarcha",2],["tiburon_joven",2],["golem_hielo",2],["dragoncito_hielo",2],["angel_hielo",2],["dragon_hielo"]],
      [["escarcha",2],["cadenas"],["podredumbre"],["veneno"],["rayo"],["llamarada"],["corazon"],["debilitar"],["bendicion"],["piedra"]]),
    infernal: dk([["nigromante"],["segador"],["morveth"],["libertador"],["renko"]],
      [["esqueleto",3],["zombie",3],["esqueleto_h",2],["demonio_menor",2],["demonio_mago",2],["golem",2]],
      [["piedra",2],["cadenas"],["rayo"],["veneno"],["egida"],["sello"],["furia"],["debilitar"],["banquete"],["corazon"]])
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
      var c = CARDS[id], max = c.kind === "guardian" ? 1 : c.kind === "bicho" ? (c.cost <= 3 ? 3 : 2) : 2;
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

  root.HORDA_DATA = { SUMMONER: SUMMONER, SUMMONER_IDS: SUMMONER_IDS, validLoadout: validLoadout, summonerBonus: summonerBonus, describePassive: describePassive, CHAPTERS: CHAPTERS, NODES: NODES, advStarter: advStarter, enemyDeck: enemyDeck, encounter: encounter, describeMove: describeMove, MAPS: MAPS, TERRAIN_TXT: TERRAIN_TXT,  CARDS: CARDS, LINAJES: LINAJES, DECKS: DECKS, KW_NAME: KW_NAME, KW_PTS: KW_PTS, points: points,
    guardianPoints: guardianPoints, chaosDeck: chaosDeck, validateDeck: validateDeck, describe: describe };
  if (typeof module !== "undefined") module.exports = root.HORDA_DATA;
})(typeof window !== "undefined" ? window : globalThis);
