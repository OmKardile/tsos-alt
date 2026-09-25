import { supabase, isSupabaseConfigured } from './supabase';
import { Order, OrderStatus, DineTable } from '../types';

const OFFLINE_QUEUE_KEY = 'tsos_pending_offline_orders';

export interface PendingOfflineOrder {
  id: string;
  order: Order;
  tenantId: string;
  locationId: string;
  timestamp: string;
}

export const realtimeService = {
  /**
   * Subscribe to live Supabase Postgres Changes for KDS, POS, and Storefront
   */
  subscribeToTenantRealtime(
    tenantId: string,
    callbacks: {
      onOrderInserted?: (order: any) => void;
      onOrderUpdated?: (order: any) => void;
      onTableUpdated?: (table: any) => void;
    }
  ) {
    if (!isSupabaseConfigured()) {
      return () => {};
    }

    try {
      const channel = supabase
        .channel(`pos-realtime-${tenantId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'orders',
          },
          (payload) => {
            if (callbacks.onOrderInserted) {
              callbacks.onOrderInserted(payload.new);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
          },
          (payload) => {
            if (callbacks.onOrderUpdated) {
              callbacks.onOrderUpdated(payload.new);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'dining_tables',
          },
          (payload) => {
            if (callbacks.onTableUpdated) {
              callbacks.onTableUpdated(payload.new);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime channel error:', err);
      return () => {};
    }
  },

  /**
   * Sync Order to Supabase with offline queue fallback
   */
  async syncOrderToSupabase(order: Order, tenantId: string, locationId: string): Promise<{ success: boolean; queued: boolean }> {
    if (isSupabaseConfigured() && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        // Format table ID as valid UUID if needed
        const tableId = order.table_id && order.table_id.includes('-') && order.table_id.length === 36
          ? order.table_id
          : null;

        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .insert({
            tenant_id: tenantId,
            location_id: locationId,
            table_id: tableId,
            order_type: order.order_type,
            status: order.status,
            customer_name: order.customer_name || null,
            customer_phone: order.customer_phone || null,
            subtotal: order.subtotal,
            tax_amount: order.tax_total,
            platform_fee: order.platform_fee,
            discount_amount: order.discount_total,
            total: order.grand_total,
            payment_status: order.payment_status,
            payment_method: order.payment_method || 'cash',
            notes: order.notes || null,
          })
          .select('id')
          .single();

        if (orderErr) {
          throw orderErr;
        }

        if (orderData?.id && order.items?.length > 0) {
          const itemInserts = order.items.map((i) => ({
            tenant_id: tenantId,
            order_id: orderData.id,
            name: i.menu_item_name,
            variant_name: i.variant_name || null,
            qty: i.qty,
            unit_price: i.unit_price,
            item_total: i.item_total,
            notes: i.notes || null,
          }));

          await supabase.from('order_items').insert(itemInserts);
        }

        return { success: true, queued: false };
      } catch (err) {
        console.warn('Supabase order insert failed, queueing locally:', err);
      }
    }

    // Queue in offline storage
    this.queuePendingOrder(order, tenantId, locationId);
    return { success: true, queued: true };
  },

  /**
   * Update order status in Supabase (e.g. KDS Bump)
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    if (isSupabaseConfigured() && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (!error) return true;
      } catch (err) {
        console.warn('Failed to update order status in Supabase:', err);
      }
    }
    return false;
  },

  /**
   * Offline Queue Management
   */
  queuePendingOrder(order: Order, tenantId: string, locationId: string) {
    if (typeof window === 'undefined') return;
    try {
      const queue = this.getOfflineQueue();
      queue.push({
        id: `pending_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        order,
        tenantId,
        locationId,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch {}
  },

  getOfflineQueue(): PendingOfflineOrder[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async flushOfflineQueue(): Promise<number> {
    if (!isSupabaseConfigured() || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      return 0;
    }

    const queue = this.getOfflineQueue();
    if (queue.length === 0) return 0;

    let syncedCount = 0;
    const remaining: PendingOfflineOrder[] = [];

    for (const item of queue) {
      try {
        const res = await this.syncOrderToSupabase(item.order, item.tenantId, item.locationId);
        if (!res.queued) {
          syncedCount++;
        } else {
          remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    }

    return syncedCount;
  },
};

// Auto-flush when browser comes back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    realtimeService.flushOfflineQueue();
  });
}
