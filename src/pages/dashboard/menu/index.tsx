import { GetServerSideProps } from "next";
import Dashboard from "..";
import { Session, getServerSession } from "next-auth";
import Image from 'next/image';
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { nunito } from "@/pages/_app";
import { generateYearForDays } from "@/utils/generate-year-for-days";
import { useHabits } from "@/hooks/useHabits";
import WeeklyConsistencyList from "@/components/weeklyConsistencyList";
import styles from './Menu.module.css';
import Calendar from "@/components/calendar";
import { getSession } from "next-auth/react";


type SessionProps = {
  session: Session | null, 
}

export default function Menu({session}:SessionProps){
    let dayofYear = generateYearForDays();
    

    const {countHabitsInformationsCompleted, 
          countSequence, countHabitsInformations, 
          bestHabit, porcentAverage, weeklyConsistencyAverageSearch, rankingSequence} = useHabits();

    
    return(
       <Dashboard>
        <div className={`${styles.container} ${nunito.className}`}>
          <div className={styles.information}>
            <div className={styles.sequence}>
              <ul>
                <li>
                  <p>🔥</p>
                  <div>
                      <strong>{countHabitsInformations}</strong>
                      <small>Hábitos</small>
                  </div>
                </li>
                <li>
                  <p>🔥</p>
                  <div>
                      <strong>{porcentAverage | 0}%</strong>
                      <small>Consistência</small>
                  </div>
                </li>
                <li>
                  <p>🔥</p>
                  <div>
                      <strong>{countSequence}</strong>
                      <small>Sequência</small>
                  </div>
                  
                </li>
                <li>
                  <p>🔥</p>
                  <div>
                      <strong>{countHabitsInformationsCompleted}</strong>
                      <small>Concluídos</small>
                  </div>
                </li>
              </ul>
            </div>
            <div className={styles.besthabit}>
              <strong>Melhor Hábito</strong>
              <small>Consistência média</small>
              <h3>{bestHabit.percent | 0}%</h3>
              <small>Hábito mais comum: <p>{bestHabit.title}</p></small>
            </div>
          </div>
          <div className={styles.calendar}>
            <div className={styles.weekFormat}>
              <div className={styles.week}>
                
                <WeeklyConsistencyList weeklyConsistencyAverageSearch={weeklyConsistencyAverageSearch} />
                
              </div>
              <p>Dias que você é mais consistente</p>
            </div>
            
            <div className={styles.habitsCompletedCalendar}>
              <div className={styles.containerDays}>
                <div className={styles.row}>
                  {/* <!-- Adicione 7 divs representando os dias da semana --> */}
                  <div className={styles.day}>D</div>
                  <div className={styles.day}>S</div>
                  <div className={styles.day}>T</div>
                  <div className={styles.day}>Q</div>
                  <div className={styles.day}>Q</div>
                  <div className={styles.day}>S</div>
                  <div className={styles.day}>S</div>
                </div>
                  {/* <!-- Adicione 52 divs representando as semanas --> */}
                <Calendar />
              </div>
              
                <div className={styles.contentCheck}>
                  <div>
                    <div className={styles.check}></div>
                    <small>folga</small>
                  </div>
                  <div>
                    <div className={styles.checked}></div>
                    <small>concluído</small>
                  </div>
                </div>
            </div>
            
          </div>
          <div className={styles.ranking}>
            <table className={styles.tableView}>
              <thead>
                <tr>
                  <th>Ranking</th>
                  <th>Usuário</th>
                  <th>Sequência</th>
                </tr>
              </thead>
              <tbody>
                {rankingSequence.map((user) => (
                  <tr key={user.image}>
                    <td>🥇</td>
                    <td>
                      <div className={styles.perfil}>
                        <Image className={styles.avatar} src={user.image} alt="avatar" width={35} height={35}/>
                        <div>
                          <p>{user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td>{user.sequence} dias</td>
                </tr>
                ))}  
              </tbody>
            </table>
          </div>
        </div>
       </Dashboard>
    );
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