import { FormEvent, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { nunito } from '@/pages/_app';
import styles from './Modal.module.css';
import dayjs from 'dayjs';
import axios from 'axios';
import { api } from '@/lib/api';

Modal.setAppElement('body');

interface IModalProps {
    modalIsOpen: boolean, 
    closeModal: () => void,
}

interface IListDaysWeekProps {
    id: number,
    day: string,
    check: boolean
}

interface IhabitsProps {
    title:string,
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

export function CreateHabitModal({modalIsOpen, closeModal}:IModalProps){
    
    const listDaysWeek:IListDaysWeekProps[] = [
        {id: 0, day: 'Dom', check: false},
        {id: 1, day: 'Seg', check: false},
        {id: 2, day: 'Ter', check: false},
        {id: 3, day: 'Qua', check: false},
        {id: 4, day: 'Qui', check: false},
        {id: 5, day: 'Sex', check: false},
        {id: 6, day: 'Sáb', check: false}
    ];
    
    const [title, setTitle] = useState('');
    const [habits, setHabits] = useState<IhabitsProps[]>([]);
    const [days, setDays] = useState<IDays[]>([]);

    async function handleHabits(e:FormEvent){
        e.preventDefault();
    
        const dates = handleParseDay();
    
        try{
          const response = await api.post('http://localhost:3000/api/server/habits', {
            title,
            dates
          });
    
          const dataHabit = response.data;
    
          setHabits([dataHabit, ...habits])
    
          console.log(dataHabit);
    
          setTitle('');
          setDays([]);
          closeModal();
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
        <>
            <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            overlayClassName={styles.reactmodaloverlay}
            className={styles.reactmodalcontent}
            >
                <div className={styles.container}>
                  <h1 className={nunito.className}>Novo Hábito</h1>
                  <form onSubmit={handleHabits}>
                    <input 
                        type="text" 
                        placeholder="Dê um título para seu hábito..."
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                    />
                        <div>
                            <strong className={nunito.className}>Recorrência: </strong>
                            <button className={`${nunito.className} ${styles.btnDaysWeek}`}>Personalizado</button>
                        </div>

                        <div className={styles.listData}>
                        {listDaysWeek.map(days => (
                            <div key={days.id}>
                                <p className={nunito.className}>{days.day}</p>
                            <div onClick={() => handleDays(days)} className={`${styles.checklist}`} id={`active-${days.id}`}></div>
                            </div>
                        ))}
                        </div>

                        <button 
                        className={`${nunito.className} ${styles.btnHabitsCreate}`}
                        onClick={handleParseDay}
                        >Criar hábito</button>

                  </form>
                </div>
            </Modal>
        </>
    );

    
}