import React from 'react';

interface IweeklyConsistencyAverageSearch{
  week_day: number,
  total_habits_completed: number,
  habits: number
}

const getEmojiForPercentage = (percentage:number) => {
    const arrayEmoji = [
      { emoji: '😭', porcent: 0 },
      { emoji: '🥹', porcent: 16.66 },
      { emoji: '😒', porcent: 33.33 },
      { emoji: '🙂', porcent: 50 },
      { emoji: '😄', porcent: 66.66 },
      { emoji: '😍', porcent: 83.33 },
      { emoji: '😎', porcent: 100 }
    ];
  
    const matchedEmoji = arrayEmoji.find((item) => percentage <= item.porcent);
  
    return matchedEmoji ? matchedEmoji.emoji : '😭';
  };
  
  const WeeklyList = ({weeklyConsistencyAverageSearch}:any) => {
    const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; // Dias da semana
    const defaultEmoji = '😭'; // Emoji padrão
  
    // Mapeia os dias da semana e gera os elementos JSX
    const renderedList = daysOfWeek.map((day, index) => {
      // Encontra o objeto correspondente ao dia da semana
      const consistencyData = weeklyConsistencyAverageSearch.find(
        (item:IweeklyConsistencyAverageSearch) => item.week_day === index
      );
  
      // Define o emoji com base no objeto encontrado ou usa o emoji padrão
      const emoji = consistencyData ? getEmojiForPercentage(consistencyData._avg.progress_habit) : defaultEmoji;
  
      return (
        <li key={index}>
          <p>{day}</p>
          <div>{emoji}</div>
        </li>
      );
    });
  
    return <ul>{renderedList}</ul>;
  };
  
  export default WeeklyList;