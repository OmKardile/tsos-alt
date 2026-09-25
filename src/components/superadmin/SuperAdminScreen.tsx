import React from 'react';
import { useTsosStore } from '../../lib/store';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { BusinessDirectory } from './BusinessDirectory';
import { ProvisioningWizard } from './ProvisioningWizard';
import { SubscriptionsManager } from './SubscriptionsManager';
import { AuditLogViewer } from './AuditLogViewer';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  Store,
  ExternalLink,
  ChevronRight,
  Database,
  ArrowLeftRight,
} from 'lucide-react';

export const SuperAdminScreen: React.FC = () => {
  const {
    activeSuperAdminTab,
    setActiveSuperAdminTab,
    setActiveSurface,
    tenantBusinesses,
    platformAuditLogs,
  } = useTsosStore();

  const tabs = [
    { id: 'dashboard' as const, label: 'Platform Dashboard', icon: LayoutDashboard },
    { id: 'businesses' as const, label: `Businesses (${tenantBusinesses.length})`, icon: Building2 },
    { id: 'wizard' as const, label: 'Provisioning Wizard', icon: PlusCircle, highlight: true },
    { id: 'subscriptions' as const, label: 'Subscriptions & Deals', icon: CreditCard },
    { id: 'audit' as const, label: `Audit Trail (${platformAuditLogs.length})`, icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EE] flex flex-col font-sans">
      {/* SuperAdmin Top Platform Header */}
      <header className="bg-[#1C1917] text-white border-b border-[#292524] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Platform Identity */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center font-black text-white text-base shadow-sm">
                TS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight">
                    TableSide Platform OS
                  </span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-extrabold bg-[#7C3AED] text-white uppercase tracking-wider">
                    SuperAdmin
                  </span>
                </div>
                <div className="text-[10px] text-[#A8A29E] flex items-center gap-1.5">
                  <span>Multi-Tenant SaaS Control Center</span>
                  <span>•</span>
                  <span className="font-mono text-[#4ADE80] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                    Supabase Production RLS Active
                  </span>
                </div>
              </div>
            </div>

            {/* Center / Right: Operator Context & Switcher */}
            <div className="flex items-center gap-3">
              {/* Operator info */}
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-xs font-semibold text-white">superadmin@tablesideordering.com</span>
                <span className="text-[10px] text-[#A8A29E]">Platform Master Operator</span>
              </div>

              <div className="h-6 w-px bg-[#44403C] hidden md:block" />

              {/* Surface Switch Back to Cafe Owner View */}
              <button
                onClick={() => setActiveSurface('web')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#292524] hover:bg-[#383330] text-xs font-semibold text-[#FAF6F0] transition-colors border border-[#44403C]"
              >
                <Store className="w-3.5 h-3.5 text-[#F97316]" />
                <span className="hidden sm:inline">Switch to Cafe View</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
              </button>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-[#292524] scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSuperAdminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSuperAdminTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#1C1917] shadow-xs'
                      : tab.highlight
                      ? 'text-[#F97316] hover:bg-[#292524]'
                      : 'text-[#A8A29E] hover:text-white hover:bg-[#292524]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F97316]' : tab.highlight ? 'text-[#F97316]' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeSuperAdminTab === 'dashboard' && <SuperAdminDashboard />}
        {activeSuperAdminTab === 'businesses' && <BusinessDirectory />}
        {activeSuperAdminTab === 'wizard' && <ProvisioningWizard />}
        {activeSuperAdminTab === 'subscriptions' && <SubscriptionsManager />}
        {activeSuperAdminTab === 'audit' && <AuditLogViewer />}
      </main>

      {/* Platform Status Footer */}
      <footer className="bg-white border-t border-[#E9E0D6] py-3 text-xs text-[#78716C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1C1917]">TableSide SaaS Multi-Tenant Platform</span>
            <span>•</span>
            <span>v2.0.0 Enterprise SaaS</span>
            <span>•</span>
            <span className="text-[#16A34A] font-medium">PostgreSQL Isolation Active</span>
          </div>
          <div className="text-[11px] text-[#A8A29E]">
            Zero Client Trust Enforced • Cryptographic Table HMAC Tokens Active
          </div>
        </div>
      </footer>
    </div>
  );
};
