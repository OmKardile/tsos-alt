import React, { useState } from 'react';
import { useTsosStore } from '../../lib/store';
import { Order, OrderStatus } from '../../types';
import { ReceiptModal } from '../pos/ReceiptModal';
import { ManualPrintReceiptModal } from '../pos/ManualPrintReceiptModal';
import { PrintLogsSection } from './PrintLogsSection';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Utensils,
  ShoppingBag,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  Clock,
  Ban,
  Printer,
  Bluetooth,
  Activity,
  AlertTriangle,
} from 'lucide-react';

export const OrdersScreen: React.FC = () => {
  const { orders, printLogs } = useTsosStore();
  const [activeView, setActiveView] = useState<'orders' | 'print_logs'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);
  const [manualPrintOrder, setManualPrintOrder] = useState<Order | null>(null);
  const [isManualPrintOpen, setIsManualPrintOpen] = useState(false);

  const safeOrders = orders || [];
  const safePrintLogs = printLogs || [];
  const failedPrintJobsCount = safePrintLogs.filter((l) => l.status === 'failed').length;
  const filteredOrders = safeOrders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numMatch = order.order_number.toString().includes(q);
      const custMatch = order.customer_name?.toLowerCase().includes(q);
      const itemMatch = (order.items || []).some((i) => i.menu_item_name.toLowerCase().includes(q));
      return numMatch || custMatch || itemMatch;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF1E6] text-[#F97316]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
            New
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF4E5] text-[#B45309]">
            <Clock className="w-3 h-3" />
            Preparing
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F5EC] text-[#17803D]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#17803D] animate-ping" />
            Ready
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5F0EB] text-[#57534E]">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#B42318]">
            <Ban className="w-3 h-3" />
            Cancelled
          </span>
        );
    }
  };

  const getPaymentIcon = (method?: string) => {
    switch (method) {
      case 'upi':
        return <QrCode className="w-3.5 h-3.5 text-[#F97316]" />;
      case 'cash':
        return <Banknote className="w-3.5 h-3.5 text-[#17803D]" />;
      case 'card':
        return <CreditCard className="w-3.5 h-3.5 text-[#2563EB]" />;
      default:
        return <Receipt className="w-3.5 h-3.5 text-[#A8A29E]" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-100px)] overflow-hidden bg-[#FFF9F2]">
      {/* Primary Sub-Navigation Bar */}
      <div className="bg-white border-b border-[#E9E0D6] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1.5 bg-[#F5F0EB] p-1 rounded-2xl border border-[#E9E0D6]">
          <button
            onClick={() => setActiveView('orders')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'orders'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Orders Directory</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#E9E0D6] text-[#1C1917] font-semibold">
              {safeOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveView('print_logs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'print_logs'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>Print Logs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#E9E0D6] text-[#1C1917] font-semibold">
              {safePrintLogs.length}
            </span>
            {failedPrintJobsCount > 0 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono bg-rose-100 text-rose-700 border border-rose-200">
                <AlertTriangle className="w-2.5 h-2.5" />
                {failedPrintJobsCount} err
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeView === 'orders' && (
            <button
              onClick={() => {
                setManualPrintOrder(filteredOrders[0] || null);
                setIsManualPrintOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D5C9BD] bg-white hover:bg-[#F5F0EB] text-[#1C1917] text-xs font-semibold transition-all shadow-xs shrink-0"
              title="Manual Print Receipt Module (Thermal & Web Bluetooth)"
            >
              <Printer className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Thermal Workstation</span>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-1 rounded-md font-mono border border-blue-200">
                BT
              </span>
            </button>
          )}
        </div>
      </div>

      {/* View 1: Orders Directory */}
      {activeView === 'orders' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Filter Bar */}
          <div className="p-4 bg-white border-b border-[#E9E0D6] flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order #, customer, or dish name..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[#E9E0D6] bg-[#FFF9F2] focus:bg-white focus:border-[#F97316] focus:outline-hidden text-[#1C1917]"
              />
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Orders' },
                { id: 'new', label: 'New' },
                { id: 'preparing', label: 'Preparing' },
                { id: 'ready', label: 'Ready' },
                { id: 'completed', label: 'Completed' },
                { id: 'cancelled', label: 'Cancelled' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === tab.id
                      ? 'bg-[#1C1917] text-white shadow-xs'
                      : 'bg-[#F5F0EB] text-[#57534E] hover:bg-[#E9E0D6]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

      {/* Orders Table */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl border border-[#E9E0D6] overflow-hidden shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FFF9F2] border-b border-[#E9E0D6] text-[11px] font-semibold text-[#57534E] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Type / Table</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total & Fee</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0EB]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#A8A29E]">
                    No orders matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FFF9F2]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-[#1C1917]">
                        #{order.order_number}
                      </div>
                      <div className="text-[11px] text-[#A8A29E]">
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1C1917]">
                        {order.order_type === 'dine_in' ? (
                          <>
                            <Utensils className="w-3.5 h-3.5 text-[#F97316]" />
                            <span>{order.table_label || 'Dine-In'}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-[#57534E]" />
                            <span className="capitalize">{order.order_type}</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#1C1917]">
                        {order.customer_name || 'Walk-in Guest'}
                      </div>
                      {order.customer_phone && (
                        <div className="text-[11px] text-[#A8A29E] font-mono">
                          {order.customer_phone}
                        </div>
                      )}
                      {(order.loyalty_points_earned || order.loyalty_points_redeemed) && (
                        <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                          {order.loyalty_points_earned ? (
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded-sm">
                              +{order.loyalty_points_earned} pts
                            </span>
                          ) : null}
                          {order.loyalty_points_redeemed ? (
                            <span className="text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.2 rounded-sm">
                              -{order.loyalty_points_redeemed} pts
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs text-[#1C1917] max-w-xs truncate">
                        {(order.items || []).map((i) => `${i.qty}x ${i.menu_item_name}`).join(', ')}
                      </div>
                      <div className="text-[10px] text-[#A8A29E]">
                        {(order.items || []).reduce((s, i) => s + (i?.qty || 0), 0)} total items
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-[#1C1917]">
                        ₹{order.grand_total.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-[#57534E] flex items-center gap-1">
                        <span>Fee: ₹{order.platform_fee}</span>
                        <span className="px-1 rounded-sm bg-[#FFF1E6] text-[#F97316]">
                          {order.fee_payer === 'cafe' ? 'Cafe' : 'Cust'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 text-xs capitalize font-medium text-[#1C1917]">
                        {getPaymentIcon(order.payment_method)}
                        <span>{order.payment_method || 'Paid'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setManualPrintOrder(order);
                            setIsManualPrintOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-[#D5C9BD] bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Manual Print Receipt (Web Bluetooth & Custom Format)"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewingReceiptOrder(order)}
                          className="p-1.5 rounded-lg border border-[#E9E0D6] bg-white hover:bg-[#F5F0EB] text-[#57534E] hover:text-[#1C1917] transition-colors"
                          title="View Quick Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      )}

      {/* View 2: Print Logs Section */}
      {activeView === 'print_logs' && (
        <PrintLogsSection
          onOpenManualPrint={(order) => {
            setManualPrintOrder(order || filteredOrders[0] || null);
            setIsManualPrintOpen(true);
          }}
        />
      )}

      {/* Receipt Modal */}
      {viewingReceiptOrder && (
        <ReceiptModal
          order={viewingReceiptOrder}
          onClose={() => setViewingReceiptOrder(null)}
        />
      )}

      {/* Manual Print Receipt Thermal Workstation Modal */}
      {(isManualPrintOpen || manualPrintOrder) && (
        <ManualPrintReceiptModal
          initialOrder={manualPrintOrder}
          onClose={() => {
            setIsManualPrintOpen(false);
            setManualPrintOrder(null);
          }}
        />
      )}
    </div>
  );
};
