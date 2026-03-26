/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActionButton } from './components/ActionButton';
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
  Upload,
  RotateCcw,
  History,
  Mail
} from 'lucide-react';
import * as gemini from './services/gemini';
import { supabase } from './services/supabase';
import { auth, googleProvider, db } from './services/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
// logo moved to public/logo.png

// --- Types ---

type StepId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface WorkshopState {
  currentStep: StepId;
  completedSteps: StepId[];
  submissionId: string | null;
  leadFormFilled: boolean;
  isCheckingStatus: boolean;
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
    outreachChannel: 'LinkedIn' | 'Email' | 'Both';
    freeOfferType: 'Lead Magnet' | 'Interactive Tool' | 'Resource' | 'Insight-based Asset';
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
    campaignType: string[];
    campaignTypeOther: string;
    tone: string[];
    toneOther: string;
    cta: string[];
    ctaOther: string;
    numFollowUps: string;
    numFollowUpsOther: string;
    outreachAngle: 'Authority' | 'ROI' | 'Pain-led' | 'Contrarian' | 'Curiosity' | 'Offer-led';
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
    valuePropTables: any[];
    websitePrompt: string;
    gtmStrategy: any | null;
    outreachEngineOutput: gemini.OutreachEngineOutput | null;
    leadMagnets: gemini.LeadMagnet[];
    globalSolution?: string;
    profileImprovements?: string[];
  };
}

