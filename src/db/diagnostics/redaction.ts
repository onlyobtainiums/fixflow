const SENSITIVE_KEY = /(password|secret|token|credential|private.?key|database_url|connection.?string)/i;
const PATTERNS: Array<[RegExp,string]> = [
  [/(postgres(?:ql)?:\/\/)([^\s:@/]+):([^\s@/]+)@/gi, '$1[redacted]:[redacted]@'],
  [/\b(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{20,}\b/g, '[redacted-token]'],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '[redacted-jwt]'],
  [/-----BEGIN [^-]+ PRIVATE KEY-----[\s\S]*?-----END [^-]+ PRIVATE KEY-----/g, '[redacted-private-key]']
];
export function redactText(value:string):string{return PATTERNS.reduce((v,[p,r])=>v.replace(p,r),value)}
export function redact<T>(value:T):T{
  if(typeof value==='string') return redactText(value) as T;
  if(Array.isArray(value)) return value.map(redact) as T;
  if(value&&typeof value==='object') return Object.fromEntries(Object.entries(value as Record<string,unknown>).map(([k,v])=>[k,SENSITIVE_KEY.test(k)?'[redacted]':redact(v)])) as T;
  return value;
}
export function safeError(error:unknown){const e=error instanceof Error?error:new Error('Unknown diagnostics error');return {name:e.name,message:redactText(e.message).replace(/\b(?:host|server|address)\s*[=:]\s*[^\s,;]+/gi,'$1=[redacted]'),code:typeof (error as {code?:unknown})?.code==='string'?(error as {code:string}).code:undefined}}
