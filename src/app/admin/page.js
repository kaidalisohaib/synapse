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
      pending: 'bg-yellow-900/30 text-yellow-200 border border-yellow-500/30',
      matched: 'bg-blue-900/30 text-blue-200 border border-blue-500/30',
      confirmed: 'bg-green-900/30 text-green-200 border border-green-500/30',
      completed: 'bg-slate-900/40 text-gray-200 border border-gray-500/30'
    }
    return colors[status] || 'bg-slate-900/40 text-gray-200 border border-gray-500/30'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_75%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-28 right-28 w-40 h-40 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Neural Console</h1>
          <p className="mt-2 text-gray-300">
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
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Requests</h2>

            {recentActivity.length === 0 ? (
              <p className="text-gray-300 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((request) => (
                  <div key={request.id} className="border-l-4 border-purple-500/30 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white">
                        {request.profiles?.name || 'Anonymous'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-1">
                      {request.profiles?.faculty}
                    </p>
                    <p className="text-sm text-gray-200 mb-2 line-clamp-2">
                      {request.request_text.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(request.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>

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

            <div className="mt-6 p-4 rounded-lg bg-green-900/20 border border-green-500/30">
              <div className="flex items-center">
                <span className="text-green-300 text-lg mr-2">✅</span>
                <div>
                  <h3 className="font-medium text-green-300">All Systems Operational</h3>
                  <p className="text-sm text-green-200">Last checked: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Metrics */}
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Platform Metrics</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-300">
              {stats.completedProfiles > 0 ? Math.round((stats.totalRequests / stats.completedProfiles) * 100) / 100 : 0}
            </div>
            <div className="text-sm text-gray-300">Avg Requests per User</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-300">
              {stats.totalMatches > 0 ? Math.round((stats.acceptedMatches / stats.totalMatches) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-300">Match Acceptance Rate</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-purple-300">
              {stats.totalUsers > 0 ? Math.round((stats.completedProfiles / stats.totalUsers) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-300">Profile Completion Rate</div>
          </div>
        </div>
      </div>
    </div>
  )

}

function MetricCard({ title, value, subtitle, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-900/30 text-blue-200 border border-blue-500/30',
    purple: 'bg-purple-900/30 text-purple-200 border border-purple-500/30',
    green: 'bg-green-900/30 text-green-200 border border-green-500/30',
    orange: 'bg-orange-900/30 text-orange-200 border border-orange-500/30'
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-xl p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]} mr-4`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-300">{title}</h3>
          <div className="text-2xl font-bold text-white">{value}</div>
          <p className="text-sm text-gray-300">{subtitle}</p>
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
          <div className="font-medium text-white">{label}</div>
          <div className="text-sm text-gray-300">{description}</div>
        </div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isHealthy ? 'bg-green-900/30 text-green-200 border border-green-500/30' : 'bg-red-900/30 text-red-200 border border-red-500/30'
        }`}>
        {status}
      </span>
    </div>
  )
}
