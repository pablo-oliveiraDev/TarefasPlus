import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Header from '../components/header/index';
import { SessionProvider } from "next-auth/react";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
      <ToastContainer autoClose={3500} theme='colored'
        hideProgressBar={false}
        position={'top-right'} 
      />
    </SessionProvider>
  )
}
