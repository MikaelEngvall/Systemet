import React, { useState } from 'react';
import { User } from '../../types';  // Import User type
import bcrypt from 'bcryptjs';  // Import bcrypt for password hashing

// Define the properties (props) that the UserForm component will accept
interface UserFormProps {
  onSubmit: (data: Omit<User, 'id' | 'createdAt'>) => void;  // Submit handler to receive data without 'id' or 'createdAt'
  initialData?: User;  // Initial data if editing an existing user
  buttonText?: string;  // Text for the submit button, defaults to 'Save'
}

// Define the UserForm component
export function UserForm({ onSubmit, initialData, buttonText = 'Save' }: UserFormProps) {
  // State for form data with initial values from 'initialData' or default values
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',  // First name of the user
    lastName: initialData?.lastName || '',  // Last name of the user
    email: initialData?.email || '',  // Email address of the user
    password: '',  // Password field, left empty initially
    role: initialData?.role || 'admin',  // User role, default is 'admin'
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const salt = bcrypt.genSaltSync(10);  // Generate a salt for password hashing
    const submitData = {
      ...formData,
      // Hash the password if it's been changed; otherwise, use the existing password
      password: formData.password ? bcrypt.hashSync(formData.password, salt) : initialData?.password || '',
    };
    onSubmit(submitData);  // Submit form data
  };

  // Handle changes in the form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,  // Update the field value in formData
    }));
  };

  // Render the form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* First Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">First Name</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md"
        />
      </div>

      {/* Last Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Last Name</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md"
        />
      </div>

      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md"
        />
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {initialData ? 'New Password (leave empty to keep current)' : 'Password'}
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required={!initialData}  // Required only for new users, not when editing
          minLength={6}  // Minimum password length
          className="mt-1 block w-full rounded-md"
        />
      </div>

      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md"
        >
          {/* Options for different user roles */}
          <option value="superuser">Superuser</option>
          <option value="admin">Admin</option>
          <option value="maintenance">Maintenance</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-brand-light dark:bg-brand-dark text-white px-4 py-2 rounded-md hover:opacity-90"
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
}
