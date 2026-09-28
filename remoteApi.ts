import type { Franchise, Service, Project, Payment, Payout, AppSettings, NotificationItem } from '../types/database';

export type RemoteTables = {
  Franchises: Franchise[];
  Services: Service[];
  Projects: Project[];
  Payments: Payment[];
  Payouts: Payout[];
  Settings: { key: string; value: string }[];
  Notifications: NotificationItem[];
};

const API_URL = (import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '').trim();

export function isRemoteBackendConfigured(): boolean {
  return API_URL.length > 0;
}

export async function remoteCall<T = unknown>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  if (!API_URL) throw new Error('VITE_GOOGLE_APPS_SCRIPT_URL is not configured.');
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await response.json();
  if (!response.ok || data.ok === false) throw new Error(data.error || 'Google Apps Script request failed.');
  return data as T;
}

export async function bootstrapRemoteDatabase(): Promise<RemoteTables> {
  const result = await remoteCall<{ data: RemoteTables }>('bootstrap');
  return result.data;
}
