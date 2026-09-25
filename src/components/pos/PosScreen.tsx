import React, { useState, useEffect } from 'react';
import { useTsosStore } from '../../lib/store';
import { MenuItem, Order } from '../../types';
import { CartDrawer } from './CartDrawer';
import { VariantModal } from './VariantModal';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { ManualPrintReceiptModal } from './ManualPrintReceiptModal';
import { GuidanceTooltip } from '../common/GuidanceTooltip';
import { realtimeService } from '../../lib/realtimeService';
import {
  Search,
  Coffee,
  CupSoda,
  Utensils,
  Croissant,
  Plus,
  SlidersHorizontal,
  Check,
  CheckCircle2,
  Printer,
  Bluetooth,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  Landmark,
  CircleDot,
} from 'lucide-react';

export const PosScreen: React.FC = () => {
  const {
    location,
    currentTenant,
    currentProfile,
    shifts,
    categories,
    menuItems,
    addToCart,
    feeConfig,
    cart,
    appliedOffer,
    redeemedPoints,
    ingredients,
    recipes,
    handleInboundOrder,
    handleInboundTableStatus,
  } = useTsosStore();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [clockTime, setClockTime] = useState<string>('');

  useEffect(() => {
    setClockTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    const timer = setInterval(() => {
      setClockTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Supabase WebSocket subscription for live POS table and order updates
  useEffect(() => {
    const tenantId = location?.business_id || currentTenant?.id || 'biz_coolkafe_99';
    const unsub = realtimeService.subscribeToTenantRealtime(tenantId, {
      onOrderInserted: (orderPayload) => {
        if (orderPayload) {
          handleInboundOrder(orderPayload as any);
        }
      },
      onTableUpdated: (tablePayload) => {
        if (tablePayload?.id && tablePayload?.status) {
          handleInboundTableStatus(tablePayload.id, tablePayload.status as any);
        }
      },
    });
    return () => unsub();
  }, [location, currentTenant, handleInboundOrder, handleInboundTableStatus]);

  // Modals state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isManualPrintOpen, setIsManualPrintOpen] = useState(false);

  // Icon mapping
  const getCategoryIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'coffee':
        return <Coffee className="w-4 h-4" />;
      case 'tea':
        return <CupSoda className="w-4 h-4" />;
      case 'snacks':
        return <Utensils className="w-4 h-4" />;
      case 'pastries':
        return <Croissant className="w-4 h-4" />;
      default:
        return <Coffee className="w-4 h-4" />;
    }
  };

  // Filter items
  const safeMenuItems = menuItems || [];
  const filteredItems = safeMenuItems.filter((item) => {
    if (!item.is_available) return false;
    if (selectedCategoryId !== 'all' && item.category_id !== selectedCategoryId) return false;
    if (vegOnly && !item.is_veg) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleItemClick = (item: MenuItem) => {
    // If item has variants or addons, open customize modal
    const hasVariants = item.variants && item.variants.length > 0;
    const hasAddons = item.addon_ids && item.addon_ids.length > 0;

    if (hasVariants || hasAddons) {
      setCustomizingItem(item);
    } else {
      addToCart(item);
    }
  };

  // Math calculations for payment modal
  const safeCart = cart || [];
  const subtotal = safeCart.reduce((acc, item) => acc + item.item_total, 0);
  const taxTotal = +(subtotal * 0.05).toFixed(2);

  let discountTotal = 0;
  if (appliedOffer) {
    if (appliedOffer.type === 'percent') {
      discountTotal = +(subtotal * (appliedOffer.value / 100)).toFixed(2);
    } else if (appliedOffer.type === 'flat') {
      discountTotal = Math.min(subtotal, appliedOffer.value);
    }
  }
  if (redeemedPoints > 0) {
    discountTotal += redeemedPoints;
  }

  const feePayer = feeConfig.default_fee_payer;
  const platformFee = feeConfig.per_order_fee;
  const grandTotal = Math.max(
    0,
    +(subtotal + taxTotal - discountTotal + (feePayer === 'customer' ? platformFee : 0)).toFixed(2)
  );

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-100px)] overflow-hidden bg-[#FFF9F2]">
      {/* Menu Catalog Section */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* POS Operational Status Ribbon */}
        <div className="bg-[#1C1917] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-[#F97316]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>{location.name}</span>
            </span>
            <span className="text-white/30">|</span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <User className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Cashier: <strong>{currentProfile.name}</strong></span>
            </span>
            <span className="text-white/30 hidden sm:inline">|</span>
            <span className="hidden sm:flex items-center gap-1.5 text-stone-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Shift active (Active)</span>
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 text-emerald-300">
              <Landmark className="w-3.5 h-3.5 text-emerald-400" />
              <span>Drawer: ₹2,500 float</span>
            </div>
            <div className="px-2 py-0.5 rounded-md bg-white/15 text-stone-200 font-bold tracking-wider">
              {clockTime || '00:00:00'}
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-white border-b border-[#E9E0D6] flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, drinks, scan barcode... (Ctrl+K)"
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[#E9E0D6] bg-[#FFF9F2] focus:bg-white focus:border-[#F97316] focus:outline-hidden transition-all text-[#1C1917]"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Veg Only Toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                vegOnly
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-[#E9E0D6] bg-white text-[#57534E] hover:bg-[#F5F0EB]'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-xs border border-emerald-600 flex items-center justify-center p-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
              </span>
              <span>Pure Veg Only</span>
            </button>

            {/* Manual Print Receipt Module Button */}
            <button
              onClick={() => setIsManualPrintOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#D5C9BD] bg-white hover:bg-[#F5F0EB] text-[#1C1917] text-xs font-semibold transition-all shadow-xs"
              title="Manual 'Print Receipt' Module (Web Bluetooth thermal printing & order summary formatting)"
            >
              <Printer className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Print Receipt</span>
              <span className="flex items-center gap-0.5 text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-md font-mono border border-blue-200">
                <Bluetooth className="w-2.5 h-2.5" /> BT
              </span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <GuidanceTooltip guideKey="pos_category_nav" position="bottom" className="w-full">
          <div className="px-4 py-2 bg-white border-b border-[#E9E0D6] flex items-center gap-2 overflow-x-auto no-scrollbar w-full">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategoryId === 'all'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-[#F5F0EB] text-[#57534E] hover:bg-[#E9E0D6]'
              }`}
            >
              All Items ({menuItems.filter((i) => i.is_available).length})
            </button>

            {categories.map((cat) => {
              const count = menuItems.filter(
                (i) => i.category_id === cat.id && i.is_available
              ).length;
              const isSelected = selectedCategoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#F97316] text-white shadow-xs'
                      : 'bg-[#F5F0EB] text-[#57534E] hover:bg-[#E9E0D6]'
                  }`}
                >
                  {getCategoryIcon(cat.name)}
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-black/20 text-white' : 'bg-[#E9E0D6] text-[#57534E]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </GuidanceTooltip>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-[#A8A29E]">
              <Coffee className="w-10 h-10 text-[#E9E0D6] mb-2" />
              <div className="font-semibold text-sm text-[#57534E]">No matching items found</div>
              <div className="text-xs text-[#A8A29E] mt-1">
                Try clearing your search query or toggling filters.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredItems.map((item) => {
                const hasVariants = item.variants && item.variants.length > 0;
                const hasAddons = item.addon_ids && item.addon_ids.length > 0;

                // Recipe BOM check for reorder point threshold
                const itemRecipes = (recipes || []).filter((r) => r.menu_item_id === item.id);
                const lowStockIng = itemRecipes
                  .map((r) => (ingredients || []).find((ing) => ing.id === r.ingredient_id))
                  .find((ing) => ing && ing.stock_qty <= ing.low_stock_threshold);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="group bg-white rounded-2xl border border-[#E9E0D6] hover:border-[#F97316]/50 hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between relative"
                  >
                    <div className="p-3">
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-2.5 bg-[#F5F0EB]">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Veg / Non-Veg Indicator */}
                        <div className="absolute top-2 left-2 p-1 bg-white/90 backdrop-blur-xs rounded-md shadow-xs">
                          <span
                            className={`w-3 h-3 rounded-xs border ${
                              item.is_veg ? 'border-emerald-600' : 'border-red-600'
                            } flex items-center justify-center p-0.5`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.is_veg ? 'bg-emerald-600' : 'bg-red-600'
                              }`}
                            />
                          </span>
                        </div>

                        {/* Reorder Point Low Stock Badge */}
                        {lowStockIng && (
                          <div
                            className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-500 text-white shadow-xs flex items-center gap-1 backdrop-blur-xs"
                            title={`Reorder Point Breached: ${lowStockIng.name} has only ${lowStockIng.stock_qty}${lowStockIng.unit} left (threshold: ${lowStockIng.low_stock_threshold}${lowStockIng.unit})`}
                          >
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Low: {lowStockIng.name.split(' ')[0]}</span>
                          </div>
                        )}

                        {/* Variants or Customize Badge */}
                        {(hasVariants || hasAddons) && !lowStockIng && (
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#1C1917]/80 text-white backdrop-blur-xs">
                            Customizable
                          </div>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-[#1C1917] leading-snug group-hover:text-[#F97316] transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#57534E] mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="px-3 pb-3 pt-1 border-t border-[#F5F0EB] flex items-center justify-between">
                      <div>
                        <span className="text-xs text-[#57534E]">Starts at</span>
                        <div className="font-mono font-bold text-base text-[#1C1917]">
                          ₹{item.price}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FFF1E6] hover:bg-[#F97316] text-[#F97316] hover:text-white font-semibold text-xs transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer onOpenPayment={() => setIsPaymentOpen(true)} />

      {/* Item Variant / Addon Customizer Modal */}
      {customizingItem && (
        <VariantModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onConfirm={(variantId, addonIds, notes) => {
            addToCart(customizingItem, variantId, addonIds, notes);
            setCustomizingItem(null);
          }}
        />
      )}

      {/* Payment Modal */}
      {isPaymentOpen && (
        <PaymentModal
          grandTotal={grandTotal}
          subtotal={subtotal}
          taxTotal={taxTotal}
          discountTotal={discountTotal}
          platformFee={platformFee}
          feePayer={feePayer}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={(newOrder) => {
            setIsPaymentOpen(false);
            setCompletedOrder(newOrder);
          }}
        />
      )}

      {/* Receipt Modal */}
      {completedOrder && (
        <ReceiptModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          onNewSale={() => setCompletedOrder(null)}
        />
      )}

      {/* Manual Print Receipt Thermal Workstation Modal */}
      {isManualPrintOpen && (
        <ManualPrintReceiptModal
          initialOrder={completedOrder || (cart.length > 0 ? undefined : undefined)}
          onClose={() => setIsManualPrintOpen(false)}
        />
      )}
    </div>
  );
};
