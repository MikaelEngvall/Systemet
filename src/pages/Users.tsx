import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Modal } from '../components/modals/Modal';
import { UserForm } from '../components/forms/UserForm';
import { useDatabase } from '../hooks/useDatabase';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types';

function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { items: users, insertItem, updateItem, deleteItem } = useDatabase<User>('users');
  const { user: currentUser } = useAuth();

  const handleAddUser = async (data: Omit<User, 'id' | 'createdAt'>) => {
    try {
      await insertItem({
        ...data,
        createdAt: new Date().toISOString(),
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user. Email might already be in use.');
    }
  };

  const handleEditUser = async (data: Omit<User, 'id' | 'createdAt'>) => {
    if (editingUser?.id) {
      try {
        await updateItem(editingUser.id, {
          ...editingUser,
          ...data,
          createdAt: editingUser.createdAt,
        });
        setEditingUser(null);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error updating user:', error);
        alert('Failed to update user. Email might already be in use.');
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteItem(id);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user.');
      }
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-brand-light dark:bg-brand-dark text-white px-4 py-2 rounded-md hover:opacity-90 transition-colors flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-brand-light dark:bg-brand-dark text-white">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {currentUser?.id !== user.id && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setIsModalOpen(true);
                          }}
                          className="text-brand-light dark:text-brand-dark hover:opacity-80"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
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
          setEditingUser(null);
        }}
        title={editingUser ? 'Edit User' : 'Add User'}
      >
        <UserForm
          onSubmit={editingUser ? handleEditUser : handleAddUser}
          initialData={editingUser || undefined}
          buttonText={editingUser ? 'Update' : 'Add'}
        />
      </Modal>
    </div>
  );
}

export default Users;