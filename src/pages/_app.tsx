import '../styles/globals.css';
import type { AppProps } from 'next/app'
import {SessionProvider as AuthProvider} from 'next-auth/react';
import { HabitsProvider } from '@/hooks/useHabits';
import { Nunito, Poppins } from 'next/font/google';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs';

dayjs.extend(utc);
dayjs.extend(timezone);


export const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', })

export default function App({ Component, pageProps, router }: AppProps) {

  const { pathname } = router;

  // Verifica se é a página de login
  const isLoginPage = pathname === '/';

  return(
    <>
      {isLoginPage ? (
        <Component {...pageProps} />
      ) : (
        <AuthProvider session={pageProps.session}>
          <HabitsProvider>
            <Component {...pageProps} />
          </HabitsProvider>
        </AuthProvider>
      )}
    </>
  );  
}
