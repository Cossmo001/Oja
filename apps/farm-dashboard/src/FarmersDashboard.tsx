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

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col pb-28">
      {/* Farmers Header */}
      <header className="flex justify-between items-center px-6 h-20 w-full bg-[#0B3014] text-white border-b-4 border-[#FF4D00] sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 shadow-sm shrink-0">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400"
              alt="Farmer Segun Alao"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-headline font-black text-base uppercase tracking-tight leading-none">Segun Alao</h1>
              <span className="text-[8px] bg-amber-400 text-[#0B3014] font-black px-1.5 py-0.5 rounded-full">PRO</span>
            </div>
            <p className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest mt-0.5">Jos Highlands Hub • ID: #FJ-7023</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle (System Landscape vs Phone Portrait) */}
          <div className="hidden md:flex bg-[#071f0d] p-1.5 rounded-xl border-2 border-white/20 gap-1 text-[10px] font-bold">
            <button
              onClick={() => setDashboardViewMode("landscape")}
              className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all flex items-center gap-1 ${
                dashboardViewMode === "landscape"
                  ? "bg-[#FF4D00] text-white font-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-xs">desktop_windows</span>
              System (Landscape)
            </button>
            <button
              onClick={() => setDashboardViewMode("portrait")}
              className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all flex items-center gap-1 ${
                dashboardViewMode === "portrait"
                  ? "bg-[#FF4D00] text-white font-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-xs">smartphone</span>
              Phone (Portrait)
            </button>
          </div>

          <button
            onClick={() => onScreenChange("home")}
            className="bg-white hover:bg-[#FF4D00] hover:text-white text-[#0B3014] border-2 border-[#0B3014] shadow-[3px_3px_0px_0px_#FF4D00] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm font-bold">shopping_basket</span>
            Return to Shop
          </button>
        </div>
      </header>

      {/* Tabs list */}
      <div className="bg-[#E8E8E3] border-b-4 border-[#0B3014] px-4 py-3 sticky top-20 z-20 overflow-x-auto no-scrollbar flex gap-2.5">
        {[
          { id: "harvests", name: "My Harvest Batches", icon: "agriculture" },
          { id: "pickups", name: "Cold Logistics Pickups", icon: "hvac" },
          { id: "compliance", name: "Organic Auditing & Soil", icon: "clinical_trial" },
          { id: "finance", name: "My Financial Ledger", icon: "account_balance_wallet" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
              activeTab === tab.id
                ? "bg-[#0B3014] text-white border-[#0B3014] shadow-[3px_3px_0px_0px_#FF4D00]"
                : "bg-white text-[#0B3014]/80 border-[#0B3014]/20 hover:border-[#0B3014]"
            }`}
          >
            <span className="material-symbols-outlined text-base font-bold">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Main Page Content */}
      <div className={`p-4 md:p-6 flex-1 w-full mx-auto space-y-6 transition-all duration-300 ${
        dashboardViewMode === "portrait"
          ? "max-w-md lg:border-4 lg:border-[#0B3014] lg:rounded-[36px] lg:shadow-[12px_12px_0px_0px_#0B3014] lg:h-[840px] lg:my-6 lg:overflow-y-auto bg-[#F5F5F0] relative custom-scrollbar"
          : "max-w-7xl"
      }`}>
        {successMessage && (
          <div className="bg-white border-2 border-[#0B3014] text-[#0B3014] p-3 rounded-xl flex items-start gap-2 shadow-[4px_4px_0px_0px_#FF4D00] text-xs font-black uppercase tracking-tight fade-in">
            <span className="material-symbols-outlined text-green-700 text-lg font-bold">verified</span>
            <div>{successMessage}</div>
          </div>
        )}

        {/* ================= MY HARVESTS TAB ================= */}
        {activeTab === "harvests" && (
          <div className="space-y-6 fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-xl font-black text-[#0B3014] uppercase tracking-tighter">My Active Harvest Releases</h2>
                <p className="text-xs text-slate-500 font-bold uppercase mt-0.5">Upload daily harvests, check residual compliance scores, or schedule logistics</p>
              </div>

              <button
                onClick={() => setShowAddHarvestModal(true)}
                className="bg-[#0B3014] hover:bg-[#FF4D00] text-white border-2 border-[#0B3014] shadow-[3px_3px_0px_0px_#FF4D00] px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
              >
                <span className="material-symbols-outlined text-lg font-bold">upload_file</span>
                Register Fresh Harvest Batch
              </button>
            </div>

            {/* Grid of harvest batches */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {farmerBatches.map((batch) => (
                <div key={batch.id} className="bg-white rounded-2xl border-4 border-[#0B3014] shadow-[5px_5px_0px_0px_#0B3014] p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[8px] bg-[#0B3014] text-white font-black uppercase px-2 py-0.5 rounded">
                          {batch.category}
                        </span>
                        <h3 className="text-sm font-black text-slate-800 mt-1.5">{batch.name}</h3>
                      </div>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                        batch.status === "Active Listing"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {batch.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-sans text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-400">BATCH SIZE</p>
                        <p className="font-extrabold text-[#0B3014] mt-0.5">{batch.stockLeft} {batch.unit.split(" ")[1] || "Units"}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-400">PRICE RATE</p>
                        <p className="font-extrabold text-[#0B3014] mt-0.5">₦{batch.price.toLocaleString()} / {batch.unit.split(" ")[0] || "unit"}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[10px] font-sans">
                      <div className="flex justify-between items-center bg-[#F5F5F0] p-1.5 rounded-lg">
                        <span className="font-bold text-slate-400 uppercase text-[8px]">Pesticide Residue</span>
                        <span className="text-emerald-800 font-extrabold text-[9px]">{batch.pesticideRating}</span>
                      </div>
                      <div className="flex justify-between items-center bg-[#F5F5F0] p-1.5 rounded-lg">
                        <span className="font-bold text-slate-400 uppercase text-[8px]">Soil Moisture level</span>
                        <span className="text-[#0B3014] font-extrabold text-[9px]">{batch.soilMoisture}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
                    {batch.status === "Active Listing" ? (
                      <button
                        onClick={() => handleRequestPickup(batch.id)}
                        className="w-full bg-white hover:bg-[#0B3014] hover:text-white text-[#0B3014] border-2 border-[#0B3014] font-black py-2 rounded-xl text-[10px] uppercase tracking-wider text-center transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">hvac</span>
                        Request Pickup
                      </button>
                    ) : (
                      <span className="w-full text-center text-[9px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-100 py-2 rounded-xl flex items-center justify-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        Oja Transit Vehicle Booked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= COLD LOGISTICS PICKUPS TAB ================= */}
        {activeTab === "pickups" && (
          <div className="space-y-6 fade-in">
            <div>
              <h2 className="text-xl font-black text-[#0B3014] uppercase tracking-tighter">My Scheduled Pickups & Transit</h2>
              <p className="text-xs text-slate-500 font-bold uppercase mt-0.5">Track Oja's refrigerated logistics dispatch trucks arriving at your farm</p>
            </div>

            <div className="bg-white rounded-2xl border-4 border-[#0B3014] p-5 shadow-[6px_6px_0px_0px_#0B3014] space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-3 gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Logistics Assignment: Oja-Van-4</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Plate: LAG-743-A • Cargo Setpoint: +4.0°C</p>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-3 py-1 rounded-full border border-amber-100 uppercase tracking-widest">
                  ETA: 45 Mins Away
                </span>
              </div>

              {/* Transit Map overlay */}
              <div className="relative h-56 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBO6srMRPmNqeKBZ1vk0m0YGKEYdk2aVIumc-z-jipZzAq20K6Lrllw6k24Z4-HMAwd1H4ckuDx6xpsw9E_NDoteT9F2LnrTcLDYgejtBC_fv8ICqa-KjE_v3LY7h2O8Q7D0hxvJ-CnH0imzCbPDCFgdadLQfKi976R-mukgLMOsboEiieslaUxGwM1jOmayuJQ4KZ2gNJx7fb7-QwRWogK5SBTlZPbHJZg_JC_Y8NHpPvKoxOEUh-VMDIXy6Wx-Pgah6VzZ6F9x6A"
                  alt="Farm pickup live map track"
                  className="w-full h-full object-cover opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-1/3 left-1/2 w-4.5 h-4.5 bg-[#FF4D00] border-2 border-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <span className="material-symbols-outlined text-[10px] text-white font-black">local_shipping</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 pt-2 text-[11px] font-sans">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="font-bold text-slate-400 uppercase text-[9px]">DIAL-IN TEMPERATURE</p>
                  <p className="font-extrabold text-[#0B3014] mt-0.5 text-xs">+3.9°C (Stable)</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="font-bold text-slate-400 uppercase text-[9px]">SECURITY DISPATCH SEAL</p>
                  <p className="font-extrabold text-[#0B3014] mt-0.5 text-xs font-mono uppercase">OJA-4012-SEAL</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="font-bold text-slate-400 uppercase text-[9px]">PICKUP BATCH WEIGHT</p>
                  <p className="font-extrabold text-[#0B3014] mt-0.5 text-xs">120kg Combined</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= COMPLIANCE AUDITING TAB ================= */}
        {activeTab === "compliance" && (
          <div className="space-y-6 fade-in max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border-4 border-[#0B3014] p-5 shadow-[6px_6px_0px_0px_#0B3014] space-y-6">
              <div className="border-b pb-3">
                <h2 className="text-base font-black text-[#0B3014] uppercase tracking-tight">Oja Certified Standards Verification</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Submit weekly soil PH levels, pesticide residual audit charts, and organic declarations</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase text-slate-800">Weekly Soil PH Levels</h4>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${
                        soilCertUploaded ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-[#FF4D00] border-rose-200"
                      }`}>{soilCertUploaded ? "PASS (6.8 PH)" : "Pending Upload"}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Standard range required: 6.0 PH to 7.5 PH for organic root tubers and leafy crops.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSoilCertUploaded(true);
                      alert("Weekly Soil PH verification document uploaded! Verifying...");
                    }}
                    className="mt-4 w-full bg-white hover:bg-slate-100 text-[#0B3014] border border-[#0B3014] py-1.5 rounded font-black text-[9px] uppercase tracking-wider text-center"
                  >
                    Upload Document
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase text-slate-800">Pesticide Residual PPM Cert</h4>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${
                        pesticideReportUploaded ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-[#FF4D00] border-rose-200"
                      }`}>{pesticideReportUploaded ? "PASS (0.00 PPM)" : "Pending Upload"}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Standard: Peak pesticide residues must be strictly below 0.05 ppm threshold.</p>
                  </div>
                  <button
                    onClick={() => {
                      setPesticideReportUploaded(true);
                      alert("Pesticide Residual lab results uploaded. Under verification.");
                    }}
                    className="mt-4 w-full bg-white hover:bg-slate-100 text-[#0B3014] border border-[#0B3014] py-1.5 rounded font-black text-[9px] uppercase tracking-wider text-center"
                  >
                    Upload Lab Results
                  </button>
                </div>
              </div>

              <div className="bg-[#0B3014] text-white p-4 rounded-xl flex items-start gap-3 border-2 border-[#FF4D00] shadow-[3px_3px_0px_0px_#FF4D00]">
                <span className="material-symbols-outlined text-amber-400 text-xl font-bold">verified_user</span>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wide">Verified Organic Partner Badging Active</h4>
                  <p className="text-[10px] text-slate-300 leading-normal mt-1">Your farm has logged 100% compliance over the past 30 days. All active produce releases will automatically receive the "Oja Certified" trust badge on the main marketplace.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= FINANCIAL LEDGER TAB ================= */}
        {activeTab === "finance" && (
          <div className="space-y-6 fade-in">
            {/* Quick Balance cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border-4 border-[#0B3014] shadow-[4px_4px_0px_0px_#0B3014]">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Total Payouts Received</p>
                <h3 className="text-xl font-black text-emerald-800 mt-1">₦{totalPayoutReceived.toLocaleString()}</h3>
                <p className="text-[8.5px] text-slate-400 mt-1">Settled directly to Bank</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border-4 border-[#0B3014] shadow-[4px_4px_0px_0px_#0B3014]">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Pending Payout Balance</p>
                <h3 className="text-xl font-black text-amber-600 mt-1">₦{pendingPayoutBalance.toLocaleString()}</h3>
                <p className="text-[8.5px] text-slate-400 mt-1">Releasing next Friday</p>
              </div>
            </div>

            {/* Financial ledger transaction rows */}
            <div className="bg-white rounded-2xl border-4 border-[#0B3014] shadow-[6px_6px_0px_0px_#0B3014] overflow-hidden text-xs">
              <div className="p-4 border-b border-[#0B3014] font-black uppercase text-[#0B3014] bg-slate-50 flex justify-between items-center">
                <span>Account Payouts & Subsidies Ledger</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Bank Account verified</span>
              </div>
              <div className="divide-y divide-slate-100 font-sans">
                {transactions.map((t) => (
                  <div key={t.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div className="flex gap-3 items-center">
                      <span className={`material-symbols-outlined rounded-full p-1.5 border ${
                        t.type === "Payout"
                          ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                          : t.type === "Subsidy Credit"
                          ? "text-blue-600 bg-blue-50 border-blue-100"
                          : "text-rose-600 bg-rose-50 border-rose-100"
                      }`}>
                        {t.type === "Payout" ? "payments" : t.type === "Subsidy Credit" ? "local_atm" : "money_off"}
                      </span>
                      <div>
                        <p className="font-extrabold text-slate-800 text-[12.5px]">{t.description}</p>
                        <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">{t.date} • ID: {t.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-sm ${t.amount >= 0 ? "text-emerald-800" : "text-rose-600"}`}>
                        {t.amount >= 0 ? "+" : ""}₦{t.amount.toLocaleString()}
                      </p>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NEW HARVEST REGISTER MODAL */}
      {showAddHarvestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F5F5F0] rounded-2xl border-4 border-[#0B3014] max-w-md w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#0B3014]">Publish Fresh Harvest Batch</h3>
              <button onClick={() => setShowAddHarvestModal(false)} className="material-symbols-outlined text-slate-400 hover:text-slate-600">close</button>
            </div>

            <form onSubmit={handleUploadHarvest} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-black uppercase text-[#0B3014] text-[9.5px]">Harvest Produce Name</label>
                <input
                  type="text"
                  required
                  value={newHarvest.name}
                  onChange={(e) => setNewHarvest({ ...newHarvest, name: e.target.value })}
                  placeholder="e.g. Organic Habanero Peppers"
                  className="w-full h-11 px-3 bg-white border-2 border-[#0B3014] rounded-xl font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-black uppercase text-[#0B3014] text-[9.5px]">Price Rate (₦)</label>
                  <input
                    type="number"
                    required
                    value={newHarvest.price}
                    onChange={(e) => setNewHarvest({ ...newHarvest, price: e.target.value })}
                    placeholder="e.g. 1500"
                    className="w-full h-11 px-3 bg-white border-2 border-[#0B3014] rounded-xl font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-black uppercase text-[#0B3014] text-[9.5px]">Unit (e.g., 1kg pack, basket)</label>
                  <input
                    type="text"
                    value={newHarvest.unit}
                    onChange={(e) => setNewHarvest({ ...newHarvest, unit: e.target.value })}
                    placeholder="e.g. per kg"
                    className="w-full h-11 px-3 bg-white border-2 border-[#0B3014] rounded-xl font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-black uppercase text-[#0B3014] text-[9.5px]">Category</label>
                  <select
                    value={newHarvest.category}
                    onChange={(e) => setNewHarvest({ ...newHarvest, category: e.target.value })}
                    className="w-full h-11 px-3 bg-white border-2 border-[#0B3014] rounded-xl font-bold focus:outline-none"
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="organic">Organic</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-black uppercase text-[#0B3014] text-[9.5px]">Total Harvest Quantity</label>
                  <input
                    type="number"
                    value={newHarvest.qty}
                    onChange={(e) => setNewHarvest({ ...newHarvest, qty: e.target.value })}
                    placeholder="50"
                    className="w-full h-11 px-3 bg-white border-2 border-[#0B3014] rounded-xl font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-sans">
                <div className="space-y-1">
                  <label className="font-black uppercase text-[#0B3014] text-[9.5px]">Pesticide Residue level</label>
                  <input
                    type="text"
                    value={newHarvest.pesticide}
                    onChange={(e) => setNewHarvest({ ...newHarvest, pesticide: e.target.value })}
                    placeholder="0.00 ppm"
                    className="w-full h-11 px-3 bg-white border-2 border-[#0B3014] rounded-xl font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-black uppercase text-[#0B3014] text-[9.5px]">Soil Moisture percentage</label>
                  <input
                    type="text"
                    value={newHarvest.moisture}
                    onChange={(e) => setNewHarvest({ ...newHarvest, moisture: e.target.value })}
                    placeholder="42%"
                    className="w-full h-11 px-3 bg-white border-2 border-[#0B3014] rounded-xl font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-black uppercase text-[#0B3014] text-[9.5px]">Batch Photo URL</label>
                <input
                  type="text"
                  value={newHarvest.image}
                  onChange={(e) => setNewHarvest({ ...newHarvest, image: e.target.value })}
                  className="w-full h-11 px-3 bg-white border-2 border-[#0B3014] rounded-xl font-bold focus:outline-none text-[10px]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddHarvestModal(false)}
                  className="flex-1 bg-white hover:bg-slate-100 text-[#0B3014] border-2 border-[#0B3014] font-black py-3 rounded-xl transition-all text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0B3014] hover:bg-[#FF4D00] text-white border-2 border-[#0B3014] font-black py-3 rounded-xl transition-all text-xs uppercase"
                >
                  Publish Harvest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
