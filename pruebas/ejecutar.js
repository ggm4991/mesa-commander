#!/usr/bin/env node
/* Ejecuta todas las pruebas de la carpeta y resume el resultado.
   Cada prueba imprime líneas que empiezan por "ok" o por "FALLO"; basta con
   buscar esas marcas y el código de salida para saber si algo se ha roto.
   Uso:  npm test        o        node pruebas/ejecutar.js */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const carpeta = __dirname;
const archivos = fs.readdirSync(carpeta).filter(f => f.endsWith(".test.js")).sort();
const soloEstos = process.argv.slice(2);
const elegidos = soloEstos.length
  ? archivos.filter(f => soloEstos.some(a => f.includes(a)))
  : archivos;

if (!elegidos.length) {
  console.error("Ninguna prueba coincide con:", soloEstos.join(", "));
  process.exit(1);
}

let rotas = 0;
for (const archivo of elegidos) {
  const nombre = archivo.replace(".test.js", "");
  let salida = "";
  let reventó = false;
  try {
    salida = execFileSync(process.execPath, [path.join(carpeta, archivo)], {
      encoding: "utf8",
      timeout: 30000,
    });
  } catch (e) {
    reventó = true;
    salida = (e.stdout || "") + (e.stderr || "");
  }

  // Las pruebas marcan cada comprobación con "ok" o con "FALLO"
  const fallos = (salida.match(/\bFALLO\b|\bERROR\b/g) || []).length;
  const bien = (salida.match(/\bok\b/g) || []).length;
  const mal = reventó || fallos > 0;
  if (mal) rotas++;

  console.log(`${mal ? "✗" : "✓"} ${nombre.padEnd(20)} ${bien} comprobaciones` +
              (fallos ? `, ${fallos} fallan` : "") + (reventó ? ", la prueba ha reventado" : ""));
  if (mal) console.log(salida.split("\n").map(l => "    " + l).join("\n"));
}

console.log(rotas
  ? `\n${rotas} de ${elegidos.length} archivos con problemas`
  : `\n${elegidos.length} archivos, todo correcto`);
process.exit(rotas ? 1 : 0);
