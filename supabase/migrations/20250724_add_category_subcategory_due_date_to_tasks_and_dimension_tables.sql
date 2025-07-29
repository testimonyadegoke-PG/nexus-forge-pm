-- Migration: Add category, subcategory, and due_date to tasks, budgets, and cost_entries tables

-- Add category, subcategory, and due_date to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'uncategorized';

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS due_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Ensure budgets table has category and subcategory
ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'uncategorized';

ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);

-- Ensure cost_entries table has category and subcategory
ALTER TABLE cost_entries
ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'uncategorized';

ALTER TABLE cost_entries
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);
