import type {DiagnosticReport} from './queries';
export type RiskCode='RUNTIME_ROLE_SUPERUSER'|'RUNTIME_ROLE_BYPASSES_RLS'|'RUNTIME_ROLE_CAN_CREATE_ROLES'|'RUNTIME_ROLE_CAN_CREATE_DATABASES'|'RUNTIME_ROLE_HAS_ADMIN_MEMBERSHIP'|'RLS_DISABLED'|'RLS_NOT_FORCED'|'RUNTIME_ROLE_OWNS_NON_FORCED_TABLES'|'MIGRATION_METADATA_NOT_FOUND'|'TLS_NOT_CONFIRMED';
export type DiagnosticSummary={status:'completed';scopeVerified:true;connection:{connected:true;tls:boolean};runtimeRole:{leastPrivilegeCandidate:boolean;superuser:boolean;bypassRls:boolean;canCreateRoles:boolean;canCreateDatabases:boolean};metadata:{tableCount:number;migrationMetadataPresent:boolean;rlsEnabledCount:number;rlsForcedCount:number;policyCount:number};riskCodes:RiskCode[]};
const bool=(v:unknown)=>v===true;
export function summariseDiagnostics(report:DiagnosticReport):DiagnosticSummary{
 const connection=(report.connection[0]||{}) as Record<string,unknown>;
 const role=(report.activeRole[0]||{}) as Record<string,unknown>;
 const tables=report.tables as Array<Record<string,unknown>>;
 const rls=report.rls as Array<Record<string,unknown>>;
 const memberships=report.roleMemberships as Array<Record<string,unknown>>;
 const tls=bool(connection.tls_active),superuser=bool(role.rolsuper),bypassRls=bool(role.rolbypassrls),canCreateRoles=bool(role.rolcreaterole),canCreateDatabases=bool(role.rolcreatedb);
 const rlsEnabled=rls.filter(x=>bool(x.enabled)).length,rlsForced=rls.filter(x=>bool(x.forced)).length;
 const ownsNonForced=rls.some(x=>x.owner===role.role_name&&!bool(x.forced));
 const adminMembership=memberships.some(x=>bool(x.admin_option));
 const risks:RiskCode[]=[];
 if(superuser)risks.push('RUNTIME_ROLE_SUPERUSER');if(bypassRls)risks.push('RUNTIME_ROLE_BYPASSES_RLS');if(canCreateRoles)risks.push('RUNTIME_ROLE_CAN_CREATE_ROLES');if(canCreateDatabases)risks.push('RUNTIME_ROLE_CAN_CREATE_DATABASES');if(adminMembership)risks.push('RUNTIME_ROLE_HAS_ADMIN_MEMBERSHIP');if(rlsEnabled<rls.length)risks.push('RLS_DISABLED');if(rlsForced<rls.length)risks.push('RLS_NOT_FORCED');if(ownsNonForced)risks.push('RUNTIME_ROLE_OWNS_NON_FORCED_TABLES');if(report.migrationMetadata.length===0)risks.push('MIGRATION_METADATA_NOT_FOUND');if(!tls)risks.push('TLS_NOT_CONFIRMED');
 return {status:'completed',scopeVerified:true,connection:{connected:true,tls},runtimeRole:{leastPrivilegeCandidate:!superuser&&!bypassRls&&!canCreateRoles&&!canCreateDatabases&&!adminMembership&&!ownsNonForced,superuser,bypassRls,canCreateRoles,canCreateDatabases},metadata:{tableCount:tables.length,migrationMetadataPresent:report.migrationMetadata.length>0,rlsEnabledCount:rlsEnabled,rlsForcedCount:rlsForced,policyCount:report.policies.length},riskCodes:risks};
}
