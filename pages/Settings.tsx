import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, Select } from '../components/ui';
import { CURRENCIES, CurrencyCode, PaymentMethod, ReceivingAccount } from '../types';
import { useFinance } from '../context/FinanceContext';
import { User, Bell, Download, Trash2, CreditCard, Globe, Lock, Plus, Calendar, ShieldCheck, X, Landmark, Smartphone, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../src/lib/supabase";


const SettingsSection: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode, description?: string }> = ({ title, icon, children, description }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-slate-200 last:border-0">
        <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
                <div className="text-emerald-600">{icon}</div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
            </div>
            {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
        <div className="md:col-span-2">
            <Card className="p-6">
                {children}
            </Card>
        </div>
    </div>
);

const Settings: React.FC = () => {
    const { currency, setCurrency, user, updateUser, entries, deleteAccount, loading } = useFinance();
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email); 
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Payment Form State (Subscription)
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [cardForm, setCardForm] = useState({ brand: 'Visa', last4: '', expiry: '' });

    // Receiving Account State (Client Collection)
    const [isAddingReceiving, setIsAddingReceiving] = useState(false);
    const [receivingType, setReceivingType] = useState<ReceivingAccount['type']>('Bank Transfer');
    const [receivingDetails, setReceivingDetails] = useState({
        bankName: '', accountNumber: '', ifsc: '', holderName: '', 
        upiId: '', email: '', customNote: ''
    });

    const isPro = user.plan === 'Pro' || user.plan === 'Enterprise';

    // Sync local state with context once data is loaded
    useEffect(() => {
        if (!loading) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user, loading]);

    const handleSaveProfile = async () => {
        await updateUser({ name });
        alert("Profile updated successfully!");
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024) {
                alert("File size exceeds 500KB. Please choose a smaller image.");
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onloadend = async () => {
                const result = reader.result as string;
                await updateUser({ avatar: result });
                if (fileInputRef.current) fileInputRef.current.value = '';
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSendMonthlyReport = async () => {
    try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        if (!token) {
            alert("You must be logged in to send reports.");
            return;
        }

        const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-monthly-report`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!res.ok) {
            const text = await res.text();
            alert(text || "No data available for last month.");
            return;
        }

        alert("Monthly report has been sent to your email.");
    } catch (err) {
        console.error(err);
        alert("Failed to send monthly report.");
    }
};


    const generateCSV = () => {
        const headers = ['Date', 'Name', 'Description', 'Type', 'Amount', 'Currency', 'Payment Mode', 'Status'];
        const csvRows = [headers.join(',')];

        entries.forEach(entry => {
            const row = [
                `"${entry.date}"`, 
                `"${entry.name.replace(/"/g, '""')}"`,
                `"${(entry.description || '').replace(/"/g, '""')}"`,
                entry.type,
                entry.amount,
                currency,
                entry.paymentMode,
                entry.status
            ];
            csvRows.push(row.join(','));
        });

        return "\uFEFF" + csvRows.join("\n");
    };

    const handleExportCSV = () => {
        const csvContent = generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `finbook_complete_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("WARNING: Data cannot be recovered once account is deleted. Are you sure you want to proceed?")) {
            handleExportCSV();
            await deleteAccount();
            navigate('/');
        }
    };

    const handleNotificationToggle = (e: React.MouseEvent) => {
        if (!isPro) {
            e.preventDefault();
            if (window.confirm("Notifications are a Pro feature. Would you like to upgrade?")) {
                navigate('/pricing');
            }
        }
    };

    // --- Subscription Payment Methods Handlers ---
    const handleSaveCard = async () => {
        if (!cardForm.last4 || cardForm.last4.length !== 4) {
            alert("Please enter the last 4 digits of your card.");
            return;
        }
        if (!cardForm.expiry) {
            alert("Please enter an expiry date.");
            return;
        }

        const newCard: PaymentMethod = {
            id: Math.random().toString(36).substr(2, 9),
            brand: cardForm.brand as any,
            last4: cardForm.last4,
            expiry: cardForm.expiry
        };

        const currentMethods = user.paymentMethods || [];
        await updateUser({ paymentMethods: [...currentMethods, newCard] });
        
        setCardForm({ brand: 'Visa', last4: '', expiry: '' });
        setIsAddingCard(false);
    };

    const handleRemoveCard = async (id: string) => {
        if(window.confirm("Are you sure you want to remove this payment method?")) {
            const currentMethods = user.paymentMethods || [];
            await updateUser({ paymentMethods: currentMethods.filter(pm => pm.id !== id) });
        }
    };

    // --- Client Receiving Accounts Handlers ---
    const handleSaveReceiving = async () => {
        const newAccount: ReceivingAccount = {
            id: Math.random().toString(36).substr(2, 9),
            type: receivingType,
            label: receivingType, 
            details: { ...receivingDetails }
        };

        if (receivingType === 'Bank Transfer' && !receivingDetails.accountNumber) {
            alert("Please enter an account number.");
            return;
        }
        if (receivingType === 'UPI' && !receivingDetails.upiId) {
            alert("Please enter a UPI ID.");
            return;
        }

        const currentAccounts = user.receivingAccounts || [];
        await updateUser({ receivingAccounts: [...currentAccounts, newAccount] });
        
        setReceivingDetails({ bankName: '', accountNumber: '', ifsc: '', holderName: '', upiId: '', email: '', customNote: '' });
        setIsAddingReceiving(false);
    };

    const handleRemoveReceiving = async (id: string) => {
        if(window.confirm("Remove this payment collection method?")) {
             const currentAccounts = user.receivingAccounts || [];
             await updateUser({ receivingAccounts: currentAccounts.filter(acc => acc.id !== id) });
        }
    };

    if (loading) return null; // Logic handled by root buffering in App.tsx

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500">Manage your account preferences and security.</p>
            </div>

            <SettingsSection 
                title="Profile Information" 
                icon={<User className="w-5 h-5" />}
                description="Update your photo and personal details."
            >
                <div className="flex items-center gap-6 mb-6">
                    <img 
                        key={user.avatar}
                        src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'} 
                        alt="Avatar" 
                        className="w-16 h-16 rounded-full bg-slate-200 object-cover" 
                    />
                    <div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <Button variant="secondary" size="sm" onClick={handleAvatarClick}>Change Avatar</Button>
                        <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. Max 500KB.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Full Name</label>
                        <Input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Email Address</label>
                        <Input 
                            value={email} 
                            disabled 
                            className="bg-slate-50" 
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                </div>
            </SettingsSection>

            <SettingsSection
                title="Payment Collection Details"
                icon={<Landmark className="w-5 h-5" />}
                description="Add accounts where you want to receive payments (Bank, UPI, PayPal, etc.). These details will be added to your client reminders."
            >
                <div className="space-y-3">
                    {user.receivingAccounts && user.receivingAccounts.length > 0 ? (
                        user.receivingAccounts.map(acc => (
                            <div key={acc.id} className="flex items-start justify-between p-3 border border-slate-200 rounded-lg hover:border-emerald-200 transition-colors">
                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        {acc.type === 'Bank Transfer' && <Landmark className="w-5 h-5 text-emerald-600" />}
                                        {acc.type === 'UPI' && <Smartphone className="w-5 h-5 text-emerald-600" />}
                                        {(acc.type === 'PayPal' || acc.type === 'Wise') && <Globe className="w-5 h-5 text-blue-600" />}
                                        {(acc.type === 'Other' || acc.type === 'Crypto') && <Wallet className="w-5 h-5 text-slate-600" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{acc.type}</p>
                                        <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                                            {acc.type === 'Bank Transfer' && (
                                                <>
                                                    <p><span className="font-medium">Bank:</span> {acc.details.bankName}</p>
                                                    <p><span className="font-medium">Acc:</span> {acc.details.accountNumber}</p>
                                                    <p><span className="font-medium">IFSC:</span> {acc.details.ifsc}</p>
                                                </>
                                            )}
                                            {acc.type === 'UPI' && <p><span className="font-medium">VPA:</span> {acc.details.upiId}</p>}
                                            {(acc.type === 'PayPal' || acc.type === 'Wise') && <p><span className="font-medium">Email:</span> {acc.details.email}</p>}
                                            {acc.details.customNote && <p className="italic">{acc.details.customNote}</p>}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleRemoveReceiving(acc.id)} 
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        !isAddingReceiving && (
                             <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                <p className="text-sm text-slate-500">No payment collection details added.</p>
                            </div>
                        )
                    )}

                    {isAddingReceiving ? (
                        <div className="bg-slate-50 p-4 rounded-lg border border-emerald-200 mt-2 animate-in fade-in slide-in-from-top-2">
                             <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-semibold text-slate-900">Add Collection Method</h4>
                                <button onClick={() => setIsAddingReceiving(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 block mb-1.5">Type</label>
                                    <Select 
                                        value={receivingType} 
                                        onChange={(e) => setReceivingType(e.target.value as any)}
                                        className="h-9 text-sm"
                                    >
                                        <option value="Bank Transfer">Bank Transfer (IFSC/SWIFT)</option>
                                        <option value="UPI">UPI / VPA</option>
                                        <option value="PayPal">PayPal</option>
                                        <option value="Wise">Wise</option>
                                        <option value="Other">Other / Payment Link</option>
                                    </Select>
                                </div>

                                {receivingType === 'Bank Transfer' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <Input placeholder="Bank Name" value={receivingDetails.bankName} onChange={e => setReceivingDetails({...receivingDetails, bankName: e.target.value})} className="h-9 text-sm" />
                                        </div>
                                        <div className="col-span-1">
                                            <Input placeholder="Account Number" value={receivingDetails.accountNumber} onChange={e => setReceivingDetails({...receivingDetails, accountNumber: e.target.value})} className="h-9 text-sm" />
                                        </div>
                                        <div className="col-span-1">
                                            <Input placeholder="IFSC / SWIFT Code" value={receivingDetails.ifsc} onChange={e => setReceivingDetails({...receivingDetails, ifsc: e.target.value})} className="h-9 text-sm" />
                                        </div>
                                        <div className="col-span-2">
                                            <Input placeholder="Account Holder Name" value={receivingDetails.holderName} onChange={e => setReceivingDetails({...receivingDetails, holderName: e.target.value})} className="h-9 text-sm" />
                                        </div>
                                    </div>
                                )}

                                {receivingType === 'UPI' && (
                                     <div>
                                        <Input placeholder="UPI ID (e.g., user@okicici)" value={receivingDetails.upiId} onChange={e => setReceivingDetails({...receivingDetails, upiId: e.target.value})} className="h-9 text-sm" />
                                     </div>
                                )}

                                {(receivingType === 'PayPal' || receivingType === 'Wise') && (
                                     <div>
                                        <Input type="email" placeholder="Email Address / ID" value={receivingDetails.email} onChange={e => setReceivingDetails({...receivingDetails, email: e.target.value})} className="h-9 text-sm" />
                                     </div>
                                )}

                                <div className="col-span-2">
                                    <Input placeholder="Notes / Payment Link / Instructions" value={receivingDetails.customNote} onChange={e => setReceivingDetails({...receivingDetails, customNote: e.target.value})} className="h-9 text-sm" />
                                </div>

                                <div className="flex gap-2 justify-end pt-2">
                                    <Button variant="secondary" size="sm" onClick={() => setIsAddingReceiving(false)}>Cancel</Button>
                                    <Button size="sm" onClick={handleSaveReceiving}>Save Details</Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Button variant="secondary" size="sm" className="w-full mt-2" onClick={() => setIsAddingReceiving(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Payment Collection Method
                        </Button>
                    )}
                </div>
            </SettingsSection>

            <SettingsSection 
                title="Preferences" 
                icon={<Globe className="w-5 h-5" />}
                description="Localization and display settings."
            >
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Currency</label>
                    <Select 
                        value={currency} 
                        onChange={async (e) => await setCurrency(e.target.value as CurrencyCode)}
                    >
                        {Object.entries(CURRENCIES).map(([code, { label }]) => (
                            <option key={code} value={code}>{label}</option>
                        ))}
                    </Select>
                    <p className="text-xs text-slate-500">This symbol will be used throughout the application.</p>
                </div>
            </SettingsSection>

            <SettingsSection 
                title="Subscription" 
                icon={<ShieldCheck className="w-5 h-5" />}
                description="Manage your plan and billing details."
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-100 mb-6 gap-4 sm:gap-0">
                    <div>
                        <p className="font-medium text-emerald-900 flex items-center gap-2">
                            Current Plan: <span className="font-bold uppercase tracking-wider">{user.plan}</span>
                        </p>
                        {!isPro ? (
                            <p className="text-sm text-emerald-700">Upgrade to Pro to unlock PDF exports and unlimited history.</p>
                        ) : (
                            <p className="text-sm text-emerald-700">You have access to all premium features.</p>
                        )}
                    </div>
                    {!isPro && <Button size="sm" className="w-full sm:w-auto" onClick={() => navigate('/pricing')}>Upgrade</Button>}
                </div>
            </SettingsSection>

            <SettingsSection 
                title="Your Payment Methods" 
                icon={<CreditCard className="w-5 h-5" />}
                description="Manage cards used for your FinBook subscription."
            >
                <div className="space-y-3">
                    <p className="text-xs text-slate-500 mb-2">These payment methods are used for your own subscription billing, not for client invoices.</p>
                    {user.paymentMethods && user.paymentMethods.length > 0 ? (
                        user.paymentMethods.map(method => (
                            <div key={method.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-emerald-200 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                        {method.brand}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                                            •••• •••• •••• {method.last4}
                                        </p>
                                        <p className="text-xs text-slate-500">Expires {method.expiry}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleRemoveCard(method.id)} 
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        !isAddingCard && (
                            <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                <p className="text-sm text-slate-500">No payment methods saved for faster checkout.</p>
                            </div>
                        )
                    )}
                    
                    {isAddingCard ? (
                        <div className="bg-slate-50 p-4 rounded-lg border border-emerald-200 mt-2 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-semibold text-slate-900">New Payment Method</h4>
                                <button onClick={() => setIsAddingCard(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                 <div className="col-span-1">
                                    <label className="text-xs font-medium text-slate-500 block mb-1.5">Card Brand</label>
                                    <Select 
                                        value={cardForm.brand} 
                                        onChange={e => setCardForm({...cardForm, brand: e.target.value})}
                                        className="h-9 text-sm"
                                    >
                                        <option value="Visa">Visa</option>
                                        <option value="Mastercard">Mastercard</option>
                                        <option value="Amex">Amex</option>
                                    </Select>
                                 </div>
                                 <div className="col-span-1">
                                    <label className="text-xs font-medium text-slate-500 block mb-1.5">Last 4 Digits</label>
                                    <Input 
                                        value={cardForm.last4} 
                                        onChange={e => setCardForm({...cardForm, last4: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                                        placeholder="4242"
                                        maxLength={4}
                                        className="h-9 text-sm"
                                    />
                                 </div>
                                 <div className="col-span-2">
                                    <label className="text-xs font-medium text-slate-500 block mb-1.5">Expiry Date (MM/YY)</label>
                                    <Input 
                                        value={cardForm.expiry} 
                                        onChange={e => setCardForm({...cardForm, expiry: e.target.value})}
                                        placeholder="12/26"
                                        className="h-9 text-sm"
                                    />
                                 </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="secondary" size="sm" onClick={() => setIsAddingCard(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleSaveCard}>Save Card</Button>
                            </div>
                        </div>
                    ) : (
                        <Button variant="secondary" size="sm" className="w-full mt-2" onClick={() => setIsAddingCard(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Card for Faster Checkout
                        </Button>
                    )}
                </div>
            </SettingsSection>

            <SettingsSection 
                title="Notifications" 
                icon={<Bell className="w-5 h-5" />}
                description="Control how and when we contact you."
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             <div>
                                <p className="font-medium text-slate-900">Payment Reminders</p>
                                <p className="text-xs text-slate-500">Get notified when payments are due.</p>
                             </div>
                             {!isPro && <Lock className="w-3 h-3 text-amber-500" />}
                        </div>
                        <input 
                            type="checkbox" 
                            className="toggle-checkbox disabled:opacity-50" 
                            defaultChecked={isPro} 
                            disabled={!isPro}
                            onClick={handleNotificationToggle}
                        />
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection 
    title="Data & Privacy" 
    icon={<Download className="w-5 h-5" />}
    description="Export your data or delete your account."
>
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <p className="font-medium text-slate-900">Export All Data (CSV)</p>
            <Button variant="secondary" size="sm" onClick={handleExportCSV}>
                Export
            </Button>
        </div>

        {/* ✅ NEW MONTHLY REPORT BUTTON */}
        <div className="flex items-center justify-between">
            <p className="font-medium text-slate-900">
                Send Monthly Report to Email
            </p>
            <Button
                variant="secondary"
                size="sm"
                onClick={handleSendMonthlyReport}
            >
                Send
            </Button>
        </div>

        <hr className="border-slate-100" />

        <div className="pt-2">
            <Button variant="danger" className="w-full sm:w-auto" onClick={handleDeleteAccount}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
            </Button>
            <p className="text-xs text-slate-400 mt-2">
                This action is permanent and cannot be undone.
            </p>
        </div>
    </div>
</SettingsSection>

        </div>
    );
};

export default Settings;