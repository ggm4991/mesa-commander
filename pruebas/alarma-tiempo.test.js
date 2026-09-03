// Estados del reloj: normal, aviso en el último minuto, pasado de tiempo,
// alarma una sola vez por turno y silenciable.
const fs = require('fs');
const js = fs.readFileSync(require('path').join(__dirname,'..','app.html'),'utf8').split('<script>')[1].split('</'+'script>')[0];

const nodos = {};
const hacer = id => (nodos[id] = {id, textContent:"", innerHTML:"", style:{}, title:"", _cls:new Set(),
  classList:{toggle(n,v){v?nodos[id]._cls.add(n):nodos[id]._cls.delete(n)},
             add(n){nodos[id]._cls.add(n)}, remove(n){nodos[id]._cls.delete(n)},
             contains(n){return nodos[id]._cls.has(n)}},
  closest:()=>nodos.pass, querySelector:()=>hacerGen(), addEventListener(){}});
const hacerGen = () => ({style:{}, dataset:{}, classList:{toggle(){},add(){},remove(){}},
  addEventListener(){}, querySelector:()=>hacerGen(), querySelectorAll:()=>[],
  getBoundingClientRect:()=>({left:0,top:0,width:0,height:0}), closest:()=>hacerGen(),
  set innerHTML(v){}, get innerHTML(){return ""}, textContent:""});
["quien","crono","estado","pass","btn-pausa"].forEach(hacer);
global.document = {querySelector:sel=>nodos[sel.slice(1)] || hacerGen(), querySelectorAll:()=>[],
  addEventListener(){}, removeEventListener(){}};

let pitidos = 0;
global.window = {storage:{get:async()=>{throw 0}, set:async()=>{}},
  AudioContext: function(){ return {state:"running", currentTime:0, destination:{},
    resume(){}, createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}}, connect(){}}),
    createOscillator:()=>{ pitidos++; return {type:"", frequency:{}, connect(){}, start(){}, stop(){}}; } }; }};
global.navigator = {};
global.addEventListener=()=>{}; global.setInterval=()=>0; global.clearInterval=()=>{}; global.scrollTo=()=>{};
global.structuredClone = o => JSON.parse(JSON.stringify(o));

const api = new Function('return (function(){'+js+
  '\n; return {pintarCrono, pasarTurno, CONFIG, setSonido(v){CONFIG.sonido=v}, setJuego(j){JUEGO=j}, get J(){return JUEGO}}; })()')();

const jug = n => ({n, c:"X", c2:"", col:"R", vida:40, dmg:{}, ven:0, exp:0, ene:0, tax:0, tes:0, tor:0,
  mana:{W:0,U:0,B:0,R:0,G:0,C:0}, bendicion:false, rehacer:0, fuera:0, tTotal:0, tMax:0, out:false});

setTimeout(()=>{
  const real = Date.now; let t = 1e12; Date.now = () => t;
  let fallos = 0;
  const check = (txt, ok) => { console.log((ok?"ok    ":"FALLO ")+txt); if(!ok) fallos++; };
  const cls = n => nodos.pass._cls.has(n);

  api.setJuego({id:"x", inicio:new Date(t).toISOString(), cfg:{vida:40, limite:300},
    j:[jug("Ana"), jug("Beto")], turno:0, tIni:t, acum:0, pausado:false,
    log:[], undo:[], monarca:null, iniciativa:null, dia:null});

  t += 60000; api.pintarCrono();          // 1:00 de 5:00
  check(`a 1:00 el reloj marca ${nodos.crono.textContent} sin avisos`,
        nodos.crono.textContent === "1:00" && !cls("aviso") && !cls("over"));
  check(`la segunda línea recuerda el límite: "${nodos.estado.textContent}"`,
        nodos.estado.textContent === "de 5:00");

  t += 180000; api.pintarCrono();         // 4:00, quedan 60 s justos
  check(`al quedar un minuto se pone en rojo ("${nodos.estado.textContent}")`,
        cls("aviso") && !cls("over") && nodos.estado.textContent === "quedan 1:00");

  t += 30000; api.pintarCrono();          // 4:30
  check("sigue en aviso a los 30 s restantes", cls("aviso") && pitidos === 0);

  t += 45000; api.pintarCrono();          // 5:15, pasado
  check(`al pasarse suena la alarma y avisa ("${nodos.estado.textContent}")`,
        cls("over") && !cls("aviso") && pitidos === 3 && nodos.estado.textContent === "se pasó 0:15");

  t += 5000; api.pintarCrono(); api.pintarCrono();
  check("la alarma no se repite en el mismo turno", pitidos === 3);

  api.pasarTurno();
  t += 310000; api.pintarCrono();         // el siguiente jugador también se pasa
  check("vuelve a sonar en el turno siguiente", pitidos === 6);
  check("y le cuenta la pasada de tiempo", api.J.j[1].fuera === 0 && api.J.j[0].fuera === 1);

  api.setSonido(false);
  api.pasarTurno(); t += 310000; api.pintarCrono();
  check("silenciada no suena", pitidos === 6 && cls("over"));

  Date.now = real;
  console.log(fallos ? `\n${fallos} fallos` : "\ntodo correcto");
}, 60);
