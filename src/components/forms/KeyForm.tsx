import React, { useState } from 'react';
import { useDatabase } from '../../hooks/useDatabase';  // Custom hook to interact with the database
import { Key, Apartment, Tenant } from '../../types';  // TypeScript types for Key, Apartment, and Tenant

// Define the properties (props) the KeyForm component will accept
interface KeyFormProps {
  onSubmit: (data: Omit<Key, 'id'> & { selectedApartmentId?: string; selectedTenantId?: string }) => void;
  initialData?: Key;  // Initial data for editing an existing key
  buttonText?: string;  // Text for the submit button
  readOnly?: boolean;  // If true, the form will be in read-only mode (no editing)
}

export function KeyForm({ onSubmit, initialData, buttonText = 'Save', readOnly = false }: KeyFormProps) {
  // Fetch apartments and tenants data using the custom hook
  const { items: apartments } = useDatabase<Apartment>('apartments');  // Get all apartments
  const { items: tenants } = useDatabase<Tenant>('tenants');  // Get all tenants

  // Initialize the form data with either the initial data or empty values
  const [formData, setFormData] = useState<Omit<Key, 'id'>>({
    type: initialData?.type || '',  // Key type (e.g., door, mailbox)
    number: initialData?.number || '',  // Key number or identifier
    amount: initialData?.amount || 1,  // Number of keys available
    apartmentId: initialData?.apartmentId,  // ID of the associated apartment
    tenantId: initialData?.tenantId,  // ID of the associated tenant
  });

  // Handle form submission: prevent default behavior, check if read-only, then call onSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // Prevent form from refreshing the page on submit
    if (!readOnly) {  // If the form is not in read-only mode
      onSubmit({
        ...formData,  // Include all the form data
        selectedApartmentId: formData.apartmentId,  // Include selected apartment ID
        selectedTenantId: formData.tenantId,  // Include selected tenant ID
      });
    }
  };

  // Handle changes in input fields: update form data state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (readOnly) return;  // If read-only, prevent any changes to form data
    const { name, value, type } = e.target;  // Get the name and value of the changed input
    setFormData(prev => ({
      ...prev,  // Copy previous form data
      [name]: type === 'number' ? parseInt(value) : value === '' ? undefined : value,  // Handle number inputs and empty strings
    }));
  };

  // Render the form with various inputs and select fields
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {/* Key Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Key Type</label>
          <input
            type="text"
            name="type"  // Input for key type
            value={formData.type}  // Bind input value to formData
            onChange={handleChange}  // Handle change in input
            required
            disabled={readOnly}  // Disable if form is in read-only mode
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}  // Change styling if read-only
          />
        </div>

        {/* Key Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Key Number</label>
          <input
            type="text"
            name="number"  // Input for key number
            value={formData.number}  // Bind input value to formData
            onChange={handleChange}  // Handle change in input
            required
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}  // Change styling if read-only
          />
        </div>

        {/* Amount of Keys */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Amount</label>
          <input
            type="number"
            name="amount"  // Input for number of keys available
            value={formData.amount}  // Bind input value to formData
            onChange={handleChange}  // Handle change in input
            required
            min="1"  // Amount must be at least 1
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}  // Change styling if read-only
          />
        </div>

        {/* Assigned Apartment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Assigned to Apartment</label>
          <select
            name="apartmentId"  // Dropdown for selecting an apartment
            value={formData.apartmentId || ''}  // Bind selected apartment ID to formData
            onChange={handleChange}  // Handle change in selection
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}  // Change styling if read-only
          >
            <option value="">Select an apartment</option>  // Default option when no apartment is selected
            {apartments.map(apartment => (
              <option key={apartment.id} value={apartment.id}>
                {apartment.street} {apartment.number}, Apt {apartment.apartmentNumber}
              </option>  // List apartments with street, number, and apartment number
            ))}
          </select>
        </div>

        {/* Assigned Tenant */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Assigned to Tenant</label>
          <select
            name="tenantId"  // Dropdown for selecting a tenant
            value={formData.tenantId || ''}  // Bind selected tenant ID to formData
            onChange={handleChange}  // Handle change in selection
            disabled={readOnly}
            className={readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''}  // Change styling if read-only
          >
            <option value="">Select a tenant</option>  // Default option when no tenant is selected
            {tenants.map(tenant => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.firstName} {tenant.lastName} - {tenant.personalNumber}
              </option>  // List tenants with their names and personal number
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button (Only visible when form is not read-only) */}
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
