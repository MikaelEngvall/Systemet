import React, { useState } from 'react';
import { Mail } from 'lucide-react';  // Import icon for mail functionality
import { useDatabase } from '../../hooks/useDatabase';  // Custom hook to interact with database
import { Tenant, Apartment, Key } from '../../types';  // Import types for Tenant, Apartment, and Key

// Define the properties (props) the TenantForm component will accept
interface TenantFormProps {
  onSubmit: (data: Omit<Tenant, 'id'> & { selectedKeyIds?: string[] }) => void;
  initialData?: Tenant;  // Initial data for editing an existing tenant
  buttonText?: string;  // Text for the submit button
  readOnly?: boolean;  // If true, the form is in read-only mode (no editing)
}

// Component definition for TenantForm
export function TenantForm({ onSubmit, initialData, buttonText = 'Save', readOnly = false }: TenantFormProps) {
  const { items: apartments } = useDatabase<Apartment>('apartments');  // Fetch apartments from database
  const { items: keys } = useDatabase<Key>('keys');  // Fetch keys from database

  // Initialize form data state with either initial data or default values
  const [formData, setFormData] = useState<Omit<Tenant, 'id'>>({
    firstName: initialData?.firstName || '',  // Tenant's first name
    lastName: initialData?.lastName || '',  // Tenant's last name
    phoneNumber: initialData?.phoneNumber || '',  // Tenant's phone number
    email: initialData?.email || '',  // Tenant's email
    personalNumber: initialData?.personalNumber || '',  // Tenant's personal identification number
    moveInDate: initialData?.moveInDate || '',  // Move-in date for tenant
    resiliationDate: initialData?.resiliationDate || '',  // Resiliation (end of lease) date
    apartmentId: initialData?.apartmentId,  // ID of associated apartment
  });

  // Initialize selected key IDs for assigning keys to tenant
  const [selectedKeyIds, setSelectedKeyIds] = useState<string[]>(
    keys.filter(key => key.tenantId === initialData?.id).map(key => key.id!) || []
  );

  // Handle form submission: prevent default behavior, check if read-only, then call onSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readOnly) {  // Only submit if form is not read-only
      onSubmit({ ...formData, selectedKeyIds });  // Submit form data and selected key IDs
    }
  };

  // Handle changes in input fields: update form data state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (readOnly) return;  // Prevent changes if form is read-only
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value,  // Handle empty strings and set to undefined
    }));
  };

  // Handle changes in key selection: update selectedKeyIds state
  const handleKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (readOnly) return;
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setSelectedKeyIds(selectedOptions);  // Update selected key IDs based on user selection
  };

  // Filter keys to only include those available for assignment to this tenant
  const availableKeys = keys.filter(key => 
    !key.tenantId || key.tenantId === initialData?.id
  );

  // Render the form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tenant's First Name */}
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
        
        {/* Tenant's Last Name */}
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
        
        {/* Tenant's Phone Number */}
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
        
        {/* Tenant's Email */}
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
                <Mail className="w-5 h-5" />  // Icon for sending an email
              </a>
            )}
          </div>
        </div>
        
        {/* Tenant's Personal Number */}
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
        
        {/* Move-in Date */}
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
        
        {/* Resiliation Date */}
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
        {/* Assign Apartment */}
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

        {/* Assign Keys */}
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

      {/* Submit Button (only visible if form is editable) */}
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
