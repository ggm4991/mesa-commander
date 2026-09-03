// Comprueba el arrastre de la corona: soltar sobre otro asiento cambia el monarca,
// soltar sobre el mismo o fuera del tablero no cambia nada.
const fs = require('fs');
const js = fs.readFileSync(require('path').join(__dirname,'..','app.html'),'utf8').split('<script>')[1].split('</'+'script>')[0];

const cajas = [ {x:0,y:0,w:500,h:400}, {x:500,y:0,w:500,h:400},
                {x:0,y:400,w:500,h:400}, {x:500,y:400,w:500,h:400} ];
const asientos = cajas.map((c,i)=>{
  const el = {id:"asiento-"+i, style:{}, dataset:{}, _cls:new Set(),
    classList:{toggle(n,v){v?el._cls.add(n):el._cls.delete(n)}, add(n){el._cls.add(n)}, remove(n){el._cls.delete(n)}},
    querySelector:()=>({style:{}, querySelector:()=>({style:{}})}),
    getBoundingClientRect:()=>({left:c.x,top:c.y,width:c.w,height:c.h,right:c.x+c.w,bottom:c.y+c.h})};
  el.closest = sel => sel === ".seat" ? el : null;
  return el;
});
const generico = () => ({style:{}, dataset:{}, classList:{toggle(){},add(){},remove(){}},
  addEventListener(){}, querySelector:()=>generico(), querySelectorAll:()=>[], remove(){},
  getBoundingClientRect:()=>({left:0,top:0,width:1000,height:800}), closest:()=>generico(),
  set innerHTML(v){}, get innerHTML(){return ""}, textContent:"", appendChild(){}, focus(){}, select(){}});
global.document = {
  querySelector: sel => { const m = /^#asiento-(\d)$/.exec(sel); return m ? asientos[+m[1]] : generico(); },
  querySelectorAll: ()=>[], addEventListener(){}, removeEventListener(){},
  createElement: ()=>generico(),
  body: {classList:{add(){},remove(){}}, appendChild(){}, style:{}},
  elementFromPoint: (x,y) => asientos.find((_,i)=>{
    const c = cajas[i]; return x>=c.x && x<c.x+c.w && y>=c.y && y<c.y+c.h; }) || null,
};
global.window = {storage:{get:async()=>{throw 0}, set:async()=>{}}};
global.addEventListener=()=>{}; global.setInterval=()=>0; global.clearInterval=()=>{}; global.scrollTo=()=>{};
global.structuredClone = o => JSON.parse(JSON.stringify(o));

const api = new Function('return (function(){'+js+
  '\n; return {coronaSobre, coronaSoltar, setCorona(c){corona=c}, setJuego(j){JUEGO=j}, get J(){return JUEGO}}; })()')();

const jug = n => ({n, c:"X", c2:"", col:"R", vida:40, dmg:{}, ven:0, exp:0, ene:0, tax:0, tes:0, tor:0,
  mana:{W:0,U:0,B:0,R:0,G:0,C:0}, bendicion:false, rehacer:0, fuera:0, tTotal:0, tMax:0, out:false});
const fantasma = () => ({remove(){}, style:{}});

const nuevaPartida = () => api.setJuego({id:"x", inicio:new Date().toISOString(), cfg:{vida:40, limite:0},
  j:["Ana","Beto","Cris","Dora"].map(jug), turno:0, tIni:Date.now(), acum:0, pausado:false,
  log:[], undo:[], monarca:0, iniciativa:null, dia:null});

setTimeout(async ()=>{
  let fallos = 0;
  const check = (t, ok) => { console.log((ok?"ok    ":"FALLO ")+t); if(!ok) fallos++; };

  check("localiza el asiento bajo el dedo", api.coronaSobre(700, 600) === 3);
  check("fuera del tablero no hay asiento", api.coronaSobre(2000, 2000) === null);

  nuevaPartida();
  api.setCorona({desde:0, fantasma:fantasma()});
  await api.coronaSoltar({clientX:250, clientY:600});      // suelta sobre el asiento 2
  check(`la corona pasa al asiento soltado (monarca ${api.J.monarca})`, api.J.monarca === 2);
  check("queda apuntado en el historial", /corona pasa de Ana a Cris/.test(api.J.log[0].txt));

  nuevaPartida();
  api.setCorona({desde:0, fantasma:fantasma()});
  await api.coronaSoltar({clientX:100, clientY:100});      // suelta donde ya estaba
  check("soltarla en su sitio no cambia nada", api.J.monarca === 0 && api.J.log.length === 0);

  nuevaPartida();
  api.setCorona({desde:0, fantasma:fantasma()});
  await api.coronaSoltar({clientX:5000, clientY:5000});    // suelta fuera
  check("soltarla fuera del tablero la devuelve", api.J.monarca === 0);

  console.log(fallos ? `\n${fallos} fallos` : "\ntodo correcto");
}, 60);
