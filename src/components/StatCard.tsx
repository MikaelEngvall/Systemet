import React from 'react'; // Import React for JSX syntax
import { Link } from 'react-router-dom'; // Import Link for navigation between routes

// Define the props for the StatCard component
interface StatCardProps {
  title: string; // The title of the card (e.g., "Total Tenants")
  count: number; // The numeric value displayed on the card (e.g., total number of tenants)
  icon: React.ElementType; // The icon to be displayed in the card, passed as a React component type
  to: string; // The route to navigate to when the card is clicked
}

// StatCard component to display a clickable statistic card
export function StatCard({ title, count, icon: Icon, to }: StatCardProps) {
  return (
    // Use the Link component to navigate to the specified route (the 'to' prop)
    <Link
      to={to} // The route to navigate to when the card is clicked
      className="flex items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-200"
    >
      {/* Render the icon */}
      <Icon className="w-12 h-12 text-brand-light dark:text-brand-dark" />
      
      {/* Render the text content of the card */}
      <div className="ml-4">
        {/* Title of the card */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
        
        {/* Numeric count displayed on the card */}
        <p className="text-3xl font-bold text-brand-light dark:text-brand-dark">{count}</p>
      </div>
    </Link>
  );
}
