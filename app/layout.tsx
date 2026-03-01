import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'COSMEON — Climate Risk Intelligence Engine',
    description: 'Satellite-derived flood intelligence for district-level climate risk assessment powered by AI and Google Earth Engine.',
    keywords: ['flood detection', 'climate risk', 'satellite imagery', 'India', 'Assam', 'disaster management'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="font-sans bg-slate-50 text-slate-900 antialiased">
                <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <Navbar />
                        <main className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50">
                            {children}
                        </main>
                        <Toaster position="top-right" />
                    </div>
                </div>
            </body>
        </html>
    );
}
