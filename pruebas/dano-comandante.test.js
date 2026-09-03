// Comprueba el daño de comandante: por comandante y no por jugador, con compañeros
// separados, el propio comandante robado como fuente letal, y la migración de datos.
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
  '\n; return {danoComandante, comandantesEnMesa, migrarJuego, setJuego(j){JUEGO=j}, get J(){return JUEGO}}; })()')();

const jug = (n,c,c2) => ({n, c, c2:c2||"", col:"R", vida:100, dmg:{}, ven:0, exp:0, ene:0, tax:0,
  tes:0, tor:0, mana:{W:0,U:0,B:0,R:0,G:0,C:0}, bendicion:false, rehacer:0, fuera:0,
  tTotal:0, tMax:0, out:false});

setTimeout(()=>{
  let fallos = 0;
  const check = (t, ok) => { console.log((ok?"ok    ":"FALLO ")+t); if(!ok) fallos++; };

  api.setJuego({id:"x", inicio:new Date().toISOString(), cfg:{vida:100, limite:0},
    j:[jug("Ana","Thrasios, Triton Hero","Kydele, Chosen of Kruphix"), jug("Beto","Krenko, Mob Boss")],
    turno:0, tIni:Date.now(), acum:0, pausado:false, log:[], undo:[], monarca:null, iniciativa:null, dia:null});

  const cmds = api.comandantesEnMesa();
  check(`la mesa tiene 3 comandantes (Ana lleva compañero): ${cmds.length}`, cmds.length === 3);

  // los dos comandantes de Ana pegan 20 cada uno a Beto: 40 de daño, pero ninguno llega a 21
  api.danoComandante(1, "0:0", 20);
  api.danoComandante(1, "0:1", 20);
  const B = api.J.j[1];
  check(`compañeros por separado: 20 y 20 no eliminan (vida ${B.vida})`, !B.out && B.vida === 60);

  // uno de ellos llega a 21
  api.danoComandante(1, "0:0", 1);
  check("21 de un mismo comandante elimina a Beto", api.J.j[1].out === true);

  // el propio comandante de Ana, robado, la mata a ella
  api.danoComandante(0, "0:0", 21);
  check("el comandante propio robado también elimina", api.J.j[0].out === true);

  // migración del formato antiguo (daño por asiento)
  const viejo = api.migrarJuego({j:[{n:"Z", c:"X", dmg:{"1":7}}]});
  check(`partida antigua migrada: ${JSON.stringify(viejo.j[0].dmg)}`,
        viejo.j[0].dmg["1:0"] === 7 && viejo.j[0].c2 === "");

  console.log(fallos ? `\n${fallos} fallos` : "\ntodo correcto");
}, 60);
