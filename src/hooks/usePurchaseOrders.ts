
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
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('project_id', projectId)
        .order('order_date', { ascending: false });

      if (error) throw error;
      return data as PurchaseOrder[];
    },
    enabled: !!projectId,
  });
};

export const usePurchaseOrderLines = (purchaseOrderId: string) => {
  return useQuery({
    queryKey: ['purchase_order_lines', purchaseOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_order_lines')
        .select('*')
        .eq('purchase_order_id', purchaseOrderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as PurchaseOrderLine[];
    },
    enabled: !!purchaseOrderId,
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePurchaseOrderData) => {
      const totalAmount = data.lines.reduce((sum, line) => sum + (line.quantity * line.unit_price), 0);

      // Create purchase order
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .insert([{
          ...data,
          total_amount: totalAmount,
          created_by: 'current-user' // Replace with actual user ID from auth
        }])
        .select()
        .single();

      if (poError) throw poError;

      // Create purchase order lines
      const lines = data.lines.map(line => ({
        purchase_order_id: po.id,
        ...line,
        total_amount: line.quantity * line.unit_price
      }));

      const { error: linesError } = await supabase
        .from('purchase_order_lines')
        .insert(lines);

      if (linesError) throw linesError;

      return po;
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
