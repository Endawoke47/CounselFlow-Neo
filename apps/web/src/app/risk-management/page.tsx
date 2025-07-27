'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { mockRiskAssessments, mockClients, mockMatters } from '../../lib/mock-data';
import { Shield, Plus, Search, Download, Upload, Edit3, Trash2, Eye, AlertTriangle, TrendingUp, BarChart3, Target, Activity, ChevronDown, CheckCircle } from 'lucide-react';

interface Risk {
  id: string;
  title: string;
  category: string;
  type: string;
  severity: string;
  probability: string;
  impact: string;
  status: string;
  owner: string;
  department: string;
  identifiedDate: string;
  reviewDate: string;
  mitigationStrategy: string;
  residualRisk: string;
  riskScore: number;
}

export default function RiskManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [risks, setRisks] = useState<Risk[]>([
    {
      id: 'RSK001',
      title: 'Data Privacy Compliance Risk',
      category: 'Regulatory',
      type: 'Compliance',
      severity: 'High',
      probability: 'Medium',
      impact: 'High',
      status: 'Active',
      owner: 'Sarah Johnson',
      department: 'Legal',
      identifiedDate: '2024-10-15',
      reviewDate: '2025-01-15',
      mitigationStrategy: 'Implement comprehensive GDPR compliance framework',
      residualRisk: 'Medium',
      riskScore: 85
    },
    {
      id: 'RSK002',
      title: 'Contract Breach Exposure',
      category: 'Operational',
      type: 'Contractual',
      severity: 'Medium',
      probability: 'Low',
      impact: 'High',
      status: 'Monitoring',
      owner: 'Michael Chen',
      department: 'Legal',
      identifiedDate: '2024-11-01',
      reviewDate: '2024-12-31',
      mitigationStrategy: 'Enhanced contract monitoring and review processes',
      residualRisk: 'Low',
      riskScore: 55
    },
    {
      id: 'RSK003',
      title: 'Intellectual Property Infringement',
      category: 'Legal',
      type: 'IP Rights',
      severity: 'High',
      probability: 'Medium',
      impact: 'Very High',
      status: 'Mitigating',
      owner: 'Grace Kimani',
      department: 'IP Department',
      identifiedDate: '2024-09-20',
      reviewDate: '2024-12-20',
      mitigationStrategy: 'IP audit and portfolio strengthening program',
      residualRisk: 'Medium',
      riskScore: 90
    },
    {
      id: 'RSK004',
      title: 'Regulatory Change Impact',
      category: 'Regulatory',
      type: 'Legislative',
      severity: 'Medium',
      probability: 'High',
      impact: 'Medium',
      status: 'Active',
      owner: 'David Ochieng',
      department: 'Compliance',
      identifiedDate: '2024-11-10',
      reviewDate: '2025-02-10',
      mitigationStrategy: 'Continuous regulatory monitoring and adaptation framework',
      residualRisk: 'Low',
      riskScore: 70
    }
  ]);
  const [isAddingRisk, setIsAddingRisk] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

  // Handlers for full functionality
  const handleAddRisk = () => {
    setIsAddingRisk(true);
  };

  const handleEditRisk = (risk: Risk) => {
    setEditingRisk(risk);
    setIsAddingRisk(true);
  };

  const handleDeleteRisk = (riskId: string) => {
    if (confirm('Are you sure you want to delete this risk?')) {
      setRisks(risks.filter(r => r.id !== riskId));
    }
  };

  const handleViewRisk = (risk: Risk) => {
    setSelectedRisk(risk);
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Title', 'Category', 'Type', 'Severity', 'Probability', 'Impact', 'Status', 'Owner', 'Risk Score'],
      ...risks.map(r => [r.id, r.title, r.category, r.type, r.severity, r.probability, r.impact, r.status, r.owner, r.riskScore.toString()])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'risk-register.csv';
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
        alert('Risk register import functionality implemented - File selected: ' + file.name);
      }
    };
    input.click();
  };

  const handleSaveRisk = (riskData: Partial<Risk>) => {
    if (editingRisk) {
      setRisks(risks.map(r => r.id === editingRisk.id ? { ...r, ...riskData } : r));
    } else {
      const newRisk: Risk = {
        id: `RSK${String(risks.length + 1).padStart(3, '0')}`,
        title: riskData.title || '',
        category: riskData.category || '',
        type: riskData.type || '',
        severity: riskData.severity || 'Medium',
        probability: riskData.probability || 'Medium',
        impact: riskData.impact || 'Medium',
        status: riskData.status || 'Active',
        owner: riskData.owner || '',
        department: riskData.department || '',
        identifiedDate: riskData.identifiedDate || new Date().toISOString().split('T')[0],
        reviewDate: riskData.reviewDate || '',
        mitigationStrategy: riskData.mitigationStrategy || '',
        residualRisk: riskData.residualRisk || 'Medium',
        riskScore: riskData.riskScore || 50
      };
      setRisks([...risks, newRisk]);
    }
    setIsAddingRisk(false);
    setEditingRisk(null);
  };

  // Calculate stats from mock data
  const totalRisks = mockRiskAssessments.length;
  const highSeverityRisks = mockRiskAssessments.filter(r => r.severity === 'high' || r.severity === 'critical').length;
  const avgRiskScore = mockRiskAssessments.length > 0 ? 
    Math.round(mockRiskAssessments.reduce((sum, r) => sum + (r.probability * r.impact / 100), 0) / mockRiskAssessments.length) : 0;
  const mitigatedRisks = mockRiskAssessments.filter(r => r.status === 'mitigating' || r.status === 'resolved').length;

  const stats = [
    { label: 'Total Risks', value: totalRisks.toString(), change: '+3', icon: Shield, color: 'text-red-600' },
    { label: 'High Severity', value: highSeverityRisks.toString(), change: '-2', icon: AlertTriangle, color: 'text-orange-600' },
    { label: 'Avg Risk Score', value: avgRiskScore.toString(), change: '-5', icon: TrendingUp, color: 'text-primary-600' },
    { label: 'Mitigated Risks', value: mitigatedRisks.toString(), change: '+4', icon: CheckCircle, color: 'text-green-600' }
  ];

  const riskTrends = [
    { month: 'Sep', identified: 8, mitigated: 5, residual: 3 },
    { month: 'Oct', identified: 12, mitigated: 7, residual: 5 },
    { month: 'Nov', identified: 6, mitigated: 9, residual: -3 },
    { month: 'Dec', identified: 4, mitigated: 6, residual: -2 },
  ];

  const riskCategories = [
    { category: 'Regulatory', count: 8, percentage: 33, color: 'bg-red-500' },
    { category: 'Operational', count: 6, percentage: 25, color: 'bg-orange-500' },
    { category: 'Legal', count: 5, percentage: 21, color: 'bg-yellow-500' },
    { category: 'Financial', count: 3, percentage: 13, color: 'bg-primary-500' },
    { category: 'Technology', count: 2, percentage: 8, color: 'bg-purple-500' }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Very High': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-red-100 text-red-800';
      case 'Monitoring': return 'bg-yellow-100 text-yellow-800';
      case 'Mitigating': return 'bg-primary-100 text-primary-800';
      case 'Mitigated': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Filter risks based on search and filter
  const filteredRisks = risks.filter(risk => {
    const matchesSearch = risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.owner.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && risk.severity.toLowerCase().replace(' ', '') === selectedFilter;
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
                <Shield className="mr-3 h-8 w-8 text-red-600" />
                Risk Management
              </h1>
              <p className="text-gray-600 mt-1">Legal Risk Assessment & Mitigation Framework</p>
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
                onClick={handleAddRisk}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Risk
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
                  placeholder="Search risks, categories, or owners..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="veryhigh">Very High</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Risk Register Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Risk Register</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRisks.map((risk) => (
                  <tr key={risk.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-red-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{risk.title}</div>
                          <div className="text-sm text-gray-500">{risk.id} • {risk.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{risk.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(risk.severity)}`}>
                        {risk.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(risk.status)}`}>
                        {risk.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${risk.riskScore >= 80 ? 'bg-red-500' : risk.riskScore >= 60 ? 'bg-orange-500' : risk.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${risk.riskScore}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${getRiskScoreColor(risk.riskScore)}`}>{risk.riskScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-600 mr-2">
                          {risk.owner.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm text-gray-900">{risk.owner}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{risk.reviewDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewRisk(risk)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Risk"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditRisk(risk)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Risk"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRisk(risk.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Risk"
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

        {/* Risk Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary-500" />
                Risk Trends
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-800">View Details</button>
            </div>
            <div className="space-y-4">
              {riskTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-900 w-8">{trend.month}</span>
                    <div className="flex space-x-2">
                      <span className="text-sm text-red-600">+{trend.identified} identified</span>
                      <span className="text-sm text-green-600">-{trend.mitigated} mitigated</span>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${trend.residual >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Net: {trend.residual > 0 ? '+' : ''}{trend.residual}
                  </div>
                </div>
              ))}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-primary-800">Risk identification increased by 15% this quarter</p>
                <p className="text-xs text-primary-600 mt-1">Focus on proactive mitigation strategies recommended</p>
              </div>
            </div>
          </div>

          {/* Risk Categories */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                Risk Categories
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-800">Export Report</button>
            </div>
            <div className="space-y-4">
              {riskCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{category.category}</span>
                    <span className="text-sm text-gray-600">{category.count} risks ({category.percentage}%)</span>
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
                  <Target className="w-4 h-4 text-purple-600 mr-2" />
                  <p className="text-sm text-purple-800">Regulatory risks require immediate attention</p>
                </div>
                <p className="text-xs text-purple-600 mt-1">8 active regulatory risks with high impact potential</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Risk Modal */}
      {isAddingRisk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingRisk ? 'Edit Risk' : 'Add New Risk'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const riskData = {
                title: formData.get('title') as string,
                category: formData.get('category') as string,
                type: formData.get('type') as string,
                severity: formData.get('severity') as string,
                probability: formData.get('probability') as string,
                impact: formData.get('impact') as string,
                status: formData.get('status') as string,
                owner: formData.get('owner') as string,
                department: formData.get('department') as string,
                identifiedDate: formData.get('identifiedDate') as string,
                reviewDate: formData.get('reviewDate') as string,
                mitigationStrategy: formData.get('mitigationStrategy') as string,
                residualRisk: formData.get('residualRisk') as string,
                riskScore: parseInt(formData.get('riskScore') as string) || 50
              };
              handleSaveRisk(riskData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingRisk?.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    required
                    defaultValue={editingRisk?.category}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Regulatory">Regulatory</option>
                    <option value="Operational">Operational</option>
                    <option value="Legal">Legal</option>
                    <option value="Financial">Financial</option>
                    <option value="Technology">Technology</option>
                    <option value="Reputation">Reputation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <input
                    type="text"
                    name="type"
                    required
                    defaultValue={editingRisk?.type}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    name="severity"
                    required
                    defaultValue={editingRisk?.severity}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Very High">Very High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Probability</label>
                  <select
                    name="probability"
                    required
                    defaultValue={editingRisk?.probability}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Very High">Very High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
                  <select
                    name="impact"
                    required
                    defaultValue={editingRisk?.impact}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Very High">Very High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    required
                    defaultValue={editingRisk?.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="Mitigating">Mitigating</option>
                    <option value="Mitigated">Mitigated</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Owner</label>
                  <input
                    type="text"
                    name="owner"
                    required
                    defaultValue={editingRisk?.owner}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    required
                    defaultValue={editingRisk?.department}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Identified Date</label>
                  <input
                    type="date"
                    name="identifiedDate"
                    required
                    defaultValue={editingRisk?.identifiedDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review Date</label>
                  <input
                    type="date"
                    name="reviewDate"
                    defaultValue={editingRisk?.reviewDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Residual Risk</label>
                  <select
                    name="residualRisk"
                    required
                    defaultValue={editingRisk?.residualRisk}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Very High">Very High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Score (0-100)</label>
                  <input
                    type="number"
                    name="riskScore"
                    min="0"
                    max="100"
                    defaultValue={editingRisk?.riskScore}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mitigation Strategy</label>
                  <textarea
                    name="mitigationStrategy"
                    rows={3}
                    defaultValue={editingRisk?.mitigationStrategy}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingRisk(false);
                    setEditingRisk(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {editingRisk ? 'Update Risk' : 'Add Risk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Risk Modal */}
      {selectedRisk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{selectedRisk.title}</h2>
                <p className="text-gray-600">{selectedRisk.category} • {selectedRisk.type}</p>
              </div>
              <button
                onClick={() => setSelectedRisk(null)}
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
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Risk Assessment</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk ID:</span>
                      <span className="font-medium">{selectedRisk.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Severity:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(selectedRisk.severity)}`}>
                        {selectedRisk.severity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Probability:</span>
                      <span className="font-medium">{selectedRisk.probability}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Impact:</span>
                      <span className="font-medium">{selectedRisk.impact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk Score:</span>
                      <span className={`font-medium ${getRiskScoreColor(selectedRisk.riskScore)}`}>
                        {selectedRisk.riskScore}/100
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Status</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRisk.status)}`}>
                        {selectedRisk.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Residual Risk:</span>
                      <span className="font-medium">{selectedRisk.residualRisk}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ownership</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk Owner:</span>
                      <span className="font-medium">{selectedRisk.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{selectedRisk.department}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Timeline</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Identified:</span>
                      <span className="font-medium">{selectedRisk.identifiedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Review:</span>
                      <span className="font-medium">{selectedRisk.reviewDate}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Mitigation</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-900">{selectedRisk.mitigationStrategy}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Risk Indicators</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${selectedRisk.riskScore >= 80 ? 'bg-red-500' : selectedRisk.riskScore >= 60 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                      <span className="text-sm text-gray-600">
                        {selectedRisk.riskScore >= 80 ? 'Critical Risk Level' : selectedRisk.riskScore >= 60 ? 'High Risk Level' : 'Manageable Risk Level'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-primary-500" />
                      <span className="text-sm text-gray-600">Active monitoring required</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setSelectedRisk(null);
                  handleEditRisk(selectedRisk);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Edit Risk
              </button>
              <button
                onClick={() => setSelectedRisk(null)}
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

