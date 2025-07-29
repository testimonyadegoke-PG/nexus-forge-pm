# Nexus Forge Data Model

## Project
- id: string
- name: string
- description: string
- start_date: string
- end_date: string
- status: string
- manager_id: string
- ...

## Task
- id: string
- project_id: string
- name: string
- description: string
- start_date: string
- end_date: string
- status: string
- assignee_id: string
- ...

## Budget
- id: string
- project_id: string
- allocated_amount: number
- ...

> **Note:** This is a living document. Update as the schema evolves.
