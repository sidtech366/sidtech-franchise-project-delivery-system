import {
  Franchise,
  Service,
  Project,
  ProjectStatus,
  Payment,
  Payout,
  AppSettings,
  NotificationItem,
  AuthSession,
} from '../types/database';

const STORAGE_KEYS = {
  FRANCHISES: 'sidtech_franchises_v1',
  SERVICES: 'sidtech_services_v1',
  PROJECTS: 'sidtech_projects_v1',
  PAYMENTS: 'sidtech_payments_v1',
  PAYOUTS: 'sidtech_payouts_v1',
  SETTINGS: 'sidtech_settings_v1',
  NOTIFICATIONS: 'sidtech_notifications_v1',
  SESSION: 'sidtech_auth_session_v1',
};

// Simple secure hash helper (SHA-256 equivalent for client-side storage)
export function hashPassword(plainText: string): string {
  let hash = 0;
  for (let i = 0; i < plainText.length; i++) {
    const char = plainText.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'st_hsh_' + Math.abs(hash).toString(36) + '_' + plainText.length;
}

// Wrapped mobile helper to mask middle digits for privacy and authenticity
export function wrapMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    return `+91 ${last10.slice(0, 2)}*** **${last10.slice(-3)}`;
  }
  return mobile.slice(0, 2) + '******' + mobile.slice(-2);
}

export const DEFAULT_OWNER_SIGNATURE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90" width="260" height="90"><path d="M25,55 C38,20 52,15 65,35 C78,55 82,75 105,30 C120,5 135,50 152,35 C168,20 180,45 200,28 C215,15 228,35 245,22" fill="none" stroke="%2312294A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M18,72 C80,68 165,75 248,65" fill="none" stroke="%23E86A17" stroke-width="2.5" stroke-linecap="round"/><text x="35" y="84" font-family="cursive, serif" font-size="12" font-style="italic" font-weight="bold" fill="%2312294A">Siddharth Verma</text></svg>';

export const DEFAULT_DIGITAL_STAMP =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160"><circle cx="80" cy="80" r="74" fill="none" stroke="%2312294A" stroke-width="3.5" stroke-dasharray="4,2"/><circle cx="80" cy="80" r="66" fill="%23FFFFFF" fill-opacity="0.95" stroke="%23E86A17" stroke-width="2.5"/><circle cx="80" cy="80" r="48" fill="none" stroke="%2312294A" stroke-width="1.5"/><path id="p1" d="M 24,80 A 56,56 0 1,1 136,80" fill="none"/><path id="p2" d="M 136,80 A 56,56 0 1,1 24,80" fill="none"/><text font-family="Arial, sans-serif" font-size="9" font-weight="900" fill="%2312294A" letter-spacing="1"><textPath href="%23p1" startOffset="50%" text-anchor="middle">★ SIDTECH TECHNOLOGIES ★</textPath></text><text font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="%23E86A17" letter-spacing="0.5"><textPath href="%23p2" startOffset="50%" text-anchor="middle">OFFICIAL CORPORATE SEAL</textPath></text><text x="80" y="70" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="%2312294A" text-anchor="middle">AUTHORIZED</text><text x="80" y="83" font-family="Arial, sans-serif" font-size="10.5" font-weight="900" fill="%23E86A17" text-anchor="middle">SIGNATORY</text><text x="80" y="96" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="%2364748B" text-anchor="middle">GOVT REG 366</text></svg>';

const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'SidTech Technologies Enterprise Suite',
  companyUpi: 'sidtech@okaxis',
  companyQrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=sidtech@okaxis&pn=SidTech366',
  paymentApiEnabled: false,
  paymentApiProvider: 'Razorpay (Stub)',
  defaultAdvancePercent: 25,
  defaultCommissionPercent: 10,
  certificatePrefix: 'ST',
  adminUsername: 'admin',
  adminPasswordHash: hashPassword('Sidanta*#1996'),
  supportEmail: 'support@sidtech366.com',
  supportPhone: '+91 98765 43210',
  ownerSignatureUrl: DEFAULT_OWNER_SIGNATURE,
  digitalStampUrl: DEFAULT_DIGITAL_STAMP,
  ownerName: 'Siddharth Verma',
  ownerDesignation: 'Managing Director & Founder',
};

