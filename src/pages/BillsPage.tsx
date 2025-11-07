import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  Plus, 
  DollarSign, 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Download,
  Filter,
  Search
} from 'lucide-react'
import { format } from 'date-fns'

interface Bill {
  id: string
  title: string
  category: string
  total_amount: number
  split_method: string
  due_date: string
  status: 'draft' | 'active' | 'partially_paid' | 'fully_paid' | 'overdue'
  created_by_name: string
  created_at: string
  my_share?: number
  my_payment_status?: 'pending' | 'paid' | 'overdue'
}

export default function BillsPage() {
  const { user } = useAuth()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      setLoading(true)
      
      // Get user's apartment
      const { data: memberData } = await supabase
        .from('apartment_members')
        .select('apartment_id')
        .eq('user_id', user?.id)
        .single()

      if (!memberData) return

      // Get all bills for the apartment
      const { data, error } = await supabase
        .from('bills')
        .select(`
          id,
          title,
          category,
          total_amount,
          split_method,
          due_date,
          status,
          created_at,
          created_by:apartment_members!bills_created_by_fkey (
            name
          )
        `)
        .eq('apartment_id', memberData.apartment_id)
        .order('due_date', { ascending: true })

      if (error) throw error

      // Transform data
      const transformedBills = data?.map((bill: any) => ({
        ...bill,
        created_by_name: bill.created_by?.name || 'Unknown',
        my_share: 0, // Will be calculated from bill_splits
        my_payment_status: 'pending' as const
      })) || []

      setBills(transformedBills)
    } catch (error) {
      console.error('Error fetching bills:', error)
    } finally {
      setLoading(false)
    }
  }

  // Statistics
  const totalBills = bills.length
  const activeBills = bills.filter(b => b.status === 'active' || b.status === 'partially_paid').length
  const myPendingAmount = bills.reduce((sum, bill) => {
    if (bill.my_payment_status === 'pending' || bill.my_payment_status === 'overdue') {
      return sum + (bill.my_share || 0)
    }
    return sum
  }, 0)
  const overdueBills = bills.filter(b => b.status === 'overdue').length

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || bill.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fully_paid': return 'badge-success'
      case 'active': return 'badge-primary'
      case 'partially_paid': return 'badge-warning'
      case 'overdue': return 'badge-danger'
      case 'draft': return 'badge-secondary'
      default: return 'badge-primary'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'rent': return '🏠'
      case 'utilities': return '⚡'
      case 'internet': return '📡'
      case 'groceries': return '🛒'
      case 'cleaning': return '🧹'
      case 'maintenance': return '🔧'
      default: return '💰'
    }
  }

  return (
    <AppLayout>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bills & Payments</h1>
            <p className="text-gray-600">Manage shared expenses and track payments</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary mt-4 md:mt-0"
          >
            <Plus size={20} className="mr-2" />
            Create Bill
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-blue-600" size={24} />
              <span className="text-sm text-gray-500">Total Bills</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalBills}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-yellow-600" size={24} />
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeBills}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-green-600" size={24} />
              <span className="text-sm text-gray-500">My Pending</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">${myPendingAmount.toFixed(2)}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="text-red-600" size={24} />
              <span className="text-sm text-gray-500">Overdue</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{overdueBills}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                placeholder="Search bills..."
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
                <option value="partially_paid">Partially Paid</option>
                <option value="fully_paid">Fully Paid</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bills List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="spinner h-12 w-12"></div>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="card p-12 text-center">
            <DollarSign size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No bills found</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create Your First Bill
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBills.map((bill) => (
              <div key={bill.id} className="card-hover p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Bill Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">{getCategoryIcon(bill.category)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 truncate">
                          {bill.title}
                        </h3>
                        <span className={`badge ${getStatusColor(bill.status)}`}>
                          {bill.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} />
                          <span className="font-semibold">${bill.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>Due: {format(new Date(bill.due_date), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          <span>{bill.split_method.replace('_', ' ')}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mt-2">
                        Created by {bill.created_by_name} on {format(new Date(bill.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* My Share & Actions */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    {bill.my_share && bill.my_share > 0 && (
                      <div className="text-center px-4 py-2 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">My Share</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${bill.my_share.toFixed(2)}
                        </p>
                        {bill.my_payment_status === 'paid' ? (
                          <CheckCircle size={16} className="text-green-600 mx-auto mt-1" />
                        ) : (
                          <Clock size={16} className="text-yellow-600 mx-auto mt-1" />
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button className="btn-secondary text-sm">View Details</button>
                      {bill.my_payment_status === 'pending' && (
                        <button className="btn-primary text-sm">Pay Now</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Bill Modal */}
        {showCreateModal && (
          <CreateBillModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false)
              fetchBills()
            }}
          />
        )}
      </div>
    </AppLayout>
  )
}

// Create Bill Modal Component
function CreateBillModal({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void
  onSuccess: () => void
}) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: 'utilities',
    total_amount: '',
    split_method: 'equal',
    due_date: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get user's apartment
      const { data: memberData } = await supabase
        .from('apartment_members')
        .select('apartment_id')
        .eq('user_id', user?.id)
        .single()

      if (!memberData) {
        alert('You are not part of any apartment')
        return
      }

      // Create bill
      const { error } = await supabase
        .from('bills')
        .insert({
          apartment_id: memberData.apartment_id,
          title: formData.title,
          category: formData.category,
          total_amount: parseFloat(formData.total_amount),
          split_method: formData.split_method,
          due_date: formData.due_date,
          description: formData.description,
          created_by: user?.id,
          status: 'active'
        })

      if (error) throw error

      alert('Bill created successfully!')
      onSuccess()
    } catch (error) {
      console.error('Error creating bill:', error)
      alert('Failed to create bill')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Bill</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bill Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="e.g., Electricity Bill - January"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
                required
              >
                <option value="rent">Rent</option>
                <option value="utilities">Utilities</option>
                <option value="internet">Internet</option>
                <option value="groceries">Groceries</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                className="input"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Split Method *
              </label>
              <select
                value={formData.split_method}
                onChange={(e) => setFormData({ ...formData, split_method: e.target.value })}
                className="input"
                required
              >
                <option value="equal">Equal Split</option>
                <option value="by_percentage">By Percentage</option>
                <option value="by_amount">By Amount</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
              placeholder="Add any additional details..."
            />
          </div>

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
              {loading ? 'Creating...' : 'Create Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

