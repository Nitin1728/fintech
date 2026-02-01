import React from 'react';
import { Button, Card } from '../components/ui';
import { Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';

const PricingItem = ({ included, text }: { included: boolean, text: string }) => (
    <li className="flex items-center gap-3 text-sm">
        {included ? (
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-emerald-600" />
            </div>
        ) : (
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <X className="w-3 h-3 text-slate-400" />
            </div>
        )}
        <span className="text-slate-700">{text}</span>
    </li>
);

const Pricing: React.FC = () => {
    const { upgradeToPro, user } = useFinance(); 
    const navigate = useNavigate();
    
    const handleUpgrade = (cycle: 'Monthly' | 'Yearly') => {
        upgradeToPro(cycle);
        // Navigate to settings so the user can see their active subscription and billing date immediately
        navigate('/app/settings'); 
    };

    // Get default payment method for faster checkout UI
    const defaultPaymentMethod = user.paymentMethods && user.paymentMethods.length > 0 ? user.paymentMethods[0] : null;

    return (
        <div className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">Start for free, upgrade when you need power.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Free Plan */}
                    <Card className="p-8 flex flex-col relative border-slate-200">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Free</h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-extrabold text-slate-900">$0</span>
                                <span className="ml-1 text-slate-500">/lifetime</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">Perfect for individuals just starting out.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <PricingItem included={true} text="Unlimited entries" />
                            <PricingItem included={true} text="Dashboard overview" />
                            <PricingItem included={true} text="Pending tracking" />
                            <PricingItem included={true} text="CSV Export" />
                            <PricingItem included={false} text="PDF Reports" />
                            <PricingItem included={false} text="Email Reminders" />
                        </ul>
                        <Link to="/auth/signup">
                            <Button variant="secondary" className="w-full">Start Free</Button>
                        </Link>
                    </Card>

                    {/* Pro Yearly - BEST VALUE */}
                    <Card className="p-8 flex flex-col relative border-2 border-emerald-500 shadow-xl scale-105 z-10">
                        <div className="absolute top-0 right-0 -mt-3 -mr-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md">
                                BEST VALUE
                            </span>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-emerald-700">Pro Yearly</h3>
                            <div className="mt-4">
                                <span className="text-sm text-slate-400 line-through decoration-red-500">$144</span>
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-extrabold text-slate-900">$99</span>
                                    <span className="ml-1 text-slate-500">/year</span>
                                </div>
                            </div>
                            <p className="mt-2 text-sm text-emerald-600 font-medium">Save $45 (31%) today!</p>
                            <div className="mt-2 text-xs bg-amber-50 text-amber-700 p-2 rounded border border-amber-200">
                                Limited-time annual discount
                            </div>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <PricingItem included={true} text="Everything in Free" />
                            <PricingItem included={true} text="Advanced PDF Reports" />
                            <PricingItem included={true} text="Automated Email Reminders" />
                            <PricingItem included={true} text="Priority Support" />
                            <PricingItem included={true} text="Custom Categories" />
                        </ul>
                        <Button 
                            className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg"
                            onClick={() => handleUpgrade('Yearly')}
                        >
                            {defaultPaymentMethod 
                                ? `Pay with ${defaultPaymentMethod.brand} •••• ${defaultPaymentMethod.last4}` 
                                : "Upgrade & Save $45"}
                        </Button>
                        <p className="text-xs text-center mt-3 text-slate-400">30-day money-back guarantee</p>
                    </Card>

                    {/* Pro Monthly - DECOY */}
                    <Card className="p-8 flex flex-col relative border-slate-200 bg-slate-50/50">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Pro Monthly</h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-extrabold text-slate-900">$12</span>
                                <span className="ml-1 text-slate-500">/month</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">Flexibility for short-term projects.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                             <PricingItem included={true} text="Everything in Free" />
                            <PricingItem included={true} text="Advanced PDF Reports" />
                            <PricingItem included={true} text="Automated Email Reminders" />
                            <PricingItem included={true} text="Standard Support" />
                            <PricingItem included={false} text="Annual Savings" />
                        </ul>
                         <Button variant="secondary" className="w-full" onClick={() => handleUpgrade('Monthly')}>
                            {defaultPaymentMethod 
                                ? `Pay with ${defaultPaymentMethod.brand} •••• ${defaultPaymentMethod.last4}` 
                                : "Upgrade Monthly"}
                         </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Pricing;