import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users, Key } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Modal } from '../components/modals/Modal';
import { ApartmentForm } from '../components/forms/ApartmentForm';
import { useDatabase } from '../hooks/useDatabase';
import { useAuth } from '../contexts/AuthContext';
import type { Apartment, Key as KeyType, Tenant } from '../types';

export default function Apartments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [viewingApartment, setViewingApartment] = useState<Apartment | null>(null);
  const { items: apartments, insertItem, updateItem, deleteItem } = useDatabase<Apartment>('apartments');
  const { items: keys } = useDatabase<KeyType>('keys');
  const { items: tenants, updateItem: updateTenant } = useDatabase<Tenant>('tenants');
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const id = hash.replace('#apartment-', '');
      const element = document.getElementById(`apartment-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        element.classList.add('bg-yellow-50', 'dark:bg-yellow-900/20');
        setTimeout(() => {
          element.classList.remove('bg-yellow-50', 'dark:bg-yellow-900/20');
        }, 3000);
      }
    }
  }, [location.hash]);

  const handleAddApartment = async (data: Omit<Apartment, 'id'>) => {
    const newApartment = await insertItem(data);
    
    // Update tenant if one is assigned
    if (data.tenantId) {
      const tenant = tenants.find(t => t.id === data.tenantId);
      if (tenant) {
        await updateTenant(tenant.id!, { ...tenant, apartmentId: newApartment.id });
      }
    }
    
    setIsModalOpen(false);
  };

  const handleEditApartment = async (data: Omit<Apartment, 'id'>) => {
    if (editingApartment?.id) {
      // If there was a previous tenant, remove the apartment reference
      if (editingApartment.tenantId) {
        const oldTenant = tenants.find(t => t.id === editingApartment.tenantId);
        if (oldTenant) {
          await updateTenant(oldTenant.id!, { ...oldTenant, apartmentId: undefined });
        }
      }

      // Update apartment
      await updateItem(editingApartment.id, data);

      // Update new tenant if one is assigned
      if (data.tenantId) {
        const newTenant = tenants.find(t => t.id === data.tenantId);
        if (newTenant) {
          await updateTenant(newTenant.id!, { ...newTenant, apartmentId: editingApartment.id });
        }
      }

      setEditingApartment(null);
      setIsModalOpen(false);
    }
  };

  const handleDeleteApartment = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this apartment?')) {
      const apartment = apartments.find(a => a.id === id);
      if (apartment?.tenantId) {
        const tenant = tenants.find(t => t.id === apartment.tenantId);
        if (tenant) {
          await updateTenant(tenant.id!, { ...tenant, apartmentId: undefined });
        }
      }
      await deleteItem(id);
    }
  };

  const handleRowClick = (apartment: Apartment) => {
    setViewingApartment(apartment);
    setIsViewModalOpen(true);
  };

  const canEdit = user?.role === 'superuser' || user?.role === 'admin';

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Apartments</h1>
        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-brand-light dark:bg-brand-dark text-white px-4 py-2 rounded-md hover:opacity-90 transition-colors flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Apartment
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Address</th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Links</th>
                {canEdit && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {apartments.map((apartment) => (
                <tr 
                  key={apartment.id} 
                  id={`apartment-${apartment.id}`}
                  onClick={() => handleRowClick(apartment)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {apartment.street} {apartment.number}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {apartment.postalCode} {apartment.city}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      Apt #{apartment.apartmentNumber}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Floor: {apartment.floor}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      {apartment.tenantId && (
                        <Link
                          to={`/tenants#tenant-${apartment.tenantId}`}
                          className="text-brand-light dark:text-brand-dark hover:opacity-80"
                        >
                          <Users className="w-5 h-5" />
                        </Link>
                      )}
                      {keys.some(key => key.apartmentId === apartment.id) && (
                        <Link
                          to={`/keys#keys-for-apartment-${apartment.id}`}
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
                            setEditingApartment(apartment);
                            setIsModalOpen(true);
                          }}
                          className="text-brand-light dark:text-brand-dark hover:opacity-80"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            apartment.id && handleDeleteApartment(apartment.id);
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
          setEditingApartment(null);
        }}
        title={editingApartment ? 'Edit Apartment' : 'Add Apartment'}
      >
        <ApartmentForm
          onSubmit={editingApartment ? handleEditApartment : handleAddApartment}
          initialData={editingApartment || undefined}
          buttonText={editingApartment ? 'Update' : 'Add'}
        />
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingApartment(null);
        }}
        title="Apartment Information"
      >
        {viewingApartment && (
          <ApartmentForm
            initialData={viewingApartment}
            readOnly={true}
            onSubmit={() => {}}
          />
        )}
      </Modal>
    </div>
  );
}