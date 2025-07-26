import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { Alert } from '../components/ui/Alert';

// Integration Service Interface
interface IntegrationService {
  id: string;
  name: string;
  description: string;
  category: 'document' | 'calendar' | 'email' | 'payment' | 'crm' | 'storage' | 'communication';
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  icon: string;
  provider: string;
  features: string[];
  config: Record<string, any>;
  lastSync?: Date;
  errorMessage?: string;
}

// Available Integration Services
const AVAILABLE_INTEGRATIONS: IntegrationService[] = [
  {
    id: 'docusign',
    name: 'DocuSign',
    description: 'Electronic signature and document workflow',
    category: 'document',
    status: 'connected',
    icon: '📝',
    provider: 'DocuSign',
    features: ['E-Signatures', 'Document Templates', 'Workflow Automation', 'Status Tracking'],
    config: {
      apiKey: '***************',
      accountId: 'acc_12345',
      baseUrl: 'https://demo.docusign.net'
    },
    lastSync: new Date('2024-01-20T10:30:00')
  },
  {
    id: 'outlook-calendar',
    name: 'Outlook Calendar',
    description: 'Calendar integration for scheduling and appointments',
    category: 'calendar',
    status: 'connected',
    icon: '📅',
    provider: 'Microsoft',
    features: ['Event Creation', 'Meeting Scheduling', 'Reminder Notifications', 'Availability Checking'],
    config: {
      tenantId: 'tenant_67890',
      clientId: 'client_abcdef',
      redirectUri: 'https://counselflow.com/auth/callback'
    },
    lastSync: new Date('2024-01-20T11:15:00')
  },
  {
    id: 'gmail',
    name: 'Gmail Integration',
    description: 'Email management and automation',
    category: 'email',
    status: 'connected',
    icon: '📧',
    provider: 'Google',
    features: ['Email Automation', 'Template Management', 'Thread Tracking', 'Attachment Handling'],
    config: {
      clientId: 'google_client_123',
      scope: 'https://www.googleapis.com/auth/gmail.modify',
      refreshToken: '***************'
    },
    lastSync: new Date('2024-01-20T09:45:00')
  },
  {
    id: 'stripe',
    name: 'Stripe Payments',
    description: 'Payment processing and invoicing',
    category: 'payment',
    status: 'connected',
    icon: '💳',
    provider: 'Stripe',
    features: ['Invoice Generation', 'Payment Processing', 'Subscription Management', 'Financial Reporting'],
    config: {
      publishableKey: 'pk_test_***************',
      secretKey: '***************',
      webhookSecret: 'whsec_***************'
    },
    lastSync: new Date('2024-01-20T08:20:00')
  },
  {
    id: 'salesforce',
    name: 'Salesforce CRM',
    description: 'Customer relationship management',
    category: 'crm',
    status: 'disconnected',
    icon: '🏢',
    provider: 'Salesforce',
    features: ['Lead Management', 'Contact Sync', 'Opportunity Tracking', 'Pipeline Analytics'],
    config: {}
  },
  {
    id: 'dropbox',
    name: 'Dropbox Business',
    description: 'Cloud storage and file sharing',
    category: 'storage',
    status: 'pending',
    icon: '📁',
    provider: 'Dropbox',
    features: ['File Sync', 'Document Sharing', 'Version Control', 'Team Folders'],
    config: {
      appKey: 'dropbox_key_456',
      appSecret: '***************'
    }
  },
  {
    id: 'slack',
    name: 'Slack Workspace',
    description: 'Team communication and notifications',
    category: 'communication',
    status: 'error',
    icon: '💬',
    provider: 'Slack',
    features: ['Team Notifications', 'Case Updates', 'File Sharing', 'Direct Messaging'],
    config: {
      botToken: 'xoxb-***************',
      signingSecret: '***************'
    },
    errorMessage: 'Authentication token expired'
  },
  {
    id: 'zoom',
    name: 'Zoom Meetings',
    description: 'Video conferencing and virtual meetings',
    category: 'communication',
    status: 'disconnected',
    icon: '🎥',
    provider: 'Zoom',
    features: ['Meeting Scheduling', 'Recording Management', 'Participant Tracking', 'Integration with Calendar'],
    config: {}
  }
];

