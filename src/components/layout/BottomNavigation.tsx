import { 
  LayoutDashboard, 
  DollarSign, 
  UtensilsCrossed, 
  Vote, 
  Menu
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  icon: any
  label: string
  href: string
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: DollarSign, label: 'Bills', href: '/bills' },
  { icon: UtensilsCrossed, label: 'Meals', href: '/meals' },
  { icon: Vote, label: 'Voting', href: '/voting' },
  { icon: Menu, label: 'More', href: '/more' },
]

export default function BottomNavigation() {
  const [activeItem, setActiveItem] = useState('/dashboard')

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.href

          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault()
                setActiveItem(item.href)
              }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all min-w-[64px] ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

