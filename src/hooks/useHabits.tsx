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
  DayHabit: [{
    completed: boolean
  }];
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
    

    //inicio
    const [progress, setProgress] = useState(0);
    const [count, setCount] = useState(0);
    const [countCompleted, setCountCompleted] = useState(0);
    const [habistCompleted, setHabitsCompleted] = useState<IhabitsProps[]>([]);
    let countHabits = count - countCompleted;
  
    async function handleCountProgress(){
      const response = await api.get('/server/countHabits')
      setCount(Number(response.data.count));
      setCountCompleted(Number(response.data.countCompleted));
    }

   
    async function handleUpdateHabitComplet(habit:IhabitsProps){
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

        handleCountProgress()
        setProgress(Number((countCompleted*100)/count))
        handleHabitComplet()
        
    }, [days, count, countCompleted]);

    

    async function createHabits(title:string, closeModal: () => void){
    
      const daysChecked = days.filter(day => day.check === true);
    
        try{
          await api.post('/server/habits', {
            title,
            daysChecked // [1,2,3]
          });

          closeModal();

          setDays([]);
        }catch(err){
          console.log(err);
        } 
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