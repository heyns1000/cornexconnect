/**
 * BuildMart Africa - Signal Sync API
 * 
 * Connects BuildMart buyer app to CornexConnect database via Banimal signal
 * NO IP EXPOSURE - All communication through signal uninterrupted
 * 
 * Architecture:
 * BuildMart App → Signal Sync → Banimal Relay → CornexConnect API → Database
 * 
 * Features:
 * - Real-time pricing sync from CornexConnect
 * - Order submission through signal
 * - GRV history retrieval
 * - Inventory verification
 * - No direct IP connections
 */

const SIGNAL_ENDPOINT = process.env.VITE_SIGNAL_ENDPOINT || 'https://banimal.faa.zone/relay/cornexconnect';

interface SignalSyncConfig {
  distributorId: string;
  apiKey: string;
  signalEndpoint: string;
}

class SignalSyncClient {
  private config: SignalSyncConfig;
  private connected: boolean = false;
  
  constructor(config: SignalSyncConfig) {
    this.config = config;
  }

  /**
   * Initialize signal connection (uninterrupted)
   */
  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.signalEndpoint}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Distributor-ID': this.config.distributorId,
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify({
          client: 'buildmart-africa',
          version: '2026.1',
          capabilities: ['pricing', 'orders', 'inventory', 'analytics']
        })
      });

      if (response.ok) {
        this.connected = true;
        console.log('✅ Signal connected: BuildMart Africa → CornexConnect');
        return true;
      }

      throw new Error('Signal connection failed');
    } catch (error) {
      console.error('❌ Signal connection error:', error);
      this.connected = false;
      return false;
    }
  }

  /**
   * Get real-time pricing from CornexConnect database
   */
  async getPricing(productCodes?: string[]): Promise<any[]> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const response = await fetch(`${this.config.signalEndpoint}/api/products/pricing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Distributor-ID': this.config.distributorId,
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify({
          codes: productCodes,
          distributor: 'buildmart-africa',
          currency: 'ZAR'
        })
      });

      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('❌ Pricing sync error:', error);
      return [];
    }
  }

  /**
   * Submit order through signal (Rhino Strike)
   */
  async submitOrder(orderData: any): Promise<{ success: boolean; orderId?: string; error?: string }> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const response = await fetch(`${this.config.signalEndpoint}/api/orders/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Distributor-ID': this.config.distributorId,
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify({
          ...orderData,
          distributor: 'buildmart-africa',
          submittedVia: 'signal-sync',
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Order submitted via signal:', data.orderId);
        return { success: true, orderId: data.orderId };
      }

      return { success: false, error: data.message };
    } catch (error: any) {
      console.error('❌ Order submission error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get GRV history from CornexConnect database
   */
  async getGRVHistory(limit: number = 50): Promise<any[]> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const response = await fetch(`${this.config.signalEndpoint}/api/orders/grv-history`, {
        method: 'GET',
        headers: {
          'X-Distributor-ID': this.config.distributorId,
          'X-API-Key': this.config.apiKey
        }
      });

      const data = await response.json();
      return data.grvs || [];
    } catch (error) {
      console.error('❌ GRV history error:', error);
      return [];
    }
  }

  /**
   * Verify inventory availability
   */
  async verifyInventory(items: { code: string; quantity: number }[]): Promise<{
    available: boolean;
    items: Array<{ code: string; available: number; status: string }>;
  }> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const response = await fetch(`${this.config.signalEndpoint}/api/inventory/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Distributor-ID': this.config.distributorId,
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify({ items })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Inventory verification error:', error);
      return { available: false, items: [] };
    }
  }

  /**
   * Sync analytics data
   */
  async syncAnalytics(analyticsData: any): Promise<boolean> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const response = await fetch(`${this.config.signalEndpoint}/api/analytics/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Distributor-ID': this.config.distributorId,
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify({
          ...analyticsData,
          distributor: 'buildmart-africa',
          timestamp: new Date().toISOString()
        })
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Analytics sync error:', error);
      return false;
    }
  }

  /**
   * Get signal status
   */
  getStatus(): { connected: boolean; endpoint: string } {
    return {
      connected: this.connected,
      endpoint: this.config.signalEndpoint
    };
  }
}

// Export singleton instance
export const signalSync = new SignalSyncClient({
  distributorId: 'buildmart-africa-pty-ltd',
  apiKey: process.env.VITE_CORNEX_API_KEY || 'demo-key-buildmart',
  signalEndpoint: SIGNAL_ENDPOINT
});

// Export types
export type { SignalSyncConfig };
export { SignalSyncClient };
