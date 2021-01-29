import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>musicologic</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>musicologic</h1>
        <p>body text, blah blah.</p>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://localghost.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          made by Sophie
        </a>
      </footer>
    </div>
  );
}
