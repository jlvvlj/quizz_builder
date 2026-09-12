import type { NextApiRequest, NextApiResponse } from 'next';
import { serverDb } from '@/server/db';
import { tokenHash } from '@/server/auth';
export default async function handler(req:NextApiRequest,res:NextApiResponse) {
 if(req.method!=='POST')return res.status(405).end();
 const token=req.cookies.quiz_session;
 if(token){const {error}=await serverDb.from('app_sessions').delete().eq('token_hash',tokenHash(token));if(error)return res.status(500).json({error:'Could not sign out. Please retry.'});}
 res.setHeader('Set-Cookie',['quiz_session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax','userId=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax']);
 return res.status(200).json({message:'Signed out'});
}
