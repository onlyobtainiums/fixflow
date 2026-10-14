import {hasApprovedDiagnosticScope} from '../../../../db/diagnostics/scope';import {isDiagnosticAuthorised} from '../../../../db/diagnostics/authorization';import type {DiagnosticSummary} from '../../../../db/diagnostics/summary';
type Environment=Record<string,string|undefined>;type Dependencies={execute:(url:string|undefined)=>Promise<DiagnosticSummary>};
const headers={'Cache-Control':'no-store, private','Pragma':'no-cache','X-Content-Type-Options':'nosniff'};
const json=(body:unknown,status:number,extra:Record<string,string>={})=>Response.json(body,{status,headers:{...headers,...extra}});
export function methodNotAllowed(){return json({status:'rejected'},405,{Allow:'POST'})}
export function headNotAllowed(){return new Response(null,{status:405,headers:{...headers,Allow:'POST'}})}
export async function handleDiagnosticPost(request:Request,env:Environment,deps:Dependencies):Promise<Response>{
 if(request.method!=='POST'||new URL(request.url).search)return json({status:'rejected'},400);
 const body=await request.text();if(body.length!==0)return json({status:'rejected'},400);
 if(!hasApprovedDiagnosticScope(env))return json({status:'rejected'},403);
 if(!isDiagnosticAuthorised(request.headers.get('authorization'),env.FIXFLOW_DIAGNOSTICS_AUTH_SECRET))return json({status:'rejected'},401);
 try{return json(await deps.execute(env.DATABASE_URL),200)}catch{return json({status:'failed',category:'DIAGNOSTICS_FAILED'},500)}
}
