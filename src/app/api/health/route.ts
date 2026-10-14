import {NextResponse} from 'next/server'; import {checkEnv} from '@/lib/env';
export function GET(){const e=checkEnv();return NextResponse.json({status:e.success?'ready':'configuration_required',missing:e.success?[]:e.error.issues.map(x=>x.path.join('.'))},{status:e.success?200:503})}
