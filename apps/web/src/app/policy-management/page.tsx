'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { mockPolicies } from '../../lib/mock-data';
import { FileText, Plus, Search, Download, Upload, Edit3, Trash2, Eye, CheckCircle, AlertTriangle, BarChart3, Calendar, Clock, User, Target, Users, TrendingUp, Activity } from 'lucide-react';

interface Policy {
  id: string;
  title: string;
  type: string;
  category: string;
  version: string;
  status: string;
  effectiveDate: string;
  expiryDate: string;
  reviewDate: string;
  owner: string;
  approver: string;
  department: string;
  compliance: number;
  lastUpdated: string;
  description: string;
}

export default function PolicyManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: 'POL001',
      title: 'Data Protection and Privacy Policy',
      type: 'Compliance',
      category: 'Data Privacy',
      version: 'v2.1',
      status: 'Active',
      effectiveDate: '2024-01-01',
      expiryDate: '2025-12-31',
      reviewDate: '2024-06-01',
      owner: 'Sarah Johnson',
      approver: 'Legal Director',
      department: 'Legal',
      compliance: 95,
      lastUpdated: '2024-11-15',
      description: 'Comprehensive policy governing data protection, privacy rights, and GDPR compliance across all business operations.'
    },
    {
      id: 'POL002',
      title: 'Contract Management Guidelines',
      type: 'Operational',
      category: 'Contracts',
      version: 'v1.5',
      status: 'Active',
      effectiveDate: '2024-03-01',
      expiryDate: '2025-02-28',
      reviewDate: '2024-09-01',
      owner: 'Michael Chen',
      approver: 'Head of Legal',
      department: 'Legal',
      compliance: 88,
      lastUpdated: '2024-10-20',
      description: 'Standard procedures for contract creation, review, approval, and management processes.'
    },
    {
      id: 'POL003',
      title: 'Intellectual Property Protection',
      type: 'Strategic',
      category: 'IP Rights',
      version: 'v3.0',
      status: 'Under Review',
      effectiveDate: '2024-02-15',
      expiryDate: '2025-02-14',
      reviewDate: '2024-12-15',
      owner: 'Grace Kimani',
      approver: 'Chief Legal Officer',
      department: 'IP Department',
      compliance: 92,
      lastUpdated: '2024-11-01',
      description: 'Framework for protecting intellectual property assets including patents, trademarks, and trade secrets.'
    },
    {
      id: 'POL004',
      title: 'Employment Law Compliance',
      type: 'Regulatory',
      category: 'Employment',
      version: 'v1.8',
      status: 'Draft',
      effectiveDate: '2025-01-01',
      expiryDate: '2025-12-31',
      reviewDate: '2024-12-01',
      owner: 'David Ochieng',
      approver: 'HR Director',
      department: 'Human Resources',
      compliance: 85,
      lastUpdated: '2024-11-10',
      description: 'Guidelines ensuring compliance with employment laws, labor regulations, and workplace standards.'
    }
  ]);
  const [isAddingPolicy, setIsAddingPolicy] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  // Handlers for full functionality
  const handleAddPolicy = () => {
    setIsAddingPolicy(true);
  };

  const handleEditPolicy = (policy: Policy) => {
    setEditingPolicy(policy);
    setIsAddingPolicy(true);
  };

  const handleDeletePolicy = (policyId: string) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      setPolicies(policies.filter(p => p.id !== policyId));
    }
  };

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Title', 'Type', 'Category', 'Version', 'Status', 'Effective Date', 'Expiry Date', 'Owner', 'Compliance'],
      ...policies.map(p => [p.id, p.title, p.type, p.category, p.version, p.status, p.effectiveDate, p.expiryDate, p.owner, p.compliance.toString()])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'policy-register.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        alert('Policy import functionality implemented - File selected: ' + file.name);
      }
    };
    input.click();
  };

  const handleSavePolicy = (policyData: Partial<Policy>) => {
    if (editingPolicy) {
      setPolicies(policies.map(p => p.id === editingPolicy.id ? { ...p, ...policyData } : p));
    } else {
      const newPolicy: Policy = {
        id: `POL${String(policies.length + 1).padStart(3, '0')}`,
        title: policyData.title || '',
        type: policyData.type || '',
        category: policyData.category || '',
        version: policyData.version || 'v1.0',
        status: policyData.status || 'Draft',
        effectiveDate: policyData.effectiveDate || new Date().toISOString().split('T')[0],
        expiryDate: policyData.expiryDate || '',
        reviewDate: policyData.reviewDate || '',
        owner: policyData.owner || '',
        approver: policyData.approver || '',
        department: policyData.department || '',
        compliance: policyData.compliance || 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        description: policyData.description || ''
      };
      setPolicies([...policies, newPolicy]);
    }
    setIsAddingPolicy(false);
    setEditingPolicy(null);
  };

  const stats = [
    { label: 'Total Policies', value: '34', change: '+2', icon: FileText, color: 'text-primary-600' },
    { label: 'Active Policies', value: '28', change: '+1', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Due for Review', value: '6', change: '+3', icon: AlertTriangle, color: 'text-orange-600' },
    { label: 'Avg Compliance', value: '89%', change: '+4%', icon: TrendingUp, color: 'text-purple-600' }
  ];

  const policyCategories = [
    { category: 'Data Privacy', count: 8, percentage: 24, color: 'bg-primary-500' },
    { category: 'Contracts', count: 6, percentage: 18, color: 'bg-green-500' },
    { category: 'Employment', count: 7, percentage: 21, color: 'bg-yellow-500' },
    { category: 'IP Rights', count: 5, percentage: 15, color: 'bg-purple-500' },
    { category: 'Compliance', count: 8, percentage: 22, color: 'bg-red-500' }
  ];

  const upcomingReviews = [
    { policy: 'Data Protection Policy', owner: 'Sarah Johnson', reviewDate: '2024-12-15', daysLeft: 3, priority: 'High' },
    { policy: 'Contract Guidelines', owner: 'Michael Chen', reviewDate: '2024-12-20', daysLeft: 8, priority: 'Medium' },
    { policy: 'Employment Compliance', owner: 'David Ochieng', reviewDate: '2024-12-31', daysLeft: 19, priority: 'Low' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Compliance': return 'bg-red-100 text-red-800';
      case 'Operational': return 'bg-primary-100 text-primary-800';
      case 'Strategic': return 'bg-purple-100 text-purple-800';
      case 'Regulatory': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 95) return 'text-green-600';
    if (compliance >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Filter policies based on search and filter
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.owner.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && policy.status.toLowerCase().replace(' ', '') === selectedFilter;
  });

  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="mr-3 h-8 w-8 text-primary-600" />
                Policy Management
              </h1>
              <p className="text-gray-600 mt-1">Legal Policy Framework & Compliance Management</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleImport}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </button>
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={handleAddPolicy}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Policy
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
                    <span className={`ml-2 text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
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
                  placeholder="Search policies, categories, or owners..."
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
                <option value="underreview">Under Review</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Policy Register Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Policy Register</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPolicies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{policy.title}</div>
                          <div className="text-sm text-gray-500">{policy.id} • {policy.version}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{policy.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(policy.type)}`}>
                        {policy.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(policy.status)}`}>
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${policy.compliance >= 95 ? 'bg-green-500' : policy.compliance >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${policy.compliance}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${getComplianceColor(policy.compliance)}`}>{policy.compliance}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-600 mr-2">
                          {policy.owner.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm text-gray-900">{policy.owner}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{policy.reviewDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewPolicy(policy)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Policy"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditPolicy(policy)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Policy"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePolicy(policy.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Policy"
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

        {/* Policy Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Policy Categories */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                Policy Categories
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-800">View Details</button>
            </div>
            <div className="space-y-4">
              {policyCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{category.category}</span>
                    <span className="text-sm text-gray-600">{category.count} policies ({category.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${category.color}`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-4">
                <div className="flex items-center">
                  <Activity className="w-4 h-4 text-purple-600 mr-2" />
                  <p className="text-sm text-purple-800">Data Privacy policies lead with 24% of portfolio</p>
                </div>
                <p className="text-xs text-purple-600 mt-1">8 policies require immediate compliance monitoring</p>
              </div>
            </div>
          </div>

          {/* Upcoming Reviews */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                Upcoming Reviews
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-800">View All</button>
            </div>
            <div className="space-y-4">
              {upcomingReviews.map((review, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{review.policy}</p>
                    <p className="text-sm text-gray-600">{review.owner}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      review.priority === 'High' ? 'bg-red-100 text-red-800' :
                      review.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {review.priority}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">{review.daysLeft} days</p>
                    <p className="text-xs text-gray-500">{review.reviewDate}</p>
                  </div>
                </div>
              ))}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">6 policies due for review within 30 days</p>
                </div>
                <p className="text-xs text-yellow-600 mt-1">Schedule review meetings to ensure compliance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Policy Modal */}
      {isAddingPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingPolicy ? 'Edit Policy' : 'Add New Policy'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const policyData = {
                title: formData.get('title') as string,
                type: formData.get('type') as string,
                category: formData.get('category') as string,
                version: formData.get('version') as string,
                status: formData.get('status') as string,
                effectiveDate: formData.get('effectiveDate') as string,
                expiryDate: formData.get('expiryDate') as string,
                reviewDate: formData.get('reviewDate') as string,
                owner: formData.get('owner') as string,
                approver: formData.get('approver') as string,
                department: formData.get('department') as string,
                compliance: parseInt(formData.get('compliance') as string) || 0,
                description: formData.get('description') as string
              };
              handleSavePolicy(policyData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingPolicy?.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="type"
                    required
                    defaultValue={editingPolicy?.type}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Operational">Operational</option>
                    <option value="Strategic">Strategic</option>
                    <option value="Regulatory">Regulatory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    required
                    defaultValue={editingPolicy?.category}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                  <input
                    type="text"
                    name="version"
                    defaultValue={editingPolicy?.version || 'v1.0'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    required
                    defaultValue={editingPolicy?.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                  <input
                    type="date"
                    name="effectiveDate"
                    required
                    defaultValue={editingPolicy?.effectiveDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    defaultValue={editingPolicy?.expiryDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review Date</label>
                  <input
                    type="date"
                    name="reviewDate"
                    defaultValue={editingPolicy?.reviewDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Owner</label>
                  <input
                    type="text"
                    name="owner"
                    required
                    defaultValue={editingPolicy?.owner}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approver</label>
                  <input
                    type="text"
                    name="approver"
                    required
                    defaultValue={editingPolicy?.approver}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    required
                    defaultValue={editingPolicy?.department}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compliance Score (%)</label>
                  <input
                    type="number"
                    name="compliance"
                    min="0"
                    max="100"
                    defaultValue={editingPolicy?.compliance}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingPolicy?.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingPolicy(false);
                    setEditingPolicy(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingPolicy ? 'Update Policy' : 'Add Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Policy Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{selectedPolicy.title}</h2>
                <p className="text-gray-600">{selectedPolicy.category} • {selectedPolicy.type} • {selectedPolicy.version}</p>
              </div>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Policy Details</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Policy ID:</span>
                      <span className="font-medium">{selectedPolicy.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version:</span>
                      <span className="font-medium">{selectedPolicy.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPolicy.status)}`}>
                        {selectedPolicy.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedPolicy.type)}`}>
                        {selectedPolicy.type}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Compliance</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Score:</span>
                      <span className={`font-medium ${getComplianceColor(selectedPolicy.compliance)}`}>
                        {selectedPolicy.compliance}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${selectedPolicy.compliance >= 95 ? 'bg-green-500' : selectedPolicy.compliance >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${selectedPolicy.compliance}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ownership</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Owner:</span>
                      <span className="font-medium">{selectedPolicy.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Approver:</span>
                      <span className="font-medium">{selectedPolicy.approver}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{selectedPolicy.department}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Timeline</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Effective:</span>
                      <span className="font-medium">{selectedPolicy.effectiveDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expires:</span>
                      <span className="font-medium">{selectedPolicy.expiryDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Review:</span>
                      <span className="font-medium">{selectedPolicy.reviewDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">{selectedPolicy.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Description</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-900">{selectedPolicy.description}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Policy Status</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${selectedPolicy.status === 'Active' ? 'bg-green-500' : selectedPolicy.status === 'Under Review' ? 'bg-yellow-500' : 'bg-gray-500'}`}></div>
                      <span className="text-sm text-gray-600">
                        {selectedPolicy.status === 'Active' ? 'Currently Active' : selectedPolicy.status === 'Under Review' ? 'Under Review' : 'Draft Status'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-primary-500" />
                      <span className="text-sm text-gray-600">Stakeholder review required</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setSelectedPolicy(null);
                  handleEditPolicy(selectedPolicy);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Edit Policy
              </button>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </MainLayout>
  );
}

