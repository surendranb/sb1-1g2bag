import React, { useState } from 'react';
import { Check, X, HelpCircle } from 'lucide-react';

const REQUIRED_FIELDS = [
  { key: 'date', label: 'Date', description: 'Transaction date' },
  { key: 'description', label: 'Description', description: 'Transaction description or merchant name' },
  { key: 'amount', label: 'Amount', description: 'Transaction amount (positive for deposits, negative for withdrawals)' }
];

const OPTIONAL_FIELDS = [
  { key: 'category', label: 'Category', description: 'Transaction category if available' },
  { key: 'reference', label: 'Reference', description: 'Transaction reference number' },
  { key: 'balance', label: 'Balance', description: 'Account balance after transaction' }
];

const DATE_FORMATS = [
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (e.g., 03/25/2024)' },
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (e.g., 25/03/2024)' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (e.g., 2024-03-25)' }
];

interface PreviewData {
  headers: string[];
  rows: any[];
  file: File;
}

interface Props {
  preview: PreviewData;
  onConfirm: (mapping: any) => void;
  onCancel: () => void;
}

function ColumnMapper({ preview, onConfirm, onCancel }: Props) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [dateFormat, setDateFormat] = useState('MM/dd/yyyy');
  const [amountType, setAmountType] = useState<'single' | 'separate'>('single');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateMapping = () => {
    const newErrors: Record<string, string> = {};
    
    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!mapping[field.key] && !(field.key === 'amount' && amountType === 'separate')) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    // Check amount fields for separate debit/credit
    if (amountType === 'separate' && (!mapping.withdrawal || !mapping.deposit)) {
      newErrors.amount = 'Both withdrawal and deposit columns must be mapped';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateMapping()) {
      onConfirm({
        ...mapping,
        dateFormat,
        amountType
      });
    }
  };

  const handleFieldMapping = (field: string, column: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: column
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Map Columns</h2>
          <div className="flex space-x-4">
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirm Mapping
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
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Date Format</h3>
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {DATE_FORMATS.map(format => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Amount Format</h3>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={amountType === 'single'}
                onChange={() => setAmountType('single')}
                className="mr-2"
              />
              Single Amount Column
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={amountType === 'separate'}
                onChange={() => setAmountType('separate')}
                className="mr-2"
              />
              Separate Withdrawal/Deposit Columns
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium">Required Fields</h3>
          {REQUIRED_FIELDS.map(field => (
            <div key={field.key} className="space-y-2">
              {amountType === 'separate' && field.key === 'amount' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Withdrawal Column
                      <HelpCircle className="inline-block w-4 h-4 ml-1 text-gray-400" />
                    </label>
                    <select
                      value={mapping.withdrawal || ''}
                      onChange={(e) => handleFieldMapping('withdrawal', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select column</option>
                      {preview.headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Deposit Column
                      <HelpCircle className="inline-block w-4 h-4 ml-1 text-gray-400" />
                    </label>
                    <select
                      value={mapping.deposit || ''}
                      onChange={(e) => handleFieldMapping('deposit', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select column</option>
                      {preview.headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    <HelpCircle className="inline-block w-4 h-4 ml-1 text-gray-400" />
                  </label>
                  <select
                    value={mapping[field.key] || ''}
                    onChange={(e) => handleFieldMapping(field.key, e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 
                      ${errors[field.key] ? 'border-red-300' : 'border-gray-300'}`}
                  >
                    <option value="">Select column</option>
                    {preview.headers.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                  {errors[field.key] && (
                    <p className="mt-1 text-sm text-red-600">{errors[field.key]}</p>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-500">{field.description}</p>
            </div>
          ))}

          <h3 className="text-lg font-medium pt-4">Optional Fields</h3>
          {OPTIONAL_FIELDS.map(field => (
            <div key={field.key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                <HelpCircle className="inline-block w-4 h-4 ml-1 text-gray-400" />
              </label>
              <select
                value={mapping[field.key] || ''}
                onChange={(e) => handleFieldMapping(field.key, e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select column</option>
                {preview.headers.map(header => (
                  <option key={header} value={header}>{header}</option>
                ))}
              </select>
              <p className="text-sm text-gray-500">{field.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Preview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {preview.headers.map(header => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.rows.map((row, i) => (
                  <tr key={i}>
                    {preview.headers.map(header => (
                      <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ColumnMapper;