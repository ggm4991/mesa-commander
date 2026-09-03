// Turno inicial (sorteado o por toque) y desplegable de mazos con buscador.
const fs = require('fs');
const js = fs.readFileSync(require('path').join(__dirname,'..','app.html'),'utf8').split('<script>')[1].split('</'+'script>')[0];
const nodos = {};
const gen = () => ({style:{}, dataset:{}, classList:{toggle(){},add(){},remove(){}}, addEventListener(){},
  querySelector:()=>gen(), querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:0,height:0}),
  closest:()=>gen(), set innerHTML(v){}, get innerHTML(){return ""}, textContent:"", value:"", focus(){}, select(){}});
["quien","crono","estado"].forEach(id=> nodos[id] = {...gen(), id, textContent:"", closest:()=>nodos.pass});
nodos.pass = {...gen(), _cls:new Set(),
  classList:{toggle(n,v){v?nodos.pass._cls.add(n):nodos.pass._cls.delete(n)},
             add(n){nodos.pass._cls.add(n)}, remove(...n){n.forEach(x=>nodos.pass._cls.delete(x))}}};
global.document = {querySelector:sel=>nodos[sel.slice(1)]||gen(), querySelectorAll:()=>[],
  addEventListener(){}, removeEventListener(){}, createElement:()=>gen(),
  body:{appendChild(){},classList:{add(){},remove(){}}}, elementFromPoint:()=>null};
global.window = {storage:{get:async()=>{throw 0}, set:async()=>{}}};
global.addEventListener=()=>{}; global.setInterval=()=>0; global.clearInterval=()=>{}; global.scrollTo=()=>{};
global.structuredClone = o => JSON.parse(JSON.stringify(o));

const api = new Function('return (function(){'+js+`
; return {desplegable, elegirInicio, pintarCrono, pasarTurno, empezarPartida, dosComandantes,
   set MESA_(v){MESA=v}, set INICIA_(v){INICIA=v}, get J(){return JUEGO}, setJuego(j){JUEGO=j}}; })()`)();

const asiento = n => ({nombre:n, comandante:"C", comandante2:"", colores:"R"});

setTimeout(async ()=>{
  let fallos = 0;
  const check = (t, ok) => { console.log((ok?"ok    ":"FALLO ")+t); if(!ok) fallos++; };

  // --- sorteo previo: la partida arranca con ese jugador ---
  api.MESA_ = ["Ana","Beto","Cris","Dora"].map(asiento);
  api.INICIA_ = 2;
  await api.empezarPartida();
  check(`la partida empieza con el sorteado (${api.J.j[api.J.turno].n})`, api.J.turno === 2);
  check("y queda anotado en el historial", api.J.log.some(e=>/Empieza Cris/.test(e.txt)));

  // --- sin sorteo: espera a que alguien toque ---
  api.MESA_ = ["Ana","Beto","Cris","Dora"].map(asiento);
  api.INICIA_ = null;
  await api.empezarPartida();
  check("sin sorteo la partida queda esperando", api.J.turno === null);
  api.pintarCrono();
  check(`el reloj pregunta quién empieza ("${nodos.quien.textContent}" / "${nodos.estado.textContent}")`,
        nodos.quien.textContent === "¿Quién empieza?" && nodos.estado.textContent === "toca tu asiento");
  check("y no corre el tiempo", nodos.crono.textContent === "");

  api.pasarTurno();
  check("pasar turno antes de empezar no hace nada", api.J.turno === null);

  api.elegirInicio(1);
  check(`el primero que toca su asiento empieza (${api.J.j[api.J.turno].n})`, api.J.turno === 1);
  check("queda anotado", api.J.log.some(e=>/Empieza Beto/.test(e.txt)));
  const antes = api.J.turno;
  api.elegirInicio(3);
  check("y ya no se lo puede robar otro", api.J.turno === antes);
  api.pasarTurno();
  check(`ahora sí pasa el turno (${api.J.j[api.J.turno].n})`, api.J.turno === 2);

  // --- desplegable con buscador ---
  const html = api.desplegable({id:"p1", titulo:"Elegir otro de sus 3 mazos", marcador:"Buscar",
    opciones:[
      {valor:"p1::m1", titulo:"Krenko, Mob Boss", buscar:"Krenko, Mob Boss Iván", marca:"último"},
      {valor:"p1::m2", titulo:"Meren of Clan Nel Toth", buscar:"Meren of Clan Nel Toth Iván"},
      {valor:"p1::m3", titulo:"Thrasios + Kydele", buscar:"Thrasios Kydele Iván"}]});
  check(`dibuja las 3 opciones`, (html.match(/class="dd-op"/g)||[]).length === 3);
  check("lleva su buscador y arranca plegado", /dd-buscar/.test(html) && /hidden/.test(html));
  check("cada opción guarda su texto de búsqueda", /data-txt="Meren of Clan Nel Toth Iván"/.test(html));
  check("y marca el último usado", /class="badge">último/.test(html));

  console.log(fallos ? `\n${fallos} fallos` : "\ntodo correcto");
}, 60);
