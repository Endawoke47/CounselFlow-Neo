'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../providers/auth-provider';
import { Building2, Plus, Search, Edit3, Trash2, Eye, Mail, Phone, MapPin, User, TrendingUp } from 'lucide-react';
import { productionApiClient } from '@/lib/production-api-client';

// Frontend display interface for clients
interface ClientDisplay {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  clientType: string;
  industry?: string;
  description?: string;
  status: string;
  totalAssets?: number;
  riskScore?: number;
  lastActivity?: string;
}

export default function ClientManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [clients, setClients] = useState<ClientDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientDisplay | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientDisplay | null>(null);
  
  const { user } = useAuth();

  // Load clients from API
  useEffect(() => {
    loadClients();
  }, [searchTerm, selectedFilter]); // Re-load when search or filter changes

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Real API call to production backend
      const response = await productionApiClient.getClients({
        search: searchTerm || undefined,
        status: selectedFilter !== 'all' ? selectedFilter : undefined,
      });
      
      if (response.success && response.data) {
        // Transform API response to display format
        const transformedClients: ClientDisplay[] = response.data.clients.map(client => ({
          id: client.id,
          name: client.name,
          email: client.email,
          phoneNumber: client.phoneNumber,
          address: client.address,
          clientType: client.clientType,
          industry: client.industry,
          description: client.description,
          status: client.status,
          totalAssets: client.totalAssets,
          riskScore: client.riskScore,
          lastActivity: client.lastActivity
        }));
        
        setClients(transformedClients);
      } else {
        throw new Error(response.message || 'Failed to load clients');
      }
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load clients:', err);
      setError(err.message || 'Failed to load clients');
      
      // If API fails, show empty state instead of mock data for production
      setClients([]);
      setIsLoading(false);
    }
  };

  const handleSaveClient = async (clientData: Partial<ClientDisplay>) => {
    try {
      // Mock save functionality for demonstration
      if (editingClient) {
        // Update existing client
        setClients(clients.map(c => c.id === editingClient.id ? {
          ...c,
          ...clientData
        } : c));
      } else {
        // Add new client
        const newClient: ClientDisplay = {
          id: (clients.length + 1).toString(),
          name: clientData.name || '',
          email: clientData.email || '',
          phoneNumber: clientData.phoneNumber,
          address: clientData.address,
          clientType: clientData.clientType || 'Individual',
          industry: clientData.industry,
          description: clientData.description,
          status: clientData.status || 'Active',
          totalAssets: clientData.totalAssets,
          riskScore: clientData.riskScore || 50,
          lastActivity: new Date().toISOString().split('T')[0]
        };
        setClients([...clients, newClient]);
      }
    } catch (err: any) {
      console.error('Failed to save client:', err);
      alert('Failed to save client: ' + (err.message || 'Unknown error'));
      return;
    }
    
    setIsAddingClient(false);
    setEditingClient(null);
  };

  const handleEditClient = (client: ClientDisplay) => {
    setEditingClient(client);
    setIsAddingClient(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        // Mock delete functionality
        setClients(clients.filter(c => c.id !== clientId));
      } catch (err: any) {
        console.error('Failed to delete client:', err);
        alert('Failed to delete client: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleViewClient = (client: ClientDisplay) => {
    setSelectedClient(client);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientTypeColor = (type: string) => {
    switch (type) {
      case 'Corporate': return 'bg-blue-100 text-blue-800';
      case 'Individual': return 'bg-purple-100 text-purple-800';
      case 'Government': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || client.status.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Total Clients', value: clients.length.toString(), change: '+8', icon: Building2, color: 'text-primary-600' },
    { label: 'Active Clients', value: clients.filter(c => c.status === 'Active').length.toString(), change: '+5', icon: User, color: 'text-green-600' },
    { label: 'Corporate Clients', value: clients.filter(c => c.clientType === 'Corporate').length.toString(), change: '+2', icon: Building2, color: 'text-blue-600' },
    { label: 'Total Assets', value: `KES ${(clients.reduce((sum, c) => sum + (c.totalAssets || 0), 0) / 1000000).toFixed(1)}M`, change: '+12%', icon: TrendingUp, color: 'text-purple-600' }
  ];

  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">Client Management</h1>
            <p className="mt-2 text-lg text-neutral-600">Manage your client relationships and information</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading client data</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-lg bg-opacity-10 ${stat.color.replace('text-', 'bg-')}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-neutral-500 truncate">{stat.label}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-success-600">
                          <TrendingUp className="self-center flex-shrink-0 h-4 w-4" />
                          <span className="ml-1">{stat.change}</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <button
              onClick={() => setIsAddingClient(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </button>
          </div>

          {/* Clients Table */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Industry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Assets
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                        No clients found
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-700">
                                  {client.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-neutral-900">{client.name}</div>
                              <div className="text-sm text-neutral-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {client.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getClientTypeColor(client.clientType)}`}>
                            {client.clientType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {client.industry || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {client.totalAssets ? `KES ${(client.totalAssets / 1000000).toFixed(1)}M` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewClient(client)}
                              className="text-primary-600 hover:text-primary-900"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditClient(client)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClient(client.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Client Modal */}
      {isAddingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const clientData = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phoneNumber: formData.get('phoneNumber') as string,
                address: formData.get('address') as string,
                clientType: formData.get('clientType') as string,
                industry: formData.get('industry') as string,
                description: formData.get('description') as string,
                status: formData.get('status') as string,
                totalAssets: parseInt(formData.get('totalAssets') as string) || 0,
                riskScore: parseInt(formData.get('riskScore') as string) || 50
              };
              handleSaveClient(clientData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingClient?.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={editingClient?.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    defaultValue={editingClient?.phoneNumber}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={editingClient?.address}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Type *</label>
                  <select
                    name="clientType"
                    required
                    defaultValue={editingClient?.clientType}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Individual">Individual</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Government">Government</option>
                    <option value="NGO">NGO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select
                    name="industry"
                    defaultValue={editingClient?.industry}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingClient?.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Former">Former</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Assets ($)</label>
                  <input
                    type="number"
                    name="totalAssets"
                    min="0"
                    defaultValue={editingClient?.totalAssets}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingClient?.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Score (0-100)</label>
                  <input
                    type="number"
                    name="riskScore"
                    min="0"
                    max="100"
                    defaultValue={editingClient?.riskScore}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingClient(false);
                    setEditingClient(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingClient ? 'Update Client' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
