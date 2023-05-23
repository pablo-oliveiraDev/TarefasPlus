import { GetServerSideProps } from 'next';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Head from 'next/head';
import { getSession } from 'next-auth/react';
import { Textarea } from '@/components/textarea';
import styles from '../../styles/pages/dashboard.module.css';
import * as IconsFi from 'react-icons/fi';
import * as IconsFa from 'react-icons/fa';

import { db } from '@/services/firebaseConnection';
import {
    addDoc,
    collection,
    query,
    orderBy,
    where,
    onSnapshot,
    doc,
    deleteDoc
} from 'firebase/firestore';
import Link from 'next/link';
import { toast, Zoom, Flip } from 'react-toastify';

interface HomeProps {
    user: {
        email: string;
    }
}

interface TaskProps {
    id: string;
    created: Date;
    public: boolean;
    tarefa: string;
    user: string;
}
export default function Dashboard({ user }: HomeProps) {
    const [input, setInput] = useState('');
    const [publicTasks, setPublicTasks] = useState(false);
    const [tasks, setTasks] = useState<TaskProps[]>([]);
    useEffect(() => {
        async function loadTarefas() {
            const tarefasRef = collection(db, 'tarefas')
            const q = query(tarefasRef,
                orderBy('created', 'desc'),
                where('user', '==', user?.email)
            );
            onSnapshot(q, (snapshot) => {
                let lista = [] as TaskProps[];
                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        tarefa: doc.data().tarefa,
                        created: doc.data().created,
                        user: doc.data().user,
                        public: doc.data().public,
                    });
                });
                setTasks(lista);
            });
        }
        loadTarefas();
    }, [user?.email]);
    function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
        setPublicTasks(event.target.checked)
    }
    async function handleRegisterTask(event: FormEvent) {
        event.preventDefault();
        if (input === '') return;
        try {
            await addDoc(collection(db, 'tarefas'), {
                tarefa: input,
                created: new Date(),
                user: user?.email,
                public: publicTasks,
            });
            setInput('')
            setPublicTasks(false);
            toast.success('Tarefa adicionada com sucesso!😎', {
                position: 'top-center',
                transition: Flip
            })
        } catch (err) {
            console.log(err);
            toast.error('Hove uma falha ao registrar uma nova tarefa 😣', {
                position: 'top-center',
                transition: Zoom
            });
        }
    }

    async function handleShare(id: string) {
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/task/${id}`
        );
        toast.success('URL Copiada com sucesso !', { position: 'top-center', transition: Zoom });
    }
    async function handleDeleteTask(id: string) {
        const confirmDel = confirm('Ao apagar esta tarefa não conseguirá recuperar a tarefa!\nDeseja realmente deletar?')
        if (confirmDel === true) {
            try {
                const docRef = doc(db, 'tarefas', id);
                await deleteDoc(docRef);
                toast.success('Tarefa deletado com sucesso!👍🏼', {
                    position: 'top-center',
                    transition: Zoom
                });
            } catch (err) {
                console.log(err)
                toast.error('Erro ao tentar deletar!😣 \n Tente Novamente!', {
                    position: 'top-center',
                    transition: Zoom
                });
            }

        } else {
            toast.info('Delete cancelado!', {
                position: 'top-center',
                transition: Zoom
            });
            return;
        }
    }
    return (
        <div className={styles.container}>
            <Head>
                <title>Meu painel de tarefas</title>
            </Head>
            <main className={styles.main}>
                <section className={styles.content} >
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>
                            Qual sua tarefa?
                        </h1>
                        <form onSubmit={handleRegisterTask}>
                            <Textarea
                                placeholder='Digite qual a sua tarefa...'
                                value={input}
                                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
                            />
                            <div className={styles.checkboxArea} >
                                <input type="checkbox"
                                    className={styles.checkbox}
                                    checked={publicTasks}
                                    onChange={handleChangePublic}
                                />
                                <label htmlFor="">Deixar tarefa pública</label>
                            </div>
                            <button className={styles.button}
                                type='submit'
                            >
                                Registrar
                            </button>
                        </form>
                    </div>
                </section>
                <section className={styles.taskContainer}>
                    <h1>Minhas tarefas</h1>
                    {
                        tasks.map((item) => (
                            <article className={styles.task} key={item.id}>
                                {item.public &&
                                    <div className={styles.tagContainer}>
                                        <label className={styles.tag}>PUBLICO</label>
                                        <button className={styles.shareButton}
                                            onClick={() => handleShare(item.id)}
                                        >
                                            <IconsFi.FiShare2
                                                size={22}
                                                color='#3183ff'
                                            />
                                        </button>
                                    </div>
                                }
                                <div className={styles.taskContent}>
                                    {
                                        item.public ? (
                                            <Link href={`/task/${item.id}`}><p>{item.tarefa}</p>
                                            </Link>
                                        ) : (<p>{item.tarefa}</p>)
                                    }
                                    <button className={styles.trashButton}
                                        onClick={() => handleDeleteTask(item.id)}
                                    >
                                        <IconsFa.FaTrash
                                            size={24}
                                            color='#ea3140'
                                        />
                                    </button>
                                </div>
                            </article>
                        ))
                    }
                </section>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });
    if (!session?.user) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }
    return {
        props: {
            user: {
                email: session?.user?.email,
            }
        },
    }
}
