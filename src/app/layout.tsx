import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { AuthProvider } from '@/contexts/AuthContext';
import { ZzimProvider } from '@/contexts/ZzimContext';

export const metadata: Metadata = {
  title: '세이브모바일 - 알뜰폰 요금제 비교',
  description: '통신비 줄이는 가장 쉬운 방법. 2,300개 이상의 알뜰폰 요금제를 비교하고 최저가로 가입하세요.',
  keywords: '알뜰폰, 요금제, 비교, 최저가, SKT, KT, LGU+',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <ZzimProvider>
            <Header />
            <main className="max-w-screen-lg mx-auto px-4 pt-4 pb-20 md:pb-6">
              {children}
            </main>
            <BottomNav />
          </ZzimProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
