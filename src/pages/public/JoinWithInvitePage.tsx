import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Home, Users, MapPin, Calendar, CheckCircle, XCircle, ArrowRight, Scan } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

interface InviteDetails {
  id: string
  invite_code: string
  invite_type: string
  max_uses: number
  current_uses: number
  is_active: boolean
  expires_at: string | null
  apartment: {
    id: string
    name: string
    address: string
    member_count: number
  }
  location?: {
    name: string
    type: string
  }
}

export default function JoinWithInvitePage() {
  const { inviteCode } = useParams<{ inviteCode: string }>()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null)
  const [error, setError] = useState('')
  const [manualCode, setManualCode] = useState(inviteCode || '')
  const [showScanner, setShowScanner] = useState(false)
  const [scanning, setScanning] = useState(false)

  // Validate invite code
  const validateInvite = async (code: string) => {
    if (!code || code.trim().length === 0) {
      setError('Please enter an invite code')
      return
    }

    setValidating(true)
    setError('')

    try {
      // Fetch invite details with apartment and location info
      const { data: invite, error: inviteError } = await supabase
        .from('invites')
        .select(`
          *,
          apartment:apartments (
            id,
            name,
            address
          ),
          location:locations (
            name,
            type
          )
        `)
        .eq('invite_code', code.toUpperCase())
        .single()

      if (inviteError || !invite) {
        setError('Invalid invite code. Please check and try again.')
        setInviteDetails(null)
        return
      }

      // Check if invite is valid
      if (!invite.is_active) {
        setError('This invite has been disabled by the administrator.')
        setInviteDetails(null)
        return
      }

      // Check if invite has expired
      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        setError('This invite has expired.')
        setInviteDetails(null)
        return
      }

      // Check if invite has reached max uses
      if (invite.current_uses >= invite.max_uses) {
        setError('This invite has reached its maximum number of uses.')
        setInviteDetails(null)
        return
      }

      // Get member count
      const { count: memberCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('apartment_id', invite.apartment.id)
        .eq('status', 'active')

      // Set invite details
      setInviteDetails({
        id: invite.id,
        invite_code: invite.invite_code,
        invite_type: invite.invite_type,
        max_uses: invite.max_uses,
        current_uses: invite.current_uses,
        is_active: invite.is_active,
        expires_at: invite.expires_at,
        apartment: {
          ...invite.apartment,
          member_count: memberCount || 0,
        },
        location: invite.location,
      })
    } catch (err: any) {
      console.error('Error validating invite:', err)
      setError('An error occurred while validating the invite. Please try again.')
      setInviteDetails(null)
    } finally {
      setValidating(false)
    }
  }

  // Auto-validate if inviteCode is in URL
  useEffect(() => {
    if (inviteCode) {
      validateInvite(inviteCode)
    }
    setLoading(false)
  }, [inviteCode])

  // Handle QR code scanning
  const startScanning = async () => {
    setShowScanner(true)
    setScanning(true)
    setError('')

    try {
      const html5QrCode = new Html5Qrcode('qr-reader')
      
      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Stop scanning
          html5QrCode.stop().then(() => {
            setShowScanner(false)
            setScanning(false)
            
            // Extract invite code from URL if it's a full URL
            let code = decodedText
            if (decodedText.includes('/join/')) {
              code = decodedText.split('/join/')[1].split('?')[0]
            }
            
            setManualCode(code)
            validateInvite(code)
          })
        },
        (errorMessage) => {
          // Scanning failed, but continue
          console.log('QR scan error:', errorMessage)
        }
      )
    } catch (err: any) {
      console.error('Error starting scanner:', err)
      setError('Unable to access camera. Please enter the code manually.')
      setShowScanner(false)
      setScanning(false)
    }
  }

  const stopScanning = () => {
    const html5QrCode = new Html5Qrcode('qr-reader')
    html5QrCode.stop().then(() => {
      setShowScanner(false)
      setScanning(false)
    }).catch(console.error)
  }

  const handleProceedToRegister = () => {
    // Store invite code in session storage for registration
    sessionStorage.setItem('inviteCode', inviteDetails!.invite_code)
    sessionStorage.setItem('apartmentId', inviteDetails!.apartment.id)
    if (inviteDetails?.location) {
      sessionStorage.setItem('locationId', inviteDetails.location.name)
    }
    
    // Navigate to registration
    navigate('/register')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-block mb-4">
            <h1 className="text-5xl font-bold text-gradient">ZiberLive</h1>
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Join an Apartment
          </h2>
          <p className="text-gray-600">
            Enter your invite code or scan the QR code to join
          </p>
        </div>

        {/* Main Card */}
        <div className="card">
          {!inviteDetails ? (
            <>
              {/* Enter/Scan Invite Code */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invite Code
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      placeholder="Enter 6-8 character code"
                      className="input flex-1"
                      maxLength={20}
                      disabled={validating}
                    />
                    <button
                      onClick={() => validateInvite(manualCode)}
                      disabled={validating || !manualCode}
                      className="btn-primary px-6"
                    >
                      {validating ? (
                        <div className="spinner h-5 w-5 border-white"></div>
                      ) : (
                        'Verify'
                      )}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                {/* QR Scanner */}
                {!showScanner ? (
                  <button
                    onClick={startScanning}
                    className="btn-secondary w-full"
                    disabled={scanning}
                  >
                    <Scan size={20} />
                    Scan QR Code
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div
                      id="qr-reader"
                      className="rounded-lg overflow-hidden border-2 border-gray-300"
                    ></div>
                    <button
                      onClick={stopScanning}
                      className="btn-ghost w-full"
                    >
                      Cancel Scanning
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Valid Invite Details */}
              <div className="space-y-6">
                {/* Success Banner */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">Valid Invite Code!</p>
                    <p className="text-sm text-green-700">
                      You're invited to join this apartment community
                    </p>
                  </div>
                </div>

                {/* Apartment Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Home size={20} className="text-blue-600" />
                    Apartment Information
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Apartment Name</p>
                        <p className="font-semibold text-gray-900 text-lg">
                          {inviteDetails.apartment.name}
                        </p>
                      </div>
                      <div className="badge badge-success">Active</div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-gray-700">{inviteDetails.apartment.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Users size={16} className="text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Current Members</p>
                        <p className="text-gray-700">
                          {inviteDetails.apartment.member_count} active member
                          {inviteDetails.apartment.member_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {inviteDetails.location && (
                      <div className="flex items-start gap-2">
                        <Home size={16} className="text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Pre-assigned Bed</p>
                          <p className="text-gray-700">
                            {inviteDetails.location.name} ({inviteDetails.location.type})
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Invite Details */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Invite Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invite Code:</span>
                      <span className="font-mono font-semibold text-blue-600">
                        {inviteDetails.invite_code}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {inviteDetails.invite_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uses:</span>
                      <span className="font-medium text-gray-900">
                        {inviteDetails.current_uses} / {inviteDetails.max_uses}
                      </span>
                    </div>
                    {inviteDetails.expires_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expires:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(inviteDetails.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={handleProceedToRegister}
                    className="btn-primary w-full text-lg py-4"
                  >
                    Continue to Registration
                    <ArrowRight size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setInviteDetails(null)
                      setManualCode('')
                      setError('')
                    }}
                    className="btn-ghost"
                  >
                    Use Different Code
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Don't have an invite code?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Request to Join
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

