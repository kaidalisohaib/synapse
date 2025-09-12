'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function Analytics() {
  const [analytics, setAnalytics] = useState({})
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30') // days
  const supabase = createClient()

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(timeRange))

      // Load various analytics data
      const [
        { data: totalUsers },
        { data: totalRequests },
        { data: totalMatches },
        { data: recentUsers },
        { data: recentRequests },
        { data: recentMatches },
        { data: facultyDistribution },
        { data: requestsByFaculty },
        { data: matchScores }
      ] = await Promise.all([
        // Total counts
        supabase.from('profiles').select('id, created_at'),
        supabase.from('requests').select('id, created_at'),
        supabase.from('matches').select('id, created_at, status, match_score'),
        
        // Recent activity (within time range)
        supabase.from('profiles').select('id, created_at').gte('created_at', startDate.toISOString()),
        supabase.from('requests').select('id, created_at').gte('created_at', startDate.toISOString()),
        supabase.from('matches').select('id, created_at, status').gte('created_at', startDate.toISOString()),
        
        // Faculty distribution
        supabase.from('profiles').select('faculty').eq('profile_completed', true),
        supabase.from('requests').select('profiles!requests_requester_id_fkey(faculty)'),
        supabase.from('matches').select('match_score')
      ])

      // Process faculty distribution
      const facultyCounts = {}
      facultyDistribution?.forEach(profile => {
        if (profile.faculty) {
          facultyCounts[profile.faculty] = (facultyCounts[profile.faculty] || 0) + 1
        }
      })

      // Process requests by faculty
      const requestsFacultyCounts = {}
      requestsByFaculty?.forEach(request => {
        const faculty = request.profiles?.faculty
        if (faculty) {
          requestsFacultyCounts[faculty] = (requestsFacultyCounts[faculty] || 0) + 1
        }
      })

      // Calculate engagement metrics
      const completedProfiles = totalUsers?.filter(u => u.created_at) || []
      const avgRequestsPerUser = completedProfiles.length > 0 ? (totalRequests?.length || 0) / completedProfiles.length : 0
      
      // Match success rate
      const acceptedMatches = totalMatches?.filter(m => m.status === 'accepted').length || 0
      const matchSuccessRate = totalMatches?.length > 0 ? (acceptedMatches / totalMatches.length) * 100 : 0

      // Average match score
      const avgMatchScore = matchScores?.length > 0 
        ? matchScores.reduce((sum, m) => sum + (m.match_score || 0), 0) / matchScores.length 
        : 0

      setAnalytics({
        totalUsers: totalUsers?.length || 0,
        totalRequests: totalRequests?.length || 0,
        totalMatches: totalMatches?.length || 0,
        recentUsers: recentUsers?.length || 0,
        recentRequests: recentRequests?.length || 0,
        recentMatches: recentMatches?.length || 0,
        facultyDistribution: facultyCounts,
        requestsByFaculty: requestsFacultyCounts,
        avgRequestsPerUser: Math.round(avgRequestsPerUser * 100) / 100,
        matchSuccessRate: Math.round(matchSuccessRate * 100) / 100,
        avgMatchScore: Math.round(avgMatchScore * 100) / 100
      })

    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = () => {
    const reportData = {
      'Generated': new Date().toISOString(),
      'Time Range': `Last ${timeRange} days`,
      'Total Users': analytics.totalUsers,
      'Total Requests': analytics.totalRequests,
      'Total Matches': analytics.totalMatches,
      'Recent Users': analytics.recentUsers,
      'Recent Requests': analytics.recentRequests,
      'Recent Matches': analytics.recentMatches,
      'Avg Requests per User': analytics.avgRequestsPerUser,
      'Match Success Rate': `${analytics.matchSuccessRate}%`,
      'Average Match Score': analytics.avgMatchScore
    }

    const csvContent = [
      ['Metric', 'Value'],
      ...Object.entries(reportData).map(([key, value]) => [key, value])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `synapse-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Insights and trends for the Synapse platform
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          
          <Button onClick={exportAnalytics} variant="outline">
            📊 Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Platform Growth"
          metrics={[
            { label: 'Total Users', value: analytics.totalUsers, change: `+${analytics.recentUsers} recently` },
            { label: 'Total Requests', value: analytics.totalRequests, change: `+${analytics.recentRequests} recently` },
            { label: 'Total Matches', value: analytics.totalMatches, change: `+${analytics.recentMatches} recently` }
          ]}
          icon="📈"
          color="blue"
        />
        
        <MetricCard
          title="Engagement"
          metrics={[
            { label: 'Avg Requests/User', value: analytics.avgRequestsPerUser, change: 'Higher is better' },
            { label: 'Match Success Rate', value: `${analytics.matchSuccessRate}%`, change: 'Acceptance rate' },
            { label: 'Avg Match Score', value: `${analytics.avgMatchScore} pts`, change: 'Algorithm quality' }
          ]}
          icon="🎯"
          color="green"
        />
        
        <MetricCard
          title="Activity Trends"
          metrics={[
            { label: `New Users (${timeRange}d)`, value: analytics.recentUsers, change: 'User growth' },
            { label: `New Requests (${timeRange}d)`, value: analytics.recentRequests, change: 'Request activity' },
            { label: `New Matches (${timeRange}d)`, value: analytics.recentMatches, change: 'Match generation' }
          ]}
          icon="⚡"
          color="purple"
        />
      </div>

      {/* Faculty Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Distribution by Faculty</h2>
          
          <div className="space-y-3">
            {Object.entries(analytics.facultyDistribution || {})
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([faculty, count]) => {
                const percentage = analytics.totalUsers > 0 ? (count / analytics.totalUsers) * 100 : 0
                return (
                  <div key={faculty} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-900">{faculty}</span>
                        <span className="text-gray-500">{count} users ({Math.round(percentage)}%)</span>
                      </div>
                      <div className="mt-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
          
          {Object.keys(analytics.facultyDistribution || {}).length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No faculty data available
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Activity by Faculty</h2>
          
          <div className="space-y-3">
            {Object.entries(analytics.requestsByFaculty || {})
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([faculty, count]) => {
                const percentage = analytics.totalRequests > 0 ? (count / analytics.totalRequests) * 100 : 0
                return (
                  <div key={faculty} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-900">{faculty}</span>
                        <span className="text-gray-500">{count} requests ({Math.round(percentage)}%)</span>
                      </div>
                      <div className="mt-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
          
          {Object.keys(analytics.requestsByFaculty || {}).length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No request data available
            </div>
          )}
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Insights & Recommendations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Platform Health</h3>
            
            <div className="space-y-3">
              <InsightCard
                type={analytics.matchSuccessRate > 70 ? 'positive' : analytics.matchSuccessRate > 50 ? 'warning' : 'negative'}
                title="Match Success Rate"
                description={
                  analytics.matchSuccessRate > 70 
                    ? "Excellent! High acceptance rate indicates quality matches."
                    : analytics.matchSuccessRate > 50
                    ? "Good, but there's room for improvement in match quality."
                    : "Low acceptance rate. Consider adjusting algorithm parameters."
                }
              />
              
              <InsightCard
                type={analytics.avgRequestsPerUser > 1.5 ? 'positive' : analytics.avgRequestsPerUser > 1 ? 'warning' : 'negative'}
                title="User Engagement"
                description={
                  analytics.avgRequestsPerUser > 1.5
                    ? "Great engagement! Users are actively submitting multiple requests."
                    : analytics.avgRequestsPerUser > 1
                    ? "Moderate engagement. Consider features to encourage more requests."
                    : "Low engagement. Focus on user onboarding and value demonstration."
                }
              />
              
              <InsightCard
                type={analytics.avgMatchScore > 40 ? 'positive' : analytics.avgMatchScore > 25 ? 'warning' : 'negative'}
                title="Algorithm Performance"
                description={
                  analytics.avgMatchScore > 40
                    ? "Algorithm producing high-quality matches consistently."
                    : analytics.avgMatchScore > 25
                    ? "Algorithm performing adequately but could be optimized."
                    : "Algorithm needs tuning - scores are below optimal range."
                }
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Growth Opportunities</h3>
            
            <div className="space-y-3">
              {Object.entries(analytics.facultyDistribution || {}).length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-1">Faculty Diversity</h4>
                  <p className="text-sm text-blue-700">
                    {Object.keys(analytics.facultyDistribution).length} faculties represented. 
                    Consider targeted outreach to underrepresented faculties.
                  </p>
                </div>
              )}
              
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-1">Interdisciplinary Potential</h4>
                <p className="text-sm text-green-700">
                  Strong opportunity for cross-faculty collaboration. Promote the interdisciplinary 
                  benefits to increase participation.
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-1">Platform Evolution</h4>
                <p className="text-sm text-purple-700">
                  Consider adding features like group discussions, topic-based matching, 
                  or feedback collection to enhance the experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, metrics, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200'
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{metric.label}</span>
              <span className="text-lg font-bold text-gray-900">{metric.value}</span>
            </div>
            <div className="text-xs text-gray-500">{metric.change}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InsightCard({ type, title, description }) {
  const typeStyles = {
    positive: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    negative: 'bg-red-50 border-red-200 text-red-800'
  }

  const icons = {
    positive: '✅',
    warning: '⚠️',
    negative: '❌'
  }

  return (
    <div className={`p-3 rounded-lg border ${typeStyles[type]}`}>
      <div className="flex items-start">
        <span className="mr-2 text-sm">{icons[type]}</span>
        <div>
          <h4 className="font-medium text-sm mb-1">{title}</h4>
          <p className="text-xs">{description}</p>
        </div>
      </div>
    </div>
  )
}
