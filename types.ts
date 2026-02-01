export enum EntryType {
  Received = 'Received',
  Sent = 'Sent',
  PendingIn = 'Pending In',
  PendingOut = 'Pending Out'
}

export enum PaymentMode {
  Cash = 'Cash',
  BankTransfer = 'Bank Transfer',
  CreditCard = 'Credit Card',
  UPI = 'UPI',
  Check = 'Check'
}

export interface FinanceEntry {
  id: string;
  name: string;
  amount: number;
  description: string;
  paymentMode: PaymentMode;
  date: string;
  type: EntryType;
  status: 'Completed' | 'Pending';
  clientEmail?: string;
  dueDate?: string;
}

export interface StatCardProps {
  title: string;
  amount: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  colorClass: string;
}

// Payment methods for the User to pay FinBook (Subscription)
export interface PaymentMethod {
  id: string;
  brand: 'Visa' | 'Mastercard' | 'Amex';
  last4: string;
  expiry: string;
}

// Payment methods for Clients to pay the User
export interface ReceivingAccount {
    id: string;
    type: 'Bank Transfer' | 'UPI' | 'PayPal' | 'Wise' | 'Crypto' | 'Other';
    label: string; // e.g., "Primary Bank"
    details: {
        bankName?: string;
        accountNumber?: string;
        ifsc?: string; // or SWIFT/IBAN
        holderName?: string;
        upiId?: string;
        email?: string; // For PayPal/Wise
        customNote?: string;
    }
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  billingCycle?: 'Monthly' | 'Yearly';
  nextBillingDate?: string;
  paymentMethods?: PaymentMethod[]; // For subscription
  receivingAccounts?: ReceivingAccount[]; // For collecting money
}

export interface AppNotification {
  id: number;
  type: 'success' | 'warning' | 'info';
  text: string;
  time: string;
  unread: boolean;
}

export type CurrencyCode = 'USD' | 'INR' | 'GBP' | 'KWD' | 'SAR' | 'CNY';

export const CURRENCIES: Record<CurrencyCode, { symbol: string, label: string }> = {
  USD: { symbol: '$', label: 'Dollar ($)' },
  INR: { symbol: '₹', label: 'Rupee (₹)' },
  GBP: { symbol: '£', label: 'Pound (£)' },
  KWD: { symbol: 'KD', label: 'Dinar (KD)' },
  SAR: { symbol: '﷼', label: 'Rial (﷼)' },
  CNY: { symbol: '¥', label: 'Yuan (¥)' },
};