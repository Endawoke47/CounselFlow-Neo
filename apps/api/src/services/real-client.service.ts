/**
 * 👥 REAL CLIENT SERVICE IMPLEMENTATION
 * ====================================
 * Fully functional client management with database operations
 */

import { PrismaClient } from '@prisma/client';
import winston from 'winston';

interface ClientData {
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  clientType: string;
  industry?: string;
  description?: string;
  status?: string;
  assignedLawyerId: string;
}

interface ClientUpdateData extends Partial<ClientData> {
  id: string;
}

interface ClientQueryOptions {
  page?: number;
  limit?: number;
  clientType?: string;
  status?: string;
  assignedLawyerId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class RealClientService {
  private prisma: PrismaClient;
  private logger: winston.Logger;

  constructor() {
    this.prisma = new PrismaClient();
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/client-service.log' }),
        new winston.transports.Console(),
      ],
    });
  }

  /**
   * 👥 GET ALL CLIENTS
   */
  async getAllClients(userId: string, options: ClientQueryOptions = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        clientType,
        status,
        assignedLawyerId,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        OR: [
          { assignedLawyerId: userId },
          { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
        ],
      };

      if (clientType) where.clientType = clientType;
      if (status) where.status = status;
      if (assignedLawyerId) where.assignedLawyerId = assignedLawyerId;

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get clients with related data
      const [clients, total] = await Promise.all([
        this.prisma.client.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            assignedLawyer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            _count: {
              select: {
                contracts: true,
                matters: true,
                disputes: true,
                documents: true,
              },
            },
          },
        }),
        this.prisma.client.count({ where }),
      ]);

      // Calculate additional metrics
      const clientsWithMetrics = clients.map(client => ({
        ...client,
        totalAssets: this.calculateTotalAssets(client),
        riskScore: this.calculateRiskScore(client),
        lastActivity: this.getLastActivity(client),
      }));

      this.logger.info(`Retrieved ${clients.length} clients for user ${userId}`);

      return {
        success: true,
        data: {
          clients: clientsWithMetrics,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: skip + limit < total,
            hasPrev: page > 1,
          },
        },
      };
    } catch (error) {
      this.logger.error('Get clients failed:', error);
      return {
        success: false,
        message: 'Failed to retrieve clients',
      };
    }
  }

  /**
   * 👤 GET CLIENT BY ID
   */
  async getClientById(clientId: string, userId: string) {
    try {
      const client = await this.prisma.client.findFirst({
        where: {
          id: clientId,
          OR: [
            { assignedLawyerId: userId },
            { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
          ],
        },
        include: {
          assignedLawyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          contracts: {
            select: {
              id: true,
              title: true,
              type: true,
              status: true,
              value: true,
              startDate: true,
              endDate: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          matters: {
            select: {
              id: true,
              title: true,
              type: true,
              status: true,
              priority: true,
              startDate: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          disputes: {
            select: {
              id: true,
              title: true,
              type: true,
              status: true,
              priority: true,
              claimAmount: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          documents: {
            select: {
              id: true,
              fileName: true,
              originalName: true,
              category: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!client) {
        return {
          success: false,
          message: 'Client not found or access denied',
        };
      }

      // Add calculated fields
      const enrichedClient = {
        ...client,
        totalAssets: this.calculateTotalAssets(client),
        riskScore: this.calculateRiskScore(client),
        lastActivity: this.getLastActivity(client),
      };

      this.logger.info(`Retrieved client ${clientId} for user ${userId}`);

      return {
        success: true,
        data: { client: enrichedClient },
      };
    } catch (error) {
      this.logger.error('Get client by ID failed:', error);
      return {
        success: false,
        message: 'Failed to retrieve client',
      };
    }
  }

  /**
   * ➕ CREATE NEW CLIENT
   */
  async createClient(clientData: ClientData, userId: string) {
    try {
      // Check if email already exists
      const existingClient = await this.prisma.client.findUnique({
        where: { email: clientData.email },
      });

      if (existingClient) {
        return {
          success: false,
          message: 'Client with this email already exists',
        };
      }

      // Verify assigned lawyer exists
      const lawyer = await this.prisma.user.findUnique({
        where: { id: clientData.assignedLawyerId },
      });

      if (!lawyer) {
        return {
          success: false,
          message: 'Assigned lawyer not found',
        };
      }

      const client = await this.prisma.client.create({
        data: {
          name: clientData.name,
          email: clientData.email,
          phoneNumber: clientData.phoneNumber,
          address: clientData.address,
          clientType: clientData.clientType,
          industry: clientData.industry,
          description: clientData.description,
          status: clientData.status || 'ACTIVE',
          assignedLawyerId: clientData.assignedLawyerId,
        },
        include: {
          assignedLawyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      this.logger.info(`Created client ${client.id} by user ${userId}`);

      return {
        success: true,
        message: 'Client created successfully',
        data: { client },
      };
    } catch (error) {
      this.logger.error('Create client failed:', error);
      return {
        success: false,
        message: 'Failed to create client',
      };
    }
  }

  /**
   * ✏️ UPDATE CLIENT
   */
  async updateClient(updateData: ClientUpdateData, userId: string) {
    try {
      const { id, ...data } = updateData;

      // Check if client exists and user has access
      const existingClient = await this.prisma.client.findFirst({
        where: {
          id,
          OR: [
            { assignedLawyerId: userId },
            { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
          ],
        },
      });

      if (!existingClient) {
        return {
          success: false,
          message: 'Client not found or access denied',
        };
      }

      // Check email uniqueness if email is being updated
      if (data.email && data.email !== existingClient.email) {
        const emailExists = await this.prisma.client.findUnique({
          where: { email: data.email },
        });

        if (emailExists) {
          return {
            success: false,
            message: 'Client with this email already exists',
          };
        }
      }

      // Prepare update data
      const updateFields: any = {};

      if (data.name) updateFields.name = data.name;
      if (data.email) updateFields.email = data.email;
      if (data.phoneNumber !== undefined) updateFields.phoneNumber = data.phoneNumber;
      if (data.address !== undefined) updateFields.address = data.address;
      if (data.clientType) updateFields.clientType = data.clientType;
      if (data.industry !== undefined) updateFields.industry = data.industry;
      if (data.description !== undefined) updateFields.description = data.description;
      if (data.status) updateFields.status = data.status;
      if (data.assignedLawyerId) updateFields.assignedLawyerId = data.assignedLawyerId;

      updateFields.updatedAt = new Date();

      const client = await this.prisma.client.update({
        where: { id },
        data: updateFields,
        include: {
          assignedLawyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      this.logger.info(`Updated client ${id} by user ${userId}`);

      return {
        success: true,
        message: 'Client updated successfully',
        data: { client },
      };
    } catch (error) {
      this.logger.error('Update client failed:', error);
      return {
        success: false,
        message: 'Failed to update client',
      };
    }
  }

  /**
   * 🗑️ DELETE CLIENT
   */
  async deleteClient(clientId: string, userId: string) {
    try {
      // Check if client exists and user has access
      const existingClient = await this.prisma.client.findFirst({
        where: {
          id: clientId,
          OR: [
            { assignedLawyerId: userId },
            { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
          ],
        },
      });

      if (!existingClient) {
        return {
          success: false,
          message: 'Client not found or access denied',
        };
      }

      // Check if client has active contracts/matters
      const [activeContracts, activeMatters, activeDisputes] = await Promise.all([
        this.prisma.contract.count({
          where: { clientId, status: { in: ['APPROVED', 'EXECUTED'] } },
        }),
        this.prisma.matter.count({ where: { clientId, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
        this.prisma.dispute.count({
          where: { clientId, status: { in: ['OPEN', 'DISCOVERY', 'MEDIATION'] } },
        }),
      ]);

      if (activeContracts > 0 || activeMatters > 0 || activeDisputes > 0) {
        return {
          success: false,
          message: 'Cannot delete client with active contracts, matters, or disputes',
        };
      }

      // Delete client (this will cascade to related records if configured)
      await this.prisma.client.delete({
        where: { id: clientId },
      });

      this.logger.info(`Deleted client ${clientId} by user ${userId}`);

      return {
        success: true,
        message: 'Client deleted successfully',
      };
    } catch (error) {
      this.logger.error('Delete client failed:', error);
      return {
        success: false,
        message: 'Failed to delete client',
      };
    }
  }

  /**
   * 📊 GET DASHBOARD METRICS
   */
  async getDashboardMetrics(userId: string) {
    try {
      const [totalClients, activeClients, prospectClients, corporateClients, individualClients] =
        await Promise.all([
          this.prisma.client.count({
            where: {
              OR: [
                { assignedLawyerId: userId },
                { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
              ],
            },
          }),
          this.prisma.client.count({
            where: {
              status: 'ACTIVE',
              OR: [
                { assignedLawyerId: userId },
                { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
              ],
            },
          }),
          this.prisma.client.count({
            where: {
              status: 'PROSPECT',
              OR: [
                { assignedLawyerId: userId },
                { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
              ],
            },
          }),
          this.prisma.client.count({
            where: {
              clientType: 'CORPORATION',
              OR: [
                { assignedLawyerId: userId },
                { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
              ],
            },
          }),
          this.prisma.client.count({
            where: {
              clientType: 'INDIVIDUAL',
              OR: [
                { assignedLawyerId: userId },
                { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
              ],
            },
          }),
        ]);

      return {
        success: true,
        data: {
          totalClients,
          activeClients,
          prospectClients,
          corporateClients,
          individualClients,
        },
      };
    } catch (error) {
      this.logger.error('Get dashboard metrics failed:', error);
      return {
        success: false,
        message: 'Failed to retrieve dashboard metrics',
      };
    }
  }

  /**
   * 💰 Helper: Calculate total assets/contract value
   */
  private calculateTotalAssets(client: any): number {
    if (!client.contracts) return 0;
    return client.contracts.reduce((total: number, contract: any) => {
      return total + (contract.value || 0);
    }, 0);
  }

  /**
   * 🎯 Helper: Calculate risk score
   */
  private calculateRiskScore(client: any): number {
    let riskScore = 0;

    // Base score from status
    if (client.status === 'INACTIVE') riskScore += 20;
    else if (client.status === 'PROSPECT') riskScore += 10;

    // Industry risk factors
    const highRiskIndustries = ['FINANCE', 'HEALTHCARE', 'ENERGY', 'GOVERNMENT'];
    if (client.industry && highRiskIndustries.includes(client.industry)) {
      riskScore += 15;
    }

    // Contract-based risk
    if (client._count?.disputes > 0) riskScore += 25;
    if (client._count?.contracts > 10) riskScore += 10;

    return Math.min(riskScore, 100); // Cap at 100
  }

  /**
   * 📅 Helper: Get last activity date
   */
  private getLastActivity(client: any): Date {
    const dates = [];

    if (client.contracts?.length > 0) {
      dates.push(...client.contracts.map((c: any) => new Date(c.createdAt)));
    }

    if (client.matters?.length > 0) {
      dates.push(...client.matters.map((m: any) => new Date(m.createdAt)));
    }

    dates.push(new Date(client.updatedAt));

    return dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : client.updatedAt;
  }

  /**
   * 🧹 Cleanup
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

export const realClientService = new RealClientService();
