'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../app/auth-wrapper';
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  UserCircle,
  Shield,
  Bell,
  CreditCard
} from 'lucide-react';

interface ProfileDropdownProps {
  className?: string;
}

export default function ProfileDropdown({ className = '' }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setIsOpen(false);
      // Redirect to home page after logout
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      icon: UserCircle,
      label: 'View Profile',
      action: () => {
        router.push('/profile');
        setIsOpen(false);
      },
      description: 'Manage your account settings'
    },
    {
      icon: Settings,
      label: 'Settings',
      action: () => {
        router.push('/settings');
        setIsOpen(false);
      },
      description: 'Preferences and configurations'
    },
    {
      icon: Bell,
      label: 'Notifications',
      action: () => {
        router.push('/notifications');
        setIsOpen(false);
      },
      description: 'Manage your notifications'
    },
    {
      icon: CreditCard,
      label: 'Billing',
      action: () => {
        router.push('/billing');
        setIsOpen(false);
      },
      description: 'Subscription and payments'
    },
    {
      icon: Shield,
      label: 'Security',
      action: () => {
        router.push('/security');
        setIsOpen(false);
      },
      description: 'Password and security settings'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => {
        router.push('/help-support');
        setIsOpen(false);
      },
      description: 'Get help and support'
    }
  ];

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'DU';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Button */}
      <button
        type="button"
        className="flex items-center space-x-2 p-1 rounded-lg hover:bg-primary-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span>{getInitials(user?.firstName, user?.lastName)}</span>
          )}
        </div>
        
        {/* User info - Hidden on mobile */}
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-neutral-900">
            {user ? `${user.firstName} ${user.lastName}` : 'Demo User'}
          </div>
          <div className="text-xs text-neutral-500 capitalize">
            {user?.role || 'Admin'}
          </div>
        </div>
        
        {/* Dropdown arrow */}
        <ChevronDown 
          className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-neutral-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg">{getInitials(user?.firstName, user?.lastName)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-neutral-900 truncate">
                  {user ? `${user.firstName} ${user.lastName}` : 'Demo User'}
                </div>
                <div className="text-sm text-neutral-500 truncate">
                  {user?.email || 'demo@counselflow.com'}
                </div>
                <div className="text-xs text-primary-600 font-medium capitalize mt-1">
                  {user?.role || 'Admin'} • {user?.status || 'Active'}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center px-4 py-3 text-left hover:bg-neutral-50 transition-colors duration-150 group"
              >
                <item.icon className="h-5 w-5 text-neutral-400 mr-3 group-hover:text-primary-600 transition-colors" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-neutral-900 group-hover:text-primary-900">
                    {item.label}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {item.description}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-100 my-2"></div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full flex items-center px-4 py-3 text-left hover:bg-red-50 transition-colors duration-150 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <div className="h-5 w-5 mr-3 animate-spin">
                <div className="h-full w-full border-2 border-red-300 border-t-red-600 rounded-full"></div>
              </div>
            ) : (
              <LogOut className="h-5 w-5 text-neutral-400 mr-3 group-hover:text-red-600 transition-colors" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-neutral-900 group-hover:text-red-900">
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </div>
              <div className="text-xs text-neutral-500">
                End your current session
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
