import React, { useState, useRef, useEffect } from 'react';
import { useTsosStore } from '../../lib/store';
import { WebTab } from '../../types';
import {
  ShoppingBag,
  ChefHat,
  Receipt,
  UtensilsCrossed,
  Boxes,
  Grid,
  Users,
  Tag,
  BarChart3,
  Sliders,
  ChevronDown,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export const WebNavbar: React.FC = () => {
  const { activeWebTab, setActiveWebTab, orders, ingredients, shifts } = useTsosStore();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Active kitchen orders (new or preparing)
  const activeKdsCount = orders.filter(
    (o) => o.status === 'new' || o.status === 'preparing'
  ).length;

  // Active staff clocked in
  const activeStaffCount = shifts.filter((s) => s.status === 'active').length;

  // Low stock ingredients count
  const lowStockCount = ingredients.filter(
    (i) => i.stock_qty <= i.low_stock_threshold
  ).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryTabs: { id: WebTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'pos', label: 'New Sale (POS)', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'kds', label: 'KDS (Kitchen)', icon: <ChefHat className="w-4 h-4" />, badge: activeKdsCount, badgeColor: 'bg-[#F97316]' },
    { id: 'orders', label: 'Orders', icon: <Receipt className="w-4 h-4" /> },
    { id: 'shifts', label: 'Staff & Shifts', icon: <Clock className="w-4 h-4" />, badge: activeStaffCount, badgeColor: 'bg-[#17803D]' },
    { id: 'inventory', label: 'Stock & Recipes', icon: <Boxes className="w-4 h-4" />, badge: lowStockCount, badgeColor: 'bg-[#B42318]' },
  ];

  const moreTabs: { id: WebTab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'menu', label: 'Menu & Variants', icon: <UtensilsCrossed className="w-4 h-4" />, desc: 'Categories, pricing, veg/non-veg' },
    { id: 'tables', label: 'Dine-in Tables', icon: <Grid className="w-4 h-4" />, desc: 'Floor plan, QR codes, seat status' },
    { id: 'customers', label: 'Customers & Loyalty', icon: <Users className="w-4 h-4" />, desc: 'Points ledger (1 pt per ₹10)' },
    { id: 'offers', label: 'Offers & Promos', icon: <Tag className="w-4 h-4" />, desc: 'Flat, percent & BOGO discounts' },
    { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-4 h-4" />, desc: 'Daily sales, top items, margins' },
    { id: 'settings', label: 'Settings & Fee Engine', icon: <Sliders className="w-4 h-4" />, desc: 'Per-order fee, auto-flip rules' },
  ];

  const isMoreActive = moreTabs.some((t) => t.id === activeWebTab);

  return (
    <nav className="bg-white border-b border-[#E9E0D6] px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-1.5 flex-wrap">
        {primaryTabs.map((tab) => {
          const isActive = activeWebTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveWebTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#FFF1E6] text-[#F97316] font-semibold border border-[#F97316]/20'
                  : 'text-[#57534E] hover:bg-[#F5F0EB] hover:text-[#1C1917]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`text-[11px] font-bold text-white px-1.5 py-0.2 rounded-full ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* More Dropdown */}
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              isMoreActive
                ? 'bg-[#FFF1E6] text-[#F97316] font-semibold border border-[#F97316]/20'
                : 'text-[#57534E] hover:bg-[#F5F0EB] hover:text-[#1C1917]'
            }`}
          >
            <span>More</span>
            {isMoreActive && (
              <span className="text-xs text-[#F97316] font-normal">
                ({moreTabs.find((t) => t.id === activeWebTab)?.label})
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                isMoreOpen ? 'rotate-180 text-[#F97316]' : 'text-[#A8A29E]'
              }`}
            />
          </button>

          {isMoreOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-white border border-[#E9E0D6] rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#A8A29E] border-b border-[#F5F0EB]">
                Cafe Management
              </div>
              {moreTabs.map((tab) => {
                const isActive = activeWebTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveWebTab(tab.id);
                      setIsMoreOpen(false);
                    }}
                    className={`w-full flex items-start gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                      isActive ? 'bg-[#FFF1E6] text-[#F97316]' : 'text-[#1C1917] hover:bg-[#F5F0EB]'
                    }`}
                  >
                    <span className={`mt-0.5 ${isActive ? 'text-[#F97316]' : 'text-[#57534E]'}`}>
                      {tab.icon}
                    </span>
                    <div>
                      <div className="font-medium text-xs leading-tight">{tab.label}</div>
                      <div className="text-[11px] text-[#A8A29E]">{tab.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {lowStockCount > 0 && (
        <button
          onClick={() => setActiveWebTab('inventory')}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#FEF2F2] border border-[#FCA5A5] text-[#B42318] text-xs font-medium rounded-lg hover:bg-[#FEE2E2] transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{lowStockCount} items low in stock</span>
        </button>
      )}
    </nav>
  );
};
