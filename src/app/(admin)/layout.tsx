import { Providers } from './providers'

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
