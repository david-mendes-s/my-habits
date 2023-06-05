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
  const { daysCompleted } = useHabits();
  
  const renderedCommits = dayofYear.map((day) => {
    const habitFound = daysCompleted.find((habit) => habit.date_completed_habit === day.toISOString() && habit.progress_habit === 100);
    return <Commit key={day} days={habitFound} />;
  });

  return <div className={styles.weekD}>{renderedCommits}</div>;
}
