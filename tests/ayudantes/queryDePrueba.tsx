import { QueryClientProvider } from '@tanstack/react-query'
import { crearQueryClientDePrueba } from './crearQueryClientDePrueba'

export function ProveedorQueryDePrueba({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={crearQueryClientDePrueba()}>{children}</QueryClientProvider>
}
