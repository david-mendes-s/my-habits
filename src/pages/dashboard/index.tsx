import Header from "../../components/header";
import NavBar from "../../components/navbar";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import styles from './dashboard.module.css';
import SideBar from "@/components/sideBar";

export default function Dashboard({children}:any ) {
    
    return (
      
        <div className={styles.container}>
            <NavBar />
            <div className={styles.content}>
              <Header />
              
              <div className={styles.habits}>
                <div className={styles.content_habits}>
                  {children}
                </div>
                <SideBar />
              </div>
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