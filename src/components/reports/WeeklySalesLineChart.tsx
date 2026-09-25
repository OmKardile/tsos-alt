import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import { Order } from '../../types';
import {
  TrendingUp,
  Calendar,
  IndianRupee,
  ShoppingBag,
  ArrowUpRight,
  Sparkles,
  Info,
} from 'lucide-react';

interface WeeklySalesLineChartProps {
  orders: Order[];
}

interface DayDataPoint {
  dayName: string;
  dayShort: string;
  dateStr: string;
  displayDate: string;
  revenue: number;
  ordersCount: number;
  avgTicket: number;
  isToday: boolean;
  isFuture: boolean;
}

export const WeeklySalesLineChart: React.FC<WeeklySalesLineChartProps> = ({ orders }) => {
  const [viewMetric, setViewMetric] = useState<'revenue' | 'orders' | 'dual'>('revenue');

  // Compute the 7 days of the current week (Monday through Sunday)
  const { weekData, weeklyTotal, dailyAvg, peakDay, totalWeekOrders } = useMemo(() => {
    const now = new Date();
    // Monday = 0, ..., Sunday = 6
    const currentDayOfWeek = (now.getDay() + 6) % 7;

    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDayOfWeek);
    monday.setHours(0, 0, 0, 0);

    const safeOrders = (orders || []).filter((o) => o && o.status !== 'cancelled');

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayShorts = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const data: DayDataPoint[] = [];
    let weekSum = 0;
    let weekOrders = 0;
    let maxRev = -1;
    let bestDayName = 'Friday';

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);

      const year = dayDate.getFullYear();
      const month = String(dayDate.getMonth() + 1).padStart(2, '0');
      const dayNum = String(dayDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${dayNum}`;

      const isToday = i === currentDayOfWeek;
      const isFuture = i > currentDayOfWeek;

      // Filter orders placed on this calendar date
      const daysOrders = safeOrders.filter((o) => {
        if (!o.created_at) return false;
        const oDate = new Date(o.created_at);
        const oYear = oDate.getFullYear();
        const oMonth = String(oDate.getMonth() + 1).padStart(2, '0');
        const oDay = String(oDate.getDate()).padStart(2, '0');
        return `${oYear}-${oMonth}-${oDay}` === dateKey;
      });

      const dayRevenue = daysOrders.reduce((acc, o) => acc + (o.grand_total || 0), 0);
      const ordersCount = daysOrders.length;
      const avgTicket = ordersCount > 0 ? Math.round(dayRevenue / ordersCount) : 0;

      if (!isFuture) {
        weekSum += dayRevenue;
        weekOrders += ordersCount;
        if (dayRevenue > maxRev) {
          maxRev = dayRevenue;
          bestDayName = dayNames[i];
        }
      }

      data.push({
        dayName: dayNames[i],
        dayShort: `${dayShorts[i]} ${dayDate.getDate()}`,
        dateStr: dateKey,
        displayDate: dayDate.toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          weekday: 'short',
        }),
        revenue: Math.round(dayRevenue),
        ordersCount,
        avgTicket,
        isToday,
        isFuture,
      });
    }

    const activeDaysCount = Math.max(1, currentDayOfWeek + 1);
    const calculatedAvg = Math.round(weekSum / activeDaysCount);

    return {
      weekData: data,
      weeklyTotal: weekSum,
      dailyAvg: calculatedAvg,
      peakDay: `${bestDayName} (₹${Math.max(0, maxRev).toLocaleString()})`,
      totalWeekOrders: weekOrders,
    };
  }, [orders]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DayDataPoint = payload[0].payload;
      return (
        <div className="bg-[#1C1917] text-white p-3.5 rounded-xl shadow-xl border border-[#44403C] text-xs space-y-2 min-w-[190px]">
          <div className="flex items-center justify-between border-b border-[#44403C] pb-1.5">
            <span className="font-bold text-sm text-[#FFF9F2]">{data.displayDate}</span>
            {data.isToday && (
              <span className="bg-[#F97316] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Today
              </span>
            )}
            {data.isFuture && (
              <span className="bg-[#57534E] text-[#D6D3D1] text-[10px] px-1.5 py-0.5 rounded-full">
                Upcoming
              </span>
            )}
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[#A8A29E] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F97316]" />
                Daily Sales Revenue:
              </span>
              <span className="font-mono font-bold text-[#F97316] text-sm">
                ₹{data.revenue.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#A8A29E] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                Orders Placed:
              </span>
              <span className="font-mono font-semibold text-white">
                {data.ordersCount} orders
              </span>
            </div>

            {data.ordersCount > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-[#292524] text-[11px]">
                <span className="text-[#A8A29E]">Avg Ticket Size:</span>
                <span className="font-mono text-[#E7E5E4]">₹{data.avgTicket} / bill</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#E9E0D6] shadow-xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F5F0EB]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFF1E6] text-[#F97316] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#1C1917]">
              Current Week Daily Sales & Revenue Trend
            </h3>
          </div>
          <p className="text-xs text-[#57534E] mt-0.5 ml-9">
            Day-by-day gross sales curve (Monday to Sunday) with daily averages
          </p>
        </div>

        {/* Metric Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#F5F0EB] p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setViewMetric('revenue')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMetric === 'revenue'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            Revenue (₹)
          </button>
          <button
            onClick={() => setViewMetric('orders')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMetric === 'orders'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            Order Volume
          </button>
          <button
            onClick={() => setViewMetric('dual')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMetric === 'dual'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            Dual Trend
          </button>
        </div>
      </div>

      {/* Metric Highlights Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#FFFDF9] p-3.5 rounded-xl border border-[#E9E0D6]">
        <div className="space-y-0.5">
          <div className="text-[11px] text-[#57534E] flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#F97316]" />
            <span>Week-to-Date Gross</span>
          </div>
          <div className="text-lg font-bold font-mono text-[#1C1917]">
            ₹{weeklyTotal.toLocaleString()}
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-[11px] text-[#57534E] flex items-center gap-1">
            <IndianRupee className="w-3 h-3 text-[#17803D]" />
            <span>Daily Average</span>
          </div>
          <div className="text-lg font-bold font-mono text-[#1C1917]">
            ₹{dailyAvg.toLocaleString()} <span className="text-[10px] text-[#78716C]">/ day</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-[11px] text-[#57534E] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#B45309]" />
            <span>Peak Day</span>
          </div>
          <div className="text-sm font-bold font-mono text-[#B45309] truncate">
            {peakDay}
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-[11px] text-[#57534E] flex items-center gap-1">
            <ShoppingBag className="w-3 h-3 text-[#0284C7]" />
            <span>Total Orders</span>
          </div>
          <div className="text-lg font-bold font-mono text-[#0284C7]">
            {totalWeekOrders} <span className="text-[10px] text-[#78716C]">placed</span>
          </div>
        </div>
      </div>

      {/* Recharts Line Chart */}
      <div className="w-full h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weekData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DF" vertical={false} />
            <XAxis
              dataKey="dayShort"
              tick={{ fill: '#57534E', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#E9E0D6' }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: '#57534E', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#E9E0D6' }}
              tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
            />
            {(viewMetric === 'orders' || viewMetric === 'dual') && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#0284C7', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#BAE6FD' }}
                allowDecimals={false}
              />
            )}

            <Tooltip content={<CustomTooltip />} />

            {/* Reference Line for Daily Average */}
            {viewMetric !== 'orders' && dailyAvg > 0 && (
              <ReferenceLine
                yAxisId="left"
                y={dailyAvg}
                stroke="#F97316"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
                label={{
                  value: `Daily Avg: ₹${dailyAvg}`,
                  position: 'insideTopRight',
                  fill: '#F97316',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}

            {/* Revenue Line */}
            {(viewMetric === 'revenue' || viewMetric === 'dual') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Daily Sales (₹)"
                stroke="#F97316"
                strokeWidth={3}
                dot={{ r: 4, fill: '#F97316', stroke: '#FFFFFF', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#F97316', stroke: '#FFF1E6', strokeWidth: 3 }}
              />
            )}

            {/* Orders Line */}
            {(viewMetric === 'orders' || viewMetric === 'dual') && (
              <Line
                yAxisId={viewMetric === 'dual' ? 'right' : 'left'}
                type="monotone"
                dataKey="ordersCount"
                name="Order Count"
                stroke="#0284C7"
                strokeWidth={2.5}
                strokeDasharray={viewMetric === 'dual' ? '5 5' : undefined}
                dot={{ r: 4, fill: '#0284C7', stroke: '#FFFFFF', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#0284C7', stroke: '#E0F2FE', strokeWidth: 3 }}
              />
            )}

            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: 10, fontSize: 12, color: '#57534E' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Insight */}
      <div className="flex items-center justify-between text-xs text-[#57534E] bg-[#FFF9F2] p-2.5 rounded-xl border border-[#E9E0D6]">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
          <span>
            Real-time synchronization: Any new order checked out in POS or QR storefront instantly updates today's sales data.
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#17803D] font-semibold shrink-0 ml-2">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>7-Day Cycle Active</span>
        </div>
      </div>
    </div>
  );
};
