import React from 'react';
import { Download } from 'lucide-react';

const DataExporter = () => {
  const exportToHTML = () => {
    // Get all data
    const allData = {
      credentials: JSON.parse(localStorage.getItem('credentials') || '[]'),
      emails: JSON.parse(localStorage.getItem('emails') || '[]'),
      banking: JSON.parse(localStorage.getItem('banking') || '[]'),
      cards: JSON.parse(localStorage.getItem('cards') || '[]'),
      government: JSON.parse(localStorage.getItem('government') || '[]'),
      insurance: JSON.parse(localStorage.getItem('insurance') || '[]'),
      investments: JSON.parse(localStorage.getItem('investments') || '[]')
    };

    // Create HTML with embedded data
    const html = `<!DOCTYPE html>
<html><head><title>Vault - Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#1a202c 0%,#2d3748 50%,#1a202c 100%);color:white;min-height:100vh;padding:20px}.container{max-width:800px;margin:0 auto}.header{text-align:center;margin-bottom:30px}.logo{width:60px;height:60px;background:linear-gradient(45deg,#3b82f6,#8b5cf6);border-radius:16px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px}.title{font-size:28px;font-weight:bold;margin-bottom:8px}.card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;margin-bottom:16px}.card h3{font-size:18px;margin-bottom:12px;color:#3b82f6}.item{background:rgba(255,255,255,0.05);border-radius:12px;padding:12px;margin-bottom:8px}.item-title{font-weight:600;margin-bottom:4px}.item-subtitle{color:#a0aec0;font-size:14px}.tabs{display:flex;margin-bottom:20px;background:rgba(255,255,255,0.05);border-radius:12px;padding:4px}.tab{flex:1;padding:12px;text-align:center;border-radius:8px;cursor:pointer;font-size:14px;transition:all 0.2s}.tab:hover{background:rgba(59,130,246,0.2)}.tab.active{background:rgba(59,130,246,0.3)}.hidden{display:none}</style></head><body><div class="container"><div class="header"><div class="logo">🔒</div><h1 class="title">Vault</h1><p style="color:#a0aec0">Your Financial Information</p></div><div class="tabs"><div class="tab active" onclick="showTab('credentials')">Credentials</div><div class="tab" onclick="showTab('banking')">Banking</div><div class="tab" onclick="showTab('cards')">Cards</div><div class="tab" onclick="showTab('government')">Govt IDs</div><div class="tab" onclick="showTab('insurance')">Insurance</div><div class="tab" onclick="showTab('investments')">Investments</div></div>`;

    let content = html;

    // Add each section
    Object.keys(allData).forEach(section => {
      const items = allData[section];
      const sectionName = section.charAt(0).toUpperCase() + section.slice(1);
      
      content += `<div id="${section}" class="tab-content ${section !== 'credentials' ? 'hidden' : ''}"><div class="card"><h3>${sectionName} (${items.length})</h3>`;
      
      if (items.length === 0) {
        content += `<p style="color:#a0aec0">No ${section} saved</p>`;
      } else {
        items.forEach(item => {
          let title = item.name || item.appName || item.bankName || item.emailAddress || item.documentType || item.insuranceType || item.cardType || item.platform || 'Unknown';
          let subtitle = '';
          
          if (section === 'banking') subtitle = `****${(item.accountNumber || '').slice(-4)}`;
          else if (section === 'cards') subtitle = `****-****-****-${(item.cardNumber || '').slice(-4)}`;
          else if (section === 'credentials') subtitle = item.username || item.email || '';
          else if (section === 'emails') subtitle = item.emailAddress || '';
          else if (section === 'government') subtitle = `****${(item.documentNumber || '').slice(-4)}`;
          else if (section === 'insurance') subtitle = `****${(item.policyNumber || '').slice(-4)}`;
          else if (section === 'investments') subtitle = item.investmentType || '';
          
          content += `<div class="item"><div class="item-title">${title}</div><div class="item-subtitle">${subtitle}</div></div>`;
        });
      }
      
      content += `</div></div>`;
    });

    content += `</div><script>function showTab(tab){document.querySelectorAll('.tab-content').forEach(el=>el.classList.add('hidden'));document.querySelectorAll('.tab').forEach(el=>el.classList.remove('active'));document.getElementById(tab).classList.remove('hidden');event.target.classList.add('active');}</script></body></html>`;

    // Download the file
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vault-offline.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-dark rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Create Offline Version</h3>
      <p className="text-gray-400 text-sm mb-4">
        Export your data as a standalone HTML file that works offline
      </p>
      <button
        onClick={exportToHTML}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export Offline Vault
      </button>
    </div>
  );
};

export default DataExporter;