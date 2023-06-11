import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { IncompleteHabit } from "@prisma/client";

dayjs.extend(utc);
dayjs.extend(timezone);


interface IBestHabit {
    "title": string,
    "habits_completed": number,
    "total_habits": number,
    "consistency": number
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if(req.method === 'GET') {
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

      const habitCompleted:{ 
      habit_id: string,
      title: string,
      habit_completed: number}[] = await prisma.$queryRaw`
        SELECT DH.habit_id, H.title ,CAST(COUNT(DH.habit_id) as float) as habit_completed
        FROM "DayHabit" DH, "User" U, "Habit" H
        WHERE DH.habit_id = H.id AND U.id = H."userId" AND U.id = ${user?.id}
        GROUP BY DH.habit_id, H.title 
      `

      const habitsIncompleted:{ 
        habit_id: string,
        title: string,
        habit_incomplete: number}[] = await prisma.$queryRaw`
        SELECT IH.habit_id, IH.title, CAST(COUNT(IH.habit_id) as float) as habit_incomplete
        FROM "IncompleteHabit" IH, "User" U
        WHERE U.id = ${user?.id}
        GROUP BY IH.habit_id, IH.title 
      `
      const constancy:any = {};

      for (const habit of habitCompleted) {
        const { habit_id, title, habit_completed } = habit;
        const incompleteHabit = habitsIncompleted.find((h) => h.habit_id === habit_id);
        const incompleteCount = incompleteHabit ? incompleteHabit.habit_incomplete : 0;
        const total = habit_completed + incompleteCount;
        const constancyPercentage = (habit_completed / total) * 100;

        constancy[habit_id] = {
          title,
          percent: constancyPercentage.toFixed(2),
          completed: habit_completed,
          incomplete: incompleteCount,
          total
        };
      }

      for (const habit of habitsIncompleted) {
        const { habit_id, title, habit_incomplete } = habit;
        if (!constancy[habit_id]) {
          const total = habit_incomplete;
          const constancyPercentage = 0;
          constancy[habit_id] = {
            title,
            percent: constancyPercentage.toFixed(2),
            completed: 0,
            incomplete: habit_incomplete,
            total
          };
        }
      }

      const constancyList = Object.values(constancy);

      const bestHabit = constancyList.reduce((prev:any, curr:any) => {
        if (curr.completed > prev.completed || (curr.completed === prev.completed && curr.percent > prev.percent)) {
          return curr;
        }
        return prev;
      });
    
      return res.status(201).json({possibleHabits, habitCompleted, habitsIncompleted, constancyList, bestHabit});
    
    }else if(req.method === 'POST'){

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

      const filterHabitsIncomplete = possibleHabits.filter(habit => habit.DayHabit.length <= 0);

        await prisma.incompleteHabit.deleteMany({
          where: {
            date_incomplete: data.toISOString()
          }
        })

      filterHabitsIncomplete.map(async (habit) => {
        

        await prisma.incompleteHabit.upsert({
          create: {
            habit_id: habit.id,
            userId: habit.userId,
            title: habit.title,
            date_created_at: habit.created_at,
            date_incomplete: data.toISOString()
          }, 
          update: {
            habit_id: habit.id,
            userId: habit.userId,
            title: habit.title,
            date_created_at: habit.created_at,
            date_incomplete: data.toISOString()
          },
          where: {
            habit_id_date_incomplete: {
              habit_id: habit.id,
              date_incomplete: data.toISOString()
            }
          }
        
       })
        
      })

      return res.status(201).json({message: 'habit created'});
    }
  }

  /*
    BEST HABITS

    - Quantas vezes o hábito se repete na semana
    - Quantas semanas já se passaram contando a semanda de criação
      obs: A multiplicação do resultado das duas buscas vai me dá o total de dias que 
      o hábito estave disponível.
      
    - Quantas vezes esse hábito foi marcado como concluído vai me da a quantidade
      de hábitos concluidos
    
    - O melhor hábito é aquele que tem a maior constância e a maior quantidades de
      hábitos concluidos.
  */



  /* const searchSpacingTimeDateHabits:[] = await prisma.$queryRaw`
        SELECT H.title,
          cast(count(DH.completed) as float) AS habits_completed,
          cast(COUNT(*) as float) AS total_habits,
          cast((COUNT(DH.completed)::float / COUNT(*)::float) * 100 as float) AS consistency
          FROM "User" U
            LEFT JOIN
              "Habit" H ON U.id = H."userId"
            LEFT JOIN
              "DayHabit" DH ON H.id = DH."habit_id"
          WHERE U.id = ${user?.id}
          GROUP BY H.title;
      `;
        
      const spacingTimeDateHabits = searchSpacingTimeDateHabits.map((item:IBestHabit) => {
          const title =  item.title;
          const percent = item.consistency

          return {
              title, percent
          };
      });

      let bestHabit = { title: '', percent: 0 }

      spacingTimeDateHabits.map(habit => {
        if(habit.percent >= bestHabit.percent){
            bestHabit = habit
        }  
      }); */