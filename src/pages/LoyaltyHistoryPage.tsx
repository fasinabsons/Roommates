import { useState } from 'react'
import { TrendingUp, Award, Trophy, Users, ChevronRight } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import LoyaltyBadge, { getTierFromPoints, type LoyaltyTier } from '../components/loyalty/LoyaltyBadge'

interface PointTransaction {
  id: string
  description: string
  points: number
  type: 'earn' | 'spend' | 'bonus'
  date: string
  category: string
}

interface LeaderboardMember {
  id: string
  name: string
  avatar: string
  points: number
  tier: LoyaltyTier
  rank: number
}

export default function LoyaltyHistoryPage() {
  const [selectedTab, setSelectedTab] = useState<'history' | 'leaderboard'>('history')

  // Mock data - replace with actual API calls
  const currentUserPoints = 1850
  const currentUserTier = getTierFromPoints(currentUserPoints)

  const transactions: PointTransaction[] = [
    {
      id: '1',
      description: 'Completed cleaning task',
      points: 50,
      type: 'earn',
      date: '2024-01-15',
      category: 'Tasks',
    },
    {
      id: '2',
      description: 'Paid rent on time (3 months streak)',
      points: 100,
      type: 'bonus',
      date: '2024-01-10',
      category: 'Bills',
    },
    {
      id: '3',
      description: 'Helped with grocery shopping',
      points: 30,
      type: 'earn',
      date: '2024-01-08',
      category: 'Meals',
    },
    {
      id: '4',
      description: 'Won community poll',
      points: 25,
      type: 'earn',
      date: '2024-01-05',
      category: 'Voting',
    },
    {
      id: '5',
      description: 'Redeemed: Movie night discount',
      points: -100,
      type: 'spend',
      date: '2024-01-03',
      category: 'Rewards',
    },
    {
      id: '6',
      description: 'Created quality vote proposal',
      points: 40,
      type: 'earn',
      date: '2024-01-01',
      category: 'Voting',
    },
  ]

  const leaderboard: LeaderboardMember[] = [
    { id: '1', name: 'Alice Brown', avatar: 'AB', points: 3200, tier: 'platinum', rank: 1 },
    { id: '2', name: 'Bob Wilson', avatar: 'BW', points: 2850, tier: 'gold', rank: 2 },
    { id: '3', name: 'Charlie Davis', avatar: 'CD', points: 2100, tier: 'gold', rank: 3 },
    { id: '4', name: 'You', avatar: 'ME', points: currentUserPoints, tier: currentUserTier, rank: 4 },
    { id: '5', name: 'Diana Evans', avatar: 'DE', points: 1650, tier: 'gold', rank: 5 },
    { id: '6', name: 'Frank Green', avatar: 'FG', points: 1200, tier: 'silver', rank: 6 },
    { id: '7', name: 'Grace Hill', avatar: 'GH', points: 890, tier: 'silver', rank: 7 },
    { id: '8', name: 'Henry Jones', avatar: 'HJ', points: 450, tier: 'bronze', rank: 8 },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'earn':
        return 'text-green-600'
      case 'spend':
        return 'text-red-600'
      case 'bonus':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bonus':
        return '🎁'
      case 'earn':
        return '⬆️'
      case 'spend':
        return '⬇️'
      default:
        return '•'
    }
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600'
    if (rank === 2) return 'from-gray-400 to-gray-600'
    if (rank === 3) return 'from-amber-600 to-amber-800'
    return 'from-indigo-500 to-purple-500'
  }

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Loyalty Program</h1>
              <p className="text-sm text-gray-500 mt-1">Track your points, tier, and ranking</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Current Status Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Your Loyalty Status</h2>
                <p className="text-indigo-100 mb-6">Keep earning points to unlock more rewards!</p>
                
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-indigo-100 mb-1">Total Points</p>
                    <p className="text-3xl font-bold">{currentUserPoints.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-100 mb-1">Current Rank</p>
                    <p className="text-3xl font-bold">#4</p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-100 mb-1">This Month</p>
                    <p className="text-3xl font-bold">+245</p>
                  </div>
                </div>
              </div>
              
              <div className="ml-8">
                <LoyaltyBadge tier={currentUserTier} points={currentUserPoints} size="lg" showPoints={false} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setSelectedTab('history')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  selectedTab === 'history'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Points History
                </div>
              </button>
              <button
                onClick={() => setSelectedTab('leaderboard')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  selectedTab === 'leaderboard'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Leaderboard
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {selectedTab === 'history' ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl">{getTypeIcon(transaction.type)}</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {new Date(transaction.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{transaction.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${getTypeColor(transaction.type)}`}>
                        {transaction.points > 0 ? '+' : ''}
                        {transaction.points}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                        member.name === 'You'
                          ? 'bg-indigo-50 border-2 border-indigo-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {/* Rank Badge */}
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRankColor(
                          member.rank
                        )} flex items-center justify-center text-white font-bold shadow-md`}
                      >
                        {member.rank <= 3 ? getRankEmoji(member.rank) : `#${member.rank}`}
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-indigo-600">{member.avatar}</span>
                      </div>

                      {/* Member Info */}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {member.name}
                          {member.name === 'You' && (
                            <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Award className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600 capitalize">{member.tier} Tier</span>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{member.points.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* How to Earn Points */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">How to Earn Points</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">✅</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Complete Tasks</p>
                  <p className="text-sm text-gray-600">Earn 10-50 points per task</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💰</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Pay Bills On Time</p>
                  <p className="text-sm text-gray-600">Get 20 points + streak bonuses</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🗳️</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Vote in Polls</p>
                  <p className="text-sm text-gray-600">Earn 5-25 points for participation</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🍳</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Help with Meals</p>
                  <p className="text-sm text-gray-600">Get 15-40 points for cooking/shopping</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

