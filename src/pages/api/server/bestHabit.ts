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
      let constancy:any = {};

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

      const constancyList:{ 
        title: string,
        incomplete: number,
        completed: number,
        percent: number,
        total: number  
      }[] = Object.values(constancy);

      const bestHabit = constancyList.reduce((prev, curr) => {
        if (!prev || curr.completed >= prev.completed || (curr.completed === prev.completed && curr.percent >= prev.percent)) {
          return curr;
        }
        return prev;
      },{
        title: '',
        completed: 0,
        incomplete: 0,
        percent: 0,
        total: 0
      });
      

     //constância mêdia
     let constancyMedia = 0;
     
     constancyList.forEach(habit => {
      constancyMedia += habit.percent
     })

     constancyMedia /= constancyList.length;
    
      return res.status(201).json({constancyList, bestHabit, constancyMedia});
    
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


