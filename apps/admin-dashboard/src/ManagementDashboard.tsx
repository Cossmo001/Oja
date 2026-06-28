import React, { useState, useEffect } from "react";
import { Product, Order, User, CartItem } from "@oja/shared";
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

  const tabs = [
    { id: "overview", name: "Overview Hub", icon: "dashboard", title: "Dashboard Overview", subtitle: "Real-time supply chain and marketplace performance." },
    { id: "products", name: "Products & Stock", icon: "inventory_2", title: "Marketplace Inventory Control", subtitle: "Toggle verification badges, restock counts, edit prices, or release items." },
    { id: "users", name: "User Management", icon: "groups", title: "Platform User Directories", subtitle: "Reward loyal customer accounts with points, change roles, or audit account access." },
    { id: "partners", name: "Partner Approvals", icon: "how_to_reg", title: "Grow With Oja: Farmer Onboarding Queue", subtitle: "Audit, approve, or decline new agricultural partnership registrations." },
    { id: "logistics", name: "Logistics Dispatch", icon: "local_shipping", title: "Oja Cold Chain Fleet Logistics", subtitle: "Monitor ambient transit temperatures and truck pickup schedules." },
    { id: "settings", name: "Control Settings", icon: "settings", title: "Oja Platform Configuration Settings", subtitle: "Adjust platform-wide transaction formulas & core services." },
  ];

  const activeTabInfo = tabs.find(t => t.id === activeTab) || tabs[0];

  const renderTabContents = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6 fade-in">
            {/* Quick Metrics Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start text-slate-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Gross Platform GMV</span>
                    <span className="material-symbols-outlined text-[#006c49]">monetization_on</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#002c06] tracking-tight mt-2">₦{totalGMV.toLocaleString()}</h3>
                </div>
                <span className="text-[9px] font-medium text-slate-400 uppercase mt-4">Calculated from completed sales</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start text-slate-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Active Operations</span>
                    <span className="material-symbols-outlined text-[#006c49]">pending_actions</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#006c49] tracking-tight mt-2">{activeOrders.length} Orders</h3>
                </div>
                <span className="text-[9px] font-bold text-emerald-800 uppercase mt-4 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006c49] animate-ping inline-block" />
                  Live transit tracking enabled
                </span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start text-slate-400">
                    <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider">Low Stock Warnings</span>
                  </div>
                  <h3 className={`text-xl font-extrabold tracking-tight mt-2 ${lowStockCount > 0 ? "text-[#ba1a1a]" : "text-emerald-700"}`}>
                    {lowStockCount} Products
                  </h3>
                </div>
                <span className="text-[9px] font-medium text-slate-400 uppercase mt-4">Threshold: &le; {alertThreshold} units left</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start text-slate-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Total Active Stock</span>
                    <span className="material-symbols-outlined text-[#006c49]">agriculture</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#002c06] tracking-tight mt-2">{products.length} Batches</h3>
                </div>
                <span className="text-[9px] font-medium text-slate-400 uppercase mt-4">8 Local farm hubs linked</span>
              </div>
            </div>

            {/* Platform Analytics Charts */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <DashboardCharts orders={orders} products={products} viewMode={dashboardViewMode} />
            </div>

            {/* Platform Recent Incidents & Actions Log */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 font-bold uppercase text-slate-700 bg-slate-50 flex justify-between items-center">
                <span>Recent Platform Activity Log</span>
                <span className="text-[9px] bg-[#002c06]/10 text-[#002c06] px-2 py-0.5 rounded font-bold tracking-wider uppercase">Live Sync</span>
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
                      <p className="font-bold text-[#ba1a1a]">Low Stock Warning: 'Pure Wild Honey'</p>
                      <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">Stock count dropped to 3 units • Restock recommended from Kogi Apiaries</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-[#ba1a1a]">Warning</span>
                </div>

                <div className="p-3.5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex gap-2.5 items-center">
                    <span className="material-symbols-outlined text-[#002c06]">verified_user</span>
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
        );

      case "products":
        return (
          <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Catalogue Listings</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#002c06] hover:bg-[#002c06]/90 text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm font-bold">add_box</span>
                Add New Product
              </button>
            </div>

            {/* Inventory table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                      <th className="p-4">Produce Details</th>
                      <th className="p-4">Origin / Hub Sourced</th>
                      <th className="p-4 text-right">Selling Price</th>
                      <th className="p-4 text-center">Batch Stock</th>
                      <th className="p-4 text-center">Oja Certified</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{prod.name}</p>
                              <div className="flex gap-2 items-center mt-1 text-[10px] text-slate-400 font-bold uppercase">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold text-[9px]">{prod.category}</span>
                                <span>{prod.unit}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-600 uppercase text-[10px]">
                          {prod.farmSource}
                          <p className="text-[9.5px] text-[#006c49] font-bold mt-0.5">{prod.harvestedTimeAgo}</p>
                        </td>
                        <td className="p-4 text-right font-extrabold text-[#002c06] text-sm">
                          ₦{prod.price.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleUpdateProductPriceAndStock(prod.id, { stockLeft: Math.max(0, (prod.stockLeft || 0) - 1) })}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-600 active:scale-95"
                            >
                              -
                            </button>
                            <span className={`font-bold font-mono text-xs w-8 ${
                              prod.stockLeft !== undefined && prod.stockLeft <= alertThreshold ? "text-[#ba1a1a]" : "text-slate-800"
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
                            className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                              prod.isOjaCertified
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-slate-50 text-slate-400 border-slate-200"
                            }`}
                          >
                            {prod.isOjaCertified ? "Certified" : "Standard"}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                const newPrice = prompt(`Enter new price for ${prod.name}:`, prod.price.toString());
                                if (newPrice && !isNaN(Number(newPrice))) {
                                  handleUpdateProductPriceAndStock(prod.id, { price: Number(newPrice) });
                                }
                              }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600"
                              title="Edit Price"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1 hover:bg-rose-50 rounded text-[#ba1a1a]"
                              title="Delete Listing"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
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
        );

      case "users":
        return (
          <div className="space-y-6 fade-in">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                      <th className="p-4">User Details</th>
                      <th className="p-4">Platform Role</th>
                      <th className="p-4 text-center">Oja Points Balance</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {platformUsers.map((pUser) => (
                      <tr key={pUser.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#002c06] border border-slate-200 text-xs">
                              {pUser.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-xs">{pUser.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{pUser.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-600 uppercase text-[10px]">
                          {pUser.role}
                          <p className="text-[9.5px] text-slate-400 font-medium mt-0.5 font-sans">Joined: {pUser.joined}</p>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleAdjustUserPoints(pUser.id, -250)}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-bold text-slate-600 active:scale-95"
                              title="Subtract 250 pts"
                            >
                              -250
                            </button>
                            <span className="font-bold font-mono text-xs text-[#002c06] w-12 text-center bg-[#002c06]/5 py-0.5 px-1.5 rounded">
                              {pUser.points.toLocaleString()}
                            </span>
                            <button
                              onClick={() => handleAdjustUserPoints(pUser.id, 500)}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-bold text-slate-600 active:scale-95"
                              title="Add 500 pts"
                            >
                              +500
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            pUser.status === "Active"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-rose-50 text-[#ba1a1a] border-rose-200"
                          }`}>
                            {pUser.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => toggleUserStatus(pUser.id)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                              pUser.status === "Active"
                                ? "bg-white text-[#ba1a1a] border-slate-200 hover:border-rose-300"
                                : "bg-[#002c06] text-white border-transparent"
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
        );

      case "partners":
        return (
          <div className="space-y-6 fade-in">
            <div className="grid md:grid-cols-2 gap-6">
              {pendingPartners.map((partner) => (
                <div key={partner.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{partner.fullName}</h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{partner.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        partner.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : partner.status === "Approved"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-rose-50 text-[#ba1a1a] border-rose-200"
                      }`}>
                        {partner.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1 text-[11px]">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <p className="font-bold text-slate-400 uppercase text-[8px] tracking-wider">Farm Entity</p>
                        <p className="font-bold text-slate-700 mt-0.5 truncate">{partner.farmName}</p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <p className="font-bold text-slate-400 uppercase text-[8px] tracking-wider">Land Size</p>
                        <p className="font-bold text-slate-700 mt-0.5">{partner.size}</p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 col-span-2">
                        <p className="font-bold text-slate-400 uppercase text-[8px] tracking-wider">Agricultural Belt Location</p>
                        <p className="font-bold text-slate-700 mt-0.5 leading-snug">{partner.location}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Commodity Crops</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {partner.produceTypes.map(pt => (
                          <span key={pt} className="text-[9px] bg-slate-50 border border-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded uppercase">
                            {pt}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg text-[10px] text-slate-500 font-semibold border border-slate-200/50">
                      <span className="material-symbols-outlined text-sm text-slate-400">upload_file</span>
                      <span className="truncate">Attachment: <a href="#" className="text-[#006c49] hover:underline font-bold">{partner.docUrl}</a></span>
                    </div>
                  </div>

                  {partner.status === "Pending" && (
                    <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handlePartnerAction(partner.id, "Rejected")}
                        className="flex-1 bg-white hover:bg-rose-50 text-[#ba1a1a] border border-slate-200 font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-all active:scale-95 text-center"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handlePartnerAction(partner.id, "Approved")}
                        className="flex-1 bg-[#002c06] hover:bg-[#002c06]/95 text-white border border-transparent font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-all active:scale-95 text-center shadow-sm"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "logistics":
        return (
          <div className="space-y-6 fade-in">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Cold-chain fleet active status */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 lg:col-span-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">Active Logistics Units</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800 uppercase">Unit: Oja-Van-1</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Zaria &rarr; Central Hub</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 uppercase">Active</span>
                      <p className="text-[10px] text-slate-500 font-extrabold mt-1">+3.8°C</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800 uppercase">Unit: Oja-Van-3</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Shagamu &rarr; Lagos VI</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 uppercase">Active</span>
                      <p className="text-[10px] text-slate-500 font-extrabold mt-1">+4.2°C</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800 uppercase">Unit: Oja-Van-4</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Jos Highlands &rarr; Hub</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-200 uppercase">Loading</span>
                      <p className="text-[10px] text-slate-500 font-extrabold mt-1">+5.1°C</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Central Map Tracker mock visual with verified pins */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3 lg:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Live GPS Transit Hub Overlay</h3>
                <div className="relative h-60 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBO6srMRPmNqeKBZ1vk0m0YGKEYdk2aVIumc-z-jipZzAq20K6Lrllw6k24Z4-HMAwd1H4ckuDx6xpsw9E_NDoteT9F2LnrTcLDYgejtBC_fv8ICqa-KjE_v3LY7h2O8Q7D0hxvJ-CnH0imzCbPDCFgdadLQfKi976R-mukgLMOsboEiieslaUxGwM1jOmayuJQ4KZ2gNJx7fb7-QwRWogK5SBTlZPbHJZg_JC_Y8NHpPvKoxOEUh-VMDIXy6Wx-Pgah6VzZ6F9x6A"
                    alt="Verified transit tracking map overlay"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Glowing Pulse indicators on the map representing cold vans */}
                  <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-[#ff8f00] border border-white animate-pulse-orange shadow-md" />
                  <div className="absolute top-1/2 left-2/3 w-3 h-3 rounded-full bg-emerald-600 border border-white animate-pulse-glow shadow-md" />
                </div>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6 fade-in max-w-xl">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              {showSettingSaved && (
                <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-800 p-3 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                  <span className="material-symbols-outlined text-sm font-bold">verified</span>
                  <span>Configurations successfully deployed to Oja production environment!</span>
                </div>
              )}

              <div className="space-y-4 text-xs font-sans">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Global Flat Delivery Fee (₦)</label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:border-[#002c06] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Flat Platform Service Fee (₦)</label>
                  <input
                    type="number"
                    value={serviceFee}
                    onChange={(e) => setServiceFee(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:border-[#002c06] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:border-[#002c06] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100/55 transition-all">
                    <input
                      type="checkbox"
                      checked={twoFactorDefault}
                      onChange={(e) => setTwoFactorDefault(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#002c06]"
                    />
                    <div>
                      <span className="block text-xs text-slate-700 font-bold uppercase tracking-wide">Enforce Two-Factor Authentication (2FA) Defaults</span>
                      <span className="block text-[9.5px] text-slate-400 mt-0.5">Enforces mobile/SMS verification on new profiles signing on to the Oja app.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-[#002c06] hover:bg-[#002c06]/90 text-white font-bold py-3 rounded-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                >
                  Deploy Configurations
                  <span className="material-symbols-outlined text-sm font-bold">save</span>
                </button>
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
        {/* Floating Developer Control Panel (Outside Simulator) */}
        <div className="mb-4 bg-white/10 backdrop-blur-md p-2 rounded-xl flex gap-2 text-xs font-bold text-white border border-white/10 z-20">
          <button
            onClick={() => setDashboardViewMode("landscape")}
            className="px-4 py-1.5 rounded-lg uppercase tracking-wider transition-all bg-white/20 hover:bg-white/30 text-white"
          >
            Switch to Desktop Layout
          </button>
          <button
            onClick={() => onScreenChange("home")}
            className="px-4 py-1.5 rounded-lg uppercase tracking-wider transition-all bg-[#002c06] text-white"
          >
            Marketplace
          </button>
        </div>

        {/* Mobile Phone Mockup Device Frame */}
        <div className="w-[390px] h-[800px] bg-white rounded-[40px] border-[12px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col font-sans">
          {/* Mock Mobile Top Notch & Status Bar */}
          <div className="h-10 bg-slate-950 text-white flex justify-between items-center px-6 text-[10px] font-bold z-10 shrink-0">
            <span>03:15 PM</span>
            <div className="w-24 h-4 bg-black rounded-b-xl absolute left-1/2 -translate-x-1/2 top-0" />
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">wifi</span>
              <span className="material-symbols-outlined text-[10px]">battery_full</span>
            </div>
          </div>

          {/* Mobile App Header */}
          <header className="bg-[#002c06] text-white p-4 flex justify-between items-center z-10 shrink-0 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400">shield_person</span>
              <h1 className="font-headline font-black text-sm uppercase tracking-tight">Oja Central</h1>
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
              <span className="text-[8px] bg-white/15 px-2 py-0.5 rounded font-black text-amber-400 uppercase">Admin Hub</span>
            </div>
          </header>

          {/* Scrollable Mobile App Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-low custom-scrollbar pb-24">
            <div className="border-b pb-2">
              <h2 className="text-lg font-black text-[#002c06] tracking-tight">{activeTabInfo.title}</h2>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{activeTabInfo.subtitle}</p>
            </div>
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
                    active ? "text-[#002c06]" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg ${active ? "font-bold" : ""}`}>{tab.icon}</span>
                  <span className="text-[8px] font-bold uppercase mt-0.5 truncate max-w-full">{tab.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* MODAL (inside phone) */}
        {showAddModal && renderAddModal()}
      </div>
    );
  }

  // Desktop landscape layout
  return (
    <div className="min-h-screen bg-surface-container-low flex flex-row font-sans text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* SIDE BAR NAVIGATION */}
      <aside className="w-64 fixed left-0 top-0 bottom-0 bg-[#002c06] border-r border-[#c0c9bb]/20 flex flex-col z-30">
        {/* Brand Header */}
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-[#002c06] shadow-sm">
            <span className="material-symbols-outlined font-bold">eco</span>
          </div>
          <div>
            <h1 className="font-headline font-extrabold text-base text-white leading-none">Oja Admin</h1>
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
                {active && <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#6ffbbe] rounded-r" />}
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
              src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
              alt="Admin Profile"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate leading-none">{user.firstName} {user.lastName}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[9px] text-white/50 uppercase font-bold">Admin Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-8 h-16 flex items-center justify-between z-20 shadow-sm">
          <div className="flex items-center gap-4 w-1/3">
            <div className="relative w-full max-w-xs focus-within:ring-2 focus-within:ring-[#002c06]/10 rounded-lg">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input
                type="text"
                placeholder="Search orders, products, log..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs placeholder:text-slate-400 focus:outline-none h-9 focus:bg-white focus:border-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1 text-[#002c06] text-xs font-bold bg-[#002c06]/5 px-2.5 py-1 rounded-lg">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>Warehouse A-12</span>
            </div>

            <div className="h-5 w-px bg-slate-200" />

            {/* Dev Simulator Toggles */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border dark:border-slate-700 gap-0.5 text-[9px] font-bold">
              <button
                onClick={() => setDashboardViewMode("landscape")}
                className={`px-3 py-1 rounded transition-all ${
                  (dashboardViewMode as string) === "landscape" ? "bg-white dark:bg-slate-700 text-[#002c06] dark:text-[#95d78e] shadow-sm font-extrabold" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                System Landscape
              </button>
              <button
                onClick={() => setDashboardViewMode("portrait")}
                className={`px-3 py-1 rounded transition-all ${
                  (dashboardViewMode as string) === "portrait" ? "bg-white dark:bg-slate-700 text-[#002c06] dark:text-[#95d78e] shadow-sm font-extrabold" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Phone Portrait
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#002c06] dark:text-[#95d78e] border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center transition-all active:scale-95 shadow-sm"
              title="Toggle Dark Mode"
            >
              <span className="material-symbols-outlined text-sm font-bold">
                {darkMode ? "light_mode" : "dark_mode"}
              </span>
            </button>

            <button
              onClick={() => onScreenChange("home")}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#002c06] dark:text-[#95d78e] border border-slate-200 dark:border-slate-700 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all"
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
              <h2 className="text-xl font-extrabold text-[#002c06] tracking-tight">{activeTabInfo.title}</h2>
              <p className="text-xs text-slate-500 mt-1">{activeTabInfo.subtitle}</p>
            </div>
          </div>

          {/* Render Active Tab */}
          {renderTabContents()}
        </main>
      </div>

      {/* NEW PRODUCT Listing modal (desktop overlay) */}
      {showAddModal && renderAddModal()}
    </div>
  );

  // Helper helper to render add modal content so we don't repeat it
  function renderAddModal() {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-surface rounded-xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh] font-sans">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#002c06]">New Product Batch Release</h3>
            <button onClick={() => setShowAddModal(false)} className="material-symbols-outlined text-slate-400 hover:text-slate-600">close</button>
          </div>

          <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold uppercase text-[#002c06] text-[9.5px]">Product Name</label>
              <input
                type="text"
                required
                value={newProductForm.name}
                onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                placeholder="e.g. Organic Sweet Potatoes"
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#002c06] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold uppercase text-[#002c06] text-[9.5px]">Price (₦)</label>
                <input
                  type="number"
                  required
                  value={newProductForm.price || ""}
                  onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                  placeholder="1200"
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#002c06] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase text-[#002c06] text-[9.5px]">Unit Size</label>
                <input
                  type="text"
                  value={newProductForm.unit}
                  onChange={(e) => setNewProductForm({ ...newProductForm, unit: e.target.value })}
                  placeholder="e.g. 1kg Bag"
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#002c06] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold uppercase text-[#002c06] text-[9.5px]">Category</label>
                <select
                  value={newProductForm.category}
                  onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value as any })}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#002c06] focus:outline-none"
                >
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="organic">Organic</option>
                  <option value="meat">Meat</option>
                  <option value="dairy">Dairy</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase text-[#002c06] text-[9.5px]">Harvest Source</label>
                <input
                  type="text"
                  value={newProductForm.farmSource}
                  onChange={(e) => setNewProductForm({ ...newProductForm, farmSource: e.target.value })}
                  placeholder="e.g. Jos Highlands Farms"
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#002c06] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase text-[#002c06] text-[9.5px]">Brief Description</label>
              <textarea
                value={newProductForm.description}
                onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                placeholder="Describe the freshness, quality, etc..."
                rows={2}
                className="w-full p-3 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#002c06] focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase text-[#002c06] text-[9.5px]">Product Image URL</label>
              <input
                type="text"
                value={newProductForm.image}
                onChange={(e) => setNewProductForm({ ...newProductForm, image: e.target.value })}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold focus:border-[#002c06] focus:outline-none text-[10px]"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={newProductForm.isOjaCertified}
                  onChange={(e) => setNewProductForm({ ...newProductForm, isOjaCertified: e.target.checked })}
                  className="accent-[#002c06] w-4 h-4"
                />
                <span>Oja Certified</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={newProductForm.isHandledByOja}
                  onChange={(e) => setNewProductForm({ ...newProductForm, isHandledByOja: e.target.checked })}
                  className="accent-[#002c06] w-4 h-4"
                />
                <span>Handled By Oja</span>
              </label>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-white hover:bg-slate-50 text-[#002c06] border border-slate-200 font-bold py-2.5 rounded-lg transition-all text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#002c06] hover:bg-[#002c06]/90 text-white border border-transparent font-bold py-2.5 rounded-lg transition-all text-xs uppercase shadow-sm"
              >
                Release Batch
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
};
