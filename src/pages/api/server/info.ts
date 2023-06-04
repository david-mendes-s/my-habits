import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { User } from "@prisma/client";

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
          }).every(habitCompleted => habitCompleted === true);

          const repositorioProgressoDoDia: {progresso: boolean, dataCompletadoHabito:string, diaDaSemana: number, user: User }[] = [];

          console.log(progresso, repositorioProgressoDoDia);

          if(progresso === true && totalHabitos > 0){
            repositorioProgressoDoDia.push(
                {
                    progresso, 
                    dataCompletadoHabito: data.toISOString(), 
                    diaDaSemana: data.getDay(),
                    user: user!,
                })
          }/* else if(progress === false){
            let posicaoDoDiNoArray = repositorioProgressoDoDia.findIndex((dates) => dates.dataCompletadoHabito === data.toISOString())
            repositorioProgressoDoDia.splice(posicaoDoDiNoArray, 1);
          } */

          return res.status(200).json({repositorioProgressoDoDia, totalHabitos, totalHabitosCompletos});
    }
  }