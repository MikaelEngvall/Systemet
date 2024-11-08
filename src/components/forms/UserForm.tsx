import React, { useState } from 'react';
import { User } from '../../types';
import bcrypt from 'bcryptjs';

interface UserFormProps {
  onSubmit: (data: Omit<User, 'id' | 'createdAt'>) => void;
  initialData?: User;
  buttonText?: string;
}

export function UserForm({ onSubmit, initialData, buttonText = 'Save' }: UserFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    password: '',
    role: initialData?.role || 'admin',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const salt = bcrypt.genSaltSync(10);
    const submitData = {
      ...formData,
      password: formData.password ? bcrypt.hashSync(formData.password, salt) : initialData?.password || '',
    };
    onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {initialData ? 'New Password (leave empty to keep current)' : 'Password'}
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required={!initialData}
          minLength={6}
          className="mt-1 block w-full rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md"
        >
          <option value="superuser">Superuser</option>
          <option value="admin">Admin</option>
          <option value="maintenance">Maintenance</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
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