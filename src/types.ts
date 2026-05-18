export type UserRole = "admin" | "technician";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export type DeviceStatus = "Menunggu" | "Diproses" | "Selesai" | "Tidak Dapat Diperbaiki";

export interface Device {
  id: string;
  customerId: string;
  customerName: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  damageDescription: string;
  status: DeviceStatus;
  technicianId?: string;
  technicianName?: string;
  entryDate: string;
  exitDate?: string;
  serviceNotes?: string;
  documentation?: string[];
  progress: number;
  updatedAt?: string;
}

export interface RepairLog {
  id: string;
  deviceId: string;
  technicianId: string;
  status: string;
  note: string;
  timestamp: string;
}
