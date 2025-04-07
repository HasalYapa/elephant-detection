'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import {
  Search,
  Bell,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { theme, setTheme } = useTheme()
  
  const notifications = [
    { id: 1, message: 'Training complete: Elephant Detector v1', time: '2 minutes ago', read: false },
    { id: 2, message: 'New dataset uploaded successfully', time: '1 hour ago', read: false },
    { id: 3, message: 'System update available', time: '1 day ago', read: true },
  ]
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }
  
  return (
    <header className="bg-card border-b border-border py-3 px-6">
      <div className="flex items-center justify-between">
        {/* Left: Search Bar */}
        <div className="relative w-64 md:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-muted-foreground" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/50 border border-border text-foreground rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary w-full text-sm"
            placeholder="Search datasets, models..."
          />
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-muted-foreground" />
            )}
          </button>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-muted transition-colors relative"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-muted-foreground" />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                2
              </span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-card border border-border shadow-lg rounded-lg z-10 py-1 overflow-hidden">
                <div className="px-4 py-2 border-b border-border flex justify-between items-center">
                  <h3 className="font-medium">Notifications</h3>
                  <button className="text-xs text-primary hover:text-primary/80">
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">{notification.message}</p>
                        {!notification.read && (
                          <span className="h-2 w-2 bg-primary rounded-full"></span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-border">
                  <Link href="/notifications" className="text-xs text-primary hover:text-primary/80 block text-center">
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 hover:bg-muted rounded-full pl-2 pr-3 py-1 transition-colors"
            >
              <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center">
                <User size={18} className="text-primary" />
              </div>
              <span className="hidden md:inline text-sm font-medium">Admin User</span>
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
            
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border shadow-lg rounded-lg z-10 py-1">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">admin@example.com</p>
                </div>
                <ul>
                  <li>
                    <Link href="/profile" className="flex items-center px-4 py-2 text-sm hover:bg-muted/50">
                      <User size={16} className="mr-2 text-muted-foreground" />
                      Your Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings" className="flex items-center px-4 py-2 text-sm hover:bg-muted/50">
                      <Settings size={16} className="mr-2 text-muted-foreground" />
                      Settings
                    </Link>
                  </li>
                  <li className="border-t border-border mt-1">
                    <Link href="/logout" className="flex items-center px-4 py-2 text-sm hover:bg-muted/50 text-red-500">
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 