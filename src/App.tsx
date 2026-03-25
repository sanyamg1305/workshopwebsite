/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StrategyReport } from './components/StrategyReport';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ChevronRight, 
  Copy, 
  Linkedin, 
  Target, 
  Zap, 
  Globe, 
  TrendingUp, 
  Send, 
  MessageSquare, 
  LayoutDashboard,
  ArrowRight,
  ExternalLink,
  Loader2,
  Sparkles,
  User,
  Download,
  Briefcase,
  Image,
  Share2,
  Calendar,
  Layers,
  Search,
  Check,
  ChevronDown,
  X,
  Upload
} from 'lucide-react';
import * as gemini from './services/gemini';
import { supabase } from './services/supabase';

// --- Types ---

type StepId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface WorkshopState {
  currentStep: StepId;
  completedSteps: StepId[];
  submissionId: string | null;
  inputs: {
    fullName: string;
    workEmail: string;
    phone: string;
    companyName: string;
    leadRole: string[];
    leadRoleOther: string;
    linkedinUrl: string;
    linkedinHeadline: string;
    linkedinAbout: string;
    targetIcp: string[];
    targetIcpOther: string;
    tonePreference: string[];
    tonePreferenceOther: string;
    offer: string;
    
    // ICP 1
    icp1_roles: string[];
    icp1_rolesOther: string;
    icp1_sizes: string[];
    icp1_sizesOther: string;
    icp1_industries: string[];
    icp1_industriesOther: string;

    // ICP 2
    icp2_roles: string[];
    icp2_rolesOther: string;
    icp2_sizes: string[];
    icp2_sizesOther: string;
    icp2_industries: string[];
    icp2_industriesOther: string;

    // ICP 3
    icp3_roles: string[];
    icp3_rolesOther: string;
    icp3_sizes: string[];
    icp3_sizesOther: string;
    icp3_industries: string[];
    icp3_industriesOther: string;

    industry: string[];
    industryOther: string;
    companySize: string[];
    companySizeOther: string;
    geography: string[];
    geographyOther: string;
    decisionMaker: string[];
    decisionMakerOther: string;
    painPoints: string[];
    painPointsOther: string;
    budget: string[];
    budgetOther: string;
    outcome: string[];
    outcomeOther: string;
    method: string[];
    methodOther: string;
    replacement: string[];
    replacementOther: string;
    brandName: string;
    primaryColor: string;
    secondaryColor: string;
    inspirationImage: string | null;
    campaignType: string[];
    campaignTypeOther: string;
    tone: string[];
    toneOther: string;
    cta: string[];
    ctaOther: string;
    numFollowUps: string;
    numFollowUpsOther: string;
    freeOfferType: string;
    freeOfferTypeOther: string;
    toolName: string;
    toolDescription: string;
    strategicNotes: string;
    narrativeAngles: string[];
    narrativeAnglesOther: string;
    dmAngle: string[];
    dmAngleOther: string;
    dmTone: string[];
    dmToneOther: string;
  };
  outputs: {
    profileClarityScore: number;
    scoreMeaning: string;
    scoreExplanation: string;
    optimizedHeadlines: string[];
    optimizedAbout: string;
    positioningAngles: string;
    keywordScore: number;
    icps: gemini.DetailedICP[];
    icpSummary: string;
    valueProp: string;
    websitePrompt: string;
    gtmStrategy: gemini.GTMStrategy | null;
    campaignFlow: string[];
    outreachCampaign: gemini.OutreachCampaign | null;
    dmMessages: { name: string; message: string; whyItWorks: string }[];
    valuePropTables: gemini.ValuePropTable[];
    globalSolution: string;
    profileImprovements?: string[];
  };
}

// --- Context ---

const WorkshopContext = createContext<{
  state: WorkshopState;
  setStep: (step: StepId) => void;
  updateInput: (key: keyof WorkshopState['inputs'], value: any) => void;
  completeStep: (step: StepId) => void;
  generateOutput: (step: StepId) => Promise<void>;
  updateOutput: (key: keyof WorkshopState['outputs'], value: any) => void;
  setSubmissionId: (id: string) => void;
} | null>(null);

const useWorkshop = () => {
  const context = useContext(WorkshopContext);
  if (!context) throw new Error('useWorkshop must be used within WorkshopProvider');
  return context;
};

// --- Components ---

