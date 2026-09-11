import { useRouter } from 'next/router';
import '@/styles/globals.css';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import type { CSSProperties } from 'react';
import { appName, accent } from '@/lib/client';
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return <div style={{ '--brand': accent } as CSSProperties}>
    <Head><title>{`${appName} · Learn anything`}</title><meta name="description" content="Build understanding, one question at a time." /><meta name="viewport" content="width=device-width, initial-scale=1" /><link rel="icon" href="/favicon.svg" /></Head>
    <Component key={router.asPath} {...pageProps} />
  </div>;
}
