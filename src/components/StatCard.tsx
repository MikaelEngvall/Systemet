import React from 'react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  count: number;
  icon: React.ElementType;
  to: string;
}

export function StatCard({ title, count, icon: Icon, to }: StatCardProps) {
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