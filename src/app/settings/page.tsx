'use client'

import { useState } from 'react'
import { Save, User, Bell, Shield, Monitor, Database, Globe } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings navigation */}
        <div className="w-full md:w-64 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
              activeTab === 'profile' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted text-foreground'
            }`}
          >
            <User size={18} className="mr-2" />
            <span>Profile</span>
          </button>
          
          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
              activeTab === 'appearance' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted text-foreground'
            }`}
          >
            <Monitor size={18} className="mr-2" />
            <span>Appearance</span>
          </button>
          
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
              activeTab === 'notifications' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted text-foreground'
            }`}
          >
            <Bell size={18} className="mr-2" />
            <span>Notifications</span>
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
              activeTab === 'security' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted text-foreground'
            }`}
          >
            <Shield size={18} className="mr-2" />
            <span>Security</span>
          </button>
          
          <button
            onClick={() => setActiveTab('api')}
            className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
              activeTab === 'api' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted text-foreground'
            }`}
          >
            <Globe size={18} className="mr-2" />
            <span>API Access</span>
          </button>
          
          <button
            onClick={() => setActiveTab('data')}
            className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
              activeTab === 'data' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted text-foreground'
            }`}
          >
            <Database size={18} className="mr-2" />
            <span>Data Management</span>
          </button>
        </div>
        
        {/* Settings content */}
        <div className="flex-1 bg-card border border-border rounded-lg p-6">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
              
              <div className="space-y-4">
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                      <User size={40} className="text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">Profile Picture</h3>
                      <p className="text-sm text-muted-foreground mb-2">Upload a profile picture</p>
                      <button className="text-sm bg-muted hover:bg-muted/80 px-3 py-1 rounded">
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input 
                      type="text" 
                      defaultValue="Admin User"
                      className="w-full p-2 bg-muted/50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input 
                      type="email" 
                      defaultValue="admin@example.com" 
                      className="w-full p-2 bg-muted/50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <textarea 
                      className="w-full p-2 bg-muted/50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary h-24"
                      placeholder="Tell us about yourself"
                    ></textarea>
                  </div>
                  
                  <div className="pt-4">
                    <button className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
              <p className="text-muted-foreground mb-4">Customize how the application looks.</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="aspect-video p-4 bg-white border-2 border-border rounded-lg hover:border-primary">
                      <div className="w-full h-full rounded bg-white border border-gray-200"></div>
                      <p className="text-center text-sm mt-2 text-black">Light</p>
                    </button>
                    
                    <button className="aspect-video p-4 bg-gray-900 border-2 border-border rounded-lg hover:border-primary">
                      <div className="w-full h-full rounded bg-gray-800 border border-gray-700"></div>
                      <p className="text-center text-sm mt-2 text-white">Dark</p>
                    </button>
                    
                    <button className="aspect-video p-4 bg-gradient-to-r from-white to-gray-900 border-2 border-border rounded-lg hover:border-primary">
                      <div className="w-full h-full rounded bg-gradient-to-r from-white to-gray-800"></div>
                      <p className="text-center text-sm mt-2 text-gray-700">System</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
              <p className="text-muted-foreground mb-4">Control when and how you receive notifications.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <h3 className="font-medium">Training Completion</h3>
                    <p className="text-sm text-muted-foreground">Get notified when model training is complete</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <h3 className="font-medium">System Updates</h3>
                    <p className="text-sm text-muted-foreground">Get notified about system updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive important notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {activeTab !== 'profile' && activeTab !== 'appearance' && activeTab !== 'notifications' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                {activeTab === 'security' && <Shield size={32} className="text-muted-foreground" />}
                {activeTab === 'api' && <Globe size={32} className="text-muted-foreground" />}
                {activeTab === 'data' && <Database size={32} className="text-muted-foreground" />}
              </div>
              <h2 className="text-xl font-medium mb-2">
                {activeTab === 'security' && 'Security Settings'}
                {activeTab === 'api' && 'API Access'}
                {activeTab === 'data' && 'Data Management'}
              </h2>
              <p className="text-muted-foreground text-center max-w-md">
                This section is under development. Check back soon for more settings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 