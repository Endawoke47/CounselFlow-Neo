'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, Download, Upload, Edit3, Trash2, Eye, CheckCircle, AlertTriangle, BarChart3, Calendar, Clock, DollarSign, Users, TrendingUp, Target } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { 
  mockMatters, 
  mockClients, 
  type Matter, 
  type Client 
} from '@/lib/mock-data';

interface MatterDisplay {
  id: string;
  title: string;
  client: string;
  type: string;
  status: string;
  priority: string;
  budget: number;
  billed: number;
  timeSpent: number;
  estimatedHours: number;
  startDate: string;
  deadline: string;
  assignedTeam: string[];
  practiceArea: string;
  progress: number;
}

export default function MatterManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [matters, setMatters] = useState<MatterDisplay[]>([]);

  // Load matters from mock data on component mount
  useEffect(() => {
    const transformedMatters: MatterDisplay[] = mockMatters.map((matter: Matter) => {
      const client = mockClients.find(c => c.id === matter.clientId);
      return {
        id: matter.id,
        title: matter.title,
        client: client?.name || 'Unknown Client',
        type: matter.matterType,
        status: matter.status,
        priority: matter.priority,
        budget: matter.estimatedValue,
        billed: matter.totalFees,
        timeSpent: matter.billedHours,
        estimatedHours: Math.ceil(matter.estimatedValue / 2500), // Estimated based on value
        startDate: matter.openDate,
        deadline: matter.nextDeadline || '',
        assignedTeam: matter.assignedTeam,
        practiceArea: matter.matterType,
        progress: matter.progress
      };
    });
    setMatters(transformedMatters);
  }, []);

  const [isAddingMatter, setIsAddingMatter] = useState(false);
  const [editingMatter, setEditingMatter] = useState<MatterDisplay | null>(null);
  const [selectedMatter, setSelectedMatter] = useState<MatterDisplay | null>(null);

  // Handlers for full functionality
  const handleAddMatter = () => {
    setIsAddingMatter(true);
  };

  const handleEditMatter = (matter: MatterDisplay) => {
    setEditingMatter(matter);
    setIsAddingMatter(true);
  };

  const handleDeleteMatter = (matterId: string) => {
    if (confirm('Are you sure you want to delete this matter?')) {
      setMatters(matters.filter(m => m.id !== matterId));
    }
  };

  const handleViewMatter = (matter: MatterDisplay) => {
    setSelectedMatter(matter);
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Title', 'Client', 'Type', 'Status', 'Priority', 'Budget', 'Billed', 'Time Spent', 'Progress', 'Deadline'],
      ...matters.map(m => [m.id, m.title, m.client, m.type, m.status, m.priority, m.budget.toString(), m.billed.toString(), m.timeSpent.toString(), m.progress.toString(), m.deadline])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matters.csv';
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
        alert('Matter import functionality implemented - File selected: ' + file.name);
      }
    };
    input.click();
  };

  const handleSaveMatter = (matterData: Partial<MatterDisplay>) => {
    if (editingMatter) {
      setMatters(matters.map(m => m.id === editingMatter.id ? { ...m, ...matterData } : m));
    } else {
      const newMatter: MatterDisplay = {
        id: `MTR${String(matters.length + 1).padStart(3, '0')}`,
        title: matterData.title || '',
        client: matterData.client || '',
        type: matterData.type || '',
        status: (matterData.status as 'active' | 'pending' | 'closed' | 'on-hold') || 'active',
        priority: (matterData.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
        budget: matterData.budget || 0,
        billed: matterData.billed || 0,
        timeSpent: matterData.timeSpent || 0,
        estimatedHours: matterData.estimatedHours || 0,
        startDate: matterData.startDate || new Date().toISOString().split('T')[0],
        deadline: matterData.deadline || '',
        assignedTeam: matterData.assignedTeam || [],
        practiceArea: matterData.practiceArea || '',
        progress: matterData.progress || 0
      };
      setMatters([...matters, newMatter]);
    }
    setIsAddingMatter(false);
    setEditingMatter(null);
  };

  const stats = [
    { label: 'Active Matters', value: '24', change: '+6', icon: Briefcase, color: 'text-primary-600' },
    { label: 'Total Budget', value: '$480K', change: '+15%', icon: DollarSign, color: 'text-success-600' },
    { label: 'Hours Billed', value: '1,286', change: '+8%', icon: Clock, color: 'text-secondary-600' },
    { label: 'Avg Progress', value: '68%', change: '+12%', icon: TrendingUp, color: 'text-warning-600' }
  ];

  const upcomingDeadlines = [
    { matter: 'Compliance Audit', client: 'East Africa Ventures', deadline: '2024-12-30', daysLeft: 8, priority: 'High' },
    { matter: 'Employment Contract Review', client: 'African Innovations SA', deadline: '2025-01-15', daysLeft: 23, priority: 'Medium' },
    { matter: 'Corporate Restructuring', client: 'TechCorp Holdings Ltd', deadline: '2025-02-28', daysLeft: 67, priority: 'High' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-success-100 text-success-800';
      case 'In Progress': return 'bg-primary-100 text-primary-800';
      case 'Planning': return 'bg-warning-100 text-warning-800';
      case 'Review': return 'bg-secondary-100 text-secondary-800';
      case 'On Hold': return 'bg-warning-100 text-warning-800';
      case 'Completed': return 'bg-neutral-100 text-neutral-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-error-100 text-error-800';
      case 'Medium': return 'bg-warning-100 text-warning-800';
      case 'Low': return 'bg-success-100 text-success-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getBudgetStatus = (budget: number, billed: number) => {
    const percentage = (billed / budget) * 100;
    if (percentage >= 90) return 'text-error-600';
    if (percentage >= 75) return 'text-warning-600';
    return 'text-success-600';
  };

  // Filter matters based on search and filter
  const filteredMatters = matters.filter(matter => {
    const matchesSearch = matter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         matter.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         matter.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && matter.status.toLowerCase().replace(' ', '') === selectedFilter;
  });

  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 flex items-center">
                  <Briefcase className="mr-3 h-8 w-8 text-primary-600" />
                  Matter Management
                </h1>
                <p className="text-neutral-600 mt-2">Legal Matter Tracking & Project Management</p>
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
                onClick={handleAddMatter}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Matter
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
                  placeholder="Search matters, clients, or types..."
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
                <option value="inprogress">In Progress</option>
                <option value="planning">Planning</option>
                <option value="review">Review</option>
                <option value="onhold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Matters Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Matter Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget vs Billed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMatters.map((matter) => (
                  <tr key={matter.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{matter.title}</div>
                          <div className="text-sm text-gray-500">{matter.id} • {matter.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{matter.client}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(matter.status)}`}>
                        {matter.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(matter.priority)}`}>
                        {matter.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className={`font-medium ${getBudgetStatus(matter.budget, matter.billed)}`}>
                          ${matter.billed.toLocaleString()} / ${matter.budget.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {((matter.billed / matter.budget) * 100).toFixed(0)}% utilized
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${matter.progress >= 80 ? 'bg-green-500' : matter.progress >= 50 ? 'bg-primary-500' : 'bg-yellow-500'}`}
                            style={{ width: `${matter.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{matter.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex -space-x-1">
                        {matter.assignedTeam.slice(0, 3).map((member, index) => (
                          <div key={index} className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                            {member.split(' ').map(n => n[0]).join('')}
                          </div>
                        ))}
                        {matter.assignedTeam.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-xs font-medium text-white">
                            +{matter.assignedTeam.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewMatter(matter)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Matter"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditMatter(matter)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Matter"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMatter(matter.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Matter"
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

        {/* Upcoming Deadlines & Performance Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                Upcoming Deadlines
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-800">View All</button>
            </div>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{deadline.matter}</p>
                    <p className="text-sm text-gray-600">{deadline.client}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(deadline.priority)}`}>
                      {deadline.priority}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">{deadline.daysLeft} days</p>
                    <p className="text-xs text-gray-500">{deadline.deadline}</p>
                  </div>
                </div>
              ))}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-orange-600">3 matters approaching deadlines within 30 days</p>
              </div>
            </div>
          </div>

          {/* Performance Analytics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                Performance Analytics
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-800">Generate Report</button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Budget Performance</p>
                <p className="text-xs text-gray-600 mt-1">Average budget utilization: 68%</p>
                <p className="text-xs text-green-600 mt-1">Under budget by 12% compared to last quarter</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Time Efficiency</p>
                <p className="text-xs text-gray-600 mt-1">Average completion: 68% on schedule</p>
                <p className="text-xs text-primary-600 mt-1">Efficiency improved by 15% this month</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Team Productivity</p>
                <p className="text-xs text-gray-600 mt-1">Average billable hours: 1,286 per month</p>
                <p className="text-xs text-purple-600 mt-1">Top performer: Sarah Johnson (320 hours)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Matter Modal */}
      {isAddingMatter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingMatter ? 'Edit Matter' : 'Add New Matter'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const matterData = {
                title: formData.get('title') as string,
                client: formData.get('client') as string,
                type: formData.get('type') as string,
                status: formData.get('status') as string,
                priority: formData.get('priority') as string,
                budget: parseInt(formData.get('budget') as string) || 0,
                billed: parseInt(formData.get('billed') as string) || 0,
                timeSpent: parseInt(formData.get('timeSpent') as string) || 0,
                estimatedHours: parseInt(formData.get('estimatedHours') as string) || 0,
                startDate: formData.get('startDate') as string,
                deadline: formData.get('deadline') as string,
                assignedTeam: (formData.get('assignedTeam') as string).split(',').map(t => t.trim()),
                practiceArea: formData.get('practiceArea') as string,
                progress: parseInt(formData.get('progress') as string) || 0
              };
              handleSaveMatter(matterData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matter Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingMatter?.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <input
                    type="text"
                    name="client"
                    required
                    defaultValue={editingMatter?.client}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matter Type</label>
                  <select
                    name="type"
                    required
                    defaultValue={editingMatter?.type}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Corporate Law">Corporate Law</option>
                    <option value="Employment Law">Employment Law</option>
                    <option value="Intellectual Property">Intellectual Property</option>
                    <option value="Regulatory">Regulatory</option>
                    <option value="Litigation">Litigation</option>
                    <option value="Contract Review">Contract Review</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    required
                    defaultValue={editingMatter?.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    required
                    defaultValue={editingMatter?.priority}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    name="budget"
                    min="0"
                    defaultValue={editingMatter?.budget}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Billed ($)</label>
                  <input
                    type="number"
                    name="billed"
                    min="0"
                    defaultValue={editingMatter?.billed}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Spent (hours)</label>
                  <input
                    type="number"
                    name="timeSpent"
                    min="0"
                    defaultValue={editingMatter?.timeSpent}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    name="estimatedHours"
                    min="0"
                    defaultValue={editingMatter?.estimatedHours}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    defaultValue={editingMatter?.startDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    defaultValue={editingMatter?.deadline}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Practice Area</label>
                  <input
                    type="text"
                    name="practiceArea"
                    defaultValue={editingMatter?.practiceArea}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    name="progress"
                    min="0"
                    max="100"
                    defaultValue={editingMatter?.progress}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Team (comma-separated)</label>
                  <input
                    type="text"
                    name="assignedTeam"
                    defaultValue={editingMatter?.assignedTeam?.join(', ')}
                    placeholder="e.g., Sarah Johnson, Michael Chen"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingMatter(false);
                    setEditingMatter(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingMatter ? 'Update Matter' : 'Add Matter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Matter Modal */}
      {selectedMatter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{selectedMatter.title}</h2>
                <p className="text-gray-600">{selectedMatter.client} • {selectedMatter.type}</p>
              </div>
              <button
                onClick={() => setSelectedMatter(null)}
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
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Matter Details</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Matter ID:</span>
                      <span className="font-medium">{selectedMatter.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedMatter.status)}`}>
                        {selectedMatter.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedMatter.priority)}`}>
                        {selectedMatter.priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Practice Area:</span>
                      <span className="font-medium">{selectedMatter.practiceArea}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Timeline</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">{selectedMatter.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deadline:</span>
                      <span className="font-medium">{selectedMatter.deadline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium">{selectedMatter.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Financial</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium">${selectedMatter.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Billed:</span>
                      <span className="font-medium">${selectedMatter.billed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-medium">${(selectedMatter.budget - selectedMatter.billed).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Utilization:</span>
                      <span className={`font-medium ${getBudgetStatus(selectedMatter.budget, selectedMatter.billed)}`}>
                        {((selectedMatter.billed / selectedMatter.budget) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Time Tracking</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hours Spent:</span>
                      <span className="font-medium">{selectedMatter.timeSpent}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Hours:</span>
                      <span className="font-medium">{selectedMatter.estimatedHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-medium">{selectedMatter.estimatedHours - selectedMatter.timeSpent}h</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Team</h3>
                  <div className="mt-2 space-y-2">
                    {selectedMatter.assignedTeam.map((member, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-600">
                          {member.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm text-gray-900">{member}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Recent Activity</h3>
                  <div className="mt-2 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">Budget updated</p>
                        <p className="text-xs text-gray-500">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">Team member assigned</p>
                        <p className="text-xs text-gray-500">1 week ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">Progress milestone reached</p>
                        <p className="text-xs text-gray-500">2 weeks ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setSelectedMatter(null);
                  handleEditMatter(selectedMatter);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Edit Matter
              </button>
              <button
                onClick={() => setSelectedMatter(null)}
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
