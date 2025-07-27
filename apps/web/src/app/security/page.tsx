'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  Monitor,
  MapPin
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export default function SecurityPage() {
  const [showPassword, setShowPassword] = useState(false);

  const recentActivity = [
    {
      id: '1',
      action: 'Successful login',
      device: 'Chrome on Windows',
      location: 'New York, NY',
      time: '2 minutes ago',
      status: 'success'
    },
    {
      id: '2',
      action: 'Password change',
      device: 'Chrome on Windows',
      location: 'New York, NY',
      time: '3 days ago',
      status: 'success'
    },
    {
      id: '3',
      action: 'Failed login attempt',
      device: 'Unknown device',
      location: 'Unknown location',
      time: '1 week ago',
      status: 'warning'
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Security</h1>
          <p className="text-neutral-600 mt-2">Manage your account security and privacy settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Password & Authentication */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Password & Authentication
                </CardTitle>
                <CardDescription>Manage your password and login methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Current Password</label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-neutral-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-neutral-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">New Password</label>
                  <input
                    type="password"
                    className="mt-1 w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Confirm New Password</label>
                  <input
                    type="password"
                    className="mt-1 w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Confirm new password"
                  />
                </div>
                <Button className="w-full">
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SMS Authentication</div>
                    <div className="text-sm text-neutral-600">Receive codes via text message</div>
                  </div>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Authenticator App</div>
                    <div className="text-sm text-neutral-600">Use an app like Google Authenticator</div>
                  </div>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  Set Up Two-Factor Authentication
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Security Status & Activity */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Status
                </CardTitle>
                <CardDescription>Overview of your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <div className="font-medium">Strong Password</div>
                      <div className="text-sm text-neutral-600">Your password meets security requirements</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-neutral-600">Not enabled - consider enabling for better security</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <div className="font-medium">Email Verified</div>
                      <div className="text-sm text-neutral-600">Your email address has been verified</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                    <div className="text-sm text-yellow-800">
                      Security Score: <span className="font-medium">7/10</span>
                    </div>
                  </div>
                  <div className="text-xs text-yellow-700 mt-1">
                    Enable two-factor authentication to improve your security score
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your recent login and security activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 border border-neutral-200 rounded-lg">
                      <div className="flex-shrink-0 mt-0.5">
                        {activity.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-neutral-900">
                          {activity.action}
                        </div>
                        <div className="text-xs text-neutral-600 mt-1 flex items-center">
                          <Monitor className="h-3 w-3 mr-1" />
                          {activity.device}
                        </div>
                        <div className="text-xs text-neutral-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {activity.location}
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Full Activity Log
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
