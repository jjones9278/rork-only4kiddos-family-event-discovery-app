// MailerLite API service for Only4kiddos family event app
const MAILERLITE_API_BASE = 'https://connect.mailerlite.com/api';

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

class MailerLiteService {
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
  }

  /**
   * Subscribe a user to MailerLite
   */
  async subscribeUser(subscriber: MailerLiteSubscriber): Promise<MailerLiteResponse> {
    try {
      const response = await fetch(`${MAILERLITE_API_BASE}/subscribers`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(subscriber),
      });

      const data = await response.json();

      if (response.ok) {
        return { data };
      } else {
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
      },
    });
  }

  /**
   * Subscribe to premium member updates
   */
  async subscribeToPremiumUpdates(email: string, name?: string): Promise<MailerLiteResponse> {
    return this.subscribeUser({
      email,
      name,
      fields: {
        subscription_type: 'premium_member',
        member_type: 'premium',
        app_source: 'only4kiddos',
      },
    });
  }

  /**
   * Update subscriber information
   */
  async updateSubscriber(
    subscriberId: string, 
    updates: Partial<MailerLiteSubscriber>
  ): Promise<MailerLiteResponse> {
    try {
      const response = await fetch(`${MAILERLITE_API_BASE}/subscribers/${subscriberId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        return { data };
      } else {
        return { 
          error: data.message || 'Failed to update subscriber',
          message: data.errors?.[0]?.message || 'Unknown error' 
        };
      }
    } catch (error) {
      console.error('MailerLite update error:', error);
      return { 
        error: 'Network error', 
        message: 'Unable to update subscription' 
      };
    }
  }

  /**
   * Get all subscriber groups
   */
  async getGroups(): Promise<MailerLiteResponse> {
    try {
      const response = await fetch(`${MAILERLITE_API_BASE}/groups`, {
        headers: this.headers,
      });

      const data = await response.json();

      if (response.ok) {
        return { data: data.data || [] };
      } else {
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

// Singleton instance
let mailerLiteService: MailerLiteService | null = null;

export const initializeMailerLite = (apiKey: string) => {
  mailerLiteService = new MailerLiteService(apiKey);
  return mailerLiteService;
};

export const getMailerLiteService = (): MailerLiteService => {
  if (!mailerLiteService) {
    throw new Error('MailerLite service not initialized. Call initializeMailerLite first.');
  }
  return mailerLiteService;
};

export default MailerLiteService;