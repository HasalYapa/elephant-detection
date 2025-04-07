'use client'

import { useState } from 'react'
import { Save, User, Camera, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Profile header with cover photo */}
        <div className="relative h-48 bg-gradient-to-r from-primary/40 to-primary/10">
          {/* Profile picture */}
          <div className="absolute -bottom-16 left-8">
            <div className="relative w-32 h-32 rounded-full border-4 border-card bg-muted flex items-center justify-center">
              <User size={64} className="text-muted-foreground" />
              <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
                <Camera size={16} />
              </button>
            </div>
          </div>
          
          <div className="absolute bottom-4 right-4">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="bg-background/30 backdrop-blur-sm text-white px-4 py-2 rounded-md text-sm hover:bg-background/40 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
        
        {/* Profile info */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              {isEditing ? (
                <input 
                  type="text" 
                  defaultValue="Admin User" 
                  className="text-2xl font-bold bg-muted/30 border border-border rounded px-2 py-1 mb-1 w-full md:w-auto"
                />
              ) : (
                <h2 className="text-2xl font-bold">Admin User</h2>
              )}
              
              {isEditing ? (
                <input 
                  type="text" 
                  defaultValue="admin@example.com" 
                  className="text-sm text-muted-foreground bg-muted/30 border border-border rounded px-2 py-1"
                />
              ) : (
                <p className="text-sm text-muted-foreground">admin@example.com</p>
              )}
            </div>
            
            <div className="flex space-x-2">
              {isEditing && (
                <button className="flex items-center space-x-1 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors">
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              )}
              
              <Link 
                href="/login"
                className="flex items-center space-x-1 bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm hover:bg-destructive/20 transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Bio</h3>
                {isEditing ? (
                  <textarea 
                    className="w-full h-32 bg-muted/30 border border-border rounded p-3 focus:outline-none focus:ring-1 focus:ring-primary"
                    defaultValue="Administrator account for the Elephant Detection system. Responsible for model training and system management."
                  ></textarea>
                ) : (
                  <p className="text-muted-foreground">
                    Administrator account for the Elephant Detection system. Responsible for model training and system management.
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-md">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Updated profile information</p>
                      <p className="text-sm text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-md">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Started new model training</p>
                      <p className="text-sm text-muted-foreground">5 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Account</h3>
                <div className="bg-muted/20 rounded-md p-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-medium">Account Type</p>
                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">Administrator</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-medium">Member Since</p>
                    <span className="text-sm text-muted-foreground">March 2023</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Last Login</p>
                    <span className="text-sm text-muted-foreground">Today</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Actions</h3>
                <div className="space-y-2">
                  <Link 
                    href="/settings" 
                    className="flex items-center justify-between w-full p-3 bg-muted/20 rounded-md hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-sm font-medium">Settings</span>
                    <span className="text-primary">→</span>
                  </Link>
                  
                  <Link 
                    href="/settings#security" 
                    className="flex items-center justify-between w-full p-3 bg-muted/20 rounded-md hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-sm font-medium">Security</span>
                    <span className="text-primary">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 