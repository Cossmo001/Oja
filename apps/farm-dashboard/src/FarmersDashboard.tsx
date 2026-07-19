import React, { useState, useEffect } from "react";
import { Product, Order, User } from "@oja/shared";

interface FarmersDashboardProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  orders: Order[];
  user: User;
  onScreenChange: (screen: string) => void;
}

interface HarvestBatch {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  stockLeft: number;
  pesticideRating: string; // e.g. "0.00 ppm"
  soilMoisture: string; // e.g. "42%"
  status: "Active Listing" | "Awaiting Pickup" | "Archived";
  harvestedTimeAgo: string;
}

interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "Payout" | "Subsidy Credit" | "Deduction";
  status: "Settled" | "Processing";
}

export const FarmersDashboard: React.FC<FarmersDashboardProps> = ({
  products,
  onUpdateProducts,
  orders,
  user,
  onScreenChange,
}) => {
  const [activeTab, setActiveTab] = useState<"harvests" | "pickups" | "compliance" | "finance">("harvests");
  const [dashboardViewMode, setDashboardViewMode] = useState<"landscape" | "portrait">("landscape");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setDashboardViewMode("portrait");
      } else {
        setDashboardViewMode("landscape");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter products that belong to Segun Alao's source "Jos Highlands Farms" or "Jos Highlands Farm"
  const farmerSourceName = "Jos Highlands Farms";
  
  // Local list of detailed harvest batches with agricultural compliance info
  const [farmerBatches, setFarmerBatches] = useState<HarvestBatch[]>([
    {
      id: "vine-tomatoes-500g",
      name: "Vine-Ripened Tomatoes",
      category: "vegetables",
      price: 2400,
      unit: "500g Pack",
      stockLeft: 45,
      pesticideRating: "0.00 ppm (Organic PASS)",
      soilMoisture: "38% Soil Wetness",
      status: "Active Listing",
      harvestedTimeAgo: "Harvested 4h ago"
    },
    {
      id: "hybrid-vine-tomatoes",
      name: "Hybrid Vine Tomatoes",
      category: "vegetables",
      price: 3500,
      unit: "Large Basket",
      stockLeft: 18,
      pesticideRating: "0.01 ppm (PASS)",
      soilMoisture: "41% Soil Wetness",
      status: "Active Listing",
      harvestedTimeAgo: "Harvested 12h ago"
    },
    {
      id: "potatoes-jos-batch",
      name: "Jos Highlands Sweet Irish Potatoes",
      category: "organic",
      price: 3200,
      unit: "per 2kg bag",
      stockLeft: 60,
      pesticideRating: "0.00 ppm (Organic PASS)",
      soilMoisture: "35% Soil Wetness",
      status: "Awaiting Pickup",
      harvestedTimeAgo: "Harvested 1d ago"
    }
  ]);

  // Financial transactions ledger state
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([
    { id: "TXN-9021", date: "June 25, 2026", description: "Completed Tomato Batch #FJ-7023 Direct Deposit", amount: 145000, type: "Payout", status: "Settled" },
    { id: "TXN-9014", date: "June 18, 2026", description: "Oja-subsidized Organic Seed Voucher credit", amount: 25000, type: "Subsidy Credit", status: "Settled" },
    { id: "TXN-8982", date: "June 11, 2026", description: "Vegetables Batch Delivery #FJ-6910 Payout", amount: 100000, type: "Payout", status: "Settled" },
    { id: "TXN-8950", date: "June 04, 2026", description: "Logistics transit temperature offset correction", amount: -5000, type: "Deduction", status: "Settled" },
  ]);

  // New Harvest Uploader form
  const [showAddHarvestModal, setShowAddHarvestModal] = useState(false);
  const [newHarvest, setNewHarvest] = useState({
    name: "",
    category: "vegetables",
    price: "",
    unit: "per kg",
    qty: "50",
    pesticide: "0.00 ppm",
    moisture: "40%",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400"
  });

  // Compliance uploads status
  const [soilCertUploaded, setSoilCertUploaded] = useState(true);
  const [pesticideReportUploaded, setPesticideReportUploaded] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle uploader submission
  const handleUploadHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHarvest.name || !newHarvest.price) return;

    const newBatchId = `farmer-prod-${Date.now()}`;
    const priceNum = Number(newHarvest.price);

    // 1. Add to farmer's local list
    const newBatch: HarvestBatch = {
      id: newBatchId,
      name: newHarvest.name,
      category: newHarvest.category,
      price: priceNum,
      unit: newHarvest.unit,
      stockLeft: Number(newHarvest.qty),
      pesticideRating: `${newHarvest.pesticide} (PASS)`,
      soilMoisture: `${newHarvest.moisture} Soil Wetness`,
      status: "Active Listing",
      harvestedTimeAgo: "Harvested Just Now"
    };
    setFarmerBatches([newBatch, ...farmerBatches]);

    // 2. Publish to the global products list so shoppers can buy it!
    const newGlobalProduct: Product = {
      id: newBatchId,
      name: newHarvest.name,
      description: `Grown locally in mineral-rich soil. Tested for residue compliance. Sourced directly from ${farmerSourceName}.`,
      price: priceNum,
      unit: newHarvest.unit,
      image: newHarvest.image,
      category: newHarvest.category as any,
      rating: 5.0,
      numReviews: 0,
      isOjaCertified: true,
      isHandledByOja: true,
      isFarmDirect: true,
      harvestedTimeAgo: "Harvested Just Now",
      farmSource: farmerSourceName,
      inStock: true,
      stockLeft: Number(newHarvest.qty)
    };
    onUpdateProducts([newGlobalProduct, ...products]);

    // Clean up
    setShowAddHarvestModal(false);
    setNewHarvest({
      name: "",
      category: "vegetables",
      price: "",
      unit: "per kg",
      qty: "50",
      pesticide: "0.00 ppm",
      moisture: "40%",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400"
    });

    setSuccessMessage("Harvest batch successfully published to the Oja marketplace!");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Quick action: request immediate pickup dispatch
  const handleRequestPickup = (batchId: string) => {
    setFarmerBatches(farmerBatches.map(b => b.id === batchId ? { ...b, status: "Awaiting Pickup" } : b));
    setSuccessMessage("Logistics team notified! Oja Transit Van pickup scheduled.");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Financial payout totals
  const totalPayoutReceived = transactions
    .filter(t => t.type === "Payout" && t.status === "Settled")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingPayoutBalance = 45000;

  const tabs = [
    { id: "harvests", name: "My Harvest Batches", icon: "agriculture", title: "My Active Harvest Releases", subtitle: "Upload daily harvests, check residual compliance scores, or schedule logistics." },
    { id: "pickups", name: "Cold Logistics Pickups", icon: "hvac", title: "My Scheduled Pickups & Transit", subtitle: "Track Oja's refrigerated logistics dispatch trucks arriving at your farm." },
    { id: "compliance", name: "Organic Auditing & Soil", icon: "clinical_trial", title: "Agricultural Audits & Compliance", subtitle: "Submit weekly soil PH levels, pesticide residual audit charts, and organic declarations." },
    { id: "finance", name: "My Financial Ledger", icon: "account_balance_wallet", title: "Payouts Ledger & Invoices", subtitle: "Monitor direct deposit payouts, subsidies, and logistical corrections." },
  ];

  const activeTabInfo = tabs.find(t => t.id === activeTab) || tabs[0];

  const renderTabContents = () => {
    switch (activeTab) {
      case "harvests":
        return (
          <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Harvest Records</h3>
              <button
                onClick={() => setShowAddHarvestModal(true)}
                className="bg-[#8f4e00] hover:bg-[#8f4e00]/90 text-white px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm font-bold">upload_file</span>
                Register Fresh Harvest
              </button>
            </div>

            {/* Grid of harvest batches */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {farmerBatches.map((batch) => (
                <div key={batch.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] bg-[#00450d]/10 text-[#00450d] font-bold uppercase px-2 py-0.5 rounded">
                          {batch.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-800 mt-2">{batch.name}</h3>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        batch.status === "Active Listing"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {batch.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-sans text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[8px] tracking-wider">BATCH SIZE</p>
                        <p className="font-extrabold text-[#00450d] mt-0.5 text-xs">{batch.stockLeft} {batch.unit.split(" ")[1] || "Units"}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[8px] tracking-wider">PRICE RATE</p>
                        <p className="font-extrabold text-[#00450d] mt-0.5 text-xs">₦{batch.price.toLocaleString()} / {batch.unit.split(" ")[0] || "unit"}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                        <span className="font-bold text-slate-400 uppercase text-[8px]">Pesticide Residue</span>
                        <span className="text-emerald-800 font-bold text-[9.5px]">{batch.pesticideRating}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                        <span className="font-bold text-slate-400 uppercase text-[8px]">Soil Moisture</span>
                        <span className="text-[#00450d] font-bold text-[9.5px]">{batch.soilMoisture}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
                    {batch.status === "Active Listing" ? (
                      <button
                        onClick={() => handleRequestPickup(batch.id)}
                        className="w-full bg-[#00450d] hover:bg-[#8f4e00] text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider text-center transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-xs">hvac</span>
                        Request Pickup
                      </button>
                    ) : (
                      <span className="w-full text-center text-[9px] font-bold uppercase text-amber-600 bg-amber-50 border border-amber-100 py-2 rounded-xl flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Oja Transit Vehicle Booked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "pickups":
        return (
          <div className="space-y-6 fade-in">
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-3 gap-2 border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Logistics Assignment: Oja-Van-4</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Plate: LAG-743-A • Cargo Setpoint: +4.0°C</p>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
                  ETA: 45 Mins Away
                </span>
              </div>

              {/* Transit Map overlay */}
              <div className="relative h-56 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBO6srMRPmNqeKBZ1vk0m0YGKEYdk2aVIumc-z-jipZzAq20K6Lrllw6k24Z4-HMAwd1H4ckuDx6xpsw9E_NDoteT9F2LnrTcLDYgejtBC_fv8ICqa-KjE_v3LY7h2O8Q7D0hxvJ-CnH0imzCbPDCFgdadLQfKi976R-mukgLMOsboEiieslaUxGwM1jOmayuJQ4KZ2gNJx7fb7-QwRWogK5SBTlZPbHJZg_JC_Y8NHpPvKoxOEUh-VMDIXy6Wx-Pgah6VzZ6F9x6A"
                  alt="Farm pickup live map track"
                  className="w-full h-full object-cover opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-1/3 left-1/2 w-8 h-8 bg-[#8f4e00] border-2 border-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <span className="material-symbols-outlined text-[14px] text-white font-bold">local_shipping</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 pt-2 text-[11px]">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="font-bold text-slate-400 uppercase text-[8px] tracking-wider">DIAL-IN TEMPERATURE</p>
                  <p className="font-bold text-[#00450d] mt-0.5 text-xs">+3.9°C (Stable)</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="font-bold text-slate-400 uppercase text-[8px] tracking-wider">SECURITY DISPATCH SEAL</p>
                  <p className="font-bold text-[#00450d] mt-0.5 text-xs font-mono uppercase">OJA-4012-SEAL</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="font-bold text-slate-400 uppercase text-[8px] tracking-wider">PICKUP BATCH WEIGHT</p>
                  <p className="font-bold text-[#00450d] mt-0.5 text-xs">120kg Combined</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "compliance":
        return (
          <div className="space-y-6 fade-in max-w-2xl">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6">
              <div className="border-b pb-3 border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Oja Certified Standards Verification</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/50 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold uppercase text-slate-800">Weekly Soil PH Levels</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        soilCertUploaded ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-[#ba1a1a] border-rose-200"
                      }`}>{soilCertUploaded ? "PASS (6.8 PH)" : "Pending Upload"}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">Standard range required: 6.0 PH to 7.5 PH for organic root tubers and leafy crops.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSoilCertUploaded(true);
                      alert("Weekly Soil PH verification document uploaded! Verifying...");
                    }}
                    className="mt-4 w-full bg-white hover:bg-slate-50 text-[#00450d] border border-slate-200 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider text-center transition-all active:scale-95"
                  >
                    Upload Document
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/50 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold uppercase text-slate-800">Pesticide Residue PPM Cert</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        pesticideReportUploaded ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-[#ba1a1a] border-rose-200"
                      }`}>{pesticideReportUploaded ? "PASS (0.00 PPM)" : "Pending Upload"}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">Standard: Peak pesticide residues must be strictly below 0.05 ppm threshold.</p>
                  </div>
                  <button
                    onClick={() => {
                      setPesticideReportUploaded(true);
                      alert("Pesticide Residual lab results uploaded. Under verification.");
                    }}
                    className="mt-4 w-full bg-white hover:bg-slate-50 text-[#00450d] border border-slate-200 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider text-center transition-all active:scale-95"
                  >
                    Upload Lab Results
                  </button>
                </div>
              </div>

              <div className="bg-[#00450d] text-white p-4 rounded-xl flex items-start gap-3 border border-[#8f4e00] shadow-sm">
                <span className="material-symbols-outlined text-amber-400 text-xl font-bold">verified_user</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide">Verified Organic Partner Badging Active</h4>
                  <p className="text-[10px] text-slate-200 leading-normal mt-1">Your farm has logged 100% compliance over the past 30 days. All active produce releases will automatically receive the "Oja Certified" trust badge on the main marketplace.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "finance":
        return (
          <div className="space-y-6 fade-in">
            {/* Quick Balance cards */}
            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Payouts Received</p>
                <h3 className="text-xl font-bold text-[#00450d] mt-1">₦{totalPayoutReceived.toLocaleString()}</h3>
                <p className="text-[8.5px] text-slate-400 mt-1">Settled directly to bank</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Pending Payout Balance</p>
                <h3 className="text-xl font-bold text-[#8f4e00] mt-1">₦{pendingPayoutBalance.toLocaleString()}</h3>
                <p className="text-[8.5px] text-slate-400 mt-1">Releasing next Friday</p>
              </div>
            </div>

            {/* Financial ledger transaction rows */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs max-w-2xl">
              <div className="p-4 border-b border-slate-100 font-bold uppercase text-slate-700 bg-slate-50 flex justify-between items-center">
                <span>Account Payouts & Subsidies Ledger</span>
                <span className="text-[9px] text-[#00450d] font-semibold uppercase tracking-wider font-mono">Bank Account verified</span>
              </div>
              <div className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <div key={t.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div className="flex gap-3 items-center">
                      <span className={`material-symbols-outlined rounded-full p-2 border ${
                        t.type === "Payout"
                          ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                          : t.type === "Subsidy Credit"
                          ? "text-blue-600 bg-blue-50 border-blue-100"
                          : "text-rose-600 bg-rose-50 border-rose-100"
                      }`}>
                        {t.type === "Payout" ? "payments" : t.type === "Subsidy Credit" ? "local_atm" : "money_off"}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800 text-[12px]">{t.description}</p>
                        <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">{t.date} • ID: {t.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${t.amount >= 0 ? "text-[#00450d]" : "text-[#ba1a1a]"}`}>
                        {t.amount >= 0 ? "+" : ""}₦{t.amount.toLocaleString()}
                      </p>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (dashboardViewMode === "portrait") {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        {/* Mobile Phone Mockup Device Frame */}
        <div className="w-[390px] h-[800px] bg-surface rounded-[40px] border-[12px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col font-sans">
          {/* Mock Mobile Top Notch & Status Bar */}
          <div className="h-10 bg-slate-950 text-white flex justify-between items-center px-6 text-[10px] font-bold z-10 shrink-0">
            <span>08:42 AM</span>
            <div className="w-24 h-4 bg-black rounded-b-xl absolute left-1/2 -translate-x-1/2 top-0" />
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">wifi</span>
              <span className="material-symbols-outlined text-[10px]">battery_full</span>
            </div>
          </div>

          {/* Mobile App Header */}
          <header className="bg-[#00450d] text-white p-4 flex justify-between items-center z-10 shrink-0 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400">eco</span>
              <h1 className="font-headline font-black text-sm uppercase tracking-tight">Oja Partner</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-6 h-6 hover:bg-white/10 text-white rounded flex items-center justify-center transition-all"
                title="Toggle Dark Mode"
              >
                <span className="material-symbols-outlined text-sm font-bold">
                  {darkMode ? "light_mode" : "dark_mode"}
                </span>
              </button>
              <span className="text-[8px] bg-white/15 px-2 py-0.5 rounded font-black text-amber-400 uppercase">Segun Alao</span>
            </div>
          </header>

          {/* Scrollable Mobile App Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-low custom-scrollbar pb-24">
            <div className="border-b pb-2 border-slate-200">
              <h2 className="text-lg font-black text-[#00450d] tracking-tight">{activeTabInfo.title}</h2>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{activeTabInfo.subtitle}</p>
            </div>

            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-lg flex items-start gap-2 text-[10px] font-bold uppercase tracking-tight fade-in">
                <span className="material-symbols-outlined text-sm">verified</span>
                <div>{successMessage}</div>
              </div>
            )}

            {/* Render Tab Contents */}
            {renderTabContents()}
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t flex justify-around items-center px-2 z-10">
            {tabs.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
                    active ? "text-[#00450d]" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg ${active ? "font-bold" : ""}`}>{tab.icon}</span>
                  <span className="text-[8px] font-bold uppercase mt-0.5 truncate max-w-full">{tab.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* MODAL */}
        {showAddHarvestModal && renderAddHarvestModal()}
      </div>
    );
  }

  // Desktop landscape layout
  return (
    <div className="min-h-screen bg-surface-container-low flex flex-row font-sans text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* SIDE BAR NAVIGATION */}
      <aside className="w-64 fixed left-0 top-0 bottom-0 bg-[#00450d] border-r border-[#c0c9bb]/20 flex flex-col z-30">
        {/* Brand Header */}
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-[#00450d] shadow-sm">
            <span className="material-symbols-outlined font-bold text-lg">eco</span>
          </div>
          <div>
            <h1 className="font-headline font-extrabold text-base text-white leading-none">Oja Farm</h1>
            <p className="text-[9px] text-[#74b46e] uppercase tracking-wider font-bold mt-1">Certified Freshness</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all relative active:scale-95 ${
                  active
                    ? "bg-white/10 text-white font-extrabold"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {active && <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#fea85a] rounded-r" />}
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Profile / Status */}
        <div className="p-4 border-t border-white/10 bg-black/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 shrink-0">
            <img
              className="w-full h-full object-cover"
              src={user.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100"}
              alt="Farmer Profile"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate leading-none">{user.firstName} {user.lastName}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[9px] text-[#74b46e] uppercase font-bold">Jos Highlands Hub</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-8 h-16 flex items-center justify-between z-20 shadow-sm">
          <div className="flex items-center gap-4 w-1/3">
            <div className="relative w-full max-w-xs focus-within:ring-2 focus-within:ring-[#00450d]/10 rounded-lg">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input
                type="text"
                placeholder="Search batches, logs..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs placeholder:text-slate-400 focus:outline-none h-9 focus:bg-white focus:border-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1 text-[#00450d] text-xs font-bold bg-[#00450d]/5 px-2.5 py-1 rounded-lg">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>Hub Verified: ID #FJ-7023</span>
            </div>

            <div className="h-5 w-px bg-slate-200" />

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#00450d] dark:text-[#95d78e] border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center transition-all active:scale-95 shadow-sm"
              title="Toggle Dark Mode"
            >
              <span className="material-symbols-outlined text-sm font-bold">
                {darkMode ? "light_mode" : "dark_mode"}
              </span>
            </button>

            <button
              onClick={() => onScreenChange("home")}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#00450d] dark:text-[#95d78e] border border-slate-200 dark:border-slate-700 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all"
            >
              Shop View
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 space-y-6 max-w-6xl w-full mx-auto">
          {/* Header section info */}
          <div className="flex justify-between items-end border-b border-slate-200/50 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#00450d] tracking-tight">{activeTabInfo.title}</h2>
              <p className="text-xs text-slate-500 mt-1">{activeTabInfo.subtitle}</p>
            </div>
          </div>

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide fade-in">
              <span className="material-symbols-outlined text-sm font-bold">verified</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Render Active Tab */}
          {renderTabContents()}
        </main>
      </div>

      {/* NEW HARVEST REGISTER MODAL (desktop overlay) */}
      {showAddHarvestModal && renderAddHarvestModal()}
    </div>
  );

  // Helper helper to render add harvest modal content
  function renderAddHarvestModal() {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-surface rounded-xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh] font-sans">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#00450d]">Publish Fresh Harvest Batch</h3>
            <button onClick={() => setShowAddHarvestModal(false)} className="material-symbols-outlined text-slate-400 hover:text-slate-600">close</button>
          </div>

          <form onSubmit={handleUploadHarvest} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold uppercase text-[#00450d] text-[9.5px]">Harvest Produce Name</label>
              <input
                type="text"
                required
                value={newHarvest.name}
                onChange={(e) => setNewHarvest({ ...newHarvest, name: e.target.value })}
                placeholder="e.g. Organic Habanero Peppers"
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#00450d] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold uppercase text-[#00450d] text-[9.5px]">Price Rate (₦)</label>
                <input
                  type="number"
                  required
                  value={newHarvest.price}
                  onChange={(e) => setNewHarvest({ ...newHarvest, price: e.target.value })}
                  placeholder="e.g. 1500"
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#00450d] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase text-[#00450d] text-[9.5px]">Unit Size</label>
                <input
                  type="text"
                  value={newHarvest.unit}
                  onChange={(e) => setNewHarvest({ ...newHarvest, unit: e.target.value })}
                  placeholder="e.g. per kg"
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#00450d] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold uppercase text-[#00450d] text-[9.5px]">Category</label>
                <select
                  value={newHarvest.category}
                  onChange={(e) => setNewHarvest({ ...newHarvest, category: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#00450d] focus:outline-none"
                >
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="organic">Organic</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase text-[#00450d] text-[9.5px]">Total Harvest Quantity</label>
                <input
                  type="number"
                  value={newHarvest.qty}
                  onChange={(e) => setNewHarvest({ ...newHarvest, qty: e.target.value })}
                  placeholder="50"
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#00450d] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-sans">
              <div className="space-y-1">
                <label className="font-bold uppercase text-[#00450d] text-[9.5px]">Pesticide Residue Level</label>
                <input
                  type="text"
                  value={newHarvest.pesticide}
                  onChange={(e) => setNewHarvest({ ...newHarvest, pesticide: e.target.value })}
                  placeholder="0.00 ppm"
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#00450d] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase text-[#00450d] text-[9.5px]">Soil Moisture %</label>
                <input
                  type="text"
                  value={newHarvest.moisture}
                  onChange={(e) => setNewHarvest({ ...newHarvest, moisture: e.target.value })}
                  placeholder="42%"
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#00450d] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase text-[#00450d] text-[9.5px]">Batch Photo URL</label>
              <input
                type="text"
                value={newHarvest.image}
                onChange={(e) => setNewHarvest({ ...newHarvest, image: e.target.value })}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#00450d] focus:outline-none text-[10px]"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddHarvestModal(false)}
                className="flex-1 bg-white hover:bg-slate-50 text-[#00450d] border border-slate-200 font-bold py-2.5 rounded-lg transition-all text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#00450d] hover:bg-[#8f4e00] text-white border border-transparent font-bold py-2.5 rounded-lg transition-all text-xs uppercase shadow-sm"
              >
                Publish Harvest
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
};
