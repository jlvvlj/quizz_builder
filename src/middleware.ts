import { NextResponse, type NextRequest } from 'next/server';
const API_PATHS = new Set(['/api/auth/login', '/api/auth/signup', '/api/auth/logout', '/api/auth/me', '/api/catalog', '/api/flashcards', '/api/session/init', '/api/session/increment', '/api/settings/get', '/api/settings/update', '/api/dashboard/streak', '/api/dashboard/status-counts', '/api/dashboard/in-progress-steps', '/api/progress/get-batch', '/api/progress/last-word', '/api/progress/introduced', '/api/progress/save', '/api/progress/step-progress', '/api/progress/section-progress', '/api/progress/update-marked-status']);
const PUBLIC = new Set(['/login','/signup','/api/auth/login','/api/auth/signup']);
export async function middleware(req: NextRequest) {
 const path=req.nextUrl.pathname;
 const api=path.startsWith('/api/');
 if(api&&!API_PATHS.has(path))return NextResponse.json({error:'Endpoint not available in this application'},{status:404});
 if(!api&&['kanji','anime','custom','homophone','bykanji'].some(prefix=>path.startsWith('/'+prefix)))return NextResponse.redirect(new URL('/home',req.url));
 if(['sentences','kanji_freq','kanji_primitives','words_tubelex'].includes(req.nextUrl.searchParams.get('content')||''))return NextResponse.redirect(new URL('/home',req.url));
 if (['/api/auth/google','/api/auth/forgot-password','/api/auth/reset-password'].includes(path)) return NextResponse.json({error:'This sign-in method is not configured.'},{status:404});
 if (api && !['GET','HEAD','OPTIONS'].includes(req.method)) {
  const origin=req.headers.get('origin');
  if(origin && origin!==req.nextUrl.origin) return NextResponse.json({error:'Invalid request origin'},{status:403});
 }
 if(PUBLIC.has(path)) return NextResponse.next();
 const token=req.cookies.get('quiz_session')?.value;
 let userId:string|undefined;
 if(token && /^[a-f0-9]{64}$/.test(token)) {
  try {
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(x=>x.toString(16).padStart(2,'0')).join('');
   const params=new URLSearchParams({select:'user_id',token_hash:`eq.${hash}`,expires_at:`gt.${new Date().toISOString()}`,limit:'1'});
   const key=process.env.SUPABASE_SERVICE_ROLE_KEY!;
   const r=await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/app_sessions?${params}`,{headers:{apikey:key,Authorization:`Bearer ${key}`},cache:'no-store'});
   if(!r.ok) throw new Error('Session lookup failed');
   userId=(await r.json())[0]?.user_id;
  } catch { return api ? NextResponse.json({error:'Unable to verify session. Please retry.'},{status:503}):new NextResponse('Unable to verify session. Please retry.',{status:503}); }
 }
 if(!userId) {
  if(api) return NextResponse.json({error:'Not authenticated'},{status:401});
  const login=new URL('/login',req.url);if(path!=='/')login.searchParams.set('redirect',path+req.nextUrl.search);
  return NextResponse.redirect(login);
 }
 // Legacy handlers keep their existing contract, but userId is now supplied
 // exclusively from the validated session, never trusted from a browser cookie.
 const headers=new Headers(req.headers);
 const cookies=req.cookies.getAll().filter(c=>c.name!=='userId').map(c=>`${c.name}=${c.value}`);
 cookies.push(`userId=${userId}`);headers.set('cookie',cookies.join('; '));
 const res=NextResponse.next({request:{headers}});if(api)res.headers.set('Cache-Control','no-store');return res;
}
export const config={matcher:['/api/:path*','/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']};
