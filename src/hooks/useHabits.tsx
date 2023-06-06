import { FormEvent, ReactNode, createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import axios from "axios";

dayjs.extend(utc);
dayjs.extend(timezone);

interface IAgregacion {
  habitos_concluidos: number,
  total_habitos: number,
  date: string
}

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

interface IBestHabit {
    title: string,
    percent: number,
    totalHabits: number,   
    diff: number
}

interface IweeklyConsistencyAverageSearch{
  week_day: number,
  total_habits_completed: number,
  habits: number
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
    countHabitsInformations: number, 
    countSequence: number, 
    countHabitsInformationsCompleted: number,
    bestHabit: IBestHabit, 
    porcentAverage: number,
    weeklyConsistencyAverageSearch: IweeklyConsistencyAverageSearch[],
    agregacion:IAgregacion[],
    rankingSequence:{ name: string, sequence: number, image:string }[],
    daysCompleted: {
      userId: string 
      progress_habit: number, 
      week_day: number, 
      date_completed_habit:string, 
      possibleHabitsDay: number,
      habitsCompleteds: number,
    }[],
   
  }


const HabitsContext = createContext<HabitsContextData>({} as HabitsContextData );

export function HabitsProvider({children}:IHabitsProvider){

    //ROTA INFO
    const [daysCompleted, setDaysCompleted] = useState([]);
    const [countSequence, setCountSequence] = useState<number>(0);
    const [porcentAverage, setPorcentAverage] = useState<number>(0);
    const [weeklyConsistencyAverageSearch, setWeeklyConsistencyAverageSearch] = useState([]);
    const [user, setUser] = useState();
    //
    const [habits, setHabits] = useState<IhabitsProps[]>([]);
    const [days, setDays] = useState<IDays[]>([]);
    

    //inicio
    const [progress, setProgress] = useState(0);
    const [count, setCount] = useState(0);
    const [countCompleted, setCountCompleted] = useState(0);
    const [habistCompleted, setHabitsCompleted] = useState<IhabitsProps[]>([]);
    let countHabits = count - countCompleted;

    //information
    const [countHabitsInformations, setCountHabitsInformations] = useState<number>(0);
    const [countHabitsInformationsCompleted, setCountHabitsInformationsCompleted] = useState(0);
    const [agregacion, setAgregacion] = useState<IAgregacion[]>([]);
    
    
    
    const [bestHabit, setBestHabit] = useState<IBestHabit>({
      title: "Melhor Hábito não definido",
      percent: 0,
      totalHabits: 0,   
      diff: 0
    });
    
    const [rankingSequence, setRankingSequence] = useState([]);
    
    async function handleHabitsInformations(){
      const response = await api.get('/server/bestHabit');
      
      setBestHabit(response.data.bestHabit);
      
      
      
    } 

    async function handleDaysCompleted(){
      const response = await api.get('/server/info')
      
      setDaysCompleted(response.data.progressMany);
      setCountSequence(response.data.sequences.sequence);
      setPorcentAverage(response.data.constanceMedia);
      setWeeklyConsistencyAverageSearch(response.data.mediaConstanceByWeekDays);

      setCountHabitsInformations(response.data.totalHabitos);
      setCountHabitsInformationsCompleted(response.data.totalHabitosCompletos);

      setRankingSequence(response.data.ranking);
      setUser(response.data.user);
    }
    //information
  
    async function handleCountProgress(){
      const response = await api.get('/server/countHabits')
      setCount(Number(response.data.count));
      setCountCompleted(Number(response.data.countCompleted));
    }

   
    async function handleUpdateHabitComplet(habit:IhabitsProps){
      await api.put('/server/habits', {
        habit
      });
      
      await api.post('/server/info');
      
      handleDaysCompleted();
      fetchHabits();
      handleCountProgress();

    }
  
    async function handleHabitComplet(){
      const response = await api.get('/server/habitsCompleted')
  
      setHabitsCompleted(response.data);
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
        handleHabitsInformations()

        handleDaysCompleted()
        

    }, [days, count, countCompleted, countHabitsInformationsCompleted]);

    

    async function createHabits(title:string, closeModal: () => void){
    
      const daysChecked = days.filter(day => day.check === true);
    
        try{
          await api.post('/server/habits', {
            title,
            daysChecked // [1,2,3]
          });

          await api.post('/server/info');
          handleDaysCompleted();

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
        <HabitsContext.Provider value={{createHabits, handleDays, habits, daysCompleted,
                                        countHabits, fetchHabits, habistCompleted, 
                                        handleUpdateHabitComplet, progress, countHabitsInformations, 
                                        countHabitsInformationsCompleted, countSequence, 
                                        bestHabit, porcentAverage, weeklyConsistencyAverageSearch, agregacion, rankingSequence}}>
                                {children}
        </HabitsContext.Provider>
    );
}

export function useHabits(){
    const context = useContext(HabitsContext);
    return context;
}