import React from 'react';
import { Users, Building2, Key } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { StatCard } from '../components/StatCard';
import { ImportData } from '../components/ImportData';
import { useAuth } from '../contexts/AuthContext';
import type { Tenant, Apartment, Key as KeyType } from '../types';

export function HomePage() {
  const { items: tenants, loading: tenantsLoading } = useDatabase<Tenant>('tenants');
  const { items: apartments, loading: apartmentsLoading } = useDatabase<Apartment>('apartments');
  const { items: keys, loading: keysLoading } = useDatabase<KeyType>('keys');
  const { user } = useAuth();

  if (tenantsLoading || apartmentsLoading || keysLoading) {
    return (
      <div className="text-center mt-20">
        <h1 className="text-4xl font-bold text-brand-light dark:text-brand-dark mb-12">
          Loading...
        </h1>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-brand-light dark:text-brand-dark mb-12">
          Welcome to Rental Management System
        </h1>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Tenants"
          count={tenants.length}
          icon={Users}
          to="/tenants"
        />
        <StatCard
          title="Apartments"
          count={apartments.length}
          icon={Building2}
          to="/apartments"
        />
        <StatCard
          title="Keys"
          count={keys.length}
          icon={Key}
          to="/keys"
        />
      </div>

      {user?.role === 'superuser' && (
        <div className="max-w-2xl mx-auto">
          <ImportData />
        </div>
      )}
    </div>
  );
}