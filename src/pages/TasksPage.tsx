import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  Plus, 
  CheckSquare, 
  Clock, 
  User, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Filter,
  Search
} from 'lucide-react'
import { format } from 'date-fns'

interface Task {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to_id: string | null
  assigned_to_name: string | null
  due_date: string | null
  created_by_name: string
  created_at: string
}

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      
      const { data: memberData } = await supabase
        .from('apartment_members')
        .select('apartment_id')
        .eq('user_id', user?.id)
        .single()

      if (!memberData) return

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          category,
          priority,
          status,
          assigned_to_id,
          due_date,
          created_at,
          assigned_to:apartment_members!tasks_assigned_to_id_fkey (
            name
          ),
          created_by:apartment_members!tasks_created_by_fkey (
            name
          )
        `)
        .eq('apartment_id', memberData.apartment_id)
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true })

      if (error) throw error

      const transformedTasks = data?.map((task: any) => ({
        ...task,
        assigned_to_name: task.assigned_to?.name || null,
        created_by_name: task.created_by?.name || 'Unknown'
      })) || []

      setTasks(transformedTasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalTasks = tasks.length
  const myTasks = tasks.filter(t => t.assigned_to_id === user?.id).length
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length
  const completedTasks = tasks.filter(t => t.status === 'completed').length

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'badge-danger'
      case 'high': return 'badge-warning'
      case 'medium': return 'badge-primary'
      case 'low': return 'badge-secondary'
      default: return 'badge-secondary'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'badge-success'
      case 'in_progress': return 'badge-warning'
      case 'pending': return 'badge-primary'
      case 'cancelled': return 'badge-danger'
      default: return 'badge-secondary'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cleaning': return '🧹'
      case 'maintenance': return '🔧'
      case 'shopping': return '🛒'
      case 'cooking': return '👨‍🍳'
      case 'bills': return '💰'
      default: return '📋'
    }
  }

  return (
    <AppLayout>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
            <p className="text-gray-600">Manage household tasks and responsibilities</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary mt-4 md:mt-0"
          >
            <Plus size={20} className="mr-2" />
            Create Task
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckSquare className="text-blue-600" size={24} />
              <span className="text-sm text-gray-500">Total Tasks</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <User className="text-purple-600" size={24} />
              <span className="text-sm text-gray-500">My Tasks</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{myTasks}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-yellow-600" size={24} />
              <span className="text-sm text-gray-500">Pending</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{pendingTasks}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-600" size={24} />
              <span className="text-sm text-gray-500">Completed</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{completedTasks}</p>
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
                placeholder="Search tasks..."
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
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="input pl-10"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="spinner h-12 w-12"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="card p-12 text-center">
            <CheckSquare size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No tasks found</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create Your First Task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="card-hover p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">{getCategoryIcon(task.category)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-900">
                          {task.title}
                        </h3>
                        <span className={`badge ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`badge ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {task.assigned_to_name && (
                          <div className="flex items-center gap-2">
                            <User size={16} />
                            <span>Assigned to: {task.assigned_to_name}</span>
                          </div>
                        )}
                        {task.due_date && (
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>Created by {task.created_by_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {task.status !== 'completed' && (
                      <button className="btn-primary text-sm">
                        <CheckCircle size={16} className="mr-2" />
                        Complete
                      </button>
                    )}
                    <button className="btn-secondary text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Task Modal */}
        {showCreateModal && (
          <CreateTaskModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false)
              fetchTasks()
            }}
          />
        )}
      </div>
    </AppLayout>
  )
}

// Create Task Modal
function CreateTaskModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'cleaning',
    priority: 'medium',
    due_date: ''
  })

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

      const { error } = await supabase
        .from('tasks')
        .insert({
          apartment_id: memberData.apartment_id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          due_date: formData.due_date || null,
          created_by: user?.id,
          status: 'pending'
        })

      if (error) throw error

      alert('Task created successfully!')
      onSuccess()
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Task</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="e.g., Clean the kitchen"
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
              placeholder="Add details about the task..."
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
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
                <option value="shopping">Shopping</option>
                <option value="cooking">Cooking</option>
                <option value="bills">Bills</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="input"
              min={new Date().toISOString().split('T')[0]}
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
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

