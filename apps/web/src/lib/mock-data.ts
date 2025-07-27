/**
 * Comprehensive Mock Data for CounselFlow Application
 * This file contains realistic legal data for populating all modules
 */

export interface Client {
  id: string;
  name: string;
  clientType: 'individual' | 'corporation' | 'government' | 'non-profit';
  industry: string;
  status: 'active' | 'inactive' | 'prospect';
  registrationDate: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  totalValue: number;
  activeMatters: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastContact: string;
  assignedLawyer: string;
}

export interface Matter {
  id: string;
  clientId: string;
  title: string;
  description: string;
  matterType: 'litigation' | 'transactional' | 'regulatory' | 'advisory' | 'compliance';
  status: 'active' | 'pending' | 'closed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  openDate: string;
  closeDate?: string;
  estimatedValue: number;
  billedHours: number;
  totalFees: number;
  assignedTeam: string[];
  nextDeadline?: string;
  progress: number;
}

export interface Contract {
  id: string;
  clientId: string;
  matterId?: string;
  title: string;
  contractType: 'service-agreement' | 'employment' | 'nda' | 'partnership' | 'licensing' | 'purchase' | 'lease';
  status: 'draft' | 'under-review' | 'approved' | 'executed' | 'expired' | 'terminated';
  value: number;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  signedBy: string[];
  riskScore: number;
  complianceStatus: 'compliant' | 'non-compliant' | 'under-review';
  lastReviewDate: string;
  nextReviewDate: string;
}

export interface Dispute {
  id: string;
  clientId: string;
  matterId?: string;
  title: string;
  disputeType: 'commercial' | 'employment' | 'intellectual-property' | 'contract' | 'regulatory' | 'criminal';
  status: 'filed' | 'discovery' | 'mediation' | 'trial' | 'settled' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  filingDate: string;
  court: string;
  judge: string;
  opposingParty: string;
  claimAmount: number;
  probabilityOfSuccess: number;
  nextHearing?: string;
  settlement?: {
    amount: number;
    date: string;
    terms: string;
  };
}

export interface Entity {
  id: string;
  name: string;
  entityType: 'corporation' | 'llc' | 'partnership' | 'sole-proprietorship' | 'non-profit';
  jurisdiction: string;
  incorporationDate: string;
  status: 'active' | 'inactive' | 'dissolved' | 'suspended';
  registrationNumber: string;
  taxId: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  officers: Array<{
    name: string;
    title: string;
    appointmentDate: string;
  }>;
  subsidiaries: string[];
  parentCompany?: string;
  annualRevenue: number;
  complianceStatus: 'current' | 'overdue' | 'pending';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'overdue';
  dueDate: string;
  createdDate: string;
  completedDate?: string;
  matterId?: string;
  clientId?: string;
  timeEstimate: number; // in hours
  timeSpent: number; // in hours
  billable: boolean;
  category: 'research' | 'drafting' | 'review' | 'filing' | 'client-communication' | 'court-appearance';
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: 'legal-precedent' | 'regulation' | 'template' | 'guideline' | 'best-practice';
  jurisdiction: string;
  practiceArea: string;
  lastUpdated: string;
  author: string;
  tags: string[];
  relevanceScore: number;
  accessCount: number;
}

export interface RiskAssessment {
  id: string;
  clientId: string;
  matterId?: string;
  riskType: 'regulatory' | 'financial' | 'reputational' | 'operational' | 'legal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100
  impact: number; // 0-100
  description: string;
  mitigationStrategy: string;
  assignedTo: string;
  status: 'identified' | 'analyzing' | 'mitigating' | 'monitored' | 'resolved';
  identifiedDate: string;
  reviewDate: string;
}

export interface Policy {
  id: string;
  title: string;
  category: 'hr' | 'compliance' | 'data-protection' | 'anti-corruption' | 'safety' | 'quality';
  version: string;
  effectiveDate: string;
  reviewDate: string;
  status: 'active' | 'draft' | 'archived' | 'under-review';
  approvedBy: string;
  applicableJurisdictions: string[];
  relatedRegulations: string[];
  acknowledgmentRequired: boolean;
  acknowledgmentRate: number; // percentage
}

