'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/layout/MainLayout';
import { productionApiClient, type Client, type Contract } from '@/lib/production-api-client';
import { useAuth } from '../../providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  FileText, 
  Scale, 
  AlertTriangle,
  DollarSign,
  CheckCircle,
  Clock,
  BarChart3,
  Building2,
  Loader2,
  Plus,
  Eye
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [metrics, setMetrics] = useState([
    {
      title: 'Total Clients',
      value: '0',
      change: '+0%',
      trend: 'up',
      icon: Building2,
      color: 'text-blue-600'
    },
    {
      title: 'Active Matters',
      value: '0',
      change: '+0%',
      trend: 'up',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      title: 'Revenue (YTD)',
      value: 'KES 0',
      change: '+0%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Pending Tasks',
      value: '0',
      change: '0%',
      trend: 'down',
      icon: Clock,
      color: 'text-orange-600'
    }
  ]);

  const [contracts, setContracts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load dashboard metrics from production API
      const [metricsResponse, clientsResponse, contractsResponse] = await Promise.allSettled([
        productionApiClient.getDashboardMetrics(),
        productionApiClient.getClients({ limit: 10 }),
        productionApiClient.getContracts({ limit: 10 })
      ]);

      // Handle metrics
      if (metricsResponse.status === 'fulfilled' && metricsResponse.value.success && metricsResponse.value.data) {
        const data = metricsResponse.value.data;
        setMetrics([
          {
            title: 'Total Clients',
            value: data.totalClients.toString(),
            change: '+0%',
            trend: 'up',
            icon: Building2,
            color: 'text-blue-600'
          },
          {
            title: 'Active Matters',
            value: data.activeMatters.toString(),
            change: '+0%',
            trend: 'up',
            icon: FileText,
            color: 'text-purple-600'
          },
          {
            title: 'Revenue (YTD)',
            value: `KES ${data.revenue.total.toLocaleString()}`,
            change: `${data.revenue.growth > 0 ? '+' : ''}${data.revenue.growth.toFixed(1)}%`,
            trend: data.revenue.growth > 0 ? 'up' : 'down',
            icon: DollarSign,
            color: 'text-green-600'
          },
          {
            title: 'Pending Tasks',
            value: data.pendingTasks.toString(),
            change: '0%',
            trend: 'down',
            icon: Clock,
            color: 'text-orange-600'
          }
        ]);
        
        // Set recent activities
        if (data.recentActivities) {
          setRecentActivities(data.recentActivities);
        }
      }

      // Handle clients data
      if (clientsResponse.status === 'fulfilled' && clientsResponse.value.success && clientsResponse.value.data) {
        setClients(clientsResponse.value.data.clients);
      }

      // Handle contracts data
      if (contractsResponse.status === 'fulfilled' && contractsResponse.value.success && contractsResponse.value.data) {
        setContracts(contractsResponse.value.data.contracts);
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleNewMatter = () => {
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className={`h-4 w-4 ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                          <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {metric.change}
                          </span>
                        </div>
                      </div>
                      <IconComponent className={`h-8 w-8 ${metric.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest actions in your legal practice</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      {activity.priority && (
                        <Badge variant={activity.priority}>{activity.priority}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activities</p>
                  <p className="text-sm text-gray-500">Activities will appear here as you work</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for efficient workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => router.push('/matter-management')} className="flex flex-col items-center p-4 h-auto">
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">New Matter</span>
                </Button>
                <Button variant="outline" onClick={() => router.push('/client-management')} className="flex flex-col items-center p-4 h-auto">
                  <Building2 className="h-6 w-6 mb-2" />
                  <span className="text-sm">Add Client</span>
                </Button>
                <Button variant="outline" onClick={() => router.push('/dispute-management')} className="flex flex-col items-center p-4 h-auto">
                  <Scale className="h-6 w-6 mb-2" />
                  <span className="text-sm">File Dispute</span>
                </Button>
                <Button variant="outline" onClick={() => router.push('/reports')} className="flex flex-col items-center p-4 h-auto">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span className="text-sm">Generate Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Clients and Contracts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Clients */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Clients</CardTitle>
                  <CardDescription>Latest client additions</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/client-management')}>
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {clients.length > 0 ? (
                <div className="space-y-3">
                  {clients.slice(0, 5).map((client, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.clientType}</p>
                        </div>
                      </div>
                      <Badge variant={client.status?.toLowerCase()}>{client.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No clients yet</p>
                  <Button size="sm" onClick={() => router.push('/client-management')} className="mt-2">
                    Add First Client
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Contracts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Contracts</CardTitle>
                  <CardDescription>Latest contract activities</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/contract-management')}>
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {contracts.length > 0 ? (
                <div className="space-y-3">
                  {contracts.slice(0, 5).map((contract, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{contract.title}</p>
                          <p className="text-xs text-gray-500">{contract.contractType}</p>
                        </div>
                      </div>
                      <Badge variant={contract.status?.toLowerCase()}>{contract.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No contracts yet</p>
                  <Button size="sm" onClick={() => router.push('/contract-management')} className="mt-2">
                    Create Contract
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
  const { user } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState([
    {
      title: 'Active Matters',
      value: '0',
      change: '+0%',
      trend: 'up',
      icon: FileText,
      color: 'text-primary-600'
    },
    {
      title: 'Revenue (YTD)',
      value: 'KES 0',
      change: '+0%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-success-600'
    },
    {
      title: 'Pending Tasks',
      value: '0',
      change: '0%',
      trend: 'down',
      icon: Clock,
      color: 'text-warning-600'
    },
    {
      title: 'Client Satisfaction',
      value: '0%',
      change: '+0%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-secondary-600'
    }
  ]);

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation handlers for Quick Actions
  const handleNewMatter = () => {
    router.push('/matter-management?action=new');
  };

  const handleFileDispute = () => {
    router.push('/dispute-management?action=new');
  };

  const handleAddEntity = () => {
    router.push('/entity-management?action=new');
  };

  const handleGenerateReport = () => {
    router.push('/reports');
  };

  // Handle activity clicks
  const handleActivityClick = (activity: any) => {
    switch (activity.type) {
      case 'contract':
        router.push('/contract-management');
        break;
      case 'dispute':
        router.push('/dispute-management');
        break;
      case 'entity':
        router.push('/entity-management');
        break;
      default:
        break;
    }
  };

  const recentActivities = [
    {
      id: 1,
      type: 'contract',
      title: 'New Contract Review Required',
      description: 'Service Agreement - TechCorp Ltd',
      time: '2 hours ago',
      priority: 'high'
    },
    {
      id: 2,
      type: 'dispute',
      title: 'Court Filing Deadline Approaching',
      description: 'Case #2024-CV-1234 - Response due in 3 days',
      time: '5 hours ago',
      priority: 'urgent'
    },
    {
      id: 3,
      type: 'entity',
      title: 'Annual Filing Completed',
      description: 'ABC Holdings Ltd - Annual returns submitted',
      time: '1 day ago',
      priority: 'low'
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'low':
        return <Badge variant="success">Low</Badge>;
      default:
        return <Badge>Normal</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
            <p className="mt-2 text-lg text-neutral-600">Welcome back! Here's what's happening with your legal practice.</p>
          </div>

          {/* Metrics Grid */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading dashboard data</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {metrics.map((metric) => (
              <Card key={metric.title} className="hover:shadow-corporate-md transition-shadow">
                <CardContent className="p-6">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="ml-4 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`p-3 rounded-lg bg-opacity-10 ${metric.color.replace('text-', 'bg-')}`}>
                          <metric.icon className={`h-6 w-6 ${metric.color}`} />
                        </div>
                      </div>
                      <div className="ml-4 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-neutral-500 truncate">{metric.title}</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-bold text-neutral-900">{metric.value}</div>
                            <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                              metric.trend === 'up' ? 'text-success-600' : 'text-error-600'
                            }`}>
                              {metric.trend === 'up' ? (
                                <TrendingUp className="self-center flex-shrink-0 h-4 w-4" />
                              ) : (
                                <svg className="self-center flex-shrink-0 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                              <span className="ml-1">{metric.change}</span>
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activities and Quick Actions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest updates from your legal practice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      onClick={() => handleActivityClick(activity)}
                      className="flex items-start space-x-4 p-4 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-lg ${
                          activity.type === 'contract' ? 'bg-primary-100' :
                          activity.type === 'dispute' ? 'bg-error-100' :
                          'bg-success-100'
                        }`}>
                          {activity.type === 'contract' && <FileText className="h-4 w-4 text-primary-600" />}
                          {activity.type === 'dispute' && <Scale className="h-4 w-4 text-error-600" />}
                          {activity.type === 'entity' && <Building2 className="h-4 w-4 text-success-600" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-neutral-900 truncate">{activity.title}</p>
                          <div className="flex items-center space-x-2">
                            {getPriorityBadge(activity.priority)}
                            <span className="text-xs text-neutral-500">{activity.time}</span>
                          </div>
                        </div>
                        <p className="text-sm text-neutral-600 truncate">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used tools and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={handleNewMatter}
                    className="h-20 flex-col space-y-2 bg-primary-50 hover:bg-primary-100 text-primary-700 border-primary-200" 
                    variant="outline"
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-xs font-medium">New Matter</span>
                  </Button>
                  <Button 
                    onClick={handleFileDispute}
                    className="h-20 flex-col space-y-2 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 border-secondary-200" 
                    variant="outline"
                  >
                    <Scale className="h-5 w-5" />
                    <span className="text-xs font-medium">File Dispute</span>
                  </Button>
                  <Button 
                    onClick={handleAddEntity}
                    className="h-20 flex-col space-y-2 bg-success-50 hover:bg-success-100 text-success-700 border-success-200" 
                    variant="outline"
                  >
                    <Building2 className="h-5 w-5" />
                    <span className="text-xs">Add Entity</span>
                  </Button>
                  <Button 
                    onClick={handleGenerateReport}
                    className="h-20 flex-col space-y-2" 
                    variant="outline"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-xs">Generate Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
