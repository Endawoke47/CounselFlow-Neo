import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ClientPortalService } from '../services/client-portal.service';
import { SecurityService } from '../services/security.service';

@ApiTags('Client Portal')
@Controller('client-portal')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientPortalController {
  constructor(
    private readonly clientPortalService: ClientPortalService,
    private readonly securityService: SecurityService
  ) {}

  @Get('dashboard/:clientId')
  @ApiOperation({ summary: 'Get client dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboard(@Param('clientId') clientId: string) {
    return await this.clientPortalService.getClientDashboard(clientId);
  }

  @Post('communication/secure')
  @ApiOperation({ summary: 'Create secure communication thread' })
  @ApiResponse({ status: 201, description: 'Secure communication created successfully' })
  async createSecureCommunication(
    @Body()
    body: {
      clientId: string;
      participantIds: string[];
      subject: string;
      initialMessage: string;
      caseId?: string;
    }
  ) {
    return await this.clientPortalService.createSecureCommunication(
      body.clientId,
      body.participantIds,
      body.subject,
      body.initialMessage,
      body.caseId
    );
  }

  @Get('communication/:threadId')
  @ApiOperation({ summary: 'Get communication thread' })
  @ApiResponse({ status: 200, description: 'Communication thread retrieved successfully' })
  async getCommunicationThread(@Param('threadId') threadId: string) {
    // Implementation would fetch communication thread
    return { threadId, messages: [] };
  }

  @Post('communication/:threadId/message')
  @ApiOperation({ summary: 'Send message to communication thread' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async sendMessage(
    @Param('threadId') threadId: string,
    @Body()
    body: {
      senderId: string;
      content: string;
      attachments?: string[];
    }
  ) {
    // Implementation would send message to thread
    return { success: true, messageId: `msg_${Date.now()}` };
  }

  @Post('collaboration/document')
  @ApiOperation({ summary: 'Start document collaboration session' })
  @ApiResponse({ status: 201, description: 'Document collaboration started successfully' })
  async startDocumentCollaboration(
    @Body() body: { clientId: string; documentId: string; participantIds: string[] }
  ) {
    return await this.clientPortalService.startDocumentCollaboration(
      body.clientId,
      body.documentId,
      body.participantIds
    );
  }

  @Get('collaboration/:sessionId')
  @ApiOperation({ summary: 'Get document collaboration session' })
  @ApiResponse({ status: 200, description: 'Collaboration session retrieved successfully' })
  async getCollaborationSession(@Param('sessionId') sessionId: string) {
    // Implementation would fetch collaboration session
    return { sessionId, participants: [], changes: [], comments: [] };
  }

  @Post('collaboration/:sessionId/change')
  @ApiOperation({ summary: 'Submit document change' })
  @ApiResponse({ status: 201, description: 'Change submitted successfully' })
  async submitDocumentChange(
    @Param('sessionId') sessionId: string,
    @Body()
    body: {
      userId: string;
      operation: 'insert' | 'delete' | 'replace';
      position: number;
      content: string;
    }
  ) {
    // Implementation would track document changes
    return { success: true, changeId: `change_${Date.now()}` };
  }

  @Post('collaboration/:sessionId/comment')
  @ApiOperation({ summary: 'Add comment to document' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  async addDocumentComment(
    @Param('sessionId') sessionId: string,
    @Body()
    body: {
      userId: string;
      position: number;
      content: string;
    }
  ) {
    // Implementation would add comment to document
    return { success: true, commentId: `comment_${Date.now()}` };
  }

  @Post('payment/process')
  @ApiOperation({ summary: 'Process client payment' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  async processPayment(@Body() body: { clientId: string; paymentId: string; paymentMethod: any }) {
    return await this.clientPortalService.processPayment(
      body.clientId,
      body.paymentId,
      body.paymentMethod
    );
  }

  @Get('payment-methods/:clientId')
  @ApiOperation({ summary: 'Get client payment methods' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  async getPaymentMethods(@Param('clientId') clientId: string) {
    // Implementation would fetch client payment methods
    return {
      methods: [
        {
          id: 'pm_1',
          type: 'credit_card',
          last4: '4242',
          brand: 'visa',
          isDefault: true,
        },
      ],
    };
  }

  @Post('payment-methods')
  @ApiOperation({ summary: 'Add payment method' })
  @ApiResponse({ status: 201, description: 'Payment method added successfully' })
  async addPaymentMethod(
    @Body() body: { clientId: string; type: 'credit_card' | 'bank_account'; data: any }
  ) {
    // Implementation would add payment method
    return { success: true, methodId: `pm_${Date.now()}` };
  }

  @Delete('payment-methods/:methodId')
  @ApiOperation({ summary: 'Remove payment method' })
  @ApiResponse({ status: 200, description: 'Payment method removed successfully' })
  async removePaymentMethod(@Param('methodId') methodId: string) {
    // Implementation would remove payment method
    return { success: true };
  }

  @Put('portal-config/:clientId')
  @ApiOperation({ summary: 'Configure client portal settings' })
  @ApiResponse({ status: 200, description: 'Portal configuration updated successfully' })
  async configurePortal(@Param('clientId') clientId: string, @Body() config: any) {
    return await this.clientPortalService.configurePortal(clientId, config);
  }

  @Get('analytics/:clientId')
  @ApiOperation({ summary: 'Get client portal analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getPortalAnalytics(
    @Param('clientId') clientId: string,
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    const dateRange = {
      start: new Date(start),
      end: new Date(end),
    };

    return await this.clientPortalService.getPortalAnalytics(clientId, dateRange);
  }

  @Get('notifications/:clientId')
  @ApiOperation({ summary: 'Get client notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getNotifications(
    @Param('clientId') clientId: string,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0'
  ) {
    // Implementation would fetch client notifications
    return {
      notifications: [],
      total: 0,
      unread: 0,
    };
  }

  @Put('notifications/:notificationId/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markNotificationRead(@Param('notificationId') notificationId: string) {
    // Implementation would mark notification as read
    return { success: true };
  }

  @Post('notifications/mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllNotificationsRead(@Body() body: { clientId: string }) {
    // Implementation would mark all notifications as read
    return { success: true };
  }
}

@ApiTags('Security')
@Controller('security')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('settings/:clientId')
  @ApiOperation({ summary: 'Get security settings' })
  @ApiResponse({ status: 200, description: 'Security settings retrieved successfully' })
  async getSecuritySettings(@Param('clientId') clientId: string) {
    return await this.securityService.getSecuritySettings(clientId);
  }

  @Put('settings/:clientId')
  @ApiOperation({ summary: 'Update security settings' })
  @ApiResponse({ status: 200, description: 'Security settings updated successfully' })
  async updateSecuritySettings(@Param('clientId') clientId: string, @Body() settings: any) {
    return await this.securityService.updateSecuritySettings(clientId, settings);
  }

  @Post('2fa/setup/:clientId')
  @ApiOperation({ summary: 'Setup two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA setup initiated successfully' })
  async setup2FA(@Param('clientId') clientId: string) {
    return await this.securityService.setupTwoFactorAuth(clientId);
  }

  @Post('2fa/verify/:clientId')
  @ApiOperation({ summary: 'Verify two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA verified successfully' })
  async verify2FA(@Param('clientId') clientId: string, @Body() body: { token: string }) {
    return await this.securityService.verifyTwoFactorAuth(clientId, body.token);
  }

  @Post('2fa/disable/:clientId')
  @ApiOperation({ summary: 'Disable two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  async disable2FA(@Param('clientId') clientId: string) {
    // Implementation would disable 2FA
    return { success: true };
  }

  @Post('session/create')
  @ApiOperation({ summary: 'Create secure session' })
  @ApiResponse({ status: 201, description: 'Secure session created successfully' })
  async createSecureSession(
    @Body()
    body: {
      clientId: string;
      deviceInfo: {
        fingerprint: string;
        ipAddress: string;
        userAgent: string;
        location?: any;
      };
      twoFactorVerified: boolean;
    }
  ) {
    return await this.securityService.createSecureSession(
      body.clientId,
      body.deviceInfo,
      body.twoFactorVerified
    );
  }

  @Post('session/validate')
  @ApiOperation({ summary: 'Validate session' })
  @ApiResponse({ status: 200, description: 'Session validated successfully' })
  async validateSession(@Body() body: { sessionToken: string }) {
    return await this.securityService.validateSession(body.sessionToken);
  }

  @Delete('session/:sessionId')
  @ApiOperation({ summary: 'Invalidate session' })
  @ApiResponse({ status: 200, description: 'Session invalidated successfully' })
  async invalidateSession(@Param('sessionId') sessionId: string) {
    // Implementation would invalidate session
    return { success: true };
  }

  @Get('audit/:clientId')
  @ApiOperation({ summary: 'Perform security audit' })
  @ApiResponse({ status: 200, description: 'Security audit completed successfully' })
  async performSecurityAudit(@Param('clientId') clientId: string) {
    return await this.securityService.performSecurityAudit(clientId);
  }

  @Post('encrypt')
  @ApiOperation({ summary: 'Encrypt data' })
  @ApiResponse({ status: 200, description: 'Data encrypted successfully' })
  async encryptData(@Body() body: { data: string; key?: string }) {
    const key = body.key ? Buffer.from(body.key, 'hex') : undefined;
    return await this.securityService.encryptData(body.data, key);
  }

  @Post('decrypt')
  @ApiOperation({ summary: 'Decrypt data' })
  @ApiResponse({ status: 200, description: 'Data decrypted successfully' })
  async decryptData(@Body() body: { encryptedData: string; key: string; iv: string; tag: string }) {
    return {
      decrypted: await this.securityService.decryptData(
        body.encryptedData,
        body.key,
        body.iv,
        body.tag
      ),
    };
  }

  @Get('devices/:clientId')
  @ApiOperation({ summary: 'Get trusted devices' })
  @ApiResponse({ status: 200, description: 'Trusted devices retrieved successfully' })
  async getTrustedDevices(@Param('clientId') clientId: string) {
    // Implementation would fetch trusted devices
    return { devices: [] };
  }

  @Post('devices/:clientId/trust')
  @ApiOperation({ summary: 'Trust device' })
  @ApiResponse({ status: 200, description: 'Device trusted successfully' })
  async trustDevice(
    @Param('clientId') clientId: string,
    @Body() body: { deviceFingerprint: string; deviceName: string }
  ) {
    // Implementation would trust device
    return { success: true };
  }

  @Delete('devices/:deviceId')
  @ApiOperation({ summary: 'Remove trusted device' })
  @ApiResponse({ status: 200, description: 'Device removed successfully' })
  async removeTrustedDevice(@Param('deviceId') deviceId: string) {
    // Implementation would remove trusted device
    return { success: true };
  }
}
