import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { parsePDF, parseCSV, previewCSV } from '../utils/parsers';
import TransactionVerification from './TransactionVerification';
import ColumnMapper from './ColumnMapper';

function FileUploader() {
  const [parsedTransactions, setParsedTransactions] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [mappedColumns, setMappedColumns] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setWarnings(null);
    setIsProcessing(true);
    
    try {
      for (const file of acceptedFiles) {
        if (file.name.endsWith('.csv')) {
          const preview = await previewCSV(file);
          setFilePreview(preview);
        } else {
          const transactions = await parsePDF(file);
          setParsedTransactions(transactions);
        }
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Failed to process the file. Please ensure it\'s a valid bank statement.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleColumnMapping = async (mapping) => {
    setError(null);
    setWarnings(null);
    setIsProcessing(true);
    
    try {
      const result = await parseCSV(filePreview.file, mapping);
      setFilePreview(null);
      setMappedColumns(mapping);
      setParsedTransactions(result.transactions);
      if (result.warnings) {
        setWarnings(result.warnings);
      }
    } catch (error) {
      console.error('Error parsing with mapping:', error);
      setError(error.message || 'Failed to process transactions. Please check your column mapping.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmTransactions = async (transactions: any[]) => {
    setError(null);
    setWarnings(null);
    setIsProcessing(true);
    
    try {
      await window.electron.invoke('save-transactions', transactions);
      setParsedTransactions(null);
      setMappedColumns(null);
    } catch (error) {
      console.error('Error saving transactions:', error);
      setError('Failed to save transactions. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv']
    },
    disabled: isProcessing
  });

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (filePreview) {
    return (
      <ColumnMapper 
        preview={filePreview}
        onConfirm={handleColumnMapping}
        onCancel={() => setFilePreview(null)}
      />
    );
  }

  if (parsedTransactions) {
    return (
      <>
        {warnings && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Warnings</h3>
                <p className="text-sm text-yellow-700 mt-1 whitespace-pre-line">
                  Some rows couldn't be processed:
                  {warnings.map((warning, index) => (
                    <span key={index} className="block mt-1">• {warning}</span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        )}
        <TransactionVerification
          transactions={parsedTransactions}
          onConfirm={handleConfirmTransactions}
          onCancel={() => setParsedTransactions(null)}
          columnMapping={mappedColumns}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg text-gray-700">
          Drop your bank statements here, or click to select files
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Supports PDF and CSV formats
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Supported Banks</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-gray-400" />
            <span>Chase Bank Statements</span>
          </div>
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-gray-400" />
            <span>Bank of America Statements</span>
          </div>
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-gray-400" />
            <span>Wells Fargo Statements</span>
          </div>
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-gray-400" />
            <span>Citibank Statements</span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Privacy Notice
            </h3>
            <p className="mt-2 text-sm text-yellow-700">
              All your financial data is processed locally on your computer. No data is sent to external servers except for anonymous analytics processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileUploader;