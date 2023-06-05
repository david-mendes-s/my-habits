// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if(req.method === 'POST') {
    const data = req.body;
    
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    try {
      const user = await prisma.user.findFirst({
        where: {
          email: session?.user?.email
        } 
        
      })

      const date = dayjs.tz(new Date(), 'America/Sao_Paulo').startOf('day').toDate();
  
      await prisma.habit.create({
        data: {
          title: data.title,
          created_at: date,
          user: { connect: { id: user?.id } }, // Conecta o hábito ao usuário com o id correspondente
          weekDays: {
            create: data.daysChecked.map((weekDay:any) => ({
              week_day: weekDay.id
            }))
          }
        },
        include: { weekDays: true } // Carrega também os dias criados
      });
      
      return res.status(201).json({message: "create habit with sucess."});
    }catch(err){
     throw new Error('internal error') 
    }
  }else if(req.method === 'GET'){
    try {
      const session = await getServerSession(req, res, authOptions);
    
      if (!session) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findFirst({
        where: {
          email: session?.user?.email
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
        
      return res.status(200).json(possibleHabits);
    }catch(err:any) {
      throw new Error('internal error', err);
    }
    
  
  }else if(req.method === 'PUT'){
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const data = req.body;
    
    const user = await prisma.user.findFirst({
      where: {
        email: session?.user?.email
      } 
    })

    const habit = await prisma.habit.findUnique({
      where: {
        id: data.habit.id
      }
    })
     
    if (!habit) {
      res.status(401).json({ message: 'No existed habit!' });
      return;
    }

    const today = dayjs.tz(new Date(), 'America/Sao_Paulo').startOf('day').toISOString();

    const existingDayHabit = await prisma.dayHabit.findFirst({
      where: {
        habit: {
          user: {
            id: user?.id
          }
        },
        habit_id: habit.id,
        day: {
          date: today,
        }
      }
    });


    
    if (existingDayHabit) {
      await prisma.dayHabit.delete({
        where: {
          id: existingDayHabit.id,
        },
      });

      await prisma.day.delete({
        where: {
          id: existingDayHabit.day_id
        }
      })

    } else {
      await prisma.dayHabit.create({
        data: {
          habit: { connect: { id: habit.id } },
          completed: true,
          day: {
            create: {
              date: today
            }
          }
        }
      });
    }
    
    return res.status(200).json({message: "update habit with sucess."});
  }
}
