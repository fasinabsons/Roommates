import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  Bell, 
  CheckCircle, 
  DollarSign, 
  Users, 
  Vote,
  Calendar,
  AlertCircle,
  Trash2,
  Check
} from 'lucide-react'
import { format } from 'date-fns'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  action_url: string | null
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

      if (error) throw error
      
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false)

      if (error) throw error
      
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setNotifications(notifications.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment': return <DollarSign size={20} className="text-green-600" />
      case 'bill': return <DollarSign size={20} className="text-blue-600" />
      case 'task': return <CheckCircle size={20} className="text-purple-600" />
      case 'member': return <Users size={20} className="text-orange-600" />
      case 'poll': return <Vote size={20} className="text-pink-600" />
      case 'meal': return <Calendar size={20} className="text-yellow-600" />
      case 'alert': return <AlertCircle size={20} className="text-red-600" />
      default: return <Bell size={20} className="text-gray-600" />
    }
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <AppLayout>
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn-secondary mt-4 md:mt-0">
              <Check size={20} className="mr-2" />
              Mark All as Read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="card mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 font-medium ${
                filter === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-6 py-3 font-medium ${
                filter === 'unread'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="spinner h-12 w-12"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="card p-12 text-center">
            <Bell size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-sm text-gray-500">
              {filter === 'unread' ? 'All caught up! Check back later.' : 'We\'ll notify you when something happens'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`card-hover p-4 ${
                  !notification.is_read ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-full ${
                    !notification.is_read ? 'bg-white' : 'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className={`text-base font-semibold ${
                          !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-gray-500">
                        {format(new Date(notification.created_at), 'MMM dd, yyyy · h:mm a')}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

