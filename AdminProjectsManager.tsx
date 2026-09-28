import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  Link,
  DollarSign,
  AlertCircle,
  X,
  Eye,
  ExternalLink,
  Edit3,
  Save,
  Wallet,
  Percent,
  RotateCcw,
} from 'lucide-react';
import { Project, Franchise, ProjectStatus } from '../../types/database';
import { SidTechDatabase } from '../../services/storage';
import { StatusChip } from '../common/StatusChip';
import { CertificatePreview } from '../generators/CertificatePreview';

interface AdminProjectsManagerProps {
  projects: Project[];
  franchises: Franchise[];
  filterFranchiseId?: string;
  onRefresh: () => void;
}

export const AdminProjectsManager: React.FC<AdminProjectsManagerProps> = ({
  projects,
  franchises,
  filterFranchiseId,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'New' | 'Accepted' | 'Processing' | 'Delivered'>('All');
  const [search, setSearch] = useState('');
  const [drawerProject, setDrawerProject] = useState<Project | null>(null);

  // Drawer form edit states
  const [drawerTab, setDrawerTab] = useState<'lifecycle' | 'editor'>('lifecycle');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editAdvancePercent, setEditAdvancePercent] = useState<number>(25);
  const [editAmountPaid, setEditAmountPaid] = useState<number>(0);
  const [editAmountDue, setEditAmountDue] = useState<number>(0);
  const [editCommissionPercent, setEditCommissionPercent] = useState<number>(10);
  const [editCommissionAmount, setEditCommissionAmount] = useState<number>(0);
  const [editClientName, setEditClientName] = useState<string>('');
  const [editClientMobile, setEditClientMobile] = useState<string>('');
  const [editServiceName, setEditServiceName] = useState<string>('');
  const [editStatus, setEditStatus] = useState<ProjectStatus>('New');
  const [editRequirementNotes, setEditRequirementNotes] = useState<string>('');
  const [editCertNumber, setEditCertNumber] = useState<string>('');
  const [demoUrlInput, setDemoUrlInput] = useState<string>('');
  const [finalUrlInput, setFinalUrlInput] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectForm, setShowRejectForm] = useState<boolean>(false);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const openDrawer = (project: Project, tab: 'lifecycle' | 'editor' = 'lifecycle') => {
    setDrawerProject(project);
    setDrawerTab(tab);
    setEditPrice(project.finalPrice);
    setEditAdvancePercent(project.advancePercent);
    setEditAmountPaid(project.amountPaid);
    setEditAmountDue(project.amountDue);
    setEditCommissionPercent(project.commissionPercent);
    setEditCommissionAmount(project.commissionAmount);
    setEditClientName(project.clientName);
    setEditClientMobile(project.clientMobile);
    setEditServiceName(project.serviceName);
    setEditStatus(project.status);
    setDemoUrlInput(project.demoUrl || '');
    setFinalUrlInput(project.finalUrl || '');
    setEditRequirementNotes(project.requirementNotes || '');
    setEditCertNumber(project.certificateNumber || '');
    setRejectReason('');
    setShowRejectForm(false);
    setStatusMsg(null);
  };

  const handlePriceChange = (val: number) => {
    setEditPrice(val);
    setEditAmountDue(Math.max(0, val - editAmountPaid));
    setEditCommissionAmount(Math.round((val * editCommissionPercent) / 100));
  };

  const handlePaidChange = (val: number) => {
    setEditAmountPaid(val);
    setEditAmountDue(Math.max(0, editPrice - val));
  };

  const handleCommissionPercentChange = (val: number) => {
    setEditCommissionPercent(val);
    setEditCommissionAmount(Math.round((editPrice * val) / 100));
  };

  const handleSaveFullOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerProject) return;

    const updates: Partial<Project> = {
      finalPrice: Number(editPrice) || 0,
      advancePercent: Number(editAdvancePercent) || 0,
      advanceRequired: Math.round(((Number(editPrice) || 0) * (Number(editAdvancePercent) || 0)) / 100),
      amountPaid: Number(editAmountPaid) || 0,
      amountDue: Number(editAmountDue) || 0,
      commissionPercent: Number(editCommissionPercent) || 0,
      commissionAmount: Number(editCommissionAmount) || 0,
      clientName: editClientName.trim(),
      clientMobile: editClientMobile.trim(),
      serviceName: editServiceName.trim(),
      status: editStatus,
      demoUrl: demoUrlInput.trim() || undefined,
      finalUrl: finalUrlInput.trim() || undefined,
      requirementNotes: editRequirementNotes.trim(),
      certificateNumber: editCertNumber.trim() || undefined,
    };

    const updated = SidTechDatabase.updateProjectFull(drawerProject.projectId, updates);
    if (updated) {
      setDrawerProject(updated);
      setStatusMsg({ text: 'Order details and financials updated successfully in database!' });
      onRefresh();
    } else {
      setStatusMsg({ text: 'Failed to update order.', error: true });
    }
  };

  const handleAcceptProject = () => {
    if (!drawerProject) return;
    const updated = SidTechDatabase.acceptProject(drawerProject.projectId, editPrice, editAdvancePercent);
    if (updated) {
      setDrawerProject(updated);
      setStatusMsg({ text: 'Project accepted successfully! Status changed to Accepted (Orange).' });
      onRefresh();
    }
  };

  const handleSaveDemoUrl = () => {
    if (!drawerProject || !demoUrlInput.trim()) return;
    const updated = SidTechDatabase.setDemoUrl(drawerProject.projectId, demoUrlInput.trim());
    if (updated) {
      setDrawerProject(updated);
      setStatusMsg({ text: 'Live Demo URL published! Franchise can now preview inside sandboxed iframe.' });
      onRefresh();
    }
  };

  const handleDeliverProject = () => {
    if (!drawerProject) return;
    if (!finalUrlInput.trim()) {
      setStatusMsg({ text: 'Please enter the live final delivery URL.', error: true });
      return;
    }

    const res = SidTechDatabase.markDelivered(drawerProject.projectId, finalUrlInput.trim());
    if (res.success && res.project) {
      setDrawerProject(res.project);
      setStatusMsg({ text: 'Project Delivered! Commission credited to wallet & completion certificate issued.' });
      onRefresh();
    } else {
      setStatusMsg({ text: res.message, error: true });
    }
  };

  const handleRejectProject = () => {
    if (!drawerProject) return;
    SidTechDatabase.rejectProject(drawerProject.projectId, rejectReason);
    setDrawerProject(null);
    onRefresh();
  };

  const filteredProjects = projects.filter((p) => {
    if (filterFranchiseId && p.franchiseId !== filterFranchiseId) return false;
    if (activeTab === 'New' && p.status !== 'New') return false;
    if (activeTab === 'Accepted' && p.status !== 'Accepted') return false;
    if (activeTab === 'Processing' && p.status !== 'Processing' && p.status !== 'DemoReady') return false;
    if (activeTab === 'Delivered' && p.status !== 'Delivered') return false;

    const matchesSearch =
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.clientMobile.includes(search) ||
      p.projectId.toLowerCase().includes(search.toLowerCase()) ||
      p.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      p.franchiseId.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12294A] flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#E86A17]" />
            Projects & Order Fulfillment Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept client orders, configure delivery URLs, and approve completion certificates
          </p>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
            {(['All', 'New', 'Accepted', 'Processing', 'Delivered'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex-shrink-0 ${
                  activeTab === tab
                    ? 'bg-white text-slate-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
            />
          </div>
        </div>
      </div>

      {/* Table of Orders */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#12294A] text-white font-semibold">
              <tr>
                <th className="py-3 px-4">Project ID</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Service & Client</th>
                <th className="py-3 px-4">Financials</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No projects found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const franchise = franchises.find((f) => f.franchiseId === p.franchiseId);

                  return (
                    <tr key={p.projectId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#12294A]">
                        {p.projectId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {franchise?.branchName || p.franchiseId}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{p.franchiseId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.serviceName}</div>
                        <div className="text-slate-500 text-[11px]">
                          Client: <strong className="text-slate-700">{p.clientName}</strong> ({p.clientMobile})
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-slate-800">₹{p.finalPrice.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-slate-400">
                          Paid: <span className="text-emerald-600 font-semibold">₹{p.amountPaid.toLocaleString('en-IN')}</span> | Due: <span className="text-rose-500 font-semibold">₹{p.amountDue.toLocaleString('en-IN')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusChip status={p.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDrawer(p, 'editor')}
                            className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#E86A17] border border-orange-200 rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                            title="Edit Order, Price, Amount Paid, Due & Franchise Earning"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => openDrawer(p, 'lifecycle')}
                            className="px-3 py-1.5 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Detail Drawer / Management Modal */}
      {drawerProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            {/* Header */}
            <div className="bg-[#12294A] px-6 py-4 text-white flex items-center justify-between border-b-2 border-[#E86A17]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-[#E86A17] text-white px-2 py-0.5 rounded">
                    {drawerProject.projectId}
                  </span>
                  <h3 className="font-bold text-base text-white">{drawerProject.serviceName}</h3>
                </div>
                <p className="text-xs text-orange-200 mt-0.5">
                  Client: {drawerProject.clientName} ({drawerProject.clientMobile}) • Branch: {drawerProject.franchiseId}
                </p>
              </div>
              <button
                onClick={() => setDrawerProject(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Tabs: Lifecycle vs Full Financial/Order Editor */}
            <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDrawerTab('lifecycle')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    drawerTab === 'lifecycle'
                      ? 'bg-white text-[#12294A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-[#E86A17]" />
                  <span>Workflow & Delivery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab('editor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    drawerTab === 'editor'
                      ? 'bg-white text-[#12294A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#E86A17]" />
                  <span>Edit Financials, Earnings & Order</span>
                </button>
              </div>
              <StatusChip status={drawerProject.status} size="sm" />
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {statusMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    statusMsg.error
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {statusMsg.text}
                </div>
              )}

              {/* TAB 1: WORKFLOW & LIFECYCLE */}
              {drawerTab === 'lifecycle' && (
                <div className="space-y-5">
                  {/* Requirement Notes */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                    <span className="text-slate-400 block font-semibold mb-1">
                      Client Requirement Notes:
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {drawerProject.requirementNotes || 'Standard catalog package requested without extra notes.'}
                    </p>
                  </div>

              {/* Lifecycle Stage 1: New -> Accept Project */}
              {drawerProject.status === 'New' && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#E86A17]">
                    <Clock className="w-4 h-4" />
                    <span>Stage 1: Review & Accept Order</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Confirm or adjust the final price and mandatory advance deposit percentage for this project.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Agreed Final Price (₹)
                      </label>
                      <input
                        type="number"
                        min={500}
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Advance Deposit Required (%)
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={editAdvancePercent}
                        onChange={(e) => setEditAdvancePercent(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-semibold text-[#12294A]">
                      Advance Demanded: ₹{Math.round((editPrice * editAdvancePercent) / 100).toLocaleString('en-IN')}
                    </span>

                    <button
                      type="button"
                      onClick={handleAcceptProject}
                      className="px-4 py-2 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                      Accept Project (Turn Orange)
                    </button>
                  </div>
                </div>
              )}

              {/* Lifecycle Stage 2 & 3: Processing & Demo URL */}
              {(drawerProject.status === 'Accepted' ||
                drawerProject.status === 'Processing' ||
                drawerProject.status === 'DemoReady') && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>Stage 2 & 3: Development & Sandboxed Demo</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      Paid: ₹{drawerProject.amountPaid.toLocaleString('en-IN')} / Due: ₹{drawerProject.amountDue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Live Demo URL (Rendered in franchise sandboxed iframe - raw link hidden)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={demoUrlInput}
                        onChange={(e) => setDemoUrlInput(e.target.value)}
                        placeholder="https://preview-instance.sidtech366.live/test-site"
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleSaveDemoUrl}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
                      >
                        Publish Demo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lifecycle Stage 4: Mark Delivered (Full Payment required) */}
              {drawerProject.status !== 'Delivered' && drawerProject.status !== 'Rejected' && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Stage 4: Final Production Delivery & Certificate</span>
                    </div>
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      drawerProject.amountDue === 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {drawerProject.amountDue === 0 ? '✓ Fully Paid (₹0 Due)' : `₹${drawerProject.amountDue.toLocaleString('en-IN')} Pending`}
                    </span>
                  </div>

                  {drawerProject.amountDue > 0 ? (
                    <p className="text-xs text-rose-700 font-medium">
                      ⚠️ Delivery locked: The client/branch still has a pending balance of ₹{drawerProject.amountDue.toLocaleString('en-IN')}. Verify full payments first.
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-700">
                      Full payment received! Enter the final production domain to unlock copyable URLs, issue the completion certificate, and credit ₹{drawerProject.commissionAmount.toLocaleString('en-IN')} commission to the franchise wallet.
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={finalUrlInput}
                      onChange={(e) => setFinalUrlInput(e.target.value)}
                      placeholder="https://clientdomain.com or final deploy link"
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleDeliverProject}
                      disabled={drawerProject.amountDue > 0}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md disabled:opacity-40 transition"
                    >
                      Mark Delivered
                    </button>
                  </div>
                </div>
              )}

              {/* Already Delivered View */}
              {drawerProject.status === 'Delivered' && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Project Delivered
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCertModal(true)}
                      className="text-xs font-bold text-[#E86A17] hover:underline flex items-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5" /> View Certificate
                    </button>
                  </div>
                  <div className="text-xs text-slate-700">
                    Delivered URL: <a href={drawerProject.finalUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline">{drawerProject.finalUrl}</a>
                  </div>
                </div>
              )}

              {/* Reject Option */}
              {drawerProject.status !== 'Delivered' && drawerProject.status !== 'Rejected' && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {!showRejectForm ? (
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(true)}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Reject This Booking
                    </button>
                  ) : (
                    <div className="w-full flex items-center gap-2">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason for rejecting project..."
                        className="flex-1 px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleRejectProject}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
                      >
                        Confirm Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMPLETE FINANCIAL & EARNINGS EDITOR */}
          {drawerTab === 'editor' && (
            <form onSubmit={handleSaveFullOrder} className="space-y-5">
              {/* Financial Parameters & Earnings */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-[#12294A] flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-[#E86A17]" />
                    <span>Order Financials & Franchise Commission Earning</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                    Admin Live Edit
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Agreed Price (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editPrice}
                      onChange={(e) => handlePriceChange(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Amount Paid (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editAmountPaid}
                      onChange={(e) => handlePaidChange(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Amount Due (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editAmountDue}
                      onChange={(e) => setEditAmountDue(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-rose-700 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Advance % & Demanded
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={editAdvancePercent}
                        onChange={(e) => setEditAdvancePercent(Number(e.target.value))}
                        className="w-14 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                        title="Advance %"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">
                        % (₹{Math.round((editPrice * editAdvancePercent) / 100).toLocaleString('en-IN')})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Franchise Earning / Commission Override */}
                <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/60 p-3 rounded-lg border border-amber-200/80">
                  <div>
                    <label className="block text-[11px] font-bold text-[#12294A] mb-1 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-[#E86A17]" />
                      <span>Franchise Commission %</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editCommissionPercent}
                      onChange={(e) => handleCommissionPercentChange(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#12294A] mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Franchise Earning Amount (₹)</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editCommissionAmount}
                      onChange={(e) => setEditCommissionAmount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold text-emerald-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Credited to branch wallet on delivery
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Deliverables Override */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Order Lifecycle Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  >
                    <option value="New">New (Pending Review)</option>
                    <option value="Accepted">Accepted (Advance Awaiting)</option>
                    <option value="Processing">Processing (In Development)</option>
                    <option value="DemoReady">DemoReady (Preview Link Active)</option>
                    <option value="Delivered">Delivered (Completed & Certificate Active)</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Completion Certificate Number
                  </label>
                  <input
                    type="text"
                    value={editCertNumber}
                    onChange={(e) => setEditCertNumber(e.target.value)}
                    placeholder="e.g. ST-CERT-100452"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
              </div>

              {/* URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Live Demo URL (Sandboxed)
                  </label>
                  <input
                    type="url"
                    value={demoUrlInput}
                    onChange={(e) => setDemoUrlInput(e.target.value)}
                    placeholder="https://preview.example.com"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Final Production URL
                  </label>
                  <input
                    type="url"
                    value={finalUrlInput}
                    onChange={(e) => setFinalUrlInput(e.target.value)}
                    placeholder="https://clientdomain.com"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
              </div>

              {/* Client & Service Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={editClientName}
                    onChange={(e) => setEditClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Client Phone
                  </label>
                  <input
                    type="tel"
                    value={editClientMobile}
                    onChange={(e) => setEditClientMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Service Title
                  </label>
                  <input
                    type="text"
                    value={editServiceName}
                    onChange={(e) => setEditServiceName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
              </div>

              {/* Requirement Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Requirement Notes
                </label>
                <textarea
                  rows={2}
                  value={editRequirementNotes}
                  onChange={(e) => setEditRequirementNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerTab('lifecycle')}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Back to Workflow
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Order & Financial Changes</span>
                </button>
              </div>
            </form>
          )}
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertModal && drawerProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl w-full border border-slate-200 relative my-8">
            <button
              onClick={() => setShowCertModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 z-10"
            >
              ✕
            </button>
            <CertificatePreview
              project={drawerProject}
              franchise={franchises.find((f) => f.franchiseId === drawerProject.franchiseId)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
