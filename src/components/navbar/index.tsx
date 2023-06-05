import {BiExit, BiListCheck, BiHome} from 'react-icons/bi';
import {AiOutlineAppstoreAdd} from 'react-icons/ai';
import { signOut, useSession } from 'next-auth/react';
import styles from './NavBar.module.css';
import { useState } from 'react';
import { ModalTest } from '../modal/ModelTest';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Home from '../../../public/Home.svg';


export default function NavBar(){

    const { data: session } = useSession(); 
    
    const [modalIsOpen, setIsOpen] = useState(false);
    const router = useRouter();
    
    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    console.log(router.pathname)

    return(
        <>
            <div className={styles.container}>
                <div className={styles.content}>
                    <ul>
                        <li>
                            <Image src='/Logo.png' alt='logo' width={35} height={35}/>
                        </li>
                        <li>
                            <Link href="/dashboard/menu" >
                                <BiHome size={30} color='#fff' className={router.pathname === '/dashboard/menu' ? `${styles.active}` : ''}/>
                            </Link>
                        </li>
                        <li>
                            <Link href="/dashboard/habits" >
                                <BiListCheck size={35} color='#fff' className={router.pathname === '/dashboard/habits' ? `${styles.active}` : ''}/>
                                       
                            </Link>
                        </li>
                    </ul>
                    { session && (
                        <button onClick={() => signOut({callbackUrl: '/', redirect: true})}>
                            <BiExit size={25} color='#fff'/>
                        </button>
                    )}
                    
                </div>
            </div>
            <div className={styles.menu_botton}>
                <Link href={'/dashboard/menu'} >
                    <BiHome size={30} color='#fff' className={router.pathname === '/dashboard/menu' ? `${styles.active}` : ''}/>
                </Link>
                <Link href={'/dashboard/habits'}>
                    <BiListCheck size={35} color='#fff' className={router.pathname === '/dashboard/habits' ? `${styles.active}` : ''}/>
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