export interface LegalSpend {
  id: string;
  clientId?: string;
  matterId?: string;
  vendor: string;
  serviceType: 'external-counsel' | 'expert-witness' | 'court-reporter' | 'e-discovery' | 'translation';
  amount: number;
  currency: string;
  invoiceDate: string;
  dueDate: string;
  status: 'pending' | 'approved' | 'paid' | 'disputed' | 'overdue';
  approvedBy?: string;
  budget: number;
  budgetVariance: number;
  description: string;
}

// Mock Data Generation
export const mockClients: Client[] = [
  {
    id: 'client-001',
    name: 'Safaricom PLC',
    clientType: 'corporation',
    industry: 'Telecommunications',
    status: 'active',
    registrationDate: '2020-03-15',
    email: 'legal@safaricom.co.ke',
    phone: '+254-700-000-000',
    address: {
      street: 'Safaricom House, Waiyaki Way',
      city: 'Nairobi',
      state: 'Nairobi County',
      zipCode: '00100',
      country: 'Kenya'
    },
    totalValue: 15500000,
    activeMatters: 8,
    riskLevel: 'medium',
    lastContact: '2025-01-20',
    assignedLawyer: 'Sarah Kimani'
  },
  {
    id: 'client-002',
    name: 'Kenya Commercial Bank',
    clientType: 'corporation',
    industry: 'Financial Services',
    status: 'active',
    registrationDate: '2019-08-22',
    email: 'legal@kcbgroup.com',
    phone: '+254-711-087-000',
    address: {
      street: 'Kencom House, Moi Avenue',
      city: 'Nairobi',
      state: 'Nairobi County',
      zipCode: '00100',
      country: 'Kenya'
    },
    totalValue: 23800000,
    activeMatters: 12,
    riskLevel: 'low',
    lastContact: '2025-01-25',
    assignedLawyer: 'Michael Ochieng'
  },
  {
    id: 'client-003',
    name: 'Equity Group Holdings',
    clientType: 'corporation',
    industry: 'Financial Services',
    status: 'active',
    registrationDate: '2021-01-10',
    email: 'legal@equitybank.co.ke',
    phone: '+254-763-026-000',
    address: {
      street: 'Equity Centre, Hospital Road',
      city: 'Nairobi',
      state: 'Nairobi County',
      zipCode: '00100',
      country: 'Kenya'
    },
    totalValue: 18900000,
    activeMatters: 6,
    riskLevel: 'low',
    lastContact: '2025-01-22',
    assignedLawyer: 'Grace Wanjiku'
  },
  {
    id: 'client-004',
    name: 'East African Breweries Ltd',
    clientType: 'corporation',
    industry: 'Manufacturing',
    status: 'active',
    registrationDate: '2020-11-05',
    email: 'legal@eabl.co.ke',
    phone: '+254-709-677-000',
    address: {
      street: 'EABL Tower, Uhuru Highway',
      city: 'Nairobi',
      state: 'Nairobi County',
      zipCode: '00100',
      country: 'Kenya'
    },
    totalValue: 12300000,
    activeMatters: 9,
    riskLevel: 'medium',
    lastContact: '2025-01-18',
    assignedLawyer: 'David Mwangi'
  },
  {
    id: 'client-005',
    name: 'Ministry of Health',
    clientType: 'government',
    industry: 'Healthcare',
    status: 'active',
    registrationDate: '2021-06-01',
    email: 'legal@health.go.ke',
    phone: '+254-020-271-8000',
    address: {
      street: 'Afya House, Cathedral Road',
      city: 'Nairobi',
      state: 'Nairobi County',
      zipCode: '00100',
      country: 'Kenya'
    },
    totalValue: 8500000,
    activeMatters: 15,
    riskLevel: 'high',
    lastContact: '2025-01-24',
    assignedLawyer: 'Ann Kariuki'
  },
  {
    id: 'client-006',
    name: 'Nairobi Securities Exchange',
    clientType: 'corporation',
    industry: 'Financial Markets',
    status: 'active',
    registrationDate: '2019-12-12',
    email: 'legal@nse.co.ke',
    phone: '+254-020-283-1000',
    address: {
      street: 'The Exchange, 55 Westlands Road',
      city: 'Nairobi',
      state: 'Nairobi County',
      zipCode: '00623',
      country: 'Kenya'
    },
    totalValue: 14700000,
    activeMatters: 7,
    riskLevel: 'medium',
    lastContact: '2025-01-21',
    assignedLawyer: 'Peter Kiprotich'
  },
  {
    id: 'client-007',
    name: 'Kenya Airways',
    clientType: 'corporation',
    industry: 'Aviation',
    status: 'active',
    registrationDate: '2020-09-18',
    email: 'legal@kenya-airways.com',
    phone: '+254-020-327-4000',
    address: {
      street: 'Airways Park, Embakasi',
      city: 'Nairobi',
      state: 'Nairobi County',
      zipCode: '00100',
      country: 'Kenya'
    },
    totalValue: 19200000,
    activeMatters: 11,
    riskLevel: 'high',
    lastContact: '2025-01-19',
    assignedLawyer: 'Catherine Njeri'
  },
  {
    id: 'client-008',
    name: 'Bamburi Cement',
    clientType: 'corporation',
    industry: 'Construction Materials',
    status: 'active',
    registrationDate: '2021-03-20',
    email: 'legal@bamburi.co.ke',
    phone: '+254-041-549-9999',
    address: {
      street: 'Bamburi Road, Mombasa',
      city: 'Mombasa',
      state: 'Mombasa County',
      zipCode: '80100',
      country: 'Kenya'
    },
    totalValue: 11600000,
    activeMatters: 5,
    riskLevel: 'low',
    lastContact: '2025-01-23',
    assignedLawyer: 'James Mutua'
  }
];

