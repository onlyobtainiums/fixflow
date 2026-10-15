import 'server-only';import postgres,{type TransactionSql} from 'postgres';import {collectDiagnosticCatalogues,setupDiagnosticSession,type DiagnosticReport} from './queries';import {summariseDiagnostics,type DiagnosticSummary} from './summary';import {DiagnosticStageError} from './errors';
type ClientOptions={max:1;prepare:false;connect_timeout:8;idle_timeout:2;max_lifetime:60;ssl?:{rejectUnauthorized:true};connection:{application_name:string}};
type DiagnosticClient={begin<T>(mode:'read only',fn:(tx:TransactionSql)=>Promise<T>):Promise<T>;end(options:{timeout:2}):Promise<unknown>};
export type DiagnosticDependencies={createClient:(url:string,options:ClientOptions)=>DiagnosticClient;setup:(tx:TransactionSql)=>Promise<void>;collect:(tx:TransactionSql)=>Promise<DiagnosticReport>;summarise:(report:DiagnosticReport)=>DiagnosticSummary};
const defaults:DiagnosticDependencies={createClient:(url,options)=>postgres(url,options),setup:setupDiagnosticSession,collect:collectDiagnosticCatalogues,summarise:summariseDiagnostics};
export async function executeReadOnlyDiagnostics(databaseUrl:string|undefined,deps:DiagnosticDependencies=defaults):Promise<DiagnosticSummary>{
 let parsed:URL,local:boolean,mode:string|null;
 try{if(!databaseUrl)throw new Error();parsed=new URL(databaseUrl);if(!['postgres:','postgresql:'].includes(parsed.protocol))throw new Error();local=['localhost','127.0.0.1','::1'].includes(parsed.hostname);mode=parsed.searchParams.get('sslmode');if(mode&&!['require','verify-ca','verify-full'].includes(mode))throw new Error()}catch(error){throw new DiagnosticStageError('CONFIGURATION',error)}
 const options:ClientOptions={max:1,prepare:false,connect_timeout:8,idle_timeout:2,max_lifetime:60,connection:{application_name:'fixflow_preview_readonly_diagnostics'},...(!local&&{ssl:{rejectUnauthorized:true as const}})};
 let sql:DiagnosticClient;try{sql=deps.createClient(databaseUrl,options)}catch(error){throw new DiagnosticStageError('CLIENT_INITIALISATION',error)}
 let primary:DiagnosticStageError|undefined;
 try{
  let report:DiagnosticReport;
  try{report=await sql.begin('read only',async tx=>{try{await deps.setup(tx)}catch(error){throw new DiagnosticStageError('SESSION_SETUP',error)}try{return await deps.collect(tx)}catch(error){throw new DiagnosticStageError('CATALOGUE_READ',error)}})}catch(error){if(error instanceof DiagnosticStageError)throw error;throw new DiagnosticStageError('CONNECTION_OR_TRANSACTION_BEGIN',error)}
  try{return deps.summarise(report)}catch(error){throw new DiagnosticStageError('SUMMARY',error)}
 }catch(error){primary=error instanceof DiagnosticStageError?error:new DiagnosticStageError('SUMMARY',error);throw primary}
 finally{try{await sql.end({timeout:2})}catch(cleanup){if(primary)throw new DiagnosticStageError('EXECUTION_AND_CLEANUP',new AggregateError([primary,cleanup],'DIAGNOSTICS_FAILED'));throw new DiagnosticStageError('CLEANUP',cleanup)}}
}
