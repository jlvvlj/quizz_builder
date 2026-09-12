import type { NextApiRequest, NextApiResponse } from 'next';
import { serverDb } from '@/server/db';
export default async function handler(req:NextApiRequest,res:NextApiResponse) {
 if(req.method!=='POST')return res.status(405).end();
 const id=req.cookies.userId;if(!id)return res.status(401).end();
 const {data,error}=await serverDb.from('users').select('current_session').eq('id',id).single();
 if(error)return res.status(500).json({error:'Could not load session'});
 return res.status(200).json({userId:id,currentSession:data.current_session,stats:{}});
}
