import type { Metadata } from 'next';
import { Provider } from '@/components/provider';
import { Header } from '@/components/shell';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'BASIN — Understand where water goes', template: '%s · BASIN' },
  description:
    'An open, transparent stormwater laboratory. Explore synthetic watersheds, test hypothetical interventions, and inspect the mathematics.',
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
