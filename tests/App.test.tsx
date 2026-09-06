// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../src/App'
import { crearAlmacenMemoria } from '../src/almacenamiento/adaptadorMemoria'
import { AlmacenContexto } from '../src/contextos/AlmacenContexto'
import { ProveedorQueryDePrueba } from './ayudantes/queryDePrueba'

describe('App', () => {
  it('muestra la versión y la fecha del build junto al nombre, para saber si una instalación es una build nueva', () => {
    render(
      <ProveedorQueryDePrueba>
        <AlmacenContexto.Provider value={crearAlmacenMemoria()}>
          <App />
        </AlmacenContexto.Provider>
      </ProveedorQueryDePrueba>,
    )
    // vitest.config.ts fija estos valores para que el test no dependa del build real
    expect(screen.getByText('v0.0.0-test · 1970-01-01 00:00')).toBeInTheDocument()
  })
})
