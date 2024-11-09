export interface Tenant {
  id?: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  personalNumber: string;
  apartmentId?: number;
  moveInDate?: string;
  resiliationDate?: string;
}

export interface Apartment {
  id?: number;
  street: string;
  number: string;
  apartmentNumber: string;
  floor: string;
  postalCode: string;
  city: string;
  tenantId?: number;
}

export interface Key {
  id?: number;
  type: string;
  number: string;
  amount: number;
  apartmentId?: number;
  tenantId?: number;
}
export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'superuser' | 'admin' | 'maintenance' | 'viewer';
  createdAt?: string;
}