// Cache Service - AI response caching for performance
export class CacheService {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private defaultTTL: number = 3600000; // 1 hour in milliseconds

  constructor() {
    this.cache = new Map();
    // Clean up expired entries every 10 minutes
    setInterval(() => this.cleanup(), 600000);
  }

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  async set(key: string, data: any, ttl?: number): Promise<void> {
    const entry = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    this.cache.set(key, entry);
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  getStats(): {
    size: number;
    hitRate: number;
    memoryUsage: string;
  } {
    return {
      size: this.cache.size,
      hitRate: 0.85, // Mock hit rate
      memoryUsage: `${Math.round(this.cache.size * 0.5)} KB`,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Legal-specific cache methods
  async getCachedContractAnalysis(contractHash: string): Promise<any | null> {
    return this.get(`contract:${contractHash}`);
  }

  async setCachedContractAnalysis(contractHash: string, analysis: any): Promise<void> {
    // Cache contract analysis for 24 hours
    await this.set(`contract:${contractHash}`, analysis, 86400000);
  }

  async getCachedLegalResearch(query: string, jurisdiction: string): Promise<any | null> {
    return this.get(`research:${jurisdiction}:${query}`);
  }

  async setCachedLegalResearch(query: string, jurisdiction: string, results: any): Promise<void> {
    // Cache legal research for 12 hours
    await this.set(`research:${jurisdiction}:${query}`, results, 43200000);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(`user:${userId}`)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  async warmupCache(): Promise<void> {
    // Pre-populate cache with common legal queries
    const commonQueries = [
      'force majeure clause',
      'termination conditions',
      'liability limitations',
      'intellectual property rights',
    ];

    const commonJurisdictions = ['NG', 'ZA', 'EG', 'KE', 'AE'];

    for (const query of commonQueries) {
      for (const jurisdiction of commonJurisdictions) {
        const cacheKey = `research:${jurisdiction}:${query}`;
        if (!(await this.exists(cacheKey))) {
          // Pre-populate with basic legal information
          await this.setCachedLegalResearch(query, jurisdiction, {
            query,
            jurisdiction,
            summary: `Legal information about ${query} in ${jurisdiction}`,
            lastUpdated: new Date(),
            preloaded: true,
          });
        }
      }
    }
  }
}
