import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  Award,
  Clock,
  Layers,
  CheckCircle2,
  XCircle,
  Eye,
  Monitor,
  AlertCircle,
} from 'lucide-react';
import { Project, AppSettings, Franchise } from '../../types/database';
import { StatusChip } from '../common/StatusChip';
import { PaymentModal } from '../common/PaymentModal';
import { CertificatePreview } from '../generators/CertificatePreview';

interface FranchiseProjectsProps {
  projects: Project[];
  franchise: Franchise;
  settings: AppSettings;
  selectedProjectId?: string;
  onRefresh: () => void;
}

export const FranchiseProjects: React.FC<FranchiseProjectsProps> = ({
  projects,
  franchise,
  settings,
  selectedProjectId,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'New' | 'Accepted' | 'Processing' | 'Delivered'>('All');
  const [activeProject, setActiveProject] = useState<Project | null>(
    selectedProjectId
      ? projects.find((p) => p.projectId === selectedProjectId) || null
      : null
  );

  const [paymentModalProject, setPaymentModalProject] = useState<Project | null>(null);
  const [certModalProject, setCertModalProject] = useState<Project | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // Status filtering
  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'New') return p.status === 'New';
    if (activeTab === 'Accepted') return p.status === 'Accepted';
    if (activeTab === 'Processing') return p.status === 'Processing' || p.status === 'DemoReady';
    if (activeTab === 'Delivered') return p.status === 'Delivered';
    return true;
  });

  const handleCopyFinalUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12294A]">My Client Projects</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track real-time status transitions, demo previews, payments, and delivery certificates
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs bg-slate-100 p-1 rounded-xl">
          {(['All', 'New', 'Accepted', 'Processing', 'Delivered'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No projects in this stage.
          </div>
        ) : (
          filteredProjects.map((project) => {
            const isAdvancePending =
              project.status === 'Accepted' && project.amountPaid < project.advanceRequired;
            const isBalancePending = project.amountDue > 0 && project.status !== 'New';

            return (
              <div
                key={project.projectId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-4"
              >
                {/* Top Row: IDs, Service & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-[#12294A] px-2.5 py-1 rounded-md border border-slate-200">
                      {project.projectId}
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {project.serviceName}
                      </h3>
                      <div className="text-xs text-slate-500">
                        Client: <strong className="text-slate-700">{project.clientName}</strong> ({project.clientMobile})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <StatusChip status={project.status} />
                  </div>
                </div>

                {/* Middle Row: Progress Bar & Financials */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Final Agreed Price</span>
                    <span className="font-bold text-slate-800 font-mono text-sm">
                      ₹{project.finalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Advance ({project.advancePercent}%)</span>
                    <span className="font-bold text-[#E86A17] font-mono text-sm">
                      ₹{project.advanceRequired.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Paid Amount</span>
                    <span className="font-bold text-emerald-600 font-mono text-sm">
                      ₹{project.amountPaid.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Balance Due</span>
                    <span className="font-bold text-rose-600 font-mono text-sm">
                      ₹{project.amountDue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Payment Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Payment Progress</span>
                    <span>
                      {Math.round((project.amountPaid / Math.max(1, project.finalPrice)) * 100)}% Paid
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#E86A17] to-emerald-500 transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((project.amountPaid / Math.max(1, project.finalPrice)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Requirement notes */}
                {project.requirementNotes && (
                  <div className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <strong className="text-slate-700">Client Requirements:</strong> {project.requirementNotes}
                  </div>
                )}

                {/* Lifecycle Specific Action Sections */}
                {/* 1. Status = New */}
                {project.status === 'New' && (
                  <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>
                        Project received by SidTech Central. Waiting for admin to review requirements and confirm final pricing/advance.
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. Status = Accepted (Orange) -> Pay Advance */}
                {project.status === 'Accepted' && (
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-[#E86A17] text-sm flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        Project Accepted by SidTech!
                      </div>
                      <p className="text-slate-600 mt-0.5">
                        Please deposit the advance of <strong>₹{project.advanceRequired.toLocaleString('en-IN')}</strong> via UPI to start development.
                      </p>
                    </div>

                    <button
                      onClick={() => setPaymentModalProject(project)}
                      className="px-4 py-2 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl font-bold shadow-md transition flex items-center gap-2 self-start sm:self-auto"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay Advance (₹{project.advanceRequired.toLocaleString('en-IN')})</span>
                    </button>
                  </div>
                )}

                {/* 3. Status = Processing or DemoReady (Blue) -> Work in progress + sandboxed iframe */}
                {(project.status === 'Processing' || project.status === 'DemoReady') && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-blue-900 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-blue-600" />
                          Work in Progress (SidTech Engineering)
                        </div>
                        <p className="text-slate-600 mt-0.5">
                          {project.demoUrl
                            ? 'A live demo build is ready! You can test the application inside the sandboxed preview below.'
                            : 'Engineers are building the solution. Demo preview will appear here once ready.'}
                        </p>
                      </div>

                      {/* Partial / Remaining Payment Button */}
                      {project.amountDue > 0 && (
                        <button
                          onClick={() => setPaymentModalProject(project)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition flex items-center gap-1.5 text-xs self-start sm:self-auto"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Balance (Due: ₹{project.amountDue.toLocaleString('en-IN')})</span>
                        </button>
                      )}
                    </div>

                    {/* Safe Embedded Sandboxed Demo IFRAME (Module 7: Raw URL is hidden from franchise!) */}
                    {project.demoUrl && (
                      <div className="border-2 border-blue-300 rounded-xl overflow-hidden bg-slate-900 shadow-inner">
                        <div className="bg-[#12294A] text-white px-3.5 py-2 text-xs font-semibold flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-cyan-400" />
                            <span>Live Demo Preview (Sandboxed Embed)</span>
                          </div>
                          <span className="text-[10px] text-amber-300 font-mono">
                            SidTech Secure Sandbox
                          </span>
                        </div>
                        <div className="relative w-full h-80 bg-white">
                          <iframe
                            src={project.demoUrl}
                            title={`Demo preview for ${project.serviceName}`}
                            sandbox="allow-scripts allow-same-origin"
                            className="w-full h-full border-0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Status = Delivered (Green) -> Copy URL unlocked & Certificate available */}
                {project.status === 'Delivered' && (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Project Successfully Delivered!
                      </div>
                      <p className="text-slate-600 mt-0.5">
                        Final solution is live on production. Deliverable link & client certificate are ready.
                      </p>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                        ✓ ₹{project.commissionAmount.toLocaleString('en-IN')} commission has been credited to your Wallet.
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Copy URL Button per Module 7 requirement */}
                      {project.finalUrl && (
                        <button
                          onClick={() => handleCopyFinalUrl(project.finalUrl!)}
                          className="px-3.5 py-2 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-xl font-bold shadow-xs transition flex items-center gap-1.5 text-xs"
                        >
                          {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedUrl ? 'Copied to Clipboard!' : 'Copy Delivered URL'}</span>
                        </button>
                      )}

                      {/* Download Certificate Button */}
                      <button
                        onClick={() => setCertModalProject(project)}
                        className="px-3.5 py-2 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl font-bold shadow-xs transition flex items-center gap-1.5 text-xs"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>View Certificate</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. Status = Rejected */}
                {project.status === 'Rejected' && (
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-800">
                    <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <div>
                      <strong>Project Rejected:</strong> {project.rejectionReason || 'Contact support for details.'}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Payment Modal */}
      {paymentModalProject && (
        <PaymentModal
          project={paymentModalProject}
          settings={settings}
          franchiseId={franchise.franchiseId}
          onClose={() => setPaymentModalProject(null)}
          onPaymentSubmitted={() => {
            onRefresh();
          }}
        />
      )}

      {/* Certificate Modal */}
      {certModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl w-full border border-slate-200 relative my-8">
            <button
              onClick={() => setCertModalProject(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 z-20 print:hidden"
            >
              ✕
            </button>
            <CertificatePreview project={certModalProject} franchise={franchise} />
          </div>
        </div>
      )}
    </div>
  );
};
