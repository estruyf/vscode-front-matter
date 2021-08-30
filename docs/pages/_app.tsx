import '../styles/globals.css';
import type { AppProps } from 'next/app';
import '../locale/localization';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
