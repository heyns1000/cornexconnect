import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

interface BanimalConfig {
  workerUrl: string;
  enabled: boolean;
  timeout: number;
}

class BanimalConnector {
  private config: BanimalConfig;
  private signalActive: boolean = false;
  
  constructor() {
    this.config = {
      workerUrl: process.env.BANIMAL_WORKER_URL || 'https://banimal.faa.zone',
      enabled: process.env.BANIMAL_ENABLED === 'true',
      timeout: parseInt(process.env.BANIMAL_TIMEOUT || '5000')
    };
  }

  /**
   * Establish continuous signal connection (uninterrupted)
   */
  async initializeSignal(): Promise<void> {
    if (!this.config.enabled) {
      console.log('⚠️  Banimal connector disabled');
      return;
    }

    try {
      const response = await axios.get(`${this.config.workerUrl}/api/health`, {
        timeout: this.config.timeout
      });
      
      if (response.data.status === 'ok') {
        this.signalActive = true;
        console.log('✅ Banimal signal established - uninterrupted connection active');
        console.log(`🌐 Connected to: ${this.config.workerUrl}`);
      }
    } catch (error) {
      console.error('❌ Banimal signal failed:', error instanceof Error ? error.message : 'Unknown error');
      this.signalActive = false;
    }
  }

  /**
   * Middleware to relay requests through banimal connector
   */
  relay() {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Only relay if signal is active and path matches banimal routes
      if (!this.signalActive || !req.path.startsWith('/api/banimal/')) {
        return next();
      }

      try {
        // Extract the actual route path (remove /api/banimal prefix)
        const banimalPath = req.path.replace('/api/banimal', '/api');
        const url = `${this.config.workerUrl}${banimalPath}`;

        // Relay request to banimal worker
        const response = await axios({
          method: req.method,
          url,
          data: req.body,
          params: req.query,
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-From': 'cornexconnect',
            'X-Signal-Type': 'uninterrupted'
          },
          timeout: this.config.timeout
        });

        // Return banimal response
        return res.status(response.status).json(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return res.status(error.response.status).json(error.response.data);
        }
        
        console.error('Banimal relay error:', error);
        return res.status(500).json({
          error: 'Banimal connector relay failed',
          signal_active: this.signalActive
        });
      }
    };
  }

  /**
   * Sync brands from banimal to cornexconnect SKUs
   */
  async syncBrandsToSKUs(): Promise<{ success: boolean; synced: number; errors: any[] }> {
    if (!this.signalActive) {
      return { success: false, synced: 0, errors: ['Signal not active'] };
    }

    try {
      const response = await axios.get(`${this.config.workerUrl}/api/brands`, {
        params: { limit: 1000 },
        timeout: this.config.timeout * 2
      });

      const brands = response.data.brands || [];
      const synced: any[] = [];
      const errors: any[] = [];

      // TODO: Map brands to SKUs and sync with cornexconnect database
      // This would involve calling cornexconnect's SKU creation endpoint
      // For now, just return the count
      
      return {
        success: true,
        synced: brands.length,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        synced: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get signal status for monitoring
   */
  getStatus() {
    return {
      signal_active: this.signalActive,
      worker_url: this.config.workerUrl,
      enabled: this.config.enabled,
      type: 'uninterrupted',
      connector: 'banimal'
    };
  }

  /**
   * Webhook receiver for banimal brand updates
   */
  createWebhookHandler() {
    return async (req: Request, res: Response) => {
      try {
        const brandData = req.body;
        
        // TODO: Process brand webhook and sync to cornexconnect
        // This would involve:
        // 1. Validate brand data
        // 2. Map to SKU format
        // 3. Create/update SKU in cornexconnect database
        // 4. Update inventory counts
        
        console.log('📡 Received brand webhook:', brandData);
        
        res.json({
          success: true,
          message: 'Brand webhook received',
          signal_type: 'uninterrupted'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };
  }
}

// Export singleton instance
export const banimalConnector = new BanimalConnector();
