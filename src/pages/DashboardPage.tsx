import AppLayout from '../components/layout/AppLayout'
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  UtensilsCrossed,
  Vote,
  Award
} from 'lucide-react'

export default function DashboardPage() {
  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening in your apartment.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stat Card 1 */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <span className="badge badge-primary">Due Soon</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹12,500</h3>
          <p className="text-sm text-gray-600">Pending Bills</p>
        </div>

        {/* Stat Card 2 */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <span className="badge" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>Active</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">8 / 10</h3>
          <p className="text-sm text-gray-600">Members</p>
        </div>

        {/* Stat Card 3 */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <span className="badge" style={{ backgroundColor: '#F3E8FF', color: '#6B21A8' }}>Gold Tier</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">2,450</h3>
          <p className="text-sm text-gray-600">Loyalty Points</p>
        </div>

        {/* Stat Card 4 */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className="badge" style={{ backgroundColor: '#FED7AA', color: '#9A3412' }}>+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹45,000</h3>
          <p className="text-sm text-gray-600">Total Investments</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Actions */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Pending Actions</h2>
              <span className="badge" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>3 Items</span>
            </div>

            <div className="space-y-3">
              {/* Action Item 1 */}
              <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Electricity Bill Payment Due</h4>
                  <p className="text-sm text-gray-600 mb-2">Amount: ₹1,250 • Due: Nov 8, 2025</p>
                  <button className="btn-primary text-sm py-2 px-4">Pay Now</button>
                </div>
              </div>

              {/* Action Item 2 */}
              <div className="flex items-start gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Vote on Community Meal Plan</h4>
                  <p className="text-sm text-gray-600 mb-2">Active poll • Closes in 2 days</p>
                  <button className="btn-secondary text-sm py-2 px-4">Vote Now</button>
                </div>
              </div>

              {/* Action Item 3 */}
              <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Grocery Duty This Weekend</h4>
                  <p className="text-sm text-gray-600 mb-2">Saturday, Nov 9 • Your turn</p>
                  <button className="btn-secondary text-sm py-2 px-4">View Details</button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>

            <div className="space-y-4">
              {/* Activity Item */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">Ravi Kumar</span> paid the Water Bill
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago • ₹800</p>
                </div>
              </div>

              {/* Activity Item */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Vote className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">Poll Created:</span> Change Internet Provider?
                  </p>
                  <p className="text-xs text-gray-500 mt-1">5 hours ago • 3/8 voted</p>
                </div>
              </div>

              {/* Activity Item */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">New Member:</span> Priya Sharma joined
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Yesterday • Room 302 Bed 2</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-primary justify-start">
                <DollarSign className="w-5 h-5" />
                <span>Pay Bills</span>
              </button>
              <button className="w-full btn-secondary justify-start">
                <Vote className="w-5 h-5" />
                <span>Create Poll</span>
              </button>
              <button className="w-full btn-secondary justify-start">
                <UtensilsCrossed className="w-5 h-5" />
                <span>Meal Calendar</span>
              </button>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Leaderboard</h3>
            <div className="space-y-3">
              {[
                { rank: 1, name: 'Amit P.', points: 3200, badge: '🥇' },
                { rank: 2, name: 'Priya S.', points: 2850, badge: '🥈' },
                { rank: 3, name: 'Ravi K.', points: 2450, badge: '🥉' },
                { rank: 4, name: 'You', points: 2100, badge: '4' },
              ].map((member) => (
                <div
                  key={member.rank}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    member.name === 'You'
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{member.badge}</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-600">{member.points} pts</p>
                    </div>
                  </div>
                  {member.name === 'You' && (
                    <Award className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

