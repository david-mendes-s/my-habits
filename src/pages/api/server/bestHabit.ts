import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

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
      
      const searchSpacingTimeDateHabits:[] = await prisma.$queryRaw`
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
      });

      return res.status(201).json({bestHabit});
    }
  }