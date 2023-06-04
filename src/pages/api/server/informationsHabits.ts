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
      
          const count = await prisma.habit.count({
            where: {
                userId: user?.id
            }
          });
      
          const countHabitsCompleted = await prisma.dayHabit.count({
            where: {
                habit: {
                    userId: user?.id
                }
            },
            
          });
          

        /* const totalDeHabitosConcluidosEmCadaDia = await prisma.$queryRaw`
            SELECT habitsCompleted.date, habitsCompleted.title ,cast(count(habitsCompleted.completed) as float) as habitos_concluidos FROM (
                SELECT D.date, DH.completed, H.title FROM  "Day" D, "DayHabit" DH, "User" U, "Habit" H
                WHERE U.id = H."userId" AND DH.habit_id = H.id AND D.id = DH.day_id
            ) as habitsCompleted
            GROUP BY habitsCompleted.date, habitsCompleted.title
        `; */

        /* const totalDeHabitosConcluidosEmCadaDia = await prisma.$queryRaw`
            SELECT
            D.date,
            cast(COUNT(DH.completed) as float) as habitos_concluidos,
            json_agg(H.title) as titles
            FROM
            "Day" D
            JOIN
            "DayHabit" DH ON D.id = DH.day_id
            JOIN
            "Habit" H ON H.id = DH.habit_id
            JOIN
            "User" U ON U.id = H."userId"
            WHERE
            DH.completed = true
            GROUP BY
            D.date;
        `;

        const totalDeHabitosEmUmDia = await prisma.$queryRaw`
           SELECT days_weeks.week_day, cast(count(days_weeks.week_day) as float) as total_habitos FROM
            (SELECT * FROM habit_week_days HWD) as days_weeks
            GROUP BY days_weeks.week_day 
        `; */

        const agregacion:[] = await prisma.$queryRaw`
            SELECT * FROM (
            SELECT D.date, cast(COUNT(DH.completed) as float) as habitos_concluidos,
            json_agg(H.title) as titles
            FROM "Day" D
            JOIN "DayHabit" DH ON D.id = DH.day_id
            JOIN "Habit" H ON H.id = DH.habit_id
            JOIN "User" U ON U.id = H."userId"
            WHERE DH.completed = true AND U.id = ${user?.id}
            GROUP BY D.date
            ) as completed,
            (
                SELECT days_weeks.week_day, cast(count(days_weeks.week_day) as float) as total_habitos FROM
                (
                    SELECT * FROM habit_week_days HWD
                    JOIN "Habit" H ON H.id = HWD.habit_id
                    JOIN "User" U ON U.id = H."userId"
                    WHERE U.id = ${user?.id}
                ) as days_weeks
                GROUP BY days_weeks.week_day 
            ) as amount
            WHERE amount.week_day = extract(dow from cast(completed.date as DATE))::int 
        `;


        const searchSpacingTimeDateHabits:[] = await prisma.$queryRaw`
            /* SELECT H.title, H."created_at" as diffDate, 
            (
                SELECT cast(count(DH.habit_id) as float) as total_habits_completed
                FROM "DayHabit" DH, "User" U
                WHERE H.id = DH.habit_id AND U.id = H."userId" AND H."userId" = ${user?.id}
            ) 
            FROM "Habit" H
            WHERE H."userId" = ${user?.id} */

            SELECT
            H.title,
            cast(count(DH.completed) as float) AS habits_completed,
            cast(COUNT(*) as float) AS total_habits,
            cast((COUNT(DH.completed)::float / COUNT(*)::float) * 100 as float) AS consistency
            FROM
            "User" U
            LEFT JOIN
            "Habit" H ON U.id = H."userId"
            LEFT JOIN
            "DayHabit" DH ON H.id = DH."habit_id"
            WHERE
            U.id = ${user?.id}
            GROUP BY
            H.title;


        `;

        
        const today = dayjs.tz(new Date(), 'America/Sao_Paulo').startOf('day')
        
        const spacingTimeDateHabits = searchSpacingTimeDateHabits.map((item:IBestHabit) => {
            
            /* const diffDates = dayjs.tz(item.diffdate, 'America/Sao_Paulo').startOf('day') */
            
            /* let diff = today.diff(diffDates, 'days'); */
            const title =  item.title;
            /* const totalHabits = item.total_habits_completed; */

           /*  if(diff === 0){
                diff = 1;
            } */
        
            const percent = item.consistency

            return {
                title,
                percent
            };
        });

        let bestHabit = {
            title: '',
            percent: 0,
        }

        let sum = 0;

        spacingTimeDateHabits.map(habit =>{
            sum += habit.percent;

            if(habit.percent >= bestHabit.percent){
                bestHabit = habit
            }
            
       });

       const averagePercent = (sum / spacingTimeDateHabits.length).toFixed(2);
       const porcentAverage = Number(averagePercent);

       //Busca da média da concistência por dia da semana
       const weeklyConsistencyAverageSearch = await prisma.$queryRaw`

               SELECT * FROM
                (
                    SELECT days_weeks.week_day, CAST(COUNT(days_weeks.week_day) AS FLOAT) AS total_habits_completed
                    FROM
                    (
                        SELECT *
                        FROM habit_week_days HWD
                        JOIN "Habit" H ON H.id = HWD.habit_id
                        JOIN "DayHabit" DH ON H.id = DH."habit_id"
                        JOIN "Day" D ON D.id = DH."day_id" AND EXTRACT(DOW FROM CAST(D.date AS DATE))::int = HWD.week_day
                        JOIN "User" U ON U.id = H."userId"
                        WHERE U.id = ${user?.id}
                    ) AS days_weeks
                    GROUP BY days_weeks.week_day
                ) AS amount,
                (
                        SELECT HWD.week_day, CAST(COUNT(*) AS FLOAT) AS habits
                        FROM "Habit" H
                        JOIN habit_week_days HWD ON H.id = HWD.habit_id
                        JOIN "User" U ON U.id = H."userId"
                        WHERE U.id = ${user?.id}
                        GROUP BY HWD.week_day
                ) AS completed
                WHERE amount.week_day = completed.week_day;
        `;

       const ranking = await prisma.$queryRaw`    
            SELECT * FROM
            (SELECT DISTINCT HWD.week_day, U.id, U.name, U.image, CAST(COUNT(*) AS FLOAT) AS habits
            FROM "Habit" H
            JOIN habit_week_days HWD ON H.id = HWD.habit_id
            JOIN "User" U ON U.id = H."userId"
            GROUP BY HWD.week_day, U.id) as amount,
            
            (SELECT DISTINCT U.id, U.name, U.image, d.date, 
            CAST(COUNT(DH.completed) AS FLOAT) AS habits_completed
            FROM "Habit" H, "User" U, "Day" D, "DayHabit" DH
            WHERE U.id = H."userId" AND H.id = DH.habit_id AND D.id = DH.day_id
            GROUP BY U.id, D.date) as completed

            WHERE amount.week_day = extract(dow from cast(completed.date as DATE))::int
            AND amount.id = completed.id AND amount.image = completed.image AND amount.name = completed.name
        `
        

        return res.status(201).json({count, countHabitsCompleted, agregacion, bestHabit, porcentAverage, weeklyConsistencyAverageSearch, ranking});
    }
  }