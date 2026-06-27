import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Order, Product } from "@oja/shared";
import { DateRangePicker } from "./DateRangePicker";

interface DashboardChartsProps {
  orders: Order[];
  products: Product[];
  viewMode?: "landscape" | "portrait";
}

// Custom Tooltip component for on-brand Oja aesthetic
const CustomTooltip = ({ active, payload, label, prefix = "₦" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-4 border-[#0B3014] p-3 rounded-xl shadow-[4px_4px_0px_0px_#FF4D00] text-xs font-sans">
        <p className="font-black text-[#0B3014] uppercase tracking-wide mb-1 border-b border-[#0B3014]/15 pb-1">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="font-extrabold flex items-center gap-1.5" style={{ color: entry.color || "#0B3014" }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500 uppercase text-[9px] font-bold">{entry.name}:</span>
            <span>{prefix}{Number(entry.value).toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Safe date parsing helper for marketplace format (e.g. "June 25, 2026")
const parseOrderDate = (dateStr: string): Date => {
  try {
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) {
      return new Date(parsed);
    }
  } catch (e) {}
  return new Date("2026-06-27");
};

// Generates an on-brand, realistic baseline sales metric for any custom calendar date
const getBaselineSaleForDate = (date: Date): number => {
  const formatted = `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()]} ${date.getDate()}`;
  const presets: Record<string, number> = {
    "Jun 21": 45000,
    "Jun 22": 72000,
    "Jun 23": 58000,
    "Jun 24": 95000,
    "Jun 25": 112000,
    "Jun 26": 89000,
    "Jun 27": 125000,
  };
  if (presets[formatted] !== undefined) {
    return presets[formatted];
  }
  // Stable deterministic function based on calendar day to simulate organic trade
  const day = date.getDate();
  const monthMultiplier = date.getMonth() + 1;
  return 42000 + ((day * 7 + monthMultiplier * 31) % 9) * 11500;
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  orders,
  products,
  viewMode = "landscape",
}) => {
  // Local state for filtered date range (default to 7 days, Jun 21 - Jun 27, 2026)
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const end = new Date("2026-06-27T23:59:59");
    const start = new Date("2026-06-21T00:00:00");
    return { start, end };
  });

  const handleRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  // 1. Process Daily Revenue Data Dynamically for Selected Range
  const revenueData = useMemo(() => {
    const datesList: Date[] = [];
    let curr = new Date(dateRange.start);
    
    // Safety cap to prevent browser locks on infinite loops
    let limit = 0;
    while (curr <= dateRange.end && limit < 45) {
      datesList.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
      limit++;
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const aggregate: Record<string, { label: string; dateStr: string; Revenue: number }> = {};
    
    // Seed baseline sales for each day in range
    datesList.forEach((date) => {
      const monthStr = months[date.getMonth()];
      const dayVal = date.getDate();
      const label = `${monthStr} ${dayVal}`;
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      
      aggregate[dateStr] = {
        label,
        dateStr,
        Revenue: getBaselineSaleForDate(date),
      };
    });

    // Layer real orders on top of baseline if they fall inside the selected date ranges
    orders.forEach((order) => {
      if (order.status !== "Cancelled") {
        const oDate = parseOrderDate(order.date);
        const oDateStr = `${oDate.getFullYear()}-${String(oDate.getMonth() + 1).padStart(2, "0")}-${String(oDate.getDate()).padStart(2, "0")}`;
        
        if (aggregate[oDateStr]) {
          aggregate[oDateStr].Revenue += order.total;
        }
      }
    });

    return Object.values(aggregate).map((item) => ({
      name: item.label,
      Revenue: item.Revenue,
    }));
  }, [orders, dateRange]);

  // 2. Process Top Selling Products Dynamically for Selected Range
  const topProductsData = useMemo(() => {
    const productSales: Record<string, { name: string; Sales: number }> = {};

    // Get number of days selected for proportional baseline scale
    const startMidnight = new Date(dateRange.start.getFullYear(), dateRange.start.getMonth(), dateRange.start.getDate());
    const endMidnight = new Date(dateRange.end.getFullYear(), dateRange.end.getMonth(), dateRange.end.getDate());
    const diffTime = Math.abs(endMidnight.getTime() - startMidnight.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    
    // Scale standard 7-day baseline proportionally
    const scaleFactor = diffDays / 7;

    const baselineProducts = [
      { id: "organic-habanero", name: "Habanero Peppers", Sales: Math.round(165000 * scaleFactor) },
      { id: "premium-puna-yams", name: "Premium Puna Yams", Sales: Math.round(240000 * scaleFactor) },
      { id: "sweet-potatoes", name: "Irish Potatoes", Sales: Math.round(120000 * scaleFactor) },
      { id: "vine-rip-tomatoes", name: "Vine Tomatoes", Sales: Math.round(195000 * scaleFactor) },
      { id: "fresh-spinach", name: "Fresh Spinach", Sales: Math.round(85000 * scaleFactor) },
    ];

    baselineProducts.forEach((item) => {
      productSales[item.id] = { name: item.name, Sales: item.Sales };
    });

    // Add actual order checkout weights if order date matches selection range
    orders.forEach((order) => {
      if (order.status !== "Cancelled" && order.items) {
        const oDate = parseOrderDate(order.date);
        const oTime = new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate()).getTime();
        const sTime = startMidnight.getTime();
        const eTime = endMidnight.getTime();

        if (oTime >= sTime && oTime <= eTime) {
          order.items.forEach((item) => {
            if (item.product) {
              const pId = item.product.id;
              const pName = item.product.name || "Produce Item";
              const saleAmount = (item.product.price || 0) * (item.quantity || 1);
              
              if (productSales[pId]) {
                productSales[pId].Sales += saleAmount;
              } else {
                productSales[pId] = { name: pName.substring(0, 15), Sales: saleAmount };
              }
            }
          });
        }
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.Sales - a.Sales)
      .slice(0, 5);
  }, [orders, dateRange]);

  const isPortrait = viewMode === "portrait";

  // Formatted date string for user info
  const formattedRangeText = useMemo(() => {
    const formatStr = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${formatStr(dateRange.start)} - ${formatStr(dateRange.end)}`;
  }, [dateRange]);

  return (
    <div className="space-y-6">
      {/* 1. Integrated Date Range Filter Component */}
      <DateRangePicker onRangeChange={handleRangeChange} />

      {/* Dynamic Summary Stats Bar */}
      <div className="bg-[#0B3014] text-white p-4 rounded-xl border-2 border-[#0B3014] flex flex-wrap items-center justify-between gap-4 shadow-[2px_2px_0px_0px_#FF4D00]">
        <div className="text-xs">
          <p className="text-[10px] uppercase text-white/60 font-bold">Active Filter Period</p>
          <p className="font-black text-sm tracking-tight text-[#FF4D00]">{formattedRangeText}</p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[9px] uppercase text-white/60 font-bold">In-Range Revenue</p>
            <p className="font-black text-sm">
              ₦{revenueData.reduce((acc, curr) => acc + curr.Revenue, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase text-white/60 font-bold">Unique Crop Sales</p>
            <p className="font-black text-sm">
              ₦{topProductsData.reduce((acc, curr) => acc + curr.Sales, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Double Interactive Grid Charts */}
      <div className={`grid gap-6 ${isPortrait ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
        {/* Daily Revenue Chart Card */}
        <div className="bg-white p-5 rounded-2xl border-4 border-[#0B3014] shadow-[6px_6px_0px_0px_#0B3014] flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-black uppercase text-[#0B3014] tracking-wider">
                  Daily Revenue Flow
                </h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                  Aggregate daily marketplace checkout volume
                </p>
              </div>
              <span className="text-[9px] bg-emerald-50 text-emerald-800 font-black px-2 py-0.5 rounded border border-emerald-200 uppercase">
                Revenue
              </span>
            </div>
          </div>

          <div className="h-64 w-full bg-[#F5F5F0]/30 rounded-xl p-2 border border-slate-100 relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#0B3014", fontSize: 9, fontWeight: "bold" }}
                  axisLine={{ stroke: "#0B3014", strokeWidth: 1.5 }}
                  tickLine={{ stroke: "#0B3014" }}
                />
                <YAxis
                  tickFormatter={(value) => `₦${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                  tick={{ fill: "#0B3014", fontSize: 9, fontWeight: "bold" }}
                  axisLine={{ stroke: "#0B3014", strokeWidth: 1.5 }}
                  tickLine={{ stroke: "#0B3014" }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#0B3014", strokeWidth: 1 }} />
                <Legend
                  wrapperStyle={{ fontSize: 9, fontWeight: "bold", textTransform: "uppercase" }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="Revenue"
                  name="Gross Income"
                  stroke="#FF4D00"
                  strokeWidth={3.5}
                  activeDot={{ r: 6, stroke: "#0B3014", strokeWidth: 2 }}
                  dot={{ stroke: "#FF4D00", strokeWidth: 2, r: 3, fill: "white" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Bar Chart Card */}
        <div className="bg-white p-5 rounded-2xl border-4 border-[#0B3014] shadow-[6px_6px_0px_0px_#0B3014] flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-black uppercase text-[#0B3014] tracking-wider">
                  Top Performing Crops
                </h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                  Highest grossing farm produce releases
                </p>
              </div>
              <span className="text-[9px] bg-amber-50 text-amber-800 font-black px-2 py-0.5 rounded border border-amber-200 uppercase">
                Volume
              </span>
            </div>
          </div>

          <div className="h-64 w-full bg-[#F5F5F0]/30 rounded-xl p-2 border border-slate-100 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#0B3014", fontSize: 8, fontWeight: "bold" }}
                  axisLine={{ stroke: "#0B3014", strokeWidth: 1.5 }}
                  tickLine={{ stroke: "#0B3014" }}
                />
                <YAxis
                  tickFormatter={(value) => `₦${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                  tick={{ fill: "#0B3014", fontSize: 9, fontWeight: "bold" }}
                  axisLine={{ stroke: "#0B3014", strokeWidth: 1.5 }}
                  tickLine={{ stroke: "#0B3014" }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(11,48,20,0.03)" }} />
                <Legend
                  wrapperStyle={{ fontSize: 9, fontWeight: "bold", textTransform: "uppercase" }}
                  iconType="rect"
                />
                <Bar
                  dataKey="Sales"
                  name="Sales Volume"
                  fill="#0B3014"
                  stroke="#FF4D00"
                  strokeWidth={2}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
