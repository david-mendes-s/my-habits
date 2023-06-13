import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';


dayjs.extend(utc);
dayjs.extend(timezone);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if(req.method === 'POST') {

        const session = await getServerSession(req, res, authOptions);
        
        if (!session) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const user = await prisma.user.findFirst({
            where: {
              email: session.user?.email
            } 
        })

        const totalHabitos = await prisma.habit.count({
            where: {
                userId: user?.id
            }
        });

       // try{
          const data = dayjs.tz(new Date(), 'America/Sao_Paulo').startOf('day').toDate();
      
          const weekDay = data.getDay();
          // todos hábitos possiveis
          const possibleHabits = await prisma.habit.findMany({
              where: {
                created_at: {
                  lte: data,
                },
                weekDays: {
                  some: {
                    week_day: weekDay
                  }
                },
                user: {
                  id: user?.id
                },
              },
    
              include: {
                DayHabit: {
                  where: {
                    day: {
                      date: data.toISOString(),
                    }
                  }
                },
              }
            });
            
          const progresso = possibleHabits.map(habit => {
              if(habit.DayHabit.length <= 0){
                  return false;
              }else {
                  return true;
              }
          }).filter(habitCompleted => habitCompleted === true);
 
          //Verificar se dia já existe
          
       
          const seacherProgressToday = await prisma.progress.findFirst({
            where: {
                date_completed_habit: data.toISOString(),
                userId: user?.id
            }
          })
             
    
          let progress_habits = (progresso.length / possibleHabits.length) * 100;

          console.log(!seacherProgressToday);

          if(seacherProgressToday === null){
            await prisma.progress.create({
              data: {
                  progress_habit: Number(progress_habits.toFixed()) || 0,
                  date_completed_habit: data.toISOString(),
                  week_day: data.getDay(),
                  habitsCompleteds: progresso.length,
                  possibleHabitsDay: possibleHabits.length,
                  userId: user?.id!
              },
              
            });
          }else{
            await prisma.progress.delete({
              where: {
                id: seacherProgressToday?.id
              }
            })

            await prisma.progress.create({
              data: {
                  progress_habit: Number(progress_habits.toFixed()) || 0,
                  date_completed_habit: data.toISOString(),
                  week_day: data.getDay(),
                  habitsCompleteds: progresso.length,
                  possibleHabitsDay: possibleHabits.length,
                  userId: user?.id!
              }
            });

          }

          
        return res.status(200).json({message: 'created sucess'});

    }else if(req.method === 'GET'){
        const session = await getServerSession(req, res, authOptions);
        
        if (!session) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const user = await prisma.user.findFirst({
            where: {
              email: session.user?.email
            } 
        })

        /*Todos os hábitos e todos os hábitos completos*/
        const totalHabitos = await prisma.habit.count({
            where: {
                userId: user?.id
            }
          });
      
          const totalHabitosCompletos = await prisma.dayHabit.count({
            where: {
                habit: {
                    userId: user?.id
                }
            },
            
          });

          const data = dayjs.tz(new Date(), 'America/Sao_Paulo').startOf('day').toDate();
          const weekDay = data.getDay();

          const possibleHabits = await prisma.habit.findMany({
            where: {
              created_at: {
                lte: data,
              },
              weekDays: {
                some: {
                  week_day: weekDay
                }
              },
              user: {
                id: user?.id
              },
            },
  
            include: {
              DayHabit: {
                where: {
                  day: {
                    date: data.toISOString(),
                  }
                }
              },
            }
          });

        const progresso = possibleHabits.map(habit => {
            if(habit.DayHabit.length <= 0){
                return false;
            }else {
                return true;
            }
        }).filter(habitCompleted => habitCompleted === true);


        //Lista de progresso
       const progressMany = await prisma.progress.findMany({
        where: {
            userId: user?.id
        },
        orderBy: {
            date_completed_habit: 'asc'
        }
       })

       //Sequencia

        const copyProgressMany = progressMany;
       
        let repositorySequence = 0;
       
        copyProgressMany.map(progress => {
            if(progress.progress_habit === 100){
                repositorySequence++;
            }else{
                repositorySequence = 0;
            }
        })

        await prisma.user.update({
            where: {
                id: user?.id
            },
            data: {
               sequence: repositorySequence,
            } 
        })

        const sequences = await prisma.user.findFirst({
            select: {
                sequence: true
            },
            where: {
                id: user?.id
            }
        })

        // Contância Média
        let repositoryConstanceMedia = 0;
        const copyByprogressManyForConstance = progressMany;

        copyByprogressManyForConstance.map(progress => {
            repositoryConstanceMedia = repositoryConstanceMedia + progress.progress_habit;
        });

        let constanceMedia = repositoryConstanceMedia/copyByprogressManyForConstance.length;

        //Avaliação por emoji: Média das Constâncias por dia da semana

        const mediaConstanceByWeekDays = await prisma.progress.groupBy({
            by: ['week_day'],
            _avg: {
                progress_habit: true,
            },
            where: {
                userId: user?.id
            }
        })

        //Listagem do Ranking

        const ranking = await prisma.$queryRaw`
            SELECT * FROM "User" U
            ORDER BY U.sequence DESC;
        `;
    
        
        return res.status(200).json(
            {   
                possibleHabits,
                progresso,
                progressMany, 
                totalHabitos, 
                totalHabitosCompletos, 
                sequences, 
                constanceMedia,
                mediaConstanceByWeekDays,
                ranking,
            });
    }
  }

  

  /* const verifyDate:{exists: boolean}[] = await prisma.$queryRaw`
  SELECT EXISTS(SELECT * FROM "Progress" Pr
  WHERE Pr.date_completed_habit = ${data.toISOString()})
`
console.log(verifyDate[0].exists); */
  /*   const repositorioProgressoDoDia: {
        user: string 
        progress: number, 
        week_day: number, 
        dateCompletedHabit:string, 
        possibleHabitsDay: number,
        habitsCompleteds: number,
    }[] = []; */
  /* repositorioProgressoDoDia.push(
    {
        progress: (progresso.length / possibleHabits.length) * 100 || 0, 
        dateCompletedHabit: data.toISOString(), 
        week_day: data.getDay(),
        user: user?.id!,
        habitsCompleteds: progresso.length,
        possibleHabitsDay: possibleHabits.length
    }) */