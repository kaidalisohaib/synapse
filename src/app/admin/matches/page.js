'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function MatchesManagement() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterScoreRange, setFilterScoreRange] = useState('')
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          requests (
            id,
            request_text,
            status,
            created_at,
            requester_id
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading matches:', error)
        setMatches([])
        return
      }

      // If we have matches, get the profile information separately
      const matchesWithProfiles = []
      
      for (const match of data || []) {
        try {
          // Get requester profile
          const { data: requesterProfile } = await supabase
            .from('profiles')
            .select('name, faculty, program, year')
            .eq('id', match.requests?.requester_id)
            .single()

          // Get matched user profile  
          const { data: matchedProfile } = await supabase
            .from('profiles')
            .select('name, faculty, program, year')
            .eq('id', match.matched_user_id)
            .single()

          matchesWithProfiles.push({
            ...match,
            requests: {
              ...match.requests,
              profiles: requesterProfile
            },
            profiles: matchedProfile
          })
        } catch (profileError) {
          console.error('Error loading profile for match:', match.id, profileError)
          // Still include the match even if profile loading fails
          matchesWithProfiles.push(match)
        }
      }
      
      setMatches(matchesWithProfiles)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMatches = matches.filter(match => {
    const matchesStatus = !filterStatus || match.status === filterStatus
    
    let matchesScore = true
    if (filterScoreRange) {
      const score = match.match_score || 0
      switch (filterScoreRange) {
        case 'low':
          matchesScore = score < 25
          break
        case 'medium':
          matchesScore = score >= 25 && score < 50
          break
        case 'high':
          matchesScore = score >= 50
          break
      }
    }
    
    return matchesStatus && matchesScore
  })

  const exportMatches = () => {
    const csvContent = [
      ['Match ID', 'Requester', 'Requester Faculty', 'Matched User', 'Matched Faculty', 'Match Score', 'Status', 'Created', 'Request Text'],
      ...filteredMatches.map(match => [
        match.id,
        match.requests.profiles?.name || '',
        match.requests.profiles?.faculty || '',
        match.profiles?.name || '',
        match.profiles?.faculty || '',
        match.match_score || 0,
        match.status || '',
        new Date(match.created_at).toLocaleDateString(),
        match.requests.request_text?.substring(0, 200) || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `synapse-matches-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      notified: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getScoreColor = (score) => {
    if (score >= 50) return 'text-green-600 font-semibold'
    if (score >= 25) return 'text-yellow-600 font-medium'
    return 'text-red-600'
  }

  const getScoreLabel = (score) => {
    if (score >= 50) return 'High'
    if (score >= 25) return 'Medium'
    return 'Low'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Matches Management</h1>
          <p className="mt-2 text-gray-600">
            Monitor and analyze matching performance ({filteredMatches.length} of {matches.length} matches)
          </p>
        </div>
        
        <Button onClick={exportMatches} variant="outline">
          📊 Export CSV
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Matches"
          value={matches.length}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={matches.filter(m => m.status === 'notified').length}
          color="purple"
        />
        <StatCard
          title="Accepted"
          value={matches.filter(m => m.status === 'accepted').length}
          color="green"
        />
        <StatCard
          title="Declined"
          value={matches.filter(m => m.status === 'declined').length}
          color="red"
        />
        <StatCard
          title="Avg Score"
          value={matches.length > 0 ? Math.round(matches.reduce((sum, m) => sum + (m.match_score || 0), 0) / matches.length) : 0}
          color="yellow"
        />
      </div>

      {/* Match Quality Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Match Quality Analysis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {matches.filter(m => m.match_score >= 50).length}
            </div>
            <div className="text-sm text-gray-600">High Quality Matches (50+ points)</div>
            <div className="text-xs text-gray-500">
              {matches.length > 0 ? Math.round((matches.filter(m => m.match_score >= 50).length / matches.length) * 100) : 0}% of total
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {matches.filter(m => m.match_score >= 25 && m.match_score < 50).length}
            </div>
            <div className="text-sm text-gray-600">Medium Quality Matches (25-49 points)</div>
            <div className="text-xs text-gray-500">
              {matches.length > 0 ? Math.round((matches.filter(m => m.match_score >= 25 && m.match_score < 50).length / matches.length) * 100) : 0}% of total
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {matches.filter(m => m.match_score < 25).length}
            </div>
            <div className="text-sm text-gray-600">Low Quality Matches (&lt;25 points)</div>
            <div className="text-xs text-gray-500">
              {matches.length > 0 ? Math.round((matches.filter(m => m.match_score < 25).length / matches.length) * 100) : 0}% of total
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Algorithm Performance</h3>
          <div className="text-sm text-blue-700">
            <p>
              <strong>Acceptance Rate:</strong> {' '}
              {matches.length > 0 
                ? Math.round((matches.filter(m => m.status === 'accepted').length / matches.length) * 100)
                : 0}% of matches are accepted
            </p>
            <p>
              <strong>Average Response Time:</strong> Data available with future updates
            </p>
            <p>
              <strong>Quality Indicator:</strong> {' '}
              {matches.filter(m => m.match_score >= 50).length > matches.filter(m => m.match_score < 25).length 
                ? '✅ Good - More high-quality than low-quality matches'
                : '⚠️ Needs attention - Consider adjusting algorithm weights'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="notified">Notified (Pending)</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Match Score Range
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
              value={filterScoreRange}
              onChange={(e) => setFilterScoreRange(e.target.value)}
            >
              <option value="">All Scores</option>
              <option value="high">High (50+ points)</option>
              <option value="medium">Medium (25-49 points)</option>
              <option value="low">Low (&lt;25 points)</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={() => {
                setFilterStatus('')
                setFilterScoreRange('')
              }}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Matches Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Match Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matched User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMatches.map((match) => (
                <tr key={match.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        Match #{match.id.substring(0, 8)}
                      </div>
                      <div className="text-gray-500">
                        Request #{match.requests.id.substring(0, 8)}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {match.requests.profiles?.name || 'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {match.requests.profiles?.faculty}
                      </div>
                      <div className="text-sm text-gray-500">
                        {match.requests.profiles?.program} ({match.requests.profiles?.year})
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {match.profiles?.name || 'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {match.profiles?.faculty}
                      </div>
                      <div className="text-sm text-gray-500">
                        {match.profiles?.program} ({match.profiles?.year})
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getScoreColor(match.match_score || 0)}`}>
                      {match.match_score || 0} pts
                    </div>
                    <div className="text-xs text-gray-500">
                      {getScoreLabel(match.match_score || 0)} Quality
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(match.status)}`}>
                      {match.status}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(match.created_at)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedMatch(match)
                        setShowModal(true)
                      }}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredMatches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No matches found matching your filters.</div>
          </div>
        )}
      </div>

      {/* Match Details Modal */}
      {showModal && selectedMatch && (
        <MatchDetailsModal
          match={selectedMatch}
          onClose={() => {
            setShowModal(false)
            setSelectedMatch(null)
          }}
        />
      )}
    </div>
  )
}

function StatCard({ title, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  )
}

function MatchDetailsModal({ match, onClose }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      notified: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getScoreColor = (score) => {
    if (score >= 50) return 'text-green-600 font-semibold'
    if (score >= 25) return 'text-yellow-600 font-medium'
    return 'text-red-600'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Match Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Match Overview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Match Overview</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Match ID</label>
                  <div className="mt-1 text-sm text-gray-900 font-mono">{match.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(match.status)}`}>
                      {match.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Match Score</label>
                  <div className={`mt-1 text-lg font-bold ${getScoreColor(match.match_score || 0)}`}>
                    {match.match_score || 0} points
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Match Created</label>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(match.created_at)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expires</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {match.expires_at ? formatDate(match.expires_at) : 'No expiration'}
                  </div>
                </div>
              </div>
            </div>

            {/* Requester Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Requester (Seeking Help)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <div className="mt-1 text-sm text-gray-900">{match.requests.profiles?.name || 'Not provided'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Faculty</label>
                  <div className="mt-1 text-sm text-gray-900">{match.requests.profiles?.faculty || 'Not provided'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Program</label>
                  <div className="mt-1 text-sm text-gray-900">{match.requests.profiles?.program || 'Not provided'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <div className="mt-1 text-sm text-gray-900">{match.requests.profiles?.year || 'Not provided'}</div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Request Text</label>
                <div className="mt-1 text-sm text-gray-900 bg-white p-3 rounded border">
                  {match.requests.request_text}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Request Created</label>
                <div className="mt-1 text-sm text-gray-900">{formatDate(match.requests.request_created)}</div>
              </div>
            </div>

            {/* Matched User Info */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Matched User (Providing Help)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <div className="mt-1 text-sm text-gray-900">{match.profiles?.name || 'Not provided'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Faculty</label>
                  <div className="mt-1 text-sm text-gray-900">{match.profiles?.faculty || 'Not provided'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Program</label>
                  <div className="mt-1 text-sm text-gray-900">{match.profiles?.program || 'Not provided'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <div className="mt-1 text-sm text-gray-900">{match.profiles?.year || 'Not provided'}</div>
                </div>
              </div>
            </div>

            {/* Match Analysis */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Match Analysis</h3>
              <div className="text-sm text-gray-700">
                <p className="mb-2">
                  <strong>Score Breakdown:</strong> This match scored {match.match_score || 0} points based on our algorithm.
                </p>
                <p className="mb-2">
                  <strong>Quality Assessment:</strong> {' '}
                  {match.match_score >= 50 
                    ? '🟢 High quality match - Strong alignment between request and matched user expertise'
                    : match.match_score >= 25
                    ? '🟡 Medium quality match - Some alignment but could be improved'
                    : '🔴 Low quality match - Limited alignment, algorithm may need adjustment'
                  }
                </p>
                <p>
                  <strong>Interdisciplinary Factor:</strong> {' '}
                  {match.requests.profiles?.faculty !== match.profiles?.faculty
                    ? '✅ Cross-faculty match (bonus applied)'
                    : '➖ Same faculty match'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
