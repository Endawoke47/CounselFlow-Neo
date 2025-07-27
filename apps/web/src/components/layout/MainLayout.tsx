'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ProfileDropdown from './ProfileDropdown';
import { 
  Home,
  Briefcase,
  FileText,
  Scale,
  Building2,
  BookOpen,
  Shield,
  ScrollText,
  Target,
  CheckCircle,
  Calculator,
  HelpCircle,
  Settings,
  Menu,
  Search,
  Bell,
  User,
  Users,
  Brain,
  Workflow,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save sidebar state to localStorage when it changes
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: pathname === '/dashboard' },
    { name: 'AI Workflows', href: '/workflows', icon: Workflow, current: pathname === '/workflows' },
    { name: 'Matters', href: '/matter-management', icon: Briefcase, current: pathname === '/matter-management' },
    { name: 'Contracts', href: '/contract-management', icon: FileText, current: pathname === '/contract-management' },
    { name: 'Disputes', href: '/dispute-management', icon: Scale, current: pathname === '/dispute-management' },
    { name: 'Entities', href: '/entity-management', icon: Building2, current: pathname === '/entity-management' },
    { name: 'Knowledge Management', href: '/knowledge-management', icon: BookOpen, current: pathname === '/knowledge-management' },
    { name: 'Risk Management', href: '/risk-management', icon: Shield, current: pathname === '/risk-management' },
    { name: 'Policy Management', href: '/policy-management', icon: ScrollText, current: pathname === '/policy-management' },
    { name: 'Task Management', href: '/task-management', icon: Target, current: pathname === '/task-management' },
    { name: 'Licensing & Regulatory', href: '/licensing-regulatory', icon: CheckCircle, current: pathname === '/licensing-regulatory' },
    { name: 'Legal Spend', href: '/outsourcing-legal-spend', icon: Calculator, current: pathname === '/outsourcing-legal-spend' },
  ];

  // Define topbar-only pages for current page indicator
  const topbarPages = {
    '/client-management': 'Clients',
    '/ai-assistant': 'AI Legal Assistant',
    '/help-support': 'Help & Support',
    '/settings': 'Settings',
  };

  // Get current page name from sidebar navigation or topbar pages
  const getCurrentPageName = () => {
    const sidebarPage = navigation.find(item => item.current);
    if (sidebarPage) return sidebarPage.name;
    return topbarPages[pathname as keyof typeof topbarPages] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-neutral-800 bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-corporate-lg">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto pt-6 pb-4">
              <div className="flex flex-shrink-0 items-center px-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">CF</span>
                  </div>
                  <h1 className="text-xl font-bold text-primary-700">CounselFlow</h1>
                </div>
              </div>
              <nav className="mt-8 flex-1 space-y-2 px-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-neutral-600 hover:bg-primary-50 hover:text-primary-600'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${item.current ? 'text-primary-600' : 'text-neutral-500'}`} />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden md:fixed md:inset-y-0 md:flex md:flex-col transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'md:w-16' : 'md:w-64'
      }`}>
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-neutral-200 shadow-corporate">
          <div className="flex flex-1 flex-col overflow-y-auto pt-6 pb-4">
            {/* Logo and toggle button */}
            <div className="flex flex-shrink-0 items-center justify-between px-6">
              {sidebarCollapsed ? (
                <div className="flex items-center justify-center w-full">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">CF</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center transition-opacity duration-300">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">CF</span>
                  </div>
                  <h1 className="text-xl font-bold text-primary-700">CounselFlow</h1>
                </div>
              )}
              
              {/* Collapse toggle button */}
              <button
                onClick={toggleSidebar}
                className={`flex items-center justify-center w-8 h-8 rounded-lg text-neutral-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 ${
                  sidebarCollapsed ? 'absolute top-6 right-2' : 'ml-auto'
                }`}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            </div>
            
            <nav className="mt-8 flex-1 space-y-2 px-3">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      item.current
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-neutral-600 hover:bg-primary-50 hover:text-primary-600'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  >
                    <item.icon className={`h-5 w-5 ${
                      item.current ? 'text-primary-600' : 'text-neutral-500'
                    } ${sidebarCollapsed ? '' : 'mr-3'}`} />
                    <span className={`transition-all duration-300 ${
                      sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                    }`}>
                      {item.name}
                    </span>
                  </Link>
                  
                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-neutral-900"></div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
      }`}>
        {/* Smart Topbar - Desktop */}
        <div className="hidden md:block sticky top-0 z-20 bg-white border-b border-neutral-200 shadow-corporate">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Left side - Current page indicator */}
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
              <span className="text-sm font-medium text-neutral-600">
                {getCurrentPageName()}
              </span>
            </div>
            
            {/* Right side - Quick actions */}
            <div className="flex items-center space-x-1">
              <Link
                href="/client-management"
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors group ${
                  pathname === '/client-management'
                    ? 'text-primary-600 bg-primary-100'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
                title="Clients"
              >
                <Users className="h-5 w-5" />
                <span className="sr-only">Clients</span>
              </Link>
              
              <Link
                href="/ai-assistant"
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors group ${
                  pathname === '/ai-assistant'
                    ? 'text-primary-600 bg-primary-100'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
                title="AI Legal Assistant"
              >
                <Brain className="h-5 w-5" />
                <span className="sr-only">AI Legal Assistant</span>
              </Link>
              
              <Link
                href="/help-support"
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors group ${
                  pathname === '/help-support'
                    ? 'text-primary-600 bg-primary-100'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
                title="Help & Support"
              >
                <HelpCircle className="h-5 w-5" />
                <span className="sr-only">Help & Support</span>
              </Link>
              
              <Link
                href="/settings"
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors group ${
                  pathname === '/settings'
                    ? 'text-primary-600 bg-primary-100'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
                title="Settings"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
              
              {/* Profile Dropdown */}
              <ProfileDropdown className="ml-2" />
            </div>
          </div>
        </div>

        {/* Top nav for mobile - Enhanced with quick actions */}
        <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 md:hidden shadow-corporate">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-neutral-500 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Mobile quick actions */}
            <div className="flex items-center space-x-1">
              <Link
                href="/ai-assistant"
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                  pathname === '/ai-assistant'
                    ? 'text-primary-600 bg-primary-100'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
                title="AI Assistant"
              >
                <Brain className="h-5 w-5" />
              </Link>
              
              <Link
                href="/help-support"
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                  pathname === '/help-support'
                    ? 'text-primary-600 bg-primary-100'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
                title="Help"
              >
                <HelpCircle className="h-5 w-5" />
              </Link>
              
              {/* Mobile Profile Dropdown */}
              <ProfileDropdown />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-neutral-50">
          {children}
        </main>
      </div>
    </div>
  );
}
