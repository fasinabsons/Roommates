import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Users, Search, Filter, Edit, Trash2, Award, Ban, CheckCircle } from 'lucide-react'

interface Member {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
  loyalty_points: number
  loyalty_tier: string
  photo_url: string | null
  move_in_date: string
  location_id: string | null
  locations?: { name: string }
}

export default function UserManagementPage() {
  const { user } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const { data: memberData } = await supabase
        .from('apartment_members')
        .select('apartment_id')
        .eq('user_id', user?.id)
        .single()

      if (!memberData) return

      const { data, error } = await supabase
        .from('apartment_members')
        .select(`*, locations(name)`)
        .eq('apartment_id', memberData.apartment_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('apartment_members')
        .update({ role: newRole })
        .eq('id', memberId)

      if (error) throw error
      fetchMembers()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const updateStatus = async (memberId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('apartment_members')
        .update({ status: newStatus })
        .eq('id', memberId)

      if (error) throw error
      fetchMembers()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus
    const matchesRole = filterRole === 'all' || member.role === filterRole
    return matchesSearch && matchesStatus && matchesRole
  })

  return (
    <AppLayout>
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage apartment members and permissions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <Users className="text-blue-600 mb-2" size={24} />
            <p className="text-3xl font-bold">{members.length}</p>
            <p className="text-sm text-gray-600">Total Members</p>
          </div>
          <div className="card p-6">
            <CheckCircle className="text-green-600 mb-2" size={24} />
            <p className="text-3xl font-bold">{members.filter(m => m.status === 'active').length}</p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="card p-6">
            <Award className="text-purple-600 mb-2" size={24} />
            <p className="text-3xl font-bold">{members.filter(m => m.role === 'admin').length}</p>
            <p className="text-sm text-gray-600">Admins</p>
          </div>
          <div className="card p-6">
            <Ban className="text-yellow-600 mb-2" size={24} />
            <p className="text-3xl font-bold">{members.filter(m => m.status === 'pending').length}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>

        <div className="card p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                placeholder="Search members..."
              />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="input">
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="guest">Guest</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner h-12 w-12"></div>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loyalty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {member.photo_url ? (
                          <img src={member.photo_url} alt={member.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users size={20} className="text-blue-600" />
                          </div>
                        )}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          {member.locations && (
                            <p className="text-xs text-gray-500">{member.locations.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{member.email}</p>
                      <p className="text-xs text-gray-500">{member.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={member.role}
                        onChange={(e) => updateRole(member.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="guest">Guest</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={member.status}
                        onChange={(e) => updateStatus(member.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-yellow-500" />
                        <span>{member.loyalty_points} pts</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-700">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

