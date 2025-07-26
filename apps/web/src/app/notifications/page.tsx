'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Mail,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Settings
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export default function NotificationsPage() {
  const [notifications] = useState([
    {
      id: '1',
      type: 'info',
      title: 'New contract requires review',
      message: 'Contract "ABC Corp Service Agreement" has been uploaded and needs your review.',
      time: '2 minutes ago',
      read: false,
      category: 'contracts'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Deadline approaching',
      message: 'Matter "Smith vs. Johnson" has a filing deadline in 3 days.',
      time: '1 hour ago',
      read: false,
      category: 'deadlines'
    },
    {
      id: '3',
      type: 'success',
      title: 'Payment received',
      message: 'Invoice #INV-2024-001 has been paid by Johnson & Associates.',
      time: '3 hours ago',
      read: true,
      category: 'billing'
    },
    {
      id: '4',
      type: 'info',
      title: 'New client message',
      message: 'Sarah Johnson sent you a message regarding her case.',
      time: '1 day ago',
      read: true,
      category: 'messages'
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBadgeVariant = (category: string) => {
    switch (category) {
      case 'contracts':
        return 'default';
      case 'deadlines':
        return 'destructive';
      case 'billing':
        return 'secondary';
      case 'messages':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Notifications</h1>
            <p className="text-neutral-600 mt-2">Stay updated with your latest activities</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </Button>
            <Button>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-neutral-900">12</div>
                  <div className="text-sm text-neutral-600">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-neutral-900">3</div>
                  <div className="text-sm text-neutral-600">Unread</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-neutral-900">2</div>
                  <div className="text-sm text-neutral-600">Urgent</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-neutral-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-neutral-900">7</div>
                  <div className="text-sm text-neutral-600">Today</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Your latest notifications and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg border transition-colors hover:bg-neutral-50 ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${!notification.read ? 'text-neutral-900' : 'text-neutral-700'}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getBadgeVariant(notification.category)} className="text-xs">
                          {notification.category}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-neutral-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {notification.time}
                      </span>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <Button size="sm" variant="ghost" className="text-xs">
                            Mark as read
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-xs">
                          View details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
