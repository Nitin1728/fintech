import React from 'react';
import { Card, Button } from '../components/ui';
import { Code, BarChart, Smartphone, Globe, Headphones, Database, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ icon, title, desc, features }: { icon: React.ReactNode, title: string, desc: string, features: string[] }) => (
    <Card className="p-8 hover:shadow-lg transition-all border-t-4 border-t-emerald-500 h-full flex flex-col">
        <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 mb-6">{desc}</p>
        <ul className="space-y-3 mt-auto">
            {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <div className="mt-8 pt-6 border-t border-slate-100">
             <Link to="/contact">
                <Button variant="secondary" className="w-full">Get a Quote</Button>
             </Link>
        </div>
    </Card>
);

const Services: React.FC = () => {
    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Enterprise & Custom Services</h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Beyond our core SaaS platform, we offer specialized financial technology services for businesses with unique needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    <ServiceCard 
                        icon={<Code className="w-8 h-8 text-emerald-600" />}
                        title="Custom Website Development"
                        desc="We build high-performance, secure financial websites and dashboards tailored to your specific business logic."
                        features={[
                            "React/Next.js Architecture",
                            "Secure Payment Integration",
                            "Custom Admin Panels",
                            "SEO Optimization"
                        ]}
                    />
                    <ServiceCard 
                        icon={<Database className="w-8 h-8 text-emerald-600" />}
                        title="API Integration Services"
                        desc="Need to connect your accounting software with FinBook or other tools? We build robust API bridges."
                        features={[
                            "QuickBooks/Xero Integration",
                            "Banking API Connections",
                            "Automated Data Sync",
                            "Custom Webhooks"
                        ]}
                    />
                    <ServiceCard 
                        icon={<Smartphone className="w-8 h-8 text-emerald-600" />}
                        title="Mobile App Development"
                        desc="Extend your financial tools to iOS and Android with custom mobile applications for your team or clients."
                        features={[
                            "Native & Cross-Platform",
                            "Biometric Security",
                            "Offline Functionality",
                            "Push Notifications"
                        ]}
                    />
                </div>

                {/* Additional Info */}
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Why choose FinBook Enterprise?</h2>
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                Our team comprises senior engineers and financial experts who understand the nuances of fintech. We don't just build software; we build compliant, secure, and scalable financial infrastructure.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <Headphones className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <span className="font-medium text-slate-700">24/7 Priority Support</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <Globe className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <span className="font-medium text-slate-700">Global Compliance</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <BarChart className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <span className="font-medium text-slate-700">Advanced Analytics</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-100 rounded-xl p-8 flex flex-col justify-center items-center text-center">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to scale?</h3>
                            <p className="text-slate-500 mb-6">Let's discuss your custom requirements.</p>
                            <Link to="/contact">
                                <Button size="lg" className="w-full">Contact Sales Team</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Services;