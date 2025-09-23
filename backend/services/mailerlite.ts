// Backend MailerLite service for Only4kiddos
// API key is only accessible on the server - never exposed to client

interface MailerLiteSubscriber {
  email: string;
  name?: string;
  groups?: string[];
  fields?: {
    [key: string]: string | number;
  };
}

interface MailerLiteResponse {
  data?: any;
  error?: string;
  message?: string;
}

class BackendMailerLiteService {
  private apiKey: string;
  private baseUrl = 'https://connect.mailerlite.com/api';
  private headers: Record<string, string>;

  constructor() {
    this.apiKey = process.env.MAILERLITE_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('MAILERLITE_API_KEY not found in environment variables');
    }

    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  private isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Subscribe a user to MailerLite
   */
  async subscribeUser(subscriber: MailerLiteSubscriber): Promise<MailerLiteResponse> {
    if (!this.isConfigured()) {
      console.warn('MailerLite not configured - skipping subscription');
      return { 
        error: 'Email service not configured',
        message: 'Email subscription service is currently unavailable' 
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/subscribers`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(subscriber),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('MailerLite subscription successful:', subscriber.email);
        return { data };
      } else {
        console.error('MailerLite subscription failed:', data);
        return { 
          error: data.message || 'Failed to subscribe',
          message: data.errors?.[0]?.message || 'Unknown error' 
        };
      }
    } catch (error) {
      console.error('MailerLite subscription error:', error);
      return { 
        error: 'Network error', 
        message: 'Unable to connect to email service' 
      };
    }
  }

  /**
   * Subscribe to family event updates
   */
  async subscribeToEventUpdates(email: string, name?: string): Promise<MailerLiteResponse> {
    return this.subscribeUser({
      email,
      name,
      fields: {
        subscription_type: 'family_events',
        app_source: 'only4kiddos',
        subscribed_at: new Date().toISOString(),
      },
    });
  }

  /**
   * Subscribe to specific event category updates
   */
  async subscribeToCategory(
    email: string, 
    category: string, 
    name?: string
  ): Promise<MailerLiteResponse> {
    return this.subscribeUser({
      email,
      name,
      fields: {
        subscription_type: 'category_updates',
        preferred_category: category,
        app_source: 'only4kiddos',
        subscribed_at: new Date().toISOString(),
      },
    });
  }

  /**
   * Subscribe to premium member updates
   */
  async subscribeToPremiumUpdates(
    email: string, 
    name?: string
  ): Promise<MailerLiteResponse> {
    return this.subscribeUser({
      email,
      name,
      fields: {
        subscription_type: 'premium_updates',
        app_source: 'only4kiddos',
        subscribed_at: new Date().toISOString(),
      },
    });
  }

  /**
   * Update subscriber information
   */
  async updateSubscriber(
    email: string, 
    updates: Partial<MailerLiteSubscriber>
  ): Promise<MailerLiteResponse> {
    if (!this.isConfigured()) {
      console.warn('MailerLite not configured - skipping update');
      return { 
        error: 'Email service not configured',
        message: 'Email service is currently unavailable' 
      };
    }

    try {
      // First, get the subscriber by email
      const getResponse = await fetch(`${this.baseUrl}/subscribers?filter[email]=${email}`, {
        headers: this.headers,
      });

      if (!getResponse.ok) {
        return { 
          error: 'Subscriber not found',
          message: 'Unable to find subscriber with this email' 
        };
      }

      const getResult = await getResponse.json();
      const subscribers = getResult.data || [];
      
      if (subscribers.length === 0) {
        return { 
          error: 'Subscriber not found',
          message: 'No subscriber found with this email address' 
        };
      }

      const subscriberId = subscribers[0].id;

      // Update the subscriber
      const response = await fetch(`${this.baseUrl}/subscribers/${subscriberId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('MailerLite subscriber updated:', email);
        return { data };
      } else {
        console.error('MailerLite update failed:', data);
        return { 
          error: data.message || 'Failed to update subscriber',
          message: data.errors?.[0]?.message || 'Unknown error' 
        };
      }
    } catch (error) {
      console.error('MailerLite update error:', error);
      return { 
        error: 'Network error', 
        message: 'Unable to connect to email service' 
      };
    }
  }

  /**
   * Get available groups/lists
   */
  async getGroups(): Promise<MailerLiteResponse> {
    if (!this.isConfigured()) {
      console.warn('MailerLite not configured - returning empty groups');
      return { data: [] };
    }

    try {
      const response = await fetch(`${this.baseUrl}/groups`, {
        headers: this.headers,
      });

      const data = await response.json();

      if (response.ok) {
        return { data: data.data || [] };
      } else {
        console.error('MailerLite groups fetch failed:', data);
        return { 
          error: data.message || 'Failed to fetch groups',
          message: 'Unable to retrieve email groups' 
        };
      }
    } catch (error) {
      console.error('MailerLite groups error:', error);
      return { 
        error: 'Network error', 
        message: 'Unable to fetch email groups' 
      };
    }
  }
}

// Create singleton instance
const mailerLiteService = new BackendMailerLiteService();

export { mailerLiteService, type MailerLiteResponse };