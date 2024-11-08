import { openDB, DBSchema, IDBPDatabase } from 'idb';
import bcrypt from 'bcryptjs';
import { User, Tenant, Apartment, Key } from '../types';

interface RentalDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string };
  };
  tenants: {
    key: string;
    value: Tenant;
    indexes: { 'by-apartment': string };
  };
  apartments: {
    key: string;
    value: Apartment;
    indexes: { 'by-tenant': string };
  };
  keys: {
    key: string;
    value: Key;
    indexes: { 'by-tenant': string; 'by-apartment': string };
  };
}

let db: IDBPDatabase<RentalDB>;

// Generate a UUID v4 compatible string
const generateId = (): string => {
  const hex = '0123456789abcdef';
  let uuid = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-';
    } else if (i === 14) {
      uuid += '4';
    } else if (i === 19) {
      uuid += hex[(Math.random() * 4) | 8];
    } else {
      uuid += hex[(Math.random() * 16) | 0];
    }
  }
  return uuid;
};

const createDefaultUser = async (db: IDBPDatabase<RentalDB>) => {
  try {
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    
    const existingUsers = await store.count();
    if (existingUsers === 0) {
      const salt = bcrypt.genSaltSync(10);
      const defaultUser: User = {
        id: generateId(),
        email: 'admin@duggals.se',
        password: bcrypt.hashSync('Admin123!', salt),
        firstName: 'Admin',
        lastName: 'User',
        role: 'superuser',
        createdAt: new Date().toISOString(),
      };
      await store.add(defaultUser);
    }
    await tx.done;
  } catch (error) {
    console.error('Error creating default user:', error);
  }
};

export const initDatabase = async () => {
  if (db) return db;

  try {
    // Delete the existing database to start fresh
    await deleteDB();
    
    db = await openDB<RentalDB>('rental-management', 1, {
      upgrade(db) {
        // Create stores in order
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('by-email', 'email', { unique: true });

        const tenantStore = db.createObjectStore('tenants', { keyPath: 'id' });
        tenantStore.createIndex('by-apartment', 'apartmentId');

        const apartmentStore = db.createObjectStore('apartments', { keyPath: 'id' });
        apartmentStore.createIndex('by-tenant', 'tenantId');

        const keyStore = db.createObjectStore('keys', { keyPath: 'id' });
        keyStore.createIndex('by-tenant', 'tenantId');
        keyStore.createIndex('by-apartment', 'apartmentId');
      },
    });

    await createDefaultUser(db);
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Helper function to delete the database
const deleteDB = async () => {
  try {
    await window.indexedDB.deleteDatabase('rental-management');
  } catch (error) {
    console.error('Error deleting database:', error);
  }
};

export const getByEmail = async (email: string): Promise<User | undefined> => {
  if (!db) await initDatabase();
  const tx = db.transaction('users', 'readonly');
  const index = tx.store.index('by-email');
  const user = await index.get(email);
  await tx.done;
  return user;
};

export const getAll = async <T>(storeName: keyof RentalDB): Promise<T[]> => {
  if (!db) await initDatabase();
  const tx = db.transaction(storeName, 'readonly');
  const items = await tx.store.getAll();
  await tx.done;
  return items;
};

export const get = async <T>(storeName: keyof RentalDB, id: string): Promise<T | undefined> => {
  if (!db) await initDatabase();
  const tx = db.transaction(storeName, 'readonly');
  const item = await tx.store.get(id);
  await tx.done;
  return item;
};

export const getByIndex = async <T>(
  storeName: keyof RentalDB,
  indexName: string,
  value: string
): Promise<T[]> => {
  if (!db) await initDatabase();
  const tx = db.transaction(storeName, 'readonly');
  const index = tx.store.index(indexName);
  const items = await index.getAll(value);
  await tx.done;
  return items;
};

export const add = async <T extends { id?: string }>(
  storeName: keyof RentalDB,
  item: T
): Promise<T> => {
  if (!db) await initDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const id = generateId();
  const itemWithId = { ...item, id };
  await tx.store.add(itemWithId);
  await tx.done;
  return itemWithId;
};

export const update = async <T extends { id: string }>(
  storeName: keyof RentalDB,
  item: T
): Promise<T> => {
  if (!db) await initDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  await tx.store.put(item);
  await tx.done;
  return item;
};

export const remove = async (storeName: keyof RentalDB, id: string): Promise<void> => {
  if (!db) await initDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  await tx.store.delete(id);
  await tx.done;
};