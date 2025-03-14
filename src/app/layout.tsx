import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
    description: 'Format your Google Docs easily',
    title: 'Trie Rules + Google Docs',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
        </html>
    );
}
