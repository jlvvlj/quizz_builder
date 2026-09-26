import type { NextApiRequest, NextApiResponse } from 'next';
import { serverDb } from '@/server/db';
export default async function handler(req:NextApiRequest,res:NextApiResponse) {
 if(req.method!=='POST')return res.status(405).end();
 const {data,error}=await serverDb.rpc('increment_app_session',{p_user:req.cookies.userId});
 if(error)return res.status(500).json({error:'Could not advance session'});
 return res.status(200).json({currentSession:data});
}
