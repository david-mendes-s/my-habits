import { FormEvent, useState } from 'react';
import Modal from 'react-modal';
import { nunito } from '@/pages/_app';
import styles from './Modal.module.css';
import { useHabits } from '@/hooks/useHabits';

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

export function ModalTest({modalIsOpen, closeModal}:IModalProps){
    
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
    const habits = useHabits();       

    async function handleCreateHabits(e:FormEvent){
      e.preventDefault();

      await habits.createHabits(title, closeModal);

      setTitle('');
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
                            <div onClick={() => habits.handleDays(days)} className={`${styles.checklist}`} id={`active-${days.id}`}></div>
                            </div>
                        ))}
                        </div>

                        <button 
                        className={`${nunito.className} ${styles.btnHabitsCreate}`}
                        onClick={handleCreateHabits}
                        >Criar hábito</button>

                  
                </div>
            </Modal>
        </>
    );

    
}