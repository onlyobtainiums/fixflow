import 'server-only'; import {cookies} from 'next/headers'; import {adminAuth} from './firebase-admin';
export async function identity(){const c=await cookies();const token=c.get(process.env.SESSION_COOKIE_NAME||'fixflow_session')?.value;if(!token)return null;try{return await adminAuth().verifySessionCookie(token,true)}catch{return null}}
export async function requireIdentity(){const u=await identity();if(!u)throw new Error('UNAUTHENTICATED');return u}
