import { GetServerSideProps } from "next";

import styles from './habits.module.css';
import { nunito } from "../../_app";
import Dashboard from "../";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { useHabits } from "@/hooks/useHabits";
import { api } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import { Prisma } from "@prisma/client";
import { useEffect, useState } from "react";

type SessionProps = {
  session: Session | null
}

interface IHabit {
  completed: boolean;
  day_id: string;
  habit_id: string;
  id: string;
  title: string;
}



export default function Habits({session}:SessionProps){ 

  const {habits, fetchHabits, countHabits} = useHabits();
  const [progress, setProgress] = useState(0);
  const [count, setCount] = useState(0);
  const [countCompleted, setCountCompleted] = useState(0);

  async function handleCountProgress(){
    const response = await api.get('http://localhost:3000/api/server/countHabits')
    setCount(Number(response.data.count));
    setCountCompleted(Number(response.data.countCompleted));
  }

  
  async function handleHabitComplet(habit:IHabit){
    console.log(habit)

    await api.put('http://localhost:3000/api/server/habits', {
      habit
    });

    fetchHabits();
    handleCountProgress();
    
  }

  useEffect(()=> {
    handleCountProgress()
    setProgress(Number((countCompleted*100)/count))
  }, [count, countCompleted])

    return(
      <Dashboard auth={session}>
        <div className={styles.habits}>
                <div className={styles.content_habits}>
                  <ul className={`${styles.list_habits} ${nunito.className}`}>
                    {habits.map(habit => (
                        <li key={habit.habit_id}>
                          <p>{habit.title}</p>
                          <button className={styles.checklist} onClick={()=> handleHabitComplet(habit)}></button>
                        </li>
                      ))}
                  </ul>
                </div>
                <div className={styles.content_sideBar}>
                  <div className={styles.status_today}>
                    <h3 className={nunito.className}>Status de Hoje</h3>
                    <p className={nunito.className}>Em progresso</p>
                    <div className={styles.custom_progress} >
                      <div className={styles.custom_progress_value}
                        id="progressbar" 
                        style={{width: `${progress}%`}}
                      ></div>
                    </div>
                    <div className={styles.content_ranking}>
                      <h4 className={nunito.className}>Tarefas Pendentes</h4>
                      <p className={nunito.className}>Ainda faltam {countHabits} pendências</p>
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
                          <strong className={nunito.className}>{progress}</strong>
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