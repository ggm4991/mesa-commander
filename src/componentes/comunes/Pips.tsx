/** Sustituye a `pips(id)` de app.html: un punto de color por cada letra de la
 * identidad ("WBR" → tres puntos); sin identidad, un único punto incoloro ("C"),
 * igual que hacía el original. */
export function Pips({ identidad }: { identidad?: string }) {
  const letras = (identidad || 'C').split('')
  return (
    <span className="pips">
      {letras.map((c, i) => (
        <i key={i} className={`pip ${c}`} />
      ))}
    </span>
  )
}
