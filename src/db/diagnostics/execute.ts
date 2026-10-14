import 'server-only';import postgres,{type TransactionSql} from 'postgres';import {collectDiagnostics,type DiagnosticReport} from './queries';import {summariseDiagnostics,type DiagnosticSummary} from './summary';
type ClientOptions={max:1;prepare:false;connect_timeout:8;idle_timeout:2;max_lifetime:60;ssl?:{rejectUnauthorized:true};connection:{application_name:string}};
type DiagnosticClient={begin<T>(mode:'read only',fn:(tx:TransactionSql)=>Promise<T>):Promise<T>;end(options:{timeout:2}):Promise<unknown>};
export type DiagnosticDependencies={createClient:(url:string,options:ClientOptions)=>DiagnosticClient;collect:(tx:TransactionSql)=>Promise<DiagnosticReport>};
const defaults:DiagnosticDependencies={createClient:(url,options)=>postgres(url,options),collect:collectDiagnostics};
export async function executeReadOnlyDiagnostics(databaseUrl:string|undefined,deps:DiagnosticDependencies=defaults):Promise<DiagnosticSummary>{
 if(!databaseUrl)throw new Error('DATABASE_UNAVAILABLE');
 let parsed:URL;try{parsed=new URL(databaseUrl)}catch{throw new Error('DATABASE_UNAVAILABLE')}
 if(!['postgres:','postgresql:'].includes(parsed.protocol))throw new Error('DATABASE_UNAVAILABLE');
 const local=['localhost','127.0.0.1','::1'].includes(parsed.hostname),mode=parsed.searchParams.get('sslmode');
 if(mode&&!['require','verify-ca','verify-full'].includes(mode))throw new Error('TLS_REQUIRED');
 const options:ClientOptions={max:1,prepare:false,connect_timeout:8,idle_timeout:2,max_lifetime:60,connection:{application_name:'fixflow_preview_readonly_diagnostics'},...(!local&&{ssl:{rejectUnauthorized:true as const}})};
 const sql=deps.createClient(databaseUrl,options);let primary:unknown;
 try{return summariseDiagnostics(await sql.begin('read only',tx=>deps.collect(tx)))}catch(error){primary=error;throw error}finally{try{await sql.end({timeout:2})}catch(cleanup){if(primary!==undefined)throw new AggregateError([primary,cleanup],'DIAGNOSTICS_AND_CLEANUP_FAILED');throw cleanup}}
}
