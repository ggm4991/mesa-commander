// Perfiles con varios mazos, migración de los antiguos, y la copia de seguridad
// completa (exportar, reemplazar y combinar sin duplicar).
const fs = require('fs');
const js = fs.readFileSync(require('path').join(__dirname,'..','app.html'),'utf8').split('<script>')[1].split('</'+'script>')[0];
const gen = () => ({style:{}, dataset:{}, classList:{toggle(){},add(){},remove(){}}, addEventListener(){},
  querySelector:()=>gen(), querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:0,height:0}),
  closest:()=>gen(), set innerHTML(v){}, get innerHTML(){return ""}, textContent:"", value:"", focus(){}, select(){}});
global.document = {querySelector:()=>gen(), querySelectorAll:()=>[], addEventListener(){}, removeEventListener(){},
  createElement:()=>gen(), body:{appendChild(){},classList:{add(){},remove(){}}}, elementFromPoint:()=>null};
global.window = {storage:{get:async()=>{throw 0}, set:async()=>{}}};
global.addEventListener=()=>{}; global.setInterval=()=>0; global.clearInterval=()=>{}; global.scrollTo=()=>{};
global.structuredClone = o => JSON.parse(JSON.stringify(o));

const api = new Function('return (function(){'+js+`
; return {migrarPerfiles, mazoUltimo, asientoDesde, paqueteCompleto, revisarPaquete,
   huellaPartida, huellaMazo, validar, normalizar,
   set P(v){PARTIDAS=v}, get P(){return PARTIDAS},
   set F(v){PERFILES=v}, get F(){return PERFILES}}; })()`)();

setTimeout(()=>{
  let fallos = 0;
  const check = (t, ok) => { console.log((ok?"ok    ":"FALLO ")+t); if(!ok) fallos++; };

  // --- migración de un perfil de la versión anterior ---
  const viejo = api.migrarPerfiles([{id:"p1", nombre:"Gonzalo", comandante:"Edgar Markov",
                                     comandante2:"", colores:"WBR"}]);
  check(`el perfil antiguo pasa a tener 1 mazo (${viejo[0].mazos.length})`,
        viejo[0].mazos.length === 1 && viejo[0].mazos[0].c === "Edgar Markov" && viejo[0].ultimo);

  // --- varios mazos y el último usado ---
  const p = api.migrarPerfiles([{id:"p2", nombre:"Marta", mazos:[
      {id:"m1", c:"Muldrotha, the Gravetide", col:"UBG"},
      {id:"m2", c:"Thrasios, Triton Hero", c2:"Kydele, Chosen of Kruphix", col:"GU"}], ultimo:"m2"}])[0];
  check("recuerda el último mazo usado", api.mazoUltimo(p).id === "m2");
  const asiento = api.asientoDesde(p, api.mazoUltimo(p));
  check(`al sentarse arrastra los dos comandantes (${asiento.comandante2})`,
        asiento.comandante2 === "Kydele, Chosen of Kruphix" && asiento.colores === "GU");

  // --- copia de seguridad ---
  const partida = fecha => ({id:"g-"+fecha, fecha, duracion:100, seats:[
    {j:"Ana", c:"X", c2:"", id:"R", r:"V", rehacer:0, tiempo:0, turno:60},
    {j:"Beto", c:"Y", c2:"", id:"U", r:"D", rehacer:0, tiempo:0, turno:60}]});
  api.P = [partida("2026-08-01")];
  api.F = [p];
  const paquete = api.paqueteCompleto();
  check("la copia lleva partidas, perfiles y ajustes",
        paquete.partidas.length === 1 && paquete.perfiles.length === 1 && !!paquete.config && paquete.formato === 2);

  const leido = api.revisarPaquete(JSON.stringify(paquete));
  check("y se vuelve a leer sin perder nada",
        leido.partidas.length === 1 && leido.perfiles[0].mazos.length === 2);

  // combinar: una repetida y una nueva
  const otro = {app:"mesa-commander", formato:2,
    partidas:[partida("2026-08-01"), partida("2026-08-08")],
    perfiles:[{id:"zz", nombre:"marta", mazos:[
      {id:"m9", c:"Muldrotha, the Gravetide", col:"UBG"},   // ya la tiene
      {id:"m8", c:"Krenko, Mob Boss", col:"R"}]}]};
  const d = api.revisarPaquete(JSON.stringify(otro));
  const huellas = new Set(api.P.map(api.huellaPartida));
  const nuevas = d.partidas.filter(g=>!huellas.has(api.huellaPartida(g)));
  check(`al combinar solo entra la partida que falta (${nuevas.length} de 2)`, nuevas.length === 1);
  const tengo = new Set(api.F[0].mazos.map(api.huellaMazo));
  const mazosNuevos = d.perfiles[0].mazos.filter(m=>!tengo.has(api.huellaMazo(m)));
  check(`y solo el mazo que no tenía (${mazosNuevos.map(m=>m.c).join(", ")})`,
        mazosNuevos.length === 1 && mazosNuevos[0].c === "Krenko, Mob Boss");

  // un archivo que no es nuestro
  let rechazado = false;
  try{ api.revisarPaquete('{"cosas":[1,2,3]}'); }catch(e){ rechazado = true; }
  check("rechaza un archivo que no es una copia válida", rechazado);

  // admite una lista suelta de partidas de la versión antigua
  const suelto = api.revisarPaquete(JSON.stringify([partida("2026-09-01")]));
  check("acepta el JSON antiguo de solo partidas", suelto.partidas.length === 1);

  console.log(fallos ? `\n${fallos} fallos` : "\ntodo correcto");
}, 60);
