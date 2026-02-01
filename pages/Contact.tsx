import React, { useState } from 'react';
import { Button, Card, Input, Select } from '../components/ui';
import { Mail, MapPin, Phone, MessageSquare, Send } from 'lucide-react';

const Contact: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
        }, 1500);
    };

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Get in touch</h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Have a question about FinBook? Need a custom solution? We're here to help.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="p-6 border-l-4 border-l-emerald-500">
                            <h3 className="font-bold text-slate-900 mb-4 text-lg">Contact Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-emerald-600 mt-1" />
                                    <div>
                                        <p className="font-medium text-slate-900">Email</p>
                                        <p className="text-sm text-slate-500">support@finbook.io</p>
                                        <p className="text-sm text-slate-500">sales@finbook.io</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-emerald-600 mt-1" />
                                    <div>
                                        <p className="font-medium text-slate-900">Phone</p>
                                        <p className="text-sm text-slate-500">+1 (555) 123-4567</p>
                                        <p className="text-xs text-slate-400">Mon-Fri 9am-6pm EST</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-emerald-600 mt-1" />
                                    <div>
                                        <p className="font-medium text-slate-900">Office</p>
                                        <p className="text-sm text-slate-500">
                                            100 Financial District Blvd<br />
                                            New York, NY 10005<br />
                                            United States
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="font-bold text-slate-900 mb-2">Frequently Asked Questions</h3>
                            <div className="space-y-4 text-sm text-slate-500">
                                <div>
                                    <p className="font-medium text-slate-700">How do I reset my password?</p>
                                    <p>You can reset it from the login page by clicking "Forgot Password".</p>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-700">Can I export my data?</p>
                                    <p>Yes, all users can export to CSV. Pro users can export PDF reports.</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="p-8">
                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-emerald-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h2>
                                    <p className="text-slate-500">Thank you for contacting us. We will get back to you within 24 hours.</p>
                                    <Button className="mt-6" onClick={() => setSubmitted(false)}>Send Another Message</Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">First Name</label>
                                            <Input placeholder="John" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Last Name</label>
                                            <Input placeholder="Doe" required />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Email Address</label>
                                        <Input type="email" placeholder="john@example.com" required />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Subject</label>
                                        <Select>
                                            <option>General Support</option>
                                            <option>Sales & Enterprise</option>
                                            <option>Custom Website Development</option>
                                            <option>Partnership Inquiry</option>
                                            <option>Billing Question</option>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Message</label>
                                        <textarea 
                                            className="flex min-h-[150px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            placeholder="How can we help you today?"
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="flex items-center justify-end">
                                        <Button size="lg" disabled={isSubmitting}>
                                            {isSubmitting ? 'Sending...' : 'Send Message'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;