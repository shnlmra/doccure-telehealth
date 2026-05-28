import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doccure - Modern Telehealth Platform',
  description: 'Connect with expert doctors, get automated AI clinical insights, manage schedule slots, view prescriptions, and handle video consultations securely.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
