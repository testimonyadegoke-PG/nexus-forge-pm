-- Migration: Add soft deletes and auditing
-- Add deleted_at columns and audit triggers for main tables

-- Example for projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at timestamp;

-- Repeat for other tables (tasks, users, budgets, cost_entries, ...)

-- Example audit trigger (PostgreSQL)
-- CREATE TABLE IF NOT EXISTS audit_log (...);
-- CREATE OR REPLACE FUNCTION log_audit() RETURNS trigger AS $$ ... $$ LANGUAGE plpgsql;
-- CREATE TRIGGER ...

-- Fill out with specific columns and triggers as needed
