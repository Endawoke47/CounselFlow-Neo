'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { mockEntities, Entity } from '../../lib/mock-data';
import { Building2, Plus, Search, Download, Upload, Edit3, Trash2, Eye, CheckCircle, AlertTriangle, BarChart3, Calendar, FileText, Users, TrendingUp, Clock } from 'lucide-react';

interface EntityDisplay {
  id: string;
  name: string;
  type: string;
  jurisdiction: string;
  status: string;
  incorporationDate: string;
  lastFiling: string;
  compliance: number;
  subsidiaries: number;
  riskLevel: string;
}

export default function EntityManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [entities, setEntities] = useState<EntityDisplay[]>([]);

  useEffect(() => {
    // Transform mock entities to display format
    const transformedEntities: EntityDisplay[] = mockEntities.map(entity => {
      return {
        id: entity.id,
        name: entity.name,
        type: entity.entityType,
        jurisdiction: entity.jurisdiction,
        status: entity.status,
        incorporationDate: entity.incorporationDate,
        lastFiling: '2024-12-01', // Mock last filing date
        compliance: entity.complianceStatus === 'current' ? 95 : 
                   entity.complianceStatus === 'pending' ? 75 : 45,
        subsidiaries: entity.subsidiaries.length,
        riskLevel: entity.complianceStatus === 'current' ? 'Low' : 
                  entity.complianceStatus === 'pending' ? 'Medium' : 'High'
      };
    });
    setEntities(transformedEntities);
  }, []);

  const [isAddingEntity, setIsAddingEntity] = useState(false);
  const [editingEntity, setEditingEntity] = useState<EntityDisplay | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<EntityDisplay | null>(null);

  // Handlers for functionality
  const handleAddEntity = () => {
    setIsAddingEntity(true);
  };

  const handleEditEntity = (entity: EntityDisplay) => {
    setEditingEntity(entity);
    setIsAddingEntity(true);
  };

  const handleDeleteEntity = (entityId: string) => {
    if (confirm('Are you sure you want to delete this entity?')) {
      setEntities(entities.filter(e => e.id !== entityId));
    }
  };

  const handleViewEntity = (entity: EntityDisplay) => {
    setSelectedEntity(entity);
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Name', 'Type', 'Jurisdiction', 'Status', 'Incorporation Date', 'Last Filing', 'Compliance', 'Subsidiaries', 'Risk Level'],
      ...entities.map(e => [e.id, e.name, e.type, e.jurisdiction, e.status, e.incorporationDate, e.lastFiling, e.compliance.toString(), e.subsidiaries.toString(), e.riskLevel])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'entities.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        alert('Import functionality implemented - CSV file selected: ' + file.name);
      }
    };
    input.click();
  };

  const handleSaveEntity = (entityData: Partial<EntityDisplay>) => {
    if (editingEntity) {
      // Update existing entity
      setEntities(entities.map(e => e.id === editingEntity.id ? { ...e, ...entityData } : e));
    } else {
      // Add new entity
      const newEntity: EntityDisplay = {
        id: `ENT${String(entities.length + 1).padStart(3, '0')}`,
        name: entityData.name || '',
        type: entityData.type || '',
        jurisdiction: entityData.jurisdiction || '',
        status: entityData.status || 'active',
        incorporationDate: entityData.incorporationDate || new Date().toISOString().split('T')[0],
        lastFiling: entityData.lastFiling || '',
        compliance: entityData.compliance || 0,
        subsidiaries: entityData.subsidiaries || 0,
        riskLevel: entityData.riskLevel || 'Medium'
      };
      setEntities([...entities, newEntity]);
    }
    setIsAddingEntity(false);
    setEditingEntity(null);
  };

  const stats = [
    { label: 'Total Entities', value: '127', change: '+12', icon: Building2, color: 'text-primary-600' },
    { label: 'Active Entities', value: '95', change: '+8', icon: CheckCircle, color: 'text-success-600' },
    { label: 'Compliance Rate', value: '89%', change: '+3%', icon: BarChart3, color: 'text-secondary-600' },
    { label: 'High Risk', value: '12', change: '-2', icon: AlertTriangle, color: 'text-error-600' }
  ];

  const upcomingFilings = [
    { entity: 'TechCorp Holdings Ltd', filing: 'Annual Return', dueDate: '2025-01-15', daysLeft: 8 },
    { entity: 'Digital Solutions Uganda Ltd', filing: 'Tax Return', dueDate: '2025-01-20', daysLeft: 13 },
    { entity: 'African Innovations SA', filing: 'Compliance Certificate', dueDate: '2025-01-25', daysLeft: 18 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-success-100 text-success-800';
      case 'Pending': return 'bg-warning-100 text-warning-800';
      case 'Inactive': return 'bg-neutral-100 text-neutral-800';
      case 'Dissolved': return 'bg-error-100 text-error-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-success-100 text-success-800';
      case 'Medium': return 'bg-warning-100 text-warning-800';
      case 'High': return 'bg-error-100 text-error-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  // Filter entities based on search and filter
  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && entity.status.toLowerCase() === selectedFilter;
  });

  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 flex items-center">
                <Building2 className="mr-3 h-8 w-8 text-primary-600" />
                Entity Management
              </h1>
              <p className="text-neutral-600 mt-2">Corporate Entities & Organizational Intelligence</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleImport}
                className="flex items-center px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </button>
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={handleAddEntity}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Entity
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <span className="ml-2 text-sm text-green-600">{stat.change}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search entities..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="dissolved">Dissolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Entities Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Entity Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jurisdiction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntities.map((entity) => (
                  <tr key={entity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{entity.name}</div>
                          <div className="text-sm text-gray-500">{entity.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entity.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entity.jurisdiction}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entity.status)}`}>
                        {entity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${entity.compliance >= 90 ? 'bg-green-500' : entity.compliance >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${entity.compliance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{entity.compliance}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(entity.riskLevel)}`}>
                        {entity.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewEntity(entity)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditEntity(entity)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntity(entity.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insights & Upcoming Filings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Upcoming Filings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                Upcoming Filings
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-800">View All</button>
            </div>
            <div className="space-y-4">
              {upcomingFilings.map((filing, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{filing.entity}</p>
                    <p className="text-sm text-gray-600">{filing.filing}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">{filing.daysLeft} days</p>
                    <p className="text-xs text-gray-500">{filing.dueDate}</p>
                  </div>
                </div>
              ))}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-orange-600 mt-1">3 entities have filings due within 14 days</p>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                AI Insights
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-800">Refresh</button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Compliance Optimization</p>
                <p className="text-xs text-gray-600 mt-1">5 entities can improve compliance scores by updating documentation</p>
                <p className="text-xs text-green-600 mt-1">Tax optimization available for Kenya entities</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Risk Assessment</p>
                <p className="text-xs text-gray-600 mt-1">Digital Solutions Uganda Ltd requires immediate attention</p>
                <p className="text-xs text-primary-600 mt-1">Risk score decreased by 15% this month</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Strategic Recommendation</p>
                <p className="text-xs text-gray-600 mt-1">Consider subsidiary restructuring for tax efficiency</p>
                <p className="text-xs text-purple-600 mt-1">Potential savings: $45,000 annually</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Entity Modal */}
      {isAddingEntity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              {editingEntity ? 'Edit Entity' : 'Add New Entity'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const entityData = {
                name: formData.get('name') as string,
                type: formData.get('type') as string,
                jurisdiction: formData.get('jurisdiction') as string,
                status: formData.get('status') as string,
                incorporationDate: formData.get('incorporationDate') as string,
                lastFiling: formData.get('lastFiling') as string,
                compliance: parseInt(formData.get('compliance') as string) || 0,
                subsidiaries: parseInt(formData.get('subsidiaries') as string) || 0,
                riskLevel: formData.get('riskLevel') as string
              };
              handleSaveEntity(entityData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entity Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingEntity?.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="type"
                    required
                    defaultValue={editingEntity?.type}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Private Limited Company">Private Limited Company</option>
                    <option value="Public Limited Company">Public Limited Company</option>
                    <option value="Holding Company">Holding Company</option>
                    <option value="Subsidiary">Subsidiary</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Branch Office">Branch Office</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
                  <select
                    name="jurisdiction"
                    required
                    defaultValue={editingEntity?.jurisdiction}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Jurisdiction</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Nigeria">Nigeria</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    required
                    defaultValue={editingEntity?.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Dissolved">Dissolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Incorporation Date</label>
                  <input
                    type="date"
                    name="incorporationDate"
                    defaultValue={editingEntity?.incorporationDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Filing</label>
                  <input
                    type="date"
                    name="lastFiling"
                    defaultValue={editingEntity?.lastFiling}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compliance %</label>
                  <input
                    type="number"
                    name="compliance"
                    min="0"
                    max="100"
                    defaultValue={editingEntity?.compliance}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                  <select
                    name="riskLevel"
                    defaultValue={editingEntity?.riskLevel}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingEntity ? 'Update Entity' : 'Add Entity'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingEntity(false);
                    setEditingEntity(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </MainLayout>
  );
}
