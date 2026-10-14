-- Generated from src/db/schema.ts with `npm run db:generate`; runtime role must be NOINHERIT NOSUPERUSER NOBYPASSRLS.
-- Apply generated DDL first, then these policies. All tenant access is transaction-scoped via SET LOCAL-compatible set_config(..., true).
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY; ALTER TABLE properties ENABLE ROW LEVEL SECURITY; ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY; ALTER TABLE jobs ENABLE ROW LEVEL SECURITY; ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY; ALTER TABLE payments ENABLE ROW LEVEL SECURITY; ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_members ON organisations USING (id::text=current_setting('app.org_id',true));
CREATE POLICY property_tenant ON properties USING (organisation_id::text=current_setting('app.org_id',true)) WITH CHECK (organisation_id::text=current_setting('app.org_id',true));
CREATE POLICY unit_tenant ON units USING (organisation_id::text=current_setting('app.org_id',true)) WITH CHECK (organisation_id::text=current_setting('app.org_id',true));
CREATE POLICY request_tenant ON maintenance_requests USING (organisation_id::text=current_setting('app.org_id',true)) WITH CHECK (organisation_id::text=current_setting('app.org_id',true));
CREATE POLICY job_tenant ON jobs USING (organisation_id::text=current_setting('app.org_id',true)) WITH CHECK (organisation_id::text=current_setting('app.org_id',true));
CREATE POLICY quote_tenant ON quotes USING (organisation_id::text=current_setting('app.org_id',true)) WITH CHECK (organisation_id::text=current_setting('app.org_id',true));
CREATE POLICY invoice_tenant ON invoices USING (organisation_id::text=current_setting('app.org_id',true)) WITH CHECK (organisation_id::text=current_setting('app.org_id',true));
CREATE POLICY payment_tenant ON payments USING (organisation_id::text=current_setting('app.org_id',true)) WITH CHECK (organisation_id::text=current_setting('app.org_id',true));
CREATE POLICY event_tenant ON activity_events USING (organisation_id::text=current_setting('app.org_id',true)) WITH CHECK (organisation_id::text=current_setting('app.org_id',true));
