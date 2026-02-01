import React, { useState } from 'react';
import { Card, Button, Input, Select } from '../components/ui';
import { EntryType, FinanceEntry } from '../types';
import { 
    Search, Download, FileText, Check, Trash2, Pencil, 
    ArrowDownCircle, ArrowUpCircle, Bell, Clock, AlertCircle, Lock 
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Corrected import

const Entries: React.FC = () => {
    const { entries, deleteEntry, updateEntry, formatAmount, currency, user } = useFinance();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const navigate = useNavigate();
    
    const isPro = user.plan === 'Pro' || user.plan === 'Enterprise';

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const hiddenCount = !isPro 
        ? entries.filter(e => new Date(e.date) < sixMonthsAgo).length 
        : 0;

    const filteredEntries = entries.filter(e => {
        if (!isPro) {
            const entryDate = new Date(e.date);
            if (entryDate < sixMonthsAgo) return false;
        }

        const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (e.description || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === '' || e.type === typeFilter;

        let matchesDate = true;
        if (dateFilter) {
            const entryDate = new Date(e.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dateFilter === '30') {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(today.getDate() - 30);
                matchesDate = entryDate >= thirtyDaysAgo;
            } else if (dateFilter === '90') {
                const ninetyDaysAgo = new Date();
                ninetyDaysAgo.setDate(today.getDate() - 90);
                matchesDate = entryDate >= ninetyDaysAgo;
            } else if (dateFilter === 'year') {
                matchesDate = entryDate.getFullYear() === today.getFullYear();
            }
        }

        return matchesSearch && matchesType && matchesDate;
    });

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation(); 
        if (window.confirm('Are you sure you want to delete this entry?')) {
            deleteEntry(id);
        }
    };

    const handleMarkStatus = (e: React.MouseEvent, id: string, action: 'Received' | 'Paid') => {
        e.stopPropagation();
        const entry = entries.find(e => e.id === id);
        if (entry) {
            updateEntry({
                ...entry,
                status: 'Completed',
                type: action === 'Received' ? EntryType.Received : EntryType.Sent
            });
        }
    };

    const handleSendReminder = (e: React.MouseEvent, entry: FinanceEntry) => {
        e.stopPropagation();
        if (!isPro) {
            if (window.confirm("Email Reminders are a Pro feature. Would you like to upgrade?")) {
                navigate('/pricing');
            }
            return;
        }
        if (!entry.clientEmail) {
            alert("Please add a client email to this entry first.");
            navigate(`/app/edit-entry/${entry.id}`);
            return;
        }

        const subject = `Payment Reminder: ${entry.name}`;
        let body = `Dear Client,\n\nI hope this email finds you well.\n\nThis is a friendly reminder regarding the pending payment of ${formatAmount(entry.amount)} for "${entry.name}".`;

        if (entry.dueDate) {
            const due = new Date(entry.dueDate);
            const today = new Date();
            today.setHours(0,0,0,0);
            const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                 body += `\n\nThe payment was due on ${entry.dueDate} and is now ${Math.abs(diffDays)} days overdue.`;
            } else if (diffDays === 0) {
                 body += `\n\nThe payment is due today, ${entry.dueDate}.`;
            } else {
                 body += `\n\nThe payment is due on ${entry.dueDate} (${diffDays} days remaining).`;
            }
        }

        if (user.receivingAccounts && user.receivingAccounts.length > 0) {
            body += `\n\n------------------------\nPAYMENT DETAILS\n------------------------`;
            user.receivingAccounts.forEach(acc => {
                body += `\n\n${acc.type.toUpperCase()}`;
                if (acc.type === 'Bank Transfer') {
                    if(acc.details.bankName) body += `\nBank: ${acc.details.bankName}`;
                    if(acc.details.accountNumber) body += `\nAcc No: ${acc.details.accountNumber}`;
                    if(acc.details.ifsc) body += `\nIFSC/SWIFT: ${acc.details.ifsc}`;
                    if(acc.details.holderName) body += `\nHolder: ${acc.details.holderName}`;
                } else if (acc.type === 'UPI') {
                    body += `\nVPA/ID: ${acc.details.upiId}`;
                } else if (acc.type === 'PayPal' || acc.type === 'Wise') {
                    body += `\nID: ${acc.details.email}`;
                }
            });
        }
        body += `\n\nPlease arrange the payment at your earliest convenience.\n\nThank you,\n${user.name}`;
        window.location.href = `mailto:${entry.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const renderDueDateInfo = (entry: FinanceEntry) => {
        if (entry.status === 'Completed' || !entry.dueDate) return null;
        const due = new Date(entry.dueDate);
        const today = new Date();
        today.setHours(0,0,0,0);
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return <span className="text-xs text-red-600 font-medium flex items-center mt-1"><AlertCircle className="w-3 h-3 mr-1"/> {Math.abs(diffDays)} days overdue</span>;
        } else if (diffDays <= 3) {
            return <span className="text-xs text-amber-600 font-medium flex items-center mt-1"><Clock className="w-3 h-3 mr-1"/> Due in {diffDays} days</span>;
        }
        return <span className="text-xs text-slate-400 mt-1">Due: {entry.dueDate}</span>;
    };

    // Export to CSV - Fixed using Blob
    const handleExportCSV = () => {
        const headers = ['Date', 'Name', 'Description', 'Type', 'Amount', 'Currency', 'Payment Mode', 'Status', 'Due Date', 'Client Email'];
        const rows = filteredEntries.map(entry => [
            entry.date,
            `"${entry.name.replace(/"/g, '""')}"`,
            `"${(entry.description || '').replace(/"/g, '""')}"`,
            entry.type,
            entry.amount,
            currency,
            entry.paymentMode,
            entry.status,
            entry.dueDate || '',
            entry.clientEmail || ''
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `finbook_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export to PDF - Fixed autoTable syntax
    const handleExportPDF = () => {
        if (!isPro) {
            if (window.confirm("PDF Reports are a Pro feature. Would you like to upgrade?")) {
                navigate('/pricing');
            }
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("FinBook Financial Report", 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Generated by: ${user.name}`, 14, 35);
        
        const totalIncome = filteredEntries
            .filter(e => e.type === EntryType.Received || e.type === EntryType.PendingIn)
            .reduce((sum, e) => sum + e.amount, 0);
        const totalExpense = filteredEntries
            .filter(e => e.type === EntryType.Sent || e.type === EntryType.PendingOut)
            .reduce((sum, e) => sum + e.amount, 0);

        doc.text(`Total Income: ${formatAmount(totalIncome)}`, 14, 45);
        doc.text(`Total Expenses: ${formatAmount(totalExpense)}`, 14, 50);

        const tableColumn = ["Date", "Name", "Type", "Status", "Amount", "Mode"];
        const tableRows = filteredEntries.map(entry => [
            entry.date,
            entry.name,
            entry.type,
            entry.status,
            `${entry.type === EntryType.Sent || entry.type === EntryType.PendingOut ? '-' : '+'}${entry.amount.toFixed(2)} ${currency}`,
            entry.paymentMode,
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            theme: 'grid',
            headStyles: { fillColor: [5, 150, 105] },
        });

        doc.save(`finbook_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Entries</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage and track all your financial records.</p>
                </div>
                <div className="flex items-center gap-2">
                     <Button variant="secondary" size="sm" className="hidden sm:flex" onClick={handleExportCSV}>
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleExportPDF} className="relative">
                        {!isPro && <Lock className="w-3 h-3 absolute -top-1 -right-1 text-amber-500 bg-white rounded-full" />}
                        <FileText className="w-4 h-4 mr-2" />
                        PDF Report
                    </Button>
                </div>
            </div>

            {hiddenCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-full text-amber-700 flex-shrink-0">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-amber-900">{hiddenCount} older entries are hidden</p>
                            <p className="text-xs text-amber-700">Free plan stores history for 6 months. Upgrade to access unlimited history.</p>
                        </div>
                    </div>
                    <Button size="sm" className="w-full sm:w-auto" onClick={() => navigate('/pricing')}>Upgrade to Pro</Button>
                </div>
            )}

            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input 
                            placeholder="Search by name or description..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select className="w-full sm:w-40" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option value="">All Types</option>
                            <option value={EntryType.Received}>Received</option>
                            <option value={EntryType.PendingIn}>Pending In</option>
                            <option value={EntryType.PendingOut}>Pending Out</option>
                            <option value={EntryType.Sent}>Expenses</option>
                        </Select>
                        <Select className="w-full sm:w-40" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                            <option value="">All Time</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                            <option value="year">This Year</option>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Details</th>
                                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Amount</th>
                                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredEntries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap align-top">{entry.date}</td>
                                    <td className="py-3 px-4 align-top">
                                        <div className="font-medium text-slate-900">{entry.name}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{entry.description}</div>
                                        {renderDueDateInfo(entry)}
                                    </td>
                                    <td className="py-3 px-4 align-top">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                            entry.type === EntryType.Received ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            entry.type === EntryType.PendingIn ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            entry.type === EntryType.PendingOut ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                            'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                            {entry.type}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 align-top">
                                         {entry.status === 'Completed' ? (
                                            <div className="flex items-center text-emerald-600 text-xs font-medium">
                                                <Check className="w-3 h-3 mr-1" />
                                                {entry.type === EntryType.Sent || entry.type === EntryType.PendingOut ? 'Paid' : 'Received'}
                                            </div>
                                         ) : (
                                            <div className="flex items-center text-amber-600 text-xs font-medium">Pending</div>
                                         )}
                                    </td>
                                    <td className="py-3 px-4 text-right font-medium align-top">
                                        {entry.type === EntryType.Sent || entry.type === EntryType.PendingOut ? '-' : ''}{formatAmount(entry.amount)}
                                    </td>
                                    <td className="py-3 px-4 text-right align-top">
                                        <div className="flex items-center justify-end gap-2">
                                            {entry.status === 'Pending' && entry.type === EntryType.PendingIn && (
                                                <button onClick={(e) => handleSendReminder(e, entry)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title={isPro ? "Send Payment Reminder" : "Upgrade to Pro for Reminders"}>
                                                    {isPro ? <Bell className="w-4 h-4" /> : <Lock className="w-3 h-3 text-slate-300" />}
                                                </button>
                                            )}
                                            {entry.status === 'Pending' && entry.type === EntryType.PendingIn && (
                                                <button onClick={(e) => handleMarkStatus(e, entry.id, 'Received')} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Mark as Received">
                                                    <ArrowDownCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {entry.status === 'Pending' && entry.type === EntryType.PendingOut && (
                                                <button onClick={(e) => handleMarkStatus(e, entry.id, 'Paid')} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Mark as Paid">
                                                    <ArrowUpCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); navigate(`/app/edit-entry/${entry.id}`); }} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Edit">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={(e) => handleDelete(e, entry.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredEntries.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No entries found matching your criteria.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Entries;