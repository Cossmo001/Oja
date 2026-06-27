import React, { useState, useEffect } from "react";

interface PartnerRegistrationProps {
  onBack: () => void;
  onComplete: () => void;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  farmName: string;
  farmLocation: string;
  farmSize: string;
  produceTypes: string[];
  uploadedFile: string | null;
  agreedToTerms: boolean;
  confirmedAccuracy: boolean;
}

const INITIAL_STATE: FormState = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  farmName: "",
  farmLocation: "",
  farmSize: "",
  produceTypes: ["Vegetables"],
  uploadedFile: null,
  agreedToTerms: false,
  confirmedAccuracy: false,
};

export const PartnerRegistration: React.FC<PartnerRegistrationProps> = ({
  onBack,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<FormState>(() => {
    const saved = localStorage.getItem("oja_partner_registration");
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Auto-save form draft on change
  useEffect(() => {
    localStorage.setItem("oja_partner_registration", JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError(null);
  };

  const toggleProduceType = (type: string) => {
    setFormData((prev) => {
      const exists = prev.produceTypes.includes(type);
      const updated = exists
        ? prev.produceTypes.filter((t) => t !== type)
        : [...prev.produceTypes, type];
      return { ...prev, produceTypes: updated };
    });
    setError(null);
  };

  // Mock Use Current Location
  const handleUseCurrentLocation = () => {
    setFormData((prev) => ({
      ...prev,
      farmLocation: "Jos Highlands Farm Cluster, Block 4B, Plateau State",
    }));
    setSuccessMsg("Location auto-detected via GPS!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        uploadedFile: e.target.files![0].name,
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        uploadedFile: e.dataTransfer.files[0].name,
      }));
    }
  };

  // Save for Later
  const handleSaveForLater = () => {
    localStorage.setItem("oja_partner_registration", JSON.stringify(formData));
    setSuccessMsg("Application draft saved successfully!");
    setTimeout(() => {
      setSuccessMsg(null);
      onBack();
    }, 2000);
  };

  // Navigation & Validation
  const validateStep1 = () => {
    if (!formData.fullName.trim()) return "Full Name is required.";
    if (!formData.email.trim()) return "Email Address is required.";
    if (!formData.email.includes("@")) return "Enter a valid email address.";
    if (!formData.phone.trim()) return "Phone Number is required.";
    if (!formData.address.trim()) return "Residential address is required.";
    return null;
  };

  const validateStep2 = () => {
    if (!formData.farmName.trim()) return "Farm Name is required.";
    if (!formData.farmLocation.trim()) return "Farm Location is required.";
    if (!formData.farmSize.trim() || isNaN(Number(formData.farmSize)) || Number(formData.farmSize) <= 0) {
      return "Please enter a valid farm size in hectares.";
    }
    if (formData.produceTypes.length === 0) {
      return "Select at least one produce type.";
    }
    return null;
  };

  const handleNextStep = () => {
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setError(err);
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handleSubmit = () => {
    if (!formData.agreedToTerms) {
      setError("You must agree to the Terms of Service & Privacy Policy.");
      return;
    }
    if (!formData.confirmedAccuracy) {
      setError("You must confirm that all provided information is accurate.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Mock API submission
    setTimeout(() => {
      setIsSubmitting(false);
      localStorage.removeItem("oja_partner_registration"); // clear state on successful submission
      onComplete(); // proceed to Dashboard
    }, 1500);
  };

  return (
    <div className="min-h-full flex flex-col bg-[#F5F5F0] fade-in pb-28">
      {/* Top Header Bar */}
      <header className="flex justify-between items-center px-5 h-16 w-full bg-[#F5F5F0] border-b-4 border-[#0B3014] sticky top-0 z-30">
        <button
          onClick={step === 1 ? onBack : handlePrevStep}
          className="text-[#0B3014] hover:bg-[#E8E8E3] rounded-xl p-2 border-2 border-[#0B3014] shadow-[2px_2px_0px_0px_#0B3014] flex items-center justify-center transition-all active:scale-95 bg-white"
        >
          <span className="material-symbols-outlined text-xl font-bold">arrow_back</span>
        </button>
        <h1 className="font-headline font-black text-lg text-[#0B3014] uppercase tracking-tighter">
          Partner Registration
        </h1>
        <button
          onClick={() => alert("Oja Partner Support: Standard onboarding requires complete identification, land certification, and hygiene standards verification.")}
          className="text-[#0B3014] hover:bg-[#E8E8E3] rounded-xl p-2 border-2 border-[#0B3014] shadow-[2px_2px_0px_0px_#0B3014] flex items-center justify-center transition-all active:scale-95 bg-white"
        >
          <span className="material-symbols-outlined text-xl font-bold">help_outline</span>
        </button>
      </header>

      {/* Main Content Scroll container */}
      <div className="p-5 flex-1 space-y-6">
        {/* Progress Stepper bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-[#0B3014]">
            <span className={step === 1 ? "text-[#FF4D00]" : "opacity-40"}>Step 1: Contact Details</span>
            <span className={step === 2 ? "text-[#FF4D00]" : "opacity-40"}>Step 2: Farm Details</span>
            <span className={step === 3 ? "text-[#FF4D00]" : "opacity-40"}>Step 3: Review</span>
          </div>
          <div className="flex gap-2.5 h-3 border-2 border-[#0B3014] rounded-full p-0.5 bg-white overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                step >= 1 ? "bg-[#FF4D00]" : "bg-transparent"
              }`}
              style={{ width: "33.33%" }}
            />
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                step >= 2 ? "bg-[#FF4D00]" : "bg-transparent"
              }`}
              style={{ width: "33.33%" }}
            />
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                step >= 3 ? "bg-[#FF4D00]" : "bg-transparent"
              }`}
              style={{ width: "33.33%" }}
            />
          </div>
          <div className="text-center">
            <span className="text-[10px] text-[#0B3014]/60 font-bold uppercase tracking-widest">
              Step {step} of 3
            </span>
          </div>
        </div>

        {/* Global Success / Error Notices */}
        {error && (
          <div className="bg-[#FF4D00]/10 border-2 border-[#FF4D00] text-[#0B3014] p-3 rounded-xl flex items-start gap-2 shadow-[3px_3px_0px_0px_#FF4D00] text-xs font-black uppercase tracking-tight">
            <span className="material-symbols-outlined text-lg">error</span>
            <div>{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="bg-white border-2 border-[#0B3014] text-[#0B3014] p-3 rounded-xl flex items-start gap-2 shadow-[3px_3px_0px_0px_#0B3014] text-xs font-black uppercase tracking-tight">
            <span className="material-symbols-outlined text-[#FF4D00] text-lg">verified</span>
            <div>{successMsg}</div>
          </div>
        )}

        {/* ================= STEP 1: CONTACT DETAILS ================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-[#0B3014] uppercase tracking-tighter font-headline leading-none">
                Tell us about yourself
              </h2>
              <p className="text-xs text-[#0B3014]/70 leading-relaxed font-sans">
                We need your contact information to get started with your application.
              </p>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#0B3014]" htmlFor="fullName">
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#0B3014]/50">
                    person
                  </span>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Jane Doe"
                    className="w-full h-14 pl-10 pr-4 bg-white border-2 border-[#0B3014] rounded-xl text-xs font-bold text-[#0B3014] focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 placeholder:text-[#0B3014]/35 shadow-[2px_2px_0px_0px_#0B3014]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#0B3014]" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#0B3014]/50">
                    mail
                  </span>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jane.doe@example.com"
                    className="w-full h-14 pl-10 pr-4 bg-white border-2 border-[#0B3014] rounded-xl text-xs font-bold text-[#0B3014] focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 placeholder:text-[#0B3014]/35 shadow-[2px_2px_0px_0px_#0B3014]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#0B3014]" htmlFor="phone">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#0B3014]/50">
                    phone
                  </span>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-14 pl-10 pr-4 bg-white border-2 border-[#0B3014] rounded-xl text-xs font-bold text-[#0B3014] focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 placeholder:text-[#0B3014]/35 shadow-[2px_2px_0px_0px_#0B3014]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#0B3014]" htmlFor="address">
                  Residential / Physical Address
                </label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Farm Lane, Green Valley..."
                  rows={3}
                  className="w-full p-4 bg-white border-2 border-[#0B3014] rounded-xl text-xs font-bold text-[#0B3014] focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 placeholder:text-[#0B3014]/35 shadow-[2px_2px_0px_0px_#0B3014] resize-none"
                />
              </div>
            </form>
          </div>
        )}

        {/* ================= STEP 2: FARM PROFILE ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-[#0B3014] uppercase tracking-tighter font-headline leading-none">
                Farm Profile
              </h2>
              <p className="text-xs text-[#0B3014]/70 leading-relaxed font-sans">
                Tell us about your land and your active crops or commodities.
              </p>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#0B3014]" htmlFor="farmName">
                  Farm Name
                </label>
                <input
                  type="text"
                  id="farmName"
                  value={formData.farmName}
                  onChange={handleInputChange}
                  placeholder="e.g. Green Valley Estates"
                  className="w-full h-14 px-4 bg-white border-2 border-[#0B3014] rounded-xl text-xs font-bold text-[#0B3014] focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 placeholder:text-[#0B3014]/35 shadow-[2px_2px_0px_0px_#0B3014]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#0B3014]" htmlFor="farmLocation">
                  Farm Location
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#0B3014]/50">
                      location_on
                    </span>
                    <input
                      type="text"
                      id="farmLocation"
                      value={formData.farmLocation}
                      onChange={handleInputChange}
                      placeholder="Enter full address"
                      className="w-full h-14 pl-10 pr-4 bg-white border-2 border-[#0B3014] rounded-xl text-xs font-bold text-[#0B3014] focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 placeholder:text-[#0B3014]/35 shadow-[2px_2px_0px_0px_#0B3014]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="h-14 px-3 bg-[#E8E8E3] border-2 border-[#0B3014] rounded-xl flex items-center justify-center gap-1 hover:bg-white text-xs font-black uppercase tracking-tight text-[#0B3014] shadow-[2px_2px_0px_0px_#0B3014] transition-all active:scale-95 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[#FF4D00] text-sm font-bold">my_location</span>
                    <span className="hidden sm:inline text-[10px]">Use Current</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#0B3014]" htmlFor="farmSize">
                  Total Farm Size (Hectares)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="farmSize"
                  value={formData.farmSize}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full h-14 px-4 bg-white border-2 border-[#0B3014] rounded-xl text-xs font-bold text-[#0B3014] focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 placeholder:text-[#0B3014]/35 shadow-[2px_2px_0px_0px_#0B3014]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#0B3014]">
                  Produce Types
                </label>
                <p className="text-[10px] text-[#0B3014]/60 font-bold uppercase">Select all that apply.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {["Vegetables", "Fruits", "Grains", "Dairy", "Livestock"].map((type) => {
                    const isSelected = formData.produceTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleProduceType(type)}
                        className={`px-3 py-2 border-2 border-[#0B3014] text-xs font-black uppercase tracking-wide rounded-full flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_0px_#0B3014] active:scale-95 ${
                          isSelected
                            ? "bg-[#0B3014] text-white"
                            : "bg-white text-[#0B3014] hover:bg-[#E8E8E3]"
                        }`}
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-xs text-[#FF4D00] font-black">
                            check
                          </span>
                        )}
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* File Upload Drag & Drop Container */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#0B3014]">
                  Certification Documents
                </label>
                <p className="text-[10px] text-[#0B3014]/60 font-bold uppercase">
                  Upload Land Title or Farm Certification to establish trust.
                </p>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-4 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer relative ${
                    isDragging
                      ? "border-[#FF4D00] bg-[#FF4D00]/5"
                      : "border-[#0B3014] bg-white hover:bg-[#E8E8E3]/20"
                  }`}
                >
                  <input
                    type="file"
                    id="fileInput"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-12 h-12 rounded-full bg-[#E8E8E3] border-2 border-[#0B3014] flex items-center justify-center mb-3 text-[#FF4D00] shadow-[2px_2px_0px_0px_#0B3014]">
                    <span className="material-symbols-outlined text-xl font-bold">upload_file</span>
                  </div>
                  <span className="text-xs font-black uppercase tracking-tight text-[#0B3014] mb-1">
                    {formData.uploadedFile ? "File selected!" : "Click to upload or drag and drop"}
                  </span>
                  <span className="text-[10px] text-[#0B3014]/60 font-bold uppercase">
                    {formData.uploadedFile ? formData.uploadedFile : "PDF, JPG, or PNG (Max 5MB)"}
                  </span>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ================= STEP 3: REVIEW & AGREEMENT ================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-[#0B3014] uppercase tracking-tighter font-headline leading-none">
                Final Review & Agreement
              </h2>
              <p className="text-xs text-[#0B3014]/70 leading-relaxed font-sans">
                Please review our terms and confirm your commitment to Oja's quality standards.
              </p>
            </div>

            {/* Terms and Conditions Scroll Box */}
            <section className="bg-white rounded-2xl p-4 border-4 border-[#0B3014] shadow-[6px_6px_0px_0px_#0B3014] space-y-3">
              <div className="flex items-center gap-2 text-[#0B3014]">
                <span className="material-symbols-outlined text-[#FF4D00] text-lg font-bold">description</span>
                <h3 className="text-xs font-black uppercase tracking-wider">Terms & Conditions</h3>
              </div>

              <div className="h-44 overflow-y-auto bg-[#F5F5F0] rounded-xl p-3 border-2 border-[#0B3014] text-[11px] text-[#0B3014]/80 leading-relaxed space-y-3 font-sans custom-scrollbar">
                <div>
                  <p className="font-black text-[#0B3014] uppercase text-[10px] mb-0.5">1. Introduction</p>
                  <p>Welcome to Oja. By partnering with us, you agree to adhere to our strict "Certified Freshness" standards. This agreement outlines your responsibilities as a verified supplier on our platform.</p>
                </div>
                <div>
                  <p className="font-black text-[#0B3014] uppercase text-[10px] mb-0.5">2. Quality Standards</p>
                  <p>All produce listed on Oja must meet or exceed local agricultural health and safety regulations. Partners must allow periodic audits by Oja representatives to maintain "Certified" status.</p>
                </div>
                <div>
                  <p className="font-black text-[#0B3014] uppercase text-[10px] mb-0.5">3. Pricing and Fees</p>
                  <p>Oja operates on a transparent commission model. Details of current transaction fees are outlined in the Partner Portal. You retain the right to set your own baseline prices for goods.</p>
                </div>
                <div>
                  <p className="font-black text-[#0B3014] uppercase text-[10px] mb-0.5">4. Logistics and Fulfillment</p>
                  <p>Partners utilizing "Handled by Oja" logistics must have produce ready for collection at agreed-upon times. Failure to meet fulfillment windows may result in temporary suspension of active listings.</p>
                </div>
              </div>
            </section>

            {/* Data Privacy Section */}
            <section className="bg-white rounded-2xl p-4 border-4 border-[#0B3014] shadow-[6px_6px_0px_0px_#0B3014] space-y-3">
              <div className="flex items-center gap-2 text-[#0B3014]">
                <span className="material-symbols-outlined text-[#FF4D00] text-lg font-bold">shield_lock</span>
                <h3 className="text-xs font-black uppercase tracking-wider">Data Privacy</h3>
              </div>
              <p className="text-[11px] text-[#0B3014]/70 leading-relaxed font-sans">
                Your trust is paramount. Oja securely stores your farm location and contact details strictly for logistics coordination, auditing, and platform verification. We do not sell your personal data to third parties.
              </p>
              <div className="flex items-center gap-2 bg-[#E8E8E3] p-2.5 rounded-xl border-2 border-[#0B3014]">
                <span className="material-symbols-outlined text-green-700 text-lg font-bold">verified_user</span>
                <span className="text-[10px] text-[#0B3014] font-black uppercase tracking-tight">Protected by end-to-end encryption.</span>
              </div>
            </section>

            {/* Agreement Checkboxes */}
            <section className="space-y-3">
              <label className="flex items-start gap-3 p-3 bg-white border-2 border-[#0B3014] rounded-xl shadow-[3px_3px_0px_0px_#0B3014] cursor-pointer hover:bg-[#E8E8E3]/20 transition-all">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, agreedToTerms: e.target.checked }));
                    setError(null);
                  }}
                  className="mt-0.5 w-4.5 h-4.5 accent-[#FF4D00] cursor-pointer border-2 border-[#0B3014] rounded"
                />
                <span className="text-xs text-[#0B3014] font-bold font-sans">
                  I agree to the Oja Partner Terms of Service and Privacy Policy.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white border-2 border-[#0B3014] rounded-xl shadow-[3px_3px_0px_0px_#0B3014] cursor-pointer hover:bg-[#E8E8E3]/20 transition-all">
                <input
                  type="checkbox"
                  checked={formData.confirmedAccuracy}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, confirmedAccuracy: e.target.checked }));
                    setError(null);
                  }}
                  className="mt-0.5 w-4.5 h-4.5 accent-[#FF4D00] cursor-pointer border-2 border-[#0B3014] rounded"
                />
                <span className="text-xs text-[#0B3014] font-bold font-sans">
                  I confirm that all information provided is accurate and verifiable.
                </span>
              </label>
            </section>
          </div>
        )}

        {/* Action buttons (Bottom of scroll list inside layout) */}
        <div className="pt-4 space-y-3">
          {step < 3 ? (
            <button
              onClick={handleNextStep}
              className="w-full bg-[#0B3014] hover:bg-[#FF4D00] text-white hover:text-white font-black py-4 rounded-xl shadow-[4px_4px_0px_0px_#FF4D00] border-2 border-[#0B3014] transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
            >
              Next Step
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-[#0B3014] hover:bg-green-700 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-[4px_4px_0px_0px_#FF4D00] border-2 border-[#0B3014] transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
            >
              {isSubmitting ? "Submitting Application..." : "Submit Application"}
              <span className="material-symbols-outlined text-sm font-bold">send</span>
            </button>
          )}

          <button
            onClick={handleSaveForLater}
            className="w-full bg-white hover:bg-[#E8E8E3] text-[#0B3014] font-black py-3.5 rounded-xl border-2 border-[#0B3014] shadow-[3px_3px_0px_0px_#0B3014] text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            Save for Later
            <span className="material-symbols-outlined text-sm font-bold">save</span>
          </button>
        </div>
      </div>
    </div>
  );
};
