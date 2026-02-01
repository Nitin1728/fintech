import React from 'react';
import { Card, Button } from '../components/ui';
import { useFinance } from '../context/FinanceContext';
import { CheckCircle, Info, AlertTriangle, CheckCheck } from 'lucide-react';

const Notifications: React.FC = () => {
    const { notifications, markAllNotificationsRead } = useFinance();

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                    <p className="text-sm text-slate-500 mt-1">Stay updated with your account activity.</p>
                </div>
                {notifications.some(n => n.unread) && (
                    <Button variant="secondary" size="sm" onClick={markAllNotificationsRead}>
                        <CheckCheck className="w-4 h-4 mr-2" />
                        Mark all as read
                    </Button>
                )}
            </div>

            <Card className="divide-y divide-slate-100">
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <div 
                            key={notif.id} 
                            className={`p-4 flex gap-4 transition-colors hover:bg-slate-50 ${notif.unread ? 'bg-slate-50/60' : ''}`}
                        >
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                notif.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                                {notif.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                                 notif.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <p className={`text-sm ${notif.unread ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                                        {notif.text}
                                    </p>
                                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{notif.time}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    {notif.type === 'success' ? 'Transaction completed successfully.' : 
                                     notif.type === 'warning' ? 'Action required.' : 'System update.'}
                                </p>
                            </div>
                            {notif.unread && (
                                <div className="flex-shrink-0 self-center">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Info className="w-6 h-6" />
                        </div>
                        <h3 className="text-slate-900 font-medium">No notifications</h3>
                        <p className="text-slate-500 text-sm mt-1">You're all caught up!</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Notifications;