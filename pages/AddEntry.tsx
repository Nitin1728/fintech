import React, { useState } from 'react';
import { Card, Button, Input, Select } from '../components/ui';
import { EntryType, PaymentMode, CURRENCIES } from '../types';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';

const AddEntry: React.FC = () => {
    const navigate = useNavigate();
    const { addEntry, currency } = useFinance();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [type, setType] = useState<EntryType>(EntryType.Received);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMode: PaymentMode.Cash,
        description: '',
        clientEmail: '',
        dueDate: ''
    });

    const currencyInfo = CURRENCIES[currency];
    const symbolLength = currencyInfo.symbol.length;
    const amountPlaceholder = currency === 'KWD' ? '0.000' : '0.00';
    const inputPadding = symbolLength > 2 ? 'pl-12' : symbolLength > 1 ? 'pl-10' : 'pl-7';

    const isPending = type === EntryType.PendingIn || type === EntryType.PendingOut;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const parsedAmount = parseFloat(formData.amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            alert("Please enter a valid positive amount.");
            return;
        }

        setIsSubmitting(true);

        try {
            await addEntry({
                name: formData.name,
                amount: parsedAmount,
                date: formData.date,
                paymentMode: formData.paymentMode,
                description: formData.description,
                type: type,
                clientEmail: type === EntryType.PendingIn ? formData.clientEmail : undefined,
                dueDate: isPending ? formData.dueDate : undefined
            });

            navigate('/app/entries');
        } catch (error) {
            console.error("Failed to save entry:", error);
            alert("Failed to save entry. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-slate-900">Add New Entry</h1>
            </div>

            <Card className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Entry Type</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {Object.values(EntryType).map((t) => (
                                <button
                                    type="button"
                                    key={t}
                                    onClick={() => setType(t)}
                                    className={`
                                        py-2 px-3 text-sm font-medium rounded-lg border transition-all
                                        ${type === t 
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' 
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-slate-50'}
                                    `}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Name / Title</label>
                            <Input 
                                placeholder="e.g. Website Design" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium select-none">
                                    {currencyInfo.symbol}
                                </span>
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    min="0.01"
                                    placeholder={amountPlaceholder}
                                    className={inputPadding} 
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Date</label>
                            <Input 
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Payment Mode</label>
                            <Select
                                value={formData.paymentMode}
                                onChange={(e) => setFormData({...formData, paymentMode: e.target.value as PaymentMode})}
                            >
                                {Object.values(PaymentMode).map((mode) => (
                                    <option key={mode} value={mode}>{mode}</option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    {isPending && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Due Date</label>
                                <Input 
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                />
                            </div>
                            {type === EntryType.PendingIn && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Client Email (for reminders)</label>
                                    <Input 
                                        type="email"
                                        placeholder="client@example.com"
                                        value={formData.clientEmail}
                                        onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Description (Optional)</label>
                        <textarea 
                            className="flex min-h-[100px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            placeholder="Add more details about this entry..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            <Save className="w-4 h-4 mr-2" />
                            {isSubmitting ? 'Saving...' : 'Save Entry'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AddEntry;
