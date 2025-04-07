'use client'

import { useState, useEffect } from 'react'
import { 
  Cpu, 
  Thermometer, 
  HardDrive, 
  BarChart, 
  RefreshCcw,
  AlertCircle
} from 'lucide-react'

interface SystemStats {
  gpu: {
    usage: number
    memory: number
    temperature: number
    memoryTotal: number
    memoryUsed: number
  }
  cpu: {
    usage: number
    temperature: number
    cores: number
  }
  memory: {
    total: number
    used: number
    percentage: number
  }
  disk: {
    total: number
    used: number
    percentage: number
  }
  status: 'healthy' | 'warning' | 'critical'
}

export default function SystemStats() {
  const [stats, setStats] = useState<SystemStats>({
    gpu: {
      usage: 72,
      memory: 65,
      temperature: 68,
      memoryTotal: 16,
      memoryUsed: 10.4
    },
    cpu: {
      usage: 32,
      temperature: 54,
      cores: 12
    },
    memory: {
      total: 32,
      used: 18.6,
      percentage: 58
    },
    disk: {
      total: 1000,
      used: 453,
      percentage: 45
    },
    status: 'healthy'
  })
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Simulate refreshing stats
  const refreshStats = () => {
    setIsRefreshing(true)
    
    // In a real app, this would be an API call
    setTimeout(() => {
      const newStats = {...stats}
      
      // Randomly adjust values slightly to simulate changes
      newStats.gpu.usage = Math.min(100, Math.max(0, stats.gpu.usage + (Math.random() * 10 - 5)))
      newStats.gpu.memory = Math.min(100, Math.max(0, stats.gpu.memory + (Math.random() * 8 - 4)))
      newStats.gpu.temperature = Math.min(95, Math.max(40, stats.gpu.temperature + (Math.random() * 6 - 3)))
      newStats.gpu.memoryUsed = Math.min(stats.gpu.memoryTotal, Math.max(0, stats.gpu.memoryUsed + (Math.random() * 1.2 - 0.6)))
      
      newStats.cpu.usage = Math.min(100, Math.max(0, stats.cpu.usage + (Math.random() * 12 - 6)))
      newStats.cpu.temperature = Math.min(90, Math.max(35, stats.cpu.temperature + (Math.random() * 5 - 2.5)))
      
      newStats.memory.used = Math.min(stats.memory.total, Math.max(0, stats.memory.used + (Math.random() * 2 - 1)))
      newStats.memory.percentage = (newStats.memory.used / stats.memory.total) * 100
      
      newStats.disk.used = Math.min(stats.disk.total, Math.max(0, stats.disk.used + (Math.random() * 5 - 2.5)))
      newStats.disk.percentage = (newStats.disk.used / stats.disk.total) * 100
      
      // Update status based on temperature
      if (newStats.gpu.temperature > 85) {
        newStats.status = 'critical'
      } else if (newStats.gpu.temperature > 75) {
        newStats.status = 'warning'
      } else {
        newStats.status = 'healthy'
      }
      
      setStats(newStats)
      setIsRefreshing(false)
    }, 800)
  }
  
  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStats()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [stats])
  
  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'text-green-500'
      case 'warning':
        return 'text-yellow-500'
      case 'critical':
        return 'text-red-500'
    }
  }
  
  const getProgressColor = (percentage: number) => {
    if (percentage > 90) return 'bg-red-500'
    if (percentage > 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }
  
  return (
    <div className="bg-card rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">System Status</h2>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 text-sm ${getStatusColor(stats.status)}`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor(stats.status)} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${getStatusColor(stats.status)}`}></span>
            </span>
            {stats.status === 'healthy' ? 'Healthy' : stats.status === 'warning' ? 'Warning' : 'Critical'}
          </span>
          <button 
            onClick={refreshStats}
            disabled={isRefreshing}
            className="p-1 hover:bg-muted rounded-full transition-colors"
            aria-label="Refresh stats"
          >
            <RefreshCcw size={16} className={`text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* GPU Status */}
        <div className="col-span-2 bg-muted/30 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <BarChart size={18} className="text-primary" />
              <span className="font-medium">GPU</span>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer size={16} className={
                stats.gpu.temperature > 85 
                  ? 'text-red-500' 
                  : stats.gpu.temperature > 75 
                    ? 'text-yellow-500' 
                    : 'text-green-500'
              } />
              <span className="text-sm">{stats.gpu.temperature.toFixed(1)}°C</span>
            </div>
          </div>
          
          <div className="space-y-2 mt-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Usage</span>
                <span>{stats.gpu.usage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${getProgressColor(stats.gpu.usage)}`}
                  style={{ width: `${stats.gpu.usage}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Memory</span>
                <span>{stats.gpu.memoryUsed.toFixed(1)} / {stats.gpu.memoryTotal} GB</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${getProgressColor(stats.gpu.memory)}`}
                  style={{ width: `${stats.gpu.memory}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* CPU Status */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={16} className="text-primary" />
            <span className="font-medium">CPU ({stats.cpu.cores} cores)</span>
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Usage</span>
              <span>{stats.cpu.usage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${getProgressColor(stats.cpu.usage)}`}
                style={{ width: `${stats.cpu.usage}%` }}
              />
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Thermometer size={14} />
            <span>{stats.cpu.temperature.toFixed(1)}°C</span>
          </div>
        </div>
        
        {/* Memory Status */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive size={16} className="text-primary" />
            <span className="font-medium">Memory & Storage</span>
          </div>
          
          <div className="space-y-3 mt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>RAM</span>
                <span>{stats.memory.used.toFixed(1)} / {stats.memory.total} GB</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${getProgressColor(stats.memory.percentage)}`}
                  style={{ width: `${stats.memory.percentage}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Storage</span>
                <span>{stats.disk.used.toFixed(0)} / {stats.disk.total} GB</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${getProgressColor(stats.disk.percentage)}`}
                  style={{ width: `${stats.disk.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {stats.status === 'critical' && (
        <div className="mt-4 bg-red-500/10 border border-red-500 rounded-md p-3 flex items-center gap-2 text-sm text-red-500">
          <AlertCircle size={16} />
          <p>Warning: GPU temperature is critically high. Consider pausing training.</p>
        </div>
      )}
      
      {stats.status === 'warning' && (
        <div className="mt-4 bg-yellow-500/10 border border-yellow-500 rounded-md p-3 flex items-center gap-2 text-sm text-yellow-500">
          <AlertCircle size={16} />
          <p>Note: GPU temperature is elevated. Monitor system conditions.</p>
        </div>
      )}
    </div>
  )
} 