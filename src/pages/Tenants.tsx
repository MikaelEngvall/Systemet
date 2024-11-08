import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Building2, Key, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Modal } from '../components/modals/Modal';
import { TenantForm } from '../components/forms/TenantForm';
import { useDatabase } from '../hooks/useDatabase';
import { useAuth } from '../contexts/AuthContext';
import type { Tenant, Key as KeyType } from '../types';

export default function Tenants() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);
  const { items: tenants, insertItem, updateItem, deleteItem } = useDatabase<Tenant>('tenants');
  const { items: keys } = useDatabase<KeyType>('keys');
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const id = hash.replace('#tenant-', '');
      const element = document.getElementById(`tenant-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        element.classList.add('bg-yellow-50', 'dark:bg-yellow-900/20');
        setTimeout(() => {
          element.classList.remove('bg-yellow-50', 'dark:bg-yellow-900/20');
        }, 3000);
      }
    }
  }, [location.hash]);

  const handleAddTenant = async (data: Omit<Tenant, 'id'>) => {
    await insertItem(data);
    setIsModalOpen(false);
  };

  const handleEditTenant = async (data: Omit<Tenant, 'id'>) => {
    if (editingTenant?.id) {
      await updateItem(editingTenant.id, data);
      setEditingTenant(null);
      setIsModalOpen(false);
    }
  };

  const handleDeleteTenant = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      await deleteItem(id);
    }
  };

  const handleRowClick = (tenant: Tenant) => {
    setViewingTenant(tenant);
    setIsViewModalOpen(true);
  };

  const canEdit = user?.role === 'superuser' || user?.role === 'admin';

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tenants</h1>
        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-brand-light dark:bg-brand-dark text-white px-4 py-2 rounded-md hover:opacity-90 transition-colors flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Tenant
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Links</th>
                {canEdit && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tenants.map((tenant) => (
                <tr 
                  key={tenant.id} 
                  id={`tenant-${tenant.id}`}
                  onClick={() => handleRowClick(tenant)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {tenant.firstName} {tenant.lastName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">
                      {tenant.phoneNumber}<br />
                      {tenant.email}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{tenant.phoneNumber}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      {tenant.email}
                      <a
                        href={`mailto:${tenant.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="ml-2 text-brand-light dark:text-brand-dark hover:opacity-80"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      Move-in: {tenant.moveInDate}
                    </div>
                    {tenant.resiliationDate && (
                      <div className="text-sm text-red-500">
                        Resiliation: {tenant.resiliationDate}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      {tenant.apartmentId && (
                        <Link
                          to={`/apartments#apartment-${tenant.apartmentId}`}
                          className="text-brand-light dark:text-brand-dark hover:opacity-80"
                        >
                          <Building2 className="w-5 h-5" />
                        </Link>
                      )}
                      {keys.some(key => key.tenantId === tenant.id) && (
                        <Link
                          to={`/keys#keys-for-tenant-${tenant.id}`}
                          className="text-brand-light dark:text-brand-dark hover:opacity-80"
                        >
                          <Key className="w-5 h-5" />
                        </Link>
                      )}
                    </div>
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4">
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTenant(tenant);
                            setIsModalOpen(true);
                          }}
                          className="text-brand-light dark:text-brand-dark hover:opacity-80"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            tenant.id && handleDeleteTenant(tenant.id);
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTenant(null);
        }}
        title={editingTenant ? 'Edit Tenant' : 'Add Tenant'}
      >
        <TenantForm
          onSubmit={editingTenant ? handleEditTenant : handleAddTenant}
          initialData={editingTenant || undefined}
          buttonText={editingTenant ? 'Update' : 'Add'}
        />
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingTenant(null);
        }}
        title="Tenant Information"
      >
        {viewingTenant && (
          <TenantForm
            initialData={viewingTenant}
            readOnly={true}
            onSubmit={() => {}}
          />
        )}
      </Modal>
    </div>
  );
}