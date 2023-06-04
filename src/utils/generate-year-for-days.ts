import { useEffect, useState } from 'react';
import dayjs from 'dayjs';


export function generateYearForDays() {
  const [daysofYear, setDaysofYear] = useState<Date[]>([]);

  useEffect(() => {
    const firstDayOfTheYear = dayjs().startOf('year');
    /* const today = dayjs.tz(new Date(), 'America/Sao_Paulo').startOf('day').add(1, 'day').toDate(); */
    const today = dayjs().endOf('year');

    
    let compareDate = firstDayOfTheYear;
    const generatedDays:Date[] = [];

    while (compareDate.isBefore(today)) {
      generatedDays.push(compareDate.toDate());
      compareDate = compareDate.add(1, 'day');
    }

    setDaysofYear(generatedDays);
  }, []);

  return daysofYear;
}
