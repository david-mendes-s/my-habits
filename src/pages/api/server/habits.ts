// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';

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


      const data = dayjs.tz(new Date(), 'America/Sao_Paulo').startOf('day').toISOString();
      

      const listHabits = await prisma.$queryRaw(
        Prisma.sql`
          SELECT dh.id, dh.habit_id, dh.day_id, dh.completed, h.title
          FROM "DayHabit" dh
          INNER JOIN "Habit" h ON dh."habit_id" = h."id"
          WHERE dh."day_id" IN (
            SELECT "id" FROM "Day" WHERE "date" = ${data}
          ) AND h."userId" = ${user?.id} AND dh.completed = false
        `
      );

      return res.status(200).json(listHabits);
    }catch {
      throw new Error('internal error');
    }
    
  
  }else if(req.method === 'PUT'){
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const data = req.body;

    const habit = await prisma.dayHabit.findUnique({
      where: {
        id: data.habit.id
      }
    })
    
  
    if (!habit) {
      res.status(401).json({ message: 'There is no such habit' });
      return;
    } 

    await prisma.dayHabit.update({
      where: { id: data.habit.id }, // ID do registro a ser atualizado
      data: { completed: true }, // Valor atualizado do campo completed
    });
     

    return res.status(200).json({message: "update habit with sucess."});
  }
}
