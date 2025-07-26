'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Building2,
  DollarSign,
  Clock,
  TrendingUp,
  Plus,
  AlertTriangle,
  Loader2,
  Scale,
  BarChart3
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProductionApiClient } from '@/lib/production-api-client';

interface Client {
  id: string;
  name: string;
  clientType: string;
  status: string;
}

interface Contract {
  id: string;
  title: string;
  contractType: string;
  status: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  priority: string;
  time: string;
  timestamp: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState([
    {
      title: 'Active Matters',
      value: '0',
      change: '+0%',
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Total Clients',
      value: '0',
      change: '+0%',
      trend: 'up',
      icon: Building2,
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

  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([
    {
      id: '1',
      title: 'New client registered',
      description: 'John Doe has been added to the system',
      priority: 'medium',
      time: '2 hours ago',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Contract review completed',
      description: 'Service agreement reviewed and approved',
      priority: 'high',
      time: '4 hours ago',
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Payment received',
      description: 'Invoice #1001 payment processed',
      priority: 'low',
      time: '1 day ago',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiClient = ProductionApiClient.getInstance();

      // Load metrics
      const metricsResponse = await apiClient.get('/api/dashboard/metrics');
      if (metricsResponse && metricsResponse.data) {
        setMetrics(metricsResponse.data);
      }

      // Load clients
      const clientsResponse = await apiClient.get('/api/clients?limit=5');
      if (clientsResponse && clientsResponse.clients) {
        setClients(clientsResponse.clients);
      }

      // Load contracts
      const contractsResponse = await apiClient.get('/api/contracts?limit=5');
      if (contractsResponse && contractsResponse.contracts) {
        setContracts(contractsResponse.contracts);
      }

      // Load recent activities
      const activitiesResponse = await apiClient.get('/api/activities?limit=5');
      if (activitiesResponse && activitiesResponse.activities) {
        setRecentActivities(activitiesResponse.activities);
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
    router.push('/matter-management');
  };

  const handleFileDispute = () => {
    router.push('/dispute-management');
  };

  const handleAddEntity = () => {
    router.push('/client-management');
  };

  const handleGenerateReport = () => {
    router.push('/reports');
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="success">Low</Badge>;
      default:
        return <Badge variant="default">{priority}</Badge>;
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-neutral-600">Overview of your legal practice metrics and activities</p>
          </div>
          <Button onClick={handleAddEntity} className="gap-2">
            <Plus className="h-4 w-4" />
            New Client
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={loadDashboardData}>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="ml-2">Loading dashboard...</span>
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric) => {
              const IconComponent = metric.icon;
              return (
                <Card key={metric.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-600">{metric.title}</p>
                        <p className="text-2xl font-bold text-neutral-900">{metric.value}</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className={`h-4 w-4 ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                          <span className={`text-sm ml-1 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
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
          <div className="space-y-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest updates and actions in your practice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="h-2 w-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
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
