import {BiExit, BiListCheck} from 'react-icons/bi';
import {AiOutlineAppstoreAdd} from 'react-icons/ai';
import { signOut, useSession } from 'next-auth/react';
import styles from './NavBar.module.css';
import { useState } from 'react';
import { ModalTest } from '../modal/ModelTest';
import Link from 'next/link';


export default function NavBar(){

    const { data: session } = useSession(); 
    
    const [modalIsOpen, setIsOpen] = useState(false);
    
    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    return(
        <>
            <div className={styles.container}>
                <div className={styles.content}>
                    { session && (
                        <button onClick={() => signOut({callbackUrl: '/', redirect: true})}>
                            <BiExit size={25} color='#fff'/>
                        </button>
                    )}
                    
                </div>
            </div>
            <div className={styles.menu_botton}>
                <Link href={'/dashboard/habits'}>
                    <BiListCheck size={28} color='#fff'/>
                </Link>
                <button onClick={openModal}>
                    <AiOutlineAppstoreAdd size={28} color='#fff'/>
                </button>
                <button onClick={() => signOut({callbackUrl: '/', redirect: true})}>
                    <BiExit size={25} color='#fff'/>
                </button>
            </div>

            <ModalTest closeModal={closeModal} modalIsOpen={modalIsOpen}/>
        </>
        
    );
}