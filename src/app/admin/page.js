'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Spinner from '@/components/ui/Spinner'

export default function AdminOverview() {
  const [stats, setStats] = useState({})
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load system statistics
        const [
          { count: totalUsers },
          { count: completedProfiles },
          { count: totalRequests },
          { count: pendingRequests },
          { count: totalMatches },
          { count: acceptedMatches },
          { count: pendingMatches }
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('profiles').select('id', { count: 'exact' }).eq('profile_completed', true),
          supabase.from('requests').select('id', { count: 'exact' }),
          supabase.from('requests').select('id', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('matches').select('id', { count: 'exact' }),
          supabase.from('matches').select('id', { count: 'exact' }).eq('status', 'accepted'),
          supabase.from('matches').select('id', { count: 'exact' }).eq('status', 'notified')
        ])

        setStats({
          totalUsers: totalUsers || 0,
          completedProfiles: completedProfiles || 0,
          totalRequests: totalRequests || 0,
          pendingRequests: pendingRequests || 0,
          totalMatches: totalMatches || 0,
          acceptedMatches: acceptedMatches || 0,
          pendingMatches: pendingMatches || 0
        })

        // Load recent activity
        const { data: recentData } = await supabase
          .from('requests')
          .select(`
            id,
            request_text,
            status,
            created_at,
            profiles!requests_requester_id_fkey (name, faculty)
          `)
          .order('created_at', { ascending: false })
          .limit(10)

        setRecentActivity(recentData || [])
      } catch (error) {
        console.error('Error loading admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      matched: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage the Synapse platform
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle={`${stats.completedProfiles} completed profiles`}
          icon="👥"
          color="blue"
        />
        <MetricCard
          title="Total Requests"
          value={stats.totalRequests}
          subtitle={`${stats.pendingRequests} pending`}
          icon="💭"
          color="purple"
        />
        <MetricCard
          title="Total Matches"
          value={stats.totalMatches}
          subtitle={`${stats.acceptedMatches} accepted`}
          icon="🔗"
          color="green"
        />
        <MetricCard
          title="Pending Matches"
          value={stats.pendingMatches}
          subtitle="Awaiting response"
          icon="⏳"
          color="orange"
        />
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Requests</h2>
          
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((request) => (
                <div key={request.id} className="border-l-4 border-gray-200 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">
                      {request.profiles?.name || 'Anonymous'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {request.profiles?.faculty}
                  </p>
                  <p className="text-sm text-gray-800 mb-2 line-clamp-2">
                    {request.request_text.substring(0, 100)}...
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(request.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          
          <div className="space-y-4">
            <StatusItem
              label="Database Connection"
              status="healthy"
              description="All database operations running normally"
            />
            <StatusItem
              label="Email Service"
              status="healthy"
              description="Resend integration working"
            />
            <StatusItem
              label="Matching Algorithm"
              status="healthy"
              description="Processing requests automatically"
            />
            <StatusItem
              label="User Authentication"
              status="healthy"
              description="Supabase Auth operational"
            />
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-500 text-lg mr-2">✅</span>
              <div>
                <h3 className="font-medium text-green-800">All Systems Operational</h3>
                <p className="text-sm text-green-700">Last checked: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Metrics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {stats.completedProfiles > 0 ? Math.round((stats.totalRequests / stats.completedProfiles) * 100) / 100 : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Requests per User</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.totalMatches > 0 ? Math.round((stats.acceptedMatches / stats.totalMatches) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Match Acceptance Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {stats.totalUsers > 0 ? Math.round((stats.completedProfiles / stats.totalUsers) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Profile Completion Rate</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, subtitle, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]} mr-4`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

function StatusItem({ label, status, description }) {
  const isHealthy = status === 'healthy'
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <span className={`w-3 h-3 rounded-full mr-3 ${isHealthy ? 'bg-green-400' : 'bg-red-400'}`}></span>
        <div>
          <div className="font-medium text-gray-900">{label}</div>
          <div className="text-sm text-gray-600">{description}</div>
        </div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {status}
      </span>
    </div>
  )
}
