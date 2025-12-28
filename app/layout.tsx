import './globals.css';
import Navbar from './components/Navbar';
import PrivyProviderBase from './components/PrivyProviderBase';

export const metadata = {
  title: 'PolyCopy - Polymarket Leaderboard',
  description: 'Next.js API for Polymarket leaderboard data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="m-0 font-sans bg-[#0a0a0a]">
        <PrivyProviderBase>
          <Navbar />
          {children}
        </PrivyProviderBase>
      </body>
    </html>
  );
}