export const mockMatters: Matter[] = [
  {
    id: 'matter-001',
    clientId: 'client-001',
    title: 'Safaricom 5G Regulatory Compliance',
    description: 'Ensuring compliance with telecommunications regulations for 5G network deployment',
    matterType: 'regulatory',
    status: 'active',
    priority: 'high',
    openDate: '2024-11-15',
    estimatedValue: 5200000,
    billedHours: 156,
    totalFees: 3900000,
    assignedTeam: ['Sarah Kimani', 'Tech Reg Team'],
    nextDeadline: '2025-02-28',
    progress: 75
  },
  {
    id: 'matter-002',
    clientId: 'client-002',
    title: 'KCB Digital Banking Compliance Review',
    description: 'Comprehensive review of digital banking services compliance with CBK regulations',
    matterType: 'compliance',
    status: 'active',
    priority: 'medium',
    openDate: '2024-12-01',
    estimatedValue: 3800000,
    billedHours: 98,
    totalFees: 2450000,
    assignedTeam: ['Michael Ochieng', 'FinReg Team'],
    nextDeadline: '2025-03-15',
    progress: 60
  },
  {
    id: 'matter-003',
    clientId: 'client-003',
    title: 'Equity Bank M&A Transaction',
    description: 'Legal support for acquisition of regional microfinance institution',
    matterType: 'transactional',
    status: 'active',
    priority: 'urgent',
    openDate: '2025-01-05',
    estimatedValue: 8900000,
    billedHours: 245,
    totalFees: 6125000,
    assignedTeam: ['Grace Wanjiku', 'M&A Team', 'Due Diligence Team'],
    nextDeadline: '2025-02-15',
    progress: 45
  },
  {
    id: 'matter-004',
    clientId: 'client-004',
    title: 'EABL Product Liability Defense',
    description: 'Defense against product liability claims regarding alcoholic beverage quality',
    matterType: 'litigation',
    status: 'active',
    priority: 'high',
    openDate: '2024-10-20',
    estimatedValue: 4500000,
    billedHours: 189,
    totalFees: 4725000,
    assignedTeam: ['David Mwangi', 'Litigation Team'],
    nextDeadline: '2025-02-10',
    progress: 80
  },
  {
    id: 'matter-005',
    clientId: 'client-005',
    title: 'Healthcare Policy Implementation',
    description: 'Legal framework development for Universal Health Coverage implementation',
    matterType: 'regulatory',
    status: 'active',
    priority: 'urgent',
    openDate: '2024-09-15',
    estimatedValue: 6700000,
    billedHours: 312,
    totalFees: 7800000,
    assignedTeam: ['Ann Kariuki', 'Public Policy Team'],
    nextDeadline: '2025-03-01',
    progress: 90
  }
];

