import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  Plus, 
  UtensilsCrossed, 
  Calendar, 
  Users, 
  ShoppingCart,
  Clock,
  CheckCircle,
  Utensils,
  ChefHat
} from 'lucide-react'
import { format } from 'date-fns'

interface Meal {
  id: string
  meal_date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  menu: string
  cook_id: string
  cook_name: string
  max_participants: number
  cost_per_person: number
  status: 'planned' | 'cooking' | 'ready' | 'completed' | 'cancelled'
  created_at: string
  participant_count?: number
  is_participating?: boolean
}

interface GroceryTeam {
  id: string
  week_start_date: string
  week_end_date: string
  team_members: string[]
  member_names: string[]
  budget: number
  spent_amount: number
  status: 'active' | 'completed'
}

export default function MealsPage() {
  const { user } = useAuth()
  const [meals, setMeals] = useState<Meal[]>([])
  const [groceryTeams, setGroceryTeams] = useState<GroceryTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'meals' | 'grocery'>('meals')
  const [showCreateMealModal, setShowCreateMealModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([fetchMeals(), fetchGroceryTeams()])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMeals = async () => {
    try {
      // Get user's apartment
      const { data: memberData } = await supabase
        .from('apartment_members')
        .select('apartment_id')
        .eq('user_id', user?.id)
        .single()

      if (!memberData) return

      // Get meals
      const { data, error } = await supabase
        .from('community_meals')
        .select(`
          id,
          meal_date,
          meal_type,
          menu,
          cook_id,
          max_participants,
          cost_per_person,
          status,
          created_at,
          cook:apartment_members!community_meals_cook_id_fkey (
            name
          )
        `)
        .eq('apartment_id', memberData.apartment_id)
        .gte('meal_date', new Date().toISOString().split('T')[0])
        .order('meal_date', { ascending: true })
        .limit(20)

      if (error) throw error

      const transformedMeals = data?.map((meal: any) => ({
        ...meal,
        cook_name: meal.cook?.name || 'Unknown',
        participant_count: 0,
        is_participating: false
      })) || []

      setMeals(transformedMeals)
    } catch (error) {
      console.error('Error fetching meals:', error)
    }
  }

  const fetchGroceryTeams = async () => {
    try {
      // Get user's apartment
      const { data: memberData } = await supabase
        .from('apartment_members')
        .select('apartment_id')
        .eq('user_id', user?.id)
        .single()

      if (!memberData) return

      // Get grocery teams
      const { data, error } = await supabase
        .from('grocery_teams')
        .select('*')
        .eq('apartment_id', memberData.apartment_id)
        .order('week_start_date', { ascending: false })
        .limit(4)

      if (error) throw error

      setGroceryTeams(data || [])
    } catch (error) {
      console.error('Error fetching grocery teams:', error)
    }
  }

  const upcomingMeals = meals.filter(m => m.status === 'planned' || m.status === 'cooking')
  const myMealsAsCook = meals.filter(m => m.cook_id === user?.id)
  const totalParticipations = meals.filter(m => m.is_participating).length

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return '🍳'
      case 'lunch': return '🍱'
      case 'dinner': return '🍽️'
      case 'snack': return '🍪'
      default: return '🍴'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'badge-success'
      case 'ready': return 'badge-success'
      case 'cooking': return 'badge-warning'
      case 'planned': return 'badge-primary'
      case 'cancelled': return 'badge-danger'
      default: return 'badge-secondary'
    }
  }

  return (
    <AppLayout>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Meals</h1>
            <p className="text-gray-600">Plan meals and manage grocery shopping together</p>
          </div>
          <button 
            onClick={() => setShowCreateMealModal(true)}
            className="btn-primary mt-4 md:mt-0"
          >
            <Plus size={20} className="mr-2" />
            Plan a Meal
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-blue-600" size={24} />
              <span className="text-sm text-gray-500">Upcoming</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{upcomingMeals.length}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <ChefHat className="text-purple-600" size={24} />
              <span className="text-sm text-gray-500">My Meals</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{myMealsAsCook.length}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <Utensils className="text-green-600" size={24} />
              <span className="text-sm text-gray-500">Joined</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalParticipations}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="text-orange-600" size={24} />
              <span className="text-sm text-gray-500">Teams</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{groceryTeams.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('meals')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'meals'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UtensilsCrossed size={20} className="inline mr-2" />
              Meal Schedule
            </button>
            <button
              onClick={() => setActiveTab('grocery')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'grocery'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingCart size={20} className="inline mr-2" />
              Grocery Teams
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="spinner h-12 w-12"></div>
          </div>
        ) : activeTab === 'meals' ? (
          /* Meals Tab */
          meals.length === 0 ? (
            <div className="card p-12 text-center">
              <UtensilsCrossed size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No meals planned yet</p>
              <button onClick={() => setShowCreateMealModal(true)} className="btn-primary">
                Plan Your First Meal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => (
                <div key={meal.id} className="card-hover p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl">{getMealTypeIcon(meal.meal_type)}</div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                          </h3>
                          <span className={`badge ${getStatusColor(meal.status)}`}>
                            {meal.status}
                          </span>
                        </div>
                        
                        <p className="text-gray-900 font-medium mb-2">{meal.menu}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{format(new Date(meal.meal_date), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChefHat size={16} />
                            <span>Cook: {meal.cook_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} />
                            <span>{meal.participant_count || 0}/{meal.max_participants} people</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ${meal.cost_per_person.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">per person</p>
                      </div>
                      
                      {meal.is_participating ? (
                        <button className="btn-secondary">
                          <CheckCircle size={16} className="mr-2" />
                          Joined
                        </button>
                      ) : (
                        <button className="btn-primary">
                          Join Meal
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Grocery Teams Tab */
          groceryTeams.length === 0 ? (
            <div className="card p-12 text-center">
              <ShoppingCart size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No grocery teams yet</p>
              <button className="btn-primary">Create Grocery Team</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groceryTeams.map((team) => (
                <div key={team.id} className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Week of {format(new Date(team.week_start_date), 'MMM dd')}
                    </h3>
                    <span className={`badge ${team.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                      {team.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Team Members</span>
                      <span className="font-medium text-gray-900">
                        {team.member_names?.length || 0} people
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Budget</span>
                      <span className="font-medium text-gray-900">${team.budget.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Spent</span>
                      <span className="font-medium text-green-600">${team.spent_amount.toFixed(2)}</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min((team.spent_amount / team.budget) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <button className="btn-secondary w-full">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* Create Meal Modal */}
        {showCreateMealModal && (
          <CreateMealModal
            onClose={() => setShowCreateMealModal(false)}
            onSuccess={() => {
              setShowCreateMealModal(false)
              fetchMeals()
            }}
          />
        )}
      </div>
    </AppLayout>
  )
}

// Create Meal Modal Component
function CreateMealModal({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void
  onSuccess: () => void
}) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    meal_date: '',
    meal_type: 'dinner',
    menu: '',
    max_participants: '6',
    cost_per_person: ''
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
        .from('community_meals')
        .insert({
          apartment_id: memberData.apartment_id,
          meal_date: formData.meal_date,
          meal_type: formData.meal_type,
          menu: formData.menu,
          cook_id: user?.id,
          max_participants: parseInt(formData.max_participants),
          cost_per_person: parseFloat(formData.cost_per_person),
          status: 'planned'
        })

      if (error) throw error

      alert('Meal planned successfully!')
      onSuccess()
    } catch (error) {
      console.error('Error creating meal:', error)
      alert('Failed to plan meal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Plan a Community Meal</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Date *
              </label>
              <input
                type="date"
                value={formData.meal_date}
                onChange={(e) => setFormData({ ...formData, meal_date: e.target.value })}
                className="input"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Type *
              </label>
              <select
                value={formData.meal_type}
                onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                className="input"
                required
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menu *
            </label>
            <textarea
              value={formData.menu}
              onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
              className="input"
              rows={3}
              placeholder="What are you cooking? e.g., Spaghetti Carbonara with Caesar Salad"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Participants *
              </label>
              <input
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                className="input"
                min="2"
                max="20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost per Person *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cost_per_person}
                onChange={(e) => setFormData({ ...formData, cost_per_person: e.target.value })}
                className="input"
                placeholder="0.00"
                required
              />
            </div>
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
              {loading ? 'Planning...' : 'Plan Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

