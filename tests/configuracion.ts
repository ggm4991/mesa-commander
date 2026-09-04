// Extiende `expect` con los matchers de jest-dom (toBeInTheDocument, etc.) para
// los tests de tests/componentes/. No afecta a tests/motor ni tests/almacenamiento:
// solo añade matchers, no toca el entorno.
import '@testing-library/jest-dom/vitest'

// Testing Library limpia el DOM entre tests con un `afterEach(cleanup)` que se
// auto-registra solo si detecta un `afterEach` global — y este proyecto no activa
// `test.globals` (se prefieren imports explícitos, como en tests/motor). Se
// registra aquí a mano para que cada test empiece con el DOM vacío, portales
// (como el de Modal) incluidos.
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(cleanup)
