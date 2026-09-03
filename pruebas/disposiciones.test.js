// Prueba de humo: ejecuta el JS de la app con un DOM falso y comprueba
// que las plantillas de la pantalla previa se generan sin errores.
const fs = require('fs');
const html = fs.readFileSync('/home/claude/mesa/app.html','utf8');
const js = html.split('<script>')[1].split('</'+'script>')[0];

const nodo = () => new Proxy(function(){}, {
  get(t,k){
    if(k==='innerHTML') return t._html || '';
    if(k==='dataset'||k==='style'||k==='classList') return t[k] || (t[k]=nodo());
    if(k==='textContent') return '';
    if(k===Symbol.toPrimitive) return ()=>'';
    return nodo();
  },
  set(t,k,v){ if(k==='innerHTML') t._html = v; else t[k]=v; return true; },
  apply(){ return nodo(); }
});
const capturado = {};
global.document = {
  querySelector: sel => { const n = nodo(); capturado[sel] = n; return n; },
  querySelectorAll: () => [],
  addEventListener(){}, removeEventListener(){},
};
global.window = { storage:{ get:async()=>{throw new Error('vacío')}, set:async()=>{} } };
global.addEventListener = ()=>{};
global.setTimeout = setTimeout; global.clearTimeout = clearTimeout;
global.setInterval = ()=>0; global.clearInterval = ()=>{};
global.scrollTo = ()=>{};
global.structuredClone = o => JSON.parse(JSON.stringify(o));

const ctx = {};
const fn = new Function('return (function(){ ' + js + '\n; return {dispoActual, vistaMesa, DISPOS, MESA, pintarInicio, get MESA_(){return MESA}, setMesa(m){MESA=m}}; })()');
const api = fn();

setTimeout(()=>{
  let fallos = 0;
  for(let n=1;n<=6;n++){
    api.setMesa(Array.from({length:n},(_,i)=>({nombre:"Jugador "+(i+1), comandante:"Krenko, Mob Boss", colores:"R"})));
    for(const d of api.DISPOS[n]){
      try{
        const dd = api.dispoActual();
        const h = api.vistaMesa();
        const celdas = (h.match(/class="pseat/g)||[]).length;
        if(celdas !== n){ console.log(`FALLO n=${n} ${d.n}: ${celdas} celdas`); fallos++; }
      }catch(e){ console.log(`ERROR n=${n} ${d.n}:`, e.message); fallos++; }
    }
    // giros
    try{ api.pintarInicio(); }catch(e){ console.log('ERROR pintarInicio n='+n+':', e.message); fallos++; }
  }
  console.log(fallos ? fallos+' fallos' : 'todas las disposiciones (1-6 jugadores) se dibujan bien');
}, 60);
