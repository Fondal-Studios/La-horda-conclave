"use strict";
/* tools/basics-reviewed.js — ATAQUE BÁSICO distinto de cada guardián (gratis, sin enfriamiento). Los nombres son los reales del ARPG
   (identity.basic o el arma); el efecto es propuesta mía. Alcance (cuerpo a cuerpo / distancia) sale del alcance real del ataque en el ARPG (>= 200 u = distancia).
   Formas: hit (un objetivo) · row (toda la fila del objetivo) · col (objetivo + quien está detrás) · dual (dos golpes) · psn (golpe + veneno) · heal (golpe + cura al equipo). */
var D = function (m, to) { return { op: "dmg", mult: m, to: to || "target" }; };
module.exports = {
  tanque: { ops: [D(0.6, "targetRow")] }, guerrero: { ops: [D(1.2)] }, mago: { ops: [D(1.0)] },
  soporte: { ops: [D(0.8), { op: "heal", n: 1, to: "allyAll" }] }, segador: { ops: [D(0.7, "targetRow")] },
  axiom: { ops: [D(0.7), { op: "poison", n: 1, turns: 2, to: "target" }] }, profeta: { ops: [D(1.0)] },
  musashi: { ops: [D(0.7), D(0.7)] }, cazadora: { ops: [D(0.8, "targetCol")] }, nigromante: { ops: [D(1.1)] },
  libertador: { ops: [D(1.3)] }, ilkan: { ops: [D(0.6), D(0.6)] }, vesper: { ops: [D(1.0)] }, nahir: { ops: [D(0.6, "targetRow")] },
  baltra: { ops: [D(1.1)] }, maura: { ops: [D(1.0)] }, dariel: { ops: [D(0.5, "targetRow")] }, orsa: { ops: [D(0.8, "targetCol")] },
  tibor: { ops: [D(0.6), { op: "poison", n: 1, turns: 2, to: "target" }] }, zahra: { ops: [D(0.6, "targetRow")] }, renko: { ops: [D(1.1)] },
  sira: { ops: [D(0.7, "targetCol")] }, aurelia: { ops: [D(1.0)] }, khepri: { ops: [D(0.6), D(0.6)] }, velmira: { ops: [D(0.9)] },
  vhal: { ops: [D(0.8, "targetCol")] }, bront: { ops: [D(1.1)] }, oriel: { ops: [D(1.0)] }, saelis: { ops: [D(0.5, "targetRow")] },
  solciju: { name: "Copa de vino", ops: [D(0.6), { op: "poison", n: 1, turns: 2, to: "target" }] }, veyra: { name: "Navaja escarlata", ops: [D(1.2)] },
  brakk: { name: "Martillo de obra", ops: [D(1.0)] }, morveth: { name: "Esporas", ops: [D(0.6), { op: "poison", n: 1, turns: 2, to: "target" }] },
  aelith: { name: "Péndulo", ops: [D(0.9)] }, brasa: { ops: [D(1.0)] }, eslabon: { ops: [D(1.1)] }, farolero: { ops: [D(0.5, "targetRow")] },
  iria: { ops: [D(0.8, "targetCol")] }, morwen: { ops: [D(0.6), { op: "poison", n: 1, turns: 2, to: "target" }] }, myla: { ops: [D(0.5, "targetRow")] },
  ynara: { ops: [D(0.7), { op: "heal", n: 1, to: "allyAll" }] }
};
