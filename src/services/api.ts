import { Device, Customer, User, RepairLog } from '../types';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      // Not a JSON error
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export const api = {
  auth: {
    login: (credentials: any) => request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  },
  users: {
    list: () => request<User[]>('/users'),
    create: (data: any) => request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request<void>(`/users/${id}`, {
      method: 'DELETE',
    }),
  },
  customers: {
    list: () => request<Customer[]>('/customers'),
    create: (data: any) => request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
  devices: {
    list: () => request<Device[]>('/devices'),
    create: (data: any) => request<Device>('/devices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => request<Device>(`/devices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    getLogs: (id: string) => request<RepairLog[]>(`/devices/${id}/logs`),
    upload: (name: string, type: string, base64: string) => request<{ url: string; name: string }>('/upload', {
      method: 'POST',
      body: JSON.stringify({ name, type, base64 }),
    }),
  },
  supportRequests: {
    create: (data: any) => request<any>('/support-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
};
