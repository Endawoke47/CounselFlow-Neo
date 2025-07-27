'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-wrapper';
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
  BarChart3,
  Shield,
  Target,
  Users,
  BookOpen,
  CheckCircle2,
  TrendingDown,
  Activity
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { productionApiClient } from '@/lib/production-api-client';
import { 
  mockClients, 
  mockMatters, 
  mockTasks, 
  mockContracts,
  mockDisputes,
  calculateDashboardMetrics,
  type Client,
  type Matter,
  type Task,
  type Contract
} from '@/lib/mock-data';

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
  
  // Calculate dynamic metrics from mock data
  const dashboardMetrics = calculateDashboardMetrics();
  
  const [metrics, setMetrics] = useState([
    {
      title: 'Active Matters',
      value: dashboardMetrics.activeMatters.toString(),
      change: '+12.5%',
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Total Clients',
      value: dashboardMetrics.totalClients.toString(),
      change: '+8.3%',
      trend: 'up',
      icon: Building2,
      color: 'text-purple-600'
    },
    {
      title: 'Revenue (YTD)',
      value: `KES ${(dashboardMetrics.totalRevenue / 1000000).toFixed(1)}M`,
      change: '+15.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Pending Tasks',
      value: dashboardMetrics.pendingTasks.toString(),
      change: '-5.8%',
      trend: 'down',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'High Risk Matters',
      value: dashboardMetrics.highRiskClients.toString(),
      change: '-2.1%',
      trend: 'down',
      icon: Shield,
      color: 'text-red-600'
    },
    {
      title: 'Case Success Rate',
      value: `${dashboardMetrics.caseSuccessRate}%`,
      change: '+3.2%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'text-emerald-600'
    },
    {
      title: 'Billing Realization',
      value: `${dashboardMetrics.billingRealization}%`,
      change: '+1.8%',
      trend: 'up',
      icon: BarChart3,
      color: 'text-indigo-600'
    },
    {
      title: 'Active Disputes',
      value: mockDisputes.length.toString(),
      change: '+0%',
      trend: 'up',
      icon: Scale,
      color: 'text-amber-600'
    }
  ]);

  const [clients, setClients] = useState<Client[]>(mockClients);
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([
    {
      id: '1',
      title: 'New matter opened for Safaricom PLC',
      description: '5G Regulatory Compliance matter created with high priority',
      priority: 'high',
      time: '2 hours ago',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Contract review completed',
      description: 'Digital Banking Platform License reviewed and approved for KCB',
      priority: 'medium',
      time: '4 hours ago',
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Court hearing scheduled',
      description: 'Product liability defense hearing set for EABL case',
      priority: 'high',
      time: '6 hours ago',
      timestamp: new Date().toISOString()
    },
    {
      id: '4',
      title: 'Client meeting completed',
      description: 'Strategic planning session with Equity Group Holdings',
      priority: 'medium',
      time: '1 day ago',
      timestamp: new Date().toISOString()
    },
    {
      id: '5',
      title: 'Compliance audit initiated',
      description: 'Annual compliance review started for Ministry of Health',
      priority: 'urgent',
      time: '1 day ago',
      timestamp: new Date().toISOString()
    },
    {
      id: '6',
      title: 'Settlement negotiation concluded',
      description: 'Successful mediation for Kenya Airways employment dispute',
      priority: 'medium',
      time: '2 days ago',
      timestamp: new Date().toISOString()
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    // Simulate loading with mock data
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be API calls
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      // Data is already loaded from mock data
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
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
              const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
              return (
                <Card key={metric.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-600">{metric.title}</p>
                        <p className="text-2xl font-bold text-neutral-900">{metric.value}</p>
                        <div className="flex items-center mt-1">
                          <TrendIcon className={`h-4 w-4 ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          {/* High-Value Clients */}
          <Card>
            <CardHeader>
              <CardTitle>High-Value Clients</CardTitle>
              <CardDescription>Clients with highest revenue contribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients
                  .sort((a, b) => b.totalValue - a.totalValue)
                  .slice(0, 5)
                  .map((client) => (
                    <div key={client.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{client.name}</p>
                          <p className="text-xs text-neutral-500">{client.industry}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-neutral-900">
                          KES {(client.totalValue / 1000000).toFixed(1)}M
                        </p>
                        <Badge 
                          variant={client.riskLevel === 'low' ? 'success' : client.riskLevel === 'medium' ? 'warning' : 'destructive'}
                          className="text-xs"
                        >
                          {client.riskLevel} risk
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Matters */}
          <Card>
            <CardHeader>
              <CardTitle>Active Matters</CardTitle>
              <CardDescription>Current matters requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMatters
                  .filter(matter => matter.status === 'active')
                  .slice(0, 5)
                  .map((matter) => (
                    <div key={matter.id} className="border rounded-lg p-3 hover:bg-neutral-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900">{matter.title}</p>
                          <p className="text-xs text-neutral-500 mt-1">{matter.matterType}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge 
                              variant={matter.priority === 'urgent' ? 'destructive' : matter.priority === 'high' ? 'warning' : 'default'}
                              className="text-xs"
                            >
                              {matter.priority}
                            </Badge>
                            <span className="text-xs text-neutral-500">
                              {matter.progress}% complete
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-neutral-500">
                            KES {(matter.estimatedValue / 1000000).toFixed(1)}M
                          </p>
                          {matter.nextDeadline && (
                            <p className="text-xs text-orange-600 mt-1">
                              Due: {new Date(matter.nextDeadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-primary-600 h-1.5 rounded-full transition-all" 
                          style={{ width: `${matter.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
