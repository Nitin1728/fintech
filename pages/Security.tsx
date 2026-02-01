import React from 'react';
import { Card, Button } from '../components/ui';
import { ShieldCheck, Lock, Server, EyeOff, Key } from 'lucide-react';
import { Link } from 'react-router-dom';

const SecurityFeature = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="flex gap-4 items-start">
        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{desc}</p>
        </div>
    </div>
);

const Security: React.FC = () => {
    return (
        <div className="bg-slate-50 min-h-screen py-12">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium mb-6">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Bank-Grade Security Standard</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Your security is our priority</h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                    We use enterprise-grade encryption and security practices to keep your financial data safe, private, and accessible only to you.
                </p>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <Card className="p-8 border-t-4 border-t-emerald-500">
                        <SecurityFeature 
                            icon={<Lock className="w-6 h-6 text-emerald-600" />}
                            title="256-bit Encryption"
                            desc="All data transmitted between your device and our servers is encrypted using 256-bit SSL/TLS encryption, the same level of security used by major banks."
                        />
                    </Card>
                    <Card className="p-8 border-t-4 border-t-emerald-500">
                        <SecurityFeature 
                            icon={<Server className="w-6 h-6 text-emerald-600" />}
                            title="Secure Infrastructure"
                            desc="We host our servers in world-class data centers with 24/7 physical security, biometric access controls, and redundant power systems."
                        />
                    </Card>
                    <Card className="p-8 border-t-4 border-t-emerald-500">
                        <SecurityFeature 
                            icon={<EyeOff className="w-6 h-6 text-emerald-600" />}
                            title="Private by Design"
                            desc="We do not sell your data to advertisers. Your financial records are yours alone. Our staff cannot access your data without your explicit permission."
                        />
                    </Card>
                    <Card className="p-8 border-t-4 border-t-emerald-500">
                        <SecurityFeature 
                            icon={<Key className="w-6 h-6 text-emerald-600" />}
                            title="Strict Access Controls"
                            desc="We employ strict access control policies. Multi-factor authentication is required for all administrative access to our systems."
                        />
                    </Card>
                </div>

                {/* Trust Badge Section */}
                <div className="bg-emerald-900 rounded-2xl p-8 md:p-16 text-center text-white relative overflow-hidden">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                     <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Your Trust Matters</h2>
                        <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-8">
                            Security is not a feature, it's a foundation. If you have any concerns or have found a vulnerability, please contact our security team immediately.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/contact">
                                <Button className="bg-white text-emerald-900 hover:bg-emerald-50 border-none">Contact Security Team</Button>
                            </Link>
                            <Link to="/auth/signup">
                                <Button variant="outline" className="text-white border-emerald-400 hover:bg-emerald-800">Create Secure Account</Button>
                            </Link>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default Security;