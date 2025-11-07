import { useAuth } from '../../contexts/AuthContext'
import { Bell, User, LogOut, Settings } from 'lucide-react'
import { useState } from 'react'

export default function TopNavigation() {
  const { user, signOut } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gradient">ZiberLive</h1>
          <span className="hidden md:inline text-sm text-gray-500">Smart Shared Living</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-ziber rounded-full flex items-center justify-center text-white font-semibold">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {user?.email?.split('@')[0] || 'User'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <a
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Profile</span>
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </a>
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-red-600 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

