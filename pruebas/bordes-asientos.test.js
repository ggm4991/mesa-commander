// Comprueba que, en una mesa 2x2 como la de la captura, los controles de cada
// asiento se apartan hacia el borde de fuera y dejan libre la esquina del reloj.
const fs = require('fs');
const js = fs.readFileSync(require('path').join(__dirname,'..','app.html'),'utf8').split('<script>')[1].split('</'+'script>')[0];

const W = 1091, H = 864, HUB = {w:190, h:56};
const celdas = [
  {rot:180, x:0,   y:0,   w:540, h:432, nombre:"arriba izquierda"},
  {rot:180, x:551, y:0,   w:540, h:432, nombre:"arriba derecha"},
  {rot:0,   x:0,   y:440, w:540, h:424, nombre:"abajo izquierda"},
  {rot:0,   x:551, y:440, w:540, h:424, nombre:"abajo derecha"},
];
const falso = (rect, rot) => {
  const filas = {".seat-top":{style:{}, querySelector:()=>({style:{}})},
                 ".seat-bot":{style:{}, querySelector:()=>({style:{}})}};
  return {dataset:{rot:String(rot)}, style:{},
          getBoundingClientRect:()=>rect,
          querySelector:s=>filas[s], _filas:filas};
};
const els = {"#board": {getBoundingClientRect:()=>({left:0,top:0,width:W,height:H})}};
celdas.forEach((c,i)=> els["#asiento-"+i] = falso({left:c.x,top:c.y,width:c.w,height:c.h}, c.rot));

const generico = () => ({style:{}, dataset:{}, classList:{toggle(){},add(){},remove(){}},
  addEventListener(){}, querySelector:()=>generico(), querySelectorAll:()=>[],
  getBoundingClientRect:()=>({left:0,top:0,width:0,height:0}), closest:()=>null,
  set innerHTML(v){}, get innerHTML(){return ""}, textContent:"", focus(){}, select(){}});
global.document = {querySelector:s=>els[s]||generico(), querySelectorAll:()=>[], addEventListener(){}, removeEventListener(){}};
global.window = {storage:{get:async()=>{throw 0}, set:async()=>{}}};
global.addEventListener=()=>{}; global.setInterval=()=>0; global.clearInterval=()=>{}; global.scrollTo=()=>{};
global.structuredClone = o => JSON.parse(JSON.stringify(o));

const api = new Function('return (function(){'+js+
  '\n; return {calcularBordes, aplicarBordes, get BORDES(){return BORDES}, setJuego(j){JUEGO=j}}; })()')();

setTimeout(()=>{
  api.setJuego({j:celdas.map(()=>({})), cfg:{dispo:{}}});
  api.calcularBordes();
  celdas.forEach((c,i)=> api.aplicarBordes(i));

  let fallos = 0;
  celdas.forEach((c,i)=>{
    const b = api.BORDES[i], fila = els["#asiento-"+i]._filas[".seat-top"].style;
    // ¿en qué lado de la PANTALLA acaba el grupo de controles?
    const packStart = fila.justifyContent === "flex-start";
    // content-start en pantalla: rot 0 -> izquierda, rot 180 -> derecha
    const enPantalla = (c.rot === 0) === packStart ? "izquierda" : "derecha";
    const centroEsta = c.x + c.w/2 < W/2 ? "derecha" : "izquierda";  // hacia dónde queda el centro
    const ok = b && b.arriba && enPantalla !== centroEsta;
    if(!ok) fallos++;
    console.log(`${c.nombre.padEnd(18)} controles a la ${enPantalla.padEnd(9)} | centro a la ${centroEsta.padEnd(9)} | hueco ${b?b.hueco:"-"} ${ok?"ok":"FALLO"}`);
  });
  console.log(fallos ? fallos+" fallos" : "\nlos cuatro asientos apartan sus controles del reloj central");
}, 60);
