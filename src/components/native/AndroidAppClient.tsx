import React, { useState } from 'react';
import { useTsosStore } from '../../lib/store';
import { MenuItem, DineTable } from '../../types';
import { playChime } from '../../lib/sound';
import {
  Wifi,
  Battery,
  Signal,
  QrCode,
  CreditCard,
  Utensils,
  ShoppingBag,
  Search,
  CheckCircle2,
  Sparkles,
  Smartphone,
  ChevronRight,
  MapPin,
  Coffee,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  FileCode,
  X,
  Filter,
  Flame,
  Check,
  Award,
  Calendar,
  Gift,
  RotateCcw,
  Receipt,
  Camera,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AndroidAppClient: React.FC = () => {
  const {
    location,
    tables,
    categories,
    menuItems,
    addons,
    orders,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    createOrder,
    selectedTableId,
    setSelectedTableId,
    audioEnabled,
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    feeConfig,
    appliedOffer,
    applyOffer,
    removeOffer,
    redeemedPoints,
    setRedeemedPoints,
    trackedOrderId,
    setTrackedOrderId,
  } = useTsosStore();

  // Active customer navigation tab inside the Android smartphone
  const [activeTab, setActiveTab] = useState<'scan' | 'menu' | 'cart' | 'tracker' | 'rewards'>('scan');
  const [selectedCatId, setSelectedCatId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non_veg'>('all');
  const [selectedTableArea, setSelectedTableArea] = useState<'all' | 'indoor' | 'window' | 'patio'>('all');
  const [guestCount, setGuestCount] = useState<number>(2);

  // Scanner & Booking state
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Item Customizer Bottom Sheet
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState('');

  // Payment simulation state
  const [paymentMode, setPaymentMode] = useState<'upi' | 'cash'>('upi');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [latestPlacedOrderId, setLatestPlacedOrderId] = useState<string | null>(null);

  // Kotlin / Jetpack Compose Source Code Viewer Modal
  const [showKotlinCode, setShowKotlinCode] = useState(false);

  const safeTables = tables || [];
  const safeCart = cart || [];
  const safeOrders = orders || [];
  const safeMenuItems = menuItems || [];
  const safeCategories = categories || [];

  const selectedTable = safeTables.find((t) => t.id === selectedTableId);
  const activeCustomer = customers?.find((c) => c.id === selectedCustomerId) || customers?.[0];

  // Calculations
  const subtotal = safeCart.reduce((sum, item) => sum + (item?.item_total || 0), 0);
  const taxTotal = +(subtotal * 0.05).toFixed(2);
  const feePayer = feeConfig?.default_fee_payer ?? 'customer';
  const platformFee = feePayer === 'customer' ? (feeConfig?.per_order_fee ?? 1) : 0;
  const discountTotal = Math.min(subtotal, (appliedOffer?.value || 0) + (redeemedPoints || 0));
  const grandTotal = Math.max(0, +(subtotal + taxTotal + platformFee - discountTotal).toFixed(2));
  const totalCartQty = safeCart.reduce((sum, item) => sum + (item?.qty || 0), 0);

  // Active tracked order
  const targetOrderId = latestPlacedOrderId || trackedOrderId || safeOrders[0]?.id;
  const trackedOrder = safeOrders.find((o) => o.id === targetOrderId);

  // Filtered Menu Items
  const filteredMenuItems = safeMenuItems.filter((item) => {
    if (!item.is_available) return false;
    if (selectedCatId !== 'all' && item.category_id !== selectedCatId) return false;
    if (dietaryFilter === 'veg' && !item.is_veg) return false;
    if (dietaryFilter === 'non_veg' && item.is_veg) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  // Table area filtering
  const filteredTables = safeTables.filter((tbl) => {
    if (selectedTableArea === 'indoor') return tbl.label.includes('T-01') || tbl.label.includes('T-02') || tbl.label.includes('T-03');
    if (selectedTableArea === 'window') return tbl.label.toLowerCase().includes('window') || tbl.label.includes('T-04') || tbl.label.includes('T-05');
    if (selectedTableArea === 'patio') return tbl.label.toLowerCase().includes('patio') || tbl.label.toLowerCase().includes('outdoor') || tbl.label.includes('T-06');
    return true;
  });

  // Handle QR Scan simulation
  const handleSimulateScan = (table: DineTable) => {
    setIsScanningCamera(true);
    if (audioEnabled) playChime('click');

    setTimeout(() => {
      setIsScanningCamera(false);
      setSelectedTableId(table.id);
      setScanSuccessMessage(`Checked into ${table.label}! Ready to browse menu.`);
      if (audioEnabled) playChime('complete');
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });

      setTimeout(() => {
        setScanSuccessMessage(null);
        setActiveTab('menu');
      }, 1400);
    }, 1100);
  };

  // Handle Manual Table Booking
  const handleBookTable = (table: DineTable) => {
    setSelectedTableId(table.id);
    setBookingConfirmed(true);
    if (audioEnabled) playChime('complete');
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });

    setTimeout(() => {
      setBookingConfirmed(false);
      setActiveTab('menu');
    }, 1200);
  };

  // Open item customizer
  const handleOpenCustomizer = (item: MenuItem) => {
    setCustomizingItem(item);
    setSelectedVariantId(item.variants?.[0]?.id);
    setSelectedAddonIds([]);
    setCustomNotes('');
  };

  // Add customized item to cart
  const handleConfirmAddToCart = () => {
    if (!customizingItem) return;
    addToCart(customizingItem, selectedVariantId, selectedAddonIds, customNotes);
    if (audioEnabled) playChime('click');
    setCustomizingItem(null);
  };

  // Place Order from Customer App
  const handlePlaceOrder = () => {
    if (safeCart.length === 0) return;
    setIsPlacingOrder(true);
    if (audioEnabled) playChime('click');

    setTimeout(() => {
      const order = createOrder({
        paymentMethod: paymentMode,
        customPlacedBy: selectedTable ? `Customer Android App (${selectedTable.label})` : 'Customer Android App (Takeaway)',
        customerNotes: `Ordered via Customer Android App • Party of ${guestCount}`,
      });

      setLatestPlacedOrderId(order.id);
      setTrackedOrderId(order.id);
      setIsPlacingOrder(false);

      if (audioEnabled) playChime('ready');
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#F97316', '#17803D', '#E11D48'],
      });

      setActiveTab('tracker');
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 bg-[#1E1B18] overflow-y-auto min-h-[calc(100vh-80px)] select-none">
      {/* Top Banner / Device Context Bar */}
      <div className="w-full max-w-[420px] mb-3 flex items-center justify-between text-xs text-[#A8A29E] px-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-semibold text-white">Customer Android App</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#292524] text-[#F97316] font-mono border border-[#44403C]">
            Jetpack Compose
          </span>
        </div>

        <button
          onClick={() => setShowKotlinCode(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#292524] hover:bg-[#3D3835] text-white border border-[#44403C] transition-colors text-[11px] font-medium"
        >
          <FileCode className="w-3.5 h-3.5 text-[#F97316]" />
          <span>View Kotlin Code</span>
        </button>
      </div>

      {/* Modern Flagship Android Smartphone Bezel (Pixel 8 / Samsung S24 aesthetic) */}
      <div className="relative w-full max-w-[395px] bg-[#0C0A09] rounded-[48px] p-3 shadow-2xl border-4 border-[#292524] flex flex-col items-center">
        {/* Top Punch-Hole Selfie Camera */}
        <div className="absolute top-5 z-30 w-3.5 h-3.5 bg-black rounded-full border border-[#262626] flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[#172554] rounded-full" />
        </div>

        {/* Screen Display */}
        <div className="w-full bg-[#FFF9F2] rounded-[38px] overflow-hidden flex flex-col h-[710px] shadow-inner border border-[#3A3532] relative">
          {/* Android System Status Bar */}
          <div className="h-7 bg-[#1C1917] px-5 flex items-center justify-between text-white text-[11px] font-medium z-20">
            <span className="font-semibold tracking-wide">12:45</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#A8A29E]">5G</span>
              <Signal className="w-3 h-3 text-white" />
              <Wifi className="w-3 h-3 text-white" />
              <div className="flex items-center gap-0.5 text-[10px]">
                <Battery className="w-3.5 h-3.5 text-white" />
                <span>94%</span>
              </div>
            </div>
          </div>

          {/* Android App Top Bar (Material 3) */}
          <div className="bg-[#1C1917] text-white px-4 py-2.5 flex items-center justify-between border-b border-[#292524] z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#F97316] to-[#FB923C] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                ☕
              </div>
              <div className="leading-tight">
                <div className="font-bold text-xs text-white tracking-tight flex items-center gap-1">
                  <span>{location.name}</span>
                </div>
                <div className="text-[10px] text-[#A8A29E] flex items-center gap-1">
                  {selectedTable ? (
                    <span className="text-[#34D399] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                      {selectedTable.label}
                    </span>
                  ) : (
                    <span className="text-[#FBBF24]">Tap to Scan / Book Table</span>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Points Badge */}
            <button
              onClick={() => setActiveTab('rewards')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#292524] border border-[#44403C] hover:border-[#F97316] transition-colors"
            >
              <Star className="w-3 h-3 text-[#FBBF24] fill-[#FBBF24]" />
              <span className="text-[11px] font-bold text-white">
                {activeCustomer?.loyalty_points || 142} pts
              </span>
            </button>
          </div>

          {/* TAB 1: SCAN QR CODE & BOOK TABLE */}
          {activeTab === 'scan' && (
            <div className="flex-1 flex flex-col overflow-y-auto p-3.5 space-y-3.5">
              {/* Active Checked-in Table Banner */}
              {selectedTable ? (
                <div className="p-3 bg-gradient-to-r from-[#ECFDF5] to-[#F0FDF4] rounded-2xl border border-[#A7F3D0] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#10B981] text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#065F46] flex items-center gap-1">
                        <span>Checked in at {selectedTable.label}</span>
                      </div>
                      <div className="text-[11px] text-[#047857]">
                        {selectedTable.seats} Seats • Orders will deliver directly to your table
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTableId(null)}
                    className="text-[11px] text-[#065F46] underline font-medium hover:text-[#047857]"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-gradient-to-r from-[#FFF1E6] to-[#FFF9F2] rounded-2xl border border-[#FED7AA] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#F97316]" />
                    <div>
                      <div className="text-xs font-bold text-[#1C1917]">Scan Table QR or Book Below</div>
                      <div className="text-[10px] text-[#78716C]">Select your table to unlock mobile ordering</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Simulated Camera QR Scanner Viewport */}
              <div className="relative bg-[#171717] rounded-3xl overflow-hidden border-2 border-[#404040] shadow-md flex flex-col items-center justify-center p-6 text-center text-white">
                {/* Camera Viewfinder Crosshairs */}
                <div className="relative w-44 h-44 border-2 border-dashed border-[#F97316]/70 rounded-2xl flex items-center justify-center overflow-hidden bg-black/40">
                  {/* Animated scanning laser line */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#F97316] to-transparent animate-pulse shadow-[0_0_8px_#F97316]" />
                  <QrCode className="w-24 h-24 text-white/30" />

                  {isScanningCamera && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-semibold text-white">Detecting QR Code...</span>
                    </div>
                  )}

                  {scanSuccessMessage && (
                    <div className="absolute inset-0 bg-[#065F46]/90 p-3 flex flex-col items-center justify-center text-center">
                      <CheckCircle2 className="w-8 h-8 text-[#34D399] mb-1 animate-bounce" />
                      <span className="text-xs font-bold text-white">{scanSuccessMessage}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs font-bold text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#F97316]" />
                  <span>Point at Table QR Acrylic Sticker</span>
                </div>
                <div className="text-[10px] text-[#A8A29E] mt-0.5">
                  Or tap a test table below to simulate customer scanning:
                </div>

                {/* Instant Simulation Action Chips */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                  {safeTables.slice(0, 3).map((tbl) => (
                    <button
                      key={tbl.id}
                      onClick={() => handleSimulateScan(tbl)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#262626] hover:bg-[#333] border border-[#525252] text-[#F97316] transition-colors"
                    >
                      Scan {tbl.label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const rand = safeTables[3] || safeTables[0];
                      if (rand) handleSimulateScan(rand);
                    }}
                    className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white transition-colors"
                  >
                    ⚡ Quick Scan Table
                  </button>
                </div>
              </div>

              {/* Table Booking / Floor Plan Selector */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1917]">
                    <Users className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>Book or Select Table In-Cafe</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#78716C]">
                    <span>Party:</span>
                    {[1, 2, 4, 6].map((count) => (
                      <button
                        key={count}
                        onClick={() => setGuestCount(count)}
                        className={`w-5 h-5 rounded-md text-[10px] font-bold ${
                          guestCount === count
                            ? 'bg-[#1C1917] text-white'
                            : 'bg-white text-[#78716C] border border-[#E9E0D6]'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Area filter tabs */}
                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-0.5">
                  {(['all', 'indoor', 'window', 'patio'] as const).map((area) => (
                    <button
                      key={area}
                      onClick={() => setSelectedTableArea(area)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold capitalize whitespace-nowrap ${
                        selectedTableArea === area
                          ? 'bg-[#1C1917] text-white'
                          : 'bg-white text-[#57534E] border border-[#E9E0D6]'
                      }`}
                    >
                      {area === 'all' ? 'All Tables' : `${area} Area`}
                    </button>
                  ))}
                </div>

                {/* Grid of Tables */}
                <div className="grid grid-cols-2 gap-2">
                  {filteredTables.map((tbl) => {
                    const isSelected = selectedTableId === tbl.id;
                    const isOccupied = tbl.status === 'occupied';

                    return (
                      <button
                        key={tbl.id}
                        onClick={() => handleBookTable(tbl)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? 'border-[#F97316] bg-[#FFF1E6] ring-2 ring-[#F97316]/40 shadow-xs'
                            : isOccupied
                            ? 'border-[#FED7AA] bg-[#FFFBEB]'
                            : 'border-[#E9E0D6] bg-white hover:border-[#D6C7B7]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#1C1917]">{tbl.label}</span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected
                                ? 'bg-[#F97316]'
                                : isOccupied
                                ? 'bg-[#F59E0B]'
                                : 'bg-[#10B981]'
                            }`}
                          />
                        </div>
                        <div className="text-[10px] text-[#78716C] mt-1 flex items-center justify-between">
                          <span>{tbl.seats} Seats</span>
                          <span className="font-medium text-[9px] uppercase">
                            {isSelected ? 'Your Table' : isOccupied ? 'In Use' : 'Tap to Book'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Advance Button */}
                {selectedTable && (
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="w-full mt-2 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>Browse Menu & Order ({selectedTable.label})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DIGITAL MENU & ITEM CUSTOMIZER */}
          {activeTab === 'menu' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search & Dietary Filter */}
              <div className="p-2.5 bg-white border-b border-[#E9E0D6] space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#A8A29E]" />
                  <input
                    type="text"
                    placeholder="Search coffee, bakery, bites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-[#FFF9F2] border border-[#E9E0D6] text-xs focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-[#A8A29E] hover:text-[#1C1917]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1 text-[10px]">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDietaryFilter('all')}
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        dietaryFilter === 'all'
                          ? 'bg-[#1C1917] text-white'
                          : 'bg-[#FFF9F2] text-[#57534E] border border-[#E9E0D6]'
                      }`}
                    >
                      All Items
                    </button>
                    <button
                      onClick={() => setDietaryFilter('veg')}
                      className={`px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                        dietaryFilter === 'veg'
                          ? 'bg-[#065F46] text-white'
                          : 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      Pure Veg
                    </button>
                    <button
                      onClick={() => setDietaryFilter('non_veg')}
                      className={`px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                        dietaryFilter === 'non_veg'
                          ? 'bg-[#991B1B] text-white'
                          : 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                      Non-Veg
                    </button>
                  </div>

                  <span className="text-[#A8A29E] font-mono">
                    {filteredMenuItems.length} dishes
                  </span>
                </div>
              </div>

              {/* Category horizontal scrolling bar */}
              <div className="px-2.5 py-2 bg-[#FFF9F2] border-b border-[#E9E0D6] flex gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setSelectedCatId('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    selectedCatId === 'all'
                      ? 'bg-[#F97316] text-white shadow-2xs'
                      : 'bg-white text-[#57534E] border border-[#E9E0D6]'
                  }`}
                >
                  All Categories
                </button>
                {safeCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCatId(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                      selectedCatId === c.id
                        ? 'bg-[#F97316] text-white shadow-2xs'
                        : 'bg-white text-[#57534E] border border-[#E9E0D6]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                {filteredMenuItems.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#A8A29E]">
                    No items match your search or filter criteria.
                  </div>
                ) : (
                  filteredMenuItems.map((item) => {
                    const hasVariantsOrAddons = (item.variants && item.variants.length > 0) || (addons && addons.length > 0);

                    return (
                      <div
                        key={item.id}
                        className="p-2.5 bg-white rounded-2xl border border-[#E9E0D6] shadow-2xs flex items-center justify-between gap-2.5 hover:border-[#D6C7B7] transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {/* Veg / Non-Veg Indicator Icon */}
                            <span
                              className={`w-3 h-3 rounded-xs border flex items-center justify-center shrink-0 ${
                                item.is_veg
                                  ? 'border-[#10B981] bg-emerald-50'
                                  : 'border-[#EF4444] bg-rose-50'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.is_veg ? 'bg-[#10B981]' : 'bg-[#EF4444]'
                                }`}
                              />
                            </span>
                            <span className="font-bold text-xs text-[#1C1917] truncate">
                              {item.name}
                            </span>
                          </div>

                          <p className="text-[10px] text-[#78716C] line-clamp-1 mt-0.5">
                            {item.description}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="font-bold font-mono text-xs text-[#1C1917]">
                              ₹{item.price}
                            </span>
                            {hasVariantsOrAddons && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#FFF1E6] text-[#F97316] font-medium">
                                Customizable
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Add / Customize Button */}
                        <div className="shrink-0">
                          {hasVariantsOrAddons ? (
                            <button
                              onClick={() => handleOpenCustomizer(item)}
                              className="px-3 py-1.5 rounded-xl bg-[#FFF1E6] text-[#F97316] hover:bg-[#F97316] hover:text-white font-bold text-[11px] transition-colors border border-[#FED7AA]"
                            >
                              + Add
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                addToCart(item);
                                if (audioEnabled) playChime('click');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#F97316] text-white hover:bg-[#EA580C] font-bold text-[11px] transition-colors shadow-2xs"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Floating Bottom Cart Bar if items in cart */}
              {safeCart.length > 0 && (
                <div className="p-2.5 bg-[#1C1917] text-white flex items-center justify-between shadow-lg">
                  <div>
                    <div className="text-[11px] font-medium text-[#A8A29E]">
                      {totalCartQty} item{totalCartQty > 1 ? 's' : ''} added
                    </div>
                    <div className="text-sm font-bold font-mono text-white">
                      ₹{subtotal.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('cart')}
                    className="px-4 py-1.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>View Table Cart</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TABLE CART & CHECKOUT */}
          {activeTab === 'cart' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 bg-white border-b border-[#E9E0D6] flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-[#1C1917]">
                    {selectedTable ? `Ordering for ${selectedTable.label}` : 'Self-Order Cart'}
                  </div>
                  <div className="text-[10px] text-[#78716C]">
                    Items will be sent directly to Barista Kitchen KDS
                  </div>
                </div>

                {safeCart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[10px] text-rose-600 font-medium hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {safeCart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#FFF1E6] text-[#F97316] flex items-center justify-center mb-3">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-[#1C1917]">Your Cart is Empty</h3>
                  <p className="text-xs text-[#78716C] mt-1 max-w-[200px]">
                    Browse the artisan menu and add your favorite coffee and bakes!
                  </p>
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#F97316] text-white font-bold text-xs shadow-xs"
                  >
                    Explore Menu
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {/* Cart Items List */}
                  <div className="space-y-2">
                    {safeCart.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-white rounded-xl border border-[#E9E0D6] shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-xs text-[#1C1917]">{item.menu_item.name}</div>
                            {item.variant && (
                              <div className="text-[10px] text-[#F97316] font-medium">
                                {item.variant.name}
                              </div>
                            )}
                            {item.addons && item.addons.length > 0 && (
                              <div className="text-[9px] text-[#78716C]">
                                {item.addons.map((a) => `+ ${a.name}`).join(', ')}
                              </div>
                            )}
                            {item.notes && (
                              <div className="text-[9px] text-[#A8A29E] italic">
                                Note: {item.notes}
                              </div>
                            )}
                          </div>
                          <div className="font-bold font-mono text-xs text-[#1C1917]">
                            ₹{item.item_total.toFixed(2)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[#F5EFEA]">
                          <span className="text-[10px] text-[#A8A29E]">₹{item.unit_price} each</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartQty(item.id, item.qty - 1)}
                              className="w-6 h-6 rounded-md bg-[#FFF9F2] border border-[#E9E0D6] text-xs font-bold flex items-center justify-center hover:bg-[#F5EFEA]"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold font-mono w-4 text-center">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateCartQty(item.id, item.qty + 1)}
                              className="w-6 h-6 rounded-md bg-[#FFF9F2] border border-[#E9E0D6] text-xs font-bold flex items-center justify-center hover:bg-[#F5EFEA]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Loyalty Points Redemption Box */}
                  <div className="p-3 bg-[#FFF9F2] rounded-2xl border border-[#E9E0D6] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#7C3AED]">
                        <Star className="w-3.5 h-3.5 fill-[#7C3AED]" />
                        <span>Redeem Loyalty Points (1 pt = ₹1)</span>
                      </div>
                      {redeemedPoints > 0 && (
                        <button
                          onClick={() => setRedeemedPoints(0)}
                          className="text-[10px] text-rose-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="text-[10px] text-[#78716C]">
                      Available Balance:{' '}
                      <strong className="text-[#1C1917] font-mono">
                        {activeCustomer?.loyalty_points || 142} pts
                      </strong>
                    </div>

                    {redeemedPoints > 0 ? (
                      <div className="p-2 rounded-xl bg-purple-100 border border-purple-200 text-purple-900 text-xs flex items-center justify-between font-medium">
                        <span>Redeeming {redeemedPoints} pts</span>
                        <span className="font-bold font-mono">-₹{redeemedPoints}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {[25, 50, 100].map((pts) => (
                          <button
                            key={pts}
                            onClick={() => setRedeemedPoints(pts)}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-white border border-[#DDD6FE] text-[#7C3AED] hover:bg-[#F5F3FF]"
                          >
                            ₹{pts} off
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="p-3 bg-white rounded-2xl border border-[#E9E0D6] space-y-2">
                    <div className="text-xs font-bold text-[#1C1917]">Choose Payment Option</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPaymentMode('upi')}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 ${
                          paymentMode === 'upi'
                            ? 'border-[#F97316] bg-[#FFF1E6] text-[#F97316] font-bold'
                            : 'border-[#E9E0D6] text-[#57534E]'
                        }`}
                      >
                        <QrCode className="w-4 h-4" />
                        <span className="text-[11px]">Instant UPI QR</span>
                      </button>

                      <button
                        onClick={() => setPaymentMode('cash')}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 ${
                          paymentMode === 'cash'
                            ? 'border-[#F97316] bg-[#FFF1E6] text-[#F97316] font-bold'
                            : 'border-[#E9E0D6] text-[#57534E]'
                        }`}
                      >
                        <Utensils className="w-4 h-4" />
                        <span className="text-[11px]">Pay at Counter</span>
                      </button>
                    </div>
                  </div>

                  {/* Transparent Bill Breakdown */}
                  <div className="p-3 bg-white rounded-2xl border border-[#E9E0D6] space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#78716C]">
                      <span>Item Subtotal</span>
                      <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-[#78716C]">
                      <span>GST (2.5% CGST + 2.5% SGST)</span>
                      <span className="font-mono">₹{taxTotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-[#78716C]">
                      <span>TSOS Convenience Fee</span>
                      <span className="font-mono">
                        {feePayer === 'customer' ? `+ ₹${platformFee}` : '₹0.00 (Absorbed)'}
                      </span>
                    </div>

                    {discountTotal > 0 && (
                      <div className="flex justify-between text-[#10B981] font-medium">
                        <span>Discounts & Loyalty Points</span>
                        <span className="font-mono">- ₹{discountTotal.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#E9E0D6] flex justify-between font-bold text-sm text-[#1C1917]">
                      <span>Total Due</span>
                      <span className="font-mono text-[#F97316]">₹{grandTotal}</span>
                    </div>
                  </div>

                  {/* Checkout Action Button */}
                  <button
                    disabled={isPlacingOrder}
                    onClick={handlePlaceOrder}
                    className="w-full py-3 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                  >
                    {isPlacingOrder ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Order to Kitchen...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {paymentMode === 'upi' ? `Pay & Send Order (₹${grandTotal})` : `Send Order to Kitchen (₹${grandTotal})`}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LIVE KITCHEN ORDER TRACKER */}
          {activeTab === 'tracker' && (
            <div className="flex-1 flex flex-col p-3.5 overflow-y-auto space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#F97316]" />
                  <span>Live Kitchen Tracker</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#065F46] animate-pulse">
                  ● Real-time KDS Sync
                </span>
              </div>

              {trackedOrder ? (
                <div className="p-4 bg-white rounded-3xl border border-[#E9E0D6] shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E]">
                        Order ID
                      </span>
                      <div className="text-base font-bold text-[#1C1917] font-mono">
                        #{trackedOrder.order_number}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E]">
                        Table
                      </span>
                      <div className="text-sm font-bold text-[#F97316]">
                        {trackedOrder.table_label || 'Takeaway'}
                      </div>
                    </div>
                  </div>

                  {/* 4-Stage Live Progress Stepper */}
                  <div className="space-y-2 py-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-[#10B981]">1. Order Placed</span>
                      <span className={trackedOrder.status !== 'new' ? 'text-[#10B981]' : 'text-[#F59E0B]'}>
                        2. In Kitchen
                      </span>
                      <span className={trackedOrder.status === 'ready' || trackedOrder.status === 'completed' ? 'text-[#10B981]' : 'text-[#A8A29E]'}>
                        3. Ready
                      </span>
                    </div>

                    <div className="w-full bg-[#E9E0D6] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          trackedOrder.status === 'completed'
                            ? 'w-full bg-[#10B981]'
                            : trackedOrder.status === 'ready'
                            ? 'w-3/4 bg-[#10B981]'
                            : trackedOrder.status === 'preparing'
                            ? 'w-1/2 bg-[#F59E0B] animate-pulse'
                            : 'w-1/4 bg-[#3B82F6]'
                        }`}
                      />
                    </div>

                    <div className="text-[10px] text-center text-[#78716C] italic pt-1">
                      {trackedOrder.status === 'new' && 'Ticket received at kitchen, queued for prep.'}
                      {trackedOrder.status === 'preparing' && '☕ Barista is steaming milk & pulling espresso! Ready in ~3 mins.'}
                      {trackedOrder.status === 'ready' && '🎉 Order is ready! Server is bringing it to your table.'}
                      {trackedOrder.status === 'completed' && '✨ Enjoy your meal! Thank you for dining with us.'}
                    </div>
                  </div>

                  {/* Items Ordered List */}
                  <div className="p-3 bg-[#FFF9F2] rounded-2xl border border-[#E9E0D6] space-y-1.5 text-xs">
                    <span className="font-bold text-[11px] text-[#1C1917] block mb-1">
                      Ordered Items:
                    </span>
                    {trackedOrder.items.map((i) => (
                      <div key={i.id} className="flex justify-between text-[#57534E]">
                        <span>{i.qty}x {i.menu_item_name}</span>
                        <span className="font-mono">₹{i.item_total}</span>
                      </div>
                    ))}
                    <div className="pt-1.5 border-t border-[#E9E0D6] flex justify-between font-bold text-xs text-[#1C1917]">
                      <span>Grand Total</span>
                      <span className="font-mono text-[#F97316]">₹{trackedOrder.grand_total}</span>
                    </div>
                  </div>

                  {/* Service Request Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => alert('Water request sent to floor service!')}
                      className="py-2 rounded-xl bg-white border border-[#E9E0D6] text-[#57534E] font-semibold text-[11px] hover:bg-[#F5EFEA]"
                    >
                      💧 Request Water
                    </button>
                    <button
                      onClick={() => alert('Server has been alerted for assistance!')}
                      className="py-2 rounded-xl bg-white border border-[#E9E0D6] text-[#57534E] font-semibold text-[11px] hover:bg-[#F5EFEA]"
                    >
                      🔔 Call Server
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-[#A8A29E]">
                  No active orders right now. Place an order from the menu tab!
                </div>
              )}
            </div>
          )}

          {/* TAB 5: REWARDS & CUSTOMER PROFILE */}
          {activeTab === 'rewards' && (
            <div className="flex-1 flex flex-col p-3.5 overflow-y-auto space-y-3.5">
              {/* Gold/Platinum Loyalty Pass */}
              <div className="p-4 bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#1C1917] rounded-3xl text-white shadow-md border border-[#44403C] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#FBBF24]" />
                    <span className="text-xs font-bold tracking-wider uppercase text-[#FBBF24]">
                      TSOS Gold Member
                    </span>
                  </div>
                  <span className="text-[10px] text-[#A8A29E]">Card #8492</span>
                </div>

                <div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {activeCustomer?.loyalty_points || 142} Points
                  </div>
                  <div className="text-[11px] text-[#A8A29E] mt-0.5">
                    Equal to ₹{activeCustomer?.loyalty_points || 142} in cash discounts
                  </div>
                </div>

                <div className="pt-2 border-t border-[#44403C] flex items-center justify-between text-[10px] text-[#A8A29E]">
                  <span>Earn 1 pt per ₹10 spent</span>
                  <span className="text-[#34D399]">100% Instant Redemption</span>
                </div>
              </div>

              {/* Available Coupons */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>Exclusive Member Perks</span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-[#E9E0D6] shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1C1917]">Free Oat Milk Upgrade</span>
                    <span className="text-[10px] font-bold text-[#10B981]">ACTIVE</span>
                  </div>
                  <p className="text-[10px] text-[#78716C]">
                    Complimentary barista oat milk on any iced latte or flat white.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-[#E9E0D6] shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1C1917]">₹100 Birthday Voucher</span>
                    <span className="text-[10px] font-bold text-[#F97316]">SAVE ₹100</span>
                  </div>
                  <p className="text-[10px] text-[#78716C]">
                    Valid across all artisan pastries and gourmet sandwiches.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ITEM CUSTOMIZER BOTTOM SHEET / MODAL */}
          {customizingItem && (
            <div className="absolute inset-0 bg-black/60 z-30 flex flex-col justify-end">
              <div className="bg-white rounded-t-3xl p-4 max-h-[85%] overflow-y-auto space-y-3 animate-in slide-in-from-bottom duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#1C1917]">
                    Customize {customizingItem.name}
                  </h4>
                  <button
                    onClick={() => setCustomizingItem(null)}
                    className="p-1 text-[#78716C] hover:text-[#1C1917]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Milk Choices */}
                {customizingItem.variants && customizingItem.variants.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[#57534E]">Select Variant / Milk:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {customizingItem.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`p-2 rounded-xl text-left border text-xs ${
                            selectedVariantId === v.id
                              ? 'border-[#F97316] bg-[#FFF1E6] font-bold text-[#F97316]'
                              : 'border-[#E9E0D6] text-[#57534E]'
                          }`}
                        >
                          <div>{v.name}</div>
                          <div className="text-[10px] font-mono text-[#78716C]">
                            {v.price_delta > 0 ? `+₹${v.price_delta}` : 'Included'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Addons / Extras */}
                {addons && addons.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[#57534E]">Add-ons & Extras:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {addons.slice(0, 4).map((addon) => {
                        const isChecked = selectedAddonIds.includes(addon.id);
                        return (
                          <button
                            key={addon.id}
                            onClick={() => {
                              if (isChecked) {
                                setSelectedAddonIds(selectedAddonIds.filter((id) => id !== addon.id));
                              } else {
                                setSelectedAddonIds([...selectedAddonIds, addon.id]);
                              }
                            }}
                            className={`p-2 rounded-xl text-left border text-xs flex items-center justify-between ${
                              isChecked
                                ? 'border-[#F97316] bg-[#FFF1E6] font-bold text-[#F97316]'
                                : 'border-[#E9E0D6] text-[#57534E]'
                            }`}
                          >
                            <span>{addon.name}</span>
                            <span className="text-[10px] font-mono">+₹{addon.price}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                <div>
                  <span className="text-xs font-bold text-[#57534E]">Special Instructions:</span>
                  <input
                    type="text"
                    placeholder="e.g. Extra hot, milk steamed dry, no sugar..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl border border-[#E9E0D6] text-xs focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  />
                </div>

                <button
                  onClick={handleConfirmAddToCart}
                  className="w-full py-2.5 rounded-xl bg-[#F97316] text-white font-bold text-xs shadow-xs hover:bg-[#EA580C]"
                >
                  Add to Table Order
                </button>
              </div>
            </div>
          )}

          {/* Android M3 Bottom Navigation Bar */}
          <div className="h-16 bg-[#1C1917] border-t border-[#292524] px-2 flex items-center justify-around text-white z-20">
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                activeTab === 'scan' ? 'text-[#F97316]' : 'text-[#78716C] hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span className="text-[10px] font-semibold">Table QR</span>
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                activeTab === 'menu' ? 'text-[#F97316]' : 'text-[#78716C] hover:text-white'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span className="text-[10px] font-semibold">Menu</span>
            </button>

            <button
              onClick={() => setActiveTab('cart')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all relative ${
                activeTab === 'cart' ? 'text-[#F97316]' : 'text-[#78716C] hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-[10px] font-semibold">My Order</span>
              {totalCartQty > 0 && (
                <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-[#F97316] text-white text-[9px] font-bold flex items-center justify-center">
                  {totalCartQty}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                activeTab === 'tracker' ? 'text-[#F97316]' : 'text-[#78716C] hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-semibold">Track</span>
            </button>

            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                activeTab === 'rewards' ? 'text-[#F97316]' : 'text-[#78716C] hover:text-white'
              }`}
            >
              <Star className="w-4 h-4" />
              <span className="text-[10px] font-semibold">Rewards</span>
            </button>
          </div>

          {/* Android Gesture Navigation Indicator Pill */}
          <div className="h-3 bg-[#1C1917] flex items-center justify-center">
            <div className="w-28 h-1 bg-[#525252] rounded-full" />
          </div>
        </div>
      </div>

      {/* Jetpack Compose Kotlin Source Code Viewer Modal */}
      {showKotlinCode && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1917] text-white w-full max-w-2xl rounded-3xl border border-[#44403C] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-4 border-b border-[#292524] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#F97316]" />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    CustomerAndroidApp.kt (Kotlin & Jetpack Compose)
                  </h3>
                  <p className="text-xs text-[#A8A29E]">
                    Production-grade native Android customer application architecture
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowKotlinCode(false)}
                className="p-1 text-[#A8A29E] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto font-mono text-xs text-[#E5E5E5] space-y-4 bg-[#0F0D0C]">
              <pre className="text-emerald-400">
{`// CustomerAppScreen.kt - Android Jetpack Compose
package com.tsos.customer.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.navigation.compose.*
import com.tsos.customer.viewmodel.CustomerOrderViewModel

@Composable
fun CustomerOrderApp(viewModel: CustomerOrderViewModel) {
    val navController = rememberNavController()
    val tableState by viewModel.selectedTable.collectAsState()
    val cartItems by viewModel.cartItems.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("The Sensory Oasis", style = MaterialTheme.typography.titleMedium) },
                actions = {
                    TableBadgeChip(table = tableState, onScanClick = { navController.navigate("scan") })
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.QrCode, contentDescription = "Scan") },
                    label = { Text("Table QR") },
                    selected = currentRoute == "scan",
                    onClick = { navController.navigate("scan") }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Coffee, contentDescription = "Menu") },
                    label = { Text("Menu") },
                    selected = currentRoute == "menu",
                    onClick = { navController.navigate("menu") }
                )
                NavigationBarItem(
                    icon = { Badge(count = cartItems.size) { Icon(Icons.Default.ShoppingBag, "Cart") } },
                    label = { Text("My Order") },
                    selected = currentRoute == "cart",
                    onClick = { navController.navigate("cart") }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Schedule, contentDescription = "Tracker") },
                    label = { Text("Track") },
                    selected = currentRoute == "tracker",
                    onClick = { navController.navigate("tracker") }
                )
            }
        }
    ) { paddingValues ->
        NavHost(navController, startDestination = "scan", modifier = Modifier.padding(paddingValues)) {
            composable("scan") { TableQrScanScreen(viewModel, onTableAssigned = { navController.navigate("menu") }) }
            composable("menu") { DigitalMenuScreen(viewModel, onCheckout = { navController.navigate("cart") }) }
            composable("cart") { TableCartScreen(viewModel, onOrderPlaced = { navController.navigate("tracker") }) }
            composable("tracker") { LiveOrderTrackingScreen(viewModel) }
        }
    }
}`}
              </pre>
            </div>

            <div className="p-3 bg-[#171412] border-t border-[#292524] flex items-center justify-between text-xs text-[#A8A29E]">
              <span>Complies with Material 3 & Android 14 Guidelines</span>
              <button
                onClick={() => setShowKotlinCode(false)}
                className="px-3 py-1.5 rounded-xl bg-[#F97316] text-white font-bold text-xs"
              >
                Close Code Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
