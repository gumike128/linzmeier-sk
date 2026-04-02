import { AdminGuard } from '@/components/admin/AdminGuard'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatusBar } from '@/components/admin/AdminStatusBar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 md:pl-[260px]">
          <AdminStatusBar />
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6 bg-muted/30 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
