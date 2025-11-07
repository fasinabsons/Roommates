import { useState } from 'react'
import { Users, Calendar, DollarSign, ShoppingCart, CheckCircle2, Clock } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'

interface TeamMember {
  id: string
  name: string
  avatar: string
  role: string
}

interface GroceryTeam {
  id: string
  name: string
  week: string
  weekNumber: number
  members: TeamMember[]
  budget: number
  spent: number
  status: 'upcoming' | 'active' | 'completed'
  shoppingDate?: string
}

export default function GroceryTeamsPage() {
  const [selectedView, setSelectedView] = useState<'schedule' | 'current'>('schedule')

  // Mock data - replace with actual API calls
  const teams: GroceryTeam[] = [
    {
      id: '1',
      name: 'Team Alpha',
      week: 'Jan 1-7, 2024',
      weekNumber: 1,
      members: [
        { id: '1', name: 'John Doe', avatar: 'JD', role: 'Team Leader' },
        { id: '2', name: 'Jane Smith', avatar: 'JS', role: 'Member' },
        { id: '3', name: 'Bob Wilson', avatar: 'BW', role: 'Member' },
      ],
      budget: 500,
      spent: 450,
      status: 'completed',
      shoppingDate: '2024-01-01',
    },
    {
      id: '2',
      name: 'Team Beta',
      week: 'Jan 8-14, 2024',
      weekNumber: 2,
      members: [
        { id: '4', name: 'Alice Brown', avatar: 'AB', role: 'Team Leader' },
        { id: '5', name: 'Charlie Davis', avatar: 'CD', role: 'Member' },
        { id: '6', name: 'Diana Evans', avatar: 'DE', role: 'Member' },
      ],
      budget: 500,
      spent: 380,
      status: 'active',
      shoppingDate: '2024-01-08',
    },
    {
      id: '3',
      name: 'Team Gamma',
      week: 'Jan 15-21, 2024',
      weekNumber: 3,
      members: [
        { id: '7', name: 'Frank Green', avatar: 'FG', role: 'Team Leader' },
        { id: '8', name: 'Grace Hill', avatar: 'GH', role: 'Member' },
        { id: '9', name: 'Henry Jones', avatar: 'HJ', role: 'Member' },
      ],
      budget: 500,
      spent: 0,
      status: 'upcoming',
      shoppingDate: '2024-01-15',
    },
    {
      id: '4',
      name: 'Team Delta',
      week: 'Jan 22-28, 2024',
      weekNumber: 4,
      members: [
        { id: '10', name: 'Ivy King', avatar: 'IK', role: 'Team Leader' },
        { id: '11', name: 'Jack Lee', avatar: 'JL', role: 'Member' },
        { id: '12', name: 'Kate Moore', avatar: 'KM', role: 'Member' },
      ],
      budget: 500,
      spent: 0,
      status: 'upcoming',
      shoppingDate: '2024-01-22',
    },
  ]

  const currentTeam = teams.find(t => t.status === 'active')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'upcoming':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />
      case 'active':
        return <ShoppingCart className="w-4 h-4" />
      case 'upcoming':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Grocery Teams</h1>
              <p className="text-sm text-gray-500 mt-1">4-week rotation schedule for grocery shopping</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedView('schedule')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === 'schedule'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Full Schedule
              </button>
              <button
                onClick={() => setSelectedView('current')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === 'current'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                My Current Team
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {selectedView === 'schedule' ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Teams</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">4</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Members per Team</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Weekly Budget</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">$500</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Current Week</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">Week 2</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Teams Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map((team) => (
                  <div key={team.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Team Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{team.name}</h3>
                          <p className="text-sm opacity-90 mt-1">{team.week}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(team.status)}`}>
                          {getStatusIcon(team.status)}
                          {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                        </span>
                      </div>
                      
                      {/* Budget Progress */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Budget Used</span>
                          <span className="font-semibold">${team.spent} / ${team.budget}</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div
                            className="bg-white rounded-full h-2 transition-all"
                            style={{ width: `${(team.spent / team.budget) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Team Members */}
                    <div className="p-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Team Members</h4>
                      <div className="space-y-3">
                        {team.members.map((member) => (
                          <div key={member.id} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-indigo-600">{member.avatar}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {team.shoppingDate && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Shopping Day: {new Date(team.shoppingDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            // Current Team View
            currentTeam && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Current Team Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-8 text-white">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">Your Current Team</h2>
                        <p className="text-lg opacity-90 mt-2">{currentTeam.name}</p>
                        <p className="text-sm opacity-80 mt-1">{currentTeam.week}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(currentTeam.status)}`}>
                        {getStatusIcon(currentTeam.status)}
                        Active This Week
                      </span>
                    </div>
                    
                    {/* Budget Progress */}
                    <div className="mt-6">
                      <div className="flex justify-between text-base mb-3">
                        <span>Budget Used</span>
                        <span className="font-bold text-lg">${currentTeam.spent} / ${currentTeam.budget}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-3">
                        <div
                          className="bg-white rounded-full h-3 transition-all"
                          style={{ width: `${(currentTeam.spent / currentTeam.budget) * 100}%` }}
                        />
                      </div>
                      <p className="text-sm opacity-80 mt-2">
                        ${currentTeam.budget - currentTeam.spent} remaining
                      </p>
                    </div>
                  </div>

                  {/* Team Details */}
                  <div className="p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Team Members</h3>
                    <div className="space-y-4">
                      {currentTeam.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-indigo-600">{member.avatar}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {currentTeam.shoppingDate && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-semibold text-blue-900">Shopping Day</p>
                            <p className="text-sm text-blue-700">
                              {new Date(currentTeam.shoppingDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex gap-3">
                      <button className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Upload Receipt
                      </button>
                      <button className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        View History
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tips Card */}
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h4 className="font-semibold text-yellow-900 mb-2">Shopping Tips</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Shop early in the week to get fresh produce</li>
                    <li>• Keep all receipts for budget tracking</li>
                    <li>• Coordinate with team members before shopping</li>
                    <li>• Check the weekly menu for required ingredients</li>
                  </ul>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