export const mockContracts: Contract[] = [
  {
    id: 'contract-001',
    clientId: 'client-001',
    matterId: 'matter-001',
    title: '5G Infrastructure Service Agreement',
    contractType: 'service-agreement',
    status: 'executed',
    value: 2800000000,
    startDate: '2024-12-01',
    endDate: '2027-11-30',
    renewalDate: '2027-09-30',
    signedBy: ['Safaricom Legal Team', 'Infrastructure Provider'],
    riskScore: 35,
    complianceStatus: 'compliant',
    lastReviewDate: '2025-01-15',
    nextReviewDate: '2025-07-15'
  },
  {
    id: 'contract-002',
    clientId: 'client-002',
    matterId: 'matter-002',
    title: 'Digital Banking Platform License',
    contractType: 'licensing',
    status: 'under-review',
    value: 850000000,
    startDate: '2025-03-01',
    endDate: '2030-02-28',
    signedBy: ['KCB Legal Department'],
    riskScore: 42,
    complianceStatus: 'under-review',
    lastReviewDate: '2025-01-20',
    nextReviewDate: '2025-02-20'
  },
  {
    id: 'contract-003',
    clientId: 'client-003',
    matterId: 'matter-003',
    title: 'Microfinance Acquisition Agreement',
    contractType: 'purchase',
    status: 'draft',
    value: 5600000000,
    startDate: '2025-02-15',
    endDate: '2025-08-15',
    signedBy: [],
    riskScore: 58,
    complianceStatus: 'under-review',
    lastReviewDate: '2025-01-25',
    nextReviewDate: '2025-02-05'
  }
];

export const mockDisputes: Dispute[] = [
  {
    id: 'dispute-001',
    clientId: 'client-004',
    matterId: 'matter-004',
    title: 'Product Quality Class Action Suit',
    disputeType: 'commercial',
    status: 'discovery',
    priority: 'high',
    filingDate: '2024-10-20',
    court: 'Commercial Court, Nairobi',
    judge: 'Hon. Justice Mary Kasango',
    opposingParty: 'Consumer Protection Alliance',
    claimAmount: 150000000,
    probabilityOfSuccess: 75,
    nextHearing: '2025-02-12'
  },
  {
    id: 'dispute-002',
    clientId: 'client-007',
    title: 'Employment Discrimination Case',
    disputeType: 'employment',
    status: 'mediation',
    priority: 'medium',
    filingDate: '2024-11-30',
    court: 'Employment and Labour Relations Court',
    judge: 'Hon. Justice James Rika',
    opposingParty: 'Former Employee Union',
    claimAmount: 25000000,
    probabilityOfSuccess: 60,
    nextHearing: '2025-02-08'
  }
];

