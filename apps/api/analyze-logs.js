#!/usr/bin/env node
/**
 * Enhanced Log Analysis Script for CounselFlow API
 * Analyzes structured JSON logs for insights and performance monitoring
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(process.cwd(), 'logs');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class LogAnalyzer {
  constructor() {
    this.logData = {
      errors: [],
      apiRequests: [],
      performance: [],
      security: [],
      ai: [],
      database: []
    };
  }

  // Parse a single log line
  parseLogLine(line) {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }

  // Load and parse log file
  loadLogFile(filename) {
    const filePath = path.join(LOGS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`${colors.yellow}⚠️  Log file ${filename} not found${colors.reset}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());

    lines.forEach(line => {
      const entry = this.parseLogLine(line);
      if (!entry) return;

      // Categorize log entries
      if (entry.level === 'error') {
        this.logData.errors.push(entry);
      }
      
      if (entry.type === 'api_request') {
        this.logData.apiRequests.push(entry);
      }
      
      if (entry.type === 'performance') {
        this.logData.performance.push(entry);
      }
      
      if (entry.type === 'security') {
        this.logData.security.push(entry);
      }
      
      if (entry.type === 'ai_operation') {
        this.logData.ai.push(entry);
      }
      
      if (entry.type === 'database') {
        this.logData.database.push(entry);
      }
    });
  }

  // Generate performance summary
  generatePerformanceSummary() {
    const apiResponses = this.logData.apiRequests.filter(req => req.responseTime);
    
    if (apiResponses.length === 0) {
      return { avgResponseTime: 0, slowestEndpoints: [], totalRequests: 0 };
    }

    const responseTimes = apiResponses.map(req => req.responseTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    
    // Find slowest endpoints
    const endpointTimes = {};
    apiResponses.forEach(req => {
      const endpoint = `${req.method} ${req.url}`;
      if (!endpointTimes[endpoint]) {
        endpointTimes[endpoint] = [];
      }
      endpointTimes[endpoint].push(req.responseTime);
    });

    const slowestEndpoints = Object.entries(endpointTimes)
      .map(([endpoint, times]) => ({
        endpoint,
        avgTime: times.reduce((a, b) => a + b, 0) / times.length,
        calls: times.length
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    return {
      avgResponseTime: Math.round(avgResponseTime),
      slowestEndpoints,
      totalRequests: apiResponses.length
    };
  }

  // Generate error analysis
  generateErrorAnalysis() {
    const errorsByType = {};
    this.logData.errors.forEach(error => {
      const key = error.message || 'Unknown Error';
      errorsByType[key] = (errorsByType[key] || 0) + 1;
    });

    return {
      totalErrors: this.logData.errors.length,
      errorsByType: Object.entries(errorsByType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    };
  }

  // Generate AI operations summary
  generateAISummary() {
    const aiByProvider = {};
    let totalDuration = 0;
    let count = 0;

    this.logData.ai.forEach(op => {
      aiByProvider[op.provider] = (aiByProvider[op.provider] || 0) + 1;
      if (op.duration) {
        totalDuration += op.duration;
        count++;
      }
    });

    return {
      totalOperations: this.logData.ai.length,
      avgDuration: count > 0 ? Math.round(totalDuration / count) : 0,
      providerUsage: aiByProvider
    };
  }

  // Print colored output
  printSection(title, content, color = colors.blue) {
    console.log(`\n${color}${colors.bright}${title}${colors.reset}`);
    console.log('─'.repeat(title.length));
    console.log(content);
  }

  // Generate full report
  generateReport() {
    console.log(`${colors.cyan}${colors.bright}📊 CounselFlow API Log Analysis Report${colors.reset}`);
    console.log(`${colors.magenta}Generated: ${new Date().toISOString()}${colors.reset}\n`);

    // Performance Summary
    const perf = this.generatePerformanceSummary();
    this.printSection('🚀 PERFORMANCE METRICS', 
      `• Total API Requests: ${colors.green}${perf.totalRequests}${colors.reset}
• Average Response Time: ${colors.green}${perf.avgResponseTime}ms${colors.reset}
• Slowest Endpoints:
${perf.slowestEndpoints.map(ep => 
  `  ${colors.yellow}${ep.endpoint}${colors.reset}: ${ep.avgTime}ms (${ep.calls} calls)`
).join('\n')}`, colors.green);

    // Error Analysis
    const errors = this.generateErrorAnalysis();
    this.printSection('🚨 ERROR ANALYSIS', 
      `• Total Errors: ${colors.red}${errors.totalErrors}${colors.reset}
• Top Error Types:
${errors.errorsByType.map(([error, count]) => 
  `  ${colors.red}${error}${colors.reset}: ${count} occurrences`
).join('\n')}`, colors.red);

    // AI Operations
    const ai = this.generateAISummary();
    this.printSection('🤖 AI OPERATIONS', 
      `• Total AI Operations: ${colors.cyan}${ai.totalOperations}${colors.reset}
• Average Duration: ${colors.cyan}${ai.avgDuration}ms${colors.reset}
• Provider Usage:
${Object.entries(ai.providerUsage).map(([provider, count]) => 
  `  ${colors.cyan}${provider}${colors.reset}: ${count} operations`
).join('\n')}`, colors.cyan);

    // Security Events
    this.printSection('🔒 SECURITY EVENTS', 
      `• Security Events Logged: ${colors.yellow}${this.logData.security.length}${colors.reset}
${this.logData.security.length > 0 ? 
  '• Recent Events:\n' + this.logData.security.slice(-5).map(event => 
    `  ${colors.yellow}${event.timestamp}${colors.reset}: ${event.event}`
  ).join('\n') : '• No security events detected'}`, colors.yellow);

    // Database Operations
    this.printSection('💾 DATABASE OPERATIONS', 
      `• Total DB Operations: ${colors.magenta}${this.logData.database.length}${colors.reset}
${this.logData.database.length > 0 ? 
  '• Recent Operations:\n' + this.logData.database.slice(-5).map(op => 
    `  ${colors.magenta}${op.operation}${colors.reset} on ${op.table}: ${op.duration || 'N/A'}ms`
  ).join('\n') : '• No database operations logged'}`, colors.magenta);

    console.log(`\n${colors.green}✅ Log analysis complete!${colors.reset}`);
    console.log(`${colors.blue}📁 Logs directory: ${LOGS_DIR}${colors.reset}\n`);
  }

  // Main analysis function
  analyze() {
    console.log(`${colors.cyan}🔍 Analyzing CounselFlow API logs...${colors.reset}\n`);

    // Load all log files
    const logFiles = ['combined.log', 'error.log', 'api.log', 'performance.log'];
    logFiles.forEach(file => this.loadLogFile(file));

    this.generateReport();
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new LogAnalyzer();
  analyzer.analyze();
}

module.exports = LogAnalyzer;
