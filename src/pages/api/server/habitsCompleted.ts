import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from '../auth/[...nextauth]';
import { Prisma } from '@prisma/client';
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

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
      
          const data = dayjs.tz(new Date(), 'America/Sao_Paulo').startOf('day').toISOString();
      
          /* const listHabits = await prisma.$queryRaw(
            Prisma.sql`
              SELECT dh.id, dh.habit_id, dh.day_id, dh.completed, h.title
              FROM "DayHabit" dh
              INNER JOIN "Habit" h ON dh."habit_id" = h."id"
              WHERE dh."day_id" IN (
                SELECT "id" FROM "Day" WHERE "date" = ${data}
              ) AND h."userId" = ${user?.id} AND dh.completed = true
            `
          ); */
          const listHabits = await prisma.$queryRaw(
            Prisma.sql`
              SELECT dh.id, dh.habit_id, dh.day_id, dh.completed, h.title, d.date
              FROM "DayHabit" dh
              INNER JOIN "Habit" h ON dh."habit_id" = h."id"
              INNER JOIN "Day" d ON dh."day_id" = d."id"
              WHERE d."date" = ${data} AND h."userId" = ${user?.id} AND dh.completed = true
            `
          );
          

        return res.status(201).json(listHabits);
    }
  }