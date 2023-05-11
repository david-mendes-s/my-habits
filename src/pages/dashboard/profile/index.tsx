import { GetServerSideProps } from "next";
import Dashboard from "..";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import dayjs from "dayjs";
import styles from './Profile.module.css';
import { CreateHabitModal } from "@/components/modal/CreateHabitModal";


type SessionProps = {
  session: Session | null, 
}

interface IhabitsProps {
  title:string,
  description:string,
  days: {
    id: number,
    day: string,
    check: boolean
  }
}

interface IDays {
  id: number,
  day: string,
  check: boolean
}

interface IListDaysWeekProps {
  id: number,
  day: string,
  check: boolean
}

export default function Profile({session}:SessionProps){

  const listDaysWeek:IListDaysWeekProps[] = [
    {id: 0, day: 'Dom', check: false},
    {id: 1, day: 'Seg', check: false},
    {id: 2, day: 'Ter', check: false},
    {id: 3, day: 'Qua', check: false},
    {id: 4, day: 'Qui', check: false},
    {id: 5, day: 'Sex', check: false},
    {id: 6, day: 'Sáb', check: false}
  ];

  const [habits, setHabits] = useState<IhabitsProps[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState<IDays[]>([]);
  const [active, setActive] = useState<'active' | 'disable'>('active');


  async function handleHabits(e:FormEvent){
    e.preventDefault();

    const dates = handleParseDay();

    try{
      const response = await axios.post('http://localhost:3000/api/server/hello', {
        title,
        description,
        dates
      });

      const dataHabit = response.data;

      setHabits([dataHabit, ...habits])

      console.log(dataHabit);

      setTitle('');
      setDescription('');
    }catch(err){
      console.log(err);
    } 
  }

 /*  function handleDays(day: IDays){

    const busca = days.findIndex((array) => array.id === day.id);

    if(busca < 0){
      
      day = {...day, check: true} 
     
      setDays([day, ...days]);
    }else {
      if(days[busca].check === false){
        days[busca] = {...days[busca], check: true}
      }else{
        days[busca] = {...days[busca], check: false}
      }
    }
    
  } */


  function handleDays(day: IDays){
    const busca = days.findIndex((array) => array.id === day.id);
  
    if(busca < 0){
      day = {...day, check: true} 
      setDays([day, ...days]);
    }else {
      if(days[busca].check === false){
        days[busca] = {...days[busca], check: true}
      }else{
        days[busca] = {...days[busca], check: false}       
      }
      setDays([...days]); // aqui você atualiza o estado com uma cópia atualizada de days
    }
  }
  
  useEffect(()=>{
    days.map(day => {
      if(day.check === true){
        document.getElementById(`active-${day.id}`)!.style.backgroundColor="#5237E9";
      }else {
        document.getElementById(`active-${day.id}`)!.style.backgroundColor="";
      }
    })
  }, [days]);
  


  function handleParseDay() {
    const arrayDates: Date[] = [];
  
    days.map(day => {

      if(day.check === true){
        const currentDate = dayjs(new Date()).startOf('day'); // Data atual
  
        const currentWeekday = currentDate.day(); // Dia da semana atual como um inteiro de 0 a 6
    
        if (day.id === currentWeekday) {
          const currentDateString = currentDate.format();
          arrayDates.push(new Date(currentDateString));
        } else if (currentWeekday > day.id) { // Se o dia da semana atual é maior que o dia da semana recebido
          const diffDays = currentWeekday - day.id; // Diferença entre o dia da semana atual e o dia da semana recebido
          const targetDate = dayjs(new Date()).add((7 - diffDays), 'days').startOf('day').format();
          arrayDates.push(new Date(targetDate));
        } else if (currentWeekday < day.id) { // Se o dia da semana atual é menor que o dia da semana recebido
          const diffDays = day.id - currentWeekday; // Diferença entre o dia da semana atual e o dia da semana recebido
          const targetDate = dayjs(new Date()).add(diffDays, 'days').startOf('day').format();
          arrayDates.push(new Date(targetDate));
        }
      }
    })

    return arrayDates;
    
  }
  
    return(
       <Dashboard auth={session}>
        <div className={styles.container}>
          <form onSubmit={handleHabits}>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}/>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}/>

            


            <div className={styles.listData}>
              {listDaysWeek.map(days => (
                <div key={days.id}>
                  {days.day}
                  <div onClick={() => handleDays(days)} className={`${styles.checklist}`} id={`active-${days.id}`}></div>
                </div>
              ))}
            </div>
          
            <button /* onClick={handleParseDay} */>Cadastrar</button>
        </form>

        <ul>
              {habits.map(habit => (
                  <li key={habit.title}>{habit.title}</li>
              ))}
            </ul>
        
        </div>

        {/* <CreateHabitModal /> */}

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