import { useState } from 'react'
import { Calendar, Car, Home, Wrench, Plus, Clock, User, CheckCircle2, XCircle } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'

type ResourceType = 'parking' | 'common-area' | 'equipment' | 'all'

interface Booking {
  id: string
  resourceName: string
  resourceType: ResourceType
  bookedBy: string
  bookedByAvatar: string
  startTime: string
  endTime: string
  date: string
  status: 'active' | 'upcoming' | 'completed' | 'cancelled'
  purpose?: string
}

interface Resource {
  id: string
  name: string
  type: ResourceType
  icon: any
  available: boolean
  description: string
  maxDuration: string
}

export default function ResourceBookingPage() {
  const [selectedFilter, setSelectedFilter] = useState<ResourceType>('all')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)

  // Mock data - replace with actual API calls
  const resources: Resource[] = [
    {
      id: '1',
      name: 'Parking Spot #1',
      type: 'parking',
      icon: Car,
      available: true,
      description: 'Ground floor parking spot near entrance',
      maxDuration: '24 hours',
    },
    {
      id: '2',
      name: 'Parking Spot #2',
      type: 'parking',
      icon: Car,
      available: false,
      description: 'Basement parking spot',
      maxDuration: '24 hours',
    },
    {
      id: '3',
      name: 'Living Room',
      type: 'common-area',
      icon: Home,
      available: true,
      description: 'Main common area with TV and seating for 15',
      maxDuration: '4 hours',
    },
    {
      id: '4',
      name: 'Rooftop Terrace',
      type: 'common-area',
      icon: Home,
      available: true,
      description: 'Outdoor space with BBQ grill and seating',
      maxDuration: '6 hours',
    },
    {
      id: '5',
      name: 'Lawn Mower',
      type: 'equipment',
      icon: Wrench,
      available: true,
      description: 'Gas-powered lawn mower',
      maxDuration: '3 hours',
    },
    {
      id: '6',
      name: 'Power Drill Set',
      type: 'equipment',
      icon: Wrench,
      available: false,
      description: 'Complete power drill set with bits',
      maxDuration: '24 hours',
    },
  ]

  const bookings: Booking[] = [
    {
      id: '1',
      resourceName: 'Parking Spot #2',
      resourceType: 'parking',
      bookedBy: 'John Doe',
      bookedByAvatar: 'JD',
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      date: '2024-01-15',
      status: 'active',
      purpose: 'Guest visiting',
    },
    {
      id: '2',
      resourceName: 'Living Room',
      resourceType: 'common-area',
      bookedBy: 'Jane Smith',
      bookedByAvatar: 'JS',
      startTime: '07:00 PM',
      endTime: '10:00 PM',
      date: '2024-01-16',
      status: 'upcoming',
      purpose: 'Movie night',
    },
    {
      id: '3',
      resourceName: 'Power Drill Set',
      resourceType: 'equipment',
      bookedBy: 'Bob Wilson',
      bookedByAvatar: 'BW',
      startTime: '10:00 AM',
      endTime: '02:00 PM',
      date: '2024-01-15',
      status: 'active',
      purpose: 'Furniture assembly',
    },
  ]

  const filteredResources = selectedFilter === 'all' 
    ? resources 
    : resources.filter(r => r.type === selectedFilter)

  const getResourceTypeLabel = (type: ResourceType) => {
    const labels = {
      parking: 'Parking',
      'common-area': 'Common Area',
      equipment: 'Equipment',
      all: 'All Resources',
    }
    return labels[type]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleBookResource = (resource: Resource) => {
    setSelectedResource(resource)
    setShowBookingModal(true)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resource Booking</h1>
              <p className="text-sm text-gray-500 mt-1">Book parking spots, common areas, and shared equipment</p>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Booking
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex gap-2">
              {(['all', 'parking', 'common-area', 'equipment'] as ResourceType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFilter(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getResourceTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Resources</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{resources.length}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Available Now</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {resources.filter(r => r.available).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Your Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {bookings.filter(b => b.status === 'active').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Resources */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Available Resources</h2>
              <div className="space-y-4">
                {filteredResources.map((resource) => {
                  const Icon = resource.icon
                  return (
                    <div
                      key={resource.id}
                      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${
                        !resource.available ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          resource.available ? 'bg-indigo-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            resource.available ? 'text-indigo-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                              <p className="text-sm text-gray-500 mt-1">{resource.description}</p>
                            </div>
                            {resource.available ? (
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Available
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                In Use
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>Max: {resource.maxDuration}</span>
                            </div>
                            <button
                              onClick={() => handleBookResource(resource)}
                              disabled={!resource.available}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                resource.available
                                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Current Bookings */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Current Bookings</h2>
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.resourceName}</h3>
                        <p className="text-sm text-gray-500 mt-1 capitalize">
                          {booking.resourceType.replace('-', ' ')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-indigo-600">{booking.bookedByAvatar}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{booking.bookedBy}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.date).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{booking.startTime} - {booking.endTime}</span>
                      </div>

                      {booking.purpose && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Purpose:</span> {booking.purpose}
                          </p>
                        </div>
                      )}

                      {booking.status === 'active' && (
                        <div className="pt-3 flex gap-2">
                          <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                            Extend
                          </button>
                          <button className="flex-1 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {selectedResource ? `Book ${selectedResource.name}` : 'New Booking'}
            </h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option>Select a resource</option>
                  {resources.filter(r => r.available).map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose (Optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Why do you need this resource?"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

