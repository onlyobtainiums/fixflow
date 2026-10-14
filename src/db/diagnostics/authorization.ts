import {timingSafeEqual} from 'node:crypto';
const PREFIX='Bearer ';
export function isDiagnosticAuthorised(header:string|null,configuredSecret:string|undefined):boolean{
 if(!header||!configuredSecret||Buffer.byteLength(configuredSecret,'utf8')<32||!header.startsWith(PREFIX))return false;
 const supplied=header.slice(PREFIX.length);
 if(!supplied||supplied.includes(',')||supplied.trim()!==supplied)return false;
 const a=Buffer.from(supplied,'utf8'),b=Buffer.from(configuredSecret,'utf8');
 return a.length===b.length&&timingSafeEqual(a,b);
}