const WorkshopContext = createContext<{
  state: WorkshopState;
  setStep: (step: StepId) => void;
  updateInput: (key: keyof WorkshopState['inputs'], value: any) => void;
  completeStep: (step: StepId) => void;
  completeAndGoToStep: (current: StepId, next: StepId) => void;
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
  const otherInputRef = React.useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (isOtherSelected && otherInputRef.current) {
      otherInputRef.current.focus();
      otherInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isOtherSelected]);

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
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase text-primary tracking-widest">Please specify *</label>
              <span className="text-[9px] text-text-secondary italic">Tip: You can add multiple entries using commas</span>
            </div>
            <input
              ref={otherInputRef}
              type="text"
              required
              placeholder="Enter values (separate with commas)"
              style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
              className={`w-full px-4 py-3 rounded-xl border ${!otherValue.trim() ? 'border-red-500/50' : 'border-border'} focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all`}
              value={otherValue}
              onChange={(e) => onOtherChange(e.target.value)}
            />
            {!otherValue.trim() && (
              <p className="text-[10px] text-red-500 font-medium">Please specify your selection</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
  const { state, setStep, completeStep, completeAndGoToStep, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = ['Founder / Co-Founder', 'CEO / CXO', 'CTO / VP Engineering', 'Head of Product', 'Head of Growth', 'Head of Sales', 'Head of Marketing', 'RevOps Lead', 'SDR / BDR Manager', 'Enterprise Sales Leader', 'Partnerships Manager', 'Operations Head', 'Strategy Lead', 'Procurement Head'];
  const icps = ['Founder / Co-Founder', 'CEO / CXO', 'CTO / VP Engineering', 'Head of Product', 'Head of Growth', 'Head of Sales', 'Head of Marketing', 'RevOps Lead', 'SDR / BDR Manager', 'Enterprise Sales Leader', 'Partnerships Manager', 'Operations Head', 'Strategy Lead', 'Procurement Head'];
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

      // Validation for Role and Company
      if (!state.inputs.leadRole.length && !state.inputs.leadRoleOther) {
        setError("Please complete Role and Company to optimize your profile");
        setLoading(false);
        return;
      }
      if (!state.inputs.companyName) {
        setError("Please complete Role and Company to optimize your profile");
        setLoading(false);
        return;
      }

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-text-secondary">Company Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Myntmore"
              className={`w-full px-4 py-3 rounded-xl border ${showErrors && !state.inputs.companyName ? "border-red-500" : "border-border"} focus:ring-2 focus:ring-primary/50 outline-none bg-bg`}
              value={state.inputs.companyName}
              onChange={(e) => updateInput("companyName", e.target.value)}
            />
          </div>
          <MultiSelectDropdown showErrors={showErrors}
            label="Your Role *"
            options={['Founder', 'CEO', 'Marketer', 'Sales Head', 'Freelancer', 'Consultant']}
            selected={state.inputs.leadRole}
            onChange={(val) => updateInput('leadRole', val)}
            otherValue={state.inputs.leadRoleOther}
            onOtherChange={(val) => updateInput('leadRoleOther', val)}
            placeholder="Select Role(s)"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-text-secondary">What do you offer?</label>
          <input
            type="text"
            placeholder="e.g. We help [ICP] achieve [outcome] or X → Y for Z"
            className={`w-full px-4 py-3 rounded-xl border ${showErrors && !state.inputs.offer ? "border-red-500" : "border-border"} focus:ring-2 focus:ring-primary/50 outline-none bg-bg`}
            value={state.inputs.offer}
            onChange={(e) => updateInput('offer', e.target.value)}
          />
          <p className="text-[10px] text-text-secondary">Example: "Reduce hiring time → for Talent Leaders → using automation"</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MultiSelectDropdown showErrors={showErrors}
            label="Target ICP Designation"
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

        {state.outputs.profileClarityScore === 0 ? (
          <div className="flex justify-center pt-4">
            <ActionButton
              onClick={handleOptimize}
              loading={loading}
              label="Optimize My Profile"
              microtext="Build authority & clarity"
              disabled={!state.inputs.linkedinHeadline || !state.inputs.linkedinAbout || state.inputs.targetIcp.length === 0 || state.inputs.tonePreference.length === 0 || !state.inputs.offer || !state.inputs.companyName || (!state.inputs.leadRole.length && !state.inputs.leadRoleOther)}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
              <p className="text-emerald-500 font-bold text-sm">✓ Profile Optimization Complete</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <ActionButton
                onClick={() => {
                  completeStep(1);
                  setStep(2);
                }}
                label="Generate ICP Profiles"
                microtext="Identify who you should be targeting"
              />
              <button
                onClick={handleOptimize}
                disabled={loading}
                className="text-text-secondary hover:text-primary transition-all text-xs font-bold uppercase tracking-widest"
              >
                {loading ? "Optimizing..." : "Regenerate Profile"}
              </button>
            </div>
          </div>
        )}
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
              <h4 className="text-xs font-bold uppercase text-text-secondary mb-3">What Your Score Means</h4>
              <div className="space-y-2">
                {[
                  { range: "90–100", label: "Excellent", min: 90 },
                  { range: "70–89", label: "Strong", min: 70 },
                  { range: "50–69", label: "Average", min: 50 },
                  { range: "Below 50", label: "Needs Improvement", min: 0 }
                ].map((tier) => {
                  const isCurrent = tier.range === "Below 50" 
                    ? state.outputs.profileClarityScore < 50 
                    : (state.outputs.profileClarityScore >= tier.min && (tier.min === 90 ? state.outputs.profileClarityScore <= 100 : state.outputs.profileClarityScore < (tier.min + 20)));
                  
                  return (
                    <div key={tier.label} className={`flex items-center justify-between p-2 rounded-lg border ${isCurrent ? 'bg-primary/20 border-primary text-primary font-bold' : 'border-transparent text-text-secondary opacity-50'}`}>
                      <span className="text-xs uppercase tracking-wider">{tier.label}</span>
                      <span className="text-xs">{tier.range}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 bg-section border border-border rounded-2xl">
              <h4 className="text-xs font-bold uppercase text-text-secondary mb-3">Score Explanation</h4>
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
  const { state, setStep, completeStep, completeAndGoToStep, updateInput, generateOutput } = useWorkshop();
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
    'Founder / Co-Founder', 'CEO / CXO', 'CTO / VP Engineering', 'Head of Product', 'Head of Growth', 'Head of Sales', 'Head of Marketing', 'RevOps Lead', 'SDR / BDR Manager', 'Enterprise Sales Leader', 'Partnerships Manager', 'Operations Head', 'Strategy Lead', 'Procurement Head', 'Other'
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
      <div className="pt-4 space-y-4">
        {state.outputs.icps.length === 0 ? (
          <div className="flex justify-center pt-8">
            <ActionButton
              onClick={handleGenerate}
              loading={loading}
              disabled={loading || ([1, 2, 3].every(num => {
                const roles = state.inputs[`icp${num}_roles` as keyof typeof state.inputs];
                const sizes = state.inputs[`icp${num}_sizes` as keyof typeof state.inputs];
                const inds = state.inputs[`icp${num}_industries` as keyof typeof state.inputs];
                return !(roles && roles.length > 0) && !(sizes && sizes.length > 0) && !(inds && inds.length > 0);
              }))}
              label={loading ? "Analyzing Business..." : "Generate ICP Profiles"}
              microtext="Identify who you should be targeting"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
              <p className="text-emerald-500 font-bold text-sm">✓ Targeted ICPs Identified</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <ActionButton
                onClick={() => {
                  completeStep(2);
                  setStep(3);
                }}
                label="Generate Value Proposition"
                microtext="Turn ICPs into clear value propositions"
              />
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="text-text-secondary hover:text-primary transition-all text-xs font-bold uppercase tracking-widest"
              >
                {loading ? "Analyzing..." : "Regenerate ICPs"}
              </button>
            </div>
          </div>
        )}
      </div>

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
  const { state, setStep, completeAndGoToStep, updateOutput, generateOutput } = useWorkshop();
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
        <div className="space-y-6">
          <p className="text-text-secondary italic">No positioning generated yet. Using fallback data based on your ICPs.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {state.outputs.icps.map((icp, i) => (
              <div key={i} className="p-4 bg-section-alt border border-border rounded-xl">
                <div className="text-xs font-bold text-primary mb-2">{icp.name}</div>
                <div className="text-xs text-text-secondary leading-relaxed">
                  Focus on solving: {icp.painPoints[0]}
                </div>
              </div>
            ))}
          </div>
          <ActionButton
            onClick={handleGenerate}
            loading={loading}
            label="Generate Value Proposition"
            microtext="Identify specific value per ICP"
            disabled={loading}
          />
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl text-center">
            <h3 className="text-lg font-bold text-primary">
              ✓ Positioning Strategy Inferred Successfully
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

          <div className="flex flex-col items-center gap-6 mt-12 bg-section p-8 rounded-3xl border border-border">
            <ActionButton
              onClick={() => completeAndGoToStep(3, 4)}
              label="Generate Website Assets"
              microtext="Convert positioning into copy"
            />
            
            <div className="flex gap-4">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="text-text-secondary hover:text-primary transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : null}
                Regenerate Strategy
              </button>
              <button
                onClick={() => setStep(2)}
                className="text-text-secondary hover:text-primary transition-all text-xs font-bold uppercase tracking-widest"
              >
                Edit Inputs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Step4WebsiteBuilder = () => {
  const [showErrors, setShowErrors] = useState(false);
  const { state, setStep, completeStep, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setShowErrors(true);
    setLoading(true);
    setError(null);
    try {
      await generateOutput(4);
    } catch (err: any) {
      setError(err.message || "Failed to generate website assets.");
    } finally {
      setLoading(false);
    }
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
          <Globe size={28} className="text-primary" />
          Website Builder
        </h2>
        <p className="text-text-secondary">Generate a precision-engineered prompt to build your high-converting landing page in minutes.</p>
      </div>

      {state.outputs.websitePrompt ? (
        <div className="space-y-8">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
            <p className="text-emerald-500 font-bold text-sm">✓ Website Prompt Engineered Successfully</p>
          </div>

          <OutputCard title="AI Studio Prompt" copyText={state.outputs.websitePrompt}>
            <pre className="whitespace-pre-wrap font-mono text-sm bg-section p-4 rounded-xl border border-border overflow-x-auto text-text-secondary scrollbar-thin scrollbar-thumb-primary/20">
              {state.outputs.websitePrompt}
            </pre>
          </OutputCard>

          <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-black font-black text-xl shrink-0">👉</div>
            <div>
              <h3 className="font-bold text-lg">Your prompt is ready! Use Google AI Studio to build your site:</h3>
              <a 
                href="https://aistudio.google.com/apps" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium break-all"
              >
                https://aistudio.google.com/apps
              </a>
              <p className="text-xs text-text-secondary mt-1">Copy the prompt above and paste it into AI Studio for instant code generation.</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 mt-12 bg-section p-8 rounded-3xl border border-border">
            <ActionButton
              onClick={() => {
                completeStep(4);
                setStep(5);
              }}
              label="Create Strategy"
              microtext="Turn your website into a distribution system"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="text-text-secondary hover:text-primary transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={14} />}
              Regenerate Prompt
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-text-secondary">Brand Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg focus:border-primary/50 outline-none transition-all"
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
                    className="h-12 w-12 rounded-lg border border-border p-1 cursor-pointer shrink-0 bg-transparent"
                    value={state.inputs.primaryColor}
                    onChange={(e) => updateInput('primaryColor', e.target.value)}
                  />
                  <input
                    type="text"
                    className="w-full px-3 py-3 rounded-xl border border-border bg-bg focus:border-primary/50 outline-none font-mono text-xs transition-all"
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
                    className="h-12 w-12 rounded-lg border border-border p-1 cursor-pointer shrink-0 bg-transparent"
                    value={state.inputs.secondaryColor}
                    onChange={(e) => updateInput('secondaryColor', e.target.value)}
                  />
                  <input
                    type="text"
                    className="w-full px-3 py-3 rounded-xl border border-border bg-bg focus:border-primary/50 outline-none font-mono text-xs transition-all"
                    value={state.inputs.secondaryColor}
                    onChange={(e) => updateInput('secondaryColor', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold uppercase text-text-secondary">Design Inspiration (Screenshot)</label>
                <a 
                  href="https://pinterest.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1"
                >
                  Find UI Ideas on Pinterest ↗
                </a>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  <div className="flex flex-col items-center text-text-secondary group-hover:text-primary">
                    <Upload size={24} className="mb-2" />
                    <span className="text-sm font-bold">
                      {state.inputs.inspirationImage ? 'Change Screenshot' : 'Upload UI Inspiration'}
                    </span>
                  </div>
                </label>
                {state.inputs.inspirationImage && (
                  <div className="w-32 h-32 rounded-2xl border border-border overflow-hidden relative group shadow-lg">
                    <img src={state.inputs.inspirationImage} alt="Inspiration" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => updateInput('inspirationImage', null)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-text-secondary">Upload a screenshot of a website layout you love. The AI will replicate the vibe.</p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-start gap-3 shadow-sm">
              <Zap size={20} className="text-red-500 mt-1 shrink-0" />
              <div className="flex-1">
                <p className="font-bold leading-tight">Generation Failed</p>
                <p className="mt-1 opacity-80">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="px-3 py-1.5 bg-red-500/20 rounded-lg font-bold hover:bg-red-500/30 transition-colors text-xs shrink-0">Dismiss</button>
            </div>
          )}

          <div className="flex justify-center pt-8">
            <ActionButton
              onClick={handleGenerate}
              loading={loading}
              label={loading ? "Engineering Prompt..." : "Generate Website Assets"}
              microtext="Create high-converting landing page copy"
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* AI STUDIO ENHANCEMENT PROMPTS - Always visible if prompt exists */}
      {state.outputs.websitePrompt && (
        <>
          <div className="mt-12 space-y-6 pt-12 border-t border-border/50">
            <div>
              <h3 className="text-xl font-black flex items-center gap-2">
                <Zap size={22} className="text-primary" /> 
                Refine Your Output
              </h3>
              <p className="text-sm text-text-secondary mt-1">Found a gap? Use these targeted prompts inside AI Studio to polish your site.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Conversion Optimization", desc: "Sharpen CTAs and hooks.", prompt: "Optimize this website for maximum conversion. Make the hero section more compelling and ensure CTAs are clear, aggressive, and strategically placed." },
                { title: "Visual Hierarchy", desc: "Improve section flow.", prompt: "Improve the visual hierarchy of this page. Structure the sections so the user's eye naturally flows from the problem to the solution, using clear typography differences." },
                { title: "Modern UI Upgrade", desc: "Apply 2024 tech aesthetic.", prompt: "Upgrade the UI aesthetic to feel like a premium, modern tech startup from 2024. Use subtle gradients, bento-box layouts, and glassmorphism where appropriate." },
                { title: "Mobile Layout", desc: "Force responsive stack orders.", prompt: "Optimize this entire prompt for a mobile-first layout. Ensure font sizes, spacing, and stack orders are explicitly defined for mobile viewports." },
                { title: "Consistency Check", desc: "Align tone across sections.", prompt: "Review and rewrite the copy to perfectly match a bold, authoritative, yet approachable B2B tone. Ensure colors and CSS match the brand identity." },
                { title: "Trust Markers", desc: "Add social proof hooks.", prompt: "Enhance the trust-building elements of this site. Integrate realistic placeholders for social proof, logos, testimonials, and data-backed claims." }
              ].map((p, i) => (
                <div key={i} className="p-5 bg-section-alt border border-border rounded-2xl flex flex-col gap-3 group hover:border-primary/50 transition-all">
                  <h4 className="font-bold text-sm">{p.title}</h4>
                  <p className="text-[11px] text-text-secondary leading-tight">{p.desc}</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(p.prompt);
                      alert('Prompt copied!');
                    }}
                    className="mt-auto py-2 bg-bg text-[10px] font-black uppercase tracking-wider text-text-secondary border border-border rounded-lg hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                  >
                    <Copy size={10} /> Copy Prompt
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" /> 
              Common Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { q: "How do I deploy?", a: "Copy HTML/CSS to a file, push to GitHub, and link to Vercel." },
                { q: "AI cut off mid-code?", a: "Type 'continue code' in AI Studio." },
                { q: "Broken design?", a: "Run the 'Modern UI Upgrade' prompt above." },
                { q: "Generic copy?", a: "Supply your specific ROI metrics as reference." }
              ].map((faq, i) => (
                <div key={i} className="p-4 bg-section/50 border border-border rounded-xl">
                  <p className="text-xs font-bold mb-1">{faq.q}</p>
                  <p className="text-[11px] text-text-secondary">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Step5GTMStrategy = () => {
  const [showErrors, setShowErrors] = useState(false);
  const { state, setStep, completeStep, completeAndGoToStep, generateOutput } = useWorkshop();
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
      <div className="pt-4 space-y-4">
        {!strategy ? (
          <div className="flex justify-center pt-8">
            <ActionButton
              onClick={handleGenerate}
              loading={loading}
              label="Build GTM Strategy"
              microtext="Map out your distribution roadmap"
              disabled={loading}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
              <p className="text-emerald-500 font-bold text-sm">✓ GTM Roadmap Synchronized</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <ActionButton
                onClick={() => {
                  completeStep(5);
                  setStep(6);
                }}
                label="Generate Outreach"
                microtext="Create a structured outbound system"
              />
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="text-text-secondary hover:text-primary transition-all text-xs font-bold uppercase tracking-widest"
              >
                {loading ? "Regenerating..." : "Regenerate Strategy"}
              </button>
            </div>
          </div>
        )}
      </div>

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
              Outreach Strategy
            </button>
            <button
              onClick={() => setActiveTab('partner')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'partner' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-section-alt'
              }`}
            >
              Partner Led Growth
            </button>
            <button
              onClick={() => setActiveTab('event')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'event' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-section-alt'
              }`}
            >
              Event Led Growth
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
                    Outreach Strategy
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
                            <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary">Distribution Tips</h4>
                            <div className="space-y-4">
                              {o.channelTips.map((ct: any, j: number) => (
                                <div key={j} className="space-y-2">
                                  <div className="text-[10px] font-bold uppercase text-primary/70">{ct.channel} Best Practices</div>
                                  <div className="p-4 bg-section-alt rounded-xl border border-border space-y-2">
                                    {ct.tips.map((tip: string, k: number) => (
                                      <div key={k} className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                                        <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                                        {tip}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
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

const Step6OutreachEngine = () => {
  const [showErrors, setShowErrors] = useState(false);
  const { state, setStep, completeStep, completeAndGoToStep, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    // 1. Validate Inputs
    const icpData = state.outputs.icps;
    const valuePropData = state.outputs.valuePropTables;
    const selectedAngle = state.inputs.outreachAngle;
    const tone = state.inputs.tonePreference;

    console.log("Step 6 Input Validation:", { icpData, valuePropData, selectedAngle, tone });

    if (!icpData || icpData.length === 0 || !valuePropData || valuePropData.length === 0) {
      setError("Complete previous steps (ICP Mapping & Value Prop) before generating outreach strategy.");
      return;
    }

    if (!selectedAngle) {
      setError("Please select a strategic angle first.");
      return;
    }

    setShowErrors(true);
    setLoading(true);
    setError(null);
    try {
      await generateOutput(6);
      console.log("Step 6 Output:", state.outputs.outreachEngineOutput);
    } catch (err) {
      console.error("Step 6 Generation Error:", err);
      setError("Generation failed. Please retry.");
    }
    setLoading(false);
  };

  const angles = ['Authority', 'ROI', 'Pain-led', 'Contrarian', 'Curiosity', 'Offer-led'];
  const channels = ['LinkedIn', 'Email', 'Both'];

  const out = state.outputs.outreachEngineOutput;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Outreach Strategy Engine</h2>
        <p className="text-text-secondary">Generate high-conversion, angle-driven messaging for your target channels.</p>
      </div>

      <div className="bg-section p-6 rounded-2xl border border-border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-text-secondary tracking-wider">Target Channel</label>
            <div className="flex gap-2">
              {channels.map(c => (
                <button
                  key={c}
                  onClick={() => updateInput('outreachChannel', c)}
                  className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${
                    state.inputs.outreachChannel === c 
                      ? 'bg-primary border-primary text-black' 
                      : 'border-border text-text-secondary hover:border-primary/50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-text-secondary tracking-wider">Strategic Angle</label>
            <div className="grid grid-cols-2 gap-2">
              {angles.map(a => (
                <button
                  key={a}
                  onClick={() => updateInput('outreachAngle', a)}
                  className={`py-2 rounded-xl border font-bold text-[10px] uppercase tracking-wider transition-all ${
                    state.inputs.outreachAngle === a 
                      ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20' 
                      : 'border-border text-text-secondary hover:border-primary/50'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!out ? (
          <div className="flex justify-center pt-8">
            <ActionButton
              onClick={handleGenerate}
              loading={loading}
              label="Generate Outreach Strategy"
              microtext={`Create ${state.inputs.outreachAngle}-led messaging`}
              disabled={loading}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
              <p className="text-emerald-500 font-bold text-sm">✓ {state.inputs.outreachAngle} Campaign Generated</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <ActionButton
                onClick={() => {
                  completeStep(6);
                  setStep(7);
                }}
                label="Finalize Strategy Report"
                microtext="Download your complete playbook"
              />
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="text-text-secondary hover:text-primary transition-all text-xs font-bold uppercase tracking-widest"
              >
                {loading ? "Regenerating..." : "Regenerate Single Angle"}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
          {error}
        </div>
      )}

      {out && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Strategy Hook */}
          <div className="p-8 bg-primary/5 border-2 border-primary/20 rounded-3xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap size={64} className="text-primary" />
            </div>
            <h4 className="text-xs font-black uppercase text-primary mb-4 tracking-[0.2em] flex items-center gap-2">
              <Sparkles size={16} /> Strategy Hook: {state.inputs.outreachAngle}
            </h4>
            <p className="text-xl font-black leading-tight italic">
              "{out.strategySummary}"
            </p>
          </div>

          {/* LinkedIn Sequence */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
              <Linkedin size={20} className="text-primary" /> LinkedIn Sequence
            </h3>
            <div className="space-y-4">
              <div className="p-6 bg-section border border-border rounded-xl group hover:border-primary/30 transition-all">
                <span className="block text-[10px] uppercase font-bold text-primary mb-2 tracking-widest">Connection Request</span>
                <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap">
                  {out.linkedIn.connectionRequest}
                </p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(out.linkedIn.connectionRequest);
                    alert('Copied!');
                  }}
                  className="mt-4 text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1 hover:underline"
                >
                  <Copy size={12} /> Copy Request
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {out.linkedIn.followUps.map((f, i) => (
                  <div key={i} className="p-4 bg-section/50 border border-border rounded-xl">
                    <span className="block text-[8px] uppercase font-bold text-text-secondary mb-2 text-right">Follow-up {i + 1}</span>
                    <p className="text-[11px] leading-relaxed italic text-text-secondary">"{f}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Email Campaign */}
          <div className="space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
              <Mail size={20} className="text-primary" /> Cold Email Campaign
            </h3>
            <div className="space-y-4">
              <div className="p-6 bg-section border-2 border-primary/10 rounded-xl relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="absolute top-0 right-0 bg-primary/10 px-3 py-1 text-[8px] font-black uppercase tracking-tighter">Primary Asset</div>
                <div className="inline-block px-3 py-1 bg-bg rounded-lg border border-border text-[10px] font-bold uppercase tracking-widest text-primary mb-4">
                  Subject: {out.email.subjectLine}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-text-primary">
                  {out.email.body}
                </p>
                <div className="flex gap-4 mt-6 pt-4 border-t border-border">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(out.email.body);
                      alert('Email body copied!');
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1 hover:underline"
                  >
                    <Copy size={12} /> Copy Body
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(out.email.subjectLine);
                      alert('Subject line copied!');
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-text-secondary flex items-center gap-1 hover:underline"
                  >
                    <Copy size={12} /> Copy Subject
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {out.email.followUps.map((f, i) => (
                  <div key={i} className="p-4 bg-section/50 border border-border rounded-xl">
                    <span className="block text-[8px] uppercase font-bold text-primary mb-2 text-right">Email Follow-up {i + 1}</span>
                    <p className="text-[11px] leading-relaxed italic text-text-secondary">"{f}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const Step7Summary = () => {
  const { state } = useWorkshop();
  const [error, setError] = useState<string | null>(null);

  const handleDownload = () => {
    // 1. Validate Required Sections
    const { profileClarityScore, icps, valuePropTables, gtmStrategy, outreachEngineOutput, globalSolution } = state.outputs;
    
    console.log("PDF Data Validation:", { profileClarityScore, icps, valuePropTables, gtmStrategy, outreachEngineOutput, globalSolution });

    const missing = [];
    if (!profileClarityScore) missing.push("Profile Optimization");
    if (!icps || icps.length === 0) missing.push("ICP Breakdown");
    if (!valuePropTables || valuePropTables.length === 0) missing.push("Value Proposition");
    if (!gtmStrategy) missing.push("GTM Strategy");
    if (!outreachEngineOutput) missing.push("Outreach Strategy");

    if (missing.length > 0) {
      setError(`Some sections are missing: ${missing.join(', ')}. Please complete all steps before exporting.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setError(null);
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
        <p className="text-text-secondary text-lg">You've built a complete growth strategy engine.</p>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold max-w-lg mx-auto"
          >
            {error}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ICP Summary */}
        <div className="p-8 border-2 border-border rounded-3xl bg-section shadow-sm group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-primary group-hover:scale-110 transition-transform" size={20} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Target Market</h4>
          </div>
          <p className="text-sm leading-relaxed">
            {state.outputs.icps.length > 0 
              ? `${state.outputs.icps.length} ICPs identified, led by ${state.outputs.icps[0].name}.`
              : "Market segments defined based on your offering."}
          </p>
        </div>
        
        {/* Value Prop Summary */}
        <div className="p-8 border-2 border-primary/30 rounded-3xl bg-primary/5 shadow-sm group">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-primary group-hover:scale-110 transition-transform" size={20} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Core Positioning</h4>
          </div>
          <div className="space-y-2">
            {state.outputs.valuePropTables.length > 0 ? (
              <>
                <div className="text-lg font-black text-primary leading-tight">
                  {state.outputs.valuePropTables[0].desiredOutcome}
                </div>
                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                  Method: {state.outputs.valuePropTables[0].method}
                </p>
              </>
            ) : (
              <p className="text-sm text-text-secondary italic">Positioning inferred from client metrics and pain points.</p>
            )}
          </div>
        </div>

        {/* Outreach Engine Summary */}
        <div className="p-8 border-2 border-border rounded-3xl bg-section shadow-sm group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <Send className="text-primary group-hover:scale-110 transition-transform" size={20} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Outreach Strategy</h4>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-bold">{state.inputs.outreachChannel} | {state.inputs.outreachAngle}</div>
            {state.outputs.outreachEngineOutput && (
              <p className="text-[11px] text-text-secondary italic line-clamp-3">"{state.outputs.outreachEngineOutput.strategySummary}"</p>
            )}
          </div>
        </div>

        {/* Assets Ready Summary */}
        <div className="p-8 border-2 border-border rounded-3xl bg-section shadow-sm group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <Download className="text-primary group-hover:scale-110 transition-transform" size={20} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Strategy Assets</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" /> ICP Playbook
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Landing Page Prompt
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Sequence Assets
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Full GTM Plan
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 mt-12 bg-section p-8 rounded-3xl border border-border">
        <ActionButton
          onClick={handleDownload}
          label="Generate Strategy PDF"
          microtext="Your complete business playbook"
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(state.outputs, null, 2));
            alert('Full strategy data copied!');
          }}
          className="text-text-secondary hover:text-primary transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
        >
          <Copy size={14} />
          Copy Full Strategy Data
        </button>
      </div>
    </div>
  );
};

const ResumeModal = ({ onResume, onStartOver }: { onResume: () => void, onStartOver: () => void }) => (
  <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="max-w-md w-full bg-section border border-border rounded-3xl p-8 shadow-2xl text-center"
    >
      <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <History className="text-primary" size={32} />
      </div>
      <h2 className="text-2xl font-bold mb-4">Resume where you left off?</h2>
      <p className="text-text-secondary mb-8">
        We found your saved progress. Would you like to continue from your last step or start a new workshop?
      </p>
      <div className="space-y-3">
        <button
          onClick={onResume}
          className="w-full py-4 bg-primary text-black rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          Resume Workshop
          <ArrowRight size={20} />
        </button>
        <button
          onClick={onStartOver}
          className="w-full py-4 bg-bg text-text-secondary border border-border rounded-xl font-bold text-lg hover:bg-section transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} />
          Start Over
        </button>
      </div>
    </motion.div>
  </div>
);

const Step0LeadCapture = React.memo(({ 
  user, 
  loading, 
  error, 
  initialInputs, 
  onGoogleLogin, 
  onLogout, 
  onSubmit 
}: { 
  user: FirebaseUser | null, 
  loading: boolean, 
  error: string | null, 
  initialInputs: any,
  onGoogleLogin: () => void, 
  onLogout: () => void, 
  onSubmit: (data: any) => void 
}) => {
  const [localInputs, setLocalInputs] = useState({
    fullName: initialInputs.fullName || '',
    workEmail: initialInputs.workEmail || '',
    phone: initialInputs.phone || '',
    companyName: initialInputs.companyName || ''
  });

  // Sync initial inputs if user changes (e.g. login)
  useEffect(() => {
    if (user) {
      setLocalInputs(prev => ({
        ...prev,
        fullName: prev.fullName || user.displayName || '',
        workEmail: prev.workEmail || user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setLocalInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(localInputs);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-bg flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-section border border-border rounded-3xl p-8 md:p-12 shadow-2xl"
      >
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Logo" className="h-16 w-auto mx-auto mb-6" />
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-primary mb-4">
            {user ? "Complete Your Profile" : "Start Your Growth Workshop"}
          </h1>
          <p className="text-text-secondary text-lg">
            {user 
              ? "Just a few more details to personalize your experience." 
              : "Login with Google to begin your personalized growth system."}
          </p>
        </div>

        {!user ? (
          <div className="space-y-6">
            <button
              type="button"
              onClick={onGoogleLogin}
              disabled={loading}
              className="w-full py-5 bg-white text-black rounded-2xl font-black text-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-4 border-2 border-gray-100 shadow-xl shadow-black/5"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                  Continue with Google
                </>
              )}
            </button>
            <p className="text-center text-xs text-text-secondary font-medium">
              Secure, 1-click entry. No password required.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLocalSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-secondary tracking-widest">Full Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg text-lg transition-all"
                  value={localInputs.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-secondary tracking-widest">Work Email *</label>
                <input
                  type="email"
                  required
                  readOnly={!!user?.email}
                  className={`w-full px-4 py-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg text-lg transition-all ${user?.email ? 'opacity-70 cursor-not-allowed' : ''}`}
                  value={localInputs.workEmail}
                  onChange={(e) => handleChange('workEmail', e.target.value)}
                  placeholder="john@company.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-secondary tracking-widest">Phone Number *</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg text-lg transition-all"
                  value={localInputs.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-secondary tracking-widest">Company Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg text-lg transition-all"
                  value={localInputs.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Your Company Inc."
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm font-bold text-center bg-red-500/10 py-3 rounded-xl">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Saving...
                </>
              ) : (
                <>
                  Enter Workshop
                  <ArrowRight size={24} />
                </>
              )}
            </button>
            <button 
              type="button"
              onClick={onLogout}
              className="w-full text-center text-sm text-text-secondary hover:text-red-500 transition-colors font-bold uppercase tracking-widest"
            >
              Cancel & Sign Out
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
});

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
      outreachChannel: 'Both' as const,
      outreachAngle: 'Authority' as const,
      freeOfferType: 'Lead Magnet' as const,
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
          leadFormFilled: !!parsed.submissionId,
          isCheckingStatus: false,
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
            valuePropTables: [],
            websitePrompt: '',
            gtmStrategy: null,
            outreachEngineOutput: null,
            leadMagnets: [],
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
      leadFormFilled: false,
      isCheckingStatus: false,
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
        outreachEngineOutput: null,
        leadMagnets: [],
        valuePropTables: [],
        globalSolution: '',
      },
    };
  });

  const [showResumeModal, setShowResumeModal] = useState(false);
  const [sessionToResume, setSessionToResume] = useState<WorkshopState | null>(null);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setState(prev => ({ ...prev, isCheckingStatus: true }));
        try {
          // Check for active session in Firestore
          const docRef = doc(db, 'users', firebaseUser.uid, 'workshop', 'active');
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const savedState = docSnap.data() as WorkshopState;
            setSessionToResume(savedState);
            setShowResumeModal(true);
          } else {
            // Fallback to check if lead form is already filled in older system
            const { data } = await supabase
              .from('workshop_submissions')
              .select('id, workshop_inputs')
              .eq('user_uid', firebaseUser.uid)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (data) {
              setState(prev => ({ 
                ...prev, 
                leadFormFilled: true,
                submissionId: data.id,
                inputs: { ...prev.inputs, ...(data.workshop_inputs || {}) }
              }));
            }
          }
        } catch (err) {
          console.warn("Error checking for existing session", err);
        } finally {
          setState(prev => ({ ...prev, isCheckingStatus: false }));
        }
      }
    });
    return () => unsubscribe();
  }, [db]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Optional: Reset state or redirect
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };


  // Auto-save progress to Firestore
  useEffect(() => {
    if (user && state.leadFormFilled && state.currentStep > 0) {
      const syncData = async () => {
        try {
          await setDoc(doc(db, 'users', user.uid, 'workshop', 'active'), state);
          setShowSaveIndicator(true);
          setTimeout(() => setShowSaveIndicator(false), 2000);
        } catch (err) {
          console.error("Firestore Sync Error:", err);
        }
      };

      const timer = setTimeout(syncData, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, state]);

  const handleResume = () => {
    if (sessionToResume) {
      setState(sessionToResume);
    }
    setShowResumeModal(false);
  };

  const handleStartOver = () => {
    localStorage.removeItem('workshop_progress_step');
    localStorage.removeItem('userLeadData');
    window.location.reload();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError("Google Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    const { fullName, workEmail, phone, companyName } = formData;
    
    // Update global state first so handleSubmit can use it if needed, 
    // though here we use the formData directly for the Supabase call
    setState(prev => ({
      ...prev,
      inputs: {
        ...prev.inputs,
        fullName,
        workEmail,
        phone,
        companyName
      }
    }));

    setLoading(true);
    setError('');

    console.log("Submitting lead form...", formData);
    try {
      if (user) {
        console.log("Saving to Firestore...");
        await setDoc(doc(db, 'users', user.uid, 'workshop', 'active'), {
          ...state,
          leadFormFilled: true,
          currentStep: 1,
          completedSteps: [0],
          inputs: { ...state.inputs, fullName, workEmail, phone, companyName }
        });
        console.log("Firestore Save complete.");
      }

      console.log("Saving to Supabase...");
      // Legacy support for Supabase tracking
      const { data, error: sbError } = await supabase
        .from('workshop_submissions')
        .insert({
          user_uid: user?.uid,
          user_email: user?.email,
          full_name: fullName,
          work_email: workEmail,
          phone: phone,
          company_name: companyName,
          lead_role: state.inputs.leadRole,
          current_step: 0,
          workshop_inputs: { ...state.inputs, fullName, workEmail, phone, companyName },
          workshop_outputs: state.outputs
        })
        .select()
        .single();

      if (sbError) {
        console.warn("Supabase Insert Error (Non-blocking):", sbError);
      } else if (data) {
        setSubmissionId(data.id);
        const leadData = { fullName, workEmail, phone, companyName, leadRole: state.inputs.leadRole, submissionId: data.id };
        localStorage.setItem('userLeadData', JSON.stringify(leadData));
      }

      console.log("Supabase Save complete.");
      setState(prev => ({ ...prev, leadFormFilled: true }));
      completeStep(0);
      setStep(1);
    } catch (err: any) {
      console.error("Workshop Start Error:", err);
      setError('Failed to start workshop. Please try again.');
    } finally {
      setLoading(false);
    }
  };


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

  const completeAndGoToStep = (current: StepId, next: StepId) => {
    setState(prev => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(current)
        ? prev.completedSteps
        : [...prev.completedSteps, current],
      currentStep: next
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
        
        const roleStr = inputs.leadRole.includes('Other')
          ? [...inputs.leadRole.filter(r => r !== 'Other'), ...(inputs.leadRoleOther as string).split(',').map(s => s.trim()).filter(Boolean)].join(', ')
          : inputs.leadRole.join(', ');

        const targetIcpStr = inputs.targetIcp.includes('Other')
          ? [...inputs.targetIcp.filter(i => i !== 'Other'), ...(inputs.targetIcpOther as string).split(',').map(s => s.trim()).filter(Boolean)].join(', ')
          : inputs.targetIcp.join(', ');

        const toneStr = inputs.tonePreference.includes('Other')
          ? [...inputs.tonePreference.filter(t => t !== 'Other'), ...(inputs.tonePreferenceOther as string).split(',').map(s => s.trim()).filter(Boolean)].join(', ')
          : inputs.tonePreference.join(', ');

        const result = await gemini.optimizeLinkedInProfile({
          headline: inputs.linkedinHeadline,
          about: inputs.linkedinAbout,
          role: roleStr,
          company: inputs.companyName,
          targetIcp: targetIcpStr,
          tone: toneStr,
          offer: inputs.offer
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
            roles: roles.includes('Other') ? [...roles.filter(r => r !== 'Other'), ...(inputs[`icp${num}_rolesOther` as keyof typeof inputs] as string).split(',').map(s => s.trim()).filter(Boolean)] : roles,
            sizes: sizes.includes('Other') ? [...sizes.filter(s => s !== 'Other'), ...(inputs[`icp${num}_sizesOther` as keyof typeof inputs] as string).split(',').map(s => s.trim()).filter(Boolean)] : sizes,
            industries: inds.includes('Other') ? [...inds.filter(i => i !== 'Other'), ...(inputs[`icp${num}_industriesOther` as keyof typeof inputs] as string).split(',').map(s => s.trim()).filter(Boolean)] : inds,
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
          narrativeAngles: (inputs.narrativeAngles || []).includes('Other') 
            ? [...(inputs.narrativeAngles || []).filter(a => a !== 'Other'), ...(inputs.narrativeAnglesOther as string).split(',').map(s => s.trim()).filter(Boolean)] 
            : (inputs.narrativeAngles || []),
          tonePreference: (inputs.tonePreference || []).includes('Other')
            ? [...(inputs.tonePreference || []).filter(t => t !== 'Other'), ...(inputs.tonePreferenceOther as string).split(',').map(s => s.trim()).filter(Boolean)]
            : (inputs.tonePreference || [])
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
        const indList = Array.isArray(inputs.industry) ? inputs.industry : [];
        const industryStr = indList.includes('Other') 
          ? [...indList.filter((i: string) => i !== 'Other'), inputs.industryOther].join(', ')
          : indList.join(', ');
        const strategy = await gemini.generateDetailedGTM({
          icps: newOutputs.icps,
          offer: inputs.offer,
          valuePropTables: newOutputs.valuePropTables,
          industry: industryStr
        });
        newOutputs.gtmStrategy = strategy;
        newOutputs.leadMagnets = strategy.leadMagnets;
      } else if (step === 6) {
        const ind = Array.isArray(inputs.industry) ? inputs.industry : [];
        // CRITICAL: Pass the outreach part of GTM if it exists as an object
        const gtmContext = newOutputs.gtmStrategy?.leadGen?.outreach
          ? JSON.stringify(newOutputs.gtmStrategy.leadGen.outreach).substring(0, 1500)
          : "Standard GTM";
          
        const outreach = await gemini.generateOutreachEngine({
          clientName: inputs.fullName,
          companyName: inputs.companyName,
          whatTheySell: inputs.offer,
          targetIndustry: ind.filter((i: string) => i !== 'Other').join(', '),
          primaryProblem: newOutputs.icps[0]?.painPoints[0] || "",
          valueProp: newOutputs.globalSolution || newOutputs.valueProp || "Strategic Growth Positioning",
          icpSummary: newOutputs.icpSummary,
          gtmStrategy: gtmContext,
          angle: inputs.outreachAngle || 'Authority',
          channel: inputs.outreachChannel || 'Both'
        });
        newOutputs.outreachEngineOutput = outreach;
      }

      setState(prev => ({ ...prev, outputs: newOutputs, completedSteps: [...prev.completedSteps, step] }));
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
    { id: 6, label: 'Outreach Engine', icon: Send },
    { id: 7, label: 'Wrap Up', icon: LayoutDashboard },
  ];

  const currentStepData = steps.find(s => s.id === state.currentStep);

  if (!user || !state.leadFormFilled || state.isCheckingStatus) {
    return (
      <WorkshopContext.Provider value={{ state, setStep, updateInput, completeStep, completeAndGoToStep, generateOutput, updateOutput, setSubmissionId }}>
        {state.isCheckingStatus ? (
          <div className="fixed inset-0 bg-bg flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center font-black text-2xl text-black shadow-lg shadow-primary/20 animate-bounce">M</div>
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">Verifying Access...</p>
            </div>
          </div>
        ) : (
          <Step0LeadCapture 
            user={user}
            loading={loading}
            error={error}
            initialInputs={state.inputs}
            onGoogleLogin={handleGoogleLogin}
            onLogout={handleLogout}
            onSubmit={handleSubmit}
          />
        )}
      </WorkshopContext.Provider>
    );
  }

  return (
    <WorkshopContext.Provider value={{ state, setStep, updateInput, completeStep, completeAndGoToStep, generateOutput, updateOutput, setSubmissionId }}>
      <div className="print:hidden flex min-h-screen bg-bg">
        {/* Sidebar */}
        <aside className="w-72 border-r border-border fixed h-full bg-bg z-20 hidden lg:block">
          <div className="p-8">
            <div className="flex items-center gap-2 mb-12">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
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
              <span className="text-sm font-bold text-text-secondary">Step {state.currentStep} of 7</span>
              <div className="w-48 h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${(state.currentStep / 7) * 100}%` }}
                   className="h-full bg-primary"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <AnimatePresence>
                {showSaveIndicator && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"
                  >
                    <Check size={12} />
                    Progress Saved
                  </motion.div>
                )}
              </AnimatePresence>
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-text-primary">{user.displayName || 'User'}</span>
                    <button onClick={handleLogout} className="text-[10px] text-text-secondary hover:text-red-500 transition-colors uppercase font-bold tracking-widest">Logout</button>
                  </div>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-border" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-section border border-border flex items-center justify-center text-xs font-bold">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-section border border-border flex items-center justify-center text-xs font-bold">?</div>
              )}
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
                  {state.currentStep === 6 && <Step6OutreachEngine />}
                  {state.currentStep === 7 && <Step7Summary />}
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
                {state.currentStep < 7 && (
                  <div className="relative group">
                    <button
                      onClick={() => {
                        if (state.completedSteps.includes(state.currentStep as StepId)) {
                          setStep(Math.min(7, state.currentStep + 1) as StepId);
                        }
                      }}
                      disabled={!state.completedSteps.includes(state.currentStep as StepId)}
                      className={`
                        px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2
                        ${state.completedSteps.includes(state.currentStep as StepId)
                          ? 'bg-primary text-black hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20'
                          : 'bg-section text-text-secondary opacity-50 cursor-not-allowed grayscale'
                        }
                      `}
                    >
                      {state.currentStep === 1 ? 'Define Your Target ICPs' : 
                       state.currentStep === 5 ? 'Build Your Outreach Engine' :
                       'Next Step'}
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <div id="strategy-report-container">
        <StrategyReport state={state} />
      </div>
      <AnimatePresence>
        {showResumeModal && (
          <ResumeModal 
            onResume={handleResume} 
            onStartOver={handleStartOver} 
          />
        )}
      </AnimatePresence>
    </WorkshopContext.Provider>
  );
}
