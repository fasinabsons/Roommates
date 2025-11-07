import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Vote, CheckCircle, Clock, TrendingUp, BarChart3, Users, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface Poll {
  id: string
  title: string
  description: string
  poll_type: 'simple' | 'multiple_choice' | 'ranked' | 'budget'
  status: 'draft' | 'active' | 'closed' | 'cancelled'
  start_date: string
  end_date: string
  created_by_name: string
  created_at: string
  total_votes?: number
  has_voted?: boolean
  options?: PollOption[]
}

interface PollOption {
  id: string
  option_text: string
  vote_count: number
}

export default function VotingPage() {
  const { user } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('active')

  useEffect(() => {
    fetchPolls()
  }, [filterStatus])

  const fetchPolls = async () => {
    try {
      setLoading(true)
      
      const { data: memberData } = await supabase
        .from('apartment_members')
        .select('apartment_id')
        .eq('user_id', user?.id)
        .single()

      if (!memberData) return

      let query = supabase
        .from('polls')
        .select(`
          id,
          title,
          description,
          poll_type,
          status,
          start_date,
          end_date,
          created_at,
          created_by:apartment_members!polls_created_by_fkey (
            name
          )
        `)
        .eq('apartment_id', memberData.apartment_id)

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      const transformedPolls = data?.map((poll: any) => ({
        ...poll,
        created_by_name: poll.created_by?.name || 'Unknown',
        total_votes: 0,
        has_voted: false
      })) || []

      setPolls(transformedPolls)
    } catch (error) {
      console.error('Error fetching polls:', error)
    } finally {
      setLoading(false)
    }
  }

  const activePolls = polls.filter(p => p.status === 'active').length
  const myVotes = polls.filter(p => p.has_voted).length
  const closedPolls = polls.filter(p => p.status === 'closed').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success'
      case 'closed': return 'badge-secondary'
      case 'draft': return 'badge-warning'
      case 'cancelled': return 'badge-danger'
      default: return 'badge-primary'
    }
  }

  const getPollTypeIcon = (type: string) => {
    switch (type) {
      case 'simple': return '👍'
      case 'multiple_choice': return '☑️'
      case 'ranked': return '📊'
      case 'budget': return '💰'
      default: return '🗳️'
    }
  }

  return (
    <AppLayout>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Voting & Polls</h1>
            <p className="text-gray-600">Make decisions together democratically</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary mt-4 md:mt-0"
          >
            <Plus size={20} className="mr-2" />
            Create Poll
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <Vote className="text-blue-600" size={24} />
              <span className="text-sm text-gray-500">Total Polls</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{polls.length}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-green-600" size={24} />
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{activePolls}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-purple-600" size={24} />
              <span className="text-sm text-gray-500">My Votes</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{myVotes}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="text-gray-600" size={24} />
              <span className="text-sm text-gray-500">Closed</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{closedPolls}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="card mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {['active', 'closed', 'draft', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-3 font-medium whitespace-nowrap ${
                  filterStatus === status
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} Polls
              </button>
            ))}
          </div>
        </div>

        {/* Polls List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="spinner h-12 w-12"></div>
          </div>
        ) : polls.length === 0 ? (
          <div className="card p-12 text-center">
            <Vote size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No polls found</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create Your First Poll
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => (
              <div key={poll.id} className="card-hover p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">{getPollTypeIcon(poll.poll_type)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-900">
                          {poll.title}
                        </h3>
                        <span className={`badge ${getStatusColor(poll.status)}`}>
                          {poll.status}
                        </span>
                        {poll.has_voted && (
                          <span className="badge badge-success">
                            <CheckCircle size={14} className="mr-1" />
                            Voted
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{poll.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>
                            {format(new Date(poll.start_date), 'MMM dd')} - {format(new Date(poll.end_date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          <span>{poll.total_votes || 0} votes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>by {poll.created_by_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {poll.status === 'active' && !poll.has_voted ? (
                      <button className="btn-primary">
                        <Vote size={16} className="mr-2" />
                        Vote Now
                      </button>
                    ) : (
                      <button className="btn-secondary">
                        <BarChart3 size={16} className="mr-2" />
                        View Results
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Poll Modal */}
        {showCreateModal && (
          <CreatePollModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false)
              fetchPolls()
            }}
          />
        )}
      </div>
    </AppLayout>
  )
}

// Create Poll Modal
function CreatePollModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    poll_type: 'simple',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    options: ['', '']
  })

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] })
  }

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index)
    setFormData({ ...formData, options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: memberData } = await supabase
        .from('apartment_members')
        .select('apartment_id')
        .eq('user_id', user?.id)
        .single()

      if (!memberData) {
        alert('You are not part of any apartment')
        return
      }

      // Create poll
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({
          apartment_id: memberData.apartment_id,
          title: formData.title,
          description: formData.description,
          poll_type: formData.poll_type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          created_by: user?.id,
          status: 'active'
        })
        .select()
        .single()

      if (pollError) throw pollError

      // Create poll options
      if (pollData && formData.options.filter(o => o.trim()).length > 0) {
        const optionsToInsert = formData.options
          .filter(o => o.trim())
          .map((option, index) => ({
            poll_id: pollData.id,
            option_text: option,
            option_order: index + 1
          }))

        const { error: optionsError } = await supabase
          .from('poll_options')
          .insert(optionsToInsert)

        if (optionsError) throw optionsError
      }

      alert('Poll created successfully!')
      onSuccess()
    } catch (error) {
      console.error('Error creating poll:', error)
      alert('Failed to create poll')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="card max-w-2xl w-full p-8 my-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Poll</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poll Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="e.g., Should we get a new dishwasher?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
              placeholder="Add details about what you're voting on..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poll Type *
              </label>
              <select
                value={formData.poll_type}
                onChange={(e) => setFormData({ ...formData, poll_type: e.target.value })}
                className="input"
                required
              >
                <option value="simple">Simple (Yes/No)</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="ranked">Ranked Choice</option>
                <option value="budget">Budget Approval</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="input"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {formData.poll_type !== 'simple' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options *
              </label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="input flex-1"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="btn-secondary px-3"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="btn-secondary w-full"
                >
                  + Add Option
                </button>
              </div>
            </div>
          )}

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
              {loading ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

