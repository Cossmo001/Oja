import React, { useState, useEffect } from "react";
import { Product, Order, User, CartItem } from "../types";
import { DashboardCharts } from "./components/DashboardCharts";

interface ManagementDashboardProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  orders: Order[];
  onUpdateOrders: (orders: Order[]) => void;
  user: User;
  onUpdateUser: (user: User) => void;
  onScreenChange: (screen: string) => void;
}

// Local mock data for user management & partner queue to avoid polluting global state too early
interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  status: "Active" | "Suspended" | "Flagged";
  joined: string;
}

interface PendingPartner {
  id: string;
  fullName: string;
  email: string;
  farmName: string;
  location: string;
  size: string;
  produceTypes: string[];
  docUrl: string;
  status: "Pending" | "Approved" | "Rejected";
}

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({
  products,
  onUpdateProducts,
  orders,
  onUpdateOrders,
  user,
  onUpdateUser,
  onScreenChange,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "users" | "partners" | "logistics" | "settings">("overview");
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

  // Mock platform users state
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([
    { id: "USR-001", name: `${user.firstName} ${user.lastName}`, email: user.email, role: "Customer", points: user.points, status: "Active", joined: "Jan 2023" },
    { id: "USR-002", name: "Chioma Adebayo", email: "chioma.adebayo@example.com", role: "Customer", points: 1540, status: "Active", joined: "Mar 2023" },
    { id: "USR-003", name: "Tunde Olowo", email: "tunde.olowo@gmail.com", role: "Customer", points: 850, status: "Active", joined: "Nov 2023" },
    { id: "USR-004", name: "Segun Alao", email: "segun.alao@josfresh.org", role: "Partner Farmer", points: 410, status: "Active", joined: "Sep 2022" },
    { id: "USR-005", name: "Amadi Kenneth", email: "amadi.k@gmail.com", role: "Customer", points: 120, status: "Suspended", joined: "Jan 2024" },
  ]);

  // Mock pending partners state
  const [pendingPartners, setPendingPartners] = useState<PendingPartner[]>([
    {
      id: "PTN-401",
      fullName: "Kabiru Ibrahim",
      email: "kabiru.f@kanograins.co",
      farmName: "Kano Plains Grains",
      location: "Kano North Agro Belt, Kano State",
      size: "12.5 Hectares",
      produceTypes: ["Grains", "Vegetables"],
      docUrl: "Land_Title_Kano_401.pdf",
      status: "Pending"
    },
    {
      id: "PTN-402",
      fullName: "Mrs. Ngozi Eke",
      email: "eke.vegetables@abakaliki.org",
      farmName: "Eke Organic Roots",
      location: "Abakaliki Agricultural Hub, Ebonyi State",
      size: "4.2 Hectares",
      produceTypes: ["Vegetables", "Fruits"],
      docUrl: "Abakaliki_Audit_Coop.pdf",
      status: "Pending"
    },
    {
      id: "PTN-403",
      fullName: "Femi Adesina",
      email: "femi@ijebufarms.com",
      farmName: "Ijebu Cassava & Fruits",
      location: "Ijebu-Ode Cluster, Ogun State",
      size: "8.0 Hectares",
      produceTypes: ["Fruits"],
      docUrl: "Ogun_Land_Deed_Signed.pdf",
      status: "Approved"
    }
  ]);

  // Editing state for products
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    name: "",
    price: 0,
    unit: "per kg",
    category: "vegetables",
    farmSource: "Oja Central Hub",
    description: "",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400",
    isOjaCertified: true,
    isHandledByOja: true,
    harvestedTimeAgo: "Harvested 2h ago"
  });
  const [showAddModal, setShowAddModal] = useState(false);

  // Platform Fee Settings state
  const [deliveryFee, setDeliveryFee] = useState(2500);
  const [serviceFee, setServiceFee] = useState(500);
  const [twoFactorDefault, setTwoFactorDefault] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(5);
  const [showSettingSaved, setShowSettingSaved] = useState(false);

  // Product uploader
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.price) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: newProductForm.name,
      description: newProductForm.description || "Fresh premium local agricultural item sourced directly via Oja channels.",
      price: Number(newProductForm.price),
      unit: newProductForm.unit || "per Unit",
      image: newProductForm.image || "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400",
      category: newProductForm.category as any || "vegetables",
      rating: 5.0,
      numReviews: 0,
      isOjaCertified: !!newProductForm.isOjaCertified,
      isHandledByOja: !!newProductForm.isHandledByOja,
      isFarmDirect: true,
      harvestedTimeAgo: newProductForm.harvestedTimeAgo || "Harvested 1h ago",
      farmSource: newProductForm.farmSource || "Partner Farm",
      inStock: true,
      stockLeft: 20
    };

    onUpdateProducts([newProd, ...products]);
    setShowAddModal(false);
    setNewProductForm({
      name: "",
      price: 0,
      unit: "per kg",
      category: "vegetables",
      farmSource: "Oja Central Hub",
      description: "",
      image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400",
      isOjaCertified: true,
      isHandledByOja: true,
      harvestedTimeAgo: "Harvested 2h ago"
    });
  };

  const handleUpdateProductPriceAndStock = (prodId: string, updates: Partial<Product>) => {
    onUpdateProducts(products.map(p => p.id === prodId ? { ...p, ...updates } : p));
  };

  // Toggle Certified status
  const toggleCertified = (prodId: string) => {
    onUpdateProducts(products.map(p => p.id === prodId ? { ...p, isOjaCertified: !p.isOjaCertified } : p));
  };

  // Delete product
  const handleDeleteProduct = (prodId: string) => {
    if (confirm("Are you sure you want to remove this product from the platform catalogue?")) {
      onUpdateProducts(products.filter(p => p.id !== prodId));
    }
  };

  // Partner Approvals
  const handlePartnerAction = (id: string, status: "Approved" | "Rejected") => {
    setPendingPartners(pendingPartners.map(p => p.id === id ? { ...p, status } : p));
    
    if (status === "Approved") {
      const approvedP = pendingPartners.find(p => p.id === id);
      if (approvedP) {
        // Add to active users
        const newPlatformUser: PlatformUser = {
          id: `USR-${Date.now().toString().slice(-3)}`,
          name: approvedP.fullName,
          email: approvedP.email,
          role: "Partner Farmer",
          points: 100,
          status: "Active",
          joined: "Today"
        };
        setPlatformUsers([...platformUsers, newPlatformUser]);
      }
    }
  };

  // User Actions (Adjust Points & Toggle Status)
  const handleAdjustUserPoints = (userId: string, pointsDelta: number) => {
    setPlatformUsers(platformUsers.map(u => {
      if (u.id === userId) {
        const updatedPoints = Math.max(0, u.points + pointsDelta);
        if (u.email === user.email) {
          // Sync to main app user state
          onUpdateUser({ ...user, points: updatedPoints });
        }
        return { ...u, points: updatedPoints };
      }
      return u;
    }));
  };

  const toggleUserStatus = (userId: string) => {
    setPlatformUsers(platformUsers.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === "Active" ? "Suspended" : "Active";
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  // Save Settings Trigger
  const handleSaveSettings = () => {
    setShowSettingSaved(true);
    setTimeout(() => {
      setShowSettingSaved(false);
    }, 2500);
  };

  // Stats Calculations
  const totalGMV = orders.reduce((sum, o) => o.status !== "Cancelled" ? sum + o.total : sum, 0);
  const activeOrders = orders.filter(o => o.status === "Processing" || o.status === "In Transit");
  const lowStockCount = products.filter(p => p.stockLeft !== undefined && p.stockLeft <= alertThreshold).length;

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col pb-28">
      {/* Top Banner Navigation */}
      <header className="flex justify-between items-center px-6 h-20 w-full bg-[#0B3014] text-white border-b-4 border-[#FF4D00] sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-[#FF4D00] shadow-sm">
            <span className="material-symbols-outlined text-[#0B3014] text-2xl font-black">
              admin_panel_settings
            </span>
          </div>
          <div>
            <h1 className="font-headline font-black text-lg uppercase tracking-tight leading-none">Oja Control Tower</h1>
            <p className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest mt-1">Platform Operations</p>
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
            Back to Marketplace
          </button>
        </div>
      </header>

      {/* Main Tabs Horizontal Row */}
      <div className="bg-[#E8E8E3] border-b-4 border-[#0B3014] px-4 py-3 sticky top-20 z-20 overflow-x-auto no-scrollbar flex gap-2.5">
        {[
          { id: "overview", name: "Overview Hub", icon: "dashboard" },
          { id: "products", name: "Products & Stock", icon: "inventory_2" },
          { id: "users", name: "User Management", icon: "groups" },
          { id: "partners", name: "Partner Approvals", icon: "how_to_reg" },
          { id: "logistics", name: "Logistics Dispatch", icon: "local_shipping" },
          { id: "settings", name: "Control Settings", icon: "settings" },
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

      {/* Primary Dashboard Content Panel */}
      <div className={`p-4 md:p-6 flex-1 w-full mx-auto space-y-6 transition-all duration-300 ${
        dashboardViewMode === "portrait"
          ? "max-w-md lg:border-4 lg:border-[#0B3014] lg:rounded-[36px] lg:shadow-[12px_12px_0px_0px_#0B3014] lg:h-[840px] lg:my-6 lg:overflow-y-auto bg-[#F5F5F0] relative custom-scrollbar"
          : "max-w-7xl"
      }`}>
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === "overview" && (
          <div className="space-y-6 fade-in">
            {/* Quick Metrics Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border-4 border-[#0B3014] shadow-[4px_4px_0px_0px_#0B3014] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start text-[#0B3014]/50">
                    <span className="text-[9px] uppercase font-black tracking-wider">Gross Platform GMV</span>
                    <span className="material-symbols-outlined text-[#FF4D00]">monetization_on</span>
                  </div>
                  <h3 className="text-2xl font-black text-[#0B3014] tracking-tight mt-2">₦{totalGMV.toLocaleString()}</h3>
                </div>
                <span className="text-[9px] font-extrabold text-[#0B3014]/60 uppercase mt-4">Calculated from completed sales</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border-4 border-[#0B3014] shadow-[4px_4px_0px_0px_#0B3014] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start text-[#0B3014]/50">
                    <span className="text-[9px] uppercase font-black tracking-wider">Active Operations</span>
                    <span className="material-symbols-outlined text-[#FF4D00]">pending_actions</span>
                  </div>
                  <h3 className="text-2xl font-black text-amber-600 tracking-tight mt-2">{activeOrders.length} Orders</h3>
                </div>
                <span className="text-[9px] font-extrabold text-emerald-800 uppercase mt-4 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping inline-block" />
                  Live transit tracking enabled
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border-4 border-[#0B3014] shadow-[4px_4px_0px_0px_#0B3014] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start text-[#0B3014]/50">
                    <span className="text-[9px] uppercase font-black tracking-wider">Low Stock Warnings</span>
                    <span className="material-symbols-outlined text-[#FF4D00]">warning</span>
                  </div>
                  <h3 className={`text-2xl font-black tracking-tight mt-2 ${lowStockCount > 0 ? "text-[#FF4D00]" : "text-emerald-700"}`}>
                    {lowStockCount} Products
                  </h3>
                </div>
                <span className="text-[9px] font-extrabold text-[#0B3014]/60 uppercase mt-4">Threshold: &le; {alertThreshold} units left</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border-4 border-[#0B3014] shadow-[4px_4px_0px_0px_#0B3014] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start text-[#0B3014]/50">
                    <span className="text-[9px] uppercase font-black tracking-wider">Total Active Stock</span>
                    <span className="material-symbols-outlined text-[#FF4D00]">agriculture</span>
                  </div>
                  <h3 className="text-2xl font-black text-[#0B3014] tracking-tight mt-2">{products.length} Batches</h3>
                </div>
                <span className="text-[9px] font-extrabold text-[#0B3014]/60 uppercase mt-4">8 Local farm hubs linked</span>
              </div>
            </div>

            {/* Platform Analytics Charts */}
            <DashboardCharts orders={orders} products={products} viewMode={dashboardViewMode} />

            {/* Platform Recent Incidents & Actions Log */}
            <div className="bg-white rounded-2xl border-4 border-[#0B3014] shadow-[6px_6px_0px_0px_#0B3014] overflow-hidden text-xs">
              <div className="p-4 border-b border-[#0B3014] font-black uppercase text-[#0B3014] bg-slate-50 flex justify-between items-center">
                <span>Recent Platform Activity Log</span>
                <span className="text-[9px] bg-[#FF4D00]/15 text-[#FF4D00] px-2.5 py-1 rounded font-black tracking-wider uppercase">Live Sync</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto custom-scrollbar">
                <div className="p-3.5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex gap-2.5 items-center">
                    <span className="material-symbols-outlined text-emerald-700">task_alt</span>
                    <div>
                      <p className="font-bold text-slate-800">Segun Alao uploaded fresh batch of Vine-Ripened Tomatoes</p>
                      <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">Origin: Jos Highlands Hub • 100kg • Code: #FJ-7023</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">Just Now</span>
                </div>

                <div className="p-3.5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex gap-2.5 items-center">
                    <span className="material-symbols-outlined text-amber-500">hvac</span>
                    <div>
                      <p className="font-bold text-slate-800">Cold Chain pickup schedule dispatched for Shagamu Greens</p>
                      <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">Logistics unit: Oja-Van-4 • Set point temperature: +4.0°C</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">14 mins ago</span>
                </div>

                <div className="p-3.5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex gap-2.5 items-center">
                    <span className="material-symbols-outlined text-rose-500">warning</span>
                    <div>
                      <p className="font-bold text-[#FF4D00]">Low Stock Warning: 'Pure Wild Honey'</p>
                      <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">Stock count dropped to 3 units • Restock recommended from Kogi Apiaries</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-[#FF4D00] font-black">Warning</span>
                </div>

                <div className="p-3.5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex gap-2.5 items-center">
                    <span className="material-symbols-outlined text-[#0B3014]">verified_user</span>
                    <div>
                      <p className="font-bold text-slate-800">New user registration verification completed successfully</p>
                      <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">User: {user.firstName} {user.lastName} (@{user.username || "customer"})</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= PRODUCTS & INVENTORY TAB ================= */}
        {activeTab === "products" && (
          <div className="space-y-6 fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-xl font-black text-[#0B3014] uppercase tracking-tighter">Marketplace Inventory Control</h2>
                <p className="text-xs text-slate-500 font-bold uppercase mt-0.5">Toggle verification badge, restock counts, edit prices, or release items</p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#0B3014] hover:bg-[#FF4D00] text-white border-2 border-[#0B3014] shadow-[3px_3px_0px_0px_#FF4D00] px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
              >
                <span className="material-symbols-outlined text-lg font-bold">add_box</span>
                Add New Product Listing
              </button>
            </div>

            {/* Inventory table */}
            <div className="bg-white rounded-2xl border-4 border-[#0B3014] shadow-[6px_6px_0px_0px_#0B3014] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b-2 border-[#0B3014] text-[#0B3014] uppercase tracking-wider font-black text-[10px]">
                      <th className="p-4">Produce Details</th>
                      <th className="p-4">Origin / Hub Sourced</th>
                      <th className="p-4 text-right">Selling Price</th>
                      <th className="p-4 text-center">Batch Stock</th>
                      <th className="p-4 text-center">Oja Certified</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800 text-[13px]">{prod.name}</p>
                              <div className="flex gap-2 items-center mt-1 text-[10px] text-slate-400 font-bold uppercase">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-extrabold text-[9px]">{prod.category}</span>
                                <span>{prod.unit}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-slate-600 uppercase text-[11px]">
                          {prod.farmSource}
                          <p className="text-[9.5px] text-emerald-700 font-black mt-0.5">{prod.harvestedTimeAgo}</p>
                        </td>
                        <td className="p-4 text-right font-black text-[#0B3014] text-[13px]">
                          ₦{prod.price.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2.5">
                            <button
                              onClick={() => handleUpdateProductPriceAndStock(prod.id, { stockLeft: Math.max(0, (prod.stockLeft || 0) - 1) })}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-600 active:scale-95"
                            >
                              -
                            </button>
                            <span className={`font-black font-mono text-sm w-8 ${
                              prod.stockLeft !== undefined && prod.stockLeft <= alertThreshold ? "text-[#FF4D00] font-black" : "text-slate-800"
                            }`}>
                              {prod.stockLeft ?? 15}
                            </span>
                            <button
                              onClick={() => handleUpdateProductPriceAndStock(prod.id, { stockLeft: (prod.stockLeft ?? 15) + 5 })}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-600 active:scale-95"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => toggleCertified(prod.id)}
                            className={`px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border transition-all active:scale-95 ${
                              prod.isOjaCertified
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-slate-100 text-slate-400 border-slate-300"
                            }`}
                          >
                            {prod.isOjaCertified ? "Certified ✓" : "Standard"}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                const newPrice = prompt(`Enter new price for ${prod.name}:`, prod.price.toString());
                                if (newPrice && !isNaN(Number(newPrice))) {
                                  handleUpdateProductPriceAndStock(prod.id, { price: Number(newPrice) });
                                }
                              }}
                              className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
                              title="Edit Price"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 hover:bg-rose-50 rounded text-[#FF4D00]"
                              title="Delete Listing"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= USER MANAGEMENT TAB ================= */}
        {activeTab === "users" && (
          <div className="space-y-6 fade-in">
            <div>
              <h2 className="text-xl font-black text-[#0B3014] uppercase tracking-tighter">Platform User Directories</h2>
              <p className="text-xs text-slate-500 font-bold uppercase mt-0.5">Reward loyal customer accounts with points, change roles, or audit account access</p>
            </div>

            <div className="bg-white rounded-2xl border-4 border-[#0B3014] shadow-[6px_6px_0px_0px_#0B3014] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b-2 border-[#0B3014] text-[#0B3014] uppercase tracking-wider font-black text-[10px]">
                      <th className="p-4">User Details</th>
                      <th className="p-4">Platform Role</th>
                      <th className="p-4 text-center">Oja Points Balance</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {platformUsers.map((pUser) => (
                      <tr key={pUser.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-[#0B3014] border-2 border-[#0B3014] text-xs">
                              {pUser.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800 text-[13px]">{pUser.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{pUser.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-slate-600 uppercase text-[11px]">
                          {pUser.role}
                          <p className="text-[9.5px] text-slate-400 font-bold mt-0.5">Joined: {pUser.joined}</p>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleAdjustUserPoints(pUser.id, -250)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-black text-slate-600 active:scale-95"
                              title="Subtract 250 pts"
                            >
                              -250
                            </button>
                            <span className="font-black font-mono text-sm text-[#0B3014] w-12 text-center bg-[#0B3014]/5 py-1 px-2 rounded-lg">
                              {pUser.points.toLocaleString()}
                            </span>
                            <button
                              onClick={() => handleAdjustUserPoints(pUser.id, 500)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-black text-slate-600 active:scale-95"
                              title="Add 500 pts"
                            >
                              +500
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${
                            pUser.status === "Active"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-[#FF4D00]/10 text-[#FF4D00] border-[#FF4D00]/30"
                          }`}>
                            {pUser.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => toggleUserStatus(pUser.id)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all active:scale-95 ${
                              pUser.status === "Active"
                                ? "bg-white text-[#FF4D00] border-[#FF4D00] hover:bg-[#FF4D00] hover:text-white"
                                : "bg-emerald-800 text-white border-emerald-800 hover:bg-emerald-900"
                            }`}
                          >
                            {pUser.status === "Active" ? "Suspend" : "Reinstate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= PARTNER APPROVALS TAB ================= */}
        {activeTab === "partners" && (
          <div className="space-y-6 fade-in">
            <div>
              <h2 className="text-xl font-black text-[#0B3014] uppercase tracking-tighter">Grow With Oja: Farmer Onboarding Queue</h2>
              <p className="text-xs text-slate-500 font-bold uppercase mt-0.5">Audit, approve, or decline new agricultural partnership registrations</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {pendingPartners.map((partner) => (
                <div key={partner.id} className="bg-white rounded-2xl border-4 border-[#0B3014] shadow-[6px_6px_0px_0px_#0B3014] p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-black text-slate-800">{partner.fullName}</h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{partner.email}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${
                        partner.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : partner.status === "Approved"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-rose-50 text-[#FF4D00] border-rose-200"
                      }`}>
                        {partner.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1 text-[11px] font-sans">
                      <div className="bg-slate-50 p-2.5 rounded-xl">
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Farm Entity</p>
                        <p className="font-extrabold text-slate-700 mt-0.5">{partner.farmName}</p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl">
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Land Size</p>
                        <p className="font-extrabold text-slate-700 mt-0.5">{partner.size}</p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl col-span-2">
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Agricultural Belt Location</p>
                        <p className="font-extrabold text-slate-700 mt-0.5 leading-snug">{partner.location}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[9.5px] uppercase font-black text-[#0B3014]/40 tracking-wider">Commodity Crops</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {partner.produceTypes.map(pt => (
                          <span key={pt} className="text-[9px] bg-emerald-50 text-[#0B3014] border border-emerald-100 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                            {pt}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-[#E8E8E3]/35 p-2 rounded-xl text-[10px] text-slate-500 font-bold border border-[#0B3014]/10">
                      <span className="material-symbols-outlined text-sm font-bold text-slate-400">upload_file</span>
                      <span>Verified doc attachment: <a href="#" className="text-emerald-700 hover:underline">{partner.docUrl}</a></span>
                    </div>
                  </div>

                  {partner.status === "Pending" && (
                    <div className="flex gap-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handlePartnerAction(partner.id, "Rejected")}
                        className="flex-1 bg-white hover:bg-[#FF4D00]/10 text-[#FF4D00] border-2 border-[#FF4D00] font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 text-center"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handlePartnerAction(partner.id, "Approved")}
                        className="flex-1 bg-[#0B3014] hover:bg-[#FF4D00] text-white border-2 border-[#0B3014] font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 text-center"
                      >
                        Approve Partner
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= LOGISTICS DISPATCH TAB ================= */}
        {activeTab === "logistics" && (
          <div className="space-y-6 fade-in">
            <div>
              <h2 className="text-xl font-black text-[#0B3014] uppercase tracking-tighter">Oja Cold Chain Fleet Logistics</h2>
              <p className="text-xs text-slate-500 font-bold uppercase mt-0.5">Monitor ambient transit temperatures and truck pickup schedules</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Cold-chain fleet active status */}
              <div className="bg-white rounded-2xl border-4 border-[#0B3014] shadow-[6px_6px_0px_0px_#0B3014] p-5 space-y-4 lg:col-span-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0B3014] border-b pb-2">Active Logistics Units</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-extrabold text-slate-800 uppercase">Unit: Oja-Van-1</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Route: Zaria &rarr; Central Hub</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9.5px] bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded border border-emerald-200 uppercase">Active</span>
                      <p className="text-[10px] text-slate-500 font-black mt-1">+3.8°C</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-extrabold text-slate-800 uppercase">Unit: Oja-Van-3</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Route: Shagamu &rarr; Lagos VI</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9.5px] bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded border border-emerald-200 uppercase">Active</span>
                      <p className="text-[10px] text-slate-500 font-black mt-1">+4.2°C</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-extrabold text-slate-800 uppercase">Unit: Oja-Van-4</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Route: Jos Highlands &rarr; Hub</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9.5px] bg-amber-50 text-amber-700 font-extrabold px-2 py-0.5 rounded border border-amber-200 uppercase">Loading</span>
                      <p className="text-[10px] text-slate-500 font-black mt-1">+5.1°C</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Central Map Tracker mock visual with verified pins */}
              <div className="bg-white rounded-2xl border-4 border-[#0B3014] shadow-[6px_6px_0px_0px_#0B3014] p-5 space-y-3 lg:col-span-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0B3014]">Live GPS Transit Hub Overlay</h3>
                <div className="relative h-60 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBO6srMRPmNqeKBZ1vk0m0YGKEYdk2aVIumc-z-jipZzAq20K6Lrllw6k24Z4-HMAwd1H4ckuDx6xpsw9E_NDoteT9F2LnrTcLDYgejtBC_fv8ICqa-KjE_v3LY7h2O8Q7D0hxvJ-CnH0imzCbPDCFgdadLQfKi976R-mukgLMOsboEiieslaUxGwM1jOmayuJQ4KZ2gNJx7fb7-QwRWogK5SBTlZPbHJZg_JC_Y8NHpPvKoxOEUh-VMDIXy6Wx-Pgah6VzZ6F9x6A"
                    alt="Verified transit tracking map overlay"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Glowing Pulse indicators on the map representing cold vans */}
                  <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-[#FF4D00] border border-white animate-pulse-orange shadow-md" />
                  <div className="absolute top-1/2 left-2/3 w-3 h-3 rounded-full bg-emerald-600 border border-white animate-pulse-glow shadow-md" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SETTINGS TAB ================= */}
        {activeTab === "settings" && (
          <div className="space-y-6 fade-in max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border-4 border-[#0B3014] shadow-[6px_6px_0px_0px_#0B3014] p-6 space-y-6">
              <div className="border-b pb-3">
                <h2 className="text-base font-black text-[#0B3014] uppercase tracking-tight">Oja Platform Configuration Settings</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Adjust platform-wide transaction formulas & core services</p>
              </div>

              {showSettingSaved && (
                <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wide">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>Configurations successfully deployed to Oja production environment!</span>
                </div>
              )}

              <div className="space-y-4 font-sans text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#0B3014]">Global Flat Delivery Fee (₦)</label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    className="w-full h-12 px-4 bg-white border-2 border-[#0B3014] rounded-xl text-xs font-bold text-[#0B3014] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#0B3014]">Flat Platform Service Fee (₦)</label>
                  <input
                    type="number"
                    value={serviceFee}
                    onChange={(e) => setServiceFee(Number(e.target.value))}
                    className="w-full h-12 px-4 bg-white border-2 border-[#0B3014] rounded-xl text-xs font-bold text-[#0B3014] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#0B3014]">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(Number(e.target.value))}
                    className="w-full h-12 px-4 bg-white border-2 border-[#0B3014] rounded-xl text-xs font-bold text-[#0B3014] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      checked={twoFactorDefault}
                      onChange={(e) => setTwoFactorDefault(e.target.checked)}
                      className="mt-0.5 w-4.5 h-4.5 accent-[#FF4D00]"
                    />
                    <div>
                      <span className="block text-[11px] text-[#0B3014] font-black uppercase tracking-wider">Enforce Two-Factor Authentication (2FA) Defaults</span>
                      <span className="block text-[9px] text-slate-400 mt-0.5">Enforces verification on new profiles signing on to the Oja app.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-[#0B3014] hover:bg-[#FF4D00] text-white font-black py-3.5 rounded-xl border-2 border-[#0B3014] shadow-[4px_4px_0px_0px_#0B3014] transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
                >
                  Deploy Configurations
                  <span className="material-symbols-outlined text-sm font-bold">save</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NEW PRODUCT Listing modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F5F5F0] rounded-2xl border-4 border-[#0B3014] max-w-md w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#0B3014]">New Product Batch Release</h3>
              <button onClick={() => setShowAddModal(false)} className="material-symbols-outlined text-slate-400 hover:text-slate-600">close</button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-black uppercase text-[#0B3014] text-[9.5px]">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  placeholder="e.g. Organic Sweet Potatoes"
                  className="w-full h-11 px-3 bg-white border-2 border-[#0B3014] rounded-xl font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-black uppercase text-[#0B3014] text-[9.5px]">Price (₦)</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.price || ""}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                    placeholder="1200"
                    className="w-full h-11 px-3 bg-white border-2 border-[#0B3014] rounded-xl font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-black uppercase text-[#0B3014] text-[9.5px]">Unit Size</label>
                  <input
                    type="text"
                    value={newProductForm.unit}
                    onChange={(e) => setNewProductForm({ ...newProductForm, unit: e.target.value })}
                    placeholder="e.g. 1kg Bag"
                    className="w-full h-11 px-3 bg-white border-2 border-[#0B3014] rounded-xl font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-black uppercase text-[#0B3014] text-[9.5px]">Category</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value as any })}
                    className="w-full h-11 px-3 bg-white border-2 border-[#0B3014] rounded-xl font-bold focus:outline-none"
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="organic">Organic</option>
                    <option value="meat">Meat</option>
                    <option value="dairy">Dairy</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-black uppercase text-[#0B3014] text-[9.5px]">Harvest Source</label>
                  <input
                    type="text"
                    value={newProductForm.farmSource}
                    onChange={(e) => setNewProductForm({ ...newProductForm, farmSource: e.target.value })}
                    placeholder="e.g. Jos Highlands Farms"
                    className="w-full h-11 px-3 bg-white border-2 border-[#0B3014] rounded-xl font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-black uppercase text-[#0B3014] text-[9.5px]">Brief Description</label>
                <textarea
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                  placeholder="Describe the freshness, quality, etc..."
                  rows={2}
                  className="w-full p-3 bg-white border-2 border-[#0B3014] rounded-xl font-bold focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-black uppercase text-[#0B3014] text-[9.5px]">Product Image URL</label>
                <input
                  type="text"
                  value={newProductForm.image}
                  onChange={(e) => setNewProductForm({ ...newProductForm, image: e.target.value })}
                  className="w-full h-11 px-3 bg-white border-2 border-[#0B3014] rounded-xl font-bold focus:outline-none text-[10px]"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={newProductForm.isOjaCertified}
                    onChange={(e) => setNewProductForm({ ...newProductForm, isOjaCertified: e.target.checked })}
                    className="accent-[#FF4D00]"
                  />
                  <span>Oja Certified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={newProductForm.isHandledByOja}
                    onChange={(e) => setNewProductForm({ ...newProductForm, isHandledByOja: e.target.checked })}
                    className="accent-[#FF4D00]"
                  />
                  <span>Handled By Oja Logistics</span>
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white hover:bg-slate-100 text-[#0B3014] border-2 border-[#0B3014] font-black py-3 rounded-xl transition-all text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0B3014] hover:bg-[#FF4D00] text-white border-2 border-[#0B3014] font-black py-3 rounded-xl transition-all text-xs uppercase"
                >
                  Release Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
