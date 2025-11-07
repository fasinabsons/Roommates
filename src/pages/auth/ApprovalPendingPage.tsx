import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Clock, CheckCircle, HelpCircle, Mail, Phone, LogOut } from 'lucide-react'

interface MemberStatus {
  status: string
  name: string
  apartmentName: string
  createdAt: string
  adminName?: string
  adminEmail?: string
}

export default function ApprovalPendingPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [memberStatus, setMemberStatus] = useState<MemberStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkMemberStatus = async () => {
      if (!user) {
        navigate('/login')
        return
      }

      try {
        const { data, error } = await supabase
          .from('apartment_members')
          .select(`
            status,
            name,
            created_at,
            apartments (
              name
            )
          `)
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Error fetching member status:', error)
          setLoading(false)
          return
        }

        if (data.status === 'active') {
          // User has been approved, redirect to dashboard
          navigate('/dashboard')
          return
        }

        setMemberStatus({
          status: data.status,
          name: data.name,
          apartmentName: (data.apartments as any)?.name || 'Unknown Apartment',
          createdAt: data.created_at
        })
        
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    checkMemberStatus()

    // Poll every 10 seconds to check if approved
    const interval = setInterval(checkMemberStatus, 10000)
    return () => clearInterval(interval)
  }, [user, navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="spinner h-12 w-12 border-blue-600"></div>
      </div>
    )
  }

  if (!memberStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <div className="card max-w-md w-full p-8 text-center">
          <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Application Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your membership application. Please register again.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="btn-primary"
          >
            Register Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="card max-w-2xl w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-4">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Approval Pending</h1>
          <p className="text-lg text-gray-600">
            Thank you for registering, {memberStatus.name}!
          </p>
        </div>

        {/* Application Status Card */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Status</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Application Submitted</p>
                <p className="text-sm text-gray-600">
                  {new Date(memberStatus.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Documents Uploaded</p>
                <p className="text-sm text-gray-600">All required documents received</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-yellow-500 mt-0.5 flex-shrink-0 animate-pulse" />
              <div>
                <p className="font-semibold text-gray-900">Admin Reviewing...</p>
                <p className="text-sm text-gray-600">Your application is under review</p>
              </div>
            </div>
          </div>
        </div>

        {/* Apartment Info */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Apartment Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Apartment</p>
              <p className="font-semibold text-gray-900">{memberStatus.apartmentName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold text-yellow-600 capitalize">{memberStatus.status}</p>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">What Happens Next?</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
              <span>You'll receive an email notification when your application is reviewed</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
              <span>Once approved, you'll have full access to the dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
              <span>The admin may contact you if additional information is needed</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/register')}
            className="btn-secondary flex-1"
          >
            Edit Application
          </button>
          <button
            onClick={handleSignOut}
            className="btn-ghost flex-1"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            This page will automatically refresh when your status changes.
          </p>
        </div>
      </div>
    </div>
  )
}

