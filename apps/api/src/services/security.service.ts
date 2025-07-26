import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

export interface TwoFactorAuth {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
  qrCode?: string;
  verified: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: TwoFactorAuth;
  sessionSettings: {
    timeout: number; // in minutes
    maxConcurrentSessions: number;
    requireReauth: boolean;
  };
  ipWhitelist: string[];
  deviceTrust: {
    enabled: boolean;
    trustedDevices: {
      id: string;
      name: string;
      fingerprint: string;
      lastUsed: Date;
      trusted: boolean;
    }[];
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
  };
  auditLog: {
    loginAttempts: {
      timestamp: Date;
      ipAddress: string;
      userAgent: string;
      success: boolean;
      failureReason?: string;
    }[];
    securityEvents: {
      id: string;
      type: string;
      description: string;
      timestamp: Date;
      severity: 'low' | 'medium' | 'high' | 'critical';
      metadata: Record<string, any>;
    }[];
  };
}

export interface ClientSession {
  id: string;
  clientId: string;
  sessionToken: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  location?: {
    country: string;
    city: string;
    timezone: string;
  };
  security: {
    encrypted: boolean;
    twoFactorVerified: boolean;
    deviceTrusted: boolean;
  };
}

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  tagLength: number;
  saltLength: number;
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  private readonly encryptionConfig: EncryptionConfig = {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
    saltLength: 32,
  };

  constructor(
    @InjectRepository(ClientSession)
    private sessionRepository: Repository<ClientSession>,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
    private jwtService: JwtService
  ) {}

  /**
   * Setup two-factor authentication for client
   */
  async setupTwoFactorAuth(clientId: string): Promise<TwoFactorAuth> {
    try {
      this.logger.log(`Setting up 2FA for client: ${clientId}`);

      // Generate secret for TOTP
      const secret = speakeasy.generateSecret({
        name: `CounselFlow (${clientId})`,
        issuer: 'CounselFlow Legal Platform',
        length: 32,
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      // Generate backup codes
      const backupCodes = this.generateBackupCodes(10);

      const twoFactorAuth: TwoFactorAuth = {
        enabled: false, // Will be enabled after verification
        secret: secret.base32,
        backupCodes: backupCodes.map(code => this.hashBackupCode(code)),
        qrCode,
        verified: false,
      };

      // Store temporarily until verified
      await this.storeTempTwoFactorAuth(clientId, twoFactorAuth);

      // Log security event
      await this.logSecurityEvent(clientId, {
        type: 'two_factor_setup_initiated',
        description: 'Two-factor authentication setup initiated',
        severity: 'medium',
        metadata: { hasBackupCodes: true, backupCodesCount: backupCodes.length },
      });

      this.logger.log(`2FA setup initiated for client: ${clientId}`);

      return {
        ...twoFactorAuth,
        backupCodes, // Return unhashed codes for user to save
      };
    } catch (error) {
      this.logger.error(`Error setting up 2FA for client ${clientId}:`, error);
      throw new HttpException(
        'Failed to setup two-factor authentication',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verify and enable two-factor authentication
   */
  async verifyTwoFactorAuth(
    clientId: string,
    token: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Verifying 2FA for client: ${clientId}`);

      const tempTwoFactorAuth = await this.getTempTwoFactorAuth(clientId);
      if (!tempTwoFactorAuth) {
        throw new HttpException('2FA setup not found', HttpStatus.NOT_FOUND);
      }

      // Verify token
      const verified = speakeasy.totp.verify({
        secret: tempTwoFactorAuth.secret,
        encoding: 'base32',
        token,
        window: 2, // Allow 2 time steps tolerance
      });

      if (!verified) {
        await this.logSecurityEvent(clientId, {
          type: 'two_factor_verification_failed',
          description: 'Two-factor authentication verification failed',
          severity: 'medium',
          metadata: { token: token.substring(0, 2) + '****' },
        });

        return { success: false, message: 'Invalid verification code' };
      }

      // Enable 2FA
      tempTwoFactorAuth.enabled = true;
      tempTwoFactorAuth.verified = true;
      await this.saveTwoFactorAuth(clientId, tempTwoFactorAuth);
      await this.removeTempTwoFactorAuth(clientId);

      // Log security event
      await this.logSecurityEvent(clientId, {
        type: 'two_factor_enabled',
        description: 'Two-factor authentication enabled successfully',
        severity: 'low',
        metadata: { verificationMethod: 'totp' },
      });

      this.logger.log(`2FA enabled for client: ${clientId}`);

      return { success: true, message: 'Two-factor authentication enabled successfully' };
    } catch (error) {
      this.logger.error(`Error verifying 2FA for client ${clientId}:`, error);
      throw new HttpException(
        'Failed to verify two-factor authentication',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create secure session with advanced security features
   */
  async createSecureSession(
    clientId: string,
    deviceInfo: {
      fingerprint: string;
      ipAddress: string;
      userAgent: string;
      location?: { country: string; city: string; timezone: string };
    },
    twoFactorVerified: boolean = false
  ): Promise<ClientSession> {
    try {
      this.logger.log(`Creating secure session for client: ${clientId}`);

      // Check if device is trusted
      const deviceTrusted = await this.isDeviceTrusted(clientId, deviceInfo.fingerprint);

      // Generate secure session token
      const sessionToken = this.generateSecureToken();
      const sessionId = crypto.randomUUID();

      // Set session expiration
      const sessionTimeout = await this.getSessionTimeout(clientId);
      const expiresAt = new Date(Date.now() + sessionTimeout * 60 * 1000);

      const session: ClientSession = {
        id: sessionId,
        clientId,
        sessionToken,
        deviceFingerprint: deviceInfo.fingerprint,
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
        createdAt: new Date(),
        lastActivity: new Date(),
        expiresAt,
        isActive: true,
        location: deviceInfo.location,
        security: {
          encrypted: true,
          twoFactorVerified,
          deviceTrusted,
        },
      };

      // Store session
      await this.sessionRepository.save(session);

      // Clean up old sessions if limit exceeded
      await this.enforceSessionLimits(clientId);

      // Log security event
      await this.logSecurityEvent(clientId, {
        type: 'session_created',
        description: 'New secure session created',
        severity: 'low',
        metadata: {
          sessionId,
          deviceTrusted,
          twoFactorVerified,
          ipAddress: deviceInfo.ipAddress,
          location: deviceInfo.location,
        },
      });

      // If device is not trusted, send notification
      if (!deviceTrusted) {
        await this.sendNewDeviceNotification(clientId, deviceInfo);
      }

      this.logger.log(`Secure session created for client: ${clientId}, session: ${sessionId}`);

      return session;
    } catch (error) {
      this.logger.error(`Error creating secure session for client ${clientId}:`, error);
      throw new HttpException('Failed to create secure session', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Encrypt sensitive data
   */
  async encryptData(
    data: string,
    key?: Buffer
  ): Promise<{
    encrypted: string;
    key: string;
    iv: string;
    tag: string;
  }> {
    try {
      const encryptionKey = key || crypto.randomBytes(this.encryptionConfig.keyLength);
      const iv = crypto.randomBytes(this.encryptionConfig.ivLength);

      const cipher = crypto.createCipher(this.encryptionConfig.algorithm, encryptionKey);
      cipher.setAAD(Buffer.from('CounselFlow-Security'));

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      return {
        encrypted,
        key: encryptionKey.toString('hex'),
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
      };
    } catch (error) {
      this.logger.error('Error encrypting data:', error);
      throw new HttpException('Encryption failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decryptData(encryptedData: string, key: string, iv: string, tag: string): Promise<string> {
    try {
      const keyBuffer = Buffer.from(key, 'hex');
      const ivBuffer = Buffer.from(iv, 'hex');
      const tagBuffer = Buffer.from(tag, 'hex');

      const decipher = crypto.createDecipher(this.encryptionConfig.algorithm, keyBuffer);
      decipher.setAAD(Buffer.from('CounselFlow-Security'));
      decipher.setAuthTag(tagBuffer);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Error decrypting data:', error);
      throw new HttpException('Decryption failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Validate session security
   */
  async validateSession(sessionToken: string): Promise<ClientSession | null> {
    try {
      const session = await this.sessionRepository.findOne({
        where: { sessionToken, isActive: true },
      });

      if (!session) {
        return null;
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        await this.invalidateSession(session.id);
        return null;
      }

      // Update last activity
      session.lastActivity = new Date();
      await this.sessionRepository.save(session);

      return session;
    } catch (error) {
      this.logger.error('Error validating session:', error);
      return null;
    }
  }

  /**
   * Get security settings for client
   */
  async getSecuritySettings(clientId: string): Promise<SecuritySettings> {
    try {
      this.logger.log(`Fetching security settings for client: ${clientId}`);

      const twoFactorAuth = await this.getTwoFactorAuth(clientId);
      const sessionSettings = await this.getSessionSettings(clientId);
      const ipWhitelist = await this.getIpWhitelist(clientId);
      const deviceTrust = await this.getDeviceTrust(clientId);
      const passwordPolicy = await this.getPasswordPolicy(clientId);
      const auditLog = await this.getAuditLog(clientId);

      return {
        twoFactorAuth,
        sessionSettings,
        ipWhitelist,
        deviceTrust,
        passwordPolicy,
        auditLog,
      };
    } catch (error) {
      this.logger.error(`Error fetching security settings for client ${clientId}:`, error);
      throw new HttpException(
        'Failed to fetch security settings',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(
    clientId: string,
    settings: Partial<SecuritySettings>
  ): Promise<SecuritySettings> {
    try {
      this.logger.log(`Updating security settings for client: ${clientId}`);

      // Validate settings
      await this.validateSecuritySettings(settings);

      // Update settings in database
      await this.saveSecuritySettings(clientId, settings);

      // Log security event
      await this.logSecurityEvent(clientId, {
        type: 'security_settings_updated',
        description: 'Security settings updated',
        severity: 'medium',
        metadata: { updatedFields: Object.keys(settings) },
      });

      // Get updated settings
      return await this.getSecuritySettings(clientId);
    } catch (error) {
      this.logger.error(`Error updating security settings for client ${clientId}:`, error);
      throw new HttpException(
        'Failed to update security settings',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Perform security audit
   */
  async performSecurityAudit(clientId: string): Promise<{
    score: number;
    recommendations: string[];
    vulnerabilities: {
      level: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
    }[];
    lastAudit: Date;
  }> {
    try {
      this.logger.log(`Performing security audit for client: ${clientId}`);

      const settings = await this.getSecuritySettings(clientId);
      const sessions = await this.getActiveSessions(clientId);

      let score = 100;
      const recommendations: string[] = [];
      const vulnerabilities: any[] = [];

      // Check 2FA
      if (!settings.twoFactorAuth.enabled) {
        score -= 30;
        vulnerabilities.push({
          level: 'high',
          description: 'Two-factor authentication is disabled',
          recommendation: 'Enable two-factor authentication for enhanced security',
        });
      }

      // Check password policy
      if (settings.passwordPolicy.minLength < 8) {
        score -= 15;
        vulnerabilities.push({
          level: 'medium',
          description: 'Weak password policy',
          recommendation: 'Increase minimum password length to at least 8 characters',
        });
      }

      // Check session security
      if (settings.sessionSettings.timeout > 60) {
        score -= 10;
        vulnerabilities.push({
          level: 'medium',
          description: 'Long session timeout',
          recommendation: 'Reduce session timeout to 60 minutes or less',
        });
      }

      // Check for suspicious sessions
      const suspiciousSessions = sessions.filter(s => !s.security.deviceTrusted);
      if (suspiciousSessions.length > 0) {
        score -= 5 * suspiciousSessions.length;
        vulnerabilities.push({
          level: 'medium',
          description: `${suspiciousSessions.length} untrusted device(s) with active sessions`,
          recommendation: 'Review and revoke access for untrusted devices',
        });
      }

      // Generate recommendations
      if (score < 80) {
        recommendations.push('Enable all security features to improve your security score');
      }
      if (!settings.deviceTrust.enabled) {
        recommendations.push('Enable device trust to track and manage device access');
      }
      if (settings.ipWhitelist.length === 0) {
        recommendations.push('Consider setting up IP whitelist for additional security');
      }

      const auditResult = {
        score: Math.max(0, score),
        recommendations,
        vulnerabilities,
        lastAudit: new Date(),
      };

      // Log security audit
      await this.logSecurityEvent(clientId, {
        type: 'security_audit_performed',
        description: 'Security audit completed',
        severity: score < 70 ? 'high' : score < 85 ? 'medium' : 'low',
        metadata: auditResult,
      });

      this.logger.log(`Security audit completed for client: ${clientId}, score: ${score}`);

      return auditResult;
    } catch (error) {
      this.logger.error(`Error performing security audit for client ${clientId}:`, error);
      throw new HttpException('Failed to perform security audit', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Private helper methods

  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  private hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async isDeviceTrusted(clientId: string, fingerprint: string): Promise<boolean> {
    // Implementation for checking device trust
    return false;
  }

  private async getSessionTimeout(clientId: string): Promise<number> {
    // Implementation for getting session timeout
    return 60; // Default 60 minutes
  }

  private async enforceSessionLimits(clientId: string): Promise<void> {
    // Implementation for enforcing session limits
  }

  private async sendNewDeviceNotification(clientId: string, deviceInfo: any): Promise<void> {
    // Implementation for sending new device notification
  }

  private async invalidateSession(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, { isActive: false });
  }

  private async logSecurityEvent(clientId: string, event: any): Promise<void> {
    // Implementation for logging security events
  }

  private async storeTempTwoFactorAuth(clientId: string, auth: TwoFactorAuth): Promise<void> {
    // Implementation for storing temporary 2FA data
  }

  private async getTempTwoFactorAuth(clientId: string): Promise<TwoFactorAuth | null> {
    // Implementation for getting temporary 2FA data
    return null;
  }

  private async saveTwoFactorAuth(clientId: string, auth: TwoFactorAuth): Promise<void> {
    // Implementation for saving 2FA data
  }

  private async removeTempTwoFactorAuth(clientId: string): Promise<void> {
    // Implementation for removing temporary 2FA data
  }

  private async getTwoFactorAuth(clientId: string): Promise<TwoFactorAuth> {
    // Implementation for getting 2FA settings
    return { enabled: false, verified: false };
  }

  private async getSessionSettings(clientId: string): Promise<any> {
    // Implementation for getting session settings
    return {
      timeout: 60,
      maxConcurrentSessions: 5,
      requireReauth: false,
    };
  }

  private async getIpWhitelist(clientId: string): Promise<string[]> {
    // Implementation for getting IP whitelist
    return [];
  }

  private async getDeviceTrust(clientId: string): Promise<any> {
    // Implementation for getting device trust settings
    return {
      enabled: false,
      trustedDevices: [],
    };
  }

  private async getPasswordPolicy(clientId: string): Promise<any> {
    // Implementation for getting password policy
    return {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expirationDays: 90,
    };
  }

  private async getAuditLog(clientId: string): Promise<any> {
    // Implementation for getting audit log
    return {
      loginAttempts: [],
      securityEvents: [],
    };
  }

  private async validateSecuritySettings(settings: Partial<SecuritySettings>): Promise<void> {
    // Implementation for validating security settings
  }

  private async saveSecuritySettings(
    clientId: string,
    settings: Partial<SecuritySettings>
  ): Promise<void> {
    // Implementation for saving security settings
  }

  private async getActiveSessions(clientId: string): Promise<ClientSession[]> {
    return await this.sessionRepository.find({
      where: { clientId, isActive: true },
    });
  }
}
