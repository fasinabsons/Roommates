import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  UtensilsCrossed, 
  Vote, 
  TrendingUp,
  CheckSquare,
  Calendar,
  MessageSquare,
  Settings,
  UserCheck,
  Mail,
  ShoppingCart,
  Home,
  Award
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  icon: any
  label: string
  href: string
  badge?: number
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: UserCheck, label: 'Member Approvals', href: '/admin/approvals', badge: 2 },
  { icon: Mail, label: 'Invite Management', href: '/admin/invites' },
  { icon: Users, label: 'Members', href: '/members' },
  { icon: DollarSign, label: 'Bills & Payments', href: '/bills', badge: 3 },
  { icon: UtensilsCrossed, label: 'Community Meals', href: '/meals' },
  { icon: ShoppingCart, label: 'Grocery Teams', href: '/grocery-teams' },
  { icon: Vote, label: 'Voting & Polls', href: '/voting' },
  { icon: Home, label: 'Resources', href: '/resources' },
  { icon: Award, label: 'Loyalty Points', href: '/loyalty' },
  { icon: TrendingUp, label: 'Investments', href: '/investments' },
  { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
  { icon: Calendar, label: 'Calendar', href: '/calendar' },
  { icon: MessageSquare, label: 'Disputes', href: '/disputes' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('/dashboard')

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <nav className="p-4 space-y-1">
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
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-ziber text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isActive ? 'bg-white text-blue-600' : 'bg-red-100 text-red-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </a>
          )
        })}
      </nav>
    </aside>
  )
}

