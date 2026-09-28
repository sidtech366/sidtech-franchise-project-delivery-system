import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Search,
  Database,
  Check,
  AlertCircle,
} from 'lucide-react';
import { SidTechDatabase } from '../../services/storage';

export const AdminSheetViewer: React.FC = () => {
  const [activeSheet, setActiveSheet] = useState<
    'Franchises' | 'Services' | 'Projects' | 'Payments' | 'Payouts' | 'Settings' | 'Notifications'
  >('Franchises');
  const [searchTerm, setSearchTerm] = useState('');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const sheets = [
    'Franchises',
    'Services',
    'Projects',
    'Payments',
    'Payouts',
    'Settings',
    'Notifications',
  ] as const;

  const franchises = SidTechDatabase.getFranchises();
  const services = SidTechDatabase.getServices();
  const projects = SidTechDatabase.getProjects();
  const payments = SidTechDatabase.getPayments();
  const payouts = SidTechDatabase.getPayouts();
  const settings = SidTechDatabase.getSettings();
  const notifications = SidTechDatabase.getNotifications();

  // Export full JSON database
  const handleExportJSON = () => {
    const dataStr = SidTechDatabase.exportFullDatabase();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SidTech_Enterprise_DB_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setExportNotice('Full Database JSON exported successfully!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Export current sheet to CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let rows: any[] = [];

    if (activeSheet === 'Franchises') rows = franchises;
    else if (activeSheet === 'Services') rows = services;
    else if (activeSheet === 'Projects') rows = projects;
    else if (activeSheet === 'Payments') rows = payments;
    else if (activeSheet === 'Payouts') rows = payouts;
    else if (activeSheet === 'Notifications') rows = notifications;
    else rows = [settings];

    if (rows.length === 0) return;

    const headers = Object.keys(rows[0]);
    csvContent += headers.join(',') + '\r\n';

    rows.forEach((row) => {
      const line = headers
        .map((header) => {
          let val = row[header];
          if (typeof val === 'string') val = `"${val.replace(/"/g, '""')}"`;
          return val !== undefined ? val : '';
        })
        .join(',');
      csvContent += line + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SidTech_Sheet_${activeSheet}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12294A] flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            Enterprise Registry & Data Records
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Secure administrative records. View all 7 registry tables, search data, and export backups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export {activeSheet}.CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-1.5 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-[#E86A17]" />
            <span>Full DB JSON</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Tabs navigation mimicking Google Sheets bottom/top tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 text-xs">
        {sheets.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSheet(s)}
            className={`px-4 py-2 rounded-t-xl font-bold transition flex items-center gap-1.5 border-t border-x ${
              activeSheet === s
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Sheet: {s}</span>
          </button>
        ))}
      </div>

      {/* Sheet Content Viewer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="font-semibold text-slate-700 flex items-center gap-2">
            <span>Tab: <strong>{activeSheet}</strong></span>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Filter ${activeSheet}...`}
              className="w-full pl-8 pr-3 py-1 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Tab 1: Franchises */}
        {activeSheet === 'Franchises' && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12294A] text-white">
                <tr>
                  <th className="py-2.5 px-3">FranchiseID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">BranchName</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Mobile</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">WalletBalance</th>
                  <th className="py-2.5 px-3">TotalEarned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {franchises.map((f) => (
                  <tr key={f.franchiseId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-[#E86A17]">{f.franchiseId}</td>
                    <td className="py-2 px-3">{f.name}</td>
                    <td className="py-2 px-3">{f.branchName}</td>
                    <td className="py-2 px-3">{f.email}</td>
                    <td className="py-2 px-3">{f.mobile}</td>
                    <td className="py-2 px-3 font-bold">{f.status}</td>
                    <td className="py-2 px-3 text-emerald-700 font-bold">₹{f.walletBalance}</td>
                    <td className="py-2 px-3">₹{f.totalEarned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Services */}
        {activeSheet === 'Services' && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12294A] text-white">
                <tr>
                  <th className="py-2.5 px-3">ServiceID</th>
                  <th className="py-2.5 px-3">ServiceName</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Advance%</th>
                  <th className="py-2.5 px-3">Commission%</th>
                  <th className="py-2.5 px-3">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {services.map((s) => (
                  <tr key={s.serviceId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-[#E86A17]">{s.serviceId}</td>
                    <td className="py-2 px-3">{s.serviceName}</td>
                    <td className="py-2 px-3">{s.category}</td>
                    <td className="py-2 px-3 font-bold">₹{s.price}</td>
                    <td className="py-2 px-3">{s.advancePercent}%</td>
                    <td className="py-2 px-3">{s.commissionPercent}%</td>
                    <td className="py-2 px-3">{s.active ? 'TRUE' : 'FALSE'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Projects */}
        {activeSheet === 'Projects' && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12294A] text-white">
                <tr>
                  <th className="py-2.5 px-3">ProjectID</th>
                  <th className="py-2.5 px-3">FranchiseID</th>
                  <th className="py-2.5 px-3">ServiceName</th>
                  <th className="py-2.5 px-3">ClientName</th>
                  <th className="py-2.5 px-3">FinalPrice</th>
                  <th className="py-2.5 px-3">AmountPaid</th>
                  <th className="py-2.5 px-3">AmountDue</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">CertificateNumber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {projects.map((p) => (
                  <tr key={p.projectId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-[#E86A17]">{p.projectId}</td>
                    <td className="py-2 px-3">{p.franchiseId}</td>
                    <td className="py-2 px-3">{p.serviceName}</td>
                    <td className="py-2 px-3">{p.clientName}</td>
                    <td className="py-2 px-3 font-bold">₹{p.finalPrice}</td>
                    <td className="py-2 px-3 text-emerald-700 font-bold">₹{p.amountPaid}</td>
                    <td className="py-2 px-3 text-rose-700 font-bold">₹{p.amountDue}</td>
                    <td className="py-2 px-3 font-bold">{p.status}</td>
                    <td className="py-2 px-3">{p.certificateNumber || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Payments */}
        {activeSheet === 'Payments' && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12294A] text-white">
                <tr>
                  <th className="py-2.5 px-3">PaymentID</th>
                  <th className="py-2.5 px-3">ProjectID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">UTR</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">VerifiedOn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map((p) => (
                  <tr key={p.paymentId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-[#E86A17]">{p.paymentId}</td>
                    <td className="py-2 px-3">{p.projectId}</td>
                    <td className="py-2 px-3 font-bold">₹{p.amount}</td>
                    <td className="py-2 px-3">{p.mode}</td>
                    <td className="py-2 px-3 select-all">{p.utr}</td>
                    <td className="py-2 px-3 font-bold">{p.status}</td>
                    <td className="py-2 px-3">{p.verifiedOn ? new Date(p.verifiedOn).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Payouts */}
        {activeSheet === 'Payouts' && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12294A] text-white">
                <tr>
                  <th className="py-2.5 px-3">PayoutID</th>
                  <th className="py-2.5 px-3">FranchiseID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Target UPI</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">ReferenceNote</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payouts.map((po) => (
                  <tr key={po.payoutId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-[#E86A17]">{po.payoutId}</td>
                    <td className="py-2 px-3">{po.franchiseId}</td>
                    <td className="py-2 px-3 font-bold">₹{po.amount}</td>
                    <td className="py-2 px-3">{po.upiId || '-'}</td>
                    <td className="py-2 px-3 font-bold">{po.status}</td>
                    <td className="py-2 px-3">{po.referenceNote || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 6: Settings */}
        {activeSheet === 'Settings' && (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12294A] text-white">
                <tr>
                  <th className="py-2.5 px-3">Key</th>
                  <th className="py-2.5 px-3">Value</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2 px-3 font-bold text-[#E86A17]">CompanyUPI</td>
                  <td className="py-2 px-3">{settings.companyUpi}</td>
                  <td className="py-2 px-3 text-slate-400">Editable from Admin Payment Settings</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-[#E86A17]">CompanyQRImageURL</td>
                  <td className="py-2 px-3 truncate max-w-xs">{settings.companyQrImageUrl}</td>
                  <td className="py-2 px-3 text-slate-400">Drive / CDN link</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-[#E86A17]">PaymentAPIEnabled</td>
                  <td className="py-2 px-3">{settings.paymentApiEnabled ? 'TRUE' : 'FALSE'}</td>
                  <td className="py-2 px-3 text-slate-400">Toggle switch for gateway</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-[#E86A17]">DefaultAdvancePercent</td>
                  <td className="py-2 px-3">{settings.defaultAdvancePercent}%</td>
                  <td className="py-2 px-3 text-slate-400">Fallback if service has none</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-[#E86A17]">DefaultCommissionPercent</td>
                  <td className="py-2 px-3">{settings.defaultCommissionPercent}%</td>
                  <td className="py-2 px-3 text-slate-400">Franchise commission default</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-[#E86A17]">CertificatePrefix</td>
                  <td className="py-2 px-3">{settings.certificatePrefix}</td>
                  <td className="py-2 px-3 text-slate-400">Used in ST366 & ST-CERT</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 7: Notifications */}
        {activeSheet === 'Notifications' && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#12294A] text-white">
                <tr>
                  <th className="py-2.5 px-3">NotifID</th>
                  <th className="py-2.5 px-3">TargetFranchiseID</th>
                  <th className="py-2.5 px-3">Message</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Read</th>
                  <th className="py-2.5 px-3">CreatedOn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {notifications.map((n) => (
                  <tr key={n.notifId} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-[#E86A17]">{n.notifId}</td>
                    <td className="py-2 px-3">{n.franchiseId || 'BROADCAST'}</td>
                    <td className="py-2 px-3 font-sans truncate max-w-sm">{n.message}</td>
                    <td className="py-2 px-3">{n.type}</td>
                    <td className="py-2 px-3">{n.read ? 'TRUE' : 'FALSE'}</td>
                    <td className="py-2 px-3">{new Date(n.createdOn).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
