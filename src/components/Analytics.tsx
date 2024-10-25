import React, { useState, useEffect } from 'react';
import { BarChart as BarChartIcon, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyzeSpending } from '../utils/openai';

function Analytics() {
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(true);
  const [spendingData, setSpendingData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const transactions = await window.electron.invoke('get-transactions');
      const analysis = await analyzeSpending(transactions);
      setInsights(analysis);
      
      // Transform data for charts
      // ... data transformation logic
      
      setLoading(false);
    };
    
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Monthly Overview</h3>
            <BarChartIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Category Breakdown</h3>
            <PieChartIcon className="h-5 w-5 text-gray-400" />
          </div>
          {/* Category breakdown visualization */}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Spending Trends</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          {/* Spending trends visualization */}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : (
          <div className="prose max-w-none">
            {insights}
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;