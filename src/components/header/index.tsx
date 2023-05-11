
import {BsBell} from 'react-icons/bs';
import styles from './Header.module.css';
import { Nunito } from 'next/font/google';
import Image from 'next/image';
import { CreateHabitModal } from '../modal/CreateHabitModal';
import { useState } from 'react';

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', })

export default function Header({session}:any) {
    const [modalIsOpen, setIsOpen] = useState(false);
    
    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    return(
        <div className={styles.container}>
            <div className={styles.content}>
            <div className={styles.profile}>
                <div className={styles.content_avatar}>
                    
                    <Image src={session.user.image} alt="avatar" width={40} height={40}/>
                </div>
                <div className={styles.content_profile}>
                    <strong className={nunito.className}>Bem Vindo, {session.user.name}</strong>
                    <p className={nunito.className}>Você tem <strong> 3 tarefas </strong>pendentes</p>
                </div>
            </div>
            <div className={styles.actions_buttons}>
                <button onClick={openModal} className={nunito.className}>Criar Habits</button>
                <button>
                    <BsBell size={18} color='#5237E9'/>
                </button>
            </div>
            </div>

            <CreateHabitModal closeModal={closeModal} modalIsOpen={modalIsOpen}/>
        </div>
    );
}

