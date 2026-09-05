// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it } from 'vitest'
import { useBordesAsientos } from '../../src/tablero/useBordesAsientos'

// jsdom no calcula layout de verdad: getBoundingClientRect siempre da un
// rectángulo vacío, así que calcularBordeAsiento siempre devuelve null aquí.
// Lo que se comprueba es que el hook no entre en un bucle de renders al
// estabilizarse en ese resultado (ver el bug real que esto reprodujo: cada
// `setBordes` con un array nuevo pero de igual contenido disparaba otro
// render sin fin).
function Sonda({ n, alRenderizar }: { n: number; alRenderizar: () => void }) {
  alRenderizar()
  const tableroRef = useRef<HTMLDivElement>(null)
  const asientoRefs = useRef<(HTMLDivElement | null)[]>([])
  const bordes = useBordesAsientos(tableroRef, asientoRefs, Array.from({ length: n }, () => 0), false)
  return (
    <div ref={tableroRef}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} ref={(el) => { asientoRefs.current[i] = el }} />
      ))}
      <span data-testid="bordes">{JSON.stringify(bordes)}</span>
    </div>
  )
}

describe('useBordesAsientos', () => {
  it('se estabiliza sin entrar en un bucle infinito de renders', () => {
    let renders = 0
    render(<Sonda n={4} alRenderizar={() => renders++} />)
    // un puñado de renders para estabilizarse está bien; un bucle sin fin
    // habría hecho fallar el propio test (o colgado el runner) antes de llegar aquí
    expect(renders).toBeLessThan(20)
  })
})