// Integration Statistics
const INTEGRATION_STATS = {
  totalIntegrations: AVAILABLE_INTEGRATIONS.length,
  connectedIntegrations: AVAILABLE_INTEGRATIONS.filter(i => i.status === 'connected').length,
  pendingIntegrations: AVAILABLE_INTEGRATIONS.filter(i => i.status === 'pending').length,
  errorIntegrations: AVAILABLE_INTEGRATIONS.filter(i => i.status === 'error').length,
  lastSyncTime: new Date('2024-01-20T11:15:00'),
  dataProcessed: '2.4GB',
  apiCallsToday: 1547
};

// Category configurations
const CATEGORY_CONFIG = {
  document: { color: 'bg-blue-100 text-blue-800', label: 'Document Management' },
  calendar: { color: 'bg-green-100 text-green-800', label: 'Calendar & Scheduling' },
  email: { color: 'bg-purple-100 text-purple-800', label: 'Email & Communication' },
  payment: { color: 'bg-yellow-100 text-yellow-800', label: 'Payment Processing' },
  crm: { color: 'bg-orange-100 text-orange-800', label: 'Customer Relations' },
  storage: { color: 'bg-indigo-100 text-indigo-800', label: 'File Storage' },
  communication: { color: 'bg-pink-100 text-pink-800', label: 'Team Communication' }
};

