import postgres from 'postgres';import {writeFile,chmod} from 'node:fs/promises';import {collectDiagnostics} from '../src/db/diagnostics/queries';import {redact,safeError} from '../src/db/diagnostics/redaction';import {roleRisks,rlsRisks} from '../src/db/diagnostics/analysis';
const OUTPUT='/tmp/fixflow-database-diagnostics.json';
async function main(){
 const url=process.env.DATABASE_URL;if(!url)throw new Error('DATABASE_URL is unavailable in this authorised server environment');
 let parsed:URL;try{parsed=new URL(url)}catch{throw new Error('DATABASE_URL is invalid')}
 if(!['postgres:','postgresql:'].includes(parsed.protocol))throw new Error('DATABASE_URL must use PostgreSQL');
 if(!['localhost','127.0.0.1','::1'].includes(parsed.hostname)&&parsed.searchParams.get('sslmode')==='disable')throw new Error('TLS may not be disabled for a remote database');
 const sql=postgres(url,{max:1,prepare:false,connect_timeout:8,idle_timeout:2,max_lifetime:60,connection:{application_name:'fixflow_readonly_diagnostics'}});
 try{
  const report=await sql.begin('read only',tx=>collectDiagnostics(tx));
  const clean=redact(report);await writeFile(OUTPUT,JSON.stringify(clean,null,2),{mode:0o600});await chmod(OUTPUT,0o600);
  const role=(clean.activeRole as Array<Record<string,unknown>>)[0]||{};const tables=clean.tables as unknown[];const policies=clean.policies as unknown[];const rls=clean.rls as Array<Record<string,unknown>>;
  console.log(JSON.stringify({status:'completed',reportPath:OUTPUT,tableCount:tables.length,policyCount:policies.length,rlsEnabled:rls.filter(x=>x.enabled).length,rlsForced:rls.filter(x=>x.forced).length,runtimeRole:{superuser:role.rolsuper,bypassRls:role.rolbypassrls,createRole:role.rolcreaterole,createDb:role.rolcreatedb},warnings:[...roleRisks(role),...rlsRisks(rls,typeof role.role_name==='string'?role.role_name:undefined)].slice(0,50),note:'Full catalogue report remains local and untracked.'},null,2));
 }finally{await sql.end({timeout:2})}
}
main().catch(e=>{console.error(JSON.stringify({status:'failed',error:safeError(e)}));process.exitCode=1});
