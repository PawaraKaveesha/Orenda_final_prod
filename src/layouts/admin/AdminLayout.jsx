import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/admin/Sidebar'
import Topbar from '../../components/admin/Topbar'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-sand-100 font-admin">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-col lg:pl-72">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
