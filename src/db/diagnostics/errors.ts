export const DIAGNOSTIC_STAGES=['CONFIGURATION','CLIENT_INITIALISATION','CONNECTION_OR_TRANSACTION_BEGIN','SESSION_SETUP','CATALOGUE_READ','SUMMARY','CLEANUP','EXECUTION_AND_CLEANUP'] as const;
export type DiagnosticStage=typeof DIAGNOSTIC_STAGES[number];
export class DiagnosticStageError extends Error{readonly stage:DiagnosticStage;constructor(stage:DiagnosticStage,cause?:unknown){super('DIAGNOSTICS_FAILED',{cause});this.name='DiagnosticStageError';this.stage=stage}}
export function diagnosticStage(error:unknown):DiagnosticStage{return error instanceof DiagnosticStageError&&(DIAGNOSTIC_STAGES as readonly unknown[]).includes(error.stage)?error.stage:'SUMMARY'}
