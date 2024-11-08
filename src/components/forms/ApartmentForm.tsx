import React, { useState } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { Apartment, Tenant, Key } from '../../types';

interface ApartmentFormProps {
  onSubmit: (data: Omit<Apartment, 'id'> & { selectedKeyIds?: string[] }) => void;
  initialData?: Apartment;
  buttonText?: string;
  readOnly?: boolean;
}

export function ApartmentForm({ onSubmit, initialData, buttonText = 'Save', readOnly = false }: ApartmentFormProps) {
  const { items: tenants } = useDatabase<Tenant>('tenants');
  const { items: keys } = useDatabase<Key>('keys');

  const [formData, setFormData] = useState<Omit<Apartment, 'id'>>({
    street: initialData?.street || '',
    number: initialData?.number || '',
    apartmentNumber: initialData?.apartmentNumber || '',
    floor: initialData?.floor || '',
    postalCode: initialData?.postalCode || '',
    city: initialData?.city || '',
    tenantId: initialData?.tenantId,
  });

  const [selectedKeyIds, setSelectedKeyIds] = useState<string[]>(
    keys.filter(key => key.apartmentId === initialData?.id).map(key => key.id!) || []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readOnly) {
      onSubmit({ ...formData, selectedKeyIds });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (readOnly) return;
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value,
    }));
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (readOnly) return;
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setSelectedKeyIds(selectedOptions);
  };

  const availableKeys = keys.filter(key => 
    !key.apartmentId || key.apartmentId === initialData?.id
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Street</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            required
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Number</label>
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Apartment Number</label>
          <input
            type="text"
            name="apartmentNumber"
            value={formData.apartmentNumber}
            onChange={handleChange}
            required
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Floor</label>
          <input
            type="text"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            required
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Postal Code</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            required
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Assign Tenant</label>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Assign Keys</label>
          <select
            multiple
            value={selectedKeyIds}
            onChange={handleKeyChange}
            size={4}
            disabled={readOnly}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
          >
            {availableKeys.map(key => (
              <option key={key.id} value={key.id}>
                {key.type} - {key.number} (Amount: {key.amount})
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Hold Ctrl/Cmd to select multiple keys</p>
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