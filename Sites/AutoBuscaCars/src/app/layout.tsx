import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import Header from '../components/Header';
import MobileBottomNav from '../components/MobileBottomNav';
import Footer from '../components/Footer';
import ToastNotification from '../components/ToastNotification';

export const metadata: Metadata = {
  title: 'AutoBusca - Pesquisa, Comparação e Avaliação Inteligente de Carros',
  description: 'Plataforma web responsiva e mobile-first para pesquisar anúncios de carros em marketplaces automotivos, comparar preços com a média de mercado e analisar descrições com IA.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0c8de9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white">
        <AppProvider>
          <Header />
          <ToastNotification />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
