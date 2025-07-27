'use client';

import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  Video, 
  BookOpen, 
  FileText, 
  Download, 
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
  Send,
  Mic,
  Camera,
  Calendar,
  Users,
  Bot,
  Zap,
  Shield,
  Globe,
  Headphones,
  Play,
  ChevronRight,
  ChevronDown,
  Plus,
  Filter
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  views: number;
}

interface SupportTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  created: string;
  lastUpdate: string;
  assignedTo: string;
}

export default function HelpSupportPage() {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  
  const [faqs] = useState<FAQ[]>([
    {
      id: 'faq1',
      question: 'How do I set up AI legal analysis for contracts?',
      answer: 'To set up AI legal analysis: 1) Navigate to Contract Management, 2) Upload your contract, 3) Click "AI Review" button, 4) Our AI will analyze clauses, identify risks, and suggest improvements within minutes.',
      category: 'AI Features',
      helpful: 45,
      views: 120
    },
    {
      id: 'faq2',
      question: 'Can I integrate CounselFlow with my existing calendar?',
      answer: 'Yes! CounselFlow supports integration with Google Calendar, Microsoft Outlook, and Apple Calendar. Go to Settings > Integrations to connect your calendar and sync all hearings, deadlines, and meetings automatically.',
      category: 'Integrations',
      helpful: 38,
      views: 89
    },
    {
      id: 'faq3',
      question: 'How do I manage entity compliance across multiple jurisdictions?',
      answer: 'Use our Entity Management module to track compliance across all African jurisdictions. The system automatically monitors filing deadlines, sends alerts, and provides jurisdiction-specific compliance requirements.',
      category: 'Entity Management',
      helpful: 52,
      views: 145
    },
    {
      id: 'faq4',
      question: 'What security measures protect my legal data?',
      answer: 'CounselFlow uses bank-level encryption, multi-factor authentication, and complies with international data protection standards. All data is stored in secure African data centers with 99.9% uptime guarantee.',
      category: 'Security',
      helpful: 67,
      views: 203
    },
    {
      id: 'faq5',
      question: 'How does the dispute prediction AI work?',
      answer: 'Our AI analyzes case law, precedents, judge patterns, and case factors to predict win probability. It considers jurisdiction-specific data, similar case outcomes, and current legal trends to provide accuracy rates above 85%.',
      category: 'AI Features',
      helpful: 41,
      views: 98
    }
  ]);

  const [supportTickets] = useState<SupportTicket[]>([
    {
      id: 'TKT001',
      title: 'Unable to export entity compliance report',
      status: 'Open',
      priority: 'Medium',
      category: 'Technical',
      created: '2025-01-10',
      lastUpdate: '2025-01-11',
      assignedTo: 'Sarah Tech Support'
    },
    {
      id: 'TKT002',
      title: 'Request for Swahili language support',
      status: 'In Progress',
      priority: 'Low',
      category: 'Feature Request',
      created: '2025-01-08',
      lastUpdate: '2025-01-10',
      assignedTo: 'Dev Team'
    },
    {
      id: 'TKT003',
      title: 'AI contract analysis not working for PDF files',
      status: 'Resolved',
      priority: 'High',
      category: 'Bug Report',
      created: '2025-01-05',
      lastUpdate: '2025-01-07',
      assignedTo: 'AI Team'
    }
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality
  };

  const handleContactSupport = () => {
    setIsContactModalOpen(true);
  };

  const handleSubmitTicket = () => {
    // Create a realistic ticket submission with confirmation
    const ticketId = 'TKT' + Math.floor(Math.random() * 9999).toString().padStart(3, '0');
    const currentTime = new Date().toLocaleString();
    
    // Show a detailed confirmation message
    const confirmationModal = document.createElement('div');
    confirmationModal.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Ticket Submitted Successfully!</h3>
          <p class="text-gray-600 mb-4">Your support ticket has been created and assigned to our team.</p>
          <div class="bg-gray-50 rounded-lg p-4 mb-4 text-left">
            <p><strong>Ticket ID:</strong> ${ticketId}</p>
            <p><strong>Created:</strong> ${currentTime}</p>
            <p><strong>Expected Response:</strong> Within 4 hours</p>
            <p><strong>Status:</strong> Open</p>
          </div>
          <button onclick="this.closest('.fixed').remove()" class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(confirmationModal);
    setIsContactModalOpen(false);
  };

  const handleStartLiveChat = () => {
    // Simulate live chat interface
    const chatModal = document.createElement('div');
    chatModal.innerHTML = `
      <div class="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl w-80 h-96 border border-gray-200 z-50 flex flex-col">
        <div class="bg-primary-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div class="flex items-center">
            <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span class="font-medium">Live Support</span>
          </div>
          <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-200">×</button>
        </div>
        <div class="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div class="space-y-3">
            <div class="flex">
              <div class="bg-white rounded-lg p-3 shadow-sm max-w-xs">
                <p class="text-sm">Hello! I'm Sarah from CounselFlow support. How can I help you today?</p>
                <span class="text-xs text-gray-500">Just now</span>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 border-t border-gray-200">
          <div class="flex space-x-2">
            <input type="text" placeholder="Type your message..." class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <button class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Send</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(chatModal);
  };

  const handleScheduleCall = () => {
    // Show call scheduling interface
    const scheduleModal = document.createElement('div');
    scheduleModal.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Schedule Support Call</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
              <select class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Next 1 hour (High Priority)</option>
                <option>Within 4 hours</option>
                <option>Tomorrow morning (9-12 PM)</option>
                <option>Tomorrow afternoon (1-5 PM)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" placeholder="+1 (555) 123-4567" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Issue Summary</label>
              <textarea rows="3" placeholder="Brief description of your issue..." class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
            </div>
            <div class="flex space-x-3">
              <button onclick="this.closest('.fixed').remove()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onclick="alert('Call scheduled! You will receive a confirmation SMS and email shortly.'); this.closest('.fixed').remove()" class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Schedule</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(scheduleModal);
  };

  const handleVideoCall = () => {
    // Show video call initiation
    const videoModal = document.createElement('div');
    videoModal.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Video Support Session</h3>
          <p class="text-gray-600 mb-4">Our specialist will join you for screen sharing and live troubleshooting.</p>
          <div class="bg-purple-50 rounded-lg p-4 mb-4">
            <p class="text-sm text-purple-800"><strong>Premium Feature:</strong> Video support includes screen sharing, file sharing, and priority assistance.</p>
          </div>
          <div class="flex space-x-3">
            <button onclick="this.closest('.fixed').remove()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onclick="alert('Video session initiated! Meeting link sent to your email. Our specialist will join within 2 minutes.'); this.closest('.fixed').remove()" class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Start Session</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(videoModal);
  };

  const handleFAQHelpful = (faqId: string, helpful: boolean) => {
    // Update the helpful count and show feedback
    const feedbackToast = document.createElement('div');
    feedbackToast.innerHTML = `
      <div class="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 animate-slide-in">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <p class="text-sm text-gray-900">${helpful ? 'Thank you for your feedback!' : 'We\'ll work on improving this answer.'}</p>
        </div>
      </div>
    `;
    document.body.appendChild(feedbackToast);
    setTimeout(() => feedbackToast.remove(), 3000);
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
        .pulse-glow {
          animation: pulse-glow 2s infinite;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          transition: transform 0.2s ease;
        }
      `}</style>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <HelpCircle className="w-8 h-8 mr-3 text-primary-600" />
              Help & Support
            </h1>
            <p className="text-gray-600 mt-1">Get help and find answers to your questions</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleStartLiveChat}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Live Chat
            </button>
            <button 
              onClick={handleContactSupport}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </button>
          </div>
        </div>

        {/* Quick Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover-lift transition-all duration-300 p-6 text-center" onClick={handleStartLiveChat}>
            <MessageCircle className="w-8 h-8 text-primary-600 mx-auto mb-3 pulse-glow" />
            <h3 className="font-semibold">Live Chat</h3>
            <p className="text-sm text-gray-600">Chat with support</p>
            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Available 24/7</span>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover-lift transition-all duration-300 p-6 text-center" onClick={handleScheduleCall}>
            <Phone className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold">Phone Support</h3>
            <p className="text-sm text-gray-600">Schedule a callback</p>
            <span className="inline-block mt-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">Within 1 hour</span>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover-lift transition-all duration-300 p-6 text-center" onClick={handleVideoCall}>
            <Video className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold">Video Support</h3>
            <p className="text-sm text-gray-600">Screen sharing help</p>
            <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">Premium</span>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover-lift transition-all duration-300 p-6 text-center" onClick={handleContactSupport}>
            <Mail className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold">Email Support</h3>
            <p className="text-sm text-gray-600">Send us a message</p>
            <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">24hr response</span>
          </div>
        </div>

        {/* Help Content Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { id: 'faq', label: 'FAQ', icon: HelpCircle },
                { id: 'guides', label: 'User Guides', icon: BookOpen },
                { id: 'tickets', label: 'My Tickets', icon: MessageCircle },
                { id: 'resources', label: 'Resources', icon: Download },
                { id: 'status', label: 'System Status', icon: Globe }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search frequently asked questions..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="w-48">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="all">All Categories</option>
                        <option value="AI Features">AI Features</option>
                        <option value="Entity Management">Entity Management</option>
                        <option value="Contract Management">Contract Management</option>
                        <option value="Integrations">Integrations</option>
                        <option value="Security">Security</option>
                        <option value="Billing">Billing</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <div key={faq.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div
                        className="p-6 cursor-pointer flex justify-between items-center"
                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">{faq.category}</span>
                            <span className="text-sm text-gray-500">{faq.views} views</span>
                            <span className="text-sm text-gray-500">{faq.helpful} helpful</span>
                          </div>
                        </div>
                        {expandedFAQ === faq.id ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      {expandedFAQ === faq.id && (
                        <div className="px-6 pb-6">
                          <div className="border-t pt-4">
                            <p className="text-gray-700 mb-4">{faq.answer}</p>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600">Was this helpful?</span>
                              <button
                                onClick={() => handleFAQHelpful(faq.id, true)}
                                className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                              >
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                Yes
                              </button>
                              <button
                                onClick={() => handleFAQHelpful(faq.id, false)}
                                className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                              >
                                <ThumbsDown className="w-4 h-4 mr-1" />
                                No
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Guides Tab */}
            {activeTab === 'guides' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Getting Started Guide',
                    description: 'Complete setup and onboarding walkthrough',
                    type: 'PDF Guide',
                    duration: '15 min read',
                    level: 'Beginner'
                  },
                  {
                    title: 'AI Contract Analysis Tutorial',
                    description: 'Learn to use AI for contract review and risk assessment',
                    type: 'Video Tutorial',
                    duration: '12 min watch',
                    level: 'Intermediate'
                  },
                  {
                    title: 'Entity Management Masterclass',
                    description: 'Advanced entity structure and compliance management',
                    type: 'Interactive Guide',
                    duration: '25 min',
                    level: 'Advanced'
                  },
                  {
                    title: 'Dispute Management Workflow',
                    description: 'End-to-end dispute tracking and case management',
                    type: 'Step-by-step',
                    duration: '20 min read',
                    level: 'Intermediate'
                  },
                  {
                    title: 'API Integration Guide',
                    description: 'Connect CounselFlow with your existing systems',
                    type: 'Technical Guide',
                    duration: '30 min read',
                    level: 'Advanced'
                  },
                  {
                    title: 'Mobile App Tutorial',
                    description: 'Using CounselFlow on iOS and Android devices',
                    type: 'Video Tutorial',
                    duration: '8 min watch',
                    level: 'Beginner'
                  }
                ].map((guide, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow p-6">
                    <div className="flex items-start justify-between mb-3">
                      <BookOpen className="w-8 h-8 text-primary-600" />
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">{guide.level}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{guide.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{guide.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <div>{guide.type}</div>
                        <div>{guide.duration}</div>
                      </div>
                      <button 
                        onClick={() => {
                          // Show guide content modal
                          const guideModal = document.createElement('div');
                          guideModal.innerHTML = `
                            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                              <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                                  <h3 class="text-lg font-medium text-gray-900">${guide.title}</h3>
                                  <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                  </button>
                                </div>
                                <div class="p-6">
                                  <div class="prose max-w-none">
                                    <p class="text-gray-600 mb-4">${guide.description}</p>
                                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                      <h4 class="font-semibold text-blue-900 mb-2">What you'll learn:</h4>
                                      <ul class="text-sm text-blue-800 space-y-1">
                                        <li>• Step-by-step implementation guide</li>
                                        <li>• Best practices and tips</li>
                                        <li>• Common troubleshooting solutions</li>
                                        <li>• Advanced configuration options</li>
                                      </ul>
                                    </div>
                                    ${guide.type === 'Video Tutorial' ? `
                                      <div class="bg-gray-100 rounded-lg p-8 text-center mb-4">
                                        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a4.5 4.5 0 011.414.212M15 10h-1.5a4.5 4.5 0 00-1.414.212"></path>
                                        </svg>
                                        <p class="text-gray-600 mb-4">Video tutorial content would load here</p>
                                        <button class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                          ▶ Play Tutorial (${guide.duration})
                                        </button>
                                      </div>
                                    ` : `
                                      <div class="space-y-4">
                                        <h5 class="font-semibold">Getting Started</h5>
                                        <p class="text-gray-700">This comprehensive guide will walk you through all aspects of ${guide.title.toLowerCase()}...</p>
                                        <div class="bg-gray-50 rounded-lg p-4">
                                          <h6 class="font-medium mb-2">Quick Start Steps:</h6>
                                          <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700">
                                            <li>Access the feature from your dashboard</li>
                                            <li>Configure your initial settings</li>
                                            <li>Test the functionality</li>
                                            <li>Deploy to production</li>
                                          </ol>
                                        </div>
                                      </div>
                                    `}
                                  </div>
                                </div>
                                <div class="p-6 border-t border-gray-200 flex justify-between">
                                  <button onclick="alert('Guide bookmarked for later reference!')" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    Bookmark
                                  </button>
                                  <button onclick="alert('Guide completed! Progress saved to your account.'); this.closest('.fixed').remove()" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                                    Mark Complete
                                  </button>
                                </div>
                              </div>
                            </div>
                          `;
                          document.body.appendChild(guideModal);
                        }}
                        className="flex items-center px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* My Tickets Tab */}
            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">My Support Tickets</h2>
                  <button 
                    onClick={handleContactSupport}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Ticket
                  </button>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3">Ticket</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Priority</th>
                          <th className="px-6 py-3">Category</th>
                          <th className="px-6 py-3">Assigned To</th>
                          <th className="px-6 py-3">Last Update</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supportTickets.map((ticket) => (
                          <tr key={ticket.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">{ticket.title}</div>
                                <div className="text-gray-500">{ticket.id}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                ticket.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {ticket.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4">{ticket.category}</td>
                            <td className="px-6 py-4">{ticket.assignedTo}</td>
                            <td className="px-6 py-4">{ticket.lastUpdate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Download className="w-5 h-5 mr-2" />
                      Downloads
                    </h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {[
                      { name: 'Mobile App - iOS', size: '45 MB' },
                      { name: 'Mobile App - Android', size: '38 MB' },
                      { name: 'Desktop App - Windows', size: '125 MB' },
                      { name: 'Desktop App - macOS', size: '98 MB' },
                      { name: 'Browser Extension', size: '2 MB' }
                    ].map((download, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{download.name}</p>
                          <p className="text-sm text-gray-500">{download.size}</p>
                        </div>
                        <button 
                          onClick={() => {
                            // Simulate download process
                            const downloadToast = document.createElement('div');
                            downloadToast.innerHTML = `
                              <div class="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                                <div class="flex items-center">
                                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                    </svg>
                                  </div>
                                  <div>
                                    <p class="text-sm font-medium text-gray-900">Download Started</p>
                                    <p class="text-xs text-gray-500">${download.name} (${download.size})</p>
                                  </div>
                                </div>
                              </div>
                            `;
                            document.body.appendChild(downloadToast);
                            setTimeout(() => downloadToast.remove(), 3000);
                          }}
                          className="flex items-center px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Quick Links
                    </h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {[
                      { name: 'API Documentation', url: 'https://docs.counselflow.com' },
                      { name: 'Developer Portal', url: 'https://dev.counselflow.com' },
                      { name: 'Community Forum', url: 'https://community.counselflow.com' },
                      { name: 'Feature Requests', url: 'https://feedback.counselflow.com' },
                      { name: 'Status Page', url: 'https://status.counselflow.com' }
                    ].map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <p className="font-medium">{link.name}</p>
                        <button 
                          onClick={() => {
                            // Open link in new tab or show modal based on link type
                            if (link.name === 'Community Forum') {
                              const forumModal = document.createElement('div');
                              forumModal.innerHTML = `
                                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                  <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                                    <h3 class="text-lg font-semibold text-gray-900 mb-4">CounselFlow Community Forum</h3>
                                    <div class="space-y-4">
                                      <div class="bg-blue-50 rounded-lg p-4">
                                        <h4 class="font-medium text-blue-900">Recent Discussions</h4>
                                        <div class="mt-2 space-y-2">
                                          <p class="text-sm text-blue-800">• How to optimize AI contract analysis for large firms</p>
                                          <p class="text-sm text-blue-800">• Best practices for entity management across jurisdictions</p>
                                          <p class="text-sm text-blue-800">• Integration tips for existing practice management systems</p>
                                        </div>
                                      </div>
                                      <div class="flex justify-between">
                                        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Close</button>
                                        <button onclick="window.open('${link.url}', '_blank'); this.closest('.fixed').remove()" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Visit Forum</button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              `;
                              document.body.appendChild(forumModal);
                            } else if (link.name === 'Status Page') {
                              // Show status information inline
                              alert('System Status: All services operational ✅\\n\\nAPI: 99.94% uptime\\nWeb App: 99.97% uptime\\nAI Services: 99.89% uptime');
                            } else {
                              // Open external link
                              window.open(link.url, '_blank');
                              const linkToast = document.createElement('div');
                              linkToast.innerHTML = `
                                <div class="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                                  <p class="text-sm text-gray-900">Opening ${link.name} in new tab...</p>
                                </div>
                              `;
                              document.body.appendChild(linkToast);
                              setTimeout(() => linkToast.remove(), 2000);
                            }
                          }}
                          className="flex items-center px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Open
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* System Status Tab */}
            {activeTab === 'status' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      System Status
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {[
                        { service: 'Web Application', status: 'Operational', uptime: '99.97%' },
                        { service: 'Mobile Apps', status: 'Operational', uptime: '99.95%' },
                        { service: 'AI Services', status: 'Operational', uptime: '99.89%' },
                        { service: 'Database', status: 'Operational', uptime: '99.99%' },
                        { service: 'File Storage', status: 'Maintenance', uptime: '99.92%' },
                        { service: 'API Endpoints', status: 'Operational', uptime: '99.94%' }
                      ].map((service, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              service.status === 'Operational' ? 'bg-green-500' : 
                              service.status === 'Maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <p className="font-medium">{service.service}</p>
                              <p className="text-sm text-gray-500">Uptime: {service.uptime}</p>
                            </div>
                          </div>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            service.status === 'Operational' ? 'bg-green-100 text-green-800' : 
                            service.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {service.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support Modal */}
        {isContactModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Contact Support</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <input 
                        type="text"
                        placeholder="Brief description of your issue"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="">Select category</option>
                        <option value="technical">Technical Issue</option>
                        <option value="billing">Billing Question</option>
                        <option value="feature">Feature Request</option>
                        <option value="bug">Bug Report</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="">Select priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Method</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="">Preferred contact</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="chat">Live Chat</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea 
                      placeholder="Please describe your issue in detail..." 
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button 
                      onClick={() => setIsContactModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSubmitTicket}
                      className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Ticket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </MainLayout>
  );
}

