'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export default function BillingPage() {
  const invoices = [
    {
      id: 'INV-2024-003',
      date: '2024-01-15',
      amount: '$299.00',
      status: 'paid',
      description: 'CounselFlow Pro - Monthly Subscription'
    },
    {
      id: 'INV-2024-002',
      date: '2023-12-15',
      amount: '$299.00',
      status: 'paid',
      description: 'CounselFlow Pro - Monthly Subscription'
    },
    {
      id: 'INV-2024-001',
      date: '2023-11-15',
      amount: '$299.00',
      status: 'paid',
      description: 'CounselFlow Pro - Monthly Subscription'
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Billing & Subscription</h1>
          <p className="text-neutral-600 mt-2">Manage your subscription and billing information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Current Plan
                </CardTitle>
                <CardDescription>Your active subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">Pro</div>
                  <div className="text-xl font-semibold text-neutral-900 mt-2">$299/month</div>
                  <Badge variant="default" className="mt-2">Active</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Unlimited matters
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    AI-powered contract analysis
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Advanced reporting
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Priority support
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-neutral-600">Next billing date</div>
                  <div className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    February 15, 2024
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Change Plan
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Billing Information & Invoices */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </CardTitle>
                <CardDescription>Your default payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      VISA
                    </div>
                    <div>
                      <div className="font-medium">•••• •••• •••• 4242</div>
                      <div className="text-sm text-neutral-600">Expires 12/2026</div>
                    </div>
                  </div>
                  <Badge variant="secondary">Default</Badge>
                </div>
                <div className="flex space-x-3 mt-4">
                  <Button variant="outline" size="sm">
                    Update Payment Method
                  </Button>
                  <Button variant="outline" size="sm">
                    Add New Card
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Billing Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Summary</CardTitle>
                <CardDescription>Overview of your billing and usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-900">$897</div>
                    <div className="text-sm text-green-700">Total Paid</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-900">3</div>
                    <div className="text-sm text-blue-700">Months Active</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <Clock className="h-8 w-8 text-neutral-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-neutral-900">15</div>
                    <div className="text-sm text-neutral-700">Days to Next Bill</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice History */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>Your past invoices and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{invoice.id}</div>
                        <div className="text-sm text-neutral-600">{invoice.description}</div>
                        <div className="text-sm text-neutral-500">{invoice.date}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="font-medium">{invoice.amount}</div>
                          <Badge 
                            variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Invoices
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
