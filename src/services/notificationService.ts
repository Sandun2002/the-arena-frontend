import apiClient from './apiClient';

export interface AppNotification {
  id: string;
  type: string;
  role_context: 'player' | 'business' | 'system';
  title: string;
  body: string;
  icon: string | null;
  action_url: string | null;
  related_entity_id: string | null;
  related_entity_type: string | null;
  venue_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationFeed {
  items: AppNotification[];
  total: number;
  unread_count: number;
  has_more: boolean;
}

export interface NotificationPreferenceItem {
  notification_type: string;
  push_enabled: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
}

export interface NotificationPreferences {
  mute_player_notifications: boolean;
  preferences: NotificationPreferenceItem[];
}

export interface FetchFeedOptions {
  page?: number;
  page_size?: number;
  role_context?: 'player' | 'business' | 'system';
  unread_only?: boolean;
}

const notificationService = {
  async getFeed(options: FetchFeedOptions = {}): Promise<NotificationFeed> {
    const params = new URLSearchParams();
    if (options.page) params.set('page', String(options.page));
    if (options.page_size) params.set('page_size', String(options.page_size));
    if (options.role_context) params.set('role_context', options.role_context);
    if (options.unread_only) params.set('unread_only', 'true');
    const { data } = await apiClient.get<NotificationFeed>(`/notifications?${params}`);
    return data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get<{ unread_count: number }>('/notifications/unread-count');
    return data.unread_count;
  },

  async markRead(ids: string[]): Promise<void> {
    await apiClient.post('/notifications/mark-read', { ids });
  },

  async markAllRead(role_context?: string): Promise<void> {
    const params = role_context ? `?role_context=${role_context}` : '';
    await apiClient.post(`/notifications/mark-all-read${params}`);
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  async getPreferences(): Promise<NotificationPreferences> {
    const { data } = await apiClient.get<NotificationPreferences>('/notifications/preferences');
    return data;
  },

  async updatePreferences(prefs: NotificationPreferences): Promise<NotificationPreferences> {
    const { data } = await apiClient.put<NotificationPreferences>('/notifications/preferences', prefs);
    return data;
  },

  async getVapidPublicKey(): Promise<{ vapid_public_key: string | null; enabled: boolean }> {
    const { data } = await apiClient.get('/notifications/push/vapid-public-key');
    return data;
  },

  async subscribePush(subscription: PushSubscription, deviceName?: string): Promise<void> {
    const keys = subscription.toJSON().keys;
    await apiClient.post('/notifications/push/subscribe', {
      endpoint: subscription.endpoint,
      p256dh_key: keys?.p256dh ?? '',
      auth_key: keys?.auth ?? '',
      device_name: deviceName,
    });
  },

  async unsubscribePush(endpoint: string): Promise<void> {
    await apiClient.delete('/notifications/push/subscribe', { data: { endpoint } });
  },
};

export default notificationService;
