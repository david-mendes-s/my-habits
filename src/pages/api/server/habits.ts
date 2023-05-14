// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import dayjs from 'dayjs';
import { Prisma } from '@prisma/client';

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
  
      await prisma.habit.create({
        data: {
          title: data.title,
          user: { connect: { id: user?.id } }, // Conecta o hábito ao usuário com o id correspondente
          DayHabit: {
            create: data.dates.map((days: Date) => ({
              day: { create: { date: days } }
            }))
          }
        },
        include: { DayHabit: true } // Carrega também os dias criados
      });

      
      return res.status(201).json({message: "create habit with sucess."});
    }catch(err){
     throw new Error('internal error') 
    }
  }else if(req.method === 'GET'){
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

    let dia = new Date().getDate();
    let mes = new Date().getMonth()+1;
    let ano = new Date().getFullYear();

    let data = `${ano}-${mes}-${dia} 03:00:00.000`

    const now = dayjs().toDate();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    
 
    const listHabits = await prisma.$queryRaw(
      Prisma.sql`
        SELECT dh.id, dh.habit_id, dh.day_id, dh.completed, h.title
        FROM "DayHabit" dh
        INNER JOIN "Habit" h ON dh."habit_id" = h."id"
        WHERE dh."day_id" IN (
          SELECT "id" FROM "Day" WHERE "date" = ${new Date(data)}
        ) AND h."userId" = ${user?.id}
      `
    );

    return res.status(200).json([date, data]);
  }
}
