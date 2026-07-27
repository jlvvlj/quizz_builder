import '../styles/globals.css';
import Head from 'next/head';
import type { ReactElement, ReactNode } from 'react';
import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import AppLayout from '@/components/layout/AppLayout';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
    const getLayout =
        Component.getLayout ?? ((page: ReactElement) => <AppLayout>{page}</AppLayout>);
    return (
        <>
            <Head>
                <title>Jalingo — Learn Japanese</title>
                <meta
                    name="description"
                    content="Learn Japanese with kanji, vocabulary, and reading practice tuned to how you study."
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            </Head>
            {getLayout(<Component {...pageProps} />)}
        </>
    );
}
