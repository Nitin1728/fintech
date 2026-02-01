import React from 'react';
import { Card, Badge, Button } from '../components/ui';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BLOG_POSTS = [
    {
        id: 1,
        title: "5 Tips to Manage Freelance Cash Flow",
        excerpt: "Cash flow is the lifeblood of any freelance business. Learn how to smooth out the feast and famine cycle with these simple strategies.",
        category: "Finance",
        author: "Sarah Smith",
        date: "Oct 12, 2023",
        image: "https://picsum.photos/seed/finance1/800/400"
    },
    {
        id: 2,
        title: "New Feature: Automated Payment Reminders",
        excerpt: "Stop chasing clients for payments manually. Our new automated reminder system does the heavy lifting for you.",
        category: "Product Update",
        author: "Alex Johnson",
        date: "Sep 28, 2023",
        image: "https://picsum.photos/seed/tech2/800/400"
    },
    {
        id: 3,
        title: "Why We Switched to 256-bit Encryption",
        excerpt: "Security is paramount. Here is a deep dive into our infrastructure upgrades and what they mean for your data safety.",
        category: "Security",
        author: "David Chen",
        date: "Sep 15, 2023",
        image: "https://picsum.photos/seed/sec3/800/400"
    },
    {
        id: 4,
        title: "Tax Season Survival Guide for Small Business",
        excerpt: "Dreading tax season? It doesn't have to be a nightmare. Follow this checklist to get prepared early.",
        category: "Guides",
        author: "Sarah Smith",
        date: "Aug 30, 2023",
        image: "https://picsum.photos/seed/tax4/800/400"
    }
];

const Blog: React.FC = () => {
    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">FinBook Blog</h1>
                    <p className="text-lg text-slate-500">Insights, updates, and guides for financial success.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {BLOG_POSTS.map(post => (
                        <Card key={post.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                            <div className="h-48 overflow-hidden">
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <Badge variant="success">{post.category}</Badge>
                                    <span className="text-xs text-slate-400 flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" /> {post.date}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 hover:text-emerald-600 transition-colors cursor-pointer">
                                    {post.title}
                                </h3>
                                <p className="text-slate-500 text-sm mb-6 flex-1">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                                    <div className="flex items-center text-xs text-slate-500">
                                        <User className="w-3 h-3 mr-1" /> {post.author}
                                    </div>
                                    <button className="text-emerald-600 font-medium text-sm flex items-center hover:underline">
                                        Read More <ArrowRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Button variant="secondary" size="lg">Load More Articles</Button>
                </div>

                {/* Newsletter Signup */}
                <div className="mt-24 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Subscribe to our newsletter</h2>
                    <p className="text-slate-500 mb-8 max-w-xl mx-auto">Get the latest financial tips and product updates delivered straight to your inbox. No spam, ever.</p>
                    <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="flex-1 rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <Button>Subscribe</Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Blog;