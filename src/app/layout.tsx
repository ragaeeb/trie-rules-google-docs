import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
    description: 'Format your Google Docs easily',
    title: 'Trie Rules + Google Docs',
};

/**
 * Provides the root HTML layout for the application.
 *
 * This component wraps its nested content in an HTML structure with the language attribute set to "en"
 * and applies global styles to the body element via CSS classes.
 *
 * @param children - The child elements to render within the layout.
 */
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
