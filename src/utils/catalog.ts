import { useEffect, useState } from 'react';
export interface Deck { id:string;title:string;description:string;question_label:string;answer_label:string;question_format?:string }
export interface CatalogSection {id:string;deck:Deck;count:number;steps:{key:string;id:number;items:number;title?:string}[]}
export function useCatalog(){
 const [sections,setSections]=useState<CatalogSection[]|null>(null);const [error,setError]=useState('');
 useEffect(()=>{let alive=true;fetch('/api/catalog').then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);if(alive)setSections(d.sections);}).catch(e=>{if(alive)setError(e.message);});return()=>{alive=false;};},[]);
 return {sections,error};
}
