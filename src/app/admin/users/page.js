'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { mcgillConfig } from '@/lib/config'

export default function UsersManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFaculty, setFilterFaculty] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()

  const faculties = mcgillConfig.faculties

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          faculty,
          program,
          year,
          email_verified,
          profile_completed,
          created_at,
          updated_at,
          knowledgeTags,
          curiosityTags
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading users:', error)
      } else {
        setUsers(data || [])
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.program?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFaculty = !filterFaculty || user.faculty === filterFaculty
    
    const matchesStatus = !filterStatus || 
      (filterStatus === 'completed' && user.profile_completed) ||
      (filterStatus === 'incomplete' && !user.profile_completed) ||
      (filterStatus === 'verified' && user.email_verified) ||
      (filterStatus === 'unverified' && !user.email_verified)
    
    return matchesSearch && matchesFaculty && matchesStatus
  })

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Faculty', 'Program', 'Year', 'Profile Completed', 'Email Verified', 'Created At', 'Knowledge Tags', 'Curiosity Tags'],
      ...filteredUsers.map(user => [
        user.name || '',
        user.faculty || '',
        user.program || '',
        user.year || '',
        user.profile_completed ? 'Yes' : 'No',
        user.email_verified ? 'Yes' : 'No',
        new Date(user.created_at).toLocaleDateString(),
        user.knowledgeTags?.join('; ') || '',
        user.curiosityTags?.join('; ') || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `synapse-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-2 text-gray-600">
            Monitor and manage registered users ({filteredUsers.length} of {users.length} users)
          </p>
        </div>
        
        <Button onClick={exportUsers} variant="outline">
          📊 Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
            </label>
            <input
              type="text"
              placeholder="Search by name or program..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
              <option value="completed">Profile Completed</option>
              <option value="incomplete">Profile Incomplete</option>
              <option value="verified">Email Verified</option>
              <option value="unverified">Email Unverified</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={() => {
                setSearchTerm('')
                setFilterFaculty('')
                setFilterStatus('')
              }}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.name || 'Unnamed User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {user.id.substring(0, 8)}...
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.faculty || 'Not specified'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.program} {user.year && `(${user.year})`}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.profile_completed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.profile_completed ? 'Complete' : 'Incomplete'}
                      </span>
                      <br />
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.email_verified 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.email_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="mb-2">
                        <span className="font-medium text-gray-700">Knowledge:</span>
                        <div className="mt-1">
                          {user.knowledgeTags?.length > 0 ? (
                            <span className="text-xs text-gray-600">
                              {user.knowledgeTags.length} tag{user.knowledgeTags.length !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Curiosity:</span>
                        <div className="mt-1">
                          {user.curiosityTags?.length > 0 ? (
                            <span className="text-xs text-gray-600">
                              {user.curiosityTags.length} tag{user.curiosityTags.length !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user)
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
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No users found matching your filters.</div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowModal(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}

function UserDetailsModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1 text-sm text-gray-900">{user.name || 'Not provided'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <div className="mt-1 text-sm text-gray-900 font-mono">{user.id}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Faculty</label>
                <div className="mt-1 text-sm text-gray-900">{user.faculty || 'Not provided'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Program</label>
                <div className="mt-1 text-sm text-gray-900">{user.program || 'Not provided'}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <div className="mt-1 text-sm text-gray-900">{user.year || 'Not provided'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Joined</label>
                <div className="mt-1 text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Knowledge Tags</label>
              <div className="flex flex-wrap gap-2">
                {user.knowledgeTags?.length > 0 ? (
                  user.knowledgeTags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No knowledge tags</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Curiosity Tags</label>
              <div className="flex flex-wrap gap-2">
                {user.curiosityTags?.length > 0 ? (
                  user.curiosityTags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No curiosity tags</span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Status</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.profile_completed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.profile_completed ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Status</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.email_verified 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.email_verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
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
