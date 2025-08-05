import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Budget } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Budget Types
export interface CreateBudgetData {
  name: string;
  project_id: string;
  category: string;
  allocated_amount: number;
  description?: string;
  created_by: string;
}

export interface Budget {
  id: string;
  name: string;
  project_id: string;
  category: string;
  category_id?: number;
  allocated_amount: number;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  deleted_by?: string;
  currency_id?: number;
  subcategory?: string;
}

// Budget Line Types
export interface CreateBudgetLineData {
  budget_id: string;
  category: string;
  subcategory?: string;
  quantity: number;
  unit_price: number;
  amount: number;
  total: number;
  description?: string;
}

// Budget Queries
export const useBudgets = (projectId: string) => {
  return useQuery<Budget[]>({
    queryKey: ["budgets", projectId],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/budgets?project_id=${projectId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch budgets");
      }
      return response.json();
    },
  });
};

export const useBudget = (id: string) => {
  return useQuery<Budget>({
    queryKey: ["budgets", id],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/budgets/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch budget");
      }
      return response.json();
    },
  });
};

// Budget Mutations
export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: CreateBudgetData) => {
      const response = await fetch(`${BASE_URL}/budgets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create budget");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["budgets"]);
      },
    }
  );
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, data }: { id: string; data: Partial<CreateBudgetData> }) => {
      const response = await fetch(`${BASE_URL}/budgets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update budget");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["budgets"]);
      },
    }
  );
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (id: string) => {
      const response = await fetch(`${BASE_URL}/budgets/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete budget");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["budgets"]);
      },
    }
  );
};

// Budget Line Mutations
export const useCreateBudgetLine = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: CreateBudgetLineData) => {
      const response = await fetch(`${BASE_URL}/budget-lines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create budget line");
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["budgets"]);
      },
    }
  );
};
