import React from 'react';
import { Card } from '../components/ui';

const Terms: React.FC = () => {
    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms and Conditions</h1>
                    <p className="text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
                
                <Card className="p-8 md:p-12 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">1. Agreement to Terms</h2>
                        <p className="text-slate-600 leading-relaxed">
                            By accessing or using our application, FinBook, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, then you may not access the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">2. Intellectual Property</h2>
                        <p className="text-slate-600 leading-relaxed">
                            The Service and its original content, features and functionality are and will remain the exclusive property of FinBook and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">3. User Accounts</h2>
                        <p className="text-slate-600 leading-relaxed">
                            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">4. Limitation of Liability</h2>
                        <p className="text-slate-600 leading-relaxed">
                            In no event shall FinBook, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">5. Termination</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">6. Changes</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.
                        </p>
                    </section>
                </Card>
            </div>
        </div>
    );
};

export default Terms;