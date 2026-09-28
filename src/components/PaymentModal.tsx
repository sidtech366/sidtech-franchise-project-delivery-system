import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, QrCode, ShieldAlert, CreditCard, Sparkles } from 'lucide-react';
import { Project, AppSettings } from '../../types/database';
import { SidTechDatabase } from '../../services/storage';

interface PaymentModalProps {
  project: Project;
  settings: AppSettings;
  franchiseId: string;
  onClose: () => void;
  onPaymentSubmitted: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  project,
  settings,
  franchiseId,
  onClose,
  onPaymentSubmitted,
}) => {
  // If no payment has been made yet, suggest advance required. Else suggest remaining amount due.
  const suggestedAmount =
    project.amountPaid === 0 ? project.advanceRequired : project.amountDue;

  const [amount, setAmount] = useState<number>(suggestedAmount);
  const [utr, setUtr] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dynamicHdQr, setDynamicHdQr] = useState<string>('');

  useEffect(() => {
    // Generate crisp HD UPI QR Code with High error correction
    const upiUrl = `upi://pay?pa=${settings.companyUpi}&pn=SidTechTechnologies&am=${amount || suggestedAmount}&cu=INR&tn=Project-${project.projectId}`;
    QRCode.toDataURL(upiUrl, {
      width: 450,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#12294A',
        light: '#FFFFFF',
      },
    })
      .then((url) => setDynamicHdQr(url))
      .catch((err) => {
        console.error('Error generating HD payment QR:', err);
        setDynamicHdQr(settings.companyQrImageUrl);
      });
  }, [amount, settings.companyUpi, project.projectId, settings.companyQrImageUrl, suggestedAmount]);

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(settings.companyUpi);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!amount || amount <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    if (amount > project.amountDue) {
      setError(`Amount cannot exceed the total due amount of ₹${project.amountDue.toLocaleString('en-IN')}.`);
      return;
    }

    if (!utr.trim() || utr.trim().length < 6) {
      setError('Please enter a valid 12-digit UTR or Transaction Reference number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = SidTechDatabase.submitPayment({
        projectId: project.projectId,
        franchiseId,
        amount: Number(amount),
        utr: utr.trim(),
        mode: 'UPI/QR-Manual',
      });

      if (res.success) {
        onPaymentSubmitted();
        onClose();
      } else {
        setError(res.message);
        setIsSubmitting(false);
      }
    } catch {
      setError('Failed to submit payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#12294A] px-6 py-4 text-white flex items-center justify-between border-b-2 border-[#E86A17]">
          <div>
            <h3 className="font-bold text-lg text-white">Make Payment via UPI / HD QR</h3>
            <p className="text-xs text-orange-200">
              Project: <span className="font-mono font-bold text-white">{project.projectId}</span> - {project.serviceName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Project Price Stats */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center text-xs">
            <div>
              <div className="text-slate-500 font-medium">Total Price</div>
              <div className="text-sm font-bold text-slate-800">
                ₹{project.finalPrice.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-slate-500 font-medium">Already Paid</div>
              <div className="text-sm font-bold text-emerald-600">
                ₹{project.amountPaid.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div className="text-slate-500 font-medium">Balance Due</div>
              <div className="text-sm font-bold text-rose-600">
                ₹{project.amountDue.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* HD QR Code & UPI Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-orange-50/50 p-4 rounded-xl border border-orange-200/80">
            {/* QR Box */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-xs border border-orange-200 text-center">
              <img
                src={dynamicHdQr || settings.companyQrImageUrl}
                alt="HD Company UPI QR"
                className="w-32 h-32 object-contain"
              />
              <span className="text-[10px] text-slate-500 font-bold mt-1.5 flex items-center gap-1">
                <QrCode className="w-3 h-3 text-[#E86A17]" /> HD QR • Amount ₹{amount || 0}
              </span>
            </div>

            {/* UPI ID Details */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                  Official SidTech UPI ID
                </label>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-xs text-[#12294A] flex-1 truncate select-all">
                    {settings.companyUpi}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUPI}
                    title="Copy UPI ID"
                    className="p-2 rounded-lg bg-[#E86A17] hover:bg-[#d45e12] text-white transition flex-shrink-0 cursor-pointer"
                  >
                    {copiedUpi ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copiedUpi && (
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                    ✓ UPI ID copied to clipboard!
                  </p>
                )}
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-slate-200">
                1. Scan HD QR with PhonePe, Google Pay, or Paytm.<br />
                2. Complete payment & note the 12-digit <strong>UTR</strong>.
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Payment Amount (INR)
                </label>
                <span className="text-[10px] text-slate-400">
                  {project.amountPaid === 0 ? 'Min. Advance Suggested' : 'Installment or Full'}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  required
                  min={1}
                  max={project.amountDue}
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  placeholder="Enter amount being paid"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                12-Digit UTR / Transaction Reference Number
              </label>
              <input
                type="text"
                required
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-800 uppercase focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                placeholder="e.g. 423412345678"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Found in your UPI app payment receipt under "UPI Ref No" or "UTR".
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
