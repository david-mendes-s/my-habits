import Header from "../../components/header";
import NavBar from "../../components/navbar";
import { GetServerSideProps } from "next";
import { signOut, getSession, useSession } from "next-auth/react";

import styles from './dashboard.module.css';

export default function Dashboard({children, auth, session}:any ) {
    

    return (
      
        <div className={styles.container}>
            <NavBar />
            <div className={styles.content}>
              <Header session={auth ? auth : session}/>
              {children}
            </div>
        </div>
              
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  console.log(session);

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    }
  };
};