-- Phase 5: row-level security (defense-in-depth under Phase 2 app scoping).
-- Requires the app role `erp_app` (no BYPASSRLS). On a fresh database create it first:
--   CREATE ROLE erp_app LOGIN PASSWORD '<see server/.env DATABASE_URL>';
-- Policies are permissive: when app.current_tenant_id is unset/empty (CEO, scripts,
-- migrations) rows are unrestricted — the app layer owns that path.

-- Application role grants (idempotent):
GRANT USAGE ON SCHEMA public TO erp_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO erp_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO erp_app;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO erp_app;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO erp_app;

ALTER TABLE "public"."academic_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."academic_sessions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."academic_sessions";
CREATE POLICY "tenant_isolation" ON "public"."academic_sessions"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."admissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."admissions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."admissions";
CREATE POLICY "tenant_isolation" ON "public"."admissions"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."announcements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."announcements" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."announcements";
CREATE POLICY "tenant_isolation" ON "public"."announcements"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."audit_logs" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."audit_logs";
CREATE POLICY "tenant_isolation" ON "public"."audit_logs"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."buildings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."buildings" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."buildings";
CREATE POLICY "tenant_isolation" ON "public"."buildings"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."calendar_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."calendar_events" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."calendar_events";
CREATE POLICY "tenant_isolation" ON "public"."calendar_events"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."certificates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."certificates" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."certificates";
CREATE POLICY "tenant_isolation" ON "public"."certificates"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."courses" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."courses";
CREATE POLICY "tenant_isolation" ON "public"."courses"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."departments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."departments" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."departments";
CREATE POLICY "tenant_isolation" ON "public"."departments"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."documents" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."documents";
CREATE POLICY "tenant_isolation" ON "public"."documents"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."doubt_conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."doubt_conversations" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."doubt_conversations";
CREATE POLICY "tenant_isolation" ON "public"."doubt_conversations"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."driver_attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."driver_attendance" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."driver_attendance";
CREATE POLICY "tenant_isolation" ON "public"."driver_attendance"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."employees" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."employees";
CREATE POLICY "tenant_isolation" ON "public"."employees"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."examinations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."examinations" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."examinations";
CREATE POLICY "tenant_isolation" ON "public"."examinations"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."fee_structures" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."fee_structures" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."fee_structures";
CREATE POLICY "tenant_isolation" ON "public"."fee_structures"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."helpdesk_tickets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."helpdesk_tickets" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."helpdesk_tickets";
CREATE POLICY "tenant_isolation" ON "public"."helpdesk_tickets"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."hostels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hostels" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."hostels";
CREATE POLICY "tenant_isolation" ON "public"."hostels"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."institution_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."institution_settings" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."institution_settings";
CREATE POLICY "tenant_isolation" ON "public"."institution_settings"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."institution_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."institution_subscriptions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."institution_subscriptions";
CREATE POLICY "tenant_isolation" ON "public"."institution_subscriptions"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."invoices" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."invoices";
CREATE POLICY "tenant_isolation" ON "public"."invoices"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."library_books" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."library_books" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."library_books";
CREATE POLICY "tenant_isolation" ON "public"."library_books"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."mcq_tests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."mcq_tests" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."mcq_tests";
CREATE POLICY "tenant_isolation" ON "public"."mcq_tests"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."meetings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."meetings" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."meetings";
CREATE POLICY "tenant_isolation" ON "public"."meetings"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notifications" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."notifications";
CREATE POLICY "tenant_isolation" ON "public"."notifications"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."parent_conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."parent_conversations" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."parent_conversations";
CREATE POLICY "tenant_isolation" ON "public"."parent_conversations"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."parents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."parents" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."parents";
CREATE POLICY "tenant_isolation" ON "public"."parents"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."platform_audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."platform_audit_logs" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."platform_audit_logs";
CREATE POLICY "tenant_isolation" ON "public"."platform_audit_logs"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."platform_notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."platform_notifications" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."platform_notifications";
CREATE POLICY "tenant_isolation" ON "public"."platform_notifications"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."routes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."routes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."routes";
CREATE POLICY "tenant_isolation" ON "public"."routes"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."scholarships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."scholarships" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."scholarships";
CREATE POLICY "tenant_isolation" ON "public"."scholarships"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."student_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."student_requests" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."student_requests";
CREATE POLICY "tenant_isolation" ON "public"."student_requests"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."students" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."students";
CREATE POLICY "tenant_isolation" ON "public"."students"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."subjects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."subjects" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."subjects";
CREATE POLICY "tenant_isolation" ON "public"."subjects"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."timetables" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."timetables" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."timetables";
CREATE POLICY "tenant_isolation" ON "public"."timetables"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."users";
CREATE POLICY "tenant_isolation" ON "public"."users"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."vehicles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."vehicles" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."vehicles";
CREATE POLICY "tenant_isolation" ON "public"."vehicles"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );

ALTER TABLE "public"."workflows" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."workflows" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."workflows";
CREATE POLICY "tenant_isolation" ON "public"."workflows"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "institutionId" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );
-- 37 tables hardened: academic_sessions, admissions, announcements, audit_logs, buildings, calendar_events, certificates, courses, departments, documents, doubt_conversations, driver_attendance, employees, examinations, fee_structures, helpdesk_tickets, hostels, institution_settings, institution_subscriptions, invoices, library_books, mcq_tests, meetings, notifications, parent_conversations, parents, platform_audit_logs, platform_notifications, routes, scholarships, student_requests, students, subjects, timetables, users, vehicles, workflows
