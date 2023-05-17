import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

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
      
          const data = dayjs.tz(new Date(), 'America/Sao_Paulo').startOf('day').toISOString();
      
          const count = await prisma.dayHabit.count({
            where: {
              day: {
                date: data
              },
              habit: {
                userId: user?.id
              },
              
            }
          });
      
          const countCompleted = await prisma.dayHabit.count({
            where: {
              day: {
                date: data
              },
              habit: {
                userId: user?.id
              },
              completed: true
            }
          });

        return res.status(201).json({count, countCompleted});
    }
  }