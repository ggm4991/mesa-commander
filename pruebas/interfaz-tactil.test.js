// Objetivos táctiles y coherencia de iconos.
const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname,'..','app.html'),'utf8');
let css = html.split('<style>')[1].split('</style>')[0];
css = css.replace(/\/\*[\s\S]*?\*\//g, "");                          // fuera los comentarios
css = css.replace(/@(container|media)[^{]*\{(?:[^{}]*\{[^{}]*\}\s*)*\}/g, "");   // variantes aparte

const reglas = new Map();
for(const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
  const cuerpo = m[2];
  for(const sel of m[1].split(",").map(x=>x.trim().replace(/\s+/g," "))){
    if(!reglas.has(sel)) reglas.set(sel, "");
    reglas.set(sel, reglas.get(sel) + cuerpo);
  }
}
const altura = sel => {
  const b = reglas.get(sel); if(!b) return null;
  const m = [...b.matchAll(/(?:min-height|height)\s*:\s*(\d+)px/g)].pop();
  return m ? +m[1] : null;
};
let fallos = 0;
for(const [sel,min] of [[".btn",46],[".btn.small",40],[".btn.link",40],[".tab",42],[".opt",48],
  [".more",42],[".hub .ico",50],[".hub .pass",50],[".stepper button",48],[".color-btn",46],
  [".close",44],[".pinner .rot",40],[".back",46],[".corona",40],["input[type=search]",48]]){
  const a = altura(sel), ok = a !== null && a >= min;
  if(!ok) fallos++;
  console.log(`${ok?"ok   ":"FALLO"} ${sel.padEnd(20)} ${a ?? "sin definir"}${a?"px":""} (mínimo ${min})`);
}

const js = html.split('<script>')[1].split('</'+'script>')[0];
const bloque = js.slice(js.indexOf("const ICONOS"), js.indexOf("const ic ="));
const definidos = new Set([...bloque.matchAll(/(\w+)\s*:\s*'/g)].map(m=>m[1]));
const refs = new Set([
  ...[...js.matchAll(/ic\(\s*(?:[^,()]*\?\s*)?["'](\w+)["']/g)].map(m=>m[1]),
  ...[...js.matchAll(/["'](\w+)["']\s*(?:,\s*\d+\s*)?\)/g)].map(m=>m[1]).filter(n=>definidos.has(n)),
  ...[...js.matchAll(/\bi:\s*["'](\w+)["']/g)].map(m=>m[1]),
]);
const rotas = [...refs].filter(r=>!definidos.has(r));
console.log(`\n${definidos.size} iconos definidos, ${refs.size} referenciados`);
if(rotas.length){ console.log("REFERENCIAS ROTAS:", rotas.join(", ")); fallos++; }
const sinUsar = [...definidos].filter(d=>!refs.has(d));
console.log(sinUsar.length ? "sin usar: " + sinUsar.join(", ") : "todos los iconos definidos se usan");
console.log(fallos ? `\n${fallos} fallos` : "\ntodos los controles llegan al tamaño mínimo y no hay iconos rotos");
