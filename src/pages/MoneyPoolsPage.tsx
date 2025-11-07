import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { DollarSign, Users, Calendar, TrendingUp, Plus, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface MoneyPool {
  id: string
  pool_name: string
  contribution_amount: number
  total_months: number
  start_date: string
  status: string
  created_at: string
  my_position?: number
  my_payout_month?: string
  total_participants?: number
}

export default function MoneyPoolsPage() {
  const { user } = useAuth()
  const [pools, setPools] = useState<MoneyPool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPools()
  }, [])

  const fetchPools = async () => {
    try {
      setLoading(true)
      const { data: memberData } = await supabase
        .from('apartment_members')
        .select('apartment_id')
        .eq('user_id', user?.id)
        .single()

      if (!memberData) return

      const { data, error } = await supabase
        .from('money_pools')
        .select('*')
        .eq('apartment_id', memberData.apartment_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPools(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success'
      case 'completed': return 'badge-secondary'
      case 'pending': return 'badge-warning'
      default: return 'badge-primary'
    }
  }

  const activePools = pools.filter(p => p.status === 'active').length
  const totalContributions = pools.reduce((sum, p) => sum + p.contribution_amount, 0)

  return (
    <AppLayout>
      <div className="container-custom py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Money Pools</h1>
            <p className="text-gray-600">Collaborative savings and investment pools</p>
          </div>
          <button className="btn-primary">
            <Plus size={20} className="mr-2" />
            Create Pool
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <DollarSign className="text-green-600 mb-2" size={24} />
            <p className="text-3xl font-bold">{pools.length}</p>
            <p className="text-sm text-gray-600">Total Pools</p>
          </div>
          <div className="card p-6">
            <CheckCircle className="text-blue-600 mb-2" size={24} />
            <p className="text-3xl font-bold">{activePools}</p>
            <p className="text-sm text-gray-600">Active Pools</p>
          </div>
          <div className="card p-6">
            <TrendingUp className="text-purple-600 mb-2" size={24} />
            <p className="text-3xl font-bold">${totalContributions.toFixed(0)}</p>
            <p className="text-sm text-gray-600">Total Contributions</p>
          </div>
          <div className="card p-6">
            <Users className="text-orange-600 mb-2" size={24} />
            <p className="text-3xl font-bold">{pools.length > 0 ? pools[0].total_participants || 0 : 0}</p>
            <p className="text-sm text-gray-600">Participants</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner h-12 w-12"></div>
          </div>
        ) : pools.length === 0 ? (
          <div className="card p-12 text-center">
            <DollarSign size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No money pools yet</p>
            <button className="btn-primary">Create Your First Pool</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pools.map((pool) => (
              <div key={pool.id} className="card-hover p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{pool.pool_name}</h3>
                    <span className={`badge ${getStatusColor(pool.status)}`}>{pool.status}</span>
                  </div>
                  <DollarSign size={32} className="text-green-600" />
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Contribution Amount</span>
                    <span className="font-semibold text-gray-900">${pool.contribution_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Months</span>
                    <span className="font-semibold text-gray-900">{pool.total_months}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-semibold text-gray-900">
                      {format(new Date(pool.start_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  {pool.my_position && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Your Position</span>
                      <span className="font-semibold text-blue-600">#{pool.my_position}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="btn-secondary w-full">View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

