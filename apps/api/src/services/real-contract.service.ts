/**
 * 📄 REAL CONTRACT SERVICE IMPLEMENTATION
 * =====================================
 * Fully functional contract management with database operations
 */

import { PrismaClient } from '@prisma/client';
import winston from 'winston';

interface ContractData {
  title: string;
  description?: string;
  type: string;
  status?: string;
  value?: number;
  currency?: string;
  startDate: string;
  endDate?: string;
  terminationDate?: string;
  renewalTerms?: string;
  riskLevel?: string;
  priority?: string;
  tags?: string;
  clientId: string;
  assignedLawyerId: string;
}

interface ContractUpdateData extends Partial<ContractData> {
  id: string;
}

interface ContractQueryOptions {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  clientId?: string;
  assignedLawyerId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class RealContractService {
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
        new winston.transports.File({ filename: 'logs/contract-service.log' }),
        new winston.transports.Console(),
      ],
    });
  }

  /**
   * 📋 GET ALL CONTRACTS
   */
  async getAllContracts(userId: string, options: ContractQueryOptions = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        type,
        clientId,
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

      if (status) where.status = status;
      if (type) where.type = type;
      if (clientId) where.clientId = clientId;
      if (assignedLawyerId) where.assignedLawyerId = assignedLawyerId;

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { client: { name: { contains: search, mode: 'insensitive' } } },
        ];
      }

      // Get contracts with related data
      const [contracts, total] = await Promise.all([
        this.prisma.contract.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                clientType: true,
              },
            },
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
                documents: true,
              },
            },
          },
        }),
        this.prisma.contract.count({ where }),
      ]);

      // Calculate additional metrics
      const contractsWithMetrics = contracts.map(contract => ({
        ...contract,
        daysUntilExpiry: contract.endDate ? this.calculateDaysUntilExpiry(contract.endDate) : null,
        isNearExpiry: contract.endDate ? this.isNearExpiry(contract.endDate) : false,
        computedRiskLevel: this.calculateRiskLevel(contract),
      }));

      this.logger.info(`Retrieved ${contracts.length} contracts for user ${userId}`);

      return {
        success: true,
        data: {
          contracts: contractsWithMetrics,
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
      this.logger.error('Get contracts failed:', error);
      return {
        success: false,
        message: 'Failed to retrieve contracts',
      };
    }
  }

  /**
   * 📄 GET CONTRACT BY ID
   */
  async getContractById(contractId: string, userId: string) {
    try {
      const contract = await this.prisma.contract.findFirst({
        where: {
          id: contractId,
          OR: [
            { assignedLawyerId: userId },
            { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
          ],
        },
        include: {
          client: true,
          assignedLawyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          documents: {
            select: {
              id: true,
              fileName: true,
              originalName: true,
              fileSize: true,
              mimeType: true,
              category: true,
              type: true,
              createdAt: true,
            },
          },
          aiAnalyses: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      if (!contract) {
        return {
          success: false,
          message: 'Contract not found or access denied',
        };
      }

      // Add calculated fields
      const enrichedContract = {
        ...contract,
        daysUntilExpiry: contract.endDate ? this.calculateDaysUntilExpiry(contract.endDate) : null,
        isNearExpiry: contract.endDate ? this.isNearExpiry(contract.endDate) : false,
        computedRiskLevel: this.calculateRiskLevel(contract),
      };

      this.logger.info(`Retrieved contract ${contractId} for user ${userId}`);

      return {
        success: true,
        data: { contract: enrichedContract },
      };
    } catch (error) {
      this.logger.error('Get contract by ID failed:', error);
      return {
        success: false,
        message: 'Failed to retrieve contract',
      };
    }
  }

  /**
   * ➕ CREATE NEW CONTRACT
   */
  async createContract(contractData: ContractData, userId: string) {
    try {
      // Validate dates if provided
      const startDate = new Date(contractData.startDate);
      let endDate: Date | null = null;

      if (contractData.endDate) {
        endDate = new Date(contractData.endDate);
        if (endDate <= startDate) {
          return {
            success: false,
            message: 'End date must be after start date',
          };
        }
      }

      // Verify client and lawyer exist
      const [client, lawyer] = await Promise.all([
        this.prisma.client.findUnique({ where: { id: contractData.clientId } }),
        this.prisma.user.findUnique({ where: { id: contractData.assignedLawyerId } }),
      ]);

      if (!client) {
        return {
          success: false,
          message: 'Client not found',
        };
      }

      if (!lawyer) {
        return {
          success: false,
          message: 'Assigned lawyer not found',
        };
      }

      const contract = await this.prisma.contract.create({
        data: {
          title: contractData.title,
          description: contractData.description,
          type: contractData.type,
          status: contractData.status || 'DRAFT',
          value: contractData.value,
          currency: contractData.currency || 'USD',
          startDate: startDate,
          endDate: endDate,
          terminationDate: contractData.terminationDate
            ? new Date(contractData.terminationDate)
            : null,
          renewalTerms: contractData.renewalTerms,
          riskLevel: contractData.riskLevel || 'LOW',
          priority: contractData.priority || 'MEDIUM',
          tags: contractData.tags,
          clientId: contractData.clientId,
          assignedLawyerId: contractData.assignedLawyerId,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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

      this.logger.info(`Created contract ${contract.id} by user ${userId}`);

      return {
        success: true,
        message: 'Contract created successfully',
        data: { contract },
      };
    } catch (error) {
      this.logger.error('Create contract failed:', error);
      return {
        success: false,
        message: 'Failed to create contract',
      };
    }
  }

  /**
   * ✏️ UPDATE CONTRACT
   */
  async updateContract(updateData: ContractUpdateData, userId: string) {
    try {
      const { id, ...data } = updateData;

      // Check if contract exists and user has access
      const existingContract = await this.prisma.contract.findFirst({
        where: {
          id,
          OR: [
            { assignedLawyerId: userId },
            { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
          ],
        },
      });

      if (!existingContract) {
        return {
          success: false,
          message: 'Contract not found or access denied',
        };
      }

      // Validate dates if provided
      if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        if (endDate <= startDate) {
          return {
            success: false,
            message: 'End date must be after start date',
          };
        }
      }

      // Prepare update data
      const updateFields: any = {};

      if (data.title) updateFields.title = data.title;
      if (data.description !== undefined) updateFields.description = data.description;
      if (data.type) updateFields.type = data.type;
      if (data.status) updateFields.status = data.status;
      if (data.value !== undefined) updateFields.value = data.value;
      if (data.currency) updateFields.currency = data.currency;
      if (data.startDate) updateFields.startDate = new Date(data.startDate);
      if (data.endDate) updateFields.endDate = new Date(data.endDate);
      if (data.terminationDate) updateFields.terminationDate = new Date(data.terminationDate);
      if (data.renewalTerms !== undefined) updateFields.renewalTerms = data.renewalTerms;
      if (data.riskLevel) updateFields.riskLevel = data.riskLevel;
      if (data.priority) updateFields.priority = data.priority;
      if (data.tags !== undefined) updateFields.tags = data.tags;
      if (data.clientId) updateFields.clientId = data.clientId;
      if (data.assignedLawyerId) updateFields.assignedLawyerId = data.assignedLawyerId;

      updateFields.updatedAt = new Date();

      const contract = await this.prisma.contract.update({
        where: { id },
        data: updateFields,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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

      this.logger.info(`Updated contract ${id} by user ${userId}`);

      return {
        success: true,
        message: 'Contract updated successfully',
        data: { contract },
      };
    } catch (error) {
      this.logger.error('Update contract failed:', error);
      return {
        success: false,
        message: 'Failed to update contract',
      };
    }
  }

  /**
   * 🗑️ DELETE CONTRACT
   */
  async deleteContract(contractId: string, userId: string) {
    try {
      // Check if contract exists and user has access
      const existingContract = await this.prisma.contract.findFirst({
        where: {
          id: contractId,
          OR: [
            { assignedLawyerId: userId },
            { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
          ],
        },
      });

      if (!existingContract) {
        return {
          success: false,
          message: 'Contract not found or access denied',
        };
      }

      // Delete contract (this will cascade to related records if configured)
      await this.prisma.contract.delete({
        where: { id: contractId },
      });

      this.logger.info(`Deleted contract ${contractId} by user ${userId}`);

      return {
        success: true,
        message: 'Contract deleted successfully',
      };
    } catch (error) {
      this.logger.error('Delete contract failed:', error);
      return {
        success: false,
        message: 'Failed to delete contract',
      };
    }
  }

  /**
   * 📊 GET DASHBOARD METRICS
   */
  async getDashboardMetrics(userId: string) {
    try {
      const [totalContracts, activeContracts, expiringContracts, draftContracts, contractValue] =
        await Promise.all([
          this.prisma.contract.count({
            where: {
              OR: [
                { assignedLawyerId: userId },
                { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
              ],
            },
          }),
          this.prisma.contract.count({
            where: {
              status: 'ACTIVE',
              OR: [
                { assignedLawyerId: userId },
                { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
              ],
            },
          }),
          this.prisma.contract.count({
            where: {
              endDate: {
                gte: new Date(),
                lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              },
              OR: [
                { assignedLawyerId: userId },
                { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
              ],
            },
          }),
          this.prisma.contract.count({
            where: {
              status: 'DRAFT',
              OR: [
                { assignedLawyerId: userId },
                { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
              ],
            },
          }),
          this.prisma.contract.aggregate({
            where: {
              OR: [
                { assignedLawyerId: userId },
                { assignedLawyer: { role: { in: ['ADMIN', 'PARTNER'] } } },
              ],
            },
            _sum: {
              value: true,
            },
          }),
        ]);

      return {
        success: true,
        data: {
          totalContracts,
          activeContracts,
          expiringContracts,
          draftContracts,
          totalValue: contractValue._sum.value || 0,
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
   * 📅 Helper: Calculate days until expiry
   */
  private calculateDaysUntilExpiry(endDate: Date): number {
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * ⚠️ Helper: Check if contract is near expiry
   */
  private isNearExpiry(endDate: Date): boolean {
    const daysUntilExpiry = this.calculateDaysUntilExpiry(endDate);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }

  /**
   * 🎯 Helper: Calculate risk level
   */
  private calculateRiskLevel(contract: any): 'LOW' | 'MEDIUM' | 'HIGH' {
    let riskScore = 0;

    // Check expiry
    const daysUntilExpiry = this.calculateDaysUntilExpiry(contract.endDate);
    if (daysUntilExpiry <= 7) riskScore += 3;
    else if (daysUntilExpiry <= 30) riskScore += 2;
    else if (daysUntilExpiry <= 90) riskScore += 1;

    // Check compliance score
    if (contract.complianceScore && contract.complianceScore < 70) riskScore += 2;
    else if (contract.complianceScore && contract.complianceScore < 85) riskScore += 1;

    // Check status
    if (contract.status === 'UNDER_REVIEW') riskScore += 1;
    else if (contract.status === 'DISPUTED') riskScore += 3;

    if (riskScore >= 4) return 'HIGH';
    if (riskScore >= 2) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * 🧹 Cleanup
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

export const realContractService = new RealContractService();
