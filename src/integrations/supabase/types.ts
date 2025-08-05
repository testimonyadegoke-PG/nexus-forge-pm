export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      budget_categories: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      budget_lines: {
        Row: {
          budget_id: string | null
          category_id: number | null
          description: string | null
          id: number
          product_id: number | null
          quantity: number
          subcategory_id: number | null
          total: number | null
          unit_price: number
        }
        Insert: {
          budget_id?: string | null
          category_id?: number | null
          description?: string | null
          id?: number
          product_id?: number | null
          quantity?: number
          subcategory_id?: number | null
          total?: number | null
          unit_price: number
        }
        Update: {
          budget_id?: string | null
          category_id?: number | null
          description?: string | null
          id?: number
          product_id?: number | null
          quantity?: number
          subcategory_id?: number | null
          total?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_lines_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_lines_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_lines_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "budget_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_subcategories: {
        Row: {
          category_id: number | null
          id: number
          name: string
        }
        Insert: {
          category_id?: number | null
          id?: number
          name: string
        }
        Update: {
          category_id?: number | null
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          allocated_amount: number
          category: string
          category_id: number | null
          created_at: string | null
          created_by: string | null
          currency_id: number | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          name: string
          project_id: string | null
          subcategory: string | null
          subcategory_id: number | null
          updated_at: string | null
        }
        Insert: {
          allocated_amount?: number
          category: string
          category_id?: number | null
          created_at?: string | null
          created_by?: string | null
          currency_id?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string | null
          subcategory?: string | null
          subcategory_id?: number | null
          updated_at?: string | null
        }
        Update: {
          allocated_amount?: number
          category?: string
          category_id?: number | null
          created_at?: string | null
          created_by?: string | null
          currency_id?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string | null
          subcategory?: string | null
          subcategory_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "budget_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          email: string | null
          id: number
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          email?: string | null
          id?: number
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          email?: string | null
          id?: number
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          customer_id: number | null
          email: string | null
          id: number
          name: string
          phone: string | null
          role: string | null
        }
        Insert: {
          customer_id?: number | null
          email?: string | null
          id?: number
          name: string
          phone?: string | null
          role?: string | null
        }
        Update: {
          customer_id?: number | null
          email?: string | null
          id?: number
          name?: string
          phone?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_entries: {
        Row: {
          amount: number
          category: string
          category_id: number | null
          created_at: string | null
          created_by: string | null
          currency_id: number | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          entry_date: string
          id: string
          project_id: string | null
          source_type: string
          subcategory: string | null
          subcategory_id: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          category_id?: number | null
          created_at?: string | null
          created_by?: string | null
          currency_id?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          entry_date?: string
          id?: string
          project_id?: string | null
          source_type?: string
          subcategory?: string | null
          subcategory_id?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          category_id?: number | null
          created_at?: string | null
          created_by?: string | null
          currency_id?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          entry_date?: string
          id?: string
          project_id?: string | null
          source_type?: string
          subcategory?: string | null
          subcategory_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_entries_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_entries_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_entries_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "budget_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_entry_lines: {
        Row: {
          category_id: number | null
          cost_entry_id: string | null
          description: string | null
          id: number
          product_id: number | null
          quantity: number
          subcategory_id: number | null
          total: number | null
          unit_price: number
        }
        Insert: {
          category_id?: number | null
          cost_entry_id?: string | null
          description?: string | null
          id?: number
          product_id?: number | null
          quantity?: number
          subcategory_id?: number | null
          total?: number | null
          unit_price: number
        }
        Update: {
          category_id?: number | null
          cost_entry_id?: string | null
          description?: string | null
          id?: number
          product_id?: number | null
          quantity?: number
          subcategory_id?: number | null
          total?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "cost_entry_lines_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_entry_lines_cost_entry_id_fkey"
            columns: ["cost_entry_id"]
            isOneToOne: false
            referencedRelation: "cost_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_entry_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_entry_lines_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "budget_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_posting_lines: {
        Row: {
          amount: number
          category: string
          cost_posting_id: string
          created_at: string | null
          description: string | null
          id: string
          subcategory: string | null
        }
        Insert: {
          amount: number
          category: string
          cost_posting_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          subcategory?: string | null
        }
        Update: {
          amount?: number
          category?: string
          cost_posting_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          subcategory?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_posting_lines_cost_posting_id_fkey"
            columns: ["cost_posting_id"]
            isOneToOne: false
            referencedRelation: "cost_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_postings: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          posting_date: string
          project_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          posting_date?: string
          project_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          posting_date?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_postings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_postings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      currencies: {
        Row: {
          code: string
          id: number
          name: string
          symbol: string | null
        }
        Insert: {
          code: string
          id?: number
          name: string
          symbol?: string | null
        }
        Update: {
          code?: string
          id?: number
          name?: string
          symbol?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          company_id: number | null
          email: string | null
          id: number
          name: string
          phone: string | null
        }
        Insert: {
          company_id?: number | null
          email?: string | null
          id?: number
          name: string
          phone?: string | null
        }
        Update: {
          company_id?: number | null
          email?: string | null
          id?: number
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_comments: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          milestone_id: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          milestone_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          milestone_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestone_comments_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestone_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_tasks: {
        Row: {
          created_at: string | null
          id: string
          milestone_id: string | null
          task_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          milestone_id?: string | null
          task_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          milestone_id?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestone_tasks_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestone_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          achieved_date: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          due_date: string
          id: string
          is_achieved: boolean | null
          name: string
          project_id: string
          related_task_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          achieved_date?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          is_achieved?: boolean | null
          name: string
          project_id: string
          related_task_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          achieved_date?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          is_achieved?: boolean | null
          name?: string
          project_id?: string
          related_task_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      priorities: {
        Row: {
          id: number
          name: string
          rank: number | null
        }
        Insert: {
          id?: number
          name: string
          rank?: number | null
        }
        Update: {
          id?: number
          name?: string
          rank?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: number | null
          created_at: string | null
          currency_id: number | null
          description: string | null
          id: number
          name: string
          sku: string
          subcategory_id: number | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          currency_id?: number | null
          description?: string | null
          id?: number
          name: string
          sku: string
          subcategory_id?: number | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          currency_id?: number | null
          description?: string | null
          id?: number
          name?: string
          sku?: string
          subcategory_id?: number | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "budget_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      project_categories: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      project_phases: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      project_stages: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      project_status: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      project_subcategories: {
        Row: {
          category_id: number | null
          id: number
          name: string
        }
        Insert: {
          category_id?: number | null
          id?: number
          name: string
        }
        Update: {
          category_id?: number | null
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "project_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      project_types: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category_id: number | null
          company_id: number | null
          created_at: string | null
          created_by: string | null
          customer_id: number | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          end_date: string
          id: string
          manager_id: string | null
          name: string
          phase_id: number | null
          stage_id: number | null
          start_date: string
          status: string
          status_id: number | null
          type_id: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: number | null
          company_id?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          manager_id?: string | null
          name: string
          phase_id?: number | null
          stage_id?: number | null
          start_date: string
          status?: string
          status_id?: number | null
          type_id?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: number | null
          company_id?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          manager_id?: string | null
          name?: string
          phase_id?: number | null
          stage_id?: number | null
          start_date?: string
          status?: string
          status_id?: number | null
          type_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "project_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "project_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "project_types"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          depends_on_task_id: string | null
          id: number
          task_id: string | null
        }
        Insert: {
          depends_on_task_id?: string | null
          id?: number
          task_id?: string | null
        }
        Update: {
          depends_on_task_id?: string | null
          id?: number
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_status: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          category: string
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          dependencies: string[] | null
          description: string | null
          due_date: string
          duration: number
          end_date: string
          id: string
          name: string
          priority_id: number | null
          progress: number
          project_id: string | null
          start_date: string
          status: string
          status_id: number | null
          subcategory: string | null
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          category?: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string
          duration?: number
          end_date: string
          id?: string
          name: string
          priority_id?: number | null
          progress?: number
          project_id?: string | null
          start_date: string
          status?: string
          status_id?: number | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          category?: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string
          duration?: number
          end_date?: string
          id?: string
          name?: string
          priority_id?: number | null
          progress?: number
          project_id?: string | null
          start_date?: string
          status?: string
          status_id?: number | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_priority_id_fkey"
            columns: ["priority_id"]
            isOneToOne: false
            referencedRelation: "priorities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "task_status"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string
          full_name: string
          id: string
          role: string
          role_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email: string
          full_name: string
          id?: string
          role?: string
          role_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: string
          role_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_pm: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_security_event: {
        Args: {
          event_type: string
          user_id: string
          resource_type: string
          resource_id: string
          details?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
