import { useState, useEffect } from 'react';
import { getAll, add, update, remove, initDatabase } from '../db/database';

export function useDatabase<T extends { id?: string }>(storeName: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Ensure database is initialized before loading data
        await initDatabase();
        const data = await getAll<T>(storeName as any);
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load items'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [storeName]);

  const insertItem = async (data: Omit<T, 'id'>): Promise<T> => {
    try {
      const newItem = await add<T>(storeName as any, data);
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to insert item');
    }
  };

  const updateItem = async (id: string, data: Omit<T, 'id'>): Promise<T> => {
    try {
      const updatedItem = await update(storeName as any, { ...data, id } as any);
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update item');
    }
  };

  const deleteItem = async (id: string): Promise<void> => {
    try {
      await remove(storeName as any, id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete item');
    }
  };

  return {
    items,
    loading,
    error,
    insertItem,
    updateItem,
    deleteItem,
    refresh: async () => {
      try {
        setLoading(true);
        const data = await getAll<T>(storeName as any);
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to refresh items'));
      } finally {
        setLoading(false);
      }
    }
  };
}