/**
 * 🚀 PRODUCTION API CLIENT
 * ========================
 * Real API client for production-ready backend integration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Real API interfaces
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  avatar?: string;
  bio?: string;
  phoneNumber?: string;
  department?: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  clientType: 'Individual' | 'Corporate' | 'Government' | 'NGO';
  industry?: string;
  description?: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Suspended';
  assignedLawyerId: string;
  assignedLawyer?: User;
  totalAssets?: number;
  riskScore?: number;
  lastActivity?: string;
  documents?: any[];
  matters?: any[];
  createdAt: string;
  updatedAt: string;
}

interface Matter {
  id: string;
  title: string;
  description?: string;
  matterType: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  clientId: string;
  client?: Client;
  assignedLawyerId: string;
  assignedLawyer?: User;
  startDate: string;
  endDate?: string;
  billingRate?: number;
  timeEntries?: any[];
  documents?: any[];
  tasks?: any[];
  createdAt: string;
  updatedAt: string;
}

interface Contract {
  id: string;
  title: string;
  description?: string;
  contractType: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Executed' | 'Expired' | 'Terminated';
  value?: number;
  currency?: string;
  startDate: string;
  endDate?: string;
  clientId: string;
  client?: Client;
  assignedLawyerId: string;
  assignedLawyer?: User;
  riskLevel: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  clauses?: any[];
  documents?: any[];
  approvals?: any[];
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: string;
  status: string;
  version: number;
  uploadedBy: string;
  uploadedByUser?: User;
  relatedId?: string;
  relatedType?: string;
  tags?: string[];
  metadata?: any;
  url: string;
  createdAt: string;
  updatedAt: string;
}

class ProductionApiClient {
  private token: string | null = null;
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
    
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('counselflow_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('counselflow_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('counselflow_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request(endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.request('/auth/refresh', { method: 'POST' });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request('/auth/profile');
  }

  // Clients
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    clientType?: string;
  }): Promise<ApiResponse<{ clients: Client[] }>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.clientType) query.append('clientType', params.clientType);

    return this.request(`/clients?${query.toString()}`);
  }

  async getClient(id: string): Promise<ApiResponse<Client>> {
    return this.request(`/clients/${id}`);
  }

  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Client>> {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id: string, clientData: Partial<Client>): Promise<ApiResponse<Client>> {
    return this.request(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id: string): Promise<ApiResponse> {
    return this.request(`/clients/${id}`, { method: 'DELETE' });
  }

  // Matters
  async getMatters(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    clientId?: string;
  }): Promise<ApiResponse<{ matters: Matter[] }>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.clientId) query.append('clientId', params.clientId);

    return this.request(`/matters?${query.toString()}`);
  }

  async getMatter(id: string): Promise<ApiResponse<Matter>> {
    return this.request(`/matters/${id}`);
  }

  async createMatter(matterData: Omit<Matter, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Matter>> {
    return this.request('/matters', {
      method: 'POST',
      body: JSON.stringify(matterData),
    });
  }

  async updateMatter(id: string, matterData: Partial<Matter>): Promise<ApiResponse<Matter>> {
    return this.request(`/matters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(matterData),
    });
  }

  async deleteMatter(id: string): Promise<ApiResponse> {
    return this.request(`/matters/${id}`, { method: 'DELETE' });
  }

  // Contracts
  async getContracts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    clientId?: string;
  }): Promise<ApiResponse<{ contracts: Contract[] }>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.clientId) query.append('clientId', params.clientId);

    return this.request(`/contracts?${query.toString()}`);
  }

  async getContract(id: string): Promise<ApiResponse<Contract>> {
    return this.request(`/contracts/${id}`);
  }

  async createContract(contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Contract>> {
    return this.request('/contracts', {
      method: 'POST',
      body: JSON.stringify(contractData),
    });
  }

  async updateContract(id: string, contractData: Partial<Contract>): Promise<ApiResponse<Contract>> {
    return this.request(`/contracts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(contractData),
    });
  }

  async deleteContract(id: string): Promise<ApiResponse> {
    return this.request(`/contracts/${id}`, { method: 'DELETE' });
  }

  // Documents
  async uploadDocument(file: File, metadata: {
    title: string;
    description?: string;
    category: string;
    relatedId?: string;
    relatedType?: string;
    tags?: string[];
  }): Promise<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    return this.request('/documents/upload', {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    });
  }

  async getDocuments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    relatedId?: string;
  }): Promise<ApiResponse<{ documents: Document[] }>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.relatedId) query.append('relatedId', params.relatedId);

    return this.request(`/documents?${query.toString()}`);
  }

  async getDocument(id: string): Promise<ApiResponse<Document>> {
    return this.request(`/documents/${id}`);
  }

  async downloadDocument(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/documents/${id}/download`, {
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download document: ${response.statusText}`);
    }

    return response.blob();
  }

  async deleteDocument(id: string): Promise<ApiResponse> {
    return this.request(`/documents/${id}`, { method: 'DELETE' });
  }

  // Dashboard Analytics
  async getDashboardMetrics(): Promise<ApiResponse<{
    totalClients: number;
    activeMatters: number;
    pendingTasks: number;
    revenue: {
      total: number;
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
    recentActivities: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      timestamp: string;
      priority?: string;
    }>;
  }>> {
    return this.request('/dashboard/metrics');
  }

  // Reports
  async generateReport(type: string, params: any): Promise<ApiResponse<{ reportId: string; url: string }>> {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type, params }),
    });
  }

  async getReportStatus(reportId: string): Promise<ApiResponse<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    url?: string;
    error?: string;
  }>> {
    return this.request(`/reports/${reportId}/status`);
  }

  // Search
  async globalSearch(query: string, filters?: {
    types?: string[];
    dateRange?: { start: string; end: string };
    limit?: number;
  }): Promise<ApiResponse<{
    results: Array<{
      type: string;
      id: string;
      title: string;
      description?: string;
      relevance: number;
      metadata: any;
    }>;
    total: number;
  }>> {
    return this.request('/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters }),
    });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    services: Record<string, 'up' | 'down'>;
  }>> {
    return this.request('/health');
  }
}

// Create singleton instance
export const productionApiClient = new ProductionApiClient();

// Export types
export type {
  ApiResponse,
  User,
  Client,
  Matter,
  Contract,
  Document
};
