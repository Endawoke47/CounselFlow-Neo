/**
 * 🔗 REAL API CLIENT
 * ==================
 * Centralized API client for communicating with our real backend services
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

interface AuthCredentials {
  email: string;
  password: string;
}

interface RegisterData extends AuthCredentials {
  firstName: string;
  lastName: string;
  role?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  avatarUrl?: string;
  bio?: string;
  phoneNumber?: string;
}

interface Contract {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  value?: number;
  currency?: string;
  startDate: string;
  endDate?: string;
  terminationDate?: string;
  renewalTerms?: string;
  riskLevel: string;
  priority: string;
  tags?: string;
  clientId: string;
  assignedLawyerId: string;
  client?: any;
  assignedLawyer?: any;
  daysUntilExpiry?: number;
  isNearExpiry?: boolean;
  computedRiskLevel?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  clientType: string;
  industry?: string;
  description?: string;
  status: string;
  assignedLawyerId: string;
  assignedLawyer?: any;
  totalAssets?: number;
  riskScore?: number;
  lastActivity?: string;
}

class RealApiClient {
  private token: string | null = null;

  constructor() {
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('counselflow_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('counselflow_token', token);
      } else {
        localStorage.removeItem('counselflow_token');
      }
    }
  }

  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async login(credentials: AuthCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    if (response.success) {
      this.setToken(null);
    }

    return response;
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/profile');
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/verify-token', {
      method: 'POST',
    });
  }

  // ========================================
  // CONTRACT METHODS
  // ========================================

  async getContracts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    clientId?: string;
    assignedLawyerId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{ contracts: Contract[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/contracts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ contracts: Contract[]; pagination: any }>(endpoint);
  }

  async getContract(id: string): Promise<ApiResponse<{ contract: Contract }>> {
    return this.request<{ contract: Contract }>(`/contracts/${id}`);
  }

  async createContract(data: Omit<Contract, 'id'>): Promise<ApiResponse<{ contract: Contract }>> {
    return this.request<{ contract: Contract }>('/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContract(id: string, data: Partial<Contract>): Promise<ApiResponse<{ contract: Contract }>> {
    return this.request<{ contract: Contract }>(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContract(id: string): Promise<ApiResponse> {
    return this.request(`/contracts/${id}`, {
      method: 'DELETE',
    });
  }

  async getContractMetrics(): Promise<ApiResponse<{
    totalContracts: number;
    activeContracts: number;
    expiringContracts: number;
    draftContracts: number;
    totalValue: number;
  }>> {
    return this.request('/contracts/dashboard/metrics');
  }

  // ========================================
  // CLIENT METHODS
  // ========================================

  async getClients(params?: {
    page?: number;
    limit?: number;
    clientType?: string;
    status?: string;
    assignedLawyerId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{ clients: Client[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/clients${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ clients: Client[]; pagination: any }>(endpoint);
  }

  async getClient(id: string): Promise<ApiResponse<{ client: Client }>> {
    return this.request<{ client: Client }>(`/clients/${id}`);
  }

  async createClient(data: Omit<Client, 'id'>): Promise<ApiResponse<{ client: Client }>> {
    return this.request<{ client: Client }>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: string, data: Partial<Client>): Promise<ApiResponse<{ client: Client }>> {
    return this.request<{ client: Client }>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: string): Promise<ApiResponse> {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  async getClientMetrics(): Promise<ApiResponse<{
    totalClients: number;
    activeClients: number;
    prospectClients: number;
    corporateClients: number;
    individualClients: number;
  }>> {
    return this.request('/clients/dashboard/metrics');
  }

  // ========================================
  // AI CONTRACT ANALYSIS METHODS
  // ========================================

  async analyzeContractRisk(contractText: string, contractType = 'general'): Promise<ApiResponse<any>> {
    return this.request('/ai/contracts/analyze-risk', {
      method: 'POST',
      body: JSON.stringify({ contractText, contractType })
    });
  }

  async extractContractClauses(contractText: string): Promise<ApiResponse<any>> {
    return this.request('/ai/contracts/extract-clauses', {
      method: 'POST',
      body: JSON.stringify({ contractText })
    });
  }

  async compareContracts(contract1: string, contract2: string, focusAreas?: string[]): Promise<ApiResponse<any>> {
    return this.request('/ai/contracts/compare', {
      method: 'POST',
      body: JSON.stringify({ contract1, contract2, focusAreas })
    });
  }

  async generateContractSummary(contractText: string): Promise<ApiResponse<any>> {
    return this.request('/ai/contracts/summarize', {
      method: 'POST',
      body: JSON.stringify({ contractText })
    });
  }

  async getAIContractCapabilities(): Promise<ApiResponse<any>> {
    return this.request('/ai/contracts/capabilities');
  }
}

// Create singleton instance
export const realApiClient = new RealApiClient();

// Export types for use in components
export type {
  ApiResponse,
  User,
  Contract,
  Client,
  AuthCredentials,
  RegisterData,
};
