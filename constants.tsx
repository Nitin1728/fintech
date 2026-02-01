import { FinanceEntry, EntryType, PaymentMode, AppNotification, User } from './types';
import { LayoutDashboard, PlusCircle, List, Settings, LogOut, PieChart, ShieldCheck, Zap, Users } from 'lucide-react';
import React from 'react';

export const APP_NAME = "FinBook";

export const MOCK_USER: User = {
  name: "Alex Johnson",
  email: "alex@finbook.io",
  avatar: "https://picsum.photos/200/200",
  plan: "Free"
};

// Helper to get dynamic dates so the dashboard looks alive
const getDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};

export const MOCK_ENTRIES: FinanceEntry[] = [
  { id: '1', name: 'Web Design Project', amount: 1200, description: 'Website redesign for Client A', paymentMode: PaymentMode.BankTransfer, date: getDate(2), type: EntryType.Received, status: 'Completed' },
  { id: '2', name: 'Office Rent', amount: 850, description: 'Monthly Office Rent', paymentMode: PaymentMode.BankTransfer, date: getDate(5), type: EntryType.Sent, status: 'Completed' },
  { id: '3', name: 'Consulting Fee', amount: 450, description: 'Hourly consultation', paymentMode: PaymentMode.CreditCard, date: getDate(12), type: EntryType.PendingIn, status: 'Pending' },
  { id: '4', name: 'Software License', amount: 49, description: 'Monthly Adobe Sub', paymentMode: PaymentMode.CreditCard, date: getDate(15), type: EntryType.Sent, status: 'Completed' },
  { id: '5', name: 'Logo Design', amount: 300, description: 'Startup logo package', paymentMode: PaymentMode.UPI, date: getDate(25), type: EntryType.PendingIn, status: 'Pending' },
  { id: '6', name: 'Server Costs', amount: 120, description: 'AWS Yearly', paymentMode: PaymentMode.CreditCard, date: getDate(40), type: EntryType.PendingOut, status: 'Pending' },
  { id: '7', name: 'App Development', amount: 3500, description: 'Mobile app milestone 1', paymentMode: PaymentMode.BankTransfer, date: getDate(45), type: EntryType.Received, status: 'Completed' },
  { id: '8', name: 'Marketing Campaign', amount: 600, description: 'Facebook Ads', paymentMode: PaymentMode.CreditCard, date: getDate(50), type: EntryType.Sent, status: 'Completed' },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
    { id: 1, type: 'success', text: "Payment received from Client A", time: "2 hours ago", unread: true },
    { id: 2, type: 'warning', text: "Office Rent is due tomorrow", time: "5 hours ago", unread: true },
    { id: 3, type: 'info', text: "New feature: PDF Exports available", time: "1 day ago", unread: false },
    { id: 4, type: 'info', text: "Welcome to FinBook! Complete your profile.", time: "2 days ago", unread: false },
];

export const SIDEBAR_ITEMS = [
  { label: 'Dashboard', path: '/app/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Add Entry', path: '/app/add-entry', icon: <PlusCircle className="w-5 h-5" /> },
  { label: 'Entries', path: '/app/entries', icon: <List className="w-5 h-5" /> },
  { label: 'Settings', path: '/app/settings', icon: <Settings className="w-5 h-5" /> },
];

export const LANDING_FEATURES = [
  { title: "Finance Diary", desc: "Keep a meticulous record of every penny efficiently.", icon: <List className="text-emerald-600" /> },
  { title: "Payment Tracking", desc: "Never lose track of pending receivables again.", icon: <PieChart className="text-emerald-600" /> },
  { title: "Email Reminders", desc: "Automated gentle nudges for overdue payments.", icon: <Zap className="text-emerald-600" /> },
  { title: "Bank-Grade Security", desc: "256-bit encryption keeps your data private.", icon: <ShieldCheck className="text-emerald-600" /> },
];