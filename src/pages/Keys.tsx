import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users, Building2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Modal } from '../components/modals/Modal';
import { KeyForm } from '../components/forms/KeyForm';
import { useDatabase } from '../hooks/useDatabase';
import { useAuth } from '../contexts/AuthContext';
import type { Key } from '../types';

export default function Keys() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<Key | null>(null);
  const [viewingKey, setViewingKey] = useState<Key | null>(null);
  const { items: keys, insertItem, updateItem, deleteItem } = useDatabase<Key>('keys');
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const id = hash.replace('#key-', '').replace('keys-for-tenant-', '').replace('keys-for-apartment-', '');
      const elements = document.querySelectorAll(`[id^="key-"][id$="${id}"]`);
      elements.forEach(element => {
        element.scrollIntoView({ behavior: 'smooth' });
        element.classList.add('bg-yellow-50', 'dark:bg-yellow-900/20');
        setTimeout(() => {
          element.classList.remove('bg-yellow-50', 'dark:bg-yellow-900/20');
        }, 3000);
      });
    }
  }, [location.hash]);

  const handleAddKey = async (data: Omit<Key, 'id'>) => {
    await insertItem(data);
    setIsModalOpen(false);
  };

  const handleEditKey = async (data: Omit<Key, 'id'>) => {
    if (editingKey?.id) {
      await updateItem(editingKey.id, data);
      setEditingKey(null);
      setIsModalOpen(false);
    }
  };

  const handleDeleteKey = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this key?')) {
      await deleteItem(id);
    }
  };

  const handleRowClick = (key: Key) => {
    setViewingKey(key);
    setIsViewModalOpen(true);
  };

  const canEdit = user?.role === 'superuser' || user?.role === 'admin';

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Keys</h1>
        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-brand-light dark:bg-brand-dark text-white px-4 py-2 rounded-md hover:opacity-90 transition-colors flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Key
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Key Info</th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Links</th>
                {canEdit && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {keys.map((key) => (
                <tr 
                  key={key.id} 
                  id={`key-${key.id}`}
                  onClick={() => handleRowClick(key)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Type: {key.type}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Number: {key.number}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">
                      Amount: {key.amount}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{key.amount}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      {key.tenantId && (
                        <Link
                          to={`/tenants#tenant-${key.tenantId}`}
                          className="text-brand-light dark:text-brand-dark hover:opacity-80"
                        >
                          <Users className="w-5 h-5" />
                        </Link>
                      )}
                      {key.apartmentId && (
                        <Link
                          to={`/apartments#apartment-${key.apartmentId}`}
                          className="text-brand-light dark:text-brand-dark hover:opacity-80"
                        >
                          <Building2 className="w-5 h-5" />
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
                            setEditingKey(key);
                            setIsModalOpen(true);
                          }}
                          className="text-brand-light dark:text-brand-dark hover:opacity-80"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            key.id && handleDeleteKey(key.id);
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
          setEditingKey(null);
        }}
        title={editingKey ? 'Edit Key' : 'Add Key'}
      >
        <KeyForm
          onSubmit={editingKey ? handleEditKey : handleAddKey}
          initialData={editingKey || undefined}
          buttonText={editingKey ? 'Update' : 'Add'}
        />
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingKey(null);
        }}
        title="Key Information"
      >
        {viewingKey && (
          <KeyForm
            initialData={viewingKey}
            readOnly={true}
            onSubmit={() => {}}
          />
        )}
      </Modal>
    </div>
  );
}