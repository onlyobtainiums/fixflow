import {describe,it,expect} from 'vitest';import {readFileSync} from 'node:fs';import {redact,redactText,safeError} from '../src/db/diagnostics/redaction';import {roleRisks,rlsRisks} from '../src/db/diagnostics/analysis';
describe('database diagnostics safety',()=>{
 it('redacts credentialed database URLs',()=>expect(redactText('failed postgres://app:p%40ss@db.example/x')).toBe('failed postgres://[redacted]:[redacted]@db.example/x'));
 it('redacts sensitive object fields recursively',()=>expect(redact({nested:{password:'secret'},ok:'value'})).toEqual({nested:{password:'[redacted]'},ok:'value'}));
 it('sanitises errors',()=>expect(JSON.stringify(safeError(new Error('host=db.internal postgres://u:p@db/x')))).not.toMatch(/db\.internal|u:p/));
 it('flags privileged runtime roles',()=>expect(roleRisks({rolsuper:true,rolbypassrls:true})).toHaveLength(2));
 it('flags absent and owner-bypass RLS',()=>expect(rlsRisks([{schema_name:'public',table_name:'requests',enabled:false},{schema_name:'public',table_name:'jobs',enabled:true,forced:false,owner:'app'}],'app')).toHaveLength(2));
 it('contains fixed queries and no dynamic SQL execution',()=>{const source=readFileSync('src/db/diagnostics/queries.ts','utf8');expect(source).not.toContain('.unsafe(');expect(source).not.toContain('tx.unsafe');expect(source).toContain("pg_policies");expect(source).toContain("information_schema.role_table_grants")});
 it('enforces a read-only transaction in the runner',()=>{const source=readFileSync('scripts/database-diagnostics.ts','utf8');expect(source).toContain("sql.begin('read only'");expect(source).not.toContain('env pull')});
});
