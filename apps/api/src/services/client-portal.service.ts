import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { Client } from '../entities/client.entity';
import { Case } from '../entities/case.entity';
import { Document } from '../entities/document.entity';
import { Message } from '../entities/message.entity';
import { Payment } from '../entities/payment.entity';
import { Notification } from '../entities/notification.entity';
import { ClientSession } from '../entities/client-session.entity';
import { EncryptionService } from './encryption.service';
import { NotificationService } from './notification.service';
import { PaymentService } from './payment.service';

export interface ClientPortalConfig {
  clientId: string;
  firmId: string;
  customization: {
    theme: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    language: string;
  };
  features: {
    messaging: boolean;
    documentSharing: boolean;
    paymentPortal: boolean;
    caseTracking: boolean;
    appointmentScheduling: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    ipWhitelist: string[];
    ssoEnabled: boolean;
  };
}

export interface ClientDashboardData {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    joinDate: Date;
    lastLogin: Date;
  };
  cases: {
    id: string;
    title: string;
    status: string;
    priority: string;
    nextDeadline: Date;
    assignedAttorney: string;
    progress: number;
    lastUpdate: Date;
  }[];
  recentDocuments: {
    id: string;
    name: string;
    type: string;
    uploadDate: Date;
    status: string;
    downloadUrl?: string;
  }[];
  messages: {
    id: string;
    from: string;
    subject: string;
    preview: string;
    timestamp: Date;
    read: boolean;
    priority: string;
  }[];
  payments: {
    id: string;
    amount: number;
    dueDate: Date;
    status: string;
    description: string;
    invoiceUrl?: string;
  }[];
  appointments: {
    id: string;
    title: string;
    date: Date;
    duration: number;
    type: string;
    location: string;
    attorney: string;
    status: string;
  }[];
  notifications: {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    priority: string;
  }[];
}

export interface SecureCommunication {
  id: string;
  threadId: string;
  participants: string[];
  subject: string;
  messages: {
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
    encrypted: boolean;
    attachments: string[];
    readBy: { userId: string; timestamp: Date }[];
  }[];
  encryption: {
    algorithm: string;
    keyId: string;
    iv: string;
  };
  metadata: {
    caseId?: string;
    documentId?: string;
    priority: string;
    tags: string[];
  };
}

export interface DocumentCollaboration {
  id: string;
  documentId: string;
  sessionId: string;
  participants: {
    userId: string;
    role: string;
    permissions: string[];
    cursor: { line: number; column: number };
    selection: { start: number; end: number };
    online: boolean;
    lastSeen: Date;
  }[];
  changes: {
    id: string;
    userId: string;
    timestamp: Date;
    operation: 'insert' | 'delete' | 'replace';
    position: number;
    content: string;
    metadata: Record<string, any>;
  }[];
  comments: {
    id: string;
    userId: string;
    position: number;
    content: string;
    timestamp: Date;
    resolved: boolean;
    replies: {
      id: string;
      userId: string;
      content: string;
      timestamp: Date;
    }[];
  }[];
  version: {
    major: number;
    minor: number;
    patch: number;
    timestamp: Date;
    author: string;
    description: string;
  };
}

