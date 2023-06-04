import { generateYearForDays } from "@/utils/generate-year-for-days";
import styles from './Calendar.module.css';
import { useHabits } from "@/hooks/useHabits";

function Commit({ days }: any) {
  if (days) {
    return <div key={days} className={`${styles.commit} ${styles.commitActive}`} />;
  } else {
    return <div className={styles.commit} />;
  }
}


export default function Calendar() {
  const dayofYear = generateYearForDays();
  const { agregacion } = useHabits();
  
  const renderedCommits = dayofYear.map((day) => {
    const habitFound = agregacion.find((habit) => habit.date === day.toISOString() && habit.total_habitos === habit.habitos_concluidos);
    return <Commit key={day} days={habitFound} />;
  });

  return <div className={styles.weekD}>{renderedCommits}</div>;
}
