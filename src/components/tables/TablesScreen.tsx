import React, { useState } from 'react';
import { useTsosStore } from '../../lib/store';
import { DineTable } from '../../types';
import {
  Grid,
  Plus,
  QrCode,
  Users,
  ExternalLink,
  Printer,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';

export const TablesScreen: React.FC = () => {
  const {
    tables,
    orders,
    addTable,
    updateTableStatus,
    setActiveSurface,
    setSelectedTableId,
    location,
  } = useTsosStore();

  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [newTableLabel, setNewTableLabel] = useState('');
  const [newTableSeats, setNewTableSeats] = useState(4);
  const [viewingQrTable, setViewingQrTable] = useState<DineTable | null>(null);

  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableLabel.trim()) return;
    addTable(newTableLabel.trim(), newTableSeats);
    setNewTableLabel('');
    setIsAddTableOpen(false);
  };

  const handleOpenStorefrontForTable = (table: DineTable) => {
    setSelectedTableId(table.id);
    setActiveSurface('storefront');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-100px)] overflow-hidden bg-[#FFF9F2]">
      {/* Header */}
      <div className="p-4 bg-white border-b border-[#E9E0D6] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FFF1E6] text-[#F97316] flex items-center justify-center">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1C1917] leading-tight">
              Dine-In Floor Plan & Table QR Codes
            </h2>
            <div className="text-xs text-[#57534E]">
              Tables auto-free when kitchen or cashier finishes orders • Contactless QR ordering
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddTableOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Table</span>
        </button>
      </div>

      {/* Tables Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => {
            const isOccupied = table.status === 'occupied';
            const activeOrder = orders.find(
              (o) => o.id === table.current_order_id && o.status !== 'completed' && o.status !== 'cancelled'
            );

            return (
              <div
                key={table.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
                  isOccupied
                    ? 'border-[#FED7AA] bg-[#FFFBEB]/40 ring-1 ring-[#FED7AA]'
                    : 'border-[#E9E0D6]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-base text-[#1C1917]">{table.label}</h3>
                      <div className="text-xs text-[#57534E] flex items-center gap-1 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-[#A8A29E]" />
                        <span>{table.seats} Seats</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        isOccupied
                          ? 'bg-[#FFF4E5] text-[#B45309]'
                          : 'bg-[#E8F5EC] text-[#17803D]'
                      }`}
                    >
                      {table.status}
                    </span>
                  </div>

                  {isOccupied && activeOrder ? (
                    <div className="my-2 p-2.5 bg-[#FFF4E5] rounded-xl border border-[#FED7AA] text-xs space-y-1">
                      <div className="flex justify-between font-bold text-[#1C1917]">
                        <span>Order #{activeOrder.order_number}</span>
                        <span className="font-mono text-[#B45309]">₹{activeOrder.grand_total}</span>
                      </div>
                      <div className="text-[11px] text-[#57534E] truncate">
                        {activeOrder.items.map((i) => `${i.qty}x ${i.menu_item_name}`).join(', ')}
                      </div>
                      <div className="text-[10px] text-[#A8A29E] capitalize">
                        Status: <strong className="text-[#B45309]">{activeOrder.status}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="my-2 py-3 text-center text-xs text-[#A8A29E] border border-dashed border-[#E9E0D6] rounded-xl">
                      Ready for guests
                    </div>
                  )}
                </div>

                {/* Table Actions */}
                <div className="pt-3 border-t border-[#F5F0EB] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setViewingQrTable(table)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-[#E9E0D6] hover:bg-[#F5F0EB] text-xs font-semibold text-[#57534E]"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#1C1917]" />
                    <span>View QR</span>
                  </button>

                  <button
                    onClick={() => handleOpenStorefrontForTable(table)}
                    className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-[#FFF1E6] hover:bg-[#F97316] text-[#F97316] hover:text-white text-xs font-semibold transition-colors"
                    title="Launch customer table order screen"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Test QR</span>
                  </button>

                  <select
                    value={table.status}
                    onChange={(e) => updateTableStatus(table.id, e.target.value as any)}
                    className="text-[11px] font-medium border border-[#E9E0D6] rounded-lg py-1 px-1 bg-white text-[#57534E]"
                  >
                    <option value="free">Free</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Table Modal */}
      {isAddTableOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xs w-full border border-[#E9E0D6] p-5 shadow-xl">
            <h3 className="font-bold text-sm text-[#1C1917] mb-3">Add Table to Floor</h3>
            <form onSubmit={handleAddTableSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1">
                  Table Label / Number
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTableLabel}
                  onChange={(e) => setNewTableLabel(e.target.value)}
                  placeholder="e.g. T5 (Patio), Table 6"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E9E0D6] focus:border-[#F97316] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1">
                  Number of Seats
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={24}
                  value={newTableSeats}
                  onChange={(e) => setNewTableSeats(Number(e.target.value) || 2)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-[#E9E0D6] focus:border-[#F97316] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTableOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#57534E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#F97316] text-white rounded-xl shadow-xs"
                >
                  Add Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Stand Preview Modal */}
      {viewingQrTable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-[#E9E0D6] shadow-2xl p-6 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-[#F5F0EB] pb-2">
              <span className="text-xs font-semibold text-[#57534E]">Table Stand Printout</span>
              <button
                onClick={() => setViewingQrTable(null)}
                className="text-[#A8A29E] hover:text-[#1C1917]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Table Stand Graphic */}
            <div className="p-6 bg-[#FFF9F2] rounded-2xl border border-[#E9E0D6] shadow-inner space-y-3">
              <div className="font-display font-bold text-lg text-[#1C1917] tracking-wider uppercase">
                {location.name}
              </div>
              <div className="text-xs text-[#57534E]">Scan to View Menu & Order</div>

              <div className="w-44 h-44 bg-white mx-auto p-3 rounded-xl border-2 border-[#1C1917] shadow-sm flex flex-col items-center justify-center relative">
                <QrCode className="w-32 h-32 text-[#1C1917]" />
                <div className="text-[10px] font-mono font-bold text-[#1C1917]">
                  {viewingQrTable.label}
                </div>
              </div>

              <div className="text-sm font-bold text-[#F97316]">
                {viewingQrTable.label} ({viewingQrTable.seats} Seats)
              </div>

              {/* Secure URL & Anti-Tamper Token Details */}
              <div className="bg-white p-2.5 rounded-xl border border-[#E9E0D6] text-left space-y-1">
                <div className="flex items-center justify-between text-[10px] font-semibold text-[#17803D]">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                    <span>Anti-Tamper & 10m History Guard</span>
                  </span>
                  <span className="font-mono text-[9px] text-[#78716C]">10m Expiry</span>
                </div>
                <div className="text-[10px] font-mono text-[#57534E] break-all bg-[#FAF7F2] p-1.5 rounded-md border border-[#E9E0D6]">
                  https://tablesideordering-web.vercel.app/{location.slug || 'coolkafe'}/{viewingQrTable.label.toLowerCase().replace(/[^a-z0-9]/g, '')}?token={viewingQrTable.qr_token}
                </div>
                <div className="text-[9px] text-[#78716C] leading-snug">
                  • Physical scan initiates a <strong>10-minute dynamic session token</strong>.<br />
                  • Expired sessions prevent guests from ordering from home via browser history or saved bookmarks.
                </div>
              </div>

              <div className="text-[11px] text-[#A8A29E]">
                No app download needed • Powered by TSOS
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleOpenStorefrontForTable(viewingQrTable)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold transition-colors"
              >
                Test Valid QR Order
              </button>
              <button
                onClick={() => {
                  const url = `https://tablesideordering-web.vercel.app/${location.slug || 'coolkafe'}/${viewingQrTable.label.toLowerCase().replace(/[^a-z0-9]/g, '')}?token=${viewingQrTable.qr_token}`;
                  navigator.clipboard?.writeText(url);
                  alert(`Secure Table QR URL copied:\n${url}`);
                }}
                className="py-2 px-3 rounded-xl border border-[#E9E0D6] text-xs font-semibold text-[#57534E] hover:bg-[#F5F0EB] flex items-center gap-1"
              >
                <span>Copy Link</span>
              </button>
              <button
                onClick={() => window.print()}
                className="py-2 px-3 rounded-xl border border-[#E9E0D6] text-xs font-semibold text-[#57534E] hover:bg-[#F5F0EB] flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
