import '../styles/globals.css';
import type { AppProps } from 'next/app'
import {SessionProvider as AuthProvider} from 'next-auth/react';
import { HabitsProvider } from '@/hooks/useHabits';
import { Nunito, Poppins } from 'next/font/google';

export const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', })

export default function App({ Component, pageProps }: AppProps) {
  return(
    <AuthProvider session={pageProps.session}>  
      <HabitsProvider>
        <Component {...pageProps} />
      </HabitsProvider> 
     </AuthProvider>
  );  
}
