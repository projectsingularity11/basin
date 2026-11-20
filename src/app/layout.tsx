import type { Metadata } from 'next';
import { Provider } from '@/components/provider';
import { Header } from '@/components/shell';
import './globals.css';
import './studio.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://basin-sigma.vercel.app'),
  title: { default: 'BASIN — Flood mitigation studies', template: '%s · BASIN' },
  icons: { icon: '/icon.svg', apple: '/apple-touch-icon.png' },
  openGraph: { images: ['/opengraph-image.png'] },
  description:
    'Choose a real place, load elevation, and explore experimental stormwater scenarios.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="basin-app">
        <Provider>
          <Header />
          {children}
        </Provider>
      </body>
    </html>
  );
}
