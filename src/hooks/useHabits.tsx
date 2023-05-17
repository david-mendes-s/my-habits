import { FormEvent, ReactNode, createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);



interface IHabitsProvider {
    children: ReactNode;
}

interface IDays {
    id: number,
    day: string,
    check: boolean
}

interface IhabitsProps {
  completed: boolean;
  day_id: string;
  habit_id: string;
  id: string;
  title: string;
  date: string;
}


interface HabitsContextData {
    createHabits: (title:string, closeModal: () => void) => Promise<void>,
    handleDays: (day: IDays) => void,
    habits: IhabitsProps[],
    countHabits: number,
    fetchHabits: () => Promise<void>,
    progress: number,
    habistCompleted: IhabitsProps[], 
    handleUpdateHabitComplet: (habi:IhabitsProps) => Promise<void>, 
  }

const HabitsContext = createContext<HabitsContextData>({} as HabitsContextData );

export function HabitsProvider({children}:IHabitsProvider){

    const [habits, setHabits] = useState<IhabitsProps[]>([]);
    const [days, setDays] = useState<IDays[]>([]);
    let countHabits = habits.length;

    //inicio
    const [progress, setProgress] = useState(0);
    const [count, setCount] = useState(0);
    const [countCompleted, setCountCompleted] = useState(0);
    const [habistCompleted, setHabitsCompleted] = useState<IhabitsProps[]>([]);
  
  
    async function handleCountProgress(){
      const response = await api.get('/server/countHabits')
      setCount(Number(response.data.count));
      setCountCompleted(Number(response.data.countCompleted));
    }
  
    
    async function handleUpdateHabitComplet(habit:IhabitsProps){
      //console.log(habit)
  
      await api.put('/server/habits', {
        habit
      });
  
      fetchHabits();
      handleCountProgress();
      
    }
  
    async function handleHabitComplet(){
      const response = await api.get('/server/habitsCompleted')
  
      setHabitsCompleted(response.data);
      console.log(habistCompleted)
    }
    //fim

    async function fetchHabits() {
      const response = await api.get('/server/habits');
      
      setHabits(response.data);
    }
    
    useEffect(()=>{
        days.map(day => {
          if(day.check === true){
            document.getElementById(`active-${day.id}`)!.style.backgroundColor="#5237E9";
          }else {
            document.getElementById(`active-${day.id}`)!.style.backgroundColor="";
          }
        })

        fetchHabits();

        countHabits = habits.length;

        handleCountProgress()
        setProgress(Number((countCompleted*100)/count))
        handleHabitComplet()


    }, [days, count, countCompleted]);

    

    async function createHabits(title:string, closeModal: () => void){
    
        const dates = handleParseDay();
        //console.log(dates);
    
        try{
          await api.post('/server/habits', {
            title,
            dates
          });
  
          
          closeModal();

          setDays([]);
        }catch(err){
          console.log(err);
        } 
    }

    /* function handleParseDay() {
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
        
    } */
    
  
    function handleParseDay() {
        const arrayDates: string[] = [];
      
        days.map(day => {
    
          if(day.check === true){
            //const currentDate = dayjs().startOf('day'); // Data atual
            const currentDate = dayjs.tz(new Date(), 'America/Sao_Paulo').startOf('day');
            const currentWeekday = currentDate.day(); // Dia da semana atual como um inteiro de 0 a 6
          
            if (day.id === currentWeekday) {
              arrayDates.push(currentDate.toISOString());
            } else if (currentWeekday > day.id) { // Se o dia da semana atual é maior que o dia da semana recebido
              const diffDays = currentWeekday - day.id; // Diferença entre o dia da semana atual e o dia da semana recebido
              const targetDate = currentDate.add((7 - diffDays), 'days').startOf('day').toISOString();
              arrayDates.push(targetDate);
            } else if (currentWeekday < day.id) { // Se o dia da semana atual é menor que o dia da semana recebido
              const diffDays = day.id - currentWeekday; // Diferença entre o dia da semana atual e o dia da semana recebido
              const targetDate = currentDate.add(diffDays, 'days').startOf('day').toISOString();
              arrayDates.push(targetDate);
            }
          }
        })
    
        return arrayDates;
        
    }

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

    return(
        <HabitsContext.Provider value={{createHabits, handleDays, habits, countHabits, fetchHabits, habistCompleted, handleUpdateHabitComplet, progress}}>
            {children}
        </HabitsContext.Provider>
    );
}

export function useHabits(){
    const context = useContext(HabitsContext);
    return context;
}