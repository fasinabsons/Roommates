import { ReactNode } from 'react'
import TopNavigation from './TopNavigation'
import Sidebar from './Sidebar'
import BottomNavigation from './BottomNavigation'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation - Desktop */}
      <TopNavigation />

      {/* Main Layout Container */}
      <div className="flex">
        {/* Sidebar - Desktop Only */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation />
    </div>
  )
}