const MultiSelectDropdown = ({ 
  label, 
  options: initialOptions, 
  selected, 
  onChange, 
  placeholder = "Select options...",
  isSearchable = true,
  showOther = true,
  otherValue = "",
  onOtherChange = () => {},
  singleSelect = false,
  showErrors = false
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  isSearchable?: boolean;
  showOther?: boolean;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
  singleSelect?: boolean;
  showErrors?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ensure "Other" is the last option if showOther is true
  const options = showOther 
    ? [...initialOptions.filter(o => o !== 'Other'), 'Other'] 
    : initialOptions;

  // Filter options based on search term, but ALWAYS keep "Other" if it exists
  const filteredOptions = options.filter(opt => {
    if (opt === 'Other') return true; // Always show "Other" at the bottom
    return opt.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleOption = (opt: string) => {
    if (singleSelect) {
      if (selected.includes(opt)) {
        onChange([]); // Deselect if already selected
      } else {
        onChange([opt]);
      }
      setIsOpen(false);
    } else {
      const next = selected.includes(opt)
        ? selected.filter(v => v !== opt)
        : [...selected, opt];
      onChange(next);
    }
  };

  const isOtherSelected = selected.includes('Other');

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="text-xs font-bold uppercase text-text-secondary tracking-wider">{label}</label>
      <div className="relative">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`min-h-[52px] w-full px-4 py-2 rounded-xl border ${isOpen ? 'border-primary' : 'border-border'} bg-bg flex flex-wrap gap-2 items-center cursor-pointer hover:border-primary/50 transition-all pr-10`}
        >
          {selected.length === 0 && <span className="text-text-secondary text-sm">{placeholder}</span>}
          {selected.map(val => (
            <div key={val} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-lg border border-primary/20">
              {val === 'Other' && otherValue ? `Other: ${otherValue}` : val}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(val);
                }}
                className="hover:text-primary-dark"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
            <ChevronDown size={20} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute z-50 w-full mt-2 bg-section border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {isSearchable && (
                <div className="p-3 border-b border-border flex items-center gap-2 bg-bg/50">
                  <Search size={16} className="text-text-secondary" />
                  <input 
                    type="text"
                    placeholder="Search options..."
                    className="bg-transparent border-none outline-none text-sm w-full text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                {filteredOptions.map(opt => (
                  <div 
                    key={opt}
                    onClick={() => toggleOption(opt)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selected.includes(opt) ? 'bg-primary/10 text-primary' : 'hover:bg-bg'}`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selected.includes(opt) ? 'bg-primary border-primary' : 'border-border'}`}>
                      {selected.includes(opt) && <Check size={14} className="text-black" />}
                    </div>
                    <span className="text-sm font-medium">{opt}</span>
                  </div>
                ))}
                {filteredOptions.length === 0 && (
                  <div className="p-4 text-center text-text-secondary text-sm italic">No options found</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showErrors && selected.length === 0 && (
        <p className="text-red-500 text-[10px] mt-1 font-medium">This field is required</p>
      )}
      <AnimatePresence>
        {showOther && isOtherSelected && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2 overflow-hidden"
          >
            <label className="text-[10px] font-bold uppercase text-primary tracking-widest">Please specify *</label>
            <input
              type="text"
              required
              placeholder="Type your answer..."
              style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
              className={`w-full px-4 py-3 rounded-xl border ${!otherValue ? 'border-red-500/50' : 'border-border'} focus:border-[#FFC947] focus:ring-1 focus:ring-[#FFC947] outline-none text-sm transition-all`}
              value={otherValue}
              onChange={(e) => onOtherChange(e.target.value)}
            />
            {!otherValue && (
              <p className="text-[10px] text-red-500 font-medium">Please specify your selection</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Step0LeadCapture = () => {
  const { state, updateInput, setStep, completeStep, setSubmissionId } = useWorkshop();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (error) setError('');
  }, [state.inputs.fullName, state.inputs.workEmail, state.inputs.phone, state.inputs.companyName, state.inputs.leadRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, workEmail, phone, companyName, leadRole } = state.inputs;
    
    if (!fullName || !workEmail || !phone || !companyName) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save to Supabase (Optional - don't block the workshop if it fails)
      try {
        const { data, error: sbError } = await supabase
          .from('workshop_submissions')
          .insert({
            full_name: fullName,
            work_email: workEmail,
            phone: phone,
            company_name: companyName,
            lead_role: leadRole,
            current_step: 0,
            workshop_inputs: state.inputs,
            workshop_outputs: state.outputs
          })
          .select()
          .single();

        if (sbError) {
          console.warn("Supabase Insert Error (Non-blocking):", sbError);
        } else if (data) {
          setSubmissionId(data.id);
          // Save submission ID to localStorage for recovery
          const leadData = { fullName, workEmail, phone, companyName, leadRole, submissionId: data.id };
          localStorage.setItem('userLeadData', JSON.stringify(leadData));
        }
      } catch (sbCatchError) {
        console.warn("Supabase Catch Error (Non-blocking):", sbCatchError);
      }

      // Always save to localStorage as a fallback
      if (!localStorage.getItem('userLeadData')) {
        const leadData = { fullName, workEmail, phone, companyName, leadRole };
        localStorage.setItem('userLeadData', JSON.stringify(leadData));
      }
      
      completeStep(0);
      setStep(1);
    } catch (err: any) {
      console.error("Workshop Start Error:", err);
      setError('Failed to start workshop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-bg flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-section border border-border rounded-3xl p-8 md:p-12 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center font-black text-2xl text-black mx-auto mb-6 shadow-lg shadow-primary/20">M</div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-primary mb-4">
            Start Your B2B Growth Workshop
          </h1>
          <p className="text-text-secondary text-lg">
            Enter your details to generate your personalized growth system.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-text-secondary">Full Name *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg text-lg"
                value={state.inputs.fullName}
                onChange={(e) => updateInput('fullName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-text-secondary">Work Email *</label>
              <input
                type="email"
                required
                className="w-full px-4 py-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg text-lg"
                value={state.inputs.workEmail}
                onChange={(e) => updateInput('workEmail', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-text-secondary">Phone Number *</label>
              <input
                type="tel"
                required
                className="w-full px-4 py-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg text-lg"
                value={state.inputs.phone}
                onChange={(e) => updateInput('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-text-secondary">Company Name *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg text-lg"
                value={state.inputs.companyName}
                onChange={(e) => updateInput('companyName', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <MultiSelectDropdown showErrors={showErrors}
              label="Role (Optional)"
              options={['Founder', 'Marketer', 'Sales', 'Freelancer']}
              selected={state.inputs.leadRole}
              onChange={(val) => updateInput('leadRole', val)}
              otherValue={state.inputs.leadRoleOther}
              onOtherChange={(val) => updateInput('leadRoleOther', val)}
              placeholder="Select Role(s)"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Starting...
              </>
            ) : (
              <>
                Start Workshop
                <ArrowRight size={24} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const SidebarItem = ({ id, label, icon: Icon, active, completed, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
      active 
        ? 'bg-primary text-black font-bold shadow-sm' 
        : 'hover:bg-section text-text-secondary'
    }`}
  >
    <div className={`flex-shrink-0 ${active ? 'text-black' : 'text-text-secondary'}`}>
      {completed ? <CheckCircle2 size={18} className={active ? "text-black" : "text-primary"} /> : <Icon size={18} />}
    </div>
    <span className="text-sm truncate">{label}</span>
    {active && <ChevronRight size={16} className="ml-auto" />}
  </button>
);

const Chip = ({ label, selected, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full border text-sm transition-all duration-200 ${
      selected 
        ? 'bg-primary border-primary text-black font-medium' 
        : 'bg-section border-border text-text-secondary hover:border-primary'
    }`}
  >
    {label}
  </button>
);

const OutputCard = ({ title, children, highlight = false, copyText, icon: Icon }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`mt-8 p-6 rounded-2xl border-2 ${
      highlight ? 'border-primary bg-primary/5' : 'border-border bg-section'
    } shadow-sm`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-primary" />}
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">{title}</h4>
      </div>
      <button 
        onClick={() => {
          const text = copyText || (typeof children === 'string' ? children : document.getElementById(`output-${title}`)?.innerText);
          navigator.clipboard.writeText(text || '');
          alert('Copied to clipboard!');
        }}
        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-primary"
      >
        <Copy size={16} />
      </button>
    </div>
    <div id={`output-${title}`} className="text-lg font-medium leading-relaxed">
      {children}
    </div>
  </motion.div>
);

// --- Steps ---

const Step1ProfileCheck = () => {
  const [showErrors, setShowErrors] = useState(false);
  const { state, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = ['Founder', 'CEO', 'Consultant', 'Freelancer', 'Agency Owner', 'Sales Leader', 'Marketing Director'];
  const icps = ['SaaS Founders', 'Talent Leaders', 'Marketing Managers', 'Sales Directors', 'E-commerce Owners', 'Tech Recruiters', 'Operations Heads'];
  const tones = ['Bold', 'Professional', 'Casual', 'Witty', 'Direct', 'Empathetic', 'Data-driven'];

  const handleOptimize = async () => {    setShowErrors(true);
    setTimeout(async () => {
      const firstError = document.querySelector(".border-red-500, .border-red-500\\/50");
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      
      setLoading(true);
      if (typeof setError !== 'undefined') setError(null);
      let success = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await generateOutput(1);
          success = true;
          break;
        } catch (err) {
          if (attempt === 2) {
            if (typeof setError !== 'undefined') setError("Something went wrong. Please try again.");
            else alert("Something went wrong. Please try again.");
          }
        }
      }
      setLoading(false);
    }, 100);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Profile Optimizer</h2>
        <p className="text-text-secondary">Optimize your LinkedIn profile for maximum conversion.</p>
      </div>

      <div className="bg-section p-6 rounded-2xl border border-border space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-text-secondary">LinkedIn Profile URL *</label>
          <input
            type="url"
            placeholder="https://linkedin.com/in/..."
            className={`w-full px-4 py-3 rounded-xl border ${showErrors && (!state.inputs.linkedinUrl || String(state.inputs.linkedinUrl).trim() === "") ? "border-red-500" : "border-border"} focus:ring-2 focus:ring-primary/50 outline-none bg-bg`}
            value={state.inputs.linkedinUrl}
            onChange={(e) => updateInput("linkedinUrl", e.target.value)}
          />
          
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-text-secondary">LinkedIn Headline *</label>
          <input
            type="text"
            placeholder="e.g. Founder @ XYZ | Helping..."
            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg"
            value={state.inputs.linkedinHeadline}
            onChange={(e) => updateInput('linkedinHeadline', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-text-secondary">About Section</label>
          <textarea
            placeholder="Paste your About section here..."
            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg min-h-[120px]"
            value={state.inputs.linkedinAbout}
            onChange={(e) => updateInput('linkedinAbout', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-text-secondary">What do you offer?</label>
          <input
            type="text"
            placeholder="e.g. We help [ICP] achieve [outcome] or X → Y for Z"
            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg"
            value={state.inputs.offer}
            onChange={(e) => updateInput('offer', e.target.value)}
          />
          <p className="text-[10px] text-text-secondary">Example: "Reduce hiring time → for Talent Leaders → using automation"</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MultiSelectDropdown showErrors={showErrors}
            label="Target ICP"
            options={icps}
            selected={state.inputs.targetIcp}
            onChange={(val) => updateInput('targetIcp', val)}
            otherValue={state.inputs.targetIcpOther}
            onOtherChange={(val) => updateInput('targetIcpOther', val)}
            placeholder="Select ICP(s)"
          />
        </div>

        <MultiSelectDropdown showErrors={showErrors}
          label="Tone Preference"
          options={tones}
          selected={state.inputs.tonePreference}
          onChange={(val) => updateInput('tonePreference', val)}
          otherValue={state.inputs.tonePreferenceOther}
          onOtherChange={(val) => updateInput('tonePreferenceOther', val)}
          placeholder="Select Tone(s)"
        />

        <button
          onClick={handleOptimize}
          disabled={loading || !state.inputs.linkedinHeadline || !state.inputs.linkedinAbout || state.inputs.targetIcp.length === 0 || state.inputs.tonePreference.length === 0 || !state.inputs.offer}
          className="w-full py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Optimizing Profile...
            </>
          ) : (
            <>
              Optimize My Profile
              <Zap size={24} />
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
          {error}
        </div>
      )}

      {state.outputs.profileClarityScore > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center p-8 bg-section rounded-2xl border border-border group hover:border-primary transition-colors">
              <div className="text-6xl font-black text-primary mb-2 group-hover:scale-110 transition-transform">{state.outputs.profileClarityScore}</div>
              <div className="text-sm font-bold uppercase tracking-widest text-text-secondary">Clarity Score</div>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-section rounded-2xl border border-border group hover:border-primary transition-colors">
              <div className="text-6xl font-black text-primary mb-2 group-hover:scale-110 transition-transform">{state.outputs.keywordScore}</div>
              <div className="text-sm font-bold uppercase tracking-widest text-text-secondary">Keyword Score</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-section border border-border rounded-2xl">
              <h4 className="text-xs font-bold uppercase text-text-secondary mb-3">Score Meaning</h4>
              <p className="text-sm leading-relaxed">{state.outputs.scoreMeaning}</p>
            </div>
            <div className="p-6 bg-section border border-border rounded-2xl">
              <h4 className="text-xs font-bold uppercase text-text-secondary mb-3">User Explanation</h4>
              <p className="text-sm leading-relaxed">{state.outputs.scoreExplanation}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              Optimized Headlines
            </h4>
            <div className="space-y-3">
              {state.outputs.optimizedHeadlines.map((h, i) => (
                <div key={i} className="p-5 bg-section border border-border rounded-xl flex items-center justify-between group hover:border-primary/50 transition-all">
                  <span className="text-sm font-medium leading-relaxed">{h}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(h);
                      alert('Headline copied!');
                    }}
                    className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 rounded-lg text-primary"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <OutputCard title="Optimized About Section" copyText={state.outputs.optimizedAbout} icon={User}>
            <div className="text-sm leading-relaxed whitespace-pre-wrap font-normal text-text-secondary">
              {state.outputs.optimizedAbout}
            </div>
          </OutputCard>

          <div className="p-8 bg-primary/5 border-2 border-primary/20 rounded-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(state.outputs.positioningAngles);
                  alert('Positioning copied!');
                }}
                className="p-2 hover:bg-primary/10 rounded-lg text-primary"
              >
                <Copy size={16} />
              </button>
            </div>
            <h4 className="text-xs font-bold uppercase text-primary mb-4 tracking-widest flex items-center gap-2">
              <Target size={16} />
              Positioning Angles
            </h4>
            <p className="text-xl font-bold italic leading-relaxed">"{state.outputs.positioningAngles}"</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const Step2ICPBuilder = () => {
  const [showErrors, setShowErrors] = useState(false);
  const { state, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIcp, setActiveIcp] = useState<1 | 2 | 3>(1);

  const handleGenerate = async () => {    setShowErrors(true);
    setTimeout(async () => {
      // 1. Check for basic "This field is required" errors (HTML/CSS indicators)
      const firstError = document.querySelector(".border-red-500, .border-red-500\\/50");
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // 2. Strict ICP Validation rule: Role, Size, and Industry must all be filled for an ICP to be valid
      const buildIcp = (num: number) => {
        const roles = state.inputs[`icp${num}_roles` as keyof typeof state.inputs] as string[];
        const sizes = state.inputs[`icp${num}_sizes` as keyof typeof state.inputs] as string[];
        const inds = state.inputs[`icp${num}_industries` as keyof typeof state.inputs] as string[];
        
        if (!roles || roles.length === 0 || !sizes || sizes.length === 0 || !inds || inds.length === 0) return null;
        
        return { roles, sizes, inds };
      };

      const validIcps = [buildIcp(1), buildIcp(2), buildIcp(3)].filter(Boolean);
      
      if (validIcps.length === 0) {
        setError("Please complete all required fields (Role, Size, and Industry) for at least one ICP before generating.");
        return;
      }
      
      setLoading(true);
      if (typeof setError !== 'undefined') setError(null);
      let success = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await generateOutput(2);
          success = true;
          break;
        } catch (err) {
          if (attempt === 2) {
            if (typeof setError !== 'undefined') setError("Something went wrong. Please try again.");
            else alert("Something went wrong. Please try again.");
          }
        }
      }
      setLoading(false);
    }, 100);
  };

  const roles = [
    'Founder', 'Co-founder', 'CEO', 'COO', 'CMO', 'Head of Marketing', 'Head of Sales', 
    'VP Sales', 'Growth Lead', 'Demand Gen Manager', 'SDR Manager', 'Recruiter', 
    'Head of Talent', 'CHRO', 'Product Manager', 'CTO', 'Operations Head', 
    'Consultant', 'Agency Owner', 'Freelancer', 'Other'
  ];
  const sizes = ['1–10', '10–50', '50–200', '200–500', '500–1000', '1000+', 'Other'];
  const industries = [
    'SaaS', 'Fintech', 'Healthtech', 'Edtech', 'E-commerce', 'D2C', 'Agencies', 
    'Consulting', 'Coaching', 'Real Estate', 'Manufacturing', 'Logistics', 
    'HR Tech', 'Martech', 'Legal', 'Finance', 'Healthcare', 'Recruitment', 
    'IT Services', 'Web3 / Crypto', 'Gaming', 'Media', 'Hospitality', 
    'Travel', 'Education', 'Non-profit', 'Government', 'Local Businesses', 
    'Freelancers', 'B2B Services', 'B2B SaaS', 'Marketplaces', 'AI / ML Startups', 
    'Enterprise Software', 'Cybersecurity', 'DevTools', 'Climate Tech', 'Automotive', 'Retail', 'Other'
  ];

  const renderIcpForm = (num: 1 | 2 | 3) => {
    const prefix = `icp${num}_` as any;
    return (
      <motion.div 
        key={num}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6 bg-section p-8 rounded-3xl border border-border"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black">
            {num}
          </div>
          <h3 className="text-xl font-bold">Define ICP {num}</h3>
        </div>

        <MultiSelectDropdown showErrors={showErrors}
          label="Designation / Role"
          options={roles}
          selected={state.inputs[`icp${num}_roles` as keyof WorkshopState['inputs']] as string[]}
          onChange={(val) => updateInput(`icp${num}_roles` as any, val)}
          otherValue={state.inputs[`icp${num}_rolesOther` as keyof WorkshopState['inputs']] as string}
          onOtherChange={(val) => updateInput(`icp${num}_rolesOther` as any, val)}
        />

        <MultiSelectDropdown showErrors={showErrors}
          label="Company Size"
          options={sizes}
          selected={state.inputs[`icp${num}_sizes` as keyof WorkshopState['inputs']] as string[]}
          onChange={(val) => updateInput(`icp${num}_sizes` as any, val)}
          otherValue={state.inputs[`icp${num}_sizesOther` as keyof WorkshopState['inputs']] as string}
          onOtherChange={(val) => updateInput(`icp${num}_sizesOther` as any, val)}
        />

        <MultiSelectDropdown showErrors={showErrors}
          label="Industry"
          options={industries}
          selected={state.inputs[`icp${num}_industries` as keyof WorkshopState['inputs']] as string[]}
          onChange={(val) => updateInput(`icp${num}_industries` as any, val)}
          otherValue={state.inputs[`icp${num}_industriesOther` as keyof WorkshopState['inputs']] as string}
          onOtherChange={(val) => updateInput(`icp${num}_industriesOther` as any, val)}
        />
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Deep ICP Builder</h2>
        <p className="text-text-secondary">Define your Top 3 Ideal Customer Profiles for strategic targeting.</p>
      </div>

      <div className="flex gap-2 p-1 bg-section rounded-2xl border border-border w-fit">
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => setActiveIcp(num as 1 | 2 | 3)}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeIcp === num ? 'bg-primary text-black shadow-lg' : 'text-text-secondary hover:text-text'}`}
          >
            ICP {num}
          </button>
        ))}
      </div>

      {renderIcpForm(activeIcp)}

            {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-start gap-3 shadow-sm mb-4">
          <Zap size={20} className="text-red-500 mt-1 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Generation Failed</p>
            <p className="mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="px-3 py-1.5 bg-red-500/20 rounded-lg font-bold hover:bg-red-500/30 transition-colors text-xs">Dismiss</button>
        </div>
      )}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
      >
        {loading && <Loader2 className="animate-spin" size={24} />}
        {loading ? 'Generating Strategic ICPs...' : 'Generate Top 3 ICP Profiles'}
      </button>

      {state.outputs.icps && state.outputs.icps.length > 0 && (
        <div className="space-y-8">
          {state.outputs.icps.map((icp, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-section border border-border rounded-3xl overflow-hidden shadow-sm"
            >
              <div className="p-8 border-b border-border bg-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="text-primary" size={24} />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">ICP {idx + 1} Profile</span>
                </div>
                <h3 className="text-3xl font-black">{icp.name}</h3>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <h4 className="text-xs font-bold uppercase text-text-secondary mb-3 tracking-widest">🔹 Who They Are</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">{icp.whoTheyAre}</p>
                  </section>
                  <section>
                    <h4 className="text-xs font-bold uppercase text-text-secondary mb-3 tracking-widest">🔹 Core Responsibilities</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">{icp.responsibilities}</p>
                  </section>
                </div>

                <section>
                  <h4 className="text-xs font-bold uppercase text-text-secondary mb-4 tracking-widest">🔹 Pain Points (Detailed)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {icp.painPoints.map((p, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-bg rounded-xl border border-border">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span className="text-sm text-text-secondary">{p}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <h4 className="text-xs font-bold uppercase text-text-secondary mb-3 tracking-widest">🔹 Goals & Desires</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">{icp.goals}</p>
                  </section>
                  <section>
                    <h4 className="text-xs font-bold uppercase text-text-secondary mb-3 tracking-widest">🔹 Buying Triggers</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">{icp.triggers}</p>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <h4 className="text-xs font-bold uppercase text-text-secondary mb-3 tracking-widest">🔹 Objections</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">{icp.objections}</p>
                  </section>
                  <section>
                    <h4 className="text-xs font-bold uppercase text-text-secondary mb-3 tracking-widest">🔹 Psychology</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">{icp.psychology}</p>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <h4 className="text-xs font-bold uppercase text-text-secondary mb-3 tracking-widest">🔹 Where They Hang Out</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">{icp.hangouts}</p>
                  </section>
                  <section className="p-6 bg-primary/5 rounded-2xl border border-primary/20">
                    <h4 className="text-xs font-bold uppercase text-primary mb-3 tracking-widest">🔹 How to Position</h4>
                    <p className="text-sm font-medium leading-relaxed">{icp.positioning}</p>
                  </section>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const Step3ValueProp = () => {
  const [showErrors, setShowErrors] = useState(false);
  const { state, setStep, updateOutput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {    setShowErrors(true);
    setTimeout(async () => {
      const firstError = document.querySelector(".border-red-500, .border-red-500\\/50");
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      
      setLoading(true);
      if (typeof setError !== 'undefined') setError(null);
      let success = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await generateOutput(3);
          success = true;
          break;
        } catch (err) {
          if (attempt === 2) {
            if (typeof setError !== 'undefined') setError("Something went wrong. Please try again.");
            else alert("Something went wrong. Please try again.");
          }
        }
      }
      setLoading(false);
    }, 100);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Value Proposition Engine</h2>
        <p className="text-text-secondary">Generate structured, strategic value prop tables for your top 3 ICPs.</p>
      </div>

      {state.outputs.valuePropTables.length === 0 ? (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
        >
          {loading && <Loader2 className="animate-spin" size={24} />}
          {loading ? 'Inferring Strategy...' : 'Generate Positioning Strategy'}
        </button>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl text-center">
            <h3 className="text-lg font-bold text-primary">
              Based on your inputs, here’s how your positioning looks across your top ICPs.
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {state.outputs.valuePropTables.map((row: any, i: number) => (
              <div key={i} className="bg-section border border-border rounded-3xl overflow-hidden hover:border-primary transition-all group shadow-2xl relative">
                {/* ICP Header */}
                <div className="p-6 bg-section-alt border-b border-border flex items-center justify-between">
                  <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-black flex items-center justify-center font-black rounded-lg text-sm">
                      {i + 1}
                    </div>
                    {row.icp}
                  </h3>
                  <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest text-primary italic">
                    {row.coreAngle} Strategy
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-text-secondary tracking-[0.2em] flex items-center gap-2">
                        <span className="text-lg">🎯</span> Desired Outcome
                      </h4>
                      <p className="text-lg font-bold leading-relaxed pr-4 border-l-2 border-primary/30 pl-4">{row.desiredOutcome}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-text-secondary tracking-[0.2em] flex items-center gap-2">
                        <span className="text-lg">🔥</span> Current Problem
                      </h4>
                      <p className="text-sm text-text-secondary leading-relaxed pl-4">{row.currentProblem}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-text-secondary tracking-[0.2em] flex items-center gap-2">
                        <span className="text-lg">🔄</span> What They Replace
                      </h4>
                      <p className="text-sm font-medium text-red-400/80 line-through decoration-red-500/50 pl-4">{row.replacement}</p>
                    </div>
                  </div>

                  <div className="space-y-8 bg-primary/5 p-8 rounded-3xl border border-primary/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Zap size={64} className="text-primary" />
                    </div>
                    
                    <div className="space-y-3 relative z-10">
                      <h4 className="text-xs font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                        <span className="text-lg">⚙️</span> Your Method
                      </h4>
                      <p className="text-lg font-black leading-tight italic">"{row.method}"</p>
                    </div>

                    <div className="space-y-3 relative z-10 pt-4 border-t border-primary/20">
                      <h4 className="text-xs font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                        <span className="text-lg">💡</span> Why This Wins
                      </h4>
                      <p className="text-sm font-medium leading-relaxed italic">{row.whyThisWins || "This mechanism creates a high-authority bridge between latent pain and your specific solution, bypassing generic outreach resistance."}</p>
                    </div>

                    <div className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                      <Target size={14} /> Core Positioning Angle: {row.coreAngle}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 mt-8">
            <button
              onClick={() => {
                const completeStep = (state as any).completeStep || (() => {});
                completeStep(3);
                setStep(4);
              }}
              className="w-full md:flex-1 py-4 bg-primary text-black rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              Confirm & Generate Strategy
              <ArrowRight size={20} />
            </button>
            
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full md:w-auto px-6 py-4 bg-section text-white border border-border rounded-xl font-bold hover:bg-section-alt transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              Regenerate
            </button>
            <button
              onClick={() => setStep(2)}
              className="w-full md:w-auto px-6 py-4 bg-bg text-text-secondary border border-border rounded-xl font-bold hover:text-white transition-colors flex items-center justify-center whitespace-nowrap"
            >
              Edit Inputs
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Step4WebsiteBuilder = () => {
  const [showErrors, setShowErrors] = useState(false);
  const { state, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {    setShowErrors(true);
    setTimeout(async () => {
      const firstError = document.querySelector(".border-red-500, .border-red-500\\/50");
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      
      setLoading(true);
      if (typeof setError !== 'undefined') setError(null);
      let success = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await generateOutput(4);
          success = true;
          break;
        } catch (err) {
          if (attempt === 2) {
            if (typeof setError !== 'undefined') setError("Something went wrong. Please try again.");
            else alert("Something went wrong. Please try again.");
          }
        }
      }
      setLoading(false);
    }, 100);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateInput('inspirationImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-black font-black text-xl shrink-0">👉</div>
        <div>
          <h3 className="font-bold text-lg">To generate your website, use Google AI Studio:</h3>
          <a 
            href="https://aistudio.google.com/apps" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            https://aistudio.google.com/apps
          </a>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Website Builder</h2>
        <p className="text-text-secondary">Generate a structured prompt for your high-converting landing page.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-text-secondary">Brand Name</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none"
            placeholder="e.g. Myntmore"
            value={state.inputs.brandName}
            onChange={(e) => updateInput('brandName', e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-text-secondary">Primary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                className="h-12 w-12 rounded-lg border border-border p-1 cursor-pointer shrink-0"
                value={state.inputs.primaryColor}
                onChange={(e) => updateInput('primaryColor', e.target.value)}
              />
              <input
                type="text"
                className="w-full px-3 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none font-mono text-xs"
                value={state.inputs.primaryColor}
                onChange={(e) => updateInput('primaryColor', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-text-secondary">Secondary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                className="h-12 w-12 rounded-lg border border-border p-1 cursor-pointer shrink-0"
                value={state.inputs.secondaryColor}
                onChange={(e) => updateInput('secondaryColor', e.target.value)}
              />
              <input
                type="text"
                className="w-full px-3 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none font-mono text-xs"
                value={state.inputs.secondaryColor}
                onChange={(e) => updateInput('secondaryColor', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold uppercase text-text-secondary">Design Inspiration (Screenshot)</label>
          <div className="flex items-center gap-4">
            <label className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-text-secondary group-hover:text-primary mb-2" />
                <p className="text-xs text-text-secondary group-hover:text-primary">
                  {state.inputs.inspirationImage ? 'Change Screenshot' : 'Upload UI Inspiration'}
                </p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
            {state.inputs.inspirationImage && (
              <div className="w-32 h-32 rounded-2xl border border-border overflow-hidden relative group">
                <img src={state.inputs.inspirationImage} alt="Inspiration" className="w-full h-full object-cover" />
                <button 
                  onClick={() => updateInput('inspirationImage', null)}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <p className="text-[10px] text-text-secondary">Upload a screenshot of a website layout you love. We'll infer the structure.</p>
        </div>
      </div>

            {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-start gap-3 shadow-sm mb-4">
          <Zap size={20} className="text-red-500 mt-1 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Generation Failed</p>
            <p className="mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="px-3 py-1.5 bg-red-500/20 rounded-lg font-bold hover:bg-red-500/30 transition-colors text-xs">Dismiss</button>
        </div>
      )}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
      >
        {loading && <Loader2 className="animate-spin" size={24} />}
        {loading ? 'Generating Prompt...' : 'Generate Website Prompt'}
      </button>

      {state.outputs.websitePrompt && (
        <div className="space-y-4">
          <OutputCard title="AI Studio Prompt" copyText={state.outputs.websitePrompt}>
            <pre className="whitespace-pre-wrap font-mono text-sm bg-section p-4 rounded-xl border border-border overflow-x-auto">
              {state.outputs.websitePrompt}
            </pre>
          </OutputCard>
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-primary/10 p-3 rounded-lg border border-primary/20">
            <Zap size={14} className="text-primary" />
            <span>Pro tip: Copy this prompt and use it in AI Studio to build your site instantly.</span>
          </div>

          {/* AI STUDIO ENHANCEMENT PROMPTS */}
          <div className="mt-12 space-y-4">
            <div className="mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><Zap size={20} className="text-primary" /> ⚡ Improve Your Website Output</h3>
              <p className="text-sm text-text-secondary mt-1">Use these prompts inside AI Studio to refine and enhance your generated website.</p>
              <p className="text-[10px] font-bold uppercase text-primary tracking-widest mt-2 flex items-center gap-1"><ChevronRight size={12}/> Not happy with your output? Try these refinements</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Conversion Optimization", desc: "Make the hero and CTAs more aggressive to maximize conversions.", prompt: "Optimize this website for maximum conversion. Make the hero section more compelling and ensure CTAs are clear, aggressive, and strategically placed." },
                { title: "Visual Hierarchy", desc: "Improve the flow and scannability of the page.", prompt: "Improve the visual hierarchy of this page. Structure the sections so the user's eye naturally flows from the problem to the solution, using clear typography differences." },
                { title: "Modern UI Upgrade", desc: "Give the site a premium, 2024 tech aesthetic.", prompt: "Upgrade the UI aesthetic to feel like a premium, modern tech startup from 2024. Use subtle gradients, bento-box layouts, and glassmorphism where appropriate." },
                { title: "Mobile Optimization", desc: "Ensure perfect formatting for mobile users.", prompt: "Optimize this entire prompt for a mobile-first layout. Ensure font sizes, spacing, and stack orders are explicitly defined for mobile viewports." },
                { title: "Branding Consistency", desc: "Align tone and visuals strictly with the brand.", prompt: "Review and rewrite the copy to perfectly match a bold, authoritative, yet approachable B2B tone. Ensure colors and CSS match the brand identity." },
                { title: "High-Trust Website", desc: "Add social proof and credibility elements.", prompt: "Enhance the trust-building elements of this site. Integrate realistic placeholders for social proof, logos, testimonials, and data-backed claims." },
                { title: "Speed & Performance", desc: "Optimize for fast loading times and lean code.", prompt: "Rewrite the generated HTML/CSS to be extremely lightweight and performant. Remove unnecessary wrappers and optimize for Core Web Vitals." }
              ].map((p, i) => (
                <div key={i} className="p-5 bg-section border border-border rounded-xl flex flex-col gap-3 group hover:border-primary transition-all">
                  <div>
                    <h4 className="font-bold text-sm text-white">{p.title}</h4>
                    <p className="text-xs text-text-secondary mt-1">{p.desc}</p>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(p.prompt);
                      alert('Prompt copied!');
                    }}
                    className="w-full py-2 bg-bg text-xs font-bold uppercase tracking-widest text-text-secondary border border-border rounded-lg hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                  >
                    <Copy size={12} /> Copy Prompt
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI STUDIO FAQ */}
          <div className="mt-12 space-y-4">
            <div className="mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><MessageSquare size={20} className="text-primary" /> ❓ AI Studio FAQ</h3>
              <p className="text-sm text-text-secondary mt-1">Common issues and solutions when building websites using AI Studio.</p>
              <p className="text-[10px] font-bold uppercase text-primary tracking-widest mt-2 flex items-center gap-1"><ChevronRight size={12}/> Facing issues? Check quick fixes below</p>
            </div>
            
            <div className="space-y-2">
              {[
                { q: "How do I deploy my generated website?", a: "Copy the HTML/CSS from AI Studio, paste it into a local folder, push to GitHub, and connect the repository to Vercel." },
                { q: "The AI output stops mid-generation. What do I do?", a: "Hit the 'Continue' button in AI Studio, or type 'continue exactly from where you left off' to resume the code generation." },
                { q: "Why is the UI inconsistent across sections?", a: "AI sometimes shifts styles. Copy the 'Branding Consistency' enhancement prompt above and run it in the same chat." },
                { q: "How do I regenerate a single section?", a: "Highlight the specific section in AI Studio and ask it to 'Rewrite only this section focusing on [specific need]'." },
                { q: "The design is broken on mobile.", a: "Run the 'Mobile Optimization' enhancement prompt to force the AI to add proper responsive flex or grid classes." },
                { q: "The copy feels too generic.", a: "Provide specific customer quotes or data points to the AI and ask it to replace the generic copy with your concrete facts." },
                { q: "Can I customize the colors later?", a: "Yes. The AI typically uses CSS variables at the top of the generated code. Just edit the HEX values there." },
                { q: "What is the best way to structure the prompt?", a: "The Prompt Generator handles this for you. Just paste what we gave you. Make sure the '8 sections' constraint remains intact." },
                { q: "The AI ignored my inspiration image.", a: "Sometimes the AI prioritizes text over image. Add an explicit command in AI Studio: 'Strictly match the layout and block structure of the attached image'." },
                { q: "How do I make the site load faster?", a: "Use the 'Speed & Performance' prompt to force the AI to write lean code without heavy external dependencies." }
              ].map((faq, i) => (
                <details key={i} className="group p-4 bg-section border border-border rounded-xl open:border-primary transition-all cursor-pointer">
                  <summary className="font-bold text-sm text-white flex justify-between items-center group-open:text-primary list-none">
                    {faq.q}
                    <ChevronDown size={16} className="text-text-secondary group-open:text-primary group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-xs text-text-secondary mt-4 leading-relaxed border-t border-border pt-3">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Step5GTMStrategy = () => {
  const [showErrors, setShowErrors] = useState(false);
  const { state, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'leadGen' | 'partner' | 'event' | 'magnets'>('leadGen');

  const handleGenerate = async () => {    setShowErrors(true);
    setTimeout(async () => {
      const firstError = document.querySelector(".border-red-500, .border-red-500\\/50");
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      
      setLoading(true);
      if (typeof setError !== 'undefined') setError(null);
      let success = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await generateOutput(5);
          success = true;
          break;
        } catch (err) {
          if (attempt === 2) {
            if (typeof setError !== 'undefined') setError("Something went wrong. Please try again.");
            else alert("Something went wrong. Please try again.");
          }
        }
      }
      setLoading(false);
    }, 100);
  };

  const strategy = state.outputs.gtmStrategy;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">GTM Strategy Engine</h2>
        <p className="text-text-secondary">Generate a highly detailed, actionable Go-To-Market strategy for your business.</p>
      </div>

            {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-start gap-3 shadow-sm mb-4">
          <Zap size={20} className="text-red-500 mt-1 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Generation Failed</p>
            <p className="mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="px-3 py-1.5 bg-red-500/20 rounded-lg font-bold hover:bg-red-500/30 transition-colors text-xs">Dismiss</button>
        </div>
      )}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
      >
        {loading && <Loader2 className="animate-spin" size={24} />}
        {loading ? 'Generating Strategy...' : 'Generate GTM Strategy'}
      </button>

      {strategy && (
        <div className="space-y-8">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 p-1 bg-section border border-border rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('leadGen')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'leadGen' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-section-alt'
              }`}
            >
              B2B Lead Gen
            </button>
            <button
              onClick={() => setActiveTab('partner')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'partner' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-section-alt'
              }`}
            >
              Partner Growth
            </button>
            <button
              onClick={() => setActiveTab('event')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'event' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-section-alt'
              }`}
            >
              Event Growth
            </button>
            <button
              onClick={() => setActiveTab('magnets')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'magnets' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-section-alt'
              }`}
            >
              Lead Magnets
            </button>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {activeTab === 'leadGen' && (
              <div className="space-y-8">
                <section className="space-y-4">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <Target size={24} className="text-primary" />
                    Targeting Strategy
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {strategy.leadGen.targeting.map((t, i) => (
                      <div key={i} className="p-6 bg-section border border-border rounded-2xl space-y-3">
                        <div className="text-xs font-black uppercase text-primary tracking-widest">{t.icp}</div>
                        <div className="space-y-2">
                          <div className="text-sm font-bold">Roles: <span className="text-text-secondary font-normal">{t.roles}</span></div>
                          <div className="text-sm font-bold">Size: <span className="text-text-secondary font-normal">{t.size}</span></div>
                          <div className="text-sm font-bold">Industry: <span className="text-text-secondary font-normal">{t.industries}</span></div>
                          <div className="text-sm font-bold">Geo: <span className="text-text-secondary font-normal">{t.geo}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <Globe size={24} className="text-primary" />
                    Channel Strategy
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {strategy.leadGen.channels.map((c, i) => (
                      <div key={i} className="p-6 bg-section border border-border rounded-2xl space-y-2">
                        <div className="text-lg font-black">{c.channel}</div>
                        <div className="text-sm text-text-secondary leading-relaxed"><span className="font-bold text-text">Why:</span> {c.why}</div>
                        <div className="text-sm text-text-secondary leading-relaxed"><span className="font-bold text-text">Approach:</span> {c.approach}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <Send size={24} className="text-primary" />
                    Outreach Strategy
                  </h3>
                  <div className="space-y-6">
                    {strategy.leadGen.outreach.map((o, i) => (
                      <div key={i} className="p-8 bg-section border border-border rounded-2xl space-y-6">
                        <div className="text-lg font-black text-primary uppercase tracking-widest">{o.icp}</div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary">Angles & Hooks</h4>
                            <div className="space-y-2">
                              {o.angles.map((a, j) => <div key={j} className="text-sm p-3 bg-section-alt rounded-lg border border-border">{a}</div>)}
                            </div>
                            <div className="space-y-2">
                              {o.hooks.map((h, j) => <div key={j} className="text-sm p-3 bg-primary/5 rounded-lg border border-primary/20 italic">"{h}"</div>)}
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary">Sample Messages</h4>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <div className="text-[10px] font-bold uppercase text-text-secondary">LinkedIn DMs</div>
                                {o.dms.map((dm, j) => (
                                  <div key={j} className="text-xs p-4 bg-section-alt rounded-xl border border-border leading-relaxed relative group">
                                    {dm}
                                    <button onClick={() => navigator.clipboard.writeText(dm)} className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"><Copy size={12}/></button>
                                  </div>
                                ))}
                              </div>
                              <div className="space-y-2">
                                <div className="text-[10px] font-bold uppercase text-text-secondary">Cold Emails</div>
                                {o.emails.map((em, j) => (
                                  <div key={j} className="text-xs p-4 bg-section-alt rounded-xl border border-border leading-relaxed relative group">
                                    {em}
                                    <button onClick={() => navigator.clipboard.writeText(em)} className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"><Copy size={12}/></button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <TrendingUp size={24} className="text-primary" />
                    Funnel Design
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {strategy.leadGen.funnel.map((f, i) => (
                      <div key={i} className="p-6 bg-section border border-border rounded-2xl relative">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-black rounded-full flex items-center justify-center font-black text-xs shadow-lg">{i + 1}</div>
                        <div className="text-xs font-black uppercase tracking-widest text-primary mb-2">{f.step}</div>
                        <div className="text-xs text-text-secondary leading-relaxed">{f.description}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'partner' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="space-y-4">
                    <h3 className="text-xl font-black flex items-center gap-2">
                      <User size={24} className="text-primary" />
                      Ideal Partners
                    </h3>
                    <div className="space-y-4">
                      {strategy.partnerGrowth.idealPartners.map((ip, i) => (
                        <div key={i} className="p-6 bg-section border border-border rounded-2xl space-y-2">
                          <div className="text-xs font-black uppercase text-primary tracking-widest">{ip.icp}</div>
                          <div className="flex flex-wrap gap-2">
                            {ip.partners.map((p, j) => <span key={j} className="px-3 py-1 bg-section-alt rounded-full text-xs font-bold border border-border">{p}</span>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xl font-black flex items-center gap-2">
                      <Layers size={24} className="text-primary" />
                      Partnership Models
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {strategy.partnerGrowth.models.map((m, i) => (
                        <div key={i} className="p-4 bg-section border border-border rounded-xl text-sm font-bold flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-primary" />
                          {m}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <section className="space-y-4">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <MessageSquare size={24} className="text-primary" />
                    Partner Outreach
                  </h3>
                  <div className="p-8 bg-section border border-border rounded-2xl space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary">Pitch Message</h4>
                      <div className="p-6 bg-section-alt rounded-2xl border border-border text-sm leading-relaxed italic relative group">
                        {strategy.partnerGrowth.outreach.pitch}
                        <button onClick={() => navigator.clipboard.writeText(strategy.partnerGrowth.outreach.pitch)} className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"><Copy size={16}/></button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary">Value Exchange Logic</h4>
                      <div className="text-sm text-text-secondary leading-relaxed">{strategy.partnerGrowth.outreach.logic}</div>
                    </div>
                  </div>
                </section>

                  <section className="space-y-4">
                    <h3 className="text-xl font-black flex items-center gap-2">
                      <TrendingUp size={24} className="text-primary" />
                      Scale Strategy
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {strategy.partnerGrowth.scale.map((s, i) => (
                        <div key={i} className="p-6 bg-section border border-border rounded-2xl text-sm leading-relaxed">
                          <span className="text-primary font-black mr-2">0{i+1}.</span>
                          {s}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

            {activeTab === 'event' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="space-y-4">
                    <h3 className="text-xl font-black flex items-center gap-2">
                      <Calendar size={24} className="text-primary" />
                      Event Types
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {strategy.eventGrowth.types.map((t, i) => (
                        <div key={i} className="px-6 py-3 bg-section border border-border rounded-xl font-bold text-sm shadow-sm">
                          {t}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xl font-black flex items-center gap-2">
                      <Sparkles size={24} className="text-primary" />
                      Event Ideas
                    </h3>
                    <div className="space-y-4">
                      {strategy.eventGrowth.ideas.map((id, i) => (
                        <div key={i} className="p-6 bg-section border border-border rounded-2xl space-y-3">
                          <div className="text-xs font-black uppercase text-primary tracking-widest">{id.icp}</div>
                          <ul className="space-y-2">
                            {id.topics.map((topic, j) => (
                              <li key={j} className="text-sm flex items-start gap-2">
                                <ArrowRight size={14} className="text-primary mt-1 shrink-0" />
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="space-y-4">
                    <h3 className="text-xl font-black flex items-center gap-2">
                      <TrendingUp size={24} className="text-primary" />
                      Event Funnel
                    </h3>
                    <div className="p-6 bg-section border border-border rounded-2xl text-sm leading-relaxed text-text-secondary">
                      {strategy.eventGrowth.funnel}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xl font-black flex items-center gap-2">
                      <Zap size={24} className="text-primary" />
                      Conversion Strategy
                    </h3>
                    <div className="p-6 bg-section border border-border rounded-2xl text-sm leading-relaxed text-text-secondary">
                      {strategy.eventGrowth.conversion}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'magnets' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2 mb-8 border-b border-border pb-6">
                  <h3 className="text-2xl font-black flex items-center gap-2">
                    <span className="text-3xl">🎁</span> Free Tools & Resources You Can Use as Lead Magnets
                  </h3>
                  <p className="text-sm text-text-secondary font-medium italic mt-2">Use these as high-value hooks in your outreach instead of generic pitches.</p>
                  <p className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-1 mt-1">People don't respond to messages. They respond to value.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {strategy.leadMagnets.map((lm: any, i: number) => (
                    <div key={i} className="p-8 bg-section border border-border rounded-3xl space-y-6 relative overflow-hidden group hover:border-primary transition-colors hover:shadow-lg hover:-translate-y-1">
                      <div className="absolute top-0 right-0 p-4 bg-primary/10 rounded-bl-3xl">
                        <Sparkles size={24} className="text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black pr-8">{lm.name}</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase text-text-secondary flex items-center gap-1">What it does:</div>
                          <div className="text-sm font-medium leading-relaxed">{lm.whatItDoes}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase text-text-secondary flex items-center gap-1">Why it works:</div>
                          <div className="text-sm text-text-secondary leading-relaxed">{lm.whyItWorks}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase text-text-secondary flex items-center gap-1">How to use in outreach:</div>
                          <div className="text-sm text-text-secondary leading-relaxed italic border-l-2 border-primary/50 pl-3">"{lm.howToUse}"</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase text-text-secondary flex items-center gap-1">CTA:</div>
                          <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold uppercase tracking-widest text-primary">{lm.cta}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Step6OutreachCampaign = () => {
  const [showErrors, setShowErrors] = useState(false);
  const { state, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setShowErrors(true);
    setTimeout(async () => {
      const firstError = document.querySelector(".border-red-500, .border-red-500\\/50");
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // System Integrity
      const hasInputs = state.inputs.campaignType.length > 0 && 
                        state.inputs.tone.length > 0 && 
                        state.inputs.cta.length > 0;
      
      if (!hasInputs) {
        setError("Please select at least one Campaign Type, Tone, and CTA.");
        return;
      }
      
      setLoading(true);
      if (typeof setError !== 'undefined') setError(null);
      let success = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await generateOutput(6);
          success = true;
          break;
        } catch (err) {
          if (attempt === 2) {
            setError("Something went wrong. Please try again.");
          }
        }
      }
      setLoading(false);
    }, 100);
  };

  const types = ['LinkedIn', 'Email', 'Hybrid', 'Twitter/X', 'Cold Call Script'];
  const tones = ['Friendly', 'Direct', 'Insight-led', 'Curious', 'Challenger', 'Helpful', 'Urgent'];
  const ctas = ['Soft', 'Direct', 'Question-based', 'Value-first', 'Calendar Link', 'Reply-based'];
  const angles = ['Visibility/Inbound', 'Positioning/Differentiation', 'Authority/Credibility', 'Contrarian/Insight', 'Revenue/Opportunity'];
  const offers = ['Lead Magnet', 'Free Audit', 'Strategy Session', 'Custom Tool', 'Case Study', 'Checklist'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Outreach Campaign</h2>
        <p className="text-text-secondary">Design the flow of your automated outreach sequence.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MultiSelectDropdown showErrors={showErrors}
            label="Campaign Type"
            options={types}
            selected={state.inputs.campaignType}
            onChange={(val) => updateInput('campaignType', val)}
            otherValue={state.inputs.campaignTypeOther}
            onOtherChange={(val) => updateInput('campaignTypeOther', val)}
            placeholder="Select Type(s)"
          />

          <MultiSelectDropdown showErrors={showErrors}
            label="Tone of Voice"
            options={tones}
            selected={state.inputs.tone}
            onChange={(val) => updateInput('tone', val)}
            otherValue={state.inputs.toneOther}
            onOtherChange={(val) => updateInput('toneOther', val)}
            placeholder="Select Tone(s)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MultiSelectDropdown showErrors={showErrors}
            label="Call to Action"
            options={ctas}
            selected={state.inputs.cta}
            onChange={(val) => updateInput('cta', val)}
            otherValue={state.inputs.ctaOther}
            onOtherChange={(val) => updateInput('ctaOther', val)}
            placeholder="Select CTA(s)"
          />

          <MultiSelectDropdown showErrors={showErrors}
            label="Narrative Angles"
            options={angles}
            selected={state.inputs.narrativeAngles}
            onChange={(val) => updateInput('narrativeAngles', val)}
            otherValue={state.inputs.narrativeAnglesOther}
            onOtherChange={(val) => updateInput('narrativeAnglesOther', val)}
            placeholder="Select Angle(s)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MultiSelectDropdown showErrors={showErrors}
            label="Number of Follow-ups"
            options={['1', '2', '3', '4', '5', '6', '7']}
            selected={[state.inputs.numFollowUps]}
            onChange={(val) => {
              if (val.length > 0) updateInput('numFollowUps', val[0]);
            }}
            singleSelect={true}
            otherValue={state.inputs.numFollowUpsOther}
            onOtherChange={(val) => updateInput('numFollowUpsOther', val)}
          />

          <MultiSelectDropdown showErrors={showErrors}
            label="Free Offer Type"
            options={offers}
            selected={[state.inputs.freeOfferType]}
            onChange={(val) => {
              if (val.length > 0) updateInput('freeOfferType', val[0]);
            }}
            singleSelect={true}
            otherValue={state.inputs.freeOfferTypeOther}
            onOtherChange={(val) => updateInput('freeOfferTypeOther', val)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-text-secondary tracking-wider">Tool Name *</label>
            <input
              type="text"
              placeholder="e.g. ROI Calculator"
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg"
              value={state.inputs.toolName}
              onChange={(e) => updateInput('toolName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-text-secondary tracking-wider">Tool Description *</label>
            <input
              type="text"
              placeholder="e.g. Helps calculate potential savings..."
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg"
              value={state.inputs.toolDescription}
              onChange={(e) => updateInput('toolDescription', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-text-secondary tracking-wider">Strategic Notes</label>
          <textarea
            placeholder="Any specific instructions or context for the AI..."
            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg min-h-[100px]"
            value={state.inputs.strategicNotes}
            onChange={(e) => updateInput('strategicNotes', e.target.value)}
          />
        </div>
      </div>

            {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-start gap-3 shadow-sm mb-4">
          <Zap size={20} className="text-red-500 mt-1 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Generation Failed</p>
            <p className="mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="px-3 py-1.5 bg-red-500/20 rounded-lg font-bold hover:bg-red-500/30 transition-colors text-xs">Dismiss</button>
        </div>
      )}
      <button
        onClick={handleGenerate}
        disabled={loading || state.inputs.campaignType.length === 0 || state.inputs.tone.length === 0 || state.inputs.cta.length === 0}
        className="w-full py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
      >
        {loading && <Loader2 className="animate-spin" size={24} />}
        {loading ? 'Generating Campaign...' : 'Generate Outreach Campaign'}
      </button>

      {state.outputs.outreachCampaign && (
        <div className="space-y-12">
          <div className="p-8 bg-primary/5 border-2 border-primary/20 rounded-3xl">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <Sparkles size={16} />
              Campaign Strategy Summary
            </h4>
            <p className="text-lg font-medium leading-relaxed italic">
              "{state.outputs.outreachCampaign.strategySummary}"
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <Send size={16} className="text-primary" />
              Connection Notes (3 Versions)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['version1', 'version2', 'version3'].map((v, i) => (
                <div key={v} className="p-6 bg-section border border-border rounded-2xl relative group hover:border-primary transition-all">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-black rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                    V{i + 1}
                  </div>
                  <div className="text-sm text-text-primary leading-relaxed mb-4">
                    {(state.outputs.outreachCampaign?.connectionNotes as any)[v]}
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText((state.outputs.outreachCampaign?.connectionNotes as any)[v]);
                      alert('Copied!');
                    }}
                    className="w-full py-2 text-[10px] font-bold uppercase tracking-wider border border-border rounded-lg hover:bg-primary hover:border-primary hover:text-black transition-all"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>

          {[1, 2, 3].map(num => {
            const followUp = (state.outputs.outreachCampaign as any)[`followUp${num}`];
            if (!followUp) return null;

            return (
              <div key={num} className="space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                  <MessageSquare size={16} className="text-primary" />
                  Follow-up {num} (3 Versions)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['version1', 'version2', 'version3'].map((v, i) => (
                    <div key={v} className="p-6 bg-section border border-border rounded-2xl relative group hover:border-primary transition-all">
                      <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-black rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                        V{i + 1}
                      </div>
                      <div className="text-xs text-text-primary leading-relaxed mb-4 whitespace-pre-wrap">
                        {followUp[v]}
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(followUp[v]);
                          alert('Copied!');
                        }}
                        className="w-full py-2 text-[10px] font-bold uppercase tracking-wider border border-border rounded-lg hover:bg-primary hover:border-primary hover:text-black transition-all"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Step7DMGenerator = () => {
  const [showErrors, setShowErrors] = useState(false);
  const { state, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setShowErrors(true);
    setTimeout(async () => {
      const firstError = document.querySelector(".border-red-500, .border-red-500\\/50");
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // System Integrity
      const hasInputs = state.inputs.dmAngle.length > 0 && state.inputs.dmTone.length > 0;
      
      if (!hasInputs) {
        setError("Please select at least one Message Angle and Tone.");
        return;
      }
      
      setLoading(true);
      if (typeof setError !== 'undefined') setError(null);
      let success = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await generateOutput(7);
          success = true;
          break;
        } catch (err) {
          if (attempt === 2) {
            setError("Something went wrong. Please try again.");
          }
        }
      }
      setLoading(false);
    }, 100);
  };

  const angles = ['Pain', 'Curiosity', 'Insight', 'Trend', 'Case Study', 'Mutual Connection', 'Recent News', 'Compliment'];
  const tones = ['Friendly', 'Professional', 'Direct', 'Witty', 'Empathetic', 'Bold'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">DM Generator</h2>
        <p className="text-text-secondary">Generate high-converting messages based on your ICP and Value Prop.</p>
      </div>

      <div className="space-y-6">
        <MultiSelectDropdown showErrors={showErrors}
          label="Message Angle"
          options={angles}
          selected={state.inputs.dmAngle}
          onChange={(val) => updateInput('dmAngle', val)}
          otherValue={state.inputs.dmAngleOther}
          onOtherChange={(val) => updateInput('dmAngleOther', val)}
          placeholder="Select Angle(s)"
        />

        <MultiSelectDropdown showErrors={showErrors}
          label="Message Tone"
          options={tones}
          selected={state.inputs.dmTone}
          onChange={(val) => updateInput('dmTone', val)}
          otherValue={state.inputs.dmToneOther}
          onOtherChange={(val) => updateInput('dmToneOther', val)}
          placeholder="Select Tone(s)"
        />
      </div>

            {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-start gap-3 shadow-sm mb-4">
          <Zap size={20} className="text-red-500 mt-1 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Generation Failed</p>
            <p className="mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="px-3 py-1.5 bg-red-500/20 rounded-lg font-bold hover:bg-red-500/30 transition-colors text-xs">Dismiss</button>
        </div>
      )}
      <button
        onClick={handleGenerate}
        disabled={loading || state.inputs.dmAngle.length === 0 || state.inputs.dmTone.length === 0}
        className="w-full py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
      >
        {loading && <Loader2 className="animate-spin" size={24} />}
        {loading ? 'Generating Messages...' : 'Generate Messages'}
      </button>

      <div className="space-y-4">
        {state.outputs.dmMessages.map((msg, i) => (
          <OutputCard key={i} title={msg.name} copyText={msg.message} icon={MessageSquare}>
            <div className="text-base font-normal whitespace-pre-wrap mb-4">{msg.message}</div>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
              <div className="text-[10px] font-bold uppercase text-primary mb-1 flex items-center gap-1">
                <Zap size={10} />
                Why it works
              </div>
              <div className="text-xs text-text-secondary leading-relaxed">{msg.whyItWorks}</div>
            </div>
          </OutputCard>
        ))}
      </div>
    </div>
  );
};

const Step8Summary = () => {
  const [showErrors, setShowErrors] = useState(false);
  const { state } = useWorkshop();

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20"
        >
          <CheckCircle2 size={48} className="text-black" />
        </motion.div>
        <h2 className="text-4xl font-black mb-2">Workshop Complete!</h2>
        <p className="text-text-secondary text-lg">You've built a complete B2B lead generation engine. Here's your summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 border-2 border-border rounded-3xl bg-section shadow-sm hover:border-primary transition-colors group">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-primary group-hover:scale-110 transition-transform" size={20} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Ideal Customer Profile</h4>
          </div>
          <p className="text-sm leading-relaxed line-clamp-4">{state.outputs.icpSummary}</p>
        </div>
        
        <div className="p-8 border-2 border-primary/30 rounded-3xl bg-primary/5 shadow-sm hover:border-primary transition-colors group">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-primary group-hover:scale-110 transition-transform" size={20} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Winning Value Prop</h4>
          </div>
          <p className="text-lg font-black text-primary leading-tight">{state.outputs.valueProp}</p>
        </div>

        <div className="p-8 border-2 border-border rounded-3xl bg-section shadow-sm hover:border-primary transition-colors group">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-primary group-hover:scale-110 transition-transform" size={20} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">GTM Strategy</h4>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold">{state.outputs.gtmStrategy?.leadGen.channels[0]?.channel || 'N/A'}</div>
            <div className="text-xs text-text-secondary">Secondary: {state.outputs.gtmStrategy?.leadGen.channels[1]?.channel || 'N/A'}</div>
          </div>
        </div>

        <div className="p-8 border-2 border-border rounded-3xl bg-section shadow-sm hover:border-primary transition-colors group">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="text-primary group-hover:scale-110 transition-transform" size={20} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Campaign Setup</h4>
          </div>
          <div className="text-sm font-bold">{state.inputs.campaignType.join(', ')}</div>
          <div className="text-xs text-text-secondary">{state.inputs.tone.join(', ')} Tone · {state.inputs.cta.join(', ')} CTA</div>
          {state.outputs.outreachCampaign && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-[10px] font-bold uppercase text-primary mb-1">Strategy</div>
              <p className="text-xs text-text-secondary line-clamp-2 italic">"{state.outputs.outreachCampaign.strategySummary}"</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-12">
        <button
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(state, null, 2));
            alert('Full state copied to clipboard!');
          }}
          className="flex-1 py-5 border-2 border-border rounded-2xl font-bold hover:bg-section transition-all flex items-center justify-center gap-3"
        >
          <Copy size={20} />
          Copy Full Data
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
        >
          <Download size={20} />
          Generate Strategy Report [PDF]
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [state, setState] = useState<WorkshopState>(() => {
    const savedLeadData = localStorage.getItem('userLeadData');
    const initialInputs = {
      fullName: '',
      workEmail: '',
      phone: '',
      companyName: '',
      leadRole: [],
      leadRoleOther: '',
      linkedinUrl: '',
      linkedinHeadline: '',
      linkedinAbout: '',
      targetIcp: [],
      targetIcpOther: '',
      tonePreference: [],
      tonePreferenceOther: '',
      offer: '',
      
      // ICP 1
      icp1_roles: [],
      icp1_rolesOther: '',
      icp1_sizes: [],
      icp1_sizesOther: '',
      icp1_industries: [],
      icp1_industriesOther: '',

      // ICP 2
      icp2_roles: [],
      icp2_rolesOther: '',
      icp2_sizes: [],
      icp2_sizesOther: '',
      icp2_industries: [],
      icp2_industriesOther: '',

      // ICP 3
      icp3_roles: [],
      icp3_rolesOther: '',
      icp3_sizes: [],
      icp3_sizesOther: '',
      icp3_industries: [],
      icp3_industriesOther: '',

      industry: [],
      industryOther: '',
      companySize: [],
      companySizeOther: '',
      geography: [],
      geographyOther: '',
      decisionMaker: [],
      decisionMakerOther: '',
      painPoints: [],
      painPointsOther: '',
      budget: [],
      budgetOther: '',
      outcome: [],
      outcomeOther: '',
      method: [],
      methodOther: '',
      replacement: [],
      replacementOther: '',
      brandName: '',
      primaryColor: '#FFC947',
      secondaryColor: '#000000',
      inspirationImage: null,
      campaignType: [],
      campaignTypeOther: '',
      tone: [],
      toneOther: '',
      cta: [],
      ctaOther: '',
      numFollowUps: '3',
      numFollowUpsOther: '',
      freeOfferType: 'Lead Magnet',
      freeOfferTypeOther: '',
      toolName: '',
      toolDescription: '',
      strategicNotes: '',
      narrativeAngles: [],
      narrativeAnglesOther: '',
      dmAngle: [],
      dmAngleOther: '',
      dmTone: [],
      dmToneOther: '',
    };

    if (savedLeadData) {
      try {
        const parsed = JSON.parse(savedLeadData);
        return {
          currentStep: 1,
          completedSteps: [0],
          submissionId: parsed.submissionId || null,
          inputs: { ...initialInputs, ...parsed },
          outputs: {
            profileClarityScore: 0,
            scoreMeaning: '',
            scoreExplanation: '',
            optimizedHeadlines: [],
            optimizedAbout: '',
            positioningAngles: '',
            keywordScore: 0,
            icps: [],
            icpSummary: '',
            valueProp: '',
            websitePrompt: '',
            gtmStrategy: null,
            campaignFlow: [],
            outreachCampaign: null,
            dmMessages: [],
            valuePropTables: [],
            globalSolution: '',
          }
        };
      } catch (e) {
        console.error("Error parsing lead data", e);
      }
    }

    return {
      currentStep: 0,
      completedSteps: [],
      submissionId: null,
      inputs: initialInputs,
      outputs: {
        profileClarityScore: 0,
        scoreMeaning: '',
        scoreExplanation: '',
        optimizedHeadlines: [],
        optimizedAbout: '',
        positioningAngles: '',
        keywordScore: 0,
        icps: [],
        icpSummary: '',
        valueProp: '',
        websitePrompt: '',
        gtmStrategy: null,
        campaignFlow: [],
        outreachCampaign: null,
        dmMessages: [],
        valuePropTables: [],
        globalSolution: '',
      },
    };
  });

  const setStep = (step: StepId) => setState(prev => ({ ...prev, currentStep: step }));

  const updateInput = (key: keyof WorkshopState['inputs'], value: any) => {
    setState(prev => ({
      ...prev,
      inputs: { ...prev.inputs, [key]: value }
    }));
  };

  const completeStep = (step: StepId) => {
    setState(prev => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(step) 
        ? prev.completedSteps 
        : [...prev.completedSteps, step]
    }));
  };

  const updateOutput = (key: keyof WorkshopState['outputs'], value: any) => {
    setState(prev => ({
      ...prev,
      outputs: { ...prev.outputs, [key]: value }
    }));
  };

  // Sync to Supabase whenever state changes
  useEffect(() => {
    if (state.submissionId) {
      const syncData = async () => {
        try {
          const { error } = await supabase
            .from('workshop_submissions')
            .update({
              current_step: state.currentStep,
              completed_steps: state.completedSteps,
              workshop_inputs: state.inputs,
              workshop_outputs: state.outputs
            })
            .eq('id', state.submissionId);
          
          if (error) console.error("Supabase Sync Error:", error);
        } catch (err) {
          console.error("Supabase Sync Exception:", err);
        }
      };

      // Debounce sync to avoid too many requests
      const timer = setTimeout(syncData, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.submissionId, state.currentStep, state.completedSteps, state.inputs, state.outputs]);

  const setSubmissionId = (id: string) => setState(prev => ({ ...prev, submissionId: id }));

  const generateOutput = async (step: StepId) => {
    const { inputs } = state;
    let newOutputs = { ...state.outputs };

    try {
      if (step === 1) {
        
        const targetIcpStr = inputs.targetIcp.includes('Other')
          ? [...inputs.targetIcp.filter(i => i !== 'Other'), inputs.targetIcpOther].join(', ')
          : inputs.targetIcp.join(', ');
        const toneStr = inputs.tonePreference.includes('Other')
          ? [...inputs.tonePreference.filter(t => t !== 'Other'), inputs.tonePreferenceOther].join(', ')
          : inputs.tonePreference.join(', ');

        const result = await gemini.optimizeLinkedInProfile({
          headline: inputs.linkedinHeadline,
          about: inputs.linkedinAbout,
          
          targetIcp: targetIcpStr,
          tone: toneStr,
          offer: inputs.offer,
          role: inputs.leadRole.join(', ')
        });
        newOutputs.profileClarityScore = result.clarityScore;
        newOutputs.scoreMeaning = result.scoreMeaning;
        newOutputs.scoreExplanation = result.scoreExplanation;
        newOutputs.optimizedHeadlines = result.headlines;
        newOutputs.optimizedAbout = result.aboutSection;
        newOutputs.positioningAngles = result.positioningAngles;
        newOutputs.keywordScore = result.keywordScore;
      } else if (step === 2) {
        const buildIcp = (num: number) => {
          const roles = inputs[`icp${num}_roles` as keyof typeof inputs] as string[];
          const sizes = inputs[`icp${num}_sizes` as keyof typeof inputs] as string[];
          const inds = inputs[`icp${num}_industries` as keyof typeof inputs] as string[];
          
          const hasRoles = roles && roles.length > 0;
          const hasSizes = sizes && sizes.length > 0;
          const hasInds = inds && inds.length > 0;

          // STRICT VALIDATION: All 3 core fields must be present
          if (!hasRoles || !hasSizes || !hasInds) return null;
          
          return {
            roles: roles.includes('Other') ? [...roles.filter(r => r !== 'Other'), inputs[`icp${num}_rolesOther` as keyof typeof inputs]] : roles,
            sizes: sizes.includes('Other') ? [...sizes.filter(s => s !== 'Other'), inputs[`icp${num}_sizesOther` as keyof typeof inputs]] : sizes,
            industries: inds.includes('Other') ? [...inds.filter(i => i !== 'Other'), inputs[`icp${num}_industriesOther` as keyof typeof inputs]] : inds,
          };
        };

        const validIcps = [buildIcp(1), buildIcp(2), buildIcp(3)].filter(Boolean);
        if (validIcps.length === 0) {
            throw new Error("Please complete all required fields for at least one ICP before generating.");
        }

        const result = await gemini.generateDetailedICPs({
          icps: validIcps,
          offer: inputs.offer
        });
        newOutputs.icps = result;
        newOutputs.icpSummary = `Generated ${validIcps.length} detailed strategic ICP(s): ${result.map((r: any) => r.name).join(', ')}`;
      } else if (step === 3) {
        const vpTables = await gemini.generateValuePropTables({
          icps: newOutputs.icps,
          offer: inputs.offer,
          narrativeAngles: inputs.narrativeAngles.includes('Other') 
            ? [...inputs.narrativeAngles.filter(a => a !== 'Other'), inputs.narrativeAnglesOther] 
            : inputs.narrativeAngles,
          tonePreference: inputs.tonePreference.includes('Other')
            ? [...inputs.tonePreference.filter(t => t !== 'Other'), inputs.tonePreferenceOther]
            : inputs.tonePreference
        });
        
        const globalSol = await gemini.generateGlobalSolution(vpTables);

        newOutputs.valuePropTables = vpTables;
        newOutputs.globalSolution = globalSol;
      } else if (step === 4) {
        const prompt = await gemini.generateWebsitePrompt({
          brandName: inputs.brandName, 
          primaryColor: inputs.primaryColor, 
          secondaryColor: inputs.secondaryColor, 
          inspirationImage: inputs.inspirationImage, 
          valueProp: newOutputs.globalSolution || newOutputs.valueProp || "Our value proposition",
          icpSummary: newOutputs.icpSummary,
          offer: inputs.offer,
          narrativeAngles: inputs.narrativeAngles?.includes('Other') 
            ? [...inputs.narrativeAngles.filter(a => a !== 'Other'), inputs.narrativeAnglesOther] 
            : (inputs.narrativeAngles || []),
          tonePreference: inputs.tonePreference?.includes('Other')
            ? [...inputs.tonePreference.filter(t => t !== 'Other'), inputs.tonePreferenceOther]
            : (inputs.tonePreference || [])
        });
        newOutputs.websitePrompt = prompt;
      } else if (step === 5) {
        const industryStr = inputs.industry.includes('Other') 
          ? [...inputs.industry.filter(i => i !== 'Other'), inputs.industryOther].join(', ')
          : inputs.industry.join(', ');
        const strategy = await gemini.generateDetailedGTM({
          icps: newOutputs.icps,
          offer: inputs.offer,
          valuePropTables: newOutputs.valuePropTables,
          industry: industryStr
        });
        newOutputs.gtmStrategy = strategy;
      } else if (step === 6) {
        const industryStr = inputs.industry.includes('Other') 
          ? [...inputs.industry.filter(i => i !== 'Other'), inputs.industryOther].join(', ')
          : inputs.industry.join(', ');
        
        const toneStr = inputs.tone.includes('Other')
          ? [...inputs.tone.filter(t => t !== 'Other'), inputs.toneOther].join(', ')
          : inputs.tone.join(', ');
          
        const ctaStr = inputs.cta.includes('Other')
          ? [...inputs.cta.filter(c => c !== 'Other'), inputs.ctaOther].join(', ')
          : inputs.cta.join(', ');

        const painPointsStr = inputs.painPoints.includes('Other')
          ? [...inputs.painPoints.filter(p => p !== 'Other'), inputs.painPointsOther].join(', ')
          : inputs.painPoints.join(', ');

        const narrativeAnglesStr = inputs.narrativeAngles.includes('Other')
          ? [...inputs.narrativeAngles.filter(a => a !== 'Other'), inputs.narrativeAnglesOther]
          : inputs.narrativeAngles;

        const numFollowUpsVal = inputs.numFollowUps === 'Other' 
          ? parseInt(inputs.numFollowUpsOther) || 3 
          : parseInt(inputs.numFollowUps) || 3;
          
        const freeOfferTypeStr = inputs.freeOfferType === 'Other'
          ? inputs.freeOfferTypeOther
          : inputs.freeOfferType;

        const campaign = await gemini.generateOutreachCampaign({
          clientName: inputs.fullName,
          companyName: inputs.companyName,
          whatTheySell: inputs.offer,
          targetIndustry: industryStr,
          primaryProblem: painPointsStr,
          narrativeAngles: narrativeAnglesStr,
          tonePreference: toneStr,
          icpJobTitles: newOutputs.icps.map(i => i.name).join(', '),
          icpIndustry: newOutputs.icps.map(i => i.whoTheyAre).join(', '),
          icpPainPoints: newOutputs.icps.flatMap(i => i.painPoints),
          numFollowUps: numFollowUpsVal,
          freeOfferType: freeOfferTypeStr,
          toolName: inputs.toolName,
          toolDescription: inputs.toolDescription,
          ctaStyle: ctaStr,
          strategicNotes: inputs.strategicNotes
        });

        newOutputs.outreachCampaign = campaign;
        newOutputs.campaignFlow = [
          "Connection Request",
          ...Array.from({ length: numFollowUpsVal }, (_, i) => `Follow-up ${i + 1}`)
        ];
      } else if (step === 7) {
        const industryStr = inputs.industry.includes('Other') 
          ? [...inputs.industry.filter(i => i !== 'Other'), inputs.industryOther].join(', ')
          : inputs.industry.join(', ');
        
        const angleStr = inputs.dmAngle.includes('Other')
          ? [...inputs.dmAngle.filter(a => a !== 'Other'), inputs.dmAngleOther].join(', ')
          : inputs.dmAngle.join(', ');
          
        const toneStr = inputs.dmTone.includes('Other')
          ? [...inputs.dmTone.filter(t => t !== 'Other'), inputs.dmToneOther].join(', ')
          : inputs.dmTone.join(', ');

        const dms = await gemini.generateDMAngles(industryStr, newOutputs.icpSummary, newOutputs.valueProp);
        newOutputs.dmMessages = dms;
      }

      setState(prev => ({ ...prev, outputs: newOutputs }));
      completeStep(step);
    } catch (err) {
      console.error("Error generating output:", err);
      throw err;
    }
  };

  const steps = [
    { id: 1, label: 'Profile Check', icon: Linkedin },
    { id: 2, label: 'ICP Builder', icon: Target },
    { id: 3, label: 'Value Proposition', icon: Zap },
    { id: 4, label: 'Website Builder', icon: Globe },
    { id: 5, label: 'GTM Strategy', icon: TrendingUp },
    { id: 6, label: 'Outreach Campaign', icon: Send },
    { id: 7, label: 'DM Generator', icon: MessageSquare },
    { id: 8, label: 'Wrap Up', icon: LayoutDashboard },
  ];

  const currentStepData = steps.find(s => s.id === state.currentStep);

  if (state.currentStep === 0) {
    return (
      <WorkshopContext.Provider value={{ state, setStep, updateInput, completeStep, generateOutput, updateOutput, setSubmissionId }}>
        <Step0LeadCapture />
      </WorkshopContext.Provider>
    );
  }

  return (
    <WorkshopContext.Provider value={{ state, setStep, updateInput, completeStep, generateOutput, updateOutput, setSubmissionId }}>
      <div className="print:hidden flex min-h-screen bg-bg">
        {/* Sidebar */}
        <aside className="w-72 border-r border-border fixed h-full bg-bg z-20 hidden lg:block">
          <div className="p-8">
            <div className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-black">B2B</div>
              <span className="font-bold text-xl tracking-tight text-text-primary">Lead Gen</span>
            </div>
            <nav className="space-y-1">
              {steps.map(s => (
                <SidebarItem
                  key={s.id}
                  id={s.id}
                  label={s.label}
                  icon={s.icon}
                  active={state.currentStep === s.id}
                  completed={state.completedSteps.includes(s.id as StepId)}
                  onClick={() => setStep(s.id as StepId)}
                />
              ))}
            </nav>
          </div>
          <div className="absolute bottom-0 w-full p-8 border-t border-border bg-bg">
            <div className="flex items-center gap-3 text-text-secondary text-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Workshop Live Mode
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 min-h-screen flex flex-col">
          {/* Top Bar */}
          <header className="h-16 border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-text-secondary">Step {state.currentStep} of 8</span>
              <div className="w-48 h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(state.currentStep / 8) * 100}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm font-medium hover:text-primary transition-colors">Save Draft</button>
              <div className="w-8 h-8 rounded-full bg-section border border-border flex items-center justify-center text-xs font-bold">SC</div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 p-8 md:p-12 lg:p-20">
            <div className="max-w-[800px] mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={state.currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {state.currentStep === 1 && <Step1ProfileCheck />}
                  {state.currentStep === 2 && <Step2ICPBuilder />}
                  {state.currentStep === 3 && <Step3ValueProp />}
                  {state.currentStep === 4 && <Step4WebsiteBuilder />}
                  {state.currentStep === 5 && <Step5GTMStrategy />}
                  {state.currentStep === 6 && <Step6OutreachCampaign />}
                  {state.currentStep === 7 && <Step7DMGenerator />}
                  {state.currentStep === 8 && <Step8Summary />}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Footer */}
              <div className="mt-20 pt-8 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => setStep(Math.max(1, state.currentStep - 1) as StepId)}
                  disabled={state.currentStep === 1}
                  className="px-6 py-3 rounded-xl font-bold text-text-secondary hover:bg-section transition-all disabled:opacity-0"
                >
                  Back
                </button>
                {state.currentStep < 8 && (
                  <button
                    onClick={() => setStep(Math.min(8, state.currentStep + 1) as StepId)}
                    className="px-8 py-3 bg-primary text-black rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    Next Step
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <div id="strategy-report-container">
        <StrategyReport state={state} />
      </div>
    </WorkshopContext.Provider>
  );
}
