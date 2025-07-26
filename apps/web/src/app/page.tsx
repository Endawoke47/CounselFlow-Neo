'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  Shield, 
  Users, 
  FileText, 
  BarChart3, 
  Zap, 
  CheckCircle, 
  Star, 
  Globe, 
  Brain,
  Sparkles,
  TrendingUp,
  Lock,
  Calendar,
  MessageSquare,
  X,
  Play,
  ChevronDown,
  Scale,
  BookOpen,
  Target,
  MousePointer2,
  Cpu,
  Database,
  Settings
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for magnetic effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Enhanced scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleGetStarted = () => {
    setShowSignupModal(true);
  };

  const handleStartTrial = () => {
    setShowSignupModal(true);
  };

  // Handle Real Login Form Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple demo login - in real app, you'd validate credentials with your backend
    if (loginForm.email && loginForm.password) {
      // Store user data in localStorage (in real app, use proper auth tokens)
      const userData = {
        email: loginForm.email,
        name: loginForm.email.split('@')[0]
      };
      localStorage.setItem('counselflow_user', JSON.stringify(userData));
      
      // Close modal and redirect to dashboard
      setShowLoginModal(false);
      router.push('/dashboard');
    } else {
      alert('Please enter both email and password');
    }
    
    setIsLoading(false);
  };

  // Handle Real Signup Form Submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple demo signup - in real app, you'd create account in your backend
    if (signupForm.name && signupForm.email && signupForm.password) {
      // Store user data in localStorage (in real app, use proper auth tokens)
      const userData = {
        name: signupForm.name,
        email: signupForm.email
      };
      localStorage.setItem('counselflow_user', JSON.stringify(userData));
      
      // Close modal and redirect to dashboard
      setShowSignupModal(false);
      router.push('/dashboard');
    } else {
      alert('Please fill in all fields');
    }
    
    setIsLoading(false);
  };

  const handleWatchDemo = () => {
    alert('🎬 Demo coming soon! This would open a product demo video.');
  };

  const handleScheduleDemo = () => {
    alert('📅 Schedule Demo: This would open a calendar booking system.');
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Legal Intelligence",
      description: "Advanced AI analytics for case prediction, document review, and intelligent legal research.",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Client Relationship Management",
      description: "Comprehensive client profiles with intelligent insights and automated communication workflows.",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: FileText,
      title: "Smart Document Management",
      description: "AI-powered document processing, contract analysis, and automated legal document generation.",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics & Insights",
      description: "Real-time performance metrics, predictive analytics, and comprehensive reporting dashboards.",
      color: "from-violet-500 to-purple-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption, compliance monitoring, and advanced security protocols for legal data.",
      color: "from-slate-500 to-gray-600"
    },
    {
      icon: Zap,
      title: "Workflow Automation",
      description: "Intelligent task automation, deadline management, and streamlined legal process optimization.",
      color: "from-yellow-500 to-orange-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Martinez",
      role: "Senior Partner, Martinez & Associates",
      content: "CounselFlow transformed our practice. The AI insights alone saved us 40% time on case research.",
      rating: 5
    },
    {
      name: "David Chen",
      role: "Managing Director, Chen Legal Group",
      content: "The most intuitive legal management platform we've used. Our team adopted it within days.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Solo Practitioner",
      content: "As a solo attorney, CounselFlow gives me enterprise-level capabilities at an affordable price.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Minimal Navigation */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-700 ease-out ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-2xl' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex justify-between items-center h-16">
            {/* Minimal Logo */}
            <div className="cursor-pointer group" onClick={() => window.location.reload()}>
              <h1 className="text-2xl font-light tracking-wide text-gray-900 group-hover:text-teal-600 transition-all duration-500">
                CounselFlow
              </h1>
            </div>

            {/* Clean Navigation */}
            <div className="hidden md:flex items-center space-x-12">
              {['Solutions', 'Platform', 'About'].map((item, index) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="nav-link text-gray-600 hover:text-gray-900 font-light text-sm tracking-wide transition-all duration-500 relative group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </div>

            {/* Minimal CTA */}
            <div className="flex items-center space-x-6">
              <button 
                onClick={handleLogin}
                className="text-gray-600 hover:text-gray-900 font-light text-sm transition-all duration-300"
              >
                Sign In
              </button>
              <button 
                onClick={handleGetStarted}
                className="bg-gray-900 hover:bg-teal-600 text-white px-6 py-2 text-sm font-light transition-all duration-500 hover:scale-105"
              >
                Start Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Minimalist Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative bg-gradient-to-b from-white to-gray-50/30 parallax-container">
        {/* Advanced Background Animation */}
        <div className="hero-background">
          <div className="gradient-mesh"></div>
          <div className="parallax-layer" data-depth="1">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-100 rounded-full opacity-20 animate-pulse blur-3xl"></div>
          </div>
          <div className="parallax-layer" data-depth="2">
            <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-emerald-100 rounded-full opacity-30 animate-pulse blur-3xl" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          {/* Clean Typography */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-extralight text-gray-900 leading-tight tracking-tight">
                <span className="block opacity-0 animate-fadeInUp title-emphasis" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
                  Legal
                </span>
                <span className="block opacity-0 animate-fadeInUp title-emphasis" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
                  Intelligence
                </span>
                <span className="block text-teal-600 opacity-0 animate-fadeInUp" style={{ animationDelay: '900ms', animationFillMode: 'forwards' }}>
                  Refined
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed opacity-0 animate-fadeInUp" style={{ animationDelay: '1200ms', animationFillMode: 'forwards' }}>
                Transforming legal practice through intelligent automation and insight
              </p>
            </div>

            {/* Elegant CTA */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center opacity-0 animate-fadeInUp" style={{ animationDelay: '1500ms', animationFillMode: 'forwards' }}>
              <button 
                onClick={handleStartTrial}
                className="group bg-gray-900 hover:bg-teal-600 text-white px-12 py-4 text-lg font-light transition-all duration-700 hover:scale-105 relative overflow-hidden"
                style={{ 
                  '--mouse-x': `${mousePosition.x}px`,
                  '--mouse-y': `${mousePosition.y}px`
                } as React.CSSProperties}
              >
                <span className="relative z-10">Begin Journey</span>
                <div className="absolute inset-0 bg-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
              </button>
              
              <button 
                onClick={handleWatchDemo}
                className="group border border-gray-300 hover:border-gray-500 text-gray-700 hover:text-gray-900 px-12 py-4 text-lg font-light transition-all duration-500 hover:scale-105"
                style={{ 
                  '--mouse-x': `${mousePosition.x}px`,
                  '--mouse-y': `${mousePosition.y}px`
                } as React.CSSProperties}
              >
                Explore Platform
              </button>
            </div>
          </div>

          {/* Minimal Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 animate-fadeInUp" style={{ animationDelay: '1800ms', animationFillMode: 'forwards' }}>
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-gray-300 to-transparent mb-4"></div>
            <p className="text-xs text-gray-400 tracking-widest">DISCOVER</p>
          </div>
        </div>
      </section>

      {/* Clean Solutions Section */}
      <section id="solutions" className="py-32 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-6 tracking-tight">
              Intelligent Solutions
            </h2>
            <div className="w-24 h-px bg-teal-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {[
              {
                title: "AI Analytics",
                description: "Deep insights and pattern recognition for legal data analysis and case prediction.",
                delay: "0ms"
              },
              {
                title: "Document Intelligence",
                description: "Advanced document processing and contract analysis with automated workflows.",
                delay: "200ms"
              },
              {
                title: "Client Management",
                description: "Intelligent client relationship tools with predictive insights and automation.",
                delay: "400ms"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="brutal-card group text-center opacity-0 animate-fadeInUp"
                style={{ animationDelay: item.delay, animationFillMode: 'forwards' }}
              >
                <div className="mb-8">
                  <div className="legal-icon-morph w-20 h-20 mx-auto bg-gray-50 group-hover:bg-teal-50 transition-all duration-700 flex items-center justify-center">
                    <div className="w-8 h-8 bg-teal-500 group-hover:scale-110 transition-transform duration-500"></div>
                  </div>
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed font-light">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Minimalist Platform Section */}
      <section id="platform" className="py-32 px-8 bg-gray-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 opacity-0 animate-slideInLeft" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 leading-tight">
                Platform
                <span className="block text-teal-600">Excellence</span>
              </h2>
              <div className="w-16 h-px bg-teal-500"></div>
              <p className="text-xl text-gray-500 leading-relaxed font-light">
                Experience legal practice management redefined through intelligent design and seamless automation.
              </p>
              
              <div className="space-y-6 pt-8">
                {[
                  "Intelligent case management",
                  "Automated document processing",
                  "Predictive analytics dashboard"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 opacity-0 animate-fadeInUp" style={{ animationDelay: `${600 + index * 200}ms`, animationFillMode: 'forwards' }}>
                    <div className="w-1 h-1 bg-teal-500"></div>
                    <span className="text-gray-600 font-light">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clean Dashboard Mockup */}
            <div className="opacity-0 animate-slideInRight" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
              <div className="bg-white shadow-2xl transform hover:scale-105 transition-all duration-700">
                <div className="h-12 bg-gray-900 flex items-center px-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  </div>
                </div>
                <div className="p-12 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-100"></div>
                      <div className="h-8 bg-teal-100"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-100"></div>
                      <div className="h-8 bg-emerald-100"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 bg-gray-50"></div>
                    <div className="h-2 bg-gray-50 w-3/4"></div>
                    <div className="h-2 bg-gray-50 w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant Testimonials */}
      <section id="about" className="py-32 px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-6 tracking-tight">
            Trusted Excellence
          </h2>
          <div className="w-24 h-px bg-teal-500 mx-auto mb-20"></div>

          <div className="space-y-16">
            {testimonials.slice(0, 2).map((testimonial, index) => (
              <div 
                key={index} 
                className="opacity-0 animate-fadeInUp"
                style={{ animationDelay: `${index * 300}ms`, animationFillMode: 'forwards' }}
              >
                <blockquote className="text-2xl md:text-3xl font-light text-gray-700 leading-relaxed mb-8 italic">
                  "{testimonial.content}"
                </blockquote>
                <div className="space-y-2">
                  <div className="font-light text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500 tracking-wide">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sophisticated CTA */}
      <section className="py-32 px-8 bg-gray-900 relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="space-y-12 opacity-0 animate-fadeInUp" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <h2 className="text-5xl md:text-6xl font-extralight text-white leading-tight tracking-tight">
              Begin Your
              <span className="block text-teal-400">Transformation</span>
            </h2>
            
            <p className="text-xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
              Experience the future of legal practice management with intelligent automation and refined design.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
              <button 
                onClick={handleStartTrial}
                className="group bg-white hover:bg-teal-50 text-gray-900 px-12 py-4 text-lg font-light transition-all duration-700 hover:scale-105 relative overflow-hidden"
              >
                <span className="relative z-10">Start Free Trial</span>
              </button>
              <button 
                onClick={handleScheduleDemo}
                className="border border-gray-500 hover:border-gray-300 text-gray-300 hover:text-white px-12 py-4 text-lg font-light transition-all duration-500"
              >
                Schedule Consultation
              </button>
            </div>

            <div className="pt-16 flex justify-center space-x-16 text-gray-500 text-sm">
              <span>30-day trial</span>
              <span>No commitment</span>
              <span>Full access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-2xl font-light text-gray-900">CounselFlow</h3>
              <p className="text-gray-500 font-light leading-relaxed max-w-md">
                Intelligent legal practice management through refined design and advanced automation.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-light text-gray-900">Platform</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#solutions" className="hover:text-gray-900 transition-colors">Solutions</a></li>
                <li><a href="#platform" className="hover:text-gray-900 transition-colors">Platform</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Security</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-light text-gray-900">Support</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2025 CounselFlow. All rights reserved.</p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Clean Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-white shadow-2xl max-w-md w-full mx-8 p-12" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extralight text-gray-900 mb-2">Welcome Back</h2>
              <div className="w-12 h-px bg-teal-500 mx-auto"></div>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-8">
              <div>
                <input 
                  type="email" 
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full px-0 py-4 border-0 border-b border-gray-200 focus:outline-none focus:border-teal-500 transition-all duration-300 bg-transparent text-lg font-light placeholder-gray-400" 
                  placeholder="Email address" 
                />
              </div>
              <div>
                <input 
                  type="password" 
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-0 py-4 border-0 border-b border-gray-200 focus:outline-none focus:border-teal-500 transition-all duration-300 bg-transparent text-lg font-light placeholder-gray-400" 
                  placeholder="Password" 
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gray-900 hover:bg-teal-600 disabled:opacity-50 text-white font-light py-4 text-lg transition-all duration-500 mt-12"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
              <p className="text-sm text-gray-400 text-center font-light mt-8">
                Demo mode: Use any credentials
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Clean Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-white shadow-2xl max-w-md w-full mx-8 p-12" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extralight text-gray-900 mb-2">Begin Trial</h2>
              <div className="w-12 h-px bg-teal-500 mx-auto"></div>
            </div>
            <form onSubmit={handleSignupSubmit} className="space-y-8">
              <div>
                <input 
                  type="text" 
                  required
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                  className="w-full px-0 py-4 border-0 border-b border-gray-200 focus:outline-none focus:border-teal-500 transition-all duration-300 bg-transparent text-lg font-light placeholder-gray-400" 
                  placeholder="Full name" 
                />
              </div>
              <div>
                <input 
                  type="email" 
                  required
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                  className="w-full px-0 py-4 border-0 border-b border-gray-200 focus:outline-none focus:border-teal-500 transition-all duration-300 bg-transparent text-lg font-light placeholder-gray-400" 
                  placeholder="Email address" 
                />
              </div>
              <div>
                <input 
                  type="password" 
                  required
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                  className="w-full px-0 py-4 border-0 border-b border-gray-200 focus:outline-none focus:border-teal-500 transition-all duration-300 bg-transparent text-lg font-light placeholder-gray-400" 
                  placeholder="Password" 
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gray-900 hover:bg-teal-600 disabled:opacity-50 text-white font-light py-4 text-lg transition-all duration-500 mt-12"
              >
                {isLoading ? 'Creating Account...' : 'Start Free Trial'}
              </button>
              <p className="text-sm text-gray-400 text-center font-light mt-8">
                Demo mode: Use any details
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
