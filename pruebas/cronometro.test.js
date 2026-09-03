// Comprueba que una pausa no parte el turno: 3 s + pausa + 4 s = un turno de 7 s.
const fs = require('fs');
const js = fs.readFileSync(require('path').join(__dirname,'..','app.html'),'utf8').split('<script>')[1].split('</'+'script>')[0];
const generico = () => ({style:{}, dataset:{}, classList:{toggle(){},add(){},remove(){}},
  addEventListener(){}, querySelector:()=>generico(), querySelectorAll:()=>[],
  getBoundingClientRect:()=>({left:0,top:0,width:0,height:0}), closest:()=>generico(),
  set innerHTML(v){}, get innerHTML(){return ""}, textContent:"", focus(){}, select(){}});
global.document = {querySelector:()=>generico(), querySelectorAll:()=>[], addEventListener(){}, removeEventListener(){}};
global.window = {storage:{get:async()=>{throw 0}, set:async()=>{}}};
global.addEventListener=()=>{}; global.setInterval=()=>0; global.clearInterval=()=>{}; global.scrollTo=()=>{};
global.structuredClone = o => JSON.parse(JSON.stringify(o));

const api = new Function('return (function(){'+js+
  '\n; return {alternarPausa, pasarTurno, transcurrido, setJuego(j){JUEGO=j}, get J(){return JUEGO}}; })()')();

setTimeout(()=>{
  const ahora = Date.now();
  const real = Date.now;
  let t = ahora;
  Date.now = () => t;
  api.setJuego({id:"x", inicio:new Date(ahora).toISOString(), cfg:{vida:40, limite:300},
    j:[{n:"A",c:"",col:"",vida:40,dmg:{},ven:0,exp:0,ene:0,tax:0,tes:0,tor:0,mana:{W:0,U:0,B:0,R:0,G:0,C:0},bendicion:false,rehacer:0,fuera:0,tTotal:0,tMax:0,out:false},
       {n:"B",c:"",col:"",vida:40,dmg:{},ven:0,exp:0,ene:0,tax:0,tes:0,tor:0,mana:{W:0,U:0,B:0,R:0,G:0,C:0},bendicion:false,rehacer:0,fuera:0,tTotal:0,tMax:0,out:false}],
    turno:0, tIni:t, acum:0, pausado:false, log:[], undo:[], monarca:null, iniciativa:null, dia:null});

  t += 3000;  api.alternarPausa();              // pausa a los 3 s
  console.log("en pausa marca:", api.transcurrido().toFixed(1), "s");
  t += 60000; // un minuto de charla, no debe contar
  console.log("tras 60 s parado:", api.transcurrido().toFixed(1), "s");
  api.alternarPausa();                          // reanuda
  t += 4000;  api.pasarTurno();                 // 4 s más y pasa turno

  const A = api.J.j[0];
  Date.now = real;
  const ok = Math.abs(A.tMax - 7) < .05 && Math.abs(A.tTotal - 7) < .05;
  console.log(`turno más largo de A: ${A.tMax.toFixed(1)} s (esperado 7.0) ${ok ? "ok" : "FALLO"}`);
  console.log("turno actual:", api.J.j[api.J.turno].n, "| acumulado reiniciado:", api.J.acum);
}, 60);
