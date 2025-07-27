'use client';

import { useAuth } from '../auth-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Camera,
  Shield
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export default function ProfilePage() {
  const { user } = useAuth();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'DU';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Profile</h1>
          <p className="text-neutral-600 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto relative">
                  <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={`${user?.firstName} ${user?.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(user?.firstName, user?.lastName)}</span>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border-2 border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors">
                    <Camera className="h-4 w-4 text-neutral-600" />
                  </button>
                </div>
                <CardTitle className="mt-4">
                  {user ? `${user.firstName} ${user.lastName}` : 'Demo User'}
                </CardTitle>
                <CardDescription>{user?.email || 'demo@counselflow.com'}</CardDescription>
                <div className="flex justify-center mt-2">
                  <Badge variant="secondary" className="capitalize">
                    {user?.role || 'Admin'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your basic account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">First Name</label>
                    <div className="mt-1 p-3 bg-neutral-50 rounded-lg border">
                      {user?.firstName || 'Demo'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Last Name</label>
                    <div className="mt-1 p-3 bg-neutral-50 rounded-lg border">
                      {user?.lastName || 'User'}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Email Address</label>
                  <div className="mt-1 p-3 bg-neutral-50 rounded-lg border flex items-center">
                    <Mail className="h-4 w-4 text-neutral-400 mr-2" />
                    {user?.email || 'demo@counselflow.com'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Phone Number</label>
                  <div className="mt-1 p-3 bg-neutral-50 rounded-lg border flex items-center">
                    <Phone className="h-4 w-4 text-neutral-400 mr-2" />
                    {user?.phoneNumber || 'Not provided'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Account Status
                </CardTitle>
                <CardDescription>Your account security and status information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Account Status</div>
                    <div className="text-sm text-neutral-600">Current status of your account</div>
                  </div>
                  <Badge variant={user?.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                    {user?.status || 'Active'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Role</div>
                    <div className="text-sm text-neutral-600">Your access level in the system</div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {user?.role || 'Admin'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Member Since</div>
                    <div className="text-sm text-neutral-600">Date you joined CounselFlow</div>
                  </div>
                  <div className="flex items-center text-neutral-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    January 2024
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used account management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Update Email
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Edit Personal Info
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Photo
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
