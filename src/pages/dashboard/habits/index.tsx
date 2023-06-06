import { GetServerSideProps } from "next";

import styles from './habits.module.css';
import { nunito } from "../../_app";
import Dashboard from "../";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { useHabits } from "@/hooks/useHabits";
import { useState } from "react";

type SessionProps = {
  session: Session | null
}

export default function Habits({session}:SessionProps){ 

  const {habits, handleUpdateHabitComplet} = useHabits();

    return(
      <Dashboard>
          
            <ul className={`${styles.list_habits} ${nunito.className}`}>
              {habits.map(habit => (
                  <li key={habit.id} className={habit.DayHabit?.[0]?.completed === true ? styles.completedHabits : ''}>
                    <p>{habit.title}</p>
                    <button className={
                      habit.DayHabit?.[0]?.completed === true ? styles.checklistcompleted : styles.checklist
                    } onClick={()=> {
                        handleUpdateHabitComplet(habit)
                      }}></button>
                  </li>
                ))}
            </ul>
          
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