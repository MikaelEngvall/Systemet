import React, { useState } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { Key, Apartment, Tenant } from '../../types';

interface KeyFormProps {
  onSubmit: (data: Omit<Key, 'id'> & { selectedApartmentId?: string; selectedTenantId?: string }) => void;
  initialData?: Key;
  buttonText?: string;
  readOnly?: boolean;
}

export function KeyForm({ onSubmit, initialData, buttonText = 'Save', readOnly = false }: KeyFormProps) {
  const { items: apartments } = useDatabase<Apartment>('apartments');
  const { items: tenants } = useDatabase<Tenant>('tenants');

  const [formData, setFormData] = useState<Omit<Key, 'id'>>({
    type: initialData?.type || '',
    number: initialData?.number || '',
    amount: initialData?.amount || 1,
    apartmentId: initialData?.apartmentId,
    tenantId: initialData?.tenantId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readOnly) {
      onSubmit({
        ...formData,
        selectedApartmentId: formData.apartmentId,
        selectedTenantId: formData.tenantId
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (readOnly) return;
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value === '' ? undefined : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Key Type</label>
          <input
            type="text"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Key Number</label>
          <input
            type="text"
            name="number"
            value={formData.number}
            onChange={handleChange}
            required
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="1"
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Assigned to Apartment</label>
          <select
            name="apartmentId"
            value={formData.apartmentId || ''}
            onChange={handleChange}
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
          >
            <option value="">Select an apartment</option>
            {apartments.map(apartment => (
              <option key={apartment.id} value={apartment.id}>
                {apartment.street} {apartment.number}, Apt {apartment.apartmentNumber}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Assigned to Tenant</label>
          <select
            name="tenantId"
            value={formData.tenantId || ''}
            onChange={handleChange}
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
          >
            <option value="">Select a tenant</option>
            {tenants.map(tenant => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.firstName} {tenant.lastName} - {tenant.personalNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-brand-light dark:bg-brand-dark text-white px-4 py-2 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {buttonText}
          </button>
        </div>
      )}
    </form>
  );
}