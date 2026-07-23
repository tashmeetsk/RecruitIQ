/*
# Add permissive anon RLS policies

## Context
The app uses a custom app-level login screen (not Supabase Auth), so the
frontend always talks to Supabase with the anon key. Access control is
already enforced by the app's own login flow before users reach any page.
RLS is already enabled on all four tables; without anon policies the
anon-key client sees zero rows.

## Changes
Adds SELECT, INSERT, and UPDATE policies scoped to `anon, authenticated`
on the following tables (DELETE is intentionally NOT granted):
- candidates
- candidate_preferences
- job_openings
- candidate_job_status

## Security notes
1. These policies are intentionally permissive (`USING (true)` /
   `WITH CHECK (true)`) because the app handles access control at the
   application layer via its own login screen.
2. DELETE is not granted — the app does not expose destructive operations
   through the anon-key client.
3. Policies are idempotent (DROP IF EXISTS before CREATE).
*/

-- candidates
DROP POLICY IF EXISTS "anon_select_candidates" ON candidates;
CREATE POLICY "anon_select_candidates" ON candidates
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_candidates" ON candidates;
CREATE POLICY "anon_insert_candidates" ON candidates
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_candidates" ON candidates;
CREATE POLICY "anon_update_candidates" ON candidates
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- candidate_preferences
DROP POLICY IF EXISTS "anon_select_candidate_preferences" ON candidate_preferences;
CREATE POLICY "anon_select_candidate_preferences" ON candidate_preferences
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_candidate_preferences" ON candidate_preferences;
CREATE POLICY "anon_insert_candidate_preferences" ON candidate_preferences
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_candidate_preferences" ON candidate_preferences;
CREATE POLICY "anon_update_candidate_preferences" ON candidate_preferences
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- job_openings
DROP POLICY IF EXISTS "anon_select_job_openings" ON job_openings;
CREATE POLICY "anon_select_job_openings" ON job_openings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_job_openings" ON job_openings;
CREATE POLICY "anon_insert_job_openings" ON job_openings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_job_openings" ON job_openings;
CREATE POLICY "anon_update_job_openings" ON job_openings
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- candidate_job_status
DROP POLICY IF EXISTS "anon_select_candidate_job_status" ON candidate_job_status;
CREATE POLICY "anon_select_candidate_job_status" ON candidate_job_status
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_candidate_job_status" ON candidate_job_status;
CREATE POLICY "anon_insert_candidate_job_status" ON candidate_job_status
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_candidate_job_status" ON candidate_job_status;
CREATE POLICY "anon_update_candidate_job_status" ON candidate_job_status
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
