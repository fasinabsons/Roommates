import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Phone, MapPin, Award, Calendar, Search, Filter } from 'lucide-react'

interface Member {
  id: string
  name: string
  email: string
  phone: string
  photo_url: string | null
  role: 'admin' | 'member' | 'guest'
  status: 'pending' | 'active' | 'inactive' | 'suspended' | 'moved_out'
  loyalty_points: number
  loyalty_tier: string
  move_in_date: string | null
  location_id: string | null
  locations?: {
    name: string
    type: string
  }
}

export default function MembersPage() {
  const { user } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      
      // Get user's apartment
      const { data: memberData } = await supabase
        .from('apartment_members')
        .select('apartment_id')
        .eq('user_id', user?.id)
        .single()

      if (!memberData) return

      // Get all members in the apartment
      const { data, error } = await supabase
        .from('apartment_members')
        .select(`
          id,
          name,
          email,
          phone,
          photo_url,
          role,
          status,
          loyalty_points,
          loyalty_tier,
          move_in_date,
          location_id,
          locations (
            name,
            type
          )
        `)
        .eq('apartment_id', memberData.apartment_id)
        .order('loyalty_points', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus
    const matchesRole = filterRole === 'all' || member.role === filterRole
    return matchesSearch && matchesStatus && matchesRole
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success'
      case 'pending': return 'badge-warning'
      case 'inactive': return 'badge-danger'
      case 'suspended': return 'badge-danger'
      case 'moved_out': return 'badge-danger'
      default: return 'badge-primary'
    }
  }

  const getTierEmoji = (tier: string) => {
    switch (tier) {
      case 'platinum': return '💎'
      case 'gold': return '🥇'
      case 'silver': return '🥈'
      case 'bronze': return '🥉'
      default: return '⭐'
    }
  }

  return (
    <AppLayout>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Members</h1>
          <p className="text-gray-600">View and manage apartment members</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card flex items-center p-4">
            <User size={24} className="text-blue-600 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
          </div>
          <div className="card flex items-center p-4">
            <User size={24} className="text-green-600 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.status === 'active').length}
              </p>
            </div>
          </div>
          <div className="card flex items-center p-4">
            <User size={24} className="text-yellow-600 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.status === 'pending').length}
              </p>
            </div>
          </div>
          <div className="card flex items-center p-4">
            <Award size={24} className="text-purple-600 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Avg. Loyalty</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.length > 0 ? Math.round(members.reduce((sum, m) => sum + m.loyalty_points, 0) / members.length) : 0} pts
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                placeholder="Search by name or email..."
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input pl-10"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="moved_out">Moved Out</option>
              </select>
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="input pl-10"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="guest">Guest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="spinner h-12 w-12"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="card p-12 text-center">
            <User size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No members found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div key={member.id} className="card-hover p-6">
                {/* Member Header */}
                <div className="flex items-start gap-4 mb-4">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={32} className="text-blue-600" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {member.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                      {member.role === 'admin' && (
                        <span className="badge badge-purple">Admin</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Member Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} className="flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="flex-shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                  {member.locations && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="flex-shrink-0" />
                      <span className="truncate">{member.locations.name}</span>
                    </div>
                  )}
                  {member.move_in_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} className="flex-shrink-0" />
                      <span>Joined {new Date(member.move_in_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Loyalty Points */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {member.loyalty_points} points
                      </span>
                    </div>
                    <span className="text-lg">
                      {getTierEmoji(member.loyalty_tier)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

