import Head from 'next/head';
import Image from 'next/image';
import styles from '@/styles/pages/Home.module.css';
import { db } from '@/services/firebaseConnection';
import {
  collection, getDocs,
} from 'firebase/firestore';

import homeImg from '../../public/assets/hero.png';
import { GetStaticProps } from 'next';


interface HomeProps {
  posts: number;
  comments: number;
};

export default function Home({comments,posts }: HomeProps) {

  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas -Gerencie suas tarefas aqui!-</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="" />
      </Head>
      <main className={styles.main}>
        <div className={styles.HomeContent}>
          <Image
            className={styles.HomeImage}
            alt='Logo Home'
            src={homeImg}
            priority
          />
        </div>
        <h1 className={styles.title}>
          Sistema para ajudar organizar<br />
          tarefas e estudos
        </h1>
        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>
              +{posts} posts
            </span>
          </section>
          <section className={styles.box}>
            <span>
              +{comments} comentários
            </span>
          </section>
        </div>
      </main>
    </div>
  )
}
export const getStaticProps: GetStaticProps = async () => {
  //buscar no banco numeros e mandar pro componente

  const commentRef = collection(db, 'comments');
  const postRef = collection(db, 'tarefas');
  const commentSnapshot = await getDocs(commentRef);
  const postSnapshot = await getDocs(postRef);
  return {
    props: {
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0,
    },
    revalidate: 60,
  };
};