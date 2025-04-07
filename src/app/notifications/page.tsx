'use client'

import { useState, useEffect } from 'react'
import { Bell, AlertTriangle, Calendar, Clock, ArrowUpRight, Trash, Loader2 } from 'lucide-react'
// Import the new notification socket functions and disconnect function
import { ElephantNotification, initNotificationSocket, disconnectNotificationSocket } from '@/lib/api' 
// Keep forceReconnect if it's still used for the detection socket elsewhere, or remove if not needed.
// For now, let's assume it might be used elsewhere or add a specific retry for notifications.

// Function to format timestamps nicely
const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatDate = (timestamp: string): string => {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Group notifications by date
const groupNotificationsByDate = (notifications: ElephantNotification[]) => {
  const grouped: Record<string, ElephantNotification[]> = {}
  
  notifications.forEach(notification => {
    const date = new Date(notification.timestamp).toLocaleDateString()
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(notification)
  })
  
  // Convert to array of [date, notifications] pairs and sort by date (newest first)
  return Object.entries(grouped)
    .map(([date, items]) => ({
      date,
      notifications: items.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    }))
    .sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<ElephantNotification[]>([])
  const [isNotificationConnected, setIsNotificationConnected] = useState(false) // State specifically for notification socket
  const [isLoading, setIsLoading] = useState(true)
  const [notificationError, setNotificationError] = useState<string | null>(null) // Error state for notification socket
  
  // Initialization
  useEffect(() => {
    // Load saved notifications from localStorage
    const loadSavedNotifications = () => {
      try {
        const saved = localStorage.getItem('elephantNotifications')
        if (saved) {
          const parsedNotifications = JSON.parse(saved) as ElephantNotification[]
          setNotifications(parsedNotifications)
        }
      } catch (err) {
        console.error('Failed to load saved notifications:', err)
      }
      setIsLoading(false)
    }
    
    loadSavedNotifications()

    // --- Notification Socket Setup ---
    const handleRealtimeNotification = (notification: ElephantNotification) => {
      setNotifications(prev => {
        // Check if notification with this ID already exists (prevent duplicates)
        if (prev.some(n => n.id === notification.id)) {
          return prev
        }
        
        // Add new notification at the beginning
        const updated = [notification, ...prev]
        
        // Save to localStorage (limiting to 100 most recent)
        const toSave = updated.slice(0, 100)
        localStorage.setItem('elephantNotifications', JSON.stringify(toSave))
        
        return updated
      })
    }

    const handleNotificationConnectionChange = (status: 'connected' | 'disconnected' | 'error', message?: string) => {
      setIsNotificationConnected(status === 'connected')
      if (status === 'error') {
        setNotificationError(message || 'Notification connection error')
      } else if (status === 'connected') {
        setNotificationError(null) // Clear error on successful connection
      }
      // We might want to show a disconnected message if status is 'disconnected'
      if (status === 'disconnected' && !notificationError) {
         // Optionally set a non-error message indicating disconnection
         setNotificationError("Notification service disconnected.");
      }
    }

    // Initialize the specific Socket.IO connection for notifications
    initNotificationSocket(handleRealtimeNotification, handleNotificationConnectionChange)

    // Cleanup: Disconnect the notification socket when the component unmounts
    return () => {
      disconnectNotificationSocket();
    }
  }, []) // Empty dependency array ensures this runs only once on mount and cleanup on unmount
  
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([])
    localStorage.removeItem('elephantNotifications')
  }
  
  // Delete a single notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id)
      localStorage.setItem('elephantNotifications', JSON.stringify(updated))
      return updated
    })
  }
  
  // Retry connection specifically for notifications
  const retryNotificationConnection = () => {
    setNotificationError(null); // Clear previous error
    // Re-initialize the notification socket connection
    initNotificationSocket(
       (notification) => { // Re-pass the handler
         setNotifications(prev => {
           if (prev.some(n => n.id === notification.id)) return prev;
           const updated = [notification, ...prev];
           const toSave = updated.slice(0, 100);
           localStorage.setItem('elephantNotifications', JSON.stringify(toSave));
           return updated;
         })
       },
       (status, message) => { // Re-pass the connection handler
         setIsNotificationConnected(status === 'connected');
         if (status === 'error') {
           setNotificationError(message || 'Notification connection error');
         } else if (status === 'connected') {
           setNotificationError(null);
         }
       }
    );
  }
  
  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(notifications)
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <Bell size={28} className="mr-3 text-primary" />
          Elephant Alerts
        </h1>
        
        <div className="flex items-center space-x-3">
          {/* Display status for the notification socket */}
          {isNotificationConnected ? (
            <div className="flex items-center text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-sm" title="Real-time notification service connected">
              <span>Alerts Connected</span>
            </div>
          ) : (
            <div className="flex items-center text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-sm" title="Real-time notification service disconnected">
              <span>Alerts Disconnected</span>
            </div>
          )}
          
          <button
            onClick={clearNotifications}
            className="px-3 py-1 bg-destructive/10 text-destructive rounded-md text-sm hover:bg-destructive/20 transition-colors disabled:opacity-50"
            disabled={notifications.length === 0}
          >
            Clear All
          </button>
        </div>
      </div>
      
      {/* Display error specific to the notification connection */}
      {notificationError && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-4 mb-6 flex items-start">
          <AlertTriangle size={18} className="mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium">Notification Service Error</h3>
            <p className="text-sm mt-1">{notificationError}</p>
            <button
              onClick={retryNotificationConnection} // Use the specific retry function
              className="mt-2 bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm"
            >
              Retry Alert Connection
            </button>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-10">
          <Loader2 size={40} className="animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="border border-border rounded-lg p-10 text-center">
          <Bell size={40} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No elephant alerts yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            When elephants are detected on the live detection feed, alerts will appear here. 
            Ensure your camera is running to receive notifications.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedNotifications.map(group => (
            <div key={group.date} className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted p-3 flex items-center border-b border-border">
                <Calendar size={16} className="mr-2 text-muted-foreground" />
                <h3 className="font-medium">{formatDate(group.notifications[0].timestamp)}</h3>
                <span className="ml-auto text-muted-foreground text-sm">{group.notifications.length} alerts</span>
              </div>
              
              <div className="divide-y divide-border">
                {group.notifications.map((notification) => (
                  <div key={notification.id} className="p-4 bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-start">
                      <div className="bg-red-500/10 p-2 rounded-full mr-3">
                        <AlertTriangle size={18} className="text-red-500" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{notification.message}</h4>
                          <button 
                            onClick={() => deleteNotification(notification.id)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded-full"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <Clock size={14} className="mr-1" />
                          <span>{formatTime(notification.timestamp)}</span>
                          
                          {/* Conditionally display confidence if available */}
                          {notification.confidence > 0 && (
                             <div className="ml-4 bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full text-xs">
                               {(notification.confidence * 100).toFixed(1)}% confidence
                             </div>
                          )}
                        </div>
                        
                        {/* Conditionally display image if available */}
                        {notification.imageData && ( 
                          <div className="mt-3 relative rounded-md overflow-hidden border border-border">
                            <img 
                              src={notification.imageData} 
                              alt="Elephant detection" 
                              className="w-full h-48 object-cover" 
                            />
                            <button className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full">
                              <ArrowUpRight size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
