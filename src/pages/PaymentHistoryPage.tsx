import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Download,
  Filter,
  Search,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { format } from 'date-fns'

interface Payment {
  id: string
  bill_title: string
  amount: number
  payment_method: string
  payment_date: string
  status: 'pending' | 'verified' | 'rejected'
  transaction_reference: string
  created_at: string
}

export default function PaymentHistoryPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      
      // Get user's payments
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          payment_method,
          payment_date,
          status,
          transaction_reference,
          created_at,
          bill_splits!inner (
            bills!inner (
              title
            )
          )
        `)
        .eq('payer_member_id', user?.id)
        .order('payment_date', { ascending: false })

      if (error) throw error

      const transformedPayments = data?.map((payment: any) => ({
        ...payment,
        bill_title: payment.bill_splits?.bills?.title || 'Unknown Bill'
      })) || []

      setPayments(transformedPayments)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const totalPaid = payments
    .filter(p => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const verifiedCount = payments.filter(p => p.status === 'verified').length
  const pendingCount = payments.filter(p => p.status === 'pending').length

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.bill_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus
    
    let matchesMonth = true
    if (filterMonth !== 'all') {
      const paymentMonth = new Date(payment.payment_date).getMonth()
      matchesMonth = paymentMonth === parseInt(filterMonth)
    }
    
    return matchesSearch && matchesStatus && matchesMonth
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'badge-success'
      case 'pending': return 'badge-warning'
      case 'rejected': return 'badge-danger'
      default: return 'badge-secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle size={16} className="text-green-600" />
      case 'pending': return <Clock size={16} className="text-yellow-600" />
      case 'rejected': return <Clock size={16} className="text-red-600" />
      default: return <Clock size={16} className="text-gray-600" />
    }
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Bill', 'Amount', 'Method', 'Reference', 'Status']
    const rows = filteredPayments.map(p => [
      format(new Date(p.payment_date), 'yyyy-MM-dd'),
      p.bill_title,
      p.amount.toFixed(2),
      p.payment_method,
      p.transaction_reference || '-',
      p.status
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <AppLayout>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
            <p className="text-gray-600">Track all your payments and transactions</p>
          </div>
          <button onClick={exportToCSV} className="btn-secondary mt-4 md:mt-0">
            <Download size={20} className="mr-2" />
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-green-600" size={24} />
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Total Paid</p>
            <p className="text-3xl font-bold text-gray-900">${totalPaid.toFixed(2)}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-yellow-600" size={24} />
              <TrendingDown className="text-yellow-600" size={20} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Pending</p>
            <p className="text-3xl font-bold text-gray-900">${pendingAmount.toFixed(2)}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-blue-600" size={24} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Verified</p>
            <p className="text-3xl font-bold text-gray-900">{verifiedCount}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Total Payments</p>
            <p className="text-3xl font-bold text-gray-900">{payments.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                placeholder="Search payments..."
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input pl-10"
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="input pl-10"
              >
                <option value="all">All Months</option>
                <option value="0">January</option>
                <option value="1">February</option>
                <option value="2">March</option>
                <option value="3">April</option>
                <option value="4">May</option>
                <option value="5">June</option>
                <option value="6">July</option>
                <option value="7">August</option>
                <option value="8">September</option>
                <option value="9">October</option>
                <option value="10">November</option>
                <option value="11">December</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment History Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="spinner h-12 w-12"></div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="card p-12 text-center">
            <DollarSign size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No payment history found</p>
            <p className="text-sm text-gray-500">Your payments will appear here once you make them</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bill
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {payment.bill_title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.payment_method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                        {payment.transaction_reference || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          <span className={`badge ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

