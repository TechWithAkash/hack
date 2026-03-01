import type { Metadata } from 'next';
import '../../app/globals.css';

export const metadata: Metadata = {
    title: 'COSMEON — Satellite Climate Risk Intelligence Engine',
    description: 'Transforming open satellite data into structured, decision-ready climate risk insights. Real-time flood detection for India powered by Sentinel-1, Sentinel-2, and Google Earth Engine.',
    keywords: ['flood detection', 'climate risk', 'satellite imagery', 'Sentinel', 'India', 'Assam', 'disaster management', 'PS-06'],
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </head>
            <body style={{ margin: 0, padding: 0, background: '#060B14' }}>
                {children}
            </body>
        </html>
    );
}