export const mockTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Review 5G compliance documentation',
    description: 'Comprehensive review of technical compliance docs for Safaricom 5G deployment',
    assignee: 'Sarah Kimani',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2025-02-05',
    createdDate: '2025-01-20',
    matterId: 'matter-001',
    clientId: 'client-001',
    timeEstimate: 24,
    timeSpent: 18,
    billable: true,
    category: 'review'
  },
  {
    id: 'task-002',
    title: 'Draft acquisition term sheet',
    description: 'Prepare initial term sheet for Equity Bank microfinance acquisition',
    assignee: 'Grace Wanjiku',
    priority: 'urgent',
    status: 'todo',
    dueDate: '2025-02-02',
    createdDate: '2025-01-25',
    matterId: 'matter-003',
    clientId: 'client-003',
    timeEstimate: 16,
    timeSpent: 0,
    billable: true,
    category: 'drafting'
  },
  {
    id: 'task-003',
    title: 'Prepare court filing documents',
    description: 'Compile and prepare all necessary documents for EABL product liability defense',
    assignee: 'David Mwangi',
    priority: 'high',
    status: 'review',
    dueDate: '2025-02-08',
    createdDate: '2025-01-22',
    matterId: 'matter-004',
    clientId: 'client-004',
    timeEstimate: 12,
    timeSpent: 10,
    billable: true,
    category: 'filing'
  }
];

export const calculateDashboardMetrics = () => {
  const activeMatters = mockMatters.filter(m => m.status === 'active').length;
  const totalClients = mockClients.filter(c => c.status === 'active').length;
  const totalRevenue = mockMatters.reduce((sum, matter) => sum + matter.totalFees, 0);
  const pendingTasks = mockTasks.filter(t => t.status === 'todo' || t.status === 'in-progress').length;
  const urgentTasks = mockTasks.filter(t => t.priority === 'urgent').length;
  const highRiskClients = mockClients.filter(c => c.riskLevel === 'high').length;

  return {
    activeMatters,
    totalClients,
    totalRevenue,
    pendingTasks,
    urgentTasks,
    highRiskClients,
    averageMatterValue: totalRevenue / activeMatters || 0,
    clientRetentionRate: 94.5, // Mock percentage
    billingRealization: 87.3, // Mock percentage
    caseSuccessRate: 82.1 // Mock percentage
  };
};

export const mockEntities: Entity[] = [
  {
    id: 'entity-001',
    name: 'Safaricom PLC',
    entityType: 'corporation',
    jurisdiction: 'Kenya',
    incorporationDate: '1997-05-31',
    status: 'active',
    registrationNumber: 'C.12/2000',
    taxId: 'P051467661B',
    address: {
      street: 'Safaricom House, Waiyaki Way',
      city: 'Nairobi',
      state: 'Nairobi County',
      zipCode: '00100',
      country: 'Kenya'
    },
    officers: [
      { name: 'Peter Ndegwa', title: 'Chief Executive Officer', appointmentDate: '2020-04-01' },
      { name: 'Dilip Pal', title: 'Chief Financial Officer', appointmentDate: '2019-09-01' },
      { name: 'Rita Okuthe', title: 'Company Secretary', appointmentDate: '2018-01-15' }
    ],
    subsidiaries: ['Safaricom Ethiopia', 'M-PESA Africa'],
    annualRevenue: 289400000000, // KES 289.4 billion
    complianceStatus: 'current'
  },
  {
    id: 'entity-002',
    name: 'Kenya Commercial Bank Group',
    entityType: 'corporation',
    jurisdiction: 'Kenya',
    incorporationDate: '1896-07-01',
    status: 'active',
    registrationNumber: 'C.4/1970',
    taxId: 'P051234567A',
    address: {
      street: 'Kencom House, Moi Avenue',
      city: 'Nairobi',
      state: 'Nairobi County',
      zipCode: '00100',
      country: 'Kenya'
    },
    officers: [
      { name: 'Paul Russo', title: 'Chief Executive Officer', appointmentDate: '2019-01-01' },
      { name: 'Lawrence Kimathi', title: 'Chief Financial Officer', appointmentDate: '2020-03-01' },
      { name: 'Rosemary Macharia', title: 'Company Secretary', appointmentDate: '2017-06-01' }
    ],
    subsidiaries: ['KCB Bank Uganda', 'KCB Bank Tanzania', 'KCB Bank Rwanda', 'KCB Bank South Sudan'],
    annualRevenue: 156800000000, // KES 156.8 billion
    complianceStatus: 'current'
  },
  {
    id: 'entity-003',
    name: 'Equity Group Holdings PLC',
    entityType: 'corporation',
    jurisdiction: 'Kenya',
    incorporationDate: '1984-01-01',
    status: 'active',
    registrationNumber: 'C.1/2008',
    taxId: 'P051789123C',
    address: {
      street: 'Equity Centre, Hospital Road',
      city: 'Nairobi',
      state: 'Nairobi County',
      zipCode: '00100',
      country: 'Kenya'
    },
    officers: [
      { name: 'James Mwangi', title: 'Managing Director & CEO', appointmentDate: '2004-01-01' },
      { name: 'John Staley', title: 'Chief Financial Officer', appointmentDate: '2018-07-01' },
      { name: 'Mary Wamae', title: 'Company Secretary', appointmentDate: '2015-03-01' }
    ],
    subsidiaries: ['Equity Bank Uganda', 'Equity Bank Tanzania', 'Equity Bank Rwanda', 'Equity Bank DRC'],
    annualRevenue: 124500000000, // KES 124.5 billion
    complianceStatus: 'current'
  }
];

