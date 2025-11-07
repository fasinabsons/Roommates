import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Copy, QrCode as QrCodeIcon, Link as LinkIcon, CheckCircle, XCircle, Calendar, Users } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface Invite {
  id: string
  invite_code: string
  invite_type: 'general' | 'single_use' | 'limited'
  max_uses: number
  current_uses: number
  expires_at: string | null
  is_active: boolean
  created_at: string
  location_id: string | null
  locations?: {
    name: string
  }
}

export default function InviteManagementPage() {
  const { user } = useAuth()
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null)
  const [apartmentId, setApartmentId] = useState<string | null>(null)

  useEffect(() => {
    loadApartmentAndInvites()
  }, [user])

  const loadApartmentAndInvites = async () => {
    if (!user) return

    try {
      // Get user's apartment
      const { data: memberData } = await supabase
        .from('members')
        .select('apartment_id, role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single()

      if (!memberData) {
        setLoading(false)
        return
      }

      setApartmentId(memberData.apartment_id)

      // Load invites
      await loadInvites(memberData.apartment_id)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadInvites = async (aptId: string) => {
    const { data, error } = await supabase
      .from('invites')
      .select(`
        *,
        locations (
          name
        )
      `)
      .eq('apartment_id', aptId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading invites:', error)
      return
    }

    setInvites(data || [])
  }

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const segments = [4, 3, 3] // XXXX-XXX-XXX format
    return segments.map(len => 
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    ).join('-')
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getInviteLink = (code: string) => {
    return `${window.location.origin}/join/${code}`
  }

  const toggleInviteStatus = async (invite: Invite) => {
    const { error } = await supabase
      .from('invites')
      .update({ is_active: !invite.is_active })
      .eq('id', invite.id)

    if (error) {
      console.error('Error updating invite:', error)
      return
    }

    // Reload invites
    if (apartmentId) {
      await loadInvites(apartmentId)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12 border-blue-600"></div>
      </div>
    )
  }

  if (!apartmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600">You need to be an admin to manage invites.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invite Management</h1>
          <p className="text-gray-600">Generate and manage invitation links, codes, and QR codes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Invites</p>
                <p className="text-2xl font-bold text-gray-900">{invites.length}</p>
              </div>
              <LinkIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Invites</p>
                <p className="text-2xl font-bold text-green-600">
                  {invites.filter(i => i.is_active).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Uses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {invites.reduce((sum, i) => sum + i.current_uses, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" /> Create New Invite
          </button>
        </div>

        {/* Invites List */}
        <div className="space-y-4">
          {invites.length === 0 ? (
            <div className="card p-8 text-center">
              <LinkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invites Yet</h3>
              <p className="text-gray-600 mb-4">Create your first invite to start inviting members</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <Plus className="w-5 h-5" /> Create Invite
              </button>
            </div>
          ) : (
            invites.map((invite) => (
              <div
                key={invite.id}
                className={`card p-6 ${!invite.is_active ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left: Invite Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <code className="text-xl font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded">
                        {invite.invite_code}
                      </code>
                      {invite.is_active ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-danger">Disabled</span>
                      )}
                      <span className="badge badge-primary capitalize">{invite.invite_type}</span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Uses</p>
                        <p className="font-semibold text-gray-900">
                          {invite.current_uses} / {invite.max_uses || '∞'}
                        </p>
                      </div>
                      {invite.expires_at && (
                        <div>
                          <p className="text-gray-500">Expires</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(invite.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {invite.locations && (
                        <div>
                          <p className="text-gray-500">Pre-assigned Bed</p>
                          <p className="font-semibold text-gray-900">{invite.locations.name}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(invite.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => copyToClipboard(invite.invite_code)}
                      className="btn-secondary btn-sm"
                      title="Copy Code"
                    >
                      <Copy className="w-4 h-4" /> Copy Code
                    </button>
                    <button
                      onClick={() => copyToClipboard(getInviteLink(invite.invite_code))}
                      className="btn-secondary btn-sm"
                      title="Copy Link"
                    >
                      <LinkIcon className="w-4 h-4" /> Copy Link
                    </button>
                    <button
                      onClick={() => {
                        setSelectedInvite(invite)
                        setShowQRModal(true)
                      }}
                      className="btn-secondary btn-sm"
                      title="Show QR Code"
                    >
                      <QrCode className="w-4 h-4" /> QR Code
                    </button>
                    <button
                      onClick={() => toggleInviteStatus(invite)}
                      className={invite.is_active ? 'btn-danger btn-sm' : 'btn-success btn-sm'}
                    >
                      {invite.is_active ? (
                        <><XCircle className="w-4 h-4" /> Disable</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" /> Enable</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Invite Modal */}
        {showCreateModal && (
          <CreateInviteModal
            apartmentId={apartmentId}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false)
              if (apartmentId) loadInvites(apartmentId)
            }}
          />
        )}

        {/* QR Code Modal */}
        {showQRModal && selectedInvite && (
          <QRCodeModal
            invite={selectedInvite}
            onClose={() => {
              setShowQRModal(false)
              setSelectedInvite(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

// Create Invite Modal Component
function CreateInviteModal({ 
  apartmentId, 
  onClose, 
  onSuccess 
}: { 
  apartmentId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const { user } = useAuth()
  const [inviteCode, setInviteCode] = useState('')
  const [inviteType, setInviteType] = useState<'general' | 'single_use' | 'limited'>('general')
  const [maxUses, setMaxUses] = useState(10)
  const [expiryDays, setExpiryDays] = useState(30)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setInviteCode(generateInviteCode())
  }, [])

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const segments = [4, 3, 3]
    return segments.map(len => 
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    ).join('-')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiryDays)

      const { error } = await supabase
        .from('invites')
        .insert({
          apartment_id: apartmentId,
          invite_code: inviteCode,
          invite_type: inviteType,
          max_uses: inviteType === 'single_use' ? 1 : inviteType === 'limited' ? maxUses : null,
          expires_at: expiresAt.toISOString(),
          created_by: user?.id,
          is_active: true
        })

      if (error) throw error

      onSuccess()
    } catch (err: any) {
      alert('Error creating invite: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-lg w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Invite</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Invite Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Invite Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="input flex-1 font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setInviteCode(generateInviteCode())}
                className="btn-secondary"
              >
                Regenerate
              </button>
            </div>
          </div>

          {/* Invite Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Invite Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="general"
                  checked={inviteType === 'general'}
                  onChange={(e) => setInviteType(e.target.value as any)}
                  className="mr-2"
                />
                <span>General (Unlimited uses within expiry)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="single_use"
                  checked={inviteType === 'single_use'}
                  onChange={(e) => setInviteType(e.target.value as any)}
                  className="mr-2"
                />
                <span>Single Use (One person only)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="limited"
                  checked={inviteType === 'limited'}
                  onChange={(e) => setInviteType(e.target.value as any)}
                  className="mr-2"
                />
                <span>Limited (Set maximum uses)</span>
              </label>
            </div>
          </div>

          {/* Max Uses (if limited) */}
          {inviteType === 'limited' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Maximum Uses
              </label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(parseInt(e.target.value))}
                className="input"
                min="1"
                max="100"
                required
              />
            </div>
          )}

          {/* Expiry */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expires In (Days)
            </label>
            <input
              type="number"
              value={expiryDays}
              onChange={(e) => setExpiryDays(parseInt(e.target.value))}
              className="input"
              min="1"
              max="365"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Expires on: {new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? <span className="spinner border-white"></span> : 'Create Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// QR Code Modal Component
function QRCodeModal({ 
  invite, 
  onClose 
}: { 
  invite: Invite
  onClose: () => void
}) {
  const inviteLink = `${window.location.origin}/join/${invite.invite_code}`

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement
    if (canvas) {
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `invite-${invite.invite_code}.png`
      link.href = url
      link.click()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">QR Code</h2>
        
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200 mb-4 inline-block">
          <QRCodeSVG
            id="qr-code-canvas"
            value={inviteLink}
            size={256}
            level="H"
            includeMargin={true}
          />
        </div>

        <code className="block text-lg font-mono font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded mb-2">
          {invite.invite_code}
        </code>

        <p className="text-sm text-gray-600 mb-6">
          Scan this QR code to join the apartment
        </p>

        <div className="flex gap-3">
          <button onClick={downloadQR} className="btn-primary flex-1">
            Download QR Code
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

