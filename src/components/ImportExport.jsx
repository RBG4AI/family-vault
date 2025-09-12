import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, FileText, Shield } from 'lucide-react';
import { storage } from '../utils/storage';

const ImportExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportData = async (format = 'json') => {
    setIsExporting(true);
    try {
      const allData = {
        credentials: storage.get('credentials') || [],
        emails: storage.get('emails') || [],
        banking: storage.get('banking') || [],
        cards: storage.get('cards') || [],
        government: storage.get('government') || [],
        insurance: storage.get('insurance') || [],
        investments: storage.get('investments') || [],
        exportDate: new Date().toISOString()
      };

      let content, filename, mimeType;
      
      if (format === 'json') {
        content = JSON.stringify(allData, null, 2);
        filename = `vault-backup-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        // CSV format
        const csvData = [];
        Object.keys(allData).forEach(category => {
          if (Array.isArray(allData[category])) {
            allData[category].forEach(item => {
              csvData.push({
                category,
                ...item
              });
            });
          }
        });
        
        const headers = ['category', 'id', 'name', 'type', 'createdAt'];
        const csvContent = [
          headers.join(','),
          ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        
        content = csvContent;
        filename = `vault-backup-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Export failed: ' + error.message);
    }
    setIsExporting(false);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate data structure
        const validCategories = ['credentials', 'emails', 'banking', 'cards', 'government', 'insurance', 'investments'];
        
        validCategories.forEach(category => {
          if (data[category] && Array.isArray(data[category])) {
            const existing = storage.get(category) || [];
            const merged = [...existing, ...data[category]];
            storage.set(category, merged);
          }
        });
        
        alert('Data imported successfully!');
        window.location.reload();
      } catch (error) {
        alert('Import failed: Invalid file format');
      }
      setIsImporting(false);
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-dark rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <Download className="w-6 h-6 text-blue-400" />
            <h4 className="font-medium text-white">Export Data</h4>
          </div>
          <p className="text-gray-400 text-sm mb-4">Download your vault data as backup</p>
          <div className="flex gap-2">
            <button
              onClick={() => exportData('json')}
              disabled={isExporting}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
            >
              {isExporting ? 'Exporting...' : 'JSON'}
            </button>
            <button
              onClick={() => exportData('csv')}
              disabled={isExporting}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
            >
              CSV
            </button>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-dark rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <Upload className="w-6 h-6 text-green-400" />
            <h4 className="font-medium text-white">Import Data</h4>
          </div>
          <p className="text-gray-400 text-sm mb-4">Restore from backup file</p>
          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={importData}
              disabled={isImporting}
              className="hidden"
            />
            <div className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer text-center text-sm">
              {isImporting ? 'Importing...' : 'Choose File'}
            </div>
          </label>
        </motion.div>
      </div>

      <div className="glass-dark rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-yellow-400" />
          <h4 className="font-medium text-white">Security Note</h4>
        </div>
        <p className="text-gray-400 text-sm">
          Exported data contains sensitive information. Store backup files securely and delete them after use.
        </p>
      </div>
    </div>
  );
};

export default ImportExport;