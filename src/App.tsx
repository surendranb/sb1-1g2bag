import React, { useState } from 'react';
import { ConfigCheck } from './components/ConfigCheck';
import Sidebar from './components/Sidebar';
import FileUploader from './components/FileUploader';
import TransactionList from './components/TransactionList';
import Analytics from './components/Analytics';

function App() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <ConfigCheck>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-8 overflow-auto">
          {activeTab === 'upload' && <FileUploader />}
          {activeTab === 'transactions' && <TransactionList />}
          {activeTab === 'analytics' && <Analytics />}
        </main>
      </div>
    </ConfigCheck>
  );
}

export default App;