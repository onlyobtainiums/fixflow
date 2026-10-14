export const DIAGNOSTIC_PROJECT_ID='prj_sjHOnTneZum1MjZE0sxd0WyAkhbw';
export const DIAGNOSTIC_BRANCH='feat/arena-fixflow-foundation';
const SHA=/^[0-9a-f]{40}$/;
type Environment=Record<string,string|undefined>;
export function hasApprovedDiagnosticScope(env:Environment):boolean{
 const runtimeSha=env.VERCEL_GIT_COMMIT_SHA;
 const expectedSha=env.FIXFLOW_DIAGNOSTICS_EXPECTED_COMMIT;
 return env.VERCEL==='1'&&env.VERCEL_ENV==='preview'&&env.VERCEL_PROJECT_ID===DIAGNOSTIC_PROJECT_ID&&env.VERCEL_GIT_COMMIT_REF===DIAGNOSTIC_BRANCH&&typeof runtimeSha==='string'&&typeof expectedSha==='string'&&SHA.test(runtimeSha)&&SHA.test(expectedSha)&&runtimeSha===expectedSha;
}
