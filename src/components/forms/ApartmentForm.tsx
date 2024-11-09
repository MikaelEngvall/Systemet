// Import necessary modules and types from React, custom hooks, and project type definitions
import React, { useState } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { Apartment, Tenant, Key } from '../../types';

// Define the interface for the ApartmentForm component's props
interface ApartmentFormProps {
  onSubmit: (data: Omit<Apartment, 'id'> & { selectedKeyIds?: string[] }) => void; // Function to handle form submission
  initialData?: Apartment; // Initial data to populate the form, if provided
  buttonText?: string; // Optional text for the submit button, defaults to 'Save'
  readOnly?: boolean; // If true, form fields are read-only
}

// ApartmentForm component definition
export function ApartmentForm({ onSubmit, initialData, buttonText = 'Save', readOnly = false }: ApartmentFormProps) {
  // Retrieve tenants and keys from the database using a custom hook
  const { items: tenants } = useDatabase<Tenant>('tenants');
  const { items: keys } = useDatabase<Key>('keys');

  // Define state to manage form data, pre-filled with initial data if available
  const [formData, setFormData] = useState<Omit<Apartment, 'id'>>({
    street: initialData?.street || '',
    number: initialData?.number || '',
    apartmentNumber: initialData?.apartmentNumber || '',
    floor: initialData?.floor || '',
    postalCode: initialData?.postalCode || '',
    city: initialData?.city || '',
    tenantId: initialData?.tenantId,
  });

  // Manage selected key IDs, pre-populated with keys associated with the current apartment if available
  const [selectedKeyIds, setSelectedKeyIds] = useState<string[]>(
    keys.filter(key => key.apartmentId === initialData?.id).map(key => key.id!) || []
  );

  // Handle form submission, passing form data to the onSubmit prop if form is not read-only
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readOnly) {
      onSubmit({ ...formData, selectedKeyIds });
    }
  };

  // Handle changes in text input and select fields, updating form data state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (readOnly) return; // Prevent changes if form is read-only
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value, // Set to undefined if value is empty
    }));
  };

  // Handle key selection changes, allowing multiple selection for assigning keys
  const handleKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (readOnly) return; // Prevent changes if form is read-only
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value); // Get selected values
    setSelectedKeyIds(selectedOptions); // Update selected key IDs state
  };

  // Filter available keys to only show unassigned keys or those assigned to the current apartment
  const availableKeys = keys.filter(key => 
    !key.apartmentId || key.apartmentId === initialData?.id
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Grid layout for main input fields */}
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

      {/* Section for tenant assignment */}
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

        {/* Section for key assignment, allowing multiple selections */}
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

      {/* Submit button, only displayed if form is not read-only */}
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
