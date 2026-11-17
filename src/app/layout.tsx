import type { Metadata } from 'next';
import { Provider } from '@/components/provider';
import { Header } from '@/components/shell';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://basin-sigma.vercel.app'),
  title: { default: 'BASIN — Water, land, and what we change', template: '%s · BASIN' },
  icons: { icon: '/icon.svg', apple: '/apple-touch-icon.png' },
  openGraph: { images: ['/opengraph-image.png'] },
  description:
    'Choose a real place, load elevation, and explore experimental stormwater scenarios.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <Header />
          {children}
        </Provider>
      </body>
    </html>
  );
}
