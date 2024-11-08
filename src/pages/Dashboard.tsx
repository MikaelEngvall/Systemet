import React from 'react';
import { Users, Building2, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDatabase } from '../hooks/useDatabase';
import { Tenant, Apartment, Key as KeyType } from '../types';

function StatCard({ title, count, icon: Icon, to }: {
  title: string;
  count: number;
  icon: React.ElementType;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-200"
    >
      <Icon className="w-12 h-12 text-brand-light dark:text-brand-dark" />
      <div className="ml-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-3xl font-bold text-brand-light dark:text-brand-dark">{count}</p>
      </div>
    </Link>
  );
}

function Dashboard() {
  const { items: tenants } = useDatabase<Tenant>('tenants');
  const { items: apartments } = useDatabase<Apartment>('apartments');
  const { items: keys } = useDatabase<KeyType>('keys');

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
}

export default Dashboard;