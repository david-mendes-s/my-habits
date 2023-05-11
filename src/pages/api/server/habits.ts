// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

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
  }else {
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

    const listHabits = await prisma.habit.findMany({
      where: {
        user: {
          id: user?.id // O ID do usuário que você deseja buscar
        }
      },
      include: {
        DayHabit: true // Carrega também os dias de cada hábito
      }
    });

    /* const listHabits = await prisma.$queryRaw`
      SELECT h.*, dh.*
      FROM habit h
      LEFT JOIN dayHabit dh ON dh."habit_id" = h.id
      WHERE h."userId" = ${user?.id} AND date_trunc('day', dh."date") = date_trunc('day', NOW())
    `; */
    
    return res.status(200).json(listHabits);
  }
}
