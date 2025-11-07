import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, 
  MapPin, 
  Calendar, 
  Award, 
  DollarSign,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Mail,
  Phone,
  Edit
} from 'lucide-react'
import { format } from 'date-fns'

interface MemberProfile {
  id: string
  name: string
  email: string
  phone: string
  photo_url: string | null
  role: string
  status: string
  loyalty_points: number
  loyalty_tier: string
  move_in_date: string
  bio: string | null
  location: {
    name: string
    type: string
  } | null
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'personal' | 'location' | 'history' | 'achievements'>('personal')
  const [paymentStats, setPaymentStats] = useState({ total: 0, verified: 0, pending: 0 })
  const [taskStats, setTaskStats] = useState({ completed: 0, pending: 0 })

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('apartment_members')
        .select(`
          *,
          locations (
            name,
            type
          )
        `)
        .eq('user_id', user?.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Get payment stats
      const { data: payments } = await supabase
        .from('payments')
        .select('status')
        .eq('payer_member_id', user?.id)

      if (payments) {
        setPaymentStats({
          total: payments.length,
          verified: payments.filter(p => p.status === 'verified').length,
          pending: payments.filter(p => p.status === 'pending').length
        })
      }

      // Get task stats
      const { data: tasks } = await supabase
        .from('task_assignments')
        .select('status')
        .eq('assigned_to', user?.id)

      if (tasks) {
        setTaskStats({
          completed: tasks.filter(t => t.status === 'completed').length,
          pending: tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return 'text-purple-600 bg-purple-100'
      case 'gold': return 'text-yellow-600 bg-yellow-100'
      case 'silver': return 'text-gray-600 bg-gray-100'
      case 'bronze': return 'text-orange-600 bg-orange-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getTierEmoji = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return '💎'
      case 'gold': return '🥇'
      case 'silver': return '🥈'
      case 'bronze': return '🥉'
      default: return '⭐'
    }
  }

  if (loading || !profile) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="spinner h-12 w-12"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container-custom py-8">
        {/* Profile Header */}
        <div className="card p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Photo */}
            <div className="relative">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
                  <User size={48} className="text-blue-600" />
                </div>
              )}
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50">
                <Edit size={16} className="text-gray-600" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                <span className={`badge ${profile.role === 'admin' ? 'badge-purple' : 'badge-primary'}`}>
                  {profile.role}
                </span>
                <span className={`badge badge-success`}>
                  {profile.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} />
                  <span className="text-sm">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} />
                  <span className="text-sm">{profile.phone}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} />
                    <span className="text-sm">{profile.location.name}</span>
                  </div>
                )}
                {profile.move_in_date && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span className="text-sm">Joined {format(new Date(profile.move_in_date), 'MMM dd, yyyy')}</span>
                  </div>
                )}
              </div>

              {/* Loyalty Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getTierColor(profile.loyalty_tier)}`}>
                <span className="text-2xl">{getTierEmoji(profile.loyalty_tier)}</span>
                <div>
                  <p className="text-sm font-medium">{profile.loyalty_tier} Tier</p>
                  <p className="text-xs">{profile.loyalty_points} points</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{paymentStats.verified}</p>
                <p className="text-xs text-gray-600">Payments Made</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{taskStats.completed}</p>
                <p className="text-xs text-gray-600">Tasks Done</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'personal'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User size={20} className="inline mr-2" />
              Personal
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'location'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapPin size={20} className="inline mr-2" />
              Location
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock size={20} className="inline mr-2" />
              History
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'achievements'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Award size={20} className="inline mr-2" />
              Achievements
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'personal' && (
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <p className="text-gray-600">
                  {profile.bio || 'No bio added yet. Tell others about yourself!'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <p className="text-gray-900">{profile.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <p className="text-gray-900">{profile.status}</p>
                </div>
              </div>

              <button className="btn-primary mt-4">
                <Edit size={16} className="mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Location Details</h2>
            
            {profile.location ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <MapPin size={32} className="text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{profile.location.name}</p>
                    <p className="text-sm text-gray-600">{profile.location.type}</p>
                  </div>
                </div>
                
                {profile.move_in_date && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Calendar size={32} className="text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Move-in Date</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(profile.move_in_date), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No location assigned yet</p>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment History</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="text-green-600" size={20} />
                    <span className="text-sm text-gray-700">Total Payments</span>
                  </div>
                  <span className="font-bold text-gray-900">{paymentStats.total}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="text-sm text-gray-700">Verified</span>
                  </div>
                  <span className="font-bold text-green-600">{paymentStats.verified}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="text-yellow-600" size={20} />
                    <span className="text-sm text-gray-700">Pending</span>
                  </div>
                  <span className="font-bold text-yellow-600">{paymentStats.pending}</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Task History</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="text-sm text-gray-700">Completed</span>
                  </div>
                  <span className="font-bold text-green-600">{taskStats.completed}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="text-yellow-600" size={20} />
                    <span className="text-sm text-gray-700">Pending</span>
                  </div>
                  <span className="font-bold text-yellow-600">{taskStats.pending}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Achievements</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Loyalty Points Achievement */}
              <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg text-center">
                <div className="text-6xl mb-3">{getTierEmoji(profile.loyalty_tier)}</div>
                <h3 className="font-bold text-gray-900 mb-1">{profile.loyalty_tier} Member</h3>
                <p className="text-2xl font-bold text-yellow-600 mb-1">{profile.loyalty_points}</p>
                <p className="text-sm text-gray-600">Loyalty Points</p>
              </div>

              {/* Payment Achievement */}
              {paymentStats.verified >= 10 && (
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center">
                  <div className="text-6xl mb-3">💰</div>
                  <h3 className="font-bold text-gray-900 mb-1">Reliable Payer</h3>
                  <p className="text-2xl font-bold text-green-600 mb-1">{paymentStats.verified}+</p>
                  <p className="text-sm text-gray-600">Verified Payments</p>
                </div>
              )}

              {/* Task Achievement */}
              {taskStats.completed >= 20 && (
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center">
                  <div className="text-6xl mb-3">⚡</div>
                  <h3 className="font-bold text-gray-900 mb-1">Task Master</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-1">{taskStats.completed}+</p>
                  <p className="text-sm text-gray-600">Tasks Completed</p>
                </div>
              )}

              {/* Early Bird Achievement */}
              {profile.move_in_date && new Date(profile.move_in_date) < new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) && (
                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg text-center">
                  <div className="text-6xl mb-3">🎖️</div>
                  <h3 className="font-bold text-gray-900 mb-1">Veteran Member</h3>
                  <p className="text-2xl font-bold text-purple-600 mb-1">6+ Months</p>
                  <p className="text-sm text-gray-600">In Apartment</p>
                </div>
              )}
            </div>

            {paymentStats.verified < 10 && taskStats.completed < 20 && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg text-center">
                <TrendingUp size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Complete more tasks and payments to unlock achievements!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

