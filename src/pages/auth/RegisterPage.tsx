import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowRight, ArrowLeft, Upload, Camera, CheckCircle } from 'lucide-react'
import { uploadToCloudinary } from '../../lib/cloudinary'
import { supabase } from '../../lib/supabase'

type RegistrationStep = 1 | 2 | 3 | 4

interface FormData {
  // Step 1: Basic Info
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  dateOfBirth: string
  
  // Step 2: Documents
  photoUrl: string
  identityCardUrl: string
  cvUrl: string
  laborCardUrl: string
  
  // Step 3: Emergency Contact
  emergencyName: string
  emergencyRelationship: string
  emergencyPhone: string
  emergencyEmail: string
  
  // Step 4: Invite
  inviteCode: string
  inviteMethod: 'code' | 'qr' | 'later'
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    photoUrl: '',
    identityCardUrl: '',
    cvUrl: '',
    laborCardUrl: '',
    emergencyName: '',
    emergencyRelationship: 'parent',
    emergencyPhone: '',
    emergencyEmail: '',
    inviteCode: '',
    inviteMethod: 'code'
  })

  const handleUpload = async (file: File, fieldName: keyof FormData) => {
    setUploadingDoc(fieldName)
    try {
      const url = await uploadToCloudinary(file, 'ziberlive_documents')
      setFormData(prev => ({ ...prev, [fieldName]: url }))
    } catch (err) {
      setError('Failed to upload file. Please try again.')
    } finally {
      setUploadingDoc(null)
    }
  }

  const validateStep = (step: RegistrationStep): boolean => {
    setError('')
    
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        setError('Please fill in all required fields')
        return false
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
      if (!formData.dateOfBirth) {
        setError('Please enter your date of birth')
        return false
      }
    }
    
    if (step === 2) {
      if (!formData.photoUrl) {
        setError('Profile photo is required')
        return false
      }
      if (!formData.identityCardUrl) {
        setError('Identity card is required')
        return false
      }
    }
    
    if (step === 3) {
      if (!formData.emergencyName || !formData.emergencyPhone) {
        setError('Emergency contact information is required')
        return false
      }
    }
    
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4) as RegistrationStep)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as RegistrationStep)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(currentStep)) return
    
    setLoading(true)
    setError('')

    try {
      // 1. Create auth user
      const { data, error: signUpError } = await signUp(formData.email, formData.password)
      
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (!data.user) {
        setError('Failed to create account')
        setLoading(false)
        return
      }

      // 2. Validate invite code if provided
      let apartmentId = null
      let locationId = null
      
      if (formData.inviteCode && formData.inviteMethod !== 'later') {
        const { data: inviteData, error: inviteError } = await supabase
          .from('apartment_invites')
          .select('*, apartments(*)')
          .eq('invite_code', formData.inviteCode)
          .eq('is_active', true)
          .single()

        if (inviteError || !inviteData) {
          setError('Invalid or expired invite code')
          setLoading(false)
          return
        }

        // Check expiration
        if (inviteData.expires_at && new Date(inviteData.expires_at) < new Date()) {
          setError('Invite code has expired')
          setLoading(false)
          return
        }

        // Check usage limit
        if (inviteData.max_uses && inviteData.current_uses >= inviteData.max_uses) {
          setError('Invite code has reached maximum usage')
          setLoading(false)
          return
        }

        apartmentId = inviteData.apartment_id
        locationId = inviteData.location_id
      }

      // 3. Create apartment_member record (status: pending for admin approval)
      if (apartmentId) {
        const { error: memberError } = await supabase
          .from('apartment_members')
          .insert({
            apartment_id: apartmentId,
            user_id: data.user.id,
            location_id: locationId,
            role: 'member',
            status: 'pending',
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            photo_url: formData.photoUrl,
            identity_card_url: formData.identityCardUrl,
            cv_url: formData.cvUrl,
            labor_card_url: formData.laborCardUrl,
            emergency_contact: {
              name: formData.emergencyName,
              relationship: formData.emergencyRelationship,
              phone: formData.emergencyPhone,
              email: formData.emergencyEmail
            },
            opt_ins: {
              community_meals: false,
              drinking_water: false,
              meal_types: []
            }
          })

        if (memberError) {
          console.error('Error creating member:', memberError)
          setError('Failed to complete registration')
          setLoading(false)
          return
        }

        // Update invite usage count
        if (formData.inviteCode) {
          await supabase
            .from('apartment_invites')
            .update({ current_uses: supabase.rpc('increment', { current_uses: 1 }) })
            .eq('invite_code', formData.inviteCode)
        }
      }

      // 4. Redirect to approval pending page
      navigate('/approval-pending')
      
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="card w-full max-w-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">Create Account</h1>
          <p className="text-gray-600">Step {currentStep} of 4</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="input"
                  placeholder="+91 9876543210"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="input"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="input"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Identity Verification</h2>
              
              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo * {formData.photoUrl && <CheckCircle className="inline w-5 h-5 text-green-500 ml-2" />}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {formData.photoUrl ? (
                    <div>
                      <img src={formData.photoUrl} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload or take a photo</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'photoUrl')}
                        className="hidden"
                        id="photo-upload"
                        disabled={uploadingDoc === 'photoUrl'}
                      />
                      <label htmlFor="photo-upload" className="btn-primary cursor-pointer inline-flex">
                        {uploadingDoc === 'photoUrl' ? <span className="spinner border-white"></span> : <><Upload className="w-4 h-4" /> Upload Photo</>}
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Identity Card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identity Card/Government ID * {formData.identityCardUrl && <CheckCircle className="inline w-5 h-5 text-green-500 ml-2" />}
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'identityCardUrl')}
                  className="input"
                  disabled={uploadingDoc === 'identityCardUrl'}
                />
                <p className="text-xs text-gray-500 mt-1">Passport, Driving License, or Aadhaar</p>
              </div>

              {/* Optional Documents */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume/CV (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'cvUrl')}
                  className="input"
                  disabled={uploadingDoc === 'cvUrl'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Labor Card (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'laborCardUrl')}
                  className="input"
                  disabled={uploadingDoc === 'laborCardUrl'}
                />
              </div>
            </div>
          )}

          {/* Step 3: Emergency Contact */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Emergency Contact</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyName: e.target.value }))}
                  className="input"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship *
                </label>
                <select
                  value={formData.emergencyRelationship}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyRelationship: e.target.value }))}
                  className="input"
                  required
                >
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="spouse">Spouse</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                  className="input"
                  placeholder="+91 9876543211"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.emergencyEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyEmail: e.target.value }))}
                  className="input"
                  placeholder="jane.doe@example.com"
                />
              </div>
            </div>
          )}

          {/* Step 4: Invite Code */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Join Apartment</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How are you joining?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="code"
                      checked={formData.inviteMethod === 'code'}
                      onChange={(e) => setFormData(prev => ({ ...prev, inviteMethod: e.target.value as 'code' }))}
                      className="mr-2"
                    />
                    <span>I have an invite code</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="qr"
                      checked={formData.inviteMethod === 'qr'}
                      onChange={(e) => setFormData(prev => ({ ...prev, inviteMethod: e.target.value as 'qr' }))}
                      className="mr-2"
                    />
                    <span>I'll scan a QR code</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="later"
                      checked={formData.inviteMethod === 'later'}
                      onChange={(e) => setFormData(prev => ({ ...prev, inviteMethod: e.target.value as 'later' }))}
                      className="mr-2"
                    />
                    <span>I'll join later</span>
                  </label>
                </div>
              </div>

              {formData.inviteMethod === 'code' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter Invite Code
                  </label>
                  <input
                    type="text"
                    value={formData.inviteCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, inviteCode: e.target.value.toUpperCase() }))}
                    className="input"
                    placeholder="ZIBER-APT-2025-ABC"
                  />
                </div>
              )}

              {formData.inviteMethod === 'qr' && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">QR Scanner (Coming Soon)</p>
                  <p className="text-xs text-gray-500">For now, please use invite code method</p>
                </div>
              )}

              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 mt-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    required
                    className="mr-2 mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to ZiberLive's <a href="/terms" className="text-blue-600 underline">Terms & Conditions</a> and <a href="/privacy" className="text-blue-600 underline">Privacy Policy</a>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn-secondary"
                disabled={loading}
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary ml-auto"
                disabled={loading || uploadingDoc !== null}
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary ml-auto"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner border-white"></span>
                ) : (
                  <>Complete Registration <CheckCircle className="w-5 h-5" /></>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

