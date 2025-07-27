'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { mockDisputes, mockClients, Dispute } from '../../lib/mock-data';
import { Scale, Plus, Search, Download, Upload, Edit3, Trash2, Eye, CheckCircle, AlertTriangle, BarChart3, Calendar, Brain, TrendingUp, Clock, DollarSign, Users, FileText } from 'lucide-react';

interface DisputeDisplay {
  id: string;
  title: string;
  parties: string[];
  type: string;
  status: string;
  priority: string;
  value: number;
  filingDate: string;
  expectedResolution: string;
  attorney: string;
  courtVenue: string;
  winProbability: number;
  costs: number;
  stage: string;
}

export default function DisputeManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [disputes, setDisputes] = useState<DisputeDisplay[]>([]);

  useEffect(() => {
    // Transform mock disputes to display format
    const transformedDisputes: DisputeDisplay[] = mockDisputes.map(dispute => {
      const client = mockClients.find(c => c.id === dispute.clientId);
      return {
        id: dispute.id,
        title: dispute.title,
        parties: [client?.name || 'Unknown Client', dispute.opposingParty],
        type: dispute.disputeType,
        status: dispute.status,
        priority: dispute.priority,
        value: dispute.claimAmount,
        filingDate: dispute.filingDate,
        expectedResolution: dispute.nextHearing || 'TBD',
        attorney: client?.assignedLawyer || 'Unassigned',
        courtVenue: dispute.court,
        winProbability: dispute.probabilityOfSuccess,
        costs: Math.floor(dispute.claimAmount * 0.15), // Estimated 15% of claim amount
        stage: dispute.status === 'discovery' ? 'Discovery' : 
               dispute.status === 'mediation' ? 'Mediation' :
               dispute.status === 'trial' ? 'Trial' : 'Initial'
      };
    });
    setDisputes(transformedDisputes);
  }, []);

  const [isAddingDispute, setIsAddingDispute] = useState(false);
  const [editingDispute, setEditingDispute] = useState<DisputeDisplay | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<DisputeDisplay | null>(null);

  // Handlers for full functionality
  const handleAddDispute = () => {
    setIsAddingDispute(true);
  };

  const handleEditDispute = (dispute: DisputeDisplay) => {
    setEditingDispute(dispute);
    setIsAddingDispute(true);
  };

  const handleDeleteDispute = (disputeId: string) => {
    if (confirm('Are you sure you want to delete this dispute case?')) {
      setDisputes(disputes.filter(d => d.id !== disputeId));
    }
  };

  const handleViewDispute = (dispute: DisputeDisplay) => {
    setSelectedDispute(dispute);
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Title', 'Type', 'Status', 'Priority', 'Value', 'Filing Date', 'Expected Resolution', 'Attorney', 'Win Probability', 'Costs'],
      ...disputes.map(d => [d.id, d.title, d.type, d.status, d.priority, d.value.toString(), d.filingDate, d.expectedResolution, d.attorney, d.winProbability.toString(), d.costs.toString()])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'disputes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.pdf,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        alert('Dispute case import functionality implemented - File selected: ' + file.name);
      }
    };
    input.click();
  };

  const handleAIAnalysis = (disputeId: string) => {
    const dispute = disputes.find(d => d.id === disputeId);
    if (dispute) {
      alert(`AI Analysis initiated for "${dispute.title}". Analyzing case precedents, win probability, and strategic recommendations...`);
    }
  };

  const handleSaveDispute = (disputeData: Partial<DisputeDisplay>) => {
    if (editingDispute) {
      setDisputes(disputes.map(d => d.id === editingDispute.id ? { ...d, ...disputeData } : d));
    } else {
      const newDispute: DisputeDisplay = {
        id: `DSP${String(disputes.length + 1).padStart(3, '0')}`,
        title: disputeData.title || '',
        parties: disputeData.parties || [],
        type: disputeData.type || '',
        status: disputeData.status || 'filed',
        priority: (disputeData.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
        value: disputeData.value || 0,
        filingDate: disputeData.filingDate || new Date().toISOString().split('T')[0],
        expectedResolution: disputeData.expectedResolution || '',
        attorney: disputeData.attorney || '',
        courtVenue: disputeData.courtVenue || '',
        winProbability: disputeData.winProbability || 0,
        costs: disputeData.costs || 0,
        stage: disputeData.stage || 'Initial'
      };
      setDisputes([...disputes, newDispute]);
    }
    setIsAddingDispute(false);
    setEditingDispute(null);
  };

  const stats = [
    { label: 'Active Cases', value: '28', change: '+4', icon: Scale, color: 'text-primary-600' },
    { label: 'Cases Won', value: '156', change: '+12', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Total Value', value: '$3.2M', change: '+18%', icon: DollarSign, color: 'text-purple-600' },
    { label: 'Avg Win Rate', value: '78%', change: '+5%', icon: TrendingUp, color: 'text-orange-600' }
  ];

  const upcomingHearings = [
    { case: 'Commercial Contract Dispute', date: '2025-01-20', time: '10:00 AM', venue: 'High Court - Room 3' },
    { case: 'IP Infringement Case', date: '2025-01-25', time: '2:00 PM', venue: 'IP Division - Room 1' },
    { case: 'Employment Dispute', date: '2025-01-30', time: '9:30 AM', venue: 'Labour Court - Room 2' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-primary-100 text-primary-800';
      case 'Pre-trial': return 'bg-yellow-100 text-yellow-800';
      case 'Mediation': return 'bg-purple-100 text-purple-800';
      case 'Settlement': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      case 'On Hold': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter disputes based on search and filter
  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.attorney.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && dispute.status.toLowerCase().replace(/[^a-z]/g, '') === selectedFilter;
  });

  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Scale className="mr-3 h-8 w-8 text-primary-600" />
                Dispute Management
              </h1>
              <p className="text-gray-600 mt-1">Litigation Management & AI-Powered Case Analytics</p>
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
                onClick={handleAddDispute}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Case
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
                  placeholder="Search cases, attorneys, or case types..."
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
                <option value="pretrial">Pre-trial</option>
                <option value="mediation">Mediation</option>
                <option value="settlement">Settlement</option>
                <option value="closed">Closed</option>
                <option value="onhold">On Hold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Disputes Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Case Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Probability</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attorney</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDisputes.map((dispute) => (
                  <tr key={dispute.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Scale className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{dispute.title}</div>
                          <div className="text-sm text-gray-500">{dispute.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dispute.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dispute.status)}`}>
                        {dispute.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(dispute.priority)}`}>
                        {dispute.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${dispute.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${dispute.winProbability >= 70 ? 'bg-green-500' : dispute.winProbability >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${dispute.winProbability}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{dispute.winProbability}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dispute.attorney}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDispute(dispute)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Case"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditDispute(dispute)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Case"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAIAnalysis(dispute.id)}
                          className="text-purple-600 hover:text-purple-900"
                          title="AI Analysis"
                        >
                          <Brain className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDispute(dispute.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Case"
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

        {/* Upcoming Hearings & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Upcoming Hearings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                Upcoming Hearings
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-800">View Calendar</button>
            </div>
            <div className="space-y-4">
              {upcomingHearings.map((hearing, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{hearing.case}</p>
                    <p className="text-sm text-gray-600">{hearing.venue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary-600">{hearing.date}</p>
                    <p className="text-xs text-gray-500">{hearing.time}</p>
                  </div>
                </div>
              ))}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-orange-600">3 hearings scheduled this week</p>
              </div>
            </div>
          </div>

          {/* AI Case Insights */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-500" />
                AI Case Insights
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-800">Run Analysis</button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">High Win Probability</p>
                <p className="text-xs text-gray-600 mt-1">IP Infringement case shows 85% win probability based on precedents</p>
                <p className="text-xs text-green-600 mt-1">Consider aggressive settlement strategy</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Cost Optimization</p>
                <p className="text-xs text-gray-600 mt-1">Employment dispute costs are 40% above similar cases</p>
                <p className="text-xs text-yellow-600 mt-1">Review billing and consider alternative dispute resolution</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Strategic Recommendation</p>
                <p className="text-xs text-gray-600 mt-1">Commercial dispute ready for mediation based on case progression</p>
                <p className="text-xs text-primary-600 mt-1">Expected settlement range: $300k - $450k</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Dispute Modal */}
      {isAddingDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingDispute ? 'Edit Dispute Case' : 'Add New Dispute Case'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const disputeData = {
                title: formData.get('title') as string,
                parties: (formData.get('parties') as string).split(',').map(p => p.trim()),
                type: formData.get('type') as string,
                status: formData.get('status') as string,
                priority: formData.get('priority') as string,
                value: parseInt(formData.get('value') as string) || 0,
                filingDate: formData.get('filingDate') as string,
                expectedResolution: formData.get('expectedResolution') as string,
                attorney: formData.get('attorney') as string,
                courtVenue: formData.get('courtVenue') as string,
                winProbability: parseInt(formData.get('winProbability') as string) || 0,
                costs: parseInt(formData.get('costs') as string) || 0,
                stage: formData.get('stage') as string
              };
              handleSaveDispute(disputeData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingDispute?.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parties (comma-separated)</label>
                  <input
                    type="text"
                    name="parties"
                    required
                    defaultValue={editingDispute?.parties?.join(', ')}
                    placeholder="e.g., Company A, Company B"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
                  <select
                    name="type"
                    required
                    defaultValue={editingDispute?.type}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Commercial Litigation">Commercial Litigation</option>
                    <option value="Employment Law">Employment Law</option>
                    <option value="IP Litigation">IP Litigation</option>
                    <option value="Corporate Dispute">Corporate Dispute</option>
                    <option value="Contract Dispute">Contract Dispute</option>
                    <option value="Regulatory">Regulatory</option>
                    <option value="Real Estate">Real Estate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    required
                    defaultValue={editingDispute?.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Pre-trial">Pre-trial</option>
                    <option value="Active">Active</option>
                    <option value="Mediation">Mediation</option>
                    <option value="Settlement">Settlement</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    required
                    defaultValue={editingDispute?.priority}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Value ($)</label>
                  <input
                    type="number"
                    name="value"
                    min="0"
                    defaultValue={editingDispute?.value}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filing Date</label>
                  <input
                    type="date"
                    name="filingDate"
                    required
                    defaultValue={editingDispute?.filingDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Resolution</label>
                  <input
                    type="date"
                    name="expectedResolution"
                    defaultValue={editingDispute?.expectedResolution}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Attorney</label>
                  <input
                    type="text"
                    name="attorney"
                    required
                    defaultValue={editingDispute?.attorney}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Court/Venue</label>
                  <input
                    type="text"
                    name="courtVenue"
                    defaultValue={editingDispute?.courtVenue}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Win Probability (%)</label>
                  <input
                    type="number"
                    name="winProbability"
                    min="0"
                    max="100"
                    defaultValue={editingDispute?.winProbability}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Costs ($)</label>
                  <input
                    type="number"
                    name="costs"
                    min="0"
                    defaultValue={editingDispute?.costs}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Stage</label>
                  <select
                    name="stage"
                    required
                    defaultValue={editingDispute?.stage}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Initial">Initial</option>
                    <option value="Pleadings">Pleadings</option>
                    <option value="Discovery">Discovery</option>
                    <option value="Mediation">Mediation</option>
                    <option value="Trial Preparation">Trial Preparation</option>
                    <option value="Trial">Trial</option>
                    <option value="Settlement Negotiation">Settlement Negotiation</option>
                    <option value="Appeal">Appeal</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingDispute(false);
                    setEditingDispute(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingDispute ? 'Update Case' : 'Add Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Dispute Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{selectedDispute.title}</h2>
                <p className="text-gray-600">{selectedDispute.type} • {selectedDispute.attorney}</p>
              </div>
              <button
                onClick={() => setSelectedDispute(null)}
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
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Case Details</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Case ID:</span>
                      <span className="font-medium">{selectedDispute.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDispute.status)}`}>
                        {selectedDispute.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedDispute.priority)}`}>
                        {selectedDispute.priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stage:</span>
                      <span className="font-medium">{selectedDispute.stage}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Parties</h3>
                  <div className="mt-2 space-y-1">
                    {selectedDispute.parties.map((party, index) => (
                      <div key={index} className="text-sm text-gray-900">{party}</div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Financial</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Case Value:</span>
                      <span className="font-medium">${selectedDispute.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Legal Costs:</span>
                      <span className="font-medium">${selectedDispute.costs.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost Ratio:</span>
                      <span className="font-medium">{((selectedDispute.costs / selectedDispute.value) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Timeline</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Filed:</span>
                      <span className="font-medium">{selectedDispute.filingDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Resolution:</span>
                      <span className="font-medium">{selectedDispute.expectedResolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Court/Venue:</span>
                      <span className="font-medium">{selectedDispute.courtVenue}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">AI Analysis</h3>
                  <div className="mt-2 space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Win Probability:</span>
                        <span className="font-medium">{selectedDispute.winProbability}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${selectedDispute.winProbability >= 70 ? 'bg-green-500' : selectedDispute.winProbability >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${selectedDispute.winProbability}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Key Actions</h3>
                  <div className="mt-2 space-y-2">
                    <button 
                      onClick={() => handleAIAnalysis(selectedDispute.id)}
                      className="w-full p-2 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100"
                    >
                      Run AI Analysis
                    </button>
                    <button className="w-full p-2 bg-primary-50 text-blue-700 rounded-lg text-sm hover:bg-primary-100">
                      Schedule Hearing
                    </button>
                    <button className="w-full p-2 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100">
                      Generate Report
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Recent Activity</h3>
                  <div className="mt-2 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">Discovery documents filed</p>
                        <p className="text-xs text-gray-500">3 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">Settlement offer received</p>
                        <p className="text-xs text-gray-500">1 week ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">Expert witness identified</p>
                        <p className="text-xs text-gray-500">2 weeks ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => handleAIAnalysis(selectedDispute.id)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Analysis
              </button>
              <button
                onClick={() => {
                  setSelectedDispute(null);
                  handleEditDispute(selectedDispute);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Edit Case
              </button>
              <button
                onClick={() => setSelectedDispute(null)}
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
