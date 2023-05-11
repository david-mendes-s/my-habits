import { GetServerSideProps } from "next";

import styles from './habits.module.css';
import { nunito } from "../../_app";
import Dashboard from "../";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type SessionProps = {
  session: Session | null
}

interface IhabitsProps {
  
  title:string,
  id:string,
  userId: string,
  DayHabit: [{
    id: number,
    day: string,
    check: boolean
  }]
   
}

export default function Habits({session}:SessionProps){ 

  const [habits, setHabits] = useState<IhabitsProps[]>([]);

  useEffect(() => {
    async function fetchHabits() {
      const response = await api.get('/server/habits');
      setHabits(response.data);
    }
    fetchHabits();
  }, []);

 /*  const currentDate = new Date(); // Obtém a data atual

  const filteredHabits = habits.filter(habit =>
    habit.DayHabit.some(day => {
      const dayDate = new Date(day.day);
      return dayDate.getDate() === currentDate.getDate() &&
            dayDate.getMonth() === currentDate.getMonth() &&
            dayDate.getFullYear() === currentDate.getFullYear();
    })
  ); */

  
    return(
      <Dashboard auth={session}>
        <div className={styles.habits}>
                <div className={styles.content_habits}>
                  <ul className={`${styles.list_habits} ${nunito.className}`}>
                    {habits.map(habit => (
                        <li>
                          <p>{habit.title}</p>
                          <button className={styles.checklist}></button>
                        </li>
                      ))}
                  </ul>
                </div>
                <div className={styles.content_sideBar}>
                  <div className={styles.status_today}>
                    <h3 className={nunito.className}>Status de Hoje</h3>
                    <p className={nunito.className}>Em progresso</p>
                    <div className={styles.custom_progress}>
                      <div className={styles.custom_progress_value}></div>
                    </div>
                    <div className={styles.content_ranking}>
                      <h4 className={nunito.className}>Tarefas Pendentes</h4>
                      <p className={nunito.className}>Ainda faltam 3 dias</p>
                      <button className={`${nunito.className}`}>Ver Ranking</button>
                    </div>
                  </div>
                  <div className={styles.concluid_tasks}>
                    <h4 className={nunito.className}>Tarefas Concluídas</h4>
                    <ul>
                      <li>
                        <div className={styles.task_icon}>
                        💪
                        </div>
                        <div className={styles.details_task}>
                          <strong className={nunito.className}>Treino</strong>
                          <p className={nunito.className}>12 de março de 2023</p>
                        </div>
                      </li>

                      <li>
                        <div className={styles.task_icon}>
                        📚
                        </div>
                        <div className={styles.details_task}>
                          <strong className={nunito.className}>Estudar</strong>
                          <p className={nunito.className}>12 de março de 2023</p>
                        </div>
                      </li>
                      
                    </ul>
                  </div>
                </div>
              </div>
      </Dashboard>
        
        
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);

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