import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

// Support both VITE_ and non-VITE_ keys
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_URL/SUPABASE_ANON_KEY)');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
  // Sample users
  const users = [
    { id: uuidv4(), full_name: 'Alice Johnson', email: 'alice@example.com' },
    { id: uuidv4(), full_name: 'Bob Smith', email: 'bob@example.com' },
    { id: uuidv4(), full_name: 'Carol Lee', email: 'carol@example.com' },
  ];
  await supabase.from('users').upsert(users, { onConflict: 'email' });

  // Sample projects
  const projects = [
    {
      id: uuidv4(),
      name: 'Solar Plant Expansion',
      description: 'Expand solar capacity by 50MW',
      start_date: '2025-08-01',
      end_date: '2026-07-01',
      status: 'active',
      manager_id: users[0].id,
    },
    {
      id: uuidv4(),
      name: 'Wind Farm Upgrade',
      description: 'Upgrade turbines for efficiency',
      start_date: '2025-09-01',
      end_date: '2026-03-01',
      status: 'planning',
      manager_id: users[1].id,
    },
  ];
  await supabase.from('projects').upsert(projects, { onConflict: 'name' });

  // Sample tasks
  const tasks = [
    {
      id: uuidv4(),
      project_id: projects[0].id,
      name: 'Site Survey',
      description: 'Survey land for expansion',
      start_date: '2025-08-05',
      end_date: '2025-08-15',
      due_date: '2025-08-15',
      duration: 10,
      progress: 100,
      assignee_id: users[0].id,
      status: 'completed',
      dependencies: [],
    },
    {
      id: uuidv4(),
      project_id: projects[0].id,
      name: 'Procure Panels',
      description: 'Order solar panels',
      start_date: '2025-08-16',
      end_date: '2025-09-10',
      due_date: '2025-09-10',
      duration: 25,
      progress: 60,
      assignee_id: users[1].id,
      status: 'in-progress',
      dependencies: [],
    },
    {
      id: uuidv4(),
      project_id: projects[1].id,
      name: 'Turbine Inspection',
      description: 'Inspect turbines',
      start_date: '2025-09-05',
      end_date: '2025-09-20',
      due_date: '2025-09-20',
      duration: 15,
      progress: 0,
      assignee_id: users[2].id,
      status: 'not-started',
      dependencies: [],
    },
  ];
  await supabase.from('tasks').upsert(tasks, { onConflict: 'name,project_id' });

  // Sample milestones
  const milestones = [
    {
      id: uuidv4(),
      project_id: projects[0].id,
      name: 'Phase 1 Complete',
      due_date: '2025-09-15',
      is_achieved: false,
    },
    {
      id: uuidv4(),
      project_id: projects[1].id,
      name: 'Inspection Finished',
      due_date: '2025-09-21',
      is_achieved: false,
    },
  ];
  await supabase.from('milestones').upsert(milestones, { onConflict: 'name,project_id' });

  // Sample budgets
  const budgets = [
    {
      id: uuidv4(),
      project_id: projects[0].id,
      allocated_amount: 500000,
      currency: 'USD',
    },
    {
      id: uuidv4(),
      project_id: projects[1].id,
      allocated_amount: 300000,
      currency: 'USD',
    },
  ];
  await supabase.from('budgets').upsert(budgets, { onConflict: 'project_id' });

  // Sample costs
  const costs = [
    {
      id: uuidv4(),
      project_id: projects[0].id,
      amount: 120000,
      entry_date: '2025-08-20',
      description: 'Initial survey and preparation',
    },
    {
      id: uuidv4(),
      project_id: projects[1].id,
      amount: 50000,
      entry_date: '2025-09-22',
      description: 'Turbine inspection costs',
    },
  ];
  await supabase.from('cost_entries').upsert(costs, { onConflict: 'project_id,entry_date' });

  console.log('Sample data seeded successfully.');
}

seed().catch((err) => {
  console.error('Error seeding sample data:', err);
  process.exit(1);
});