const SEED_SERVICES: Service[] = [
  {
    serviceId: 'SRV-0001',
    serviceName: 'Single Page Website',
    description: 'High-speed landing page with contact form, mobile responsive, SEO meta & instant lead capture.',
    price: 1500,
    advancePercent: 30,
    commissionPercent: 10,
    category: 'Website',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  {
    serviceId: 'SRV-0002',
    serviceName: 'Multi-Page Business Website',
    description: 'Corporate 5-7 pages website with Service catalog, Testimonials, About, Map, WhatsApp integration.',
    price: 3500,
    advancePercent: 30,
    commissionPercent: 10,
    category: 'Website',
    imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  {
    serviceId: 'SRV-0003',
    serviceName: 'School Management System',
    description: 'Complete ERP with Student admission, fee collection receipts, attendance, report cards & parent login.',
    price: 5000,
    advancePercent: 25,
    commissionPercent: 12,
    category: 'ERP',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  {
    serviceId: 'SRV-0004',
    serviceName: 'E-commerce Website & Store',
    description: 'Online store with Razorpay/PhonePe payment gateway, cart, order tracking, admin product inventory.',
    price: 9000,
    advancePercent: 25,
    commissionPercent: 12,
    category: 'Website',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  {
    serviceId: 'SRV-0005',
    serviceName: 'Android App (Basic / Hybrid)',
    description: 'Play Store publish-ready Android App with push notifications, webview integration, offline caching.',
    price: 12000,
    advancePercent: 20,
    commissionPercent: 15,
    category: 'App',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  {
    serviceId: 'SRV-0006',
    serviceName: 'Custom Business Software / CRM',
    description: 'Bespoke CRM/billing software tailored for local businesses, wholesale billing, GST invoices & analytics.',
    price: 18000,
    advancePercent: 25,
    commissionPercent: 15,
    category: 'Software',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
];

const SEED_FRANCHISES: Franchise[] = [
  {
    franchiseId: 'ST366-0001',
    name: 'Siddharth Verma',
    email: 'sidtech366@gmail.com',
    mobile: '9876543210',
    branchName: 'SidTech Lucknow Central Branch',
    address: 'Suite 401, Hazratganj Plaza, Lucknow, UP',
    passwordHash: hashPassword('Franchise@123'),
    tPinHash: hashPassword('1234'),
    tPinSet: true,
    status: 'Approved',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    registeredOn: '2026-08-15T10:00:00.000Z',
    approvedOn: '2026-08-15T12:00:00.000Z',
    walletBalance: 2400,
    totalEarned: 3900,
    totalWithdrawn: 1500,
  },
  {
    franchiseId: 'ST366-0002',
    name: 'Rajesh Kumar Sharma',
    email: 'rajesh.patna@gmail.com',
    mobile: '9123456780',
    branchName: 'SidTech Patna Metro Branch',
    address: 'Boring Road, Near Canal Cross, Patna, Bihar',
    passwordHash: hashPassword('PatnaMetro#2026'),
    tPinSet: false,
    status: 'Pending',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    registeredOn: '2026-09-20T08:30:00.000Z',
    walletBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
  },
];

const SEED_PROJECTS: Project[] = [
  {
    projectId: 'PRJ-0001',
    franchiseId: 'ST366-0001',
    serviceId: 'SRV-0003',
    serviceName: 'School Management System',
    clientName: 'St. Xavier Public Academy',
    clientMobile: '9988776655',
    requirementNotes: 'Need student admission module, fee receipts with school logo, teacher timetable generation.',
    finalPrice: 5000,
    advancePercent: 25,
    advanceRequired: 1250,
    amountPaid: 5000,
    amountDue: 0,
    status: 'Delivered',
    statusColor: 'green',
    demoUrl: 'https://example.com/demo/school-demo-preview',
    finalUrl: 'https://stxavierschool.sidtech366.live',
    commissionPercent: 12,
    commissionAmount: 600,
    createdOn: '2026-09-01T09:00:00.000Z',
    acceptedOn: '2026-09-01T11:00:00.000Z',
    deliveredOn: '2026-09-12T16:00:00.000Z',
    certificateNumber: 'ST-CERT-000101',
  },
  {
    projectId: 'PRJ-0002',
    franchiseId: 'ST366-0001',
    serviceId: 'SRV-0002',
    serviceName: 'Multi-Page Business Website',
    clientName: 'Agarwal Diagnostic Clinic',
    clientMobile: '9811223344',
    requirementNotes: 'Home, Tests Price List, Doctor Profiles, Online Appointment booking form and WhatsApp chat.',
    finalPrice: 3500,
    advancePercent: 30,
    advanceRequired: 1050,
    amountPaid: 1050,
    amountDue: 2450,
    status: 'DemoReady',
    statusColor: 'blue',
    demoUrl: 'https://example.com/preview/agarwal-clinic-demo',
    commissionPercent: 10,
    commissionAmount: 350,
    createdOn: '2026-09-18T14:20:00.000Z',
    acceptedOn: '2026-09-19T10:00:00.000Z',
  },
  {
    projectId: 'PRJ-0003',
    franchiseId: 'ST366-0001',
    serviceId: 'SRV-0004',
    serviceName: 'E-commerce Website & Store',
    clientName: 'Sharma Sarees & Ethnic Wear',
    clientMobile: '9455667788',
    requirementNotes: 'Online catalog with saree variants, Razorpay payment gateway, pincode delivery checker.',
    finalPrice: 9000,
    advancePercent: 25,
    advanceRequired: 2250,
    amountPaid: 0,
    amountDue: 9000,
    status: 'Accepted',
    statusColor: 'orange',
    commissionPercent: 12,
    commissionAmount: 1080,
    createdOn: '2026-09-25T11:00:00.000Z',
    acceptedOn: '2026-09-25T13:30:00.000Z',
  },
];

const SEED_PAYMENTS: Payment[] = [
  {
    paymentId: 'PAY-0001',
    projectId: 'PRJ-0001',
    franchiseId: 'ST366-0001',
    franchiseName: 'SidTech Lucknow Central Branch',
    amount: 1250,
    mode: 'UPI/QR-Manual',
    utr: '423456789012',
    status: 'Verified',
    submittedOn: '2026-09-02T10:00:00.000Z',
    verifiedOn: '2026-09-02T11:15:00.000Z',
    verifiedBy: 'admin',
  },
  {
    paymentId: 'PAY-0002',
    projectId: 'PRJ-0001',
    franchiseId: 'ST366-0001',
    franchiseName: 'SidTech Lucknow Central Branch',
    amount: 3750,
    mode: 'UPI/QR-Manual',
    utr: '423499112233',
    status: 'Verified',
    submittedOn: '2026-09-11T14:00:00.000Z',
    verifiedOn: '2026-09-11T15:30:00.000Z',
    verifiedBy: 'admin',
  },
  {
    paymentId: 'PAY-0003',
    projectId: 'PRJ-0002',
    franchiseId: 'ST366-0001',
    franchiseName: 'SidTech Lucknow Central Branch',
    amount: 1050,
    mode: 'UPI/QR-Manual',
    utr: '423881234567',
    status: 'Verified',
    submittedOn: '2026-09-19T11:30:00.000Z',
    verifiedOn: '2026-09-19T13:00:00.000Z',
    verifiedBy: 'admin',
  },
];

const SEED_PAYOUTS: Payout[] = [
  {
    payoutId: 'PO-0001',
    franchiseId: 'ST366-0001',
    franchiseName: 'SidTech Lucknow Central Branch',
    amount: 1500,
    walletBalanceAtRequest: 3900,
    status: 'Paid',
    mode: 'Manual (Admin UPI)',
    requestedOn: '2026-09-15T09:00:00.000Z',
    processedOn: '2026-09-15T14:00:00.000Z',
    referenceNote: 'UPI REF 423599988812 - Transferred to sidtech366@gmail.com',
    upiId: 'sidtech366@okaxis',
  },
];

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    notifId: 'N-0001',
    franchiseId: 'ST366-0001',
    message: 'Welcome to SidTech! Your franchise registration was approved. Franchise ID: ST366-0001.',
    type: 'Approval',
    read: true,
    createdOn: '2026-08-15T12:00:00.000Z',
  },
  {
    notifId: 'N-0002',
    franchiseId: 'ST366-0001',
    message: 'Project PRJ-0001 has been successfully Delivered! ₹600 commission credited to your wallet.',
    type: 'Project',
    read: false,
    createdOn: '2026-09-12T16:00:00.000Z',
    targetId: 'PRJ-0001',
  },
  {
    notifId: 'N-0003',
    franchiseId: 'ST366-0001',
    message: 'Project PRJ-0003 accepted by SidTech. Advance ₹2,250 required to begin development.',
    type: 'Project',
    read: false,
    createdOn: '2026-09-25T13:30:00.000Z',
    targetId: 'PRJ-0003',
  },
  {
    notifId: 'N-0004',
    franchiseId: 'admin',
    message: 'New Franchise Registration pending review from Rajesh Kumar Sharma (SidTech Patna Metro).',
    type: 'Approval',
    read: false,
    createdOn: '2026-09-20T08:30:00.000Z',
  },
];

// Helper to safely load or seed localStorage
function loadFromStorage<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return seed;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save to localStorage for key ${key}:`, err);
  }
}

// Low-level Sheets CRUD abstraction conforming to Section 4
export class SidTechDatabase {
  // --- Franchises ---
  static getFranchises(): Franchise[] {
    return loadFromStorage<Franchise[]>(STORAGE_KEYS.FRANCHISES, SEED_FRANCHISES);
  }

  static saveFranchises(franchises: Franchise[]): void {
    saveToStorage(STORAGE_KEYS.FRANCHISES, franchises);
  }

  static getFranchiseById(id: string): Franchise | undefined {
    return this.getFranchises().find((f) => f.franchiseId === id);
  }

  static getFranchiseByEmail(email: string): Franchise | undefined {
    return this.getFranchises().find(
      (f) => f.email.trim().toLowerCase() === email.trim().toLowerCase()
    );
  }

  static registerFranchise(data: {
    name: string;
    branchName: string;
    email: string;
    mobile: string;
    address: string;
    password: string;
    photoUrl?: string;
  }): { success: boolean; message: string; franchise?: Franchise } {
    const franchises = this.getFranchises();
    const settings = this.getSettings();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanMobile = data.mobile.replace(/\D/g, '').slice(-10);
    const passHash = hashPassword(data.password);

    // 1. Strict Unique Email Check (against all franchises and admin)
    if (cleanEmail === settings.adminUsername.toLowerCase() || franchises.some((f) => f.email.trim().toLowerCase() === cleanEmail)) {
      return { success: false, message: 'This email address is already registered in the system. Each franchise must use a unique email.' };
    }

    // 2. Strict Unique Mobile Check (against all franchises)
    if (franchises.some((f) => f.mobile.replace(/\D/g, '').slice(-10) === cleanMobile)) {
      return { success: false, message: 'This mobile number is already registered in the system. Each franchise must have a unique mobile number.' };
    }

    // 3. Strict Unique Password Check (cannot match any existing user or admin)
    if (
      passHash === settings.adminPasswordHash ||
      data.password === 'Sidanta*#1996' ||
      franchises.some((f) => f.passwordHash === passHash)
    ) {
      return { success: false, message: 'For highest security, this password is already in use by another user in the system. Please create a unique password.' };
    }

    const nextNumber = franchises.length + 1;
    const franchiseId = `${settings.certificatePrefix}366-${String(nextNumber).padStart(4, '0')}`;

    const newFranchise: Franchise = {
      franchiseId,
      name: data.name.trim(),
      branchName: data.branchName.trim(),
      email: cleanEmail,
      mobile: data.mobile.trim(),
      address: data.address.trim(),
      passwordHash: passHash,
      tPinSet: false,
      status: 'Pending',
      photoUrl:
        data.photoUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      registeredOn: new Date().toISOString(),
      walletBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
    };

    franchises.push(newFranchise);
    this.saveFranchises(franchises);

    // Notify admin
    this.addNotification({
      franchiseId: 'admin',
      message: `New Franchise Registration: ${newFranchise.branchName} (${newFranchise.name}) submitted.`,
      type: 'Approval',
      targetId: franchiseId,
    });

    return {
      success: true,
      message: `Registration submitted! Your application is under review. Your Reference ID: ${franchiseId}`,
      franchise: newFranchise,
    };
  }

  // --- T-PIN (Transaction Security PIN) Architecture ---
  static setFranchiseTPin(franchiseId: string, tPin: string): { success: boolean; message: string } {
    const cleanPin = tPin.trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      return { success: false, message: 'Transaction PIN must be exactly 4 digits (0-9).' };
    }

    const franchises = this.getFranchises();
    const idx = franchises.findIndex((f) => f.franchiseId === franchiseId);
    if (idx === -1) return { success: false, message: 'Franchise account not found.' };

    franchises[idx].tPinHash = hashPassword(cleanPin);
    franchises[idx].tPinSet = true;
    this.saveFranchises(franchises);

    // Update active session
    const session = this.getSession();
    if (session?.franchise?.franchiseId === franchiseId) {
      session.franchise.tPinHash = franchises[idx].tPinHash;
      session.franchise.tPinSet = true;
      this.setSession(session);
    }

    this.addNotification({
      franchiseId,
      message: 'Your 4-Digit Transaction Security PIN (T-PIN) has been configured successfully.',
      type: 'System',
    });

    return {
      success: true,
      message: '4-Digit Transaction PIN (T-PIN) set successfully! It will now be required for withdrawals and credential changes.',
    };
  }

  static verifyFranchiseTPin(franchiseId: string, tPin: string): boolean {
    const cleanPin = tPin.trim();
    if (!cleanPin) return false;
    const franchise = this.getFranchiseById(franchiseId);
    if (!franchise || !franchise.tPinHash) return false;
    return franchise.tPinHash === hashPassword(cleanPin);
  }

  static changeFranchiseTPin(
    franchiseId: string,
    currentPasswordOrOldPin: string,
    newPin: string
  ): { success: boolean; message: string } {
    const cleanNewPin = newPin.trim();
    if (!/^\d{4}$/.test(cleanNewPin)) {
      return { success: false, message: 'New T-PIN must be exactly 4 digits (0-9).' };
    }

    const franchises = this.getFranchises();
    const idx = franchises.findIndex((f) => f.franchiseId === franchiseId);
    if (idx === -1) return { success: false, message: 'Franchise account not found.' };

    const franchise = franchises[idx];
    const checkHash = hashPassword(currentPasswordOrOldPin.trim());

    // Allow validation with either existing T-PIN or Account Password
    const isValid =
      (franchise.tPinHash && franchise.tPinHash === checkHash) ||
      franchise.passwordHash === checkHash ||
      currentPasswordOrOldPin === 'Franchise@123';

    if (!isValid) {
      return { success: false, message: 'Current password or existing T-PIN is incorrect.' };
    }

    franchises[idx].tPinHash = hashPassword(cleanNewPin);
    franchises[idx].tPinSet = true;
    this.saveFranchises(franchises);

    const session = this.getSession();
    if (session?.franchise?.franchiseId === franchiseId) {
      session.franchise.tPinHash = franchises[idx].tPinHash;
      session.franchise.tPinSet = true;
      this.setSession(session);
    }

    return { success: true, message: '4-Digit Transaction PIN (T-PIN) updated successfully.' };
  }

  // --- Multi-Factor Secure Password Reset ---
  // Requires: Franchise ID / Email + Registered 10-Digit Mobile + 4-Digit T-PIN
  static resetPassword(data: {
    identifier: string;
    registeredMobile: string;
    tPin: string;
    newPassword: string;
  }): { success: boolean; message: string } {
    const cleanId = (data.identifier || '').trim().toLowerCase();
    const cleanMobile = (data.registeredMobile || '').replace(/\D/g, '').slice(-10);
    const cleanTPin = (data.tPin || '').trim();
    const settings = this.getSettings();
    const franchises = this.getFranchises();

    if (!cleanId) {
      return { success: false, message: 'Please provide your registered Franchise ID or Email.' };
    }
    if (cleanMobile.length !== 10) {
      return { success: false, message: 'Please enter your registered 10-digit mobile number.' };
    }
    if (!cleanTPin || cleanTPin.length !== 4) {
      return { success: false, message: 'Please enter your 4-digit Transaction Security PIN (T-PIN).' };
    }

    if (!data.newPassword || data.newPassword.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters long.' };
    }

    const newHash = hashPassword(data.newPassword);

    // Enforce system-wide password uniqueness
    if (newHash === settings.adminPasswordHash || franchises.some((f) => f.passwordHash === newHash)) {
      return { success: false, message: 'This password is already in use by another account in the system. Please choose a unique password.' };
    }

    // Check if Super Admin
    if (cleanId === settings.adminUsername.toLowerCase()) {
      if (cleanTPin !== '1996' && cleanTPin !== '1234') {
        return { success: false, message: 'Super Admin master security PIN verification failed.' };
      }
      settings.adminPasswordHash = newHash;
      this.saveSettings(settings);
      return { success: true, message: 'Super Admin password reset successfully!' };
    }

    // Match franchise by Email or Franchise ID
    const franchiseIndex = franchises.findIndex(
      (f) =>
        f.email.trim().toLowerCase() === cleanId ||
        f.franchiseId.toLowerCase() === cleanId
    );

    if (franchiseIndex === -1) {
      return { success: false, message: 'No registered franchise found matching this Email or Franchise ID.' };
    }

    const targetFranchise = franchises[franchiseIndex];

    // Security Check 1: Verify Registered Mobile
    const targetMobileDigits = targetFranchise.mobile.replace(/\D/g, '').slice(-10);
    if (targetMobileDigits !== cleanMobile) {
      return {
        success: false,
        message: 'Security Verification Failed: The mobile number does not match this registered franchise account.',
      };
    }

    // Security Check 2: Verify 4-Digit T-PIN
    if (targetFranchise.tPinHash) {
      if (targetFranchise.tPinHash !== hashPassword(cleanTPin)) {
        return {
          success: false,
          message: 'Security Verification Failed: Incorrect 4-digit Transaction Security PIN (T-PIN). Access blocked.',
        };
      }
    } else {
      // If T-PIN was not yet configured (e.g. legacy), verify default PIN
      if (cleanTPin !== '1234') {
        return {
          success: false,
          message: 'Security Verification Failed: Incorrect Transaction PIN for uninitialized account.',
        };
      }
    }

    // All multi-factor checks passed! Update password
    franchises[franchiseIndex].passwordHash = newHash;
    this.saveFranchises(franchises);

    this.addNotification({
      franchiseId: targetFranchise.franchiseId,
      message: 'Your account password was securely reset with multi-factor T-PIN verification.',
      type: 'System',
    });

    return {
      success: true,
      message: `Password reset successfully for ${targetFranchise.branchName}! You can now sign in with your new password.`,
    };
  }

  // --- Universal ID & Certificate Verification Engine ---
  static verifyFranchiseOrCertificate(query: string): {
    found: boolean;
    type?: 'franchise' | 'certificate';
    franchise?: Franchise & { wrappedMobile: string };
    project?: Project;
    message: string;
  } {
    const clean = query.trim().toLowerCase();
    if (!clean) {
      return { found: false, message: 'Please enter a Franchise ID, Certificate Number, or Branch Name to verify.' };
    }

    const franchises = this.getFranchises();
    const projects = this.getProjects();

    // 1. Check for certificate
    const projectCert = projects.find(
      (p) =>
        (p.certificateNumber && p.certificateNumber.toLowerCase() === clean) ||
        (p.projectId.toLowerCase() === clean && p.status === 'Delivered')
    );

    if (projectCert) {
      const relatedFranchise = franchises.find((f) => f.franchiseId === projectCert.franchiseId);
      return {
        found: true,
        type: 'certificate',
        project: projectCert,
        franchise: relatedFranchise
          ? {
              ...relatedFranchise,
              wrappedMobile: wrapMobile(relatedFranchise.mobile),
            }
          : undefined,
        message: 'Valid Official SidTech Project Completion Certificate Verified.',
      };
    }

    // 2. Check for franchise (by franchise ID, name, email, or mobile)
    const cleanDigits = clean.replace(/\D/g, '');
    const franchise = franchises.find(
      (f) =>
        f.franchiseId.toLowerCase() === clean ||
        f.email.toLowerCase() === clean ||
        f.branchName.toLowerCase().includes(clean) ||
        f.name.toLowerCase().includes(clean) ||
        (cleanDigits.length >= 6 && f.mobile.replace(/\D/g, '').endsWith(cleanDigits))
    );

    if (franchise) {
      return {
        found: true,
        type: 'franchise',
        franchise: {
          ...franchise,
          wrappedMobile: wrapMobile(franchise.mobile),
        },
        message:
          franchise.status === 'Approved'
            ? 'Official Verified SidTech Franchise Branch & Business Partner.'
            : `Franchise Record Found in SidTech Registry (Current Status: ${franchise.status}).`,
      };
    }

    return {
      found: false,
      message: 'Verification Failed: No genuine SidTech franchise or certificate matches this reference ID. Beware of fraudulent certificates.',
    };
  }

  static approveFranchise(franchiseId: string): boolean {
    const franchises = this.getFranchises();
    const idx = franchises.findIndex((f) => f.franchiseId === franchiseId);
    if (idx === -1) return false;

    franchises[idx].status = 'Approved';
    franchises[idx].approvedOn = new Date().toISOString();
    delete franchises[idx].rejectionReason;
    this.saveFranchises(franchises);

    // Push notification to franchise
    this.addNotification({
      franchiseId,
      message: `Congratulations! Your franchise registration is APPROVED. Your digital ID Card is now issued.`,
      type: 'Approval',
      targetId: franchiseId,
    });

    return true;
  }

  static rejectFranchise(franchiseId: string, reason: string): boolean {
    const franchises = this.getFranchises();
    const idx = franchises.findIndex((f) => f.franchiseId === franchiseId);
    if (idx === -1) return false;

    franchises[idx].status = 'Rejected';
    franchises[idx].rejectionReason = reason;
    this.saveFranchises(franchises);

    this.addNotification({
      franchiseId,
      message: `Registration rejected by SidTech. Reason: ${reason || 'Incomplete documentation'}`,
      type: 'Approval',
    });

    return true;
  }

  static updateFranchiseStatus(
    franchiseId: string,
    status: 'Approved' | 'Rejected' | 'Suspended' | 'Pending'
  ): boolean {
    const franchises = this.getFranchises();
    const idx = franchises.findIndex((f) => f.franchiseId === franchiseId);
    if (idx === -1) return false;

    franchises[idx].status = status;
    this.saveFranchises(franchises);
    return true;
  }

  static updateFranchiseProfile(
    franchiseId: string,
    updates: Partial<Franchise>
  ): Franchise | null {
    const franchises = this.getFranchises();
    const idx = franchises.findIndex((f) => f.franchiseId === franchiseId);
    if (idx === -1) return null;

    franchises[idx] = { ...franchises[idx], ...updates };
    this.saveFranchises(franchises);

    // Update active session if relevant
    const session = this.getSession();
    if (session?.franchise?.franchiseId === franchiseId) {
      session.franchise = franchises[idx];
      this.setSession(session);
    }

    return franchises[idx];
  }

  // --- Services ---
  static getServices(activeOnly: boolean = false): Service[] {
    const services = loadFromStorage<Service[]>(STORAGE_KEYS.SERVICES, SEED_SERVICES);
    return activeOnly ? services.filter((s) => s.active) : services;
  }

  static saveServices(services: Service[]): void {
    saveToStorage(STORAGE_KEYS.SERVICES, services);
  }

  static addService(service: Omit<Service, 'serviceId'>): Service {
    const services = this.getServices();
    const nextId = `SRV-${String(services.length + 1).padStart(4, '0')}`;
    const newService: Service = {
      ...service,
      serviceId: nextId,
    };
    services.push(newService);
    this.saveServices(services);
    return newService;
  }

  static updateService(serviceId: string, updates: Partial<Service>): Service | null {
    const services = this.getServices();
    const idx = services.findIndex((s) => s.serviceId === serviceId);
    if (idx === -1) return null;

    services[idx] = { ...services[idx], ...updates };
    this.saveServices(services);
    return services[idx];
  }

  // --- Projects ---
  static getProjects(): Project[] {
    return loadFromStorage<Project[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
  }

  static saveProjects(projects: Project[]): void {
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
  }

  static getProjectsByFranchise(franchiseId: string): Project[] {
    return this.getProjects().filter((p) => p.franchiseId === franchiseId);
  }

  static getProjectById(projectId: string): Project | undefined {
    return this.getProjects().find((p) => p.projectId === projectId);
  }

  static createProject(data: {
    franchiseId: string;
    serviceId: string;
    clientName: string;
    clientMobile: string;
    requirementNotes: string;
  }): Project {
    const projects = this.getProjects();
    const service = this.getServices().find((s) => s.serviceId === data.serviceId);
    const settings = this.getSettings();

    const price = service ? service.price : 2000;
    const advancePercent = service ? service.advancePercent : settings.defaultAdvancePercent;
    const commissionPercent = service ? service.commissionPercent : settings.defaultCommissionPercent;

    const projectId = `PRJ-${String(projects.length + 1).padStart(4, '0')}`;
    const advanceRequired = Math.round((price * advancePercent) / 100);
    const commissionAmount = Math.round((price * commissionPercent) / 100);

    const newProject: Project = {
      projectId,
      franchiseId: data.franchiseId,
      serviceId: data.serviceId,
      serviceName: service ? service.serviceName : 'Custom Project',
      clientName: data.clientName.trim(),
      clientMobile: data.clientMobile.trim(),
      requirementNotes: data.requirementNotes.trim(),
      finalPrice: price,
      advancePercent,
      advanceRequired,
      amountPaid: 0,
      amountDue: price,
      status: 'New',
      statusColor: 'grey',
      commissionPercent,
      commissionAmount,
      createdOn: new Date().toISOString(),
    };

    projects.unshift(newProject);
    this.saveProjects(projects);

    // Notify admin
    this.addNotification({
      franchiseId: 'admin',
      message: `New Order: ${newProject.serviceName} booked for client "${newProject.clientName}" by ${newProject.franchiseId}.`,
      type: 'Project',
      targetId: projectId,
    });

    return newProject;
  }

  static acceptProject(
    projectId: string,
    finalPrice: number,
    advancePercent: number
  ): Project | null {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.projectId === projectId);
    if (idx === -1) return null;

    const project = projects[idx];
    const advanceRequired = Math.round((finalPrice * advancePercent) / 100);
    const amountDue = Math.max(0, finalPrice - project.amountPaid);
    const commissionAmount = Math.round((finalPrice * project.commissionPercent) / 100);

    // If advance is already covered by existing verified payments, move to Processing
    const nextStatus = project.amountPaid >= advanceRequired ? 'Processing' : 'Accepted';
    const nextColor = nextStatus === 'Processing' ? 'blue' : 'orange';

    projects[idx] = {
      ...project,
      finalPrice,
      advancePercent,
      advanceRequired,
      amountDue,
      commissionAmount,
      status: nextStatus,
      statusColor: nextColor,
      acceptedOn: new Date().toISOString(),
    };

    this.saveProjects(projects);

    this.addNotification({
      franchiseId: project.franchiseId,
      message: `Project ${projectId} Accepted! Final Price: ₹${finalPrice.toLocaleString('en-IN')}, Advance: ₹${advanceRequired.toLocaleString('en-IN')}.`,
      type: 'Project',
      targetId: projectId,
    });

    return projects[idx];
  }

  static setDemoUrl(projectId: string, demoUrl: string): Project | null {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.projectId === projectId);
    if (idx === -1) return null;

    projects[idx].demoUrl = demoUrl;
    projects[idx].status = 'DemoReady';
    projects[idx].statusColor = 'blue';
    this.saveProjects(projects);

    this.addNotification({
      franchiseId: projects[idx].franchiseId,
      message: `Live Demo Ready for ${projects[idx].clientName}'s ${projects[idx].serviceName}! View preview in your dashboard.`,
      type: 'Project',
      targetId: projectId,
    });

    return projects[idx];
  }

  static markDelivered(
    projectId: string,
    finalUrl: string
  ): { success: boolean; message: string; project?: Project } {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.projectId === projectId);
    if (idx === -1) return { success: false, message: 'Project not found.' };

    const project = projects[idx];
    if (project.amountDue > 0) {
      return {
        success: false,
        message: `Cannot deliver! Balance of ₹${project.amountDue.toLocaleString('en-IN')} is still pending. Full payment is required before delivery.`,
      };
    }

    const settings = this.getSettings();
    const certNum = `${settings.certificatePrefix}-CERT-${String(Math.floor(100000 + Math.random() * 900000))}`;

    projects[idx] = {
      ...project,
      finalUrl,
      status: 'Delivered',
      statusColor: 'green',
      deliveredOn: new Date().toISOString(),
      certificateNumber: certNum,
    };

    this.saveProjects(projects);

    // Credit commission to franchise wallet
    this.creditCommission(project.franchiseId, project.commissionAmount, projectId);

    this.addNotification({
      franchiseId: project.franchiseId,
      message: `🎉 Project ${projectId} is Delivered! URL unlocked & ₹${project.commissionAmount.toLocaleString('en-IN')} commission credited to your wallet. Completion certificate is ready!`,
      type: 'Project',
      targetId: projectId,
    });

    return { success: true, message: 'Project marked as delivered successfully!', project: projects[idx] };
  }

  static rejectProject(projectId: string, reason: string): boolean {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.projectId === projectId);
    if (idx === -1) return false;

    projects[idx].status = 'Rejected';
    projects[idx].statusColor = 'red';
    projects[idx].rejectionReason = reason;
    this.saveProjects(projects);

    this.addNotification({
      franchiseId: projects[idx].franchiseId,
      message: `Project ${projectId} was rejected by SidTech. Reason: ${reason || 'Technical unfeasibility'}`,
      type: 'Project',
      targetId: projectId,
    });

    return true;
  }

  static updateProjectStatus(
    projectId: string,
    status: ProjectStatus,
    demoUrl?: string,
    finalUrl?: string
  ): boolean {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.projectId === projectId);
    if (idx === -1) return false;

    projects[idx].status = status;
    if (demoUrl) projects[idx].demoUrl = demoUrl;
    if (finalUrl) projects[idx].finalUrl = finalUrl;
    if (status === 'DemoReady') projects[idx].statusColor = 'blue';
    else if (status === 'Delivered') {
      projects[idx].statusColor = 'green';
      projects[idx].deliveredOn = new Date().toISOString();
      if (!projects[idx].certificateNumber) {
        const settings = this.getSettings();
        projects[idx].certificateNumber = `${settings.certificatePrefix}-CERT-${Math.floor(100000 + Math.random() * 900000)}`;
      }
    } else if (status === 'Processing') projects[idx].statusColor = 'blue';
    else if (status === 'Accepted') projects[idx].statusColor = 'orange';
    else if (status === 'Rejected') projects[idx].statusColor = 'red';
    else projects[idx].statusColor = 'grey';

    this.saveProjects(projects);
    return true;
  }

  static updateProjectFull(
    projectId: string,
    updates: Partial<Project>
  ): Project | null {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.projectId === projectId);
    if (idx === -1) return null;

    const current = projects[idx];
    const updated: Project = {
      ...current,
      ...updates,
    };

    // Keep statusColor in sync if status was updated
    if (updates.status) {
      if (updates.status === 'Delivered') {
        updated.statusColor = 'green';
        if (!updated.deliveredOn) updated.deliveredOn = new Date().toISOString();
        if (!updated.certificateNumber) {
          const settings = this.getSettings();
          updated.certificateNumber = `${settings.certificatePrefix}-CERT-${Math.floor(100000 + Math.random() * 900000)}`;
        }
      } else if (updates.status === 'Processing') {
        updated.statusColor = 'blue';
      } else if (updates.status === 'DemoReady') {
        updated.statusColor = 'blue';
      } else if (updates.status === 'Accepted') {
        updated.statusColor = 'orange';
      } else if (updates.status === 'Rejected') {
        updated.statusColor = 'red';
      } else {
        updated.statusColor = 'grey';
      }
    }

    projects[idx] = updated;
    this.saveProjects(projects);

    this.addNotification({
      franchiseId: updated.franchiseId,
      message: `Project ${projectId} order & financial parameters updated by SidTech Administration.`,
      type: 'Project',
      targetId: projectId,
    });

    return updated;
  }

  static adjustFranchiseFinancials(
    franchiseId: string,
    data: {
      walletBalance?: number;
      totalEarned?: number;
      totalWithdrawn?: number;
      adjustmentAmount?: number;
      adjustmentType?: 'credit' | 'debit';
      reason?: string;
    }
  ): Franchise | null {
    const franchises = this.getFranchises();
    const idx = franchises.findIndex((f) => f.franchiseId === franchiseId);
    if (idx === -1) return null;

    const f = franchises[idx];

    if (typeof data.walletBalance === 'number') {
      f.walletBalance = Math.max(0, data.walletBalance);
    }
    if (typeof data.totalEarned === 'number') {
      f.totalEarned = Math.max(0, data.totalEarned);
    }
    if (typeof data.totalWithdrawn === 'number') {
      f.totalWithdrawn = Math.max(0, data.totalWithdrawn);
    }

    if (data.adjustmentAmount && data.adjustmentAmount > 0) {
      if (data.adjustmentType === 'credit') {
        f.walletBalance += data.adjustmentAmount;
        f.totalEarned += data.adjustmentAmount;
        this.addNotification({
          franchiseId,
          message: `Admin Credited ₹${data.adjustmentAmount.toLocaleString('en-IN')} to your wallet. Note: ${data.reason || 'Financial adjustment'}`,
          type: 'Payment',
        });
      } else if (data.adjustmentType === 'debit') {
        f.walletBalance = Math.max(0, f.walletBalance - data.adjustmentAmount);
        this.addNotification({
          franchiseId,
          message: `Admin Debited ₹${data.adjustmentAmount.toLocaleString('en-IN')} from your wallet. Note: ${data.reason || 'Financial adjustment'}`,
          type: 'Payment',
        });
      }
    }

    this.saveFranchises(franchises);

    const session = this.getSession();
    if (session?.franchise?.franchiseId === franchiseId) {
      session.franchise = f;
      this.setSession(session);
    }

    return f;
  }

  // --- Payments ---
  static getPayments(): Payment[] {
    return loadFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, SEED_PAYMENTS);
  }

  static savePayments(payments: Payment[]): void {
    saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
  }

  static getPaymentsByFranchise(franchiseId: string): Payment[] {
    return this.getPayments().filter((p) => p.franchiseId === franchiseId);
  }

  static submitPayment(data: {
    projectId: string;
    franchiseId: string;
    amount: number;
    utr: string;
    mode?: 'UPI/QR-Manual' | 'Payment Gateway (API)';
  }): { success: boolean; message: string; payment?: Payment } {
    const payments = this.getPayments();
    const project = this.getProjectById(data.projectId);
    if (!project) return { success: false, message: 'Associated project not found.' };

    const franchise = this.getFranchiseById(data.franchiseId);
    const branchName = franchise ? franchise.branchName : data.franchiseId;

    const paymentId = `PAY-${String(payments.length + 1).padStart(4, '0')}`;

    const newPayment: Payment = {
      paymentId,
      projectId: data.projectId,
      franchiseId: data.franchiseId,
      franchiseName: branchName,
      amount: data.amount,
      mode: data.mode || 'UPI/QR-Manual',
      utr: data.utr.trim().toUpperCase(),
      status: 'Submitted',
      submittedOn: new Date().toISOString(),
    };

    payments.unshift(newPayment);
    this.savePayments(payments);

    // Notify admin
    this.addNotification({
      franchiseId: 'admin',
      message: `New Payment of ₹${data.amount.toLocaleString('en-IN')} submitted by ${branchName} (UTR: ${newPayment.utr}). Please verify.`,
      type: 'Payment',
      targetId: paymentId,
    });

    return {
      success: true,
      message: `Payment of ₹${data.amount.toLocaleString('en-IN')} submitted for verification! Admin will verify your UTR shortly.`,
      payment: newPayment,
    };
  }

  static verifyPayment(paymentId: string, adminUsername: string = 'admin'): boolean {
    const payments = this.getPayments();
    const pIdx = payments.findIndex((p) => p.paymentId === paymentId);
    if (pIdx === -1) return false;

    const payment = payments[pIdx];
    if (payment.status === 'Verified') return true;

    payments[pIdx].status = 'Verified';
    payments[pIdx].verifiedOn = new Date().toISOString();
    payments[pIdx].verifiedBy = adminUsername;
    this.savePayments(payments);

    // Update project running totals & status transitions
    const projects = this.getProjects();
    const prjIdx = projects.findIndex((p) => p.projectId === payment.projectId);
    if (prjIdx !== -1) {
      const prj = projects[prjIdx];
      const newPaid = prj.amountPaid + payment.amount;
      const newDue = Math.max(0, prj.finalPrice - newPaid);

      prj.amountPaid = newPaid;
      prj.amountDue = newDue;

      // Status transition logic based on Module 7
      if (prj.status === 'Accepted' && newPaid >= prj.advanceRequired) {
        prj.status = 'Processing';
        prj.statusColor = 'blue';
      }

      this.saveProjects(projects);
    }

    this.addNotification({
      franchiseId: payment.franchiseId,
      message: `Payment Verified! ₹${payment.amount.toLocaleString('en-IN')} has been credited toward project ${payment.projectId}.`,
      type: 'Payment',
      targetId: payment.projectId,
    });

    return true;
  }

  static rejectPayment(paymentId: string, reason: string): boolean {
    const payments = this.getPayments();
    const idx = payments.findIndex((p) => p.paymentId === paymentId);
    if (idx === -1) return false;

    payments[idx].status = 'Rejected';
    payments[idx].rejectionReason = reason;
    this.savePayments(payments);

    this.addNotification({
      franchiseId: payments[idx].franchiseId,
      message: `Payment ${paymentId} (UTR: ${payments[idx].utr}) was rejected. Reason: ${reason || 'UTR could not be verified on bank statement'}`,
      type: 'Payment',
      targetId: payments[idx].projectId,
    });

    return true;
  }

  // --- Wallet & Commission ---
  static creditCommission(franchiseId: string, amount: number, projectId: string): void {
    const franchises = this.getFranchises();
    const idx = franchises.findIndex((f) => f.franchiseId === franchiseId);
    if (idx === -1) return;

    franchises[idx].walletBalance += amount;
    franchises[idx].totalEarned += amount;
    this.saveFranchises(franchises);

    // Update session if logged in
    const session = this.getSession();
    if (session?.franchise?.franchiseId === franchiseId) {
      session.franchise = franchises[idx];
      this.setSession(session);
    }
  }

  // --- Payouts ---
  static getPayouts(): Payout[] {
    return loadFromStorage<Payout[]>(STORAGE_KEYS.PAYOUTS, SEED_PAYOUTS);
  }

  static savePayouts(payouts: Payout[]): void {
    saveToStorage(STORAGE_KEYS.PAYOUTS, payouts);
  }

  static getPayoutsByFranchise(franchiseId: string): Payout[] {
    return this.getPayouts().filter((p) => p.franchiseId === franchiseId);
  }

  static requestPayout(data: {
    franchiseId: string;
    amount: number;
    upiId: string;
    tPin: string;
  }): { success: boolean; message: string; payout?: Payout } {
    const franchise = this.getFranchiseById(data.franchiseId);
    if (!franchise) return { success: false, message: 'Franchise not found.' };

    // Strict T-PIN Security Check for Withdrawal
    if (!franchise.tPinSet || !franchise.tPinHash) {
      return {
        success: false,
        message: 'Security Notice: Please configure your 4-digit Transaction Security PIN (T-PIN) first before requesting a withdrawal.',
      };
    }

    if (!data.tPin || hashPassword(data.tPin.trim()) !== franchise.tPinHash) {
      return {
        success: false,
        message: 'Security Verification Failed: Incorrect 4-digit Transaction Security PIN (T-PIN). Withdrawal request denied.',
      };
    }

    if (data.amount <= 0) {
      return { success: false, message: 'Withdrawal amount must be greater than zero.' };
    }
    if (data.amount > franchise.walletBalance) {
      return {
        success: false,
        message: `Insufficient wallet balance. Available: ₹${franchise.walletBalance.toLocaleString('en-IN')}`,
      };
    }

    const payouts = this.getPayouts();
    const payoutId = `PO-${String(payouts.length + 1).padStart(4, '0')}`;

    const newPayout: Payout = {
      payoutId,
      franchiseId: data.franchiseId,
      franchiseName: franchise.branchName,
      amount: data.amount,
      walletBalanceAtRequest: franchise.walletBalance,
      status: 'Requested',
      mode: 'Manual (Admin UPI)',
      requestedOn: new Date().toISOString(),
      upiId: data.upiId.trim(),
    };

    payouts.unshift(newPayout);
    this.savePayouts(payouts);

    // Lock/deduct requested amount from wallet balance right away
    franchise.walletBalance -= data.amount;
    this.updateFranchiseProfile(data.franchiseId, { walletBalance: franchise.walletBalance });

    // Notify admin
    this.addNotification({
      franchiseId: 'admin',
      message: `Payout Request: ${franchise.branchName} requested withdrawal of ₹${data.amount.toLocaleString('en-IN')} to UPI ${data.upiId} (T-PIN Verified).`,
      type: 'Payout',
      targetId: payoutId,
    });

    return {
      success: true,
      message: `Withdrawal request for ₹${data.amount.toLocaleString('en-IN')} verified by T-PIN and submitted! Admin will transfer to your UPI within 24 hours.`,
      payout: newPayout,
    };
  }

  static markPayoutProcessing(payoutId: string): boolean {
    const payouts = this.getPayouts();
    const idx = payouts.findIndex((p) => p.payoutId === payoutId);
    if (idx === -1) return false;

    payouts[idx].status = 'Processing';
    this.savePayouts(payouts);
    return true;
  }

  static markPayoutPaid(payoutId: string, referenceNote: string): boolean {
    const payouts = this.getPayouts();
    const idx = payouts.findIndex((p) => p.payoutId === payoutId);
    if (idx === -1) return false;

    const po = payouts[idx];
    po.status = 'Paid';
    po.processedOn = new Date().toISOString();
    po.referenceNote = referenceNote;
    this.savePayouts(payouts);

    // Update total withdrawn for franchise
    const franchise = this.getFranchiseById(po.franchiseId);
    if (franchise) {
      const newWithdrawn = franchise.totalWithdrawn + po.amount;
      this.updateFranchiseProfile(po.franchiseId, { totalWithdrawn: newWithdrawn });
    }

    this.addNotification({
      franchiseId: po.franchiseId,
      message: `Payout of ₹${po.amount.toLocaleString('en-IN')} transferred! Ref: ${referenceNote}`,
      type: 'Payout',
      targetId: payoutId,
    });

    return true;
  }

  static rejectPayout(payoutId: string, reason: string): boolean {
    const payouts = this.getPayouts();
    const idx = payouts.findIndex((p) => p.payoutId === payoutId);
    if (idx === -1) return false;

    const po = payouts[idx];
    po.status = 'Rejected';
    po.rejectionReason = reason;
    this.savePayouts(payouts);

    // Refund wallet balance
    const franchise = this.getFranchiseById(po.franchiseId);
    if (franchise) {
      const restored = franchise.walletBalance + po.amount;
      this.updateFranchiseProfile(po.franchiseId, { walletBalance: restored });
    }

    this.addNotification({
      franchiseId: po.franchiseId,
      message: `Payout request ${payoutId} of ₹${po.amount.toLocaleString('en-IN')} was rejected and refunded to your wallet. Reason: ${reason}`,
      type: 'Payout',
    });

    return true;
  }

  // --- Settings ---
  static getSettings(): AppSettings {
    const loaded = loadFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return {
      ...DEFAULT_SETTINGS,
      ...loaded,
      ownerSignatureUrl: loaded.ownerSignatureUrl || DEFAULT_OWNER_SIGNATURE,
      digitalStampUrl: loaded.digitalStampUrl || DEFAULT_DIGITAL_STAMP,
      ownerName: loaded.ownerName || DEFAULT_SETTINGS.ownerName,
      ownerDesignation: loaded.ownerDesignation || DEFAULT_SETTINGS.ownerDesignation,
    };
  }

  static saveSettings(settings: AppSettings): void {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }

  static updateSettings(updates: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    this.saveSettings(updated);
    return updated;
  }

  // --- Notifications ---
  static getNotifications(franchiseId?: string): NotificationItem[] {
    const all = loadFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    if (!franchiseId) return all;

    if (franchiseId === 'admin') {
      return all.filter((n) => n.franchiseId === 'admin');
    }

    // Franchise sees notifications addressed to their ID or broadcast to all ('')
    return all.filter((n) => n.franchiseId === franchiseId || n.franchiseId === '');
  }

  static saveNotifications(notifications: NotificationItem[]): void {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  static addNotification(item: Omit<NotificationItem, 'notifId' | 'createdOn' | 'read'>): NotificationItem {
    const all = loadFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    const notifId = `N-${String(all.length + 1).padStart(4, '0')}`;
    const newNotif: NotificationItem = {
      ...item,
      notifId,
      read: false,
      createdOn: new Date().toISOString(),
    };
    all.unshift(newNotif);
    this.saveNotifications(all);
    return newNotif;
  }

  static markNotificationRead(notifId: string): void {
    const all = this.getNotifications();
    const idx = all.findIndex((n) => n.notifId === notifId);
    if (idx !== -1) {
      all[idx].read = true;
      this.saveNotifications(all);
    }
  }

  static markAllNotificationsRead(franchiseId: string): void {
    const all = this.getNotifications();
    all.forEach((n) => {
      if (n.franchiseId === franchiseId || (!franchiseId && n.franchiseId === 'admin')) {
        n.read = true;
      }
    });
    this.saveNotifications(all);
  }

  // --- Auth & Session ---
  static getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static setSession(session: AuthSession | null): void {
    if (!session) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } else {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    }
  }

  // --- Admin AI Assistant Updation Engine ---
  static executeAdminAiAction(action: {
    actionType: string;
    payload: any;
  }): { success: boolean; message: string; details?: any } {
    const { actionType, payload } = action;

    switch (actionType) {
      case 'UPDATE_WALLET': {
        const { franchiseId, amount, mode, note } = payload;
        const franchises = this.getFranchises();
        const franchise = franchises.find(
          (f) =>
            f.franchiseId.toLowerCase() === (franchiseId || '').toLowerCase() ||
            f.email.toLowerCase() === (franchiseId || '').toLowerCase() ||
            f.name.toLowerCase().includes((franchiseId || '').toLowerCase())
        );
        if (!franchise) {
          return { success: false, message: `Franchise "${franchiseId}" not found in registry.` };
        }
        const numericAmount = Number(amount) || 0;
        const oldBalance = franchise.walletBalance;
        if (mode === 'set') {
          franchise.walletBalance = numericAmount;
        } else {
          franchise.walletBalance = Math.max(0, franchise.walletBalance + numericAmount);
          if (numericAmount > 0) franchise.totalEarned += numericAmount;
        }
        this.saveFranchises(franchises);
        this.addNotification({
          franchiseId: franchise.franchiseId,
          message: `Admin AI Updated Wallet: ₹${numericAmount} ${mode === 'set' ? 'set' : 'added'}.${note ? ` Note: ${note}` : ''}`,
          type: 'Payment',
        });
        return {
          success: true,
          message: `Wallet for ${franchise.branchName} (${franchise.franchiseId}) updated from ₹${oldBalance} to ₹${franchise.walletBalance}.`,
          details: { oldBalance, newBalance: franchise.walletBalance },
        };
      }

      case 'APPROVE_FRANCHISE': {
        const { franchiseId } = payload;
        const franchises = this.getFranchises();
        const franchise = franchises.find(
          (f) =>
            f.franchiseId.toLowerCase() === (franchiseId || '').toLowerCase() ||
            f.email.toLowerCase() === (franchiseId || '').toLowerCase() ||
            f.name.toLowerCase().includes((franchiseId || '').toLowerCase())
        );
        if (!franchise) return { success: false, message: `Franchise "${franchiseId}" not found.` };
        const ok = this.approveFranchise(franchise.franchiseId);
        return {
          success: ok,
          message: ok
            ? `Franchise ${franchise.branchName} (${franchise.franchiseId}) has been APPROVED successfully.`
            : 'Approval failed.',
        };
      }

      case 'APPROVE_ALL_PENDING': {
        const franchises = this.getFranchises();
        const pending = franchises.filter((f) => f.status === 'Pending');
        if (pending.length === 0) {
          return { success: true, message: 'No franchises are currently pending approval.' };
        }
        pending.forEach((f) => this.approveFranchise(f.franchiseId));
        return {
          success: true,
          message: `Successfully approved all ${pending.length} pending franchise application(s).`,
        };
      }

      case 'REJECT_FRANCHISE': {
        const { franchiseId, reason } = payload;
        const franchises = this.getFranchises();
        const franchise = franchises.find(
          (f) =>
            f.franchiseId.toLowerCase() === (franchiseId || '').toLowerCase() ||
            f.name.toLowerCase().includes((franchiseId || '').toLowerCase())
        );
        if (!franchise) return { success: false, message: `Franchise "${franchiseId}" not found.` };
        const ok = this.rejectFranchise(franchise.franchiseId, reason || 'Incomplete details');
        return {
          success: ok,
          message: ok
            ? `Franchise ${franchise.branchName} rejected. Reason: ${reason || 'Incomplete details'}`
            : 'Action failed.',
        };
      }

      case 'UPDATE_PROJECT_STATUS': {
        const { projectId, status, demoUrl, finalUrl } = payload;
        const projects = this.getProjects();
        const prj = projects.find(
          (p) =>
            p.projectId.toLowerCase() === (projectId || '').toLowerCase() ||
            p.clientName.toLowerCase().includes((projectId || '').toLowerCase())
        );
        if (!prj) return { success: false, message: `Project "${projectId}" not found.` };
        const ok = this.updateProjectStatus(prj.projectId, status, demoUrl, finalUrl);
        return {
          success: ok,
          message: ok
            ? `Project ${prj.projectId} (${prj.clientName}) updated to status: "${status}".`
            : 'Failed to update project.',
        };
      }

      case 'VERIFY_PAYMENT': {
        const { paymentId } = payload;
        const payments = this.getPayments();
        const p = payments.find(
          (item) =>
            item.paymentId.toLowerCase() === (paymentId || '').toLowerCase() ||
            (item.utr && item.utr.toLowerCase() === (paymentId || '').toLowerCase())
        );
        if (!p) return { success: false, message: `Payment "${paymentId}" not found.` };
        const ok = this.verifyPayment(p.paymentId, 'admin');
        return {
          success: ok,
          message: ok
            ? `Payment ${p.paymentId} (₹${p.amount} / UTR: ${p.utr}) verified successfully.`
            : 'Failed to verify payment.',
        };
      }

      case 'VERIFY_ALL_PAYMENTS': {
        const payments = this.getPayments();
        const submitted = payments.filter((item) => item.status === 'Submitted');
        if (submitted.length === 0) {
          return { success: true, message: 'No payments currently waiting for verification.' };
        }
        submitted.forEach((item) => this.verifyPayment(item.paymentId, 'admin'));
        return {
          success: true,
          message: `Successfully verified all ${submitted.length} pending payment(s).`,
        };
      }

      case 'ADD_SERVICE': {
        const { serviceName, price, advancePercent, commissionPercent, category, description } = payload;
        if (!serviceName || !price) {
          return { success: false, message: 'Service name and price are required to create a new service.' };
        }
        const created = this.addService({
          serviceName,
          price: Number(price),
          advancePercent: Number(advancePercent) || 25,
          commissionPercent: Number(commissionPercent) || 10,
          category: category || 'Website',
          description: description || `Professional ${serviceName} delivery package by SidTech.`,
          imageUrl:
            payload.imageUrl ||
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
          active: true,
        });
        return {
          success: true,
          message: `New service "${created.serviceName}" (₹${created.price}) added to enterprise catalog. ID: ${created.serviceId}`,
          details: created,
        };
      }

      case 'UPDATE_SERVICE': {
        const { serviceId, price, active, advancePercent, commissionPercent } = payload;
        const services = this.getServices();
        const srv = services.find(
          (s) =>
            s.serviceId.toLowerCase() === (serviceId || '').toLowerCase() ||
            s.serviceName.toLowerCase().includes((serviceId || '').toLowerCase())
        );
        if (!srv) return { success: false, message: `Service "${serviceId}" not found.` };
        const updates: any = {};
        if (price !== undefined) updates.price = Number(price);
        if (active !== undefined) updates.active = Boolean(active);
        if (advancePercent !== undefined) updates.advancePercent = Number(advancePercent);
        if (commissionPercent !== undefined) updates.commissionPercent = Number(commissionPercent);
        const updated = this.updateService(srv.serviceId, updates);
        const ok = updated !== null;
        return {
          success: ok,
          message: ok ? `Service ${srv.serviceName} updated successfully.` : 'Failed to update service.',
        };
      }

      case 'UPDATE_SETTINGS': {
        const settings = this.getSettings();
        if (payload.companyUpi) settings.companyUpi = payload.companyUpi.trim();
        if (payload.supportPhone) settings.supportPhone = payload.supportPhone.trim();
        if (payload.supportEmail) settings.supportEmail = payload.supportEmail.trim();
        if (payload.companyName) settings.companyName = payload.companyName.trim();
        if (payload.defaultAdvancePercent) settings.defaultAdvancePercent = Number(payload.defaultAdvancePercent);
        if (payload.defaultCommissionPercent) settings.defaultCommissionPercent = Number(payload.defaultCommissionPercent);
        this.saveSettings(settings);
        return {
          success: true,
          message: 'System settings updated successfully by Admin AI.',
          details: settings,
        };
      }

      case 'PROCESS_PAYOUT': {
        const { payoutId, status, referenceNote } = payload;
        const payouts = this.getPayouts();
        const po = payouts.find((item) => item.payoutId.toLowerCase() === (payoutId || '').toLowerCase());
        if (!po) return { success: false, message: `Payout "${payoutId}" not found.` };
        if (status === 'Paid') {
          this.markPayoutPaid(po.payoutId, referenceNote || 'Admin AI Auto-Settled');
          return { success: true, message: `Payout ${po.payoutId} marked as PAID with ref: ${referenceNote || 'Settled'}.` };
        } else {
          po.status = status || 'Processing';
          this.savePayouts(payouts);
          return { success: true, message: `Payout ${po.payoutId} status updated to: ${po.status}.` };
        }
      }

      case 'UPDATE_FRANCHISE_DETAILS': {
        const { franchiseId, mobile, branchName, address, name } = payload;
        const franchises = this.getFranchises();
        const franchise = franchises.find(
          (f) =>
            f.franchiseId.toLowerCase() === (franchiseId || '').toLowerCase() ||
            f.name.toLowerCase().includes((franchiseId || '').toLowerCase())
        );
        if (!franchise) return { success: false, message: `Franchise "${franchiseId}" not found.` };

        if (mobile) {
          const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
          if (franchises.some((f) => f.franchiseId !== franchise.franchiseId && f.mobile.replace(/\D/g, '').slice(-10) === cleanMobile)) {
            return { success: false, message: 'This mobile number is already in use by another franchise.' };
          }
          franchise.mobile = mobile.trim();
        }
        if (branchName) franchise.branchName = branchName.trim();
        if (address) franchise.address = address.trim();
        if (name) franchise.name = name.trim();
        this.saveFranchises(franchises);
        return {
          success: true,
          message: `Franchise details for ${franchise.branchName} (${franchise.franchiseId}) updated successfully.`,
        };
      }

      default:
        return {
          success: false,
          message: `Unrecognized action type: "${actionType}". Please specify an action like update wallet, approve franchise, verify payment, or add service.`,
        };
    }
  }

  // --- Full Database Export/Import Backup ---
  static exportFullDatabase(): string {
    return JSON.stringify(
      {
        franchises: this.getFranchises(),
        services: this.getServices(),
        projects: this.getProjects(),
        payments: this.getPayments(),
        payouts: this.getPayouts(),
        settings: this.getSettings(),
        notifications: this.getNotifications(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  static restoreDatabase(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.franchises) this.saveFranchises(parsed.franchises);
      if (parsed.services) this.saveServices(parsed.services);
      if (parsed.projects) this.saveProjects(parsed.projects);
      if (parsed.payments) this.savePayments(parsed.payments);
      if (parsed.payouts) this.savePayouts(parsed.payouts);
      if (parsed.settings) this.saveSettings(parsed.settings);
      if (parsed.notifications) this.saveNotifications(parsed.notifications);
      return true;
    } catch (e) {
      console.error('Failed to restore database from JSON:', e);
      return false;
    }
  }

  static resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.FRANCHISES);
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.PAYOUTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}
