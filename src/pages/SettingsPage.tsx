import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, 
  Lock, 
  Bell, 
  CreditCard, 
  Globe, 
  Shield,
  Mail,
  Phone,
  Camera,
  Save,
  LogOut
} from 'lucide-react'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'subscription'>('profile')
  const [loading, setLoading] = useState(false)
  const [memberData, setMemberData] = useState<any>(null)

  useEffect(() => {
    fetchMemberData()
  }, [])

  const fetchMemberData = async () => {
    try {
      const { data, error } = await supabase
        .from('apartment_members')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error) throw error
      setMemberData(data)
    } catch (error) {
      console.error('Error fetching member data:', error)
    }
  }

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut()
    }
  }

  return (
    <AppLayout>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="card p-4 space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User size={20} />
                Profile
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  activeTab === 'security'
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Lock size={20} />
                Security
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bell size={20} />
                Notifications
              </button>
              
              <button
                onClick={() => setActiveTab('subscription')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  activeTab === 'subscription'
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CreditCard size={20} />
                Subscription
              </button>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && <ProfileTab memberData={memberData} />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'subscription' && <SubscriptionTab />}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

// Profile Tab
function ProfileTab({ memberData }: { memberData: any }) {
  const [formData, setFormData] = useState({
    name: memberData?.name || '',
    email: memberData?.email || '',
    phone: memberData?.phone || '',
    bio: memberData?.bio || ''
  })

  const handleSave = async () => {
    alert('Profile update functionality will be implemented')
  }

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
        
        {/* Profile Photo */}
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
          <div className="relative">
            {memberData?.photo_url ? (
              <img
                src={memberData.photo_url}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={40} className="text-blue-600" />
              </div>
            )}
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50">
              <Camera size={16} className="text-gray-600" />
            </button>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{formData.name}</h3>
            <p className="text-sm text-gray-600">{memberData?.role || 'Member'}</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 mt-2">
              Change Photo
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="input"
              rows={4}
              placeholder="Tell others about yourself..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button className="btn-secondary">Cancel</button>
        <button onClick={handleSave} className="btn-primary">
          <Save size={16} className="mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  )
}

// Security Tab
function SecurityTab() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    alert('Password change functionality will be implemented')
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button className="btn-secondary">Cancel</button>
          <button onClick={handleChangePassword} className="btn-primary">
            Update Password
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Two-Factor Authentication</h2>
        <p className="text-gray-600 mb-4">
          Add an extra layer of security to your account
        </p>
        <button className="btn-primary">
          <Shield size={16} className="mr-2" />
          Enable 2FA
        </button>
      </div>
    </div>
  )
}

// Notifications Tab
function NotificationsTab() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    billReminders: true,
    mealUpdates: true,
    taskAssignments: true,
    pollNotifications: true,
    messageNotifications: true
  })

  const handleSave = () => {
    alert('Notification settings saved!')
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Channels</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Email Notifications</span>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Push Notifications</span>
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">SMS Notifications</span>
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Activity</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Bill Reminders</span>
              <input
                type="checkbox"
                checked={settings.billReminders}
                onChange={(e) => setSettings({ ...settings, billReminders: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Meal Updates</span>
              <input
                type="checkbox"
                checked={settings.mealUpdates}
                onChange={(e) => setSettings({ ...settings, mealUpdates: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Task Assignments</span>
              <input
                type="checkbox"
                checked={settings.taskAssignments}
                onChange={(e) => setSettings({ ...settings, taskAssignments: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Poll Notifications</span>
              <input
                type="checkbox"
                checked={settings.pollNotifications}
                onChange={(e) => setSettings({ ...settings, pollNotifications: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Message Notifications</span>
              <input
                type="checkbox"
                checked={settings.messageNotifications}
                onChange={(e) => setSettings({ ...settings, messageNotifications: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        <button className="btn-secondary">Reset to Default</button>
        <button onClick={handleSave} className="btn-primary">
          <Save size={16} className="mr-2" />
          Save Preferences
        </button>
      </div>
    </div>
  )
}

// Subscription Tab
function SubscriptionTab() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Plan</h2>
        
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
          <h3 className="text-2xl font-bold mb-2">Free Plan</h3>
          <p className="text-blue-100 mb-4">500MB Storage • Basic Features</p>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Storage Used</span>
              <span>120MB / 500MB</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div className="bg-white rounded-full h-2" style={{ width: '24%' }}></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Upgrade Options</h3>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">Premium Plan</h4>
                <p className="text-sm text-gray-600">2GB Storage • Advanced Features</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">$9.99<span className="text-sm font-normal text-gray-600">/mo</span></p>
            </div>
            <button className="btn-primary w-full mt-3">Upgrade Now</button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">Ad-Supported Plan</h4>
                <p className="text-sm text-gray-600">Watch 10 ads/day • Keep using for free</p>
              </div>
              <p className="text-2xl font-bold text-green-600">FREE</p>
            </div>
            <button className="btn-secondary w-full mt-3">Watch Ads</button>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Billing History</h2>
        <p className="text-gray-600 text-center py-8">No billing history yet</p>
      </div>
    </div>
  )
}

