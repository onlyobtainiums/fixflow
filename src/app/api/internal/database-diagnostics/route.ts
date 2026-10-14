import {handleDiagnosticPost,headNotAllowed,methodNotAllowed} from './handler';import {executeReadOnlyDiagnostics} from '@/db/diagnostics/execute';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=30;
export function POST(request:Request){return handleDiagnosticPost(request,process.env,{execute:executeReadOnlyDiagnostics})}
export const GET=methodNotAllowed;export const HEAD=headNotAllowed;export const PUT=methodNotAllowed;export const PATCH=methodNotAllowed;export const DELETE=methodNotAllowed;export const OPTIONS=methodNotAllowed;
