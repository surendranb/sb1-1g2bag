import React, { useState } from 'react';
import { Check, X, AlertTriangle, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  id?: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  confidence?: number;
}

interface Props {
  transactions: Transaction[];
  onConfirm: (transactions: Transaction[]) => void;
  onCancel: () => void;
}

function TransactionVerification({ transactions, onConfirm, onCancel }: Props) {
  const [editedTransactions, setEditedTransactions] = useState(transactions);
  const [editingId, setEditingId] = useState<number | null>(null);

  const hasLowConfidence = transactions.some(t => (t.confidence || 0) < 0.8);

  const handleEdit = (index: number, field: keyof Transaction, value: string) => {
    const updated = [...editedTransactions];
    updated[index] = { ...updated[index], [field]: value };
    setEditedTransactions(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Verify Transactions</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => onConfirm(editedTransactions)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirm All
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>

        {hasLowConfidence && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-md flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" />
            <p className="text-sm text-yellow-700">
              Some transactions need your attention. Please review the highlighted items carefully.
            </p>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {editedTransactions.map((transaction, index) => (
              <tr 
                key={index}
                className={`${(transaction.confidence || 0) < 0.8 ? 'bg-yellow-50' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === index ? (
                    <input
                      type="date"
                      value={transaction.date}
                      onChange={(e) => handleEdit(index, 'date', e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    format(new Date(transaction.date), 'MMM d, yyyy')
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === index ? (
                    <input
                      type="text"
                      value={transaction.description}
                      onChange={(e) => handleEdit(index, 'description', e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    transaction.description
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === index ? (
                    <select
                      value={transaction.category}
                      onChange={(e) => handleEdit(index, 'category', e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Bills">Bills</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Income">Income</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    transaction.category
                  )}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right
                  ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {editingId === index ? (
                    <input
                      type="number"
                      value={transaction.amount}
                      onChange={(e) => handleEdit(index, 'amount', e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    `$${Math.abs(transaction.amount).toFixed(2)}`
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <button
                    onClick={() => setEditingId(editingId === index ? null : index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionVerification;