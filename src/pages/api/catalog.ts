import type { NextApiRequest, NextApiResponse } from 'next';
import { serverDb } from '@/server/db';
export default async function handler(req:NextApiRequest,res:NextApiResponse) {
 if(req.method!=='GET')return res.status(405).end();
 try {
  const {data:decks,error}=await serverDb.from('learning_decks').select('*').order('title');if(error)throw error;
  const rows:{id:number;deck_id:string;section:string;step:string;step_title:string|null}[]=[];
  for(let from=0;;from+=1000){const {data,error}=await serverDb.from('words10k').select('id,deck_id,section,step,step_title').order('id').range(from,from+999);if(error)throw error;rows.push(...data);if(data.length<1000)break;}
  const sections=new Map<string,any>();
  for(const row of rows){
   const deck=decks.find(d=>d.id===row.deck_id);if(!deck)throw new Error('Item is missing deck metadata');
   let section=sections.get(row.section);
   if(!section){section={id:row.section,deck,count:0,steps:[]};sections.set(row.section,section);}
   section.count++;let step=section.steps.find((s:any)=>s.key===row.step);
   if(!step){step={title:row.step_title,key:row.step,id:Number(row.step.replace('step_','')),items:0};section.steps.push(step);}step.items++;
  }
  const result=Array.from(sections.values()).sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}));
  for(const s of result)s.steps.sort((a:any,b:any)=>a.id-b.id);
  return res.status(200).json({sections:result,total:rows.length});
 }catch(error){console.error(error);return res.status(500).json({error:'Could not load learning content'});}
}
