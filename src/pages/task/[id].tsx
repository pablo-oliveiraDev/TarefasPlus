import { ChangeEvent, FormEvent, useState } from "react";
import Head from "next/head";
import styles from '@/styles/pages/task.module.css';
import { Textarea } from "@/components/textarea";
import * as IconsFa from 'react-icons/fa';
import { toast } from "react-toastify";

import { db } from "@/services/firebaseConnection";
import {
    doc,
    collection,
    query,
    where,
    getDoc,
    addDoc,
    getDocs,
    deleteDoc,
} from 'firebase/firestore';
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";


interface TaskProps {
    item: {
        taskId: string;
        created: string;
        public: boolean;
        tarefa: string;
        user: string;
    };
    allComments: CommentsProps[]
}

interface CommentsProps {
    id: string;
    coment: string;
    taskId: string;
    user: string;
    name: string;
    created: string;
}

export default function Task({ item, allComments }: TaskProps) {
    const { data: session } = useSession();
    const [input, setInput] = useState('');
    const [comments, setComments] = useState<CommentsProps[]>(allComments || []);

    async function handleComent(event: FormEvent) {
        event.preventDefault();
        if (input === '') {
            return toast.warn('O campo não pode estar vazio!')
        };

        if (!session?.user?.email || !session?.user?.name) {
            return toast.warn('Voce precisa estar logado para comentar!')
        };

        try {
            const hours = new Date();
            const docRef = await addDoc(collection(db, 'comments'), {
                coment: input,
                created: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId
            });
            const data = {
                id: docRef.id,
                coment: input,
                created: hours.getHours() + ':' + hours.getMinutes(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId,
            };
            toast.success('Comentário inserido com sucesso!', { position: 'top-center' });
            setComments((oldItems) => [...oldItems, data]);
            setInput('')
        } catch (err) {
            console.log(err)
        }
    }
    async function handleDeleteComment(id: string) {
        const confirmDel = confirm('Ao apagar este item não conseguirá recuper-lo!\nDeseja realmente apaga-lo?')
        if (confirmDel === true) {
            try {
                const docRef = doc(db, 'comments', id)
                await deleteDoc(docRef);

                const deleteComment = comments.filter((item) => item.id !== id);
                setComments(deleteComment);
                toast.success('Item deletado com sucesso!')


            } catch (err) {
                console.log(err)
                toast.error('Erro ao tentar deletar!');
            }


        } else {
            toast.info('Delete cancelado com sucesso!');
            return;
        }

    }
    return (
        <div className={styles.container}>
            <Head>
                <title>Tarefa - Detalhes da tarefa</title>
            </Head>
            <main className={styles.main}>
                <h1>Tarefas</h1>
                <article className={styles.task}>
                    <p>
                        {item.tarefa}
                    </p>
                </article>
            </main>
            <section className={styles.commentsContainer}>
                <h2>Deixar comentário</h2>
                <form onSubmit={handleComent} >
                    <Textarea
                        placeholder='Digite o seu comentário...'
                        value={input}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
                    />
                    <button
                        disabled={!session?.user}
                        className={styles.button}

                    >Enviar comentário</button>
                </form>
            </section>
            <section className={styles.commentsContainer} >
                <h2>Todos comentários</h2>
                {comments.length === 0 && (
                    <span>Nenhum comentário foi encontrado...</span>
                )}
                {comments.map((item, index) => (
                    <article key={index} className={styles.comment} >
                        <div className={styles.headComment}>
                            <label className={styles.commentLabel} >
                                {item.name} as {item.created}
                            </label>
                            {item.user === session?.user?.email && (
                                <button className={styles.buttonTrash}
                                    onClick={() => handleDeleteComment(item.id)}
                                >
                                    <IconsFa.FaTrash size={18} color="#EA3140" />
                                </button>
                            )}
                        </div>
                        <p>{item.coment}</p>
                    </article>
                ))}
            </section>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const id = params?.id as string;
    const docRef = doc(db, 'tarefas', id);

    const q = query(collection(db, 'comments'), where('taskId', '==', id))
    const snapshotComments = await getDocs(q);

    let allComments: CommentsProps[] = [];

    snapshotComments.forEach((doc) => {
        allComments.push({
            id: doc.id,
            coment: doc.data().coment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId,
        })
    })

    const snapshot = await getDoc(docRef);

    if (snapshot.data() === undefined) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }
    if (!snapshot.data()?.public) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }
    const miliseconds = snapshot.data()?.created.seconds * 1000;

    const task = {
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id,
    }
    return {
        props: {
            item: task,
            allComments: allComments,
        }
    }
}