export const mockKnowledgeItems: KnowledgeItem[] = [
  {
    id: 'knowledge-001',
    title: 'Kenya Data Protection Act 2019 - Implementation Guidelines',
    content: 'Comprehensive guide on implementing data protection requirements under the Kenya Data Protection Act 2019, including registration requirements, data processing principles, and compliance procedures.',
    category: 'regulation',
    jurisdiction: 'Kenya',
    practiceArea: 'Data Protection',
    lastUpdated: '2025-01-15',
    author: 'Sarah Kimani',
    tags: ['data protection', 'privacy', 'compliance', 'Kenya'],
    relevanceScore: 95,
    accessCount: 234
  },
  {
    id: 'knowledge-002',
    title: 'Standard Share Purchase Agreement Template',
    content: 'Template for share purchase agreements in M&A transactions, including standard clauses, warranties, and indemnities applicable under Kenyan law.',
    category: 'template',
    jurisdiction: 'Kenya',
    practiceArea: 'Corporate Law',
    lastUpdated: '2025-01-10',
    author: 'Grace Wanjiku',
    tags: ['M&A', 'share purchase', 'template', 'corporate'],
    relevanceScore: 88,
    accessCount: 156
  },
  {
    id: 'knowledge-003',
    title: 'Employment Termination Best Practices',
    content: 'Best practices for handling employment terminations, including notice requirements, severance calculations, and compliance with the Employment Act 2007.',
    category: 'best-practice',
    jurisdiction: 'Kenya',
    practiceArea: 'Employment Law',
    lastUpdated: '2025-01-05',
    author: 'Michael Ochieng',
    tags: ['employment', 'termination', 'severance', 'labor law'],
    relevanceScore: 82,
    accessCount: 298
  }
];

export const mockRiskAssessments: RiskAssessment[] = [
  {
    id: 'risk-001',
    clientId: 'client-001',
    matterId: 'matter-001',
    riskType: 'regulatory',
    severity: 'medium',
    probability: 45,
    impact: 70,
    description: 'Potential regulatory changes affecting 5G deployment timeline and compliance requirements',
    mitigationStrategy: 'Continuous monitoring of regulatory developments and proactive engagement with telecommunications authority',
    assignedTo: 'Sarah Kimani',
    status: 'mitigating',
    identifiedDate: '2024-12-15',
    reviewDate: '2025-02-15'
  },
  {
    id: 'risk-002',
    clientId: 'client-002',
    matterId: 'matter-002',
    riskType: 'financial',
    severity: 'high',
    probability: 60,
    impact: 85,
    description: 'Potential financial penalties for non-compliance with new CBK digital banking regulations',
    mitigationStrategy: 'Accelerated compliance review and implementation of enhanced controls',
    assignedTo: 'Michael Ochieng',
    status: 'analyzing',
    identifiedDate: '2024-12-20',
    reviewDate: '2025-01-30'
  },
  {
    id: 'risk-003',
    clientId: 'client-005',
    riskType: 'reputational',
    severity: 'high',
    probability: 35,
    impact: 90,
    description: 'Public health policy implementation delays could result in negative media coverage and public criticism',
    mitigationStrategy: 'Enhanced communication strategy and stakeholder engagement plan',
    assignedTo: 'Ann Kariuki',
    status: 'monitored',
    identifiedDate: '2024-11-30',
    reviewDate: '2025-03-01'
  }
];

