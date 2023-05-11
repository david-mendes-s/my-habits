import { FormEvent, ReactNode, createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import dayjs from "dayjs";



interface IHabitsProvider {
    children: ReactNode;
}

interface IDays {
    id: number,
    day: string,
    check: boolean
}

interface IhabitsProps {
    title: string,
    date: IDays[]
}

interface HabitsContextData {
    createHabits: (title:string, closeModal: () => void) => Promise<void>,
    handleDays: (day: IDays) => void,
    habits: IhabitsProps[],
}

const HabitsContext = createContext<HabitsContextData>({} as HabitsContextData );

export function HabitsProvider({children}:IHabitsProvider){

    const [habits, setHabits] = useState<IhabitsProps[]>([]);
    const [days, setDays] = useState<IDays[]>([]);

    useEffect(()=>{
        days.map(day => {
          if(day.check === true){
            document.getElementById(`active-${day.id}`)!.style.backgroundColor="#5237E9";
          }else {
            document.getElementById(`active-${day.id}`)!.style.backgroundColor="";
          }
        })

        async function fetchHabits() {
            const response = await api.get('/server/habits');
            setHabits(response.data);
        }
        fetchHabits();
    }, [days]);

    async function createHabits(title:string, closeModal: () => void){
    
        const dates = handleParseDay();
    
        try{
          const response = await api.post('http://localhost:3000/api/server/habits', {
            title,
            dates
          });
    
          const dataHabit = response.data;
    
          setHabits([dataHabit, ...habits])
    
          console.log(dataHabit);
    
          /* setTitle('');
          
          ; */
          closeModal();

          setDays([]);
        }catch(err){
          console.log(err);
        } 
    }

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
        <HabitsContext.Provider value={{createHabits, handleDays, habits}}>
            {children}
        </HabitsContext.Provider>
    );
}

export function useHabits(){
    const context = useContext(HabitsContext);
    return context;
}