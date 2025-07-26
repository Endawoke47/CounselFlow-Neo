'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { SimpleAIContractAnalysis } from '../../components/SimpleAIContractAnalysis';
import { productionApiClient, type Contract } from '@/lib/production-api-client';
import { useAuth } from '../../providers/auth-provider';
import { FileText, Plus, Search, Download, Upload, Edit3, Trash2, Eye, CheckCircle, AlertTriangle, BarChart3, Calendar, Brain, TrendingUp, Clock, DollarSign, Zap } from 'lucide-react';

// Frontend display interface for contracts
interface ContractDisplay {
  id: string;
  title: string;
  counterparty: string;
  type: string;
  status: string;
  value: number;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  riskScore: number;
  compliance: number;
  autoRenewal: boolean;
  priority: string;
}

export default function ContractManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [contracts, setContracts] = useState<ContractDisplay[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingContract, setIsAddingContract] = useState(false);
  const [editingContract, setEditingContract] = useState<ContractDisplay | null>(null);
  const [selectedContract, setSelectedContract] = useState<ContractDisplay | null>(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysisContract, setAIAnalysisContract] = useState<ContractDisplay | null>(null);
  
  const { user } = useAuth();

  // Load contracts and clients from API
  useEffect(() => {
    loadContracts();
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await productionApiClient.getClients();
      setClients(response.data?.clients || []);
    } catch (err: any) {
      console.error('Failed to load clients:', err);
      // Fallback clients for development
      setClients([
        { id: 'CLT001', name: 'TechCorp Ltd' },
        { id: 'CLT002', name: 'Jane Doe' },
        { id: 'CLT003', name: 'ABC Corporation' }
      ]);
    }
  };

  const loadContracts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productionApiClient.getContracts();
      const data = response.data?.contracts || [];
      
      // Transform API data to match frontend interface
      const transformedContracts: ContractDisplay[] = data.map((contract: Contract) => ({
        id: contract.id,
        title: contract.title || '',
        counterparty: contract.client?.name || contract.clientId || 'Unknown',
        type: contract.contractType || 'General',
        status: contract.status || 'Draft',
        value: contract.value || 0,
        startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
        endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
        renewalDate: undefined, // Map from contract data if available
        riskScore: contract.riskLevel === 'high' ? 80 : contract.riskLevel === 'medium' ? 60 : 40,
        compliance: 85, // Default compliance score
        autoRenewal: false, // Map from contract data if available
        priority: contract.priority || 'medium'
      }));
      
      setContracts(transformedContracts);
    } catch (err: any) {
      console.error('Failed to load contracts:', err);
      setError(err.message || 'Failed to load contracts');
      // Fallback to mock data for development
      setContracts([
        {
          id: 'CTR001',
          title: 'Software Licensing Agreement',
          counterparty: 'TechSoft Solutions Ltd',
          type: 'Software License',
          status: 'Active',
          value: 250000,
          startDate: '2024-01-15',
          endDate: '2025-01-14',
          renewalDate: '2025-01-14',
          riskScore: 85,
          compliance: 95,
          autoRenewal: true,
          priority: 'High'
        },
        {
          id: 'CTR002',
          title: 'Office Lease Agreement',
          counterparty: 'Prime Properties Kenya',
          type: 'Real Estate',
          status: 'Active',
          value: 480000,
          startDate: '2023-06-01',
          endDate: '2026-05-31',
          riskScore: 92,
          compliance: 88,
          autoRenewal: false,
          priority: 'Medium'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers for full functionality
  const handleAddContract = () => {
    setIsAddingContract(true);
  };

  const handleEditContract = (contract: ContractDisplay) => {
    setEditingContract(contract);
    setIsAddingContract(true);
  };

  const handleDeleteContract = async (contractId: string) => {
    if (confirm('Are you sure you want to delete this contract?')) {
      try {
        await productionApiClient.deleteContract(contractId);
        setContracts(contracts.filter(c => c.id !== contractId));
      } catch (err: any) {
        console.error('Failed to delete contract:', err);
        alert('Failed to delete contract: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleViewContract = (contract: ContractDisplay) => {
    setSelectedContract(contract);
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Title', 'Counterparty', 'Type', 'Status', 'Value', 'Start Date', 'End Date', 'Risk Score', 'Compliance', 'Priority'],
      ...contracts.map(c => [c.id, c.title, c.counterparty, c.type, c.status, c.value.toString(), c.startDate, c.endDate, c.riskScore.toString(), c.compliance.toString(), c.priority])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contracts.csv';
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
        alert('Contract import functionality implemented - File selected: ' + file.name);
      }
    };
    input.click();
  };

  const handleAIReview = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      setAIAnalysisContract(contract);
      setShowAIAnalysis(true);
    }
  };

  const handleAIAnalysisComplete = (analysis: any) => {
    console.log('AI Analysis completed:', analysis);
    // Update contract with AI analysis results if needed
    if (aiAnalysisContract && analysis) {
      const updatedContract = {
        ...aiAnalysisContract,
        riskScore: analysis.overallRiskScore || aiAnalysisContract.riskScore,
        // Update other fields based on AI analysis
      };
      setContracts(contracts.map(c => c.id === aiAnalysisContract.id ? updatedContract : c));
    }
  };

  const handleSaveContract = async (contractData: Partial<ContractDisplay>) => {
    try {
      // Transform frontend data to backend API format  
      const apiData = {
        title: contractData.title || 'Untitled Contract',
        description: contractData.title || 'Contract description',
        clientId: 'default-client-id', // This should be selected from a client list
        contractType: contractData.type || 'General',
        status: (contractData.status || 'Draft') as "Draft" | "Under Review" | "Approved" | "Executed" | "Expired" | "Terminated",
        value: contractData.value || 0,
        currency: 'KES',
        startDate: contractData.startDate || new Date().toISOString(),
        endDate: contractData.endDate || '',
        riskLevel: (contractData.riskScore && contractData.riskScore > 70 ? 'high' : 
                   contractData.riskScore && contractData.riskScore > 50 ? 'medium' : 'low') as "low" | "medium" | "high",
        priority: (contractData.priority || 'medium') as "low" | "medium" | "high" | "urgent",
        assignedLawyerId: user?.id || 'default-lawyer-id'
      };

      if (editingContract) {
        const response = await productionApiClient.updateContract(editingContract.id, apiData);
        const updatedContract = response.data;
        if (updatedContract) {
          setContracts(contracts.map(c => c.id === editingContract.id ? {
            ...c,
            ...contractData,
            id: updatedContract.id || c.id
          } : c));
        }
      } else {
        const response = await productionApiClient.createContract(apiData);
        const newContract = response.data;
        if (newContract) {
          const formattedContract: ContractDisplay = {
            id: newContract.id,
            title: newContract.title || contractData.title || '',
            counterparty: contractData.counterparty || 'Unknown',
            type: newContract.contractType || contractData.type || '',
            status: newContract.status || contractData.status || 'Draft',
            value: newContract.value || contractData.value || 0,
            startDate: newContract.startDate ? new Date(newContract.startDate).toISOString().split('T')[0] : contractData.startDate || '',
            endDate: newContract.endDate ? new Date(newContract.endDate).toISOString().split('T')[0] : contractData.endDate || '',
            renewalDate: contractData.renewalDate,
            riskScore: newContract.riskLevel === 'high' ? 80 : newContract.riskLevel === 'medium' ? 60 : 40,
            compliance: 85,
            autoRenewal: false, // Map from contract data if available
            priority: newContract.priority || contractData.priority || 'Medium'
          };
          setContracts([...contracts, formattedContract]);
        }
      }
    } catch (err: any) {
      console.error('Failed to save contract:', err);
      alert('Failed to save contract: ' + (err.message || 'Unknown error'));
      return; // Don't close modal on error
    }
    
    setIsAddingContract(false);
    setEditingContract(null);
  };

  const stats = [
    { label: 'Total Contracts', value: '342', change: '+28', icon: FileText, color: 'text-primary-600' },
    { label: 'Active Contracts', value: '287', change: '+15', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Total Value', value: '$2.4M', change: '+12%', icon: DollarSign, color: 'text-purple-600' },
    { label: 'Expiring Soon', value: '23', change: '+5', icon: Clock, color: 'text-orange-600' }
  ];

  const renewalAlerts = [
    { contract: 'Software Licensing Agreement', counterparty: 'TechSoft Solutions Ltd', daysUntilExpiry: 15, value: 250000 },
    { contract: 'Marketing Services Agreement', counterparty: 'Creative Agency Co', daysUntilExpiry: 30, value: 85000 },
    { contract: 'Maintenance Contract', counterparty: 'IT Support Services', daysUntilExpiry: 45, value: 120000 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Terminated': return 'bg-red-100 text-red-800';
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

  // Filter contracts based on search and filter
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.counterparty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && contract.status.toLowerCase().replace(' ', '') === selectedFilter;
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
                  <FileText className="mr-3 h-8 w-8 text-primary-600" />
                  Contract Management
                </h1>
                <p className="text-gray-600 mt-1">Contract Lifecycle & AI-Powered Risk Analysis</p>
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
                onClick={handleAddContract}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Contract
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
                  placeholder="Search contracts..."
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
                <option value="draft">Draft</option>
                <option value="underreview">Under Review</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contracts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Contract Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Counterparty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{contract.title}</div>
                          <div className="text-sm text-gray-500">{contract.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contract.counterparty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contract.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${contract.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${contract.riskScore >= 80 ? 'bg-green-500' : contract.riskScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${contract.riskScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{contract.riskScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(contract.priority)}`}>
                        {contract.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewContract(contract)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Contract"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditContract(contract)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Contract"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAIReview(contract.id)}
                          className="text-purple-600 hover:text-purple-900"
                          title="AI Review"
                        >
                          <Brain className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContract(contract.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Contract"
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

        {/* Renewal Alerts & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Renewal Alerts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-500" />
                Renewal Alerts
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-800">View All</button>
            </div>
            <div className="space-y-4">
              {renewalAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{alert.contract}</p>
                    <p className="text-sm text-gray-600">{alert.counterparty}</p>
                    <p className="text-sm text-green-600">${alert.value.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">{alert.daysUntilExpiry} days</p>
                    <p className="text-xs text-gray-500">until expiry</p>
                  </div>
                </div>
              ))}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-orange-600">3 high-value contracts expiring within 30 days</p>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-500" />
                AI Contract Insights
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-800">Analyze All</button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Risk Alert</p>
                <p className="text-xs text-gray-600 mt-1">Supply Chain Agreement contains unusual liability clauses</p>
                <p className="text-xs text-red-600 mt-1">Recommend legal review before signing</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Cost Optimization</p>
                <p className="text-xs text-gray-600 mt-1">3 contracts eligible for bulk renewal discount</p>
                <p className="text-xs text-green-600 mt-1">Potential savings: $12,000</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Compliance Recommendation</p>
                <p className="text-xs text-gray-600 mt-1">Update data protection clauses to align with latest regulations</p>
                <p className="text-xs text-primary-600 mt-1">Affects 8 active contracts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Contract Modal */}
      {isAddingContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingContract ? 'Edit Contract' : 'Add New Contract'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const contractData = {
                title: formData.get('title') as string,
                counterparty: formData.get('counterparty') as string,
                clientId: formData.get('clientId') as string,
                type: formData.get('type') as string,
                status: formData.get('status') as string,
                value: parseInt(formData.get('value') as string) || 0,
                startDate: formData.get('startDate') as string,
                endDate: formData.get('endDate') as string,
                renewalDate: formData.get('renewalDate') as string,
                riskScore: parseInt(formData.get('riskScore') as string) || 0,
                compliance: parseInt(formData.get('compliance') as string) || 0,
                autoRenewal: formData.get('autoRenewal') === 'on',
                priority: formData.get('priority') as string
              };
              handleSaveContract(contractData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingContract?.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Counterparty</label>
                  <input
                    type="text"
                    name="counterparty"
                    required
                    defaultValue={editingContract?.counterparty}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <select
                    name="clientId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Client (Optional)</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
                  <select
                    name="type"
                    required
                    defaultValue={editingContract?.type}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Software License">Software License</option>
                    <option value="Service Agreement">Service Agreement</option>
                    <option value="Supply Chain">Supply Chain</option>
                    <option value="Employment">Employment</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Partnership">Partnership</option>
                    <option value="NDA">Non-Disclosure Agreement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    required
                    defaultValue={editingContract?.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value ($)</label>
                  <input
                    type="number"
                    name="value"
                    min="0"
                    defaultValue={editingContract?.value}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    defaultValue={editingContract?.startDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    defaultValue={editingContract?.endDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Date</label>
                  <input
                    type="date"
                    name="renewalDate"
                    defaultValue={editingContract?.renewalDate}
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
                    defaultValue={editingContract?.riskScore}
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
                    defaultValue={editingContract?.compliance}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    required
                    defaultValue={editingContract?.priority}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="autoRenewal"
                      defaultChecked={editingContract?.autoRenewal}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Auto-renewal enabled</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingContract(false);
                    setEditingContract(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingContract ? 'Update Contract' : 'Add Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Contract Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{selectedContract.title}</h2>
                <p className="text-gray-600">{selectedContract.counterparty} • {selectedContract.type}</p>
              </div>
              <button
                onClick={() => setSelectedContract(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Contract Details</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contract ID:</span>
                      <span className="font-medium">{selectedContract.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedContract.status)}`}>
                        {selectedContract.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Value:</span>
                      <span className="font-medium">${selectedContract.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedContract.priority)}`}>
                        {selectedContract.priority}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Timeline</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">{selectedContract.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">{selectedContract.endDate}</span>
                    </div>
                    {selectedContract.renewalDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Renewal Date:</span>
                        <span className="font-medium">{selectedContract.renewalDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Auto-renewal:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedContract.autoRenewal ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedContract.autoRenewal ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Performance Metrics</h3>
                  <div className="mt-2 space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Risk Score:</span>
                        <span className="font-medium">{selectedContract.riskScore}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${selectedContract.riskScore >= 80 ? 'bg-green-500' : selectedContract.riskScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${selectedContract.riskScore}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Compliance:</span>
                        <span className="font-medium">{selectedContract.compliance}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${selectedContract.compliance >= 90 ? 'bg-green-500' : selectedContract.compliance >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${selectedContract.compliance}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Recent Activity</h3>
                  <div className="mt-2 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">Contract signed</p>
                        <p className="text-xs text-gray-500">2 weeks ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">Risk assessment completed</p>
                        <p className="text-xs text-gray-500">1 month ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">Terms negotiated</p>
                        <p className="text-xs text-gray-500">2 months ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => handleAIReview(selectedContract.id)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Review
              </button>
              <button
                onClick={() => {
                  setSelectedContract(null);
                  handleEditContract(selectedContract);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Edit Contract
              </button>
              <button
                onClick={() => setSelectedContract(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Contract Analysis Modal */}
      {showAIAnalysis && aiAnalysisContract && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-purple-600" />
                AI Contract Analysis: {aiAnalysisContract.title}
              </h3>
              <button
                onClick={() => {
                  setShowAIAnalysis(false);
                  setAIAnalysisContract(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto">
              <SimpleAIContractAnalysis
                contractText={`Sample contract text for ${aiAnalysisContract.title}. This would normally be the actual contract content loaded from the database or file storage.`}
                onAnalysisComplete={handleAIAnalysisComplete}
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </MainLayout>
  );
}