export const mockPolicies: Policy[] = [
  {
    id: 'policy-001',
    title: 'Anti-Corruption and Bribery Policy',
    category: 'anti-corruption',
    version: '2.1',
    effectiveDate: '2024-01-01',
    reviewDate: '2025-01-01',
    status: 'active',
    approvedBy: 'Board of Directors',
    applicableJurisdictions: ['Kenya', 'Uganda', 'Tanzania'],
    relatedRegulations: ['Anti-Corruption and Economic Crimes Act', 'Public Officer Ethics Act'],
    acknowledgmentRequired: true,
    acknowledgmentRate: 94.5
  },
  {
    id: 'policy-002',
    title: 'Data Protection and Privacy Policy',
    category: 'data-protection',
    version: '1.3',
    effectiveDate: '2024-06-01',
    reviewDate: '2025-06-01',
    status: 'active',
    approvedBy: 'Chief Legal Officer',
    applicableJurisdictions: ['Kenya', 'South Africa'],
    relatedRegulations: ['Kenya Data Protection Act 2019', 'GDPR'],
    acknowledgmentRequired: true,
    acknowledgmentRate: 98.2
  },
  {
    id: 'policy-003',
    title: 'Employment Code of Conduct',
    category: 'hr',
    version: '3.0',
    effectiveDate: '2024-03-01',
    reviewDate: '2025-03-01',
    status: 'active',
    approvedBy: 'Chief Executive Officer',
    applicableJurisdictions: ['Kenya', 'Uganda', 'Tanzania', 'Rwanda'],
    relatedRegulations: ['Employment Act 2007', 'Work Injury Benefits Act'],
    acknowledgmentRequired: true,
    acknowledgmentRate: 91.8
  }
];

export const mockLegalSpend: LegalSpend[] = [
  {
    id: 'spend-001',
    clientId: 'client-001',
    matterId: 'matter-001',
    vendor: 'Telecommunications Compliance Consultants Ltd',
    serviceType: 'external-counsel',
    amount: 2500000,
    currency: 'KES',
    invoiceDate: '2025-01-15',
    dueDate: '2025-02-14',
    status: 'approved',
    approvedBy: 'Sarah Kimani',
    budget: 3000000,
    budgetVariance: 500000,
    description: 'Regulatory compliance advisory services for 5G network deployment'
  },
  {
    id: 'spend-002',
    clientId: 'client-003',
    matterId: 'matter-003',
    vendor: 'Corporate Finance Legal Associates',
    serviceType: 'external-counsel',
    amount: 4200000,
    currency: 'KES',
    invoiceDate: '2025-01-20',
    dueDate: '2025-02-19',
    status: 'pending',
    budget: 5000000,
    budgetVariance: 800000,
    description: 'M&A transaction legal support and due diligence services'
  },
  {
    id: 'spend-003',
    clientId: 'client-004',
    matterId: 'matter-004',
    vendor: 'Expert Witness Services Kenya',
    serviceType: 'expert-witness',
    amount: 850000,
    currency: 'KES',
    invoiceDate: '2025-01-10',
    dueDate: '2025-02-09',
    status: 'paid',
    approvedBy: 'David Mwangi',
    budget: 1000000,
    budgetVariance: 150000,
    description: 'Product liability expert witness testimony and analysis'
  }
];
