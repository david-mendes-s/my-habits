import { nunito } from '@/pages/_app';
import styles from './SideBar.module.css';
import { useHabits } from '@/hooks/useHabits';


export default function SideBar(){
    const { countHabits, progress, habistCompleted } = useHabits();
    return(

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
                {habistCompleted.map(completed => (
                <li key={completed.id}>
                <div className={styles.task_icon}>
                💪
                </div>
                <div className={styles.details_task}>
                    <strong className={nunito.className}>{completed.title}</strong>
                    <p className={nunito.className}>
                    {new Intl.DateTimeFormat('pt-Br').format(
                            new Date(completed.date)
                    )}
                    </p>
                </div>
                </li>
                ))}
                
            </ul>
        </div>
    </div>
    );
}