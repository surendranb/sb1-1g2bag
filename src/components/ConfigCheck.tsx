import React from 'react';
import { validateConfig } from '../config/env';
import { KeyRound } from 'lucide-react';

export function ConfigCheck({ children }: { children: React.ReactNode }) {
  const { isValid, missingVars } = validateConfig();

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col items-center text-center">
            <KeyRound className="w-12 h-12 text-red-500 mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Configuration Required</h1>
            <p className="text-gray-600 mb-4">
              Please set up the following environment variables to continue:
            </p>
            <ul className="text-left w-full bg-red-50 rounded-md p-4 mb-4">
              {missingVars.map((variable) => (
                <li key={variable} className="text-red-700 font-mono text-sm">
                  {variable}
                </li>
              ))}
            </ul>
            <div className="text-sm text-gray-500">
              <p className="mb-2">To fix this:</p>
              <ol className="list-decimal list-inside text-left">
                <li>Create a .env file in your project root</li>
                <li>Copy the contents from .env.example</li>
                <li>Fill in your OpenAI API key</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}