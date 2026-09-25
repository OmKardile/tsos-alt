import React, { useState, useMemo } from 'react';
import { useTsosStore } from '../../lib/store';
import { Ingredient, Recipe, InventoryLog } from '../../types';
import { RestockOrderModal } from './RestockOrderModal';
import {
  Boxes,
  AlertTriangle,
  Plus,
  RefreshCw,
  History,
  FileText,
  Search,
  CheckCircle2,
  X,
  ArrowDownRight,
  ArrowUpRight,
  ClipboardList,
  BarChart3,
  TrendingDown,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const InventoryScreen: React.FC = () => {
  const {
    ingredients,
    recipes,
    menuItems,
    categories,
    inventoryLogs,
    restockIngredient,
  } = useTsosStore();

  const [activeTab, setActiveTab] = useState<'stock' | 'recipes' | 'logs'>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isChartCollapsed, setIsChartCollapsed] = useState(false);
  const [restockModalItem, setRestockModalItem] = useState<Ingredient | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(1000);
  const [restockReason, setRestockReason] = useState('Fresh supplier batch');
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const lowStockItems = ingredients.filter((i) => i.stock_qty <= i.low_stock_threshold);

  // Helper to determine category for an ingredient via recipes -> menu items -> categories
  const getCategoryForIngredient = (ing: Ingredient): string => {
    const matchingRecipes = recipes.filter((r) => r.ingredient_id === ing.id);
    for (const r of matchingRecipes) {
      const menuItem = menuItems.find((m) => m.id === r.menu_item_id);
      if (menuItem) {
        const cat = categories.find((c) => c.id === menuItem.category_id);
        if (cat) return cat.name;
      }
    }
    const nameLower = ing.name.toLowerCase();
    if (nameLower.includes('coffee') || nameLower.includes('espresso') || nameLower.includes('arabica')) return 'Coffee';
    if (nameLower.includes('milk') || nameLower.includes('dairy') || nameLower.includes('cream')) return 'Coffee';
    if (nameLower.includes('tea') || nameLower.includes('chai') || nameLower.includes('sugar')) return 'Tea';
    if (nameLower.includes('dough') || nameLower.includes('bread') || nameLower.includes('samosa') || nameLower.includes('potato')) return 'Snacks';
    return 'Pantry';
  };

  // Recharts Data Breakdown: Low-Stock vs. Categories
  const categoryBreakdownData = useMemo(() => {
    const map: Record<
      string,
      {
        category: string;
        total: number;
        healthy: number;
        lowStock: number;
        lowStockItems: { name: string; stock: number; threshold: number; unit: string }[];
      }
    > = {};

    ingredients.forEach((ing) => {
      const cat = getCategoryForIngredient(ing);
      if (!map[cat]) {
        map[cat] = {
          category: cat,
          total: 0,
          healthy: 0,
          lowStock: 0,
          lowStockItems: [],
        };
      }
      map[cat].total += 1;
      if (ing.stock_qty <= ing.low_stock_threshold) {
        map[cat].lowStock += 1;
        map[cat].lowStockItems.push({
          name: ing.name,
          stock: ing.stock_qty,
          threshold: ing.low_stock_threshold,
          unit: ing.unit,
        });
      } else {
        map[cat].healthy += 1;
      }
    });

    return Object.values(map);
  }, [ingredients, recipes, menuItems, categories]);

  const filteredIngredients = ingredients.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategoryFilter !== 'all') {
      const itemCat = getCategoryForIngredient(item);
      return itemCat === selectedCategoryFilter;
    }
    return true;
  });

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem || restockAmount <= 0) return;
    restockIngredient(restockModalItem.id, restockAmount, restockReason);
    setRestockModalItem(null);
  };

  const handleRestockOrderSuccess = (count: number) => {
    setToastMessage(`Successfully restocked ${count} inventory item${count > 1 ? 's' : ''}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-100px)] overflow-hidden bg-[#FFF9F2]">
      {/* Top Banner */}
      <div className="p-4 bg-white border-b border-[#E9E0D6] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FFF1E6] text-[#F97316] flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1C1917] leading-tight">
              Inventory & Recipe Engine
            </h2>
            <div className="text-xs text-[#57534E]">
              Automatic deduction when kitchen finishes orders • Audit trail
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-[#F5F0EB] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'stock'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Stock Levels ({ingredients.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'recipes'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Recipes ({recipes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'logs'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Logs ({inventoryLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Low stock warning banner if any */}
      {lowStockItems.length > 0 && activeTab === 'stock' && (
        <div className="bg-[#FEF2F2] border-b border-[#FECACA] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-[#B42318] font-medium">
            <AlertTriangle className="w-4 h-4 text-[#B42318] shrink-0" />
            <span>
              <strong>Low Stock Alert:</strong> {lowStockItems.map((i) => i.name).join(', ')} are at or below minimum threshold!
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowRestockModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#B42318] hover:bg-[#991B1B] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Generate Restock Order List ({lowStockItems.length})</span>
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-[#DCFCE7] border-b border-[#86EFAC] px-4 py-2 text-xs font-bold text-[#15803D] flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-[#15803D] hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Tab 1: Stock Levels */}
        {activeTab === 'stock' && (
          <div className="space-y-4">
            {/* Recharts Summary Chart: Low-Stock Items vs Categories */}
            <div className="bg-white rounded-2xl border border-[#E9E0D6] p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-[#F5F0EB] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1917] leading-tight flex items-center gap-2">
                      <span>Supply Chain Breakdown: Low-Stock Items vs. Categories</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        Recharts Live
                      </span>
                    </h3>
                    <p className="text-xs text-[#57534E]">
                      Aggregated stock health and replenish thresholds across menu categories at a glance.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Critical Category Tag */}
                  {lowStockItems.length > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B42318] text-xs font-bold">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>
                        {categoryBreakdownData.filter((c) => c.lowStock > 0).length} Categories Understocked
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => setIsChartCollapsed(!isChartCollapsed)}
                    className="px-2.5 py-1 rounded-lg border border-[#E9E0D6] hover:bg-[#F5F0EB] text-[#57534E] text-xs font-semibold transition-colors"
                  >
                    {isChartCollapsed ? 'Expand Chart' : 'Minimize'}
                  </button>
                </div>
              </div>

              {!isChartCollapsed && (
                <div>
                  {/* Recharts BarChart */}
                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryBreakdownData}
                        margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
                        barCategoryGap={30}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F5F0EB" vertical={false} />
                        <XAxis
                          dataKey="category"
                          tick={{ fill: '#57534E', fontSize: 11, fontWeight: 600 }}
                          stroke="#E9E0D6"
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fill: '#78716C', fontSize: 10 }}
                          stroke="#E9E0D6"
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-[#1C1917] text-white p-3 rounded-xl shadow-xl border border-gray-700 text-xs max-w-xs animate-in fade-in duration-100">
                                  <div className="font-bold text-sm text-[#F97316] mb-1.5 flex items-center justify-between gap-2 border-b border-gray-800 pb-1">
                                    <span>{label} Category</span>
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      {data.total} items tracked
                                    </span>
                                  </div>
                                  <div className="space-y-1 my-1.5 font-mono text-[11px]">
                                    <div className="flex items-center justify-between text-emerald-400">
                                      <span>Adequate Stock:</span>
                                      <span className="font-bold">{data.healthy}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-rose-400">
                                      <span>Low-Stock Alert:</span>
                                      <span className="font-bold">{data.lowStock}</span>
                                    </div>
                                  </div>
                                  {data.lowStockItems && data.lowStockItems.length > 0 && (
                                    <div className="mt-2 pt-1.5 border-t border-gray-800 text-[10px]">
                                      <div className="text-rose-300 font-semibold mb-1">
                                        Action Required:
                                      </div>
                                      <ul className="space-y-0.5 text-gray-300">
                                        {data.lowStockItems.map((item: any, idx: number) => (
                                          <li
                                            key={idx}
                                            className="flex items-center justify-between gap-2"
                                          >
                                            <span className="truncate">• {item.name}</span>
                                            <span className="font-mono text-rose-400 shrink-0 font-bold">
                                              {item.stock}/{item.threshold} {item.unit}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          align="right"
                          iconType="circle"
                          wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
                        />
                        <Bar
                          dataKey="healthy"
                          name="Adequate Stock"
                          fill="#10B981"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={45}
                        />
                        <Bar
                          dataKey="lowStock"
                          name="Low Stock (Reorder Needed)"
                          fill="#EF4444"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={45}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category Filter Pills & Supply Chain Status */}
                  <div className="mt-3 pt-3 border-t border-[#F5F0EB] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[#57534E] font-medium mr-1 flex items-center gap-1">
                        <Filter className="w-3 h-3 text-[#A8A29E]" /> Filter Category:
                      </span>
                      <button
                        onClick={() => setSelectedCategoryFilter('all')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          selectedCategoryFilter === 'all'
                            ? 'bg-[#1C1917] text-white'
                            : 'bg-[#F5F0EB] text-[#57534E] hover:bg-[#E9E0D6]'
                        }`}
                      >
                        All Categories ({ingredients.length})
                      </button>

                      {categoryBreakdownData.map((cat) => {
                        const isSelected = selectedCategoryFilter === cat.category;
                        return (
                          <button
                            key={cat.category}
                            onClick={() => setSelectedCategoryFilter(cat.category)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                              isSelected
                                ? 'bg-[#F97316] text-white'
                                : 'bg-[#F5F0EB] text-[#57534E] hover:bg-[#E9E0D6]'
                            }`}
                          >
                            <span>{cat.category}</span>
                            {cat.lowStock > 0 ? (
                              <span
                                className={`text-[10px] px-1.5 rounded-full font-mono font-bold ${
                                  isSelected ? 'bg-black/30 text-white' : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {cat.lowStock} low
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] px-1.5 rounded-full font-mono font-bold ${
                                  isSelected
                                    ? 'bg-black/30 text-white'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {cat.healthy} ok
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-[11px] text-[#78716C] italic">
                      Tip: Hover any bar for supplier reorder deficits.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter ingredients..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E9E0D6] bg-white focus:outline-hidden text-[#1C1917]"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowRestockModal(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#D5C9BD] hover:bg-[#F5EBE1] text-[#1C1917] font-semibold text-xs transition-colors shadow-xs"
              >
                <ClipboardList className="w-4 h-4 text-[#F97316]" />
                <span>Generate Restock Order List</span>
                {lowStockItems.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FEF2F2] text-[#B42318] border border-[#FECACA]">
                    {lowStockItems.length}
                  </span>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredIngredients.map((item) => {
                const isLow = item.stock_qty <= item.low_stock_threshold;
                const deficit = Math.max(0, item.low_stock_threshold - item.stock_qty);
                const percentage = Math.min(100, Math.round((item.stock_qty / (item.low_stock_threshold * 4)) * 100));

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
                      isLow
                        ? 'bg-gradient-to-b from-[#FEF2F2]/50 to-white border-[#FCA5A5] ring-1 ring-[#FCA5A5]'
                        : 'bg-white border-[#E9E0D6]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-sm text-[#1C1917] leading-tight">
                            {item.name}
                          </h3>
                          <span className="text-[11px] text-[#57534E]">Base Unit: {item.unit}</span>
                        </div>
                        {isLow ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF2F2] text-[#B42318] border border-[#FECACA] flex items-center gap-1 shadow-2xs">
                              <AlertTriangle className="w-3 h-3 text-[#B42318] shrink-0" />
                              <span>Low Stock</span>
                            </span>
                            <span className="text-[9px] font-semibold text-[#B42318]">
                              Deficit: {deficit} {item.unit}
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F5EC] text-[#17803D]">
                            Healthy
                          </span>
                        )}
                      </div>

                      <div className="my-3">
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-2xl font-bold font-mono text-[#1C1917]">
                            {item.stock_qty.toLocaleString()}
                            <span className="text-sm font-normal text-[#57534E] ml-1">
                              {item.unit}
                            </span>
                          </span>
                          <span className="text-[11px] text-[#A8A29E]">
                            Threshold: {item.low_stock_threshold} {item.unit}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#F5F0EB] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isLow ? 'bg-[#B42318]' : 'bg-[#17803D]'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 mt-2">
                      <button
                        onClick={() => {
                          setRestockModalItem(item);
                          setRestockAmount(item.unit === 'pcs' ? 20 : item.unit === 'kg' || item.unit === 'l' ? 5 : 1000);
                        }}
                        className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold text-xs transition-colors ${
                          isLow
                            ? 'bg-[#FEF2F2] hover:bg-[#B42318] text-[#B42318] hover:text-white border border-[#FECACA]'
                            : 'bg-[#FFF1E6] hover:bg-[#F97316] text-[#F97316] hover:text-white'
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{isLow ? 'Restock Immediately' : 'Restock Ingredient'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Recipes */}
        {activeTab === 'recipes' && (
          <div className="space-y-4">
            <div className="text-xs text-[#57534E] bg-white p-3 rounded-xl border border-[#E9E0D6]">
              Recipes define how many raw ingredients are automatically subtracted from stock whenever a menu item is cooked and marked complete in the KDS.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => {
                const itemRecipes = recipes.filter((r) => r.menu_item_id === item.id);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#E9E0D6] p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover bg-[#F5F0EB]"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-[#1C1917] leading-tight">
                          {item.name}
                        </h4>
                        <div className="text-xs text-[#57534E] font-mono">₹{item.price}</div>
                      </div>
                    </div>

                    <div className="border-t border-[#F5F0EB] pt-2 space-y-1.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A29E]">
                        Ingredient Consumption per Order:
                      </div>
                      {itemRecipes.length === 0 ? (
                        <div className="text-xs text-[#A8A29E] italic">
                          No ingredient recipe mapped yet.
                        </div>
                      ) : (
                        itemRecipes.map((rec) => {
                          const ing = ingredients.find((i) => i.id === rec.ingredient_id);
                          return (
                            <div
                              key={rec.id}
                              className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#FFF9F2] border border-[#F5E6D8]"
                            >
                              <span className="font-medium text-[#1C1917]">
                                {ing?.name || 'Unknown'}
                              </span>
                              <span className="font-mono font-bold text-[#F97316]">
                                {rec.qty_consumed} {ing?.unit}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Audit Logs */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl border border-[#E9E0D6] overflow-hidden shadow-xs">
            <div className="p-3 bg-[#FFF9F2] border-b border-[#E9E0D6] text-xs font-semibold text-[#57534E] flex items-center justify-between">
              <span>Inventory Audit Trail (Automatic Order Deductions & Restocks)</span>
              <span>{inventoryLogs.length} total events recorded</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-[#E9E0D6] text-[10px] text-[#A8A29E] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Time</th>
                  <th className="py-2.5 px-4">Ingredient</th>
                  <th className="py-2.5 px-4">Change Qty</th>
                  <th className="py-2.5 px-4">Reason / Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0EB]">
                {inventoryLogs.map((log) => {
                  const isPositive = log.change_qty > 0;
                  return (
                    <tr key={log.id} className="hover:bg-[#FFF9F2]/50">
                      <td className="py-2.5 px-4 text-[#57534E] font-mono">
                        {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-[#1C1917]">
                        {log.ingredient_name}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold ${
                            isPositive ? 'text-[#17803D]' : 'text-[#B42318]'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {isPositive ? `+${log.change_qty}` : log.change_qty}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[#57534E] capitalize">
                        {log.reason === 'order_consumed' ? (
                          <span className="text-[#B45309]">
                            Kitchen KDS Auto-Deduct {log.ref_order_id ? `(#${log.ref_order_id.replace('ord-', '')})` : ''}
                          </span>
                        ) : (
                          <span className="text-[#17803D]">Manual Restock Intake</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-[#E9E0D6] shadow-xl overflow-hidden p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-[#1C1917]">
                Restock: {restockModalItem.name}
              </h3>
              <button
                onClick={() => setRestockModalItem(null)}
                className="text-[#A8A29E] hover:text-[#1C1917]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1">
                  Quantity to Add ({restockModalItem.unit})
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-base font-bold font-mono rounded-xl border border-[#E9E0D6] focus:border-[#F97316] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1">
                  Restock Reason / Procurement Note
                </label>
                <input
                  type="text"
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  placeholder="e.g. Weekly roaster shipment, dairy delivery"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E9E0D6] focus:border-[#F97316] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="px-3 py-2 text-xs font-medium text-[#57534E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#17803D] hover:bg-[#156f35] text-white rounded-xl shadow-xs"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Restock Order List Generator Modal */}
      {showRestockModal && (
        <RestockOrderModal
          onClose={() => setShowRestockModal(false)}
          onRestockSuccess={handleRestockOrderSuccess}
        />
      )}
    </div>
  );
};
