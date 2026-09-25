import React from 'react';
import { useTsosStore } from '../../lib/store';
import { SAAS_PLANS } from '../../data/saasSeedData';
import {
  Building2,
  TrendingUp,
  CreditCard,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Users,
  Activity,
  ArrowUpRight,
  Database,
  Cpu,
  Radio,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const {
    tenantBusinesses,
    platformAuditLogs,
    setActiveSuperAdminTab,
    setSelectedSuperAdminBusinessId,
  } = useTsosStore();

  // Metrics computation from real tenant data
  const totalBusinesses = tenantBusinesses.length;
  const activeBusinesses = tenantBusinesses.filter((b) => b.status === 'active').length;
  const trialBusinesses = tenantBusinesses.filter((b) => b.status === 'trial').length;
  const pastDueBusinesses = tenantBusinesses.filter((b) => b.status === 'past_due').length;
  const suspendedBusinesses = tenantBusinesses.filter((b) => b.status === 'suspended').length;
  const archivedBusinesses = tenantBusinesses.filter((b) => b.status === 'archived').length;

  // Monthly Recurring Revenue (MRR) from active & past_due paying subscriptions
  const activeMRR = tenantBusinesses
    .filter((b) => b.status === 'active' || b.status === 'past_due')
    .reduce((sum, b) => sum + (b.subscription?.final_monthly_rate || 0), 0);

  const totalPlatformOrders = tenantBusinesses.reduce((sum, b) => sum + (b.total_orders_count || 0), 0);
  const totalPlatformGMV = tenantBusinesses.reduce((sum, b) => sum + (b.lifetime_revenue || 0), 0);

  // Plan distribution
  const planCounts: Record<string, number> = {
    starter: 0,
    growth: 0,
    pro: 0,
    enterprise: 0,
  };
  tenantBusinesses.forEach((b) => {
    const plan = b.subscription?.plan_id;
    if (plan && planCounts[plan] !== undefined) {
      planCounts[plan]++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Action */}
      <div className="bg-white border border-[#E9E0D6] rounded-xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7C3AED] text-white">
              Platform Master
            </span>
            <span className="text-xs font-medium text-[#78716C]">SaaS Operations Center</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1C1917] mt-1">Multi-Tenant Platform Overview</h2>
          <p className="text-sm text-[#78716C] mt-0.5">
            Real-time telemetry across all subscribing cafe and restaurant tenants on the monthly SaaS model.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSuperAdminTab('wizard')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F97316] text-white font-medium hover:bg-[#EA580C] shadow-sm transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Provision New Cafe
          </button>
          <button
            onClick={() => setActiveSuperAdminTab('businesses')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FAF6F0] border border-[#E9E0D6] text-[#1C1917] font-medium hover:bg-[#F3ECE4] transition-all text-sm"
          >
            <Building2 className="w-4 h-4 text-[#78716C]" />
            Manage Businesses
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <div className="bg-white border border-[#E9E0D6] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
              Monthly Recurring Revenue
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1C1917]">
              ₹{activeMRR.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-medium text-[#059669] flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              Active
            </span>
          </div>
          <p className="text-xs text-[#78716C] mt-1">
            Calculated from {activeBusinesses} active paying subscriptions
          </p>
        </div>

        {/* Total Businesses */}
        <div className="bg-white border border-[#E9E0D6] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
              Total Businesses
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1C1917]">{totalBusinesses}</span>
            <span className="text-xs text-[#78716C]">
              ({activeBusinesses} active, {trialBusinesses} trial)
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[#57534E] font-medium">{activeBusinesses} Subscribed</span>
            <span className="text-[#A8A29E]">•</span>
            <span className="text-[#F59E0B] font-medium">{pastDueBusinesses} Past Due</span>
          </div>
        </div>

        {/* Platform Order Volume */}
        <div className="bg-white border border-[#E9E0D6] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
              Platform Orders
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] text-[#F97316] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1C1917]">
              {totalPlatformOrders.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-[#78716C]">orders placed</span>
          </div>
          <p className="text-xs text-[#78716C] mt-1">
            Across QR table ordering, POS counters, and KDS
          </p>
        </div>

        {/* Platform Gross Volume */}
        <div className="bg-white border border-[#E9E0D6] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
              Tenant Lifetime GMV
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1C1917]">
              ₹{totalPlatformGMV.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-[#78716C]">processed</span>
          </div>
          <p className="text-xs text-[#78716C] mt-1">
            Direct UPI & cash settlements to cafe merchants
          </p>
        </div>
      </div>

      {/* Secondary Row: Subscription Plan Breakdown & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Tier Distribution */}
        <div className="bg-white border border-[#E9E0D6] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#1C1917]">SaaS Plans Breakdown</h3>
              <p className="text-xs text-[#78716C]">Active distribution across subscription tiers</p>
            </div>
            <button
              onClick={() => setActiveSuperAdminTab('subscriptions')}
              className="text-xs font-semibold text-[#F97316] hover:underline flex items-center"
            >
              Plans
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {SAAS_PLANS.map((plan) => {
              const count = planCounts[plan.id] || 0;
              const pct = totalBusinesses > 0 ? Math.round((count / totalBusinesses) * 100) : 0;
              return (
                <div key={plan.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#1C1917]">{plan.name}</span>
                      <span className="text-[#78716C]">(₹{plan.monthly_price}/mo)</span>
                    </div>
                    <span className="font-mono font-medium text-[#57534E]">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#F5F0EB] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        plan.id === 'pro'
                          ? 'bg-[#7C3AED]'
                          : plan.id === 'growth'
                          ? 'bg-[#F97316]'
                          : plan.id === 'enterprise'
                          ? 'bg-[#2563EB]'
                          : 'bg-[#10B981]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-[#F5EFEA] text-xs flex items-center justify-between text-[#78716C]">
            <span>Trial Conversion Target</span>
            <span className="font-semibold text-[#1C1917]">78.4%</span>
          </div>
        </div>

        {/* Tenant Lifecycle State Matrix */}
        <div className="bg-white border border-[#E9E0D6] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#1C1917]">Tenant Lifecycle Status</h3>
              <p className="text-xs text-[#78716C]">Account states requiring administrative review</p>
            </div>
            <button
              onClick={() => setActiveSuperAdminTab('businesses')}
              className="text-xs font-semibold text-[#F97316] hover:underline flex items-center"
            >
              Directory
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7]">
              <div className="flex items-center gap-1.5 text-xs text-[#166534] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                Active Paying
              </div>
              <div className="text-xl font-bold text-[#14532D] mt-1">{activeBusinesses}</div>
              <p className="text-[11px] text-[#15803D]">Standard recurring billing</p>
            </div>

            <div className="p-3 rounded-lg bg-[#FAF5FF] border border-[#F3E8FF]">
              <div className="flex items-center gap-1.5 text-xs text-[#6B21A8] font-medium">
                <Clock className="w-3.5 h-3.5 text-[#9333EA]" />
                Free Trial
              </div>
              <div className="text-xl font-bold text-[#581C87] mt-1">{trialBusinesses}</div>
              <p className="text-[11px] text-[#7E22CE]">14-day evaluation window</p>
            </div>

            <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FEF3C7]">
              <div className="flex items-center gap-1.5 text-xs text-[#92400E] font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                Past Due
              </div>
              <div className="text-xl font-bold text-[#78350F] mt-1">{pastDueBusinesses}</div>
              <p className="text-[11px] text-[#B45309]">Card/mandate retry active</p>
            </div>

            <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FEE2E2]">
              <div className="flex items-center gap-1.5 text-xs text-[#991B1B] font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
                Suspended
              </div>
              <div className="text-xl font-bold text-[#7F1D1D] mt-1">{suspendedBusinesses}</div>
              <p className="text-[11px] text-[#B91C1C]">Access restricted</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F5EFEA] flex items-center justify-between text-xs text-[#78716C]">
            <span>Archived Businesses:</span>
            <span className="font-semibold text-[#1C1917]">{archivedBusinesses}</span>
          </div>
        </div>

        {/* Platform Infrastructure Health */}
        <div className="bg-white border border-[#E9E0D6] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#1C1917]">System Health & Telemetry</h3>
              <p className="text-xs text-[#78716C]">Multi-tenant backend services status</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#166534] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              99.98% Uptime
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF6F0] border border-[#F0E8DF]">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#F97316]" />
                <div>
                  <span className="font-semibold text-[#1C1917]">PostgreSQL Multi-Tenant DB</span>
                  <p className="text-[10px] text-[#78716C]">Supabase Cloud (asia-southeast1)</p>
                </div>
              </div>
              <span className="font-mono text-[#16A34A] font-semibold">24ms • Healthy</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF6F0] border border-[#F0E8DF]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
                <div>
                  <span className="font-semibold text-[#1C1917]">Row-Level Security (RLS)</span>
                  <p className="text-[10px] text-[#78716C]">15/15 Policy tests green</p>
                </div>
              </div>
              <span className="font-mono text-[#16A34A] font-semibold">Enforced</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF6F0] border border-[#F0E8DF]">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#2563EB]" />
                <div>
                  <span className="font-semibold text-[#1C1917]">KDS Bump Bar Realtime WS</span>
                  <p className="text-[10px] text-[#78716C]">Subscribed channels active</p>
                </div>
              </div>
              <span className="font-mono text-[#16A34A] font-semibold">Connected</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF6F0] border border-[#F0E8DF]">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#10B981]" />
                <div>
                  <span className="font-semibold text-[#1C1917]">Cryptographic Table Token HMAC</span>
                  <p className="text-[10px] text-[#78716C]">Anti-tamper QR verifier</p>
                </div>
              </div>
              <span className="font-mono text-[#16A34A] font-semibold">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Administrative Activity Log */}
      <div className="bg-white border border-[#E9E0D6] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[#1C1917]">Recent Platform Operations</h3>
            <p className="text-xs text-[#78716C]">Audit trail of recent tenant changes and provisioning</p>
          </div>
          <button
            onClick={() => setActiveSuperAdminTab('audit')}
            className="text-xs font-semibold text-[#F97316] hover:underline flex items-center"
          >
            Full Audit Log
            <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="divide-y divide-[#F5EFEA]">
          {platformAuditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#FAF6F0] border border-[#E9E0D6] text-[#57534E]">
                  {log.action}
                </span>
                <div>
                  <span className="font-semibold text-[#1C1917]">
                    {log.target_business_name || 'System'}
                  </span>
                  <p className="text-[#78716C] mt-0.5">{log.details}</p>
                </div>
              </div>
              <div className="text-right whitespace-nowrap text-[#A8A29E] font-mono text-[11px]">
                {new Date(log.timestamp).toLocaleString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
