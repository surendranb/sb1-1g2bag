import React from 'react';
import { Upload, List, PieChart } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'upload', icon: Upload, label: 'Import' },
    { id: 'transactions', icon: List, label: 'Transactions' },
    { id: 'analytics', icon: PieChart, label: 'Analytics' }
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Finance Manager</h1>
      </div>
      
      <nav className="mt-6">
        {menuItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors
              ${activeTab === id 
                ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
          >
            <Icon className="h-5 w-5 mr-3" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;