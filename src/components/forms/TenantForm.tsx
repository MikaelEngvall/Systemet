import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useDatabase } from '../../hooks/useDatabase';
import { Tenant, Apartment, Key } from '../../types';

interface TenantFormProps {
  onSubmit: (data: Omit<Tenant, 'id'> & { selectedKeyIds?: string[] }) => void;
  initialData?: Tenant;
  buttonText?: string;
  readOnly?: boolean;
}

export function TenantForm({ onSubmit, initialData, buttonText = 'Save', readOnly = false }: TenantFormProps) {
  const { items: apartments } = useDatabase<Apartment>('apartments');
  const { items: keys } = useDatabase<Key>('keys');

  const [formData, setFormData] = useState<Omit<Tenant, 'id'>>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    phoneNumber: initialData?.phoneNumber || '',
    email: initialData?.email || '',
    personalNumber: initialData?.personalNumber || '',
    moveInDate: initialData?.moveInDate || '',
    resiliationDate: initialData?.resiliationDate || '',
    apartmentId: initialData?.apartmentId,
  });

  const [selectedKeyIds, setSelectedKeyIds] = useState<string[]>(
    keys.filter(key => key.tenantId === initialData?.id).map(key => key.id!) || []
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
    !key.tenantId || key.tenantId === initialData?.id
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={readOnly}
              className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
            />
            {readOnly && (
              <a
                href={`mailto:${formData.email}`}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-light dark:text-brand-dark hover:opacity-80"
              >
                <Mail className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Personal Number</label>
          <input
            type="text"
            name="personalNumber"
            value={formData.personalNumber}
            onChange={handleChange}
            required
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Move-in Date</label>
          <input
            type="date"
            name="moveInDate"
            value={formData.moveInDate}
            onChange={handleChange}
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Resiliation Date</label>
          <input
            type="date"
            name="resiliationDate"
            value={formData.resiliationDate}
            onChange={handleChange}
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Assign Apartment</label>
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