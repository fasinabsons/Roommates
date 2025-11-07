import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { supabase } from '../../lib/supabase'
import { 
  UserCheck, 
  UserX, 
  Eye, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle,
  Clock,
  Search,
  Filter,
  Home
} from 'lucide-react'
import { format } from 'date-fns'

interface PendingMember {
  id: string
  user_id: string
  apartment_id: string
  full_name: string
  email: string
  phone: string
  emergency_contact_name: string
  emergency_contact_phone: string
  id_proof_url: string
  photo_url: string
  invite_code_used: string
  status: string
  requested_at: string
  notes: string
  user: {
    email: string
  }
  invite: {
    invite_code: string
    invite_type: string
  }
  location?: {
    id: string
    name: string
    type: string
  }
}

interface ModalState {
  isOpen: boolean
  member: PendingMember | null
  action: 'approve' | 'reject' | null
}

export default function MemberApprovalsPage() {
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('pending')
  const [modal, setModal] = useState<ModalState>({ isOpen: false, member: null, action: null })
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [availableLocations, setAvailableLocations] = useState<any[]>([])

  // Fetch pending members
  const fetchPendingMembers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          user:auth.users (email),
          invite:invites!members_invite_code_used_fkey (
            invite_code,
            invite_type
          ),
          location:locations (
            id,
            name,
            type
          )
        `)
        .in('status', filterStatus === 'all' ? ['pending', 'approved', 'rejected'] : [filterStatus])
        .order('requested_at', { ascending: false })

      if (error) throw error
      setPendingMembers(data || [])
    } catch (err: any) {
      console.error('Error fetching pending members:', err)
      alert('Failed to load pending members')
    } finally {
      setLoading(false)
    }
  }

  // Fetch available locations (beds)
  const fetchAvailableLocations = async (apartmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('apartment_id', apartmentId)
        .eq('type', 'bed')
        .is('occupied_by', null)
        .order('name')

      if (error) throw error
      setAvailableLocations(data || [])
    } catch (err: any) {
      console.error('Error fetching locations:', err)
      setAvailableLocations([])
    }
  }

  useEffect(() => {
    fetchPendingMembers()
  }, [filterStatus])

  // Open modal for approval/rejection
  const openModal = async (member: PendingMember, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      await fetchAvailableLocations(member.apartment_id)
      setSelectedLocation(member.location?.id || '')
    }
    setModal({ isOpen: true, member, action })
    setRejectionReason('')
  }

  // Close modal
  const closeModal = () => {
    setModal({ isOpen: false, member: null, action: null })
    setSelectedLocation('')
    setRejectionReason('')
  }

  // Approve member
  const handleApprove = async () => {
    if (!modal.member || !selectedLocation) {
      alert('Please select a bed location')
      return
    }

    setActionLoading(true)
    try {
      // Update member status
      const { error: memberError } = await supabase
        .from('members')
        .update({
          status: 'active',
          location_id: selectedLocation,
          approved_at: new Date().toISOString(),
        })
        .eq('id', modal.member.id)

      if (memberError) throw memberError

      // Update location occupancy
      const { error: locationError } = await supabase
        .from('locations')
        .update({
          occupied_by: modal.member.id,
        })
        .eq('id', selectedLocation)

      if (locationError) throw locationError

      // Increment invite usage
      if (modal.member.invite_code_used) {
        const { error: inviteError } = await supabase.rpc('increment_invite_usage', {
          code: modal.member.invite_code_used,
        })
        if (inviteError) console.error('Error updating invite usage:', inviteError)
      }

      // Send notification (optional - implement later)
      // await sendNotification(modal.member.user_id, 'Your membership has been approved!')

      alert(`${modal.member.full_name} has been approved!`)
      closeModal()
      fetchPendingMembers()
    } catch (err: any) {
      console.error('Error approving member:', err)
      alert('Failed to approve member: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Reject member
  const handleReject = async () => {
    if (!modal.member) return

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      alert('Please provide a reason for rejection')
      return
    }

    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('members')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          rejected_at: new Date().toISOString(),
        })
        .eq('id', modal.member.id)

      if (error) throw error

      // Send notification (optional - implement later)
      // await sendNotification(modal.member.user_id, `Your membership was not approved: ${rejectionReason}`)

      alert(`${modal.member.full_name} has been rejected.`)
      closeModal()
      fetchPendingMembers()
    } catch (err: any) {
      console.error('Error rejecting member:', err)
      alert('Failed to reject member: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Filter members by search term
  const filteredMembers = pendingMembers.filter((member) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      member.full_name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.phone.includes(searchTerm) ||
      (member.invite_code_used && member.invite_code_used.toLowerCase().includes(searchLower))
    )
  })

  return (
    <AppLayout>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="page-header">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Member Approvals</h1>
          <p className="text-gray-600">Review and approve new member requests</p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or invite code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input min-w-[150px]"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        {/* Pending Members List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner h-12 w-12"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="card text-center py-12">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No {filterStatus} members</h3>
            <p className="text-gray-600">
              {filterStatus === 'pending'
                ? 'All caught up! No pending approvals at the moment.'
                : `No ${filterStatus} members found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMembers.map((member) => (
              <div key={member.id} className="card">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Member Photo */}
                  <div className="flex-shrink-0">
                    <img
                      src={member.photo_url || 'https://via.placeholder.com/120'}
                      alt={member.full_name}
                      className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                    />
                  </div>

                  {/* Member Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{member.full_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`badge ${
                              member.status === 'pending'
                                ? 'badge-warning'
                                : member.status === 'approved'
                                ? 'badge-success'
                                : 'badge-danger'
                            }`}
                          >
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </span>
                          {member.invite_code_used && (
                            <span className="badge badge-purple">
                              Invite: {member.invite_code_used}
                            </span>
                          )}
                        </div>
                      </div>
                      {member.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(member, 'approve')}
                            className="btn btn-success btn-sm"
                          >
                            <UserCheck size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => openModal(member, 'reject')}
                            className="btn btn-danger btn-sm"
                          >
                            <UserX size={16} />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-gray-700">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-gray-700">{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-700">
                          Requested: {format(new Date(member.requested_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      {member.location && (
                        <div className="flex items-center gap-2">
                          <Home size={16} className="text-gray-400" />
                          <span className="text-gray-700">
                            Bed: {member.location.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Emergency Contact</p>
                      <p className="text-sm font-medium text-gray-900">{member.emergency_contact_name}</p>
                      <p className="text-sm text-gray-600">{member.emergency_contact_phone}</p>
                    </div>

                    {/* Documents */}
                    <div className="flex gap-3">
                      {member.photo_url && (
                        <a
                          href={member.photo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                        >
                          <Eye size={16} />
                          View Photo
                        </a>
                      )}
                      {member.id_proof_url && (
                        <a
                          href={member.id_proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                        >
                          <FileText size={16} />
                          View ID
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approval/Rejection Modal */}
        {modal.isOpen && modal.member && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {modal.action === 'approve' ? 'Approve Member' : 'Reject Member'}
              </h3>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  <strong>{modal.member.full_name}</strong>
                </p>
                <p className="text-sm text-gray-600">{modal.member.email}</p>
              </div>

              {modal.action === 'approve' ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    Assign Bed Location *
                  </label>
                  {availableLocations.length === 0 ? (
                    <p className="text-sm text-red-600">
                      No available beds. Please create bed locations first.
                    </p>
                  ) : (
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="input w-full"
                      required
                    >
                      <option value="">Select a bed...</option>
                      {availableLocations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.type})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="input w-full"
                    rows={4}
                    placeholder="Please provide a clear reason..."
                    required
                  ></textarea>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={modal.action === 'approve' ? handleApprove : handleReject}
                  disabled={actionLoading}
                  className={`btn ${
                    modal.action === 'approve' ? 'btn-success' : 'btn-danger'
                  } flex-1`}
                >
                  {actionLoading ? (
                    <div className="spinner h-5 w-5 border-white"></div>
                  ) : modal.action === 'approve' ? (
                    <>
                      <CheckCircle size={16} />
                      Confirm Approval
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      Confirm Rejection
                    </>
                  )}
                </button>
                <button onClick={closeModal} disabled={actionLoading} className="btn btn-ghost">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

