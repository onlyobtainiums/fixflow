import 'server-only'; import postgres from 'postgres'; import {drizzle} from 'drizzle-orm/postgres-js';
let client:ReturnType<typeof postgres>|undefined;
export function db(){if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured'); client??=postgres(process.env.DATABASE_URL,{max:10,prepare:false}); return drizzle(client);}
export async function tenantTx<T>(userId:string,orgId:string,fn:(tx:any)=>Promise<T>){return db().transaction(async tx=>{await tx.execute(`select set_config('app.user_id', '${userId.replaceAll("'",'')}', true), set_config('app.org_id', '${orgId.replaceAll("'",'')}', true)`);return fn(tx);});}
