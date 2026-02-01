import React from 'react';
import { Card } from '../components/ui';

const Privacy: React.FC = () => {
    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
                    <p className="text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
                
                <Card className="p-8 md:p-12 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Welcome to FinBook. We respect your privacy and are committed to protecting your personal data. 
                            This privacy policy will inform you as to how we look after your personal data when you visit our website 
                            and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">2. The Data We Collect</h2>
                        <p className="text-slate-600 leading-relaxed mb-2">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600">
                            <li><strong>Identity Data:</strong> First name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> Email address and telephone numbers.</li>
                            <li><strong>Financial Data:</strong> Bank account and payment card details (processed securely via third-party payment processors).</li>
                            <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products and services you have purchased from us.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Data</h2>
                        <p className="text-slate-600 leading-relaxed mb-2">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600">
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                            <li>Where we need to comply with a legal or regulatory obligation.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">4. Data Security</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. 
                            In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">5. Contact Details</h2>
                        <p className="text-slate-600 leading-relaxed">
                            If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:privacy@finbook.io" className="text-emerald-600 hover:underline">privacy@finbook.io</a>.
                        </p>
                    </section>
                </Card>
            </div>
        </div>
    );
};

export default Privacy;