export function IntegrationManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [integrations, setIntegrations] = useState<IntegrationService[]>(AVAILABLE_INTEGRATIONS);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationService | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Filter integrations
  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = filterCategory === 'all' || integration.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || integration.status === filterStatus;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Connect integration
  const connectIntegration = async (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'pending' as const }
        : integration
    ));

    // Simulate connection process
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { 
              ...integration, 
              status: 'connected' as const, 
              lastSync: new Date(),
              errorMessage: undefined
            }
          : integration
      ));
    }, 2000);
  };

  // Disconnect integration
  const disconnectIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'disconnected' as const, errorMessage: undefined }
        : integration
    ));
  };

  // Sync integration
  const syncIntegration = async (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'pending' as const }
        : integration
    ));

    // Simulate sync process
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'connected' as const, lastSync: new Date() }
          : integration
      ));
    }, 1500);
  };

  // Test integration
  const testIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    // Simulate test
    const testResult = Math.random() > 0.2; // 80% success rate
    
    if (testResult) {
      alert(`✅ ${integration.name} test successful!\n\nAll features are working correctly.`);
    } else {
      alert(`❌ ${integration.name} test failed!\n\nPlease check your configuration settings.`);
    }
  };

  // Configure integration
  const configureIntegration = (integration: IntegrationService) => {
    setSelectedIntegration(integration);
    setIsConfiguring(true);
  };

  // Save configuration
  const saveConfiguration = (config: Record<string, any>) => {
    if (!selectedIntegration) return;

    setIntegrations(prev => prev.map(integration => 
      integration.id === selectedIntegration.id 
        ? { ...integration, config }
        : integration
    ));

    setIsConfiguring(false);
    setSelectedIntegration(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅';
      case 'disconnected': return '⚫';
      case 'pending': return '⏳';
      case 'error': return '❌';
      default: return '⚫';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Integration Management</h2>
        <p className="text-gray-600">Connect and manage third-party services and integrations</p>
      </div>

      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'integrations', label: 'Integrations' },
          { id: 'api-management', label: 'API Management' },
          { id: 'webhooks', label: 'Webhooks' },
          { id: 'logs', label: 'Activity Logs' }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'overview' && (
        <div className="mt-6 space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-blue-600">{INTEGRATION_STATS.connectedIntegrations}</div>
                <div className="text-2xl">🔗</div>
              </div>
              <div className="text-sm text-gray-600">Connected Services</div>
              <div className="text-xs text-gray-500 mt-1">
                of {INTEGRATION_STATS.totalIntegrations} available
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-green-600">{INTEGRATION_STATS.apiCallsToday}</div>
                <div className="text-2xl">📊</div>
              </div>
              <div className="text-sm text-gray-600">API Calls Today</div>
              <div className="text-xs text-green-500 mt-1">+12% from yesterday</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-purple-600">{INTEGRATION_STATS.dataProcessed}</div>
                <div className="text-2xl">💾</div>
              </div>
              <div className="text-sm text-gray-600">Data Processed</div>
              <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-orange-600">{INTEGRATION_STATS.errorIntegrations}</div>
                <div className="text-2xl">⚠️</div>
              </div>
              <div className="text-sm text-gray-600">Issues to Resolve</div>
              <div className="text-xs text-orange-500 mt-1">Requires attention</div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Integration Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <span className="text-lg">📝</span>
                <div className="flex-1">
                  <div className="font-medium">DocuSign document signed</div>
                  <div className="text-sm text-gray-600">Service Agreement - Client #1247</div>
                </div>
                <div className="text-sm text-gray-500">2 minutes ago</div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-lg">📅</span>
                <div className="flex-1">
                  <div className="font-medium">Meeting scheduled via Outlook</div>
                  <div className="text-sm text-gray-600">Client consultation - Tomorrow 3:00 PM</div>
                </div>
                <div className="text-sm text-gray-500">15 minutes ago</div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <span className="text-lg">💳</span>
                <div className="flex-1">
                  <div className="font-medium">Payment processed via Stripe</div>
                  <div className="text-sm text-gray-600">Invoice #INV-2024-001 - $2,500.00</div>
                </div>
                <div className="text-sm text-gray-500">1 hour ago</div>
              </div>
            </div>
          </Card>

          {/* Integration Status by Category */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Integration Status by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
                const categoryIntegrations = integrations.filter(i => i.category === category);
                const connectedCount = categoryIntegrations.filter(i => i.status === 'connected').length;
                
                return (
                  <div key={category} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-sm font-medium">
                        {connectedCount}/{categoryIntegrations.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(connectedCount / categoryIntegrations.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="mt-6">
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-64"
            />
            <Select
              value={filterCategory}
              onChange={setFilterCategory}
              options={[
                { value: 'all', label: 'All Categories' },
                ...Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
                  value: key,
                  label: config.label
                }))
              ]}
            />
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'connected', label: 'Connected' },
                { value: 'disconnected', label: 'Disconnected' },
                { value: 'pending', label: 'Pending' },
                { value: 'error', label: 'Error' }
              ]}
            />
          </div>

          {/* Integration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map(integration => (
              <Card key={integration.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <h3 className="font-semibold">{integration.name}</h3>
                      <p className="text-sm text-gray-600">{integration.provider}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(integration.status)}`}>
                    {getStatusIcon(integration.status)} {integration.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                {integration.errorMessage && (
                  <Alert className="mb-4 bg-red-50 border-red-200">
                    <span className="text-red-600 text-sm">{integration.errorMessage}</span>
                  </Alert>
                )}

                <div className="mb-4">
                  <span className={`px-2 py-1 rounded text-xs ${CATEGORY_CONFIG[integration.category].color}`}>
                    {CATEGORY_CONFIG[integration.category].label}
                  </span>
                </div>

                {integration.features.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-medium text-gray-500 mb-2">Features:</div>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 3).map(feature => (
                        <span key={feature} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                      {integration.features.length > 3 && (
                        <span className="text-xs text-gray-500">+{integration.features.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}

                {integration.lastSync && (
                  <div className="text-xs text-gray-500 mb-4">
                    Last sync: {integration.lastSync.toLocaleString()}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {integration.status === 'connected' ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => syncIntegration(integration.id)}
                      >
                        🔄 Sync
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testIntegration(integration.id)}
                      >
                        🧪 Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => configureIntegration(integration)}
                      >
                        ⚙️ Configure
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => disconnectIntegration(integration.id)}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => connectIntegration(integration.id)}
                        disabled={integration.status === 'pending'}
                      >
                        {integration.status === 'pending' ? 'Connecting...' : 'Connect'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => configureIntegration(integration)}
                      >
                        ⚙️ Configure
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium mb-2">No integrations found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'api-management' && (
        <div className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">API Management</h3>
            <div className="space-y-6">
              {/* API Keys */}
              <div>
                <h4 className="font-medium mb-3">API Keys & Authentication</h4>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">CounselFlow API Key</span>
                      <Button size="sm" variant="outline">Regenerate</Button>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Used for authenticating with CounselFlow APIs
                    </div>
                    <div className="bg-gray-50 p-2 rounded font-mono text-sm">
                      cf_live_1234567890abcdef...
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Webhook Secret</span>
                      <Button size="sm" variant="outline">Regenerate</Button>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Used for verifying webhook signatures
                    </div>
                    <div className="bg-gray-50 p-2 rounded font-mono text-sm">
                      whsec_1234567890abcdef...
                    </div>
                  </div>
                </div>
              </div>

              {/* Rate Limits */}
              <div>
                <h4 className="font-medium mb-3">Rate Limits & Usage</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-lg font-semibold">1,547</div>
                    <div className="text-sm text-gray-600">API Calls Today</div>
                    <div className="text-xs text-green-600">Within limits</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-lg font-semibold">15/100</div>
                    <div className="text-sm text-gray-600">Calls per minute</div>
                    <div className="text-xs text-green-600">Normal usage</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-lg font-semibold">2.4GB</div>
                    <div className="text-sm text-gray-600">Data transferred</div>
                    <div className="text-xs text-gray-500">This month</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'webhooks' && (
        <div className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Webhook Configuration</h3>
              <Button>+ Add Webhook</Button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Document Status Updates</span>
                  <span className="text-green-600 text-sm">✅ Active</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Triggers when document status changes
                </div>
                <div className="bg-gray-50 p-2 rounded font-mono text-sm mb-2">
                  https://api.counselflow.com/webhooks/document-status
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Test</Button>
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="destructive">Delete</Button>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Payment Notifications</span>
                  <span className="text-green-600 text-sm">✅ Active</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Triggers when payments are processed
                </div>
                <div className="bg-gray-50 p-2 rounded font-mono text-sm mb-2">
                  https://api.counselflow.com/webhooks/payments
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Test</Button>
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="destructive">Delete</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Integration Activity Logs</h3>
            <div className="space-y-3">
              {[
                { time: '2024-01-20 11:15:32', service: 'DocuSign', action: 'Document Signed', status: 'success', details: 'Service Agreement signed by client' },
                { time: '2024-01-20 11:10:45', service: 'Outlook', action: 'Meeting Created', status: 'success', details: 'Client consultation scheduled for tomorrow' },
                { time: '2024-01-20 11:05:12', service: 'Stripe', action: 'Payment Processed', status: 'success', details: 'Invoice #INV-2024-001 payment received' },
                { time: '2024-01-20 10:58:33', service: 'Gmail', action: 'Email Sent', status: 'success', details: 'Contract review reminder sent to client' },
                { time: '2024-01-20 10:45:21', service: 'Slack', action: 'Authentication', status: 'error', details: 'Token expired, reconnection required' },
                { time: '2024-01-20 10:30:15', service: 'Dropbox', action: 'File Sync', status: 'pending', details: 'Syncing contract documents...' }
              ].map((log, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="text-sm text-gray-500 w-32">{log.time}</div>
                  <div className="font-medium w-24">{log.service}</div>
                  <div className="flex-1">{log.action}</div>
                  <div className="text-sm text-gray-600 flex-1">{log.details}</div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    log.status === 'success' ? 'bg-green-100 text-green-700' :
                    log.status === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {log.status}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Configuration Modal */}
      {isConfiguring && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Configure {selectedIntegration.name}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfiguring(false)}
              >
                ✕ Close
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">API Key</label>
                <Input
                  type="password"
                  defaultValue={selectedIntegration.config.apiKey || ''}
                  placeholder="Enter API key..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Base URL</label>
                <Input
                  defaultValue={selectedIntegration.config.baseUrl || ''}
                  placeholder="https://api.example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Webhook URL</label>
                <Input
                  defaultValue={`https://api.counselflow.com/webhooks/${selectedIntegration.id}`}
                  placeholder="Webhook endpoint URL..."
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input type="checkbox" id="enableLogs" defaultChecked />
                <label htmlFor="enableLogs" className="text-sm">Enable activity logging</label>
              </div>
              
              <div className="flex items-center gap-2">
                <input type="checkbox" id="enableNotifications" defaultChecked />
                <label htmlFor="enableNotifications" className="text-sm">Send notifications on errors</label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={() => saveConfiguration({})}>
                  Save Configuration
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsConfiguring(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}