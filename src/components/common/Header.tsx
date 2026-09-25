import React, { useState, useRef, useEffect } from 'react';
import { useTsosStore } from '../../lib/store';
import { authService } from '../../lib/authService';
import {
  Printer,
  Volume2,
  VolumeX,
  KeyRound,
  LogOut,
  ChevronDown,
  User,
  Building,
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react';
import { ConnectionStatusIndicator, CloudOfflineBanner } from './ConnectionStatusIndicator';
import { StaffPinPadModal } from '../auth/StaffPinPadModal';

interface HeaderProps {
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSignOut }) => {
  const {
    location,
    setLocation,
    availableLocations,
    currentTenant,
    impersonatedTenant,
    setImpersonatedTenant,
    currentProfile,
    audioEnabled,
    toggleAudio,
    themeMode,
    toggleThemeMode,
    feeConfig,
    printerConfig,
    setActiveSurface,
    setActiveWebTab,
  } = useTsosStore();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isStaffPinOpen, setIsStaffPinOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleSignOut = async () => {
    setIsProfileMenuOpen(false);
    await authService.signOut();
    if (onSignOut) {
      onSignOut();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <>
      <header className="bg-white border-b border-[#E9E0D6] sticky top-0 z-40 shadow-xs">
        {/* SuperAdmin Impersonation Banner */}
        {impersonatedTenant && (
          <div className="bg-[#7C3AED] text-white px-4 py-1.5 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FDE047] animate-pulse shrink-0" />
              <span>
                ⚡ <strong>SUPERADMIN IMPERSONATION:</strong> Viewing as <strong>{impersonatedTenant.name}</strong> (<code>/{impersonatedTenant.slug}</code>)
              </span>
            </div>
            <button
              onClick={() => {
                setImpersonatedTenant(null);
                setActiveSurface('superadmin');
                window.history.pushState(null, '', '/superadmin');
              }}
              className="px-3 py-1 rounded-md bg-white text-[#7C3AED] font-bold hover:bg-[#F3E8FF] transition-all text-xs shadow-xs"
            >
              Return to SuperAdmin Console
            </button>
          </div>
        )}

        {/* Operational POS Header */}
        <div className="px-4 py-2 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Brand & Outlet Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-[#1C1917] text-white shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
              <span className="tracking-wide">TSOS</span>
            </div>

            {/* Outlet Selector */}
            <div className="flex items-center gap-1.5">
              <select
                value={location.id}
                onChange={(e) => {
                  const selected = (availableLocations || []).find((l) => l.id === e.target.value);
                  if (selected) setLocation(selected);
                }}
                aria-label="Switch Outlet"
                className="bg-[#FFF9F2] border border-[#E9E0D6] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#F97316] cursor-pointer hover:bg-[#FFF1E6] transition-colors"
              >
                {(availableLocations || [location]).map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    📍 {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-[#78716C] border-l border-[#E9E0D6] pl-3">
              <span>
                Tenant: <strong className="text-[#1C1917]">{currentTenant?.name || 'CoolKafe'}</strong>
              </span>
              <span className="text-[#D6D3D1]">|</span>
              <span>
                Model: <strong className="text-[#15803D]">₹0/mo</strong> + <strong className="text-[#F97316]">₹{feeConfig.per_order_fee}/order</strong>
              </span>
            </div>
          </div>

          {/* Right: Operational Controls & User Profile */}
          <div className="flex items-center gap-2.5">
            {/* Thermal Printer Quick Status */}
            <button
              onClick={() => {
                setActiveSurface('web');
                setActiveWebTab('settings');
              }}
              title="Thermal Printer Status & Receipt Templates"
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FFF9F2] border border-[#E9E0D6] hover:bg-[#F5F0EB] text-[#57534E] text-[11px] font-mono font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#F97316]" />
              <span>{printerConfig.paper_width}</span>
              <span className="text-[10px] text-[#A8A29E] hidden sm:inline">({printerConfig.connection_type})</span>
            </button>

            {/* Live Cloud Database Sync Status */}
            <ConnectionStatusIndicator />

            {/* Audio Chime Toggle */}
            <button
              onClick={toggleAudio}
              title={audioEnabled ? 'Kitchen & Order Chimes Active' : 'Sound Muted'}
              className="p-1.5 rounded-xl border border-[#E9E0D6] bg-white text-[#57534E] hover:text-[#1C1917] hover:bg-[#FFF9F2] transition-colors"
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#16A34A]" /> : <VolumeX className="w-3.5 h-3.5 text-[#A8A29E]" />}
            </button>

            {/* Obsidian Dark Mode Global Toggle */}
            <button
              type="button"
              onClick={toggleThemeMode}
              title={themeMode === 'obsidian' ? 'Switch entire system to Warm Bakery Light Theme' : 'Switch entire system to Obsidian Ultra-Dark Mode'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                themeMode === 'obsidian'
                  ? 'bg-[#27272A] border-[#3F3F46] text-[#FDE047] hover:bg-[#3F3F46] shadow-xs'
                  : 'bg-white border-[#E9E0D6] text-[#57534E] hover:text-[#1C1917] hover:bg-[#FFF9F2]'
              }`}
            >
              {themeMode === 'obsidian' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#FDE047]" />
                  <span className="hidden md:inline font-bold text-[#FDE047]">Warm Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span className="hidden md:inline font-bold text-[#1C1917]">Obsidian Mode</span>
                </>
              )}
            </button>

            {/* Fast PIN Switch Button */}
            <button
              type="button"
              onClick={() => setIsStaffPinOpen(true)}
              title="Switch Cashier or Barista Shift"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FFF1E6] hover:bg-[#FFE4D1] text-[#C2410C] font-semibold text-xs border border-[#FDBA74] transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fast PIN</span>
            </button>

            {/* Authenticated User Profile Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl border border-[#E9E0D6] bg-[#FFF9F2] hover:bg-[#FFF1E6] transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-[#1C1917] text-white flex items-center justify-center font-bold text-xs">
                  {currentProfile.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-bold text-[#1C1917] leading-none text-xs">
                    {currentProfile.name}
                  </div>
                  <div className="text-[10px] text-[#78716C] capitalize font-medium">
                    {currentProfile.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E9E0D6] z-50 p-2 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 bg-[#FFF9F2] rounded-xl mb-2 border border-[#E9E0D6]">
                    <div className="font-bold text-[#1C1917] text-sm">{currentProfile.name}</div>
                    <div className="text-[11px] text-[#78716C] capitalize mt-0.5 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                      <span>Role: {currentProfile.role}</span>
                    </div>
                    <div className="text-[10px] text-[#A8A29E] mt-1 truncate">
                      Outlet: {location.name}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsStaffPinOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-[#FFF1E6] text-[#1C1917] transition-colors"
                    >
                      <KeyRound className="w-4 h-4 text-[#F97316]" />
                      <div className="flex-1">
                        <div className="font-semibold">Switch Staff PIN</div>
                        <div className="text-[10px] text-[#78716C]">Change cashier for shifts</div>
                      </div>
                    </button>

                    <div className="border-t border-[#E9E0D6] my-1" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Persistent Cloud Offline Warning Banner */}
        <CloudOfflineBanner />
      </header>

      {/* Staff Fast PIN Switch Modal */}
      <StaffPinPadModal
        isOpen={isStaffPinOpen}
        onClose={() => setIsStaffPinOpen(false)}
      />
    </>
  );
};
