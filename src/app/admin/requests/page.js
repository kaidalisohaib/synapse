'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function RequestsManagement() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterFaculty, setFilterFaculty] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          profiles!requests_requester_id_fkey (
            name,
            faculty,
            program,
            year
          ),
          matches (
            id,
            status,
            match_score,
            matched_user_id,
            created_at,
            profiles!matches_matched_user_id_fkey (
              name,
              faculty,
              program
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading requests:', error)
      } else {
        setRequests(data || [])
      }
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = !searchTerm || 
      request.request_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filterStatus || request.status === filterStatus
    
    const matchesFaculty = !filterFaculty || request.profiles?.faculty === filterFaculty
    
    return matchesSearch && matchesStatus && matchesFaculty
  })

  const exportRequests = () => {
    const csvContent = [
      ['Requester', 'Faculty', 'Program', 'Request Text', 'Status', 'Created', 'Matches Count', 'Match Status'],
      ...filteredRequests.map(request => [
        request.profiles?.name || '',
        request.profiles?.faculty || '',
        request.profiles?.program || '',
        request.request_text || '',
        request.status || '',
        new Date(request.created_at).toLocaleDateString(),
        request.matches?.length || 0,
        request.matches?.[0]?.status || 'No matches'
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `synapse-requests-${new Date().toISOString().split('T')[0]}.csv`
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
      pending: 'bg-yellow-100 text-yellow-800',
      matched: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      no_match_found: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      matched: 'Matched',
      confirmed: 'Confirmed',
      completed: 'Completed',
      no_match_found: 'No Match Found'
    }
    return labels[status] || status
  }

  const faculties = [
    'Agricultural and Environmental Sciences',
    'Arts',
    'Dentistry',
    'Education',
    'Engineering',
    'Law',
    'Management',
    'Medicine and Health Sciences',
    'Music',
    'Religious Studies',
    'Science',
    'Continuing Studies'
  ]

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
          <h1 className="text-3xl font-bold text-gray-900">Requests Management</h1>
          <p className="mt-2 text-gray-600">
            Monitor and analyze curiosity requests ({filteredRequests.length} of {requests.length} requests)
          </p>
        </div>
        
        <Button onClick={exportRequests} variant="outline">
          📊 Export CSV
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Requests"
          value={requests.length}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={requests.filter(r => r.status === 'pending').length}
          color="yellow"
        />
        <StatCard
          title="Matched"
          value={requests.filter(r => r.status === 'matched').length}
          color="blue"
        />
        <StatCard
          title="Confirmed"
          value={requests.filter(r => r.status === 'confirmed').length}
          color="green"
        />
        <StatCard
          title="No Match"
          value={requests.filter(r => r.status === 'no_match_found').length}
          color="red"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Requests
            </label>
            <input
              type="text"
              placeholder="Search by text or requester..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
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
              <option value="pending">Pending</option>
              <option value="matched">Matched</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="no_match_found">No Match Found</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Faculty
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
              value={filterFaculty}
              onChange={(e) => setFilterFaculty(e.target.value)}
            >
              <option value="">All Faculties</option>
              {faculties.map(faculty => (
                <option key={faculty} value={faculty}>{faculty}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('')
                setFilterFaculty('')
              }}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matches
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
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {request.profiles?.name || 'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.profiles?.faculty}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.profiles?.program} ({request.profiles?.year})
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-sm text-gray-900 truncate">
                      {request.request_text?.substring(0, 100)}
                      {request.request_text?.length > 100 && '...'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.matches?.length || 0} match{request.matches?.length !== 1 ? 'es' : ''}
                    </div>
                    {request.matches?.[0] && (
                      <div className="text-sm text-gray-500">
                        Latest: {request.matches[0].profiles?.name} 
                        ({request.matches[0].status})
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(request.created_at)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request)
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
        
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No requests found matching your filters.</div>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showModal && selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => {
            setShowModal(false)
            setSelectedRequest(null)
          }}
        />
      )}
    </div>
  )
}

function StatCard({ title, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  )
}

function RequestDetailsModal({ request, onClose }) {
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
      pending: 'bg-yellow-100 text-yellow-800',
      matched: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      no_match_found: 'bg-red-100 text-red-800',
      notified: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Request Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Request Information</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Request ID</label>
                  <div className="mt-1 text-sm text-gray-900 font-mono">{request.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Request Text</label>
                <div className="mt-1 text-sm text-gray-900 bg-white p-3 rounded border">
                  {request.request_text}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <div className="mt-1 text-sm text-gray-900">{formatDate(request.created_at)}</div>
              </div>
            </div>

            {/* Requester Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Requester Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <div className="mt-1 text-sm text-gray-900">{request.profiles?.name || 'Not provided'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Faculty</label>
                  <div className="mt-1 text-sm text-gray-900">{request.profiles?.faculty || 'Not provided'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Program</label>
                  <div className="mt-1 text-sm text-gray-900">{request.profiles?.program || 'Not provided'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <div className="mt-1 text-sm text-gray-900">{request.profiles?.year || 'Not provided'}</div>
                </div>
              </div>
            </div>

            {/* Matches Info */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">
                Matches ({request.matches?.length || 0})
              </h3>
              
              {request.matches?.length > 0 ? (
                <div className="space-y-3">
                  {request.matches.map((match) => (
                    <div key={match.id} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {match.profiles?.name || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {match.profiles?.faculty} - {match.profiles?.program}
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(match.status)}`}>
                          {match.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Match Score: {match.match_score} points</div>
                        <div>Created: {formatDate(match.created_at)}</div>
                        <div>Match ID: {match.id}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-600">No matches found for this request.</div>
              )}
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
