
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PurchaseOrder {
  id: string;
  project_id: string;
  task_id?: string;
  po_number: string;
  vendor_name: string;
  description?: string;
  total_amount: number;
  status: 'draft' | 'approved' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderLine {
  id: string;
  purchase_order_id: string;
  budget_line_id?: number;
  category: string;
  subcategory?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  created_at: string;
}

export interface CreatePurchaseOrderData {
  project_id: string;
  task_id?: string;
  po_number: string;
  vendor_name: string;
  description?: string;
  status?: 'draft' | 'approved' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery_date?: string;
  lines: {
    budget_line_id?: number;
    category: string;
    subcategory?: string;
    description?: string;
    quantity: number;
    unit_price: number;
  }[];
}

export const useProjectPurchaseOrders = (projectId: string) => {
  return useQuery({
    queryKey: ['purchase_orders', projectId],
    queryFn: async () => {
      // Since purchase_orders table doesn't exist yet, return empty array
      // This will be replaced when the proper database migration is run
      console.log('Purchase orders table not available yet');
      return [] as PurchaseOrder[];
    },
    enabled: !!projectId,
  });
};

export const usePurchaseOrderLines = (purchaseOrderId: string) => {
  return useQuery({
    queryKey: ['purchase_order_lines', purchaseOrderId],
    queryFn: async () => {
      // Since purchase_order_lines table doesn't exist yet, return empty array
      // This will be replaced when the proper database migration is run
      console.log('Purchase order lines table not available yet');
      return [] as PurchaseOrderLine[];
    },
    enabled: !!purchaseOrderId,
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePurchaseOrderData) => {
      // Since the tables don't exist yet, just simulate success
      console.log('Create purchase order not available yet', data);
      
      // Return a mock purchase order
      const mockPO: PurchaseOrder = {
        id: 'mock-po-' + Date.now(),
        project_id: data.project_id,
        task_id: data.task_id,
        po_number: data.po_number,
        vendor_name: data.vendor_name,
        description: data.description,
        total_amount: data.lines.reduce((sum, line) => sum + (line.quantity * line.unit_price), 0),
        status: data.status || 'draft',
        order_date: data.order_date,
        expected_delivery_date: data.expected_delivery_date,
        created_by: 'current-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return mockPO;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Purchase order created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['purchase_orders', data.project_id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create purchase order: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