@Injectable()
export class ClientPortalService {
  private readonly logger = new Logger(ClientPortalService.name);

  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Case)
    private caseRepository: Repository<Case>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(ClientSession)
    private sessionRepository: Repository<ClientSession>,
    private encryptionService: EncryptionService,
    private notificationService: NotificationService,
    private paymentService: PaymentService,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService
  ) {}

  /**
   * Get comprehensive client dashboard data
   */
  async getClientDashboard(clientId: string): Promise<ClientDashboardData> {
    try {
      this.logger.log(`Fetching dashboard data for client: ${clientId}`);

      const client = await this.clientRepository.findOne({
        where: { id: clientId },
        relations: ['cases', 'documents', 'messages', 'payments', 'appointments', 'notifications'],
      });

      if (!client) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }

      // Get active cases with detailed information
      const cases = await this.caseRepository.find({
        where: { clientId },
        relations: ['assignedAttorney', 'documents', 'tasks'],
        order: { lastUpdate: 'DESC' },
        take: 10,
      });

      // Get recent documents
      const recentDocuments = await this.documentRepository.find({
        where: { clientId },
        order: { uploadDate: 'DESC' },
        take: 20,
      });

      // Get recent messages
      const messages = await this.messageRepository.find({
        where: { recipientId: clientId },
        relations: ['sender'],
        order: { timestamp: 'DESC' },
        take: 50,
      });

      // Get pending payments
      const payments = await this.paymentRepository.find({
        where: { clientId, status: In(['pending', 'overdue']) },
        order: { dueDate: 'ASC' },
        take: 10,
      });

      // Get upcoming appointments
      const appointments = await this.getUpcomingAppointments(clientId);

      // Get recent notifications
      const notifications = await this.notificationRepository.find({
        where: { userId: clientId },
        order: { timestamp: 'DESC' },
        take: 30,
      });

      const dashboardData: ClientDashboardData = {
        client: {
          id: client.id,
          name: `${client.firstName} ${client.lastName}`,
          email: client.email,
          phone: client.phone,
          avatar: client.avatar || '',
          joinDate: client.joinDate,
          lastLogin: client.lastLogin,
        },
        cases: cases.map(c => ({
          id: c.id,
          title: c.title,
          status: c.status,
          priority: c.priority,
          nextDeadline: c.nextDeadline,
          assignedAttorney: c.assignedAttorney?.name || 'Unassigned',
          progress: this.calculateCaseProgress(c),
          lastUpdate: c.lastUpdate,
        })),
        recentDocuments: recentDocuments.map(d => ({
          id: d.id,
          name: d.name,
          type: d.type,
          uploadDate: d.uploadDate,
          status: d.status,
          downloadUrl: d.status === 'approved' ? d.downloadUrl : undefined,
        })),
        messages: messages.map(m => ({
          id: m.id,
          from: m.sender?.name || 'System',
          subject: m.subject,
          preview: m.content.substring(0, 100),
          timestamp: m.timestamp,
          read: m.read,
          priority: m.priority,
        })),
        payments: payments.map(p => ({
          id: p.id,
          amount: p.amount,
          dueDate: p.dueDate,
          status: p.status,
          description: p.description,
          invoiceUrl: p.invoiceUrl,
        })),
        appointments,
        notifications: notifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          timestamp: n.timestamp,
          read: n.read,
          priority: n.priority,
        })),
      };

      // Update last login
      await this.clientRepository.update(clientId, { lastLogin: new Date() });

      // Emit dashboard accessed event
      this.eventEmitter.emit('client.dashboard.accessed', {
        clientId,
        timestamp: new Date(),
      });

      this.logger.log(`Dashboard data fetched successfully for client: ${clientId}`);
      return dashboardData;
    } catch (error) {
      this.logger.error(`Error fetching dashboard data for client ${clientId}:`, error);
      throw new HttpException('Failed to fetch dashboard data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Create secure communication thread
   */
  async createSecureCommunication(
    clientId: string,
    participantIds: string[],
    subject: string,
    initialMessage: string,
    caseId?: string
  ): Promise<SecureCommunication> {
    try {
      this.logger.log(`Creating secure communication for client: ${clientId}`);

      // Encrypt the initial message
      const encryptionKey = await this.encryptionService.generateKey();
      const { encrypted: encryptedMessage, iv } = await this.encryptionService.encrypt(
        initialMessage,
        encryptionKey
      );

      const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const communication: SecureCommunication = {
        id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        threadId,
        participants: [clientId, ...participantIds],
        subject,
        messages: [
          {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            senderId: clientId,
            content: encryptedMessage,
            timestamp: new Date(),
            encrypted: true,
            attachments: [],
            readBy: [{ userId: clientId, timestamp: new Date() }],
          },
        ],
        encryption: {
          algorithm: 'AES-256-GCM',
          keyId: encryptionKey.id,
          iv,
        },
        metadata: {
          caseId,
          priority: 'normal',
          tags: [],
        },
      };

      // Store in database (implement according to your schema)
      await this.saveSecureCommunication(communication);

      // Notify participants
      for (const participantId of participantIds) {
        await this.notificationService.send({
          userId: participantId,
          type: 'message',
          title: 'New Secure Message',
          message: `New message from client in: ${subject}`,
          priority: 'normal',
          metadata: { threadId, caseId },
        });
      }

      // Emit communication created event
      this.eventEmitter.emit('communication.created', {
        threadId,
        clientId,
        participantIds,
        caseId,
      });

      this.logger.log(`Secure communication created: ${threadId}`);
      return communication;
    } catch (error) {
      this.logger.error(`Error creating secure communication:`, error);
      throw new HttpException(
        'Failed to create secure communication',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Start document collaboration session
   */
  async startDocumentCollaboration(
    clientId: string,
    documentId: string,
    participantIds: string[]
  ): Promise<DocumentCollaboration> {
    try {
      this.logger.log(`Starting document collaboration for document: ${documentId}`);

      const document = await this.documentRepository.findOne({
        where: { id: documentId },
        relations: ['client', 'case'],
      });

      if (!document) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }

      // Verify client has access to document
      if (document.clientId !== clientId) {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const collaboration: DocumentCollaboration = {
        id: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        documentId,
        sessionId,
        participants: [
          {
            userId: clientId,
            role: 'client',
            permissions: ['read', 'comment'],
            cursor: { line: 0, column: 0 },
            selection: { start: 0, end: 0 },
            online: true,
            lastSeen: new Date(),
          },
          ...participantIds.map(id => ({
            userId: id,
            role: 'attorney',
            permissions: ['read', 'write', 'comment', 'approve'],
            cursor: { line: 0, column: 0 },
            selection: { start: 0, end: 0 },
            online: false,
            lastSeen: new Date(),
          })),
        ],
        changes: [],
        comments: [],
        version: {
          major: 1,
          minor: 0,
          patch: 0,
          timestamp: new Date(),
          author: clientId,
          description: 'Document collaboration session started',
        },
      };

      // Store collaboration session
      await this.saveDocumentCollaboration(collaboration);

      // Notify participants
      for (const participantId of participantIds) {
        await this.notificationService.send({
          userId: participantId,
          type: 'collaboration',
          title: 'Document Collaboration Invitation',
          message: `Client has invited you to collaborate on: ${document.name}`,
          priority: 'normal',
          metadata: { documentId, sessionId },
        });
      }

      // Emit collaboration started event
      this.eventEmitter.emit('collaboration.started', {
        documentId,
        sessionId,
        clientId,
        participantIds,
      });

      this.logger.log(`Document collaboration started: ${sessionId}`);
      return collaboration;
    } catch (error) {
      this.logger.error(`Error starting document collaboration:`, error);
      throw new HttpException(
        'Failed to start document collaboration',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Process client payment
   */
  async processPayment(
    clientId: string,
    paymentId: string,
    paymentMethod: any
  ): Promise<{ success: boolean; transactionId: string; receipt: any }> {
    try {
      this.logger.log(`Processing payment for client: ${clientId}, payment: ${paymentId}`);

      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId, clientId },
        relations: ['client', 'case'],
      });

      if (!payment) {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }

      if (payment.status !== 'pending') {
        throw new HttpException('Payment already processed', HttpStatus.BAD_REQUEST);
      }

      // Process payment through payment service
      const result = await this.paymentService.processPayment({
        amount: payment.amount,
        currency: payment.currency || 'USD',
        clientId,
        paymentMethod,
        description: payment.description,
        metadata: {
          paymentId,
          caseId: payment.caseId,
          clientName: payment.client.name,
        },
      });

      if (result.success) {
        // Update payment status
        await this.paymentRepository.update(paymentId, {
          status: 'completed',
          transactionId: result.transactionId,
          paidAt: new Date(),
        });

        // Send confirmation notification
        await this.notificationService.send({
          userId: clientId,
          type: 'payment',
          title: 'Payment Confirmed',
          message: `Your payment of $${payment.amount} has been processed successfully.`,
          priority: 'normal',
          metadata: { paymentId, transactionId: result.transactionId },
        });

        // Emit payment processed event
        this.eventEmitter.emit('payment.processed', {
          clientId,
          paymentId,
          amount: payment.amount,
          transactionId: result.transactionId,
        });

        this.logger.log(`Payment processed successfully: ${paymentId}`);
      } else {
        // Update payment status to failed
        await this.paymentRepository.update(paymentId, {
          status: 'failed',
          failureReason: result.error,
        });

        this.logger.error(`Payment failed: ${paymentId}, Error: ${result.error}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error processing payment:`, error);
      throw new HttpException('Failed to process payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Configure client portal settings
   */
  async configurePortal(
    clientId: string,
    config: Partial<ClientPortalConfig>
  ): Promise<ClientPortalConfig> {
    try {
      this.logger.log(`Configuring portal for client: ${clientId}`);

      const client = await this.clientRepository.findOne({
        where: { id: clientId },
        relations: ['firm'],
      });

      if (!client) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }

      const currentConfig = await this.getPortalConfig(clientId);
      const updatedConfig = { ...currentConfig, ...config };

      // Validate configuration
      await this.validatePortalConfig(updatedConfig);

      // Save configuration
      await this.savePortalConfig(clientId, updatedConfig);

      // Emit configuration updated event
      this.eventEmitter.emit('portal.configured', {
        clientId,
        config: updatedConfig,
      });

      this.logger.log(`Portal configured for client: ${clientId}`);
      return updatedConfig;
    } catch (error) {
      this.logger.error(`Error configuring portal:`, error);
      throw new HttpException('Failed to configure portal', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get client portal analytics
   */
  async getPortalAnalytics(clientId: string, dateRange: { start: Date; end: Date }) {
    try {
      this.logger.log(`Fetching portal analytics for client: ${clientId}`);

      const sessions = await this.sessionRepository.find({
        where: {
          clientId,
          createdAt: Between(dateRange.start, dateRange.end),
        },
      });

      const analytics = {
        sessions: {
          total: sessions.length,
          unique: new Set(sessions.map(s => s.sessionId)).size,
          avgDuration: sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length,
        },
        engagement: {
          documentsViewed: await this.getDocumentsViewed(clientId, dateRange),
          messagesExchanged: await this.getMessagesCount(clientId, dateRange),
          paymentsProcessed: await this.getPaymentsCount(clientId, dateRange),
        },
        activity: {
          byHour: await this.getActivityByHour(clientId, dateRange),
          byDay: await this.getActivityByDay(clientId, dateRange),
          topFeatures: await this.getTopFeatures(clientId, dateRange),
        },
        satisfaction: {
          rating: await this.getClientSatisfactionRating(clientId),
          feedback: await this.getClientFeedback(clientId, dateRange),
        },
      };

      return analytics;
    } catch (error) {
      this.logger.error(`Error fetching portal analytics:`, error);
      throw new HttpException('Failed to fetch portal analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Private helper methods

  private calculateCaseProgress(caseEntity: any): number {
    if (!caseEntity.tasks || caseEntity.tasks.length === 0) return 0;
    const completedTasks = caseEntity.tasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / caseEntity.tasks.length) * 100);
  }

  private async getUpcomingAppointments(clientId: string) {
    // Implementation for fetching upcoming appointments
    return [];
  }

  private async saveSecureCommunication(communication: SecureCommunication) {
    // Implementation for saving secure communication
  }

  private async saveDocumentCollaboration(collaboration: DocumentCollaboration) {
    // Implementation for saving document collaboration
  }

  private async getPortalConfig(clientId: string): Promise<ClientPortalConfig> {
    // Implementation for getting portal configuration
    return {} as ClientPortalConfig;
  }

  private async validatePortalConfig(config: ClientPortalConfig) {
    // Implementation for validating portal configuration
  }

  private async savePortalConfig(clientId: string, config: ClientPortalConfig) {
    // Implementation for saving portal configuration
  }

  private async getDocumentsViewed(clientId: string, dateRange: { start: Date; end: Date }) {
    // Implementation for getting documents viewed count
    return 0;
  }

  private async getMessagesCount(clientId: string, dateRange: { start: Date; end: Date }) {
    // Implementation for getting messages count
    return 0;
  }

  private async getPaymentsCount(clientId: string, dateRange: { start: Date; end: Date }) {
    // Implementation for getting payments count
    return 0;
  }

  private async getActivityByHour(clientId: string, dateRange: { start: Date; end: Date }) {
    // Implementation for getting activity by hour
    return [];
  }

  private async getActivityByDay(clientId: string, dateRange: { start: Date; end: Date }) {
    // Implementation for getting activity by day
    return [];
  }

  private async getTopFeatures(clientId: string, dateRange: { start: Date; end: Date }) {
    // Implementation for getting top features
    return [];
  }

  private async getClientSatisfactionRating(clientId: string) {
    // Implementation for getting client satisfaction rating
    return 4.5;
  }

  private async getClientFeedback(clientId: string, dateRange: { start: Date; end: Date }) {
    // Implementation for getting client feedback
    return [];
  }
}
