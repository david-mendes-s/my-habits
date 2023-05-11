import {BiExit} from 'react-icons/bi';
import { signOut, useSession } from 'next-auth/react';
import styles from './NavBar.module.css';


export default function NavBar(){

    const { data: session } = useSession(); 

    return(
        <div className={styles.container}>
            <div className={styles.content}>
                { session && (
                    <button onClick={() => signOut({callbackUrl: '/', redirect: true})}>
                        <BiExit size={25} color='#fff'/>
                    </button>
                )}
                
            </div>
        </div>
    );
}