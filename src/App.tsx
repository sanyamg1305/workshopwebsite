/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * HARDENED VERSION — All unsafe property access patterns replaced.
 * Changes summary at bottom of file.
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
  Mail,
  Info,
  Flame,
  AlertCircle
} from 'lucide-react';
import * as gemini from './services/gemini';
import { supabase } from './services/supabase';
import { auth, googleProvider, db } from './services/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { DebouncedInput, DebouncedTextarea } from './components/DebouncedInput';
import { useNonBlockingSave } from './hooks/useNonBlockingSave';
import { ROLES, SIZES, INDUSTRIES, TONES, NARRATIVE_ANGLES } from './constants/workshop';
import { buildIcp, normalizeInputList } from './utils/workshop';

// ─────────────────────────────────────────────
// UTILITY: safe normalisation helpers
// ─────────────────────────────────────────────

/** Normalise a multi-select list, expanding the "Other" free-text entry. */
const normalizeInputArray = (list: string[] | undefined | null, otherVal?: string): string[] => {
  const safeList = Array.isArray(list) ? list : [];
  if (safeList.length === 0) return [];
  if (safeList.includes('Other') && otherVal?.trim()) {
    const others = otherVal.split(',').map((s) => s.trim()).filter(Boolean);
    return [...safeList.filter((item) => item !== 'Other'), ...others];
  }
  return safeList;
};


// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

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
    yourRole: string[];
    yourRoleOther: string;
    linkedinUrl: string;
    linkedinHeadline: string;
    linkedinAbout: string;
    targetIcpDesignation: string[];
    targetIcpDesignationOther: string;
    tonePreference: string[];
    tonePreferenceOther: string;
    offer: string;
    icp1_roles: string[]; icp1_rolesOther: string;
    icp1_sizes: string[]; icp1_sizesOther: string;
    icp1_industries: string[]; icp1_industriesOther: string;
    icp2_roles: string[]; icp2_rolesOther: string;
    icp2_sizes: string[]; icp2_sizesOther: string;
    icp2_industries: string[]; icp2_industriesOther: string;
    icp3_roles: string[]; icp3_rolesOther: string;
    icp3_sizes: string[]; icp3_sizesOther: string;
    icp3_industries: string[]; icp3_industriesOther: string;
    industry: string[]; industryOther: string;
    companySize: string[]; companySizeOther: string;
    geography: string[]; geographyOther: string;
    decisionMaker: string[]; decisionMakerOther: string;
    painPoints: string[]; painPointsOther: string;
    budget: string[]; budgetOther: string;
    outcome: string[]; outcomeOther: string;
    method: string[]; methodOther: string;
    replacement: string[]; replacementOther: string;
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
    narrativeAngles: string[]; narrativeAnglesOther: string;
    dmAngle: string[]; dmAngleOther: string;
    dmTone: string[]; dmToneOther: string;
    campaignType: string[]; campaignTypeOther: string;
    tone: string[]; toneOther: string;
    cta: string[]; ctaOther: string;
    numFollowUps: string; numFollowUpsOther: string;
    outreachAngle: 'Authority' | 'ROI' | 'Pain-led' | 'Contrarian' | 'Curiosity' | 'Offer-led';
  };
  outputs: {
    profileClarityScore: number;
    scoreMeaning: string;
    scoreExplanation: gemini.DiagnosticReport | string;
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
    leadMagnets: any[];
    globalSolution?: string;
    profileImprovements?: string[];
  };
  isGenerating: boolean;
  generationError: string | null;
}

// --- WORKSHOP SAFETY LAYER (CENTRALIZED) ---
export function safeStr(v: any, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}
export function safeArr<T>(v: any): T[] {
  return Array.isArray(v) ? v : [];
}

export const buildSafeInputs = (inputs: any) => ({
  fullName: safeStr(inputs?.fullName),
  workEmail: safeStr(inputs?.workEmail),
  phone: safeStr(inputs?.phone),
  companyName: safeStr(inputs?.companyName),
  brandName: safeStr(inputs?.brandName),
  industry: safeArr<string>(inputs?.industry),
  industryOther: safeStr(inputs?.industryOther),
  offer: safeStr(inputs?.offer),
  primaryColor: safeStr(inputs?.primaryColor) || '#FFC947',
  secondaryColor: safeStr(inputs?.secondaryColor) || '#000000',
  yourRole: safeArr<string>(inputs?.yourRole),
  yourRoleOther: safeStr(inputs?.yourRoleOther),
  linkedinUrl: safeStr(inputs?.linkedinUrl),
  linkedinHeadline: safeStr(inputs?.linkedinHeadline),
  linkedinAbout: safeStr(inputs?.linkedinAbout),
  targetIcpDesignation: safeArr<string>(inputs?.targetIcpDesignation),
  targetIcpDesignationOther: safeStr(inputs?.targetIcpDesignationOther),
  tonePreference: safeArr<string>(inputs?.tonePreference),
  tonePreferenceOther: safeStr(inputs?.tonePreferenceOther),
  companySize: safeArr<string>(inputs?.companySize),
  companySizeOther: safeStr(inputs?.companySizeOther),
  geography: safeArr<string>(inputs?.geography),
  geographyOther: safeStr(inputs?.geographyOther),
  decisionMaker: safeArr<string>(inputs?.decisionMaker),
  decisionMakerOther: safeStr(inputs?.decisionMakerOther),
  painPoints: safeArr<string>(inputs?.painPoints),
  painPointsOther: safeStr(inputs?.painPointsOther),
  budget: safeArr<string>(inputs?.budget),
  budgetOther: safeStr(inputs?.budgetOther),
  outcome: safeArr<string>(inputs?.outcome),
  outcomeOther: safeStr(inputs?.outcomeOther),
  method: safeArr<string>(inputs?.method),
  methodOther: safeStr(inputs?.methodOther),
  replacement: safeArr<string>(inputs?.replacement),
  replacementOther: safeStr(inputs?.replacementOther),
  inspirationImage: typeof inputs?.inspirationImage === 'string' ? inputs?.inspirationImage : null,
  outreachChannel: (inputs?.outreachChannel as WorkshopState['inputs']['outreachChannel']) || 'Both',
  freeOfferType: (inputs?.freeOfferType as WorkshopState['inputs']['freeOfferType']) || 'Interactive Tool',
  freeOfferTypeOther: safeStr(inputs?.freeOfferTypeOther),
  toolName: safeStr(inputs?.toolName),
  toolDescription: safeStr(inputs?.toolDescription),
  strategicNotes: safeStr(inputs?.strategicNotes),
  narrativeAngles: safeArr<string>(inputs?.narrativeAngles),
  narrativeAnglesOther: safeStr(inputs?.narrativeAnglesOther),
  dmAngle: safeArr<string>(inputs?.dmAngle),
  dmAngleOther: safeStr(inputs?.dmAngleOther),
  dmTone: safeArr<string>(inputs?.dmTone),
  dmToneOther: safeStr(inputs?.dmToneOther),
  campaignType: safeArr<string>(inputs?.campaignType),
  campaignTypeOther: safeStr(inputs?.campaignTypeOther),
  tone: safeArr<string>(inputs?.tone),
  toneOther: safeStr(inputs?.toneOther),
  cta: safeArr<string>(inputs?.cta),
  ctaOther: safeStr(inputs?.ctaOther),
  numFollowUps: safeStr(inputs?.numFollowUps, '3'),
  numFollowUpsOther: safeStr(inputs?.numFollowUpsOther),
  outreachAngle: (inputs?.outreachAngle as WorkshopState['inputs']['outreachAngle']) || 'Authority',
  // Dynamic ICP fields
  icp1_roles: safeArr<string>(inputs?.icp1_roles),
  icp1_rolesOther: safeStr(inputs?.icp1_rolesOther),
  icp1_sizes: safeArr<string>(inputs?.icp1_sizes),
  icp1_sizesOther: safeStr(inputs?.icp1_sizesOther),
  icp1_industries: safeArr<string>(inputs?.icp1_industries),
  icp1_industriesOther: safeStr(inputs?.icp1_industriesOther),
  icp2_roles: safeArr<string>(inputs?.icp2_roles),
  icp2_rolesOther: safeStr(inputs?.icp2_rolesOther),
  icp2_sizes: safeArr<string>(inputs?.icp2_sizes),
  icp2_sizesOther: safeStr(inputs?.icp2_sizesOther),
  icp2_industries: safeArr<string>(inputs?.icp2_industries),
  icp2_industriesOther: safeStr(inputs?.icp2_industriesOther),
  icp3_roles: safeArr<string>(inputs?.icp3_roles),
  icp3_rolesOther: safeStr(inputs?.icp3_rolesOther),
  icp3_sizes: safeArr<string>(inputs?.icp3_sizes),
  icp3_sizesOther: safeStr(inputs?.icp3_sizesOther),
  icp3_industries: safeArr<string>(inputs?.icp3_industries),
  icp3_industriesOther: safeStr(inputs?.icp3_industriesOther),
});

export function buildSafeOutputs(outputs: any): WorkshopState['outputs'] {
  return {
    profileClarityScore: typeof outputs?.profileClarityScore === 'number' ? outputs?.profileClarityScore : 0,
    scoreMeaning: safeStr(outputs?.scoreMeaning),
    scoreExplanation: outputs?.scoreExplanation || '',
    optimizedHeadlines: safeArr<string>(outputs?.optimizedHeadlines),
    optimizedAbout: safeStr(outputs?.optimizedAbout),
    positioningAngles: safeStr(outputs?.positioningAngles),
    keywordScore: typeof outputs?.keywordScore === 'number' ? outputs?.keywordScore : 0,
    icps: safeArr<gemini.DetailedICP>(outputs?.icps),
    icpSummary: safeStr(outputs?.icpSummary),
    valueProp: safeStr(outputs?.valueProp),
    valuePropTables: safeArr<any>(outputs?.valuePropTables),
    websitePrompt: safeStr(outputs?.websitePrompt),
    gtmStrategy: outputs?.gtmStrategy || null,
    outreachEngineOutput: outputs?.outreachEngineOutput || null,
    leadMagnets: safeArr<any>(outputs?.leadMagnets),
    globalSolution: safeStr(outputs?.globalSolution),
    profileImprovements: safeArr<string>(outputs?.profileImprovements),
  };
}

// ─────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────

const MultiSelectDropdown = ({
  label,
  options: initialOptions,
  selected,
  onChange,
  placeholder = 'Select options...',
  isSearchable = true,
  showOther = true,
  otherValue = '',
  onOtherChange = () => { },
  singleSelect = false,
  showErrors = false,
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

  // Guarantee selected is always an array
  const safeSelected = safeArr<string>(selected);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = showOther
    ? [...(initialOptions ?? []).filter((o) => o !== 'Other'), 'Other']
    : (initialOptions ?? []);

  const filteredOptions = options.filter((opt) => {
    if (opt === 'Other') return true;
    return opt.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleOption = (opt: string) => {
    if (singleSelect) {
      onChange(safeSelected.includes(opt) ? [] : [opt]);
      setIsOpen(false);
    } else {
      const next = safeSelected.includes(opt)
        ? safeSelected.filter((v) => v !== opt)
        : [...safeSelected, opt];
      onChange(next);
    }
  };

  const isOtherSelected = safeSelected.includes('Other');

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
          {safeSelected.length === 0 && (
            <span className="text-text-secondary text-sm">{placeholder}</span>
          )}
          {safeSelected.map((val) => (
            <div
              key={val}
              className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-lg border border-primary/20"
            >
              {val === 'Other' && otherValue ? `Other: ${otherValue}` : val}
              <button
                onClick={(e) => { e.stopPropagation(); toggleOption(val); }}
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
                {filteredOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => toggleOption(opt)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${safeSelected.includes(opt) ? 'bg-primary/10 text-primary' : 'hover:bg-bg'}`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${safeSelected.includes(opt) ? 'bg-primary border-primary' : 'border-border'}`}>
                      {safeSelected.includes(opt) && <Check size={14} className="text-black" />}
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

      {showErrors && safeSelected.length === 0 && (
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
            <DebouncedInput
              ref={otherInputRef as any}
              type="text"
              required
              placeholder="Enter values (separate with commas)"
              style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
              className={`w-full px-4 py-3 rounded-xl border ${!otherValue?.trim() ? 'border-red-500/50' : 'border-border'} focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all`}
              value={otherValue ?? ''}
              onDebounce={(val) => onOtherChange(val)}
            />
            {!otherValue?.trim() && (
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
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${active ? 'bg-primary text-black font-bold shadow-sm' : 'hover:bg-section text-text-secondary'
      }`}
  >
    <div className={`flex-shrink-0 ${active ? 'text-black' : 'text-text-secondary'}`}>
      {completed ? <CheckCircle2 size={18} className={active ? 'text-black' : 'text-primary'} /> : <Icon size={18} />}
    </div>
    <span className="text-sm truncate">{label}</span>
    {active && <ChevronRight size={16} className="ml-auto" />}
  </button>
);

const Chip = ({ label, selected, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full border text-sm transition-all duration-200 ${selected ? 'bg-primary border-primary text-black font-medium' : 'bg-section border-border text-text-secondary hover:border-primary'
      }`}
  >
    {label}
  </button>
);

const OutputCard = ({ title, children, highlight = false, copyText, icon: Icon }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`mt-8 p-6 rounded-2xl border-2 ${highlight ? 'border-primary bg-primary/5' : 'border-border bg-section'} shadow-sm`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-primary" />}
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">{title}</h4>
      </div>
      <button
        onClick={() => {
          const text = copyText ?? (typeof children === 'string' ? children : document.getElementById(`output-${title}`)?.innerText);
          navigator.clipboard.writeText(text ?? '');
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

const ScoreTooltip = ({
  title,
  definition,
  bullets,
  goal,
}: {
  title: string;
  definition: string;
  bullets: string[];
  goal: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-block ml-1.5 align-middle">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="opacity-70 hover:opacity-100 transition-opacity p-0.5"
      >
        <Info size={14} className="text-text-secondary group-hover:text-primary" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[280px] p-5 bg-black border border-white/10 rounded-2xl shadow-2xl z-50 pointer-events-none"
          >
            <div className="space-y-3 text-left">
              <h5 className="text-sm font-black uppercase tracking-widest text-primary">{title}</h5>
              <p className="text-[11px] font-medium text-white leading-relaxed">{definition}</p>
              <ul className="space-y-1.5">
                {safeArr<string>(bullets).map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/80">
                  Goal: <span className="text-white">{goal}</span>
                </p>
              </div>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────
// STEP 1 — PROFILE CHECK
// ─────────────────────────────────────────────

const Step1ProfileCheck = () => {
  const [showErrors, setShowErrors] = useState(false);
  const { state, setStep, completeStep, completeAndGoToStep, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── SAFE INPUTS (single source of truth for this component) ──
  const si = buildSafeInputs(state?.inputs);
  const so = buildSafeOutputs(state?.outputs);

  const handleOptimize = async () => {
    setShowErrors(true);
    setTimeout(async () => {
      const firstError = document.querySelector('.border-red-500, .border-red-500\\/50');
      if (firstError) {
        (firstError as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      setLoading(true);
      setError(null);
      try {
        await generateOutput(1);
      } catch (err: any) {
        setError(safeStr(err?.message, 'Something went wrong. Please try again.'));
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
            className={`w-full px-4 py-3 rounded-xl border ${showErrors && !si.linkedinUrl.trim() ? 'border-red-500' : 'border-border'} focus:ring-2 focus:ring-primary/50 outline-none bg-bg`}
            value={si.linkedinUrl}
            onChange={(e) => updateInput('linkedinUrl', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-text-secondary">LinkedIn Headline *</label>
          <DebouncedInput
            type="text"
            placeholder="e.g. Founder @ XYZ | Helping..."
            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg"
            value={si.linkedinHeadline}
            onDebounce={(val) => updateInput('linkedinHeadline', val)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-text-secondary">About Section</label>
          <DebouncedTextarea
            placeholder="Paste your About section here..."
            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg min-h-[120px]"
            value={si.linkedinAbout}
            onDebounce={(val) => updateInput('linkedinAbout', val)}
          />
          {!si.linkedinAbout && (
            <p className="text-[10px] text-primary/80 font-medium italic animate-pulse">
              Tip: For a more accurate score, include your About section.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-text-secondary">Company Name *</label>
            <DebouncedInput
              type="text"
              required
              placeholder="e.g. Myntmore"
              className={`w-full px-4 py-3 rounded-xl border ${showErrors && !si.companyName ? 'border-red-500' : 'border-border'} focus:ring-2 focus:ring-primary/50 outline-none bg-bg`}
              value={si.companyName === 'Your Company' ? '' : si.companyName}
              onDebounce={(val) => updateInput('companyName', val)}
            />
          </div>
          <MultiSelectDropdown
            showErrors={showErrors}
            label="Your Professional Role / Niche"
            options={['Founder', 'Sales Leader', 'Growth Marketer', 'Content Creator', 'Consultant', 'Agency Owner', 'Professional Service']}
            selected={si.yourRole}
            onChange={(val) => updateInput('yourRole', val)}
            otherValue={si.yourRoleOther}
            onOtherChange={(val) => updateInput('yourRoleOther', val)}
            placeholder="Select Role(s)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MultiSelectDropdown
            showErrors={showErrors}
            label="Ideal Customer Designation *"
            options={['Founders/CEOs', 'VPs of Sales/Revenue', 'Marketing Leads', 'Product Manager', 'HR/L&D Leader', 'SMB Business Owners']}
            selected={si.targetIcpDesignation}
            onChange={(val) => updateInput('targetIcpDesignation', val)}
            otherValue={si.targetIcpDesignationOther}
            onOtherChange={(val) => updateInput('targetIcpDesignationOther', val)}
            placeholder="Select Target(s)"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-text-secondary">What do you offer?</label>
          <DebouncedInput
            type="text"
            placeholder="e.g. We help [ICP] achieve [outcome] or X → Y for Z"
            className={`w-full px-4 py-3 rounded-xl border ${showErrors && !si.offer ? 'border-red-500' : 'border-border'} focus:ring-2 focus:ring-primary/50 outline-none bg-bg`}
            value={si.offer === 'Strategic Growth' ? '' : si.offer}
            onDebounce={(val) => updateInput('offer', val)}
          />
          <p className="text-[10px] text-text-secondary">
            Example: "Reduce hiring time → for Talent Leaders → using automation"
          </p>
        </div>

        <MultiSelectDropdown
          showErrors={showErrors}
          label="Tone Preference"
          options={TONES}
          selected={si.tonePreference}
          onChange={(val) => updateInput('tonePreference', val)}
          otherValue={si.tonePreferenceOther}
          onOtherChange={(val) => updateInput('tonePreferenceOther', val)}
          placeholder="Select Tone(s)"
        />

        <div className="mt-8 space-y-6">
          {so.profileClarityScore > 0 && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
              <p className="text-emerald-500 font-bold text-sm">✓ Profile Optimization Complete</p>
              <button
                onClick={handleOptimize}
                className="mt-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-all"
              >
                Regenerate Optimization
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
          {error}
        </div>
      )}

      {so.profileClarityScore > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center p-8 bg-section rounded-2xl border border-border group hover:border-primary transition-colors">
              <div className="text-6xl font-black text-primary mb-2 group-hover:scale-110 transition-transform">
                {so.profileClarityScore}
              </div>
              <div className="flex items-center text-sm font-bold uppercase tracking-widest text-text-secondary">
                Clarity Score
                <ScoreTooltip
                  title="Clarity Score"
                  definition="Measures how clearly your profile communicates who you help, what you do, and what outcome you deliver."
                  bullets={['Positioning sharpness', 'Message simplicity', 'ICP alignment']}
                  goal="Make your profile instantly understandable in <5 seconds"
                />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-section rounded-2xl border border-border group hover:border-primary transition-colors">
              <div className="text-6xl font-black text-primary mb-2 group-hover:scale-110 transition-transform">
                {so.keywordScore}
              </div>
              <div className="flex items-center text-sm font-bold uppercase tracking-widest text-text-secondary">
                Keyword Score
                <ScoreTooltip
                  title="Keyword Score"
                  definition="Measures how well your profile is optimized for discoverability on LinkedIn."
                  bullets={['Presence of relevant keywords', 'Alignment with your target ICP searches', 'Role + industry keyword coverage']}
                  goal="Help your profile appear in more relevant searches"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="p-8 bg-section border border-border rounded-3xl space-y-8">
              <div>
                <h4 className="text-xs font-black uppercase text-primary mb-3 tracking-[0.2em] flex items-center gap-2">
                  <Flame size={14} />
                  Diagnostic Report
                </h4>
                {so.scoreExplanation && typeof so.scoreExplanation !== 'string' ? (
                  <div className="space-y-8">
                    <div className="pb-6 border-b border-border">
                      <h5 className="text-[10px] font-black uppercase text-text-secondary mb-2 tracking-widest">🔹 Overall Summary</h5>
                      <p className="text-lg font-bold italic leading-snug">
                        "{safeStr((so.scoreExplanation as gemini.DiagnosticReport)?.overallSummary)}"
                      </p>
                    </div>

                    <div className="space-y-6">
                      <h5 className="text-[10px] font-black uppercase text-text-secondary mb-2 tracking-widest">🔹 Score Breakdown</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(['clarity', 'specificity', 'differentiation', 'proof', 'execution'] as const).map((dim) => {
                          const breakdown = (so.scoreExplanation as gemini.DiagnosticReport)?.scoreBreakdown;
                          const data = breakdown?.[dim as keyof typeof breakdown] ?? { score: 0, bullets: [] };
                          return (
                            <div key={dim} className="p-4 bg-bg rounded-2xl border border-border/50">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-black uppercase tracking-wider capitalize">{dim}</span>
                                <span className="text-primary font-black">
                                  {(data as any)?.score ?? 0}{' '}
                                  <span className="text-[10px] opacity-40">/ 20</span>
                                </span>
                              </div>
                              <ul className="space-y-1.5">
                                {safeArr<string>((data as any)?.bullets).map((bullet: string, idx: number) => (
                                  <li key={idx} className="text-[10px] font-medium leading-tight text-text-secondary flex items-start gap-1.5 italic">
                                    <div className="w-1 h-1 bg-primary/40 rounded-full mt-1.5 shrink-0" />
                                    {bullet}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border">
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2">
                          <CheckCircle2 size={12} /> 🔹 What's Working
                        </h5>
                        <ul className="space-y-2">
                          {safeArr<string>((so.scoreExplanation as gemini.DiagnosticReport)?.whatsWorking).map((item, i) => (
                            <li key={i} className="text-xs font-bold flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                          <AlertCircle size={12} /> 🔹 What to Improve
                        </h5>
                        <ul className="space-y-2">
                          {safeArr<string>((so.scoreExplanation as gemini.DiagnosticReport)?.toImprove).map((item, i) => (
                            <li key={i} className="text-xs font-bold flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{safeStr(so.scoreExplanation as string)}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              Optimized Headlines
            </h4>
            <div className="space-y-3">
              {so.optimizedHeadlines.map((h: string, i: number) => (
                <div
                  key={i}
                  className="p-5 bg-section border border-border rounded-xl flex items-center justify-between group hover:border-primary/50 transition-all"
                >
                  <span className="text-sm font-medium leading-relaxed">{h}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(h); alert('Headline copied!'); }}
                    className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 rounded-lg text-primary"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <OutputCard title="Optimized About Section" copyText={so.optimizedAbout} icon={User}>
            <div className="text-sm leading-relaxed whitespace-pre-wrap font-normal text-text-secondary">
              {so.optimizedAbout}
            </div>
          </OutputCard>

          <div className="p-8 bg-primary/5 border-2 border-primary/20 rounded-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => { navigator.clipboard.writeText(so.positioningAngles); alert('Positioning copied!'); }}
                className="p-2 hover:bg-primary/10 rounded-lg text-primary"
              >
                <Copy size={16} />
              </button>
            </div>
            <h4 className="text-xs font-bold uppercase text-primary mb-4 tracking-widest flex items-center gap-2">
              <Target size={16} />
              Positioning Angles
            </h4>
            <p className="text-xl font-bold italic leading-relaxed">"{so.positioningAngles}"</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// STEP 2 — ICP BUILDER
// ─────────────────────────────────────────────

const Step2ICPBuilder = () => {
  const [showErrors, setShowErrors] = useState(false);
  const { state, setStep, completeStep, completeAndGoToStep, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIcp, setActiveIcp] = useState<1 | 2 | 3>(1);

  const si = buildSafeInputs(state?.inputs);
  const so = buildSafeOutputs(state?.outputs);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      await generateOutput(2);
    } catch (err: any) {
      console.warn('Generation stopped:', safeStr(err?.message));
    } finally {
      setLoading(false);
    }
  };

  const renderIcpForm = (num: 1 | 2 | 3) => {
    // Safe typed accessors for dynamic ICP keys
    const roles = safeArr<string>((si as any)[`icp${num}_roles`]);
    const rolesOther = safeStr((si as any)[`icp${num}_rolesOther`]);
    const sizes = safeArr<string>((si as any)[`icp${num}_sizes`]);
    const sizesOther = safeStr((si as any)[`icp${num}_sizesOther`]);
    const industries = safeArr<string>((si as any)[`icp${num}_industries`]);
    const indOther = safeStr((si as any)[`icp${num}_industriesOther`]);

    return (
      <div className="space-y-6 bg-section p-8 rounded-3xl border border-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black">
            {num}
          </div>
          <h3 className="text-xl font-bold">Define ICP {num}</h3>
        </div>

        <MultiSelectDropdown
          showErrors={showErrors}
          label="Designation / Role"
          options={ROLES}
          selected={roles}
          onChange={(val) => updateInput(`icp${num}_roles` as any, val)}
          otherValue={rolesOther}
          onOtherChange={(val) => updateInput(`icp${num}_rolesOther` as any, val)}
        />

        <MultiSelectDropdown
          showErrors={showErrors}
          label="Company Size"
          options={SIZES}
          selected={sizes}
          onChange={(val) => updateInput(`icp${num}_sizes` as any, val)}
          otherValue={sizesOther}
          onOtherChange={(val) => updateInput(`icp${num}_sizesOther` as any, val)}
        />

        <MultiSelectDropdown
          showErrors={showErrors}
          label="Industry"
          options={INDUSTRIES}
          selected={industries}
          onChange={(val) => updateInput(`icp${num}_industries` as any, val)}
          otherValue={indOther}
          onOtherChange={(val) => updateInput(`icp${num}_industriesOther` as any, val)}
        />

        <div className="flex items-center gap-4 mt-8">
          <ActionButton onClick={handleGenerate} loading={loading} className="w-full" label="Generate ICP Profile" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Deep ICP Builder</h2>
        <p className="text-text-secondary">Define your Top 3 Ideal Customer Profiles for strategic targeting.</p>
      </div>

      <div className="flex gap-2 p-1 bg-section rounded-2xl border border-border w-fit">
        {([1, 2, 3] as const).map((num) => (
          <button
            key={num}
            onClick={() => setActiveIcp(num)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeIcp === num ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-bg'
              }`}
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
          <button
            onClick={() => setError(null)}
            className="px-3 py-1.5 bg-red-500/20 rounded-lg font-bold hover:bg-red-500/30 transition-colors text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-8 space-y-6">
        {so.icps.length > 0 && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
            <p className="text-emerald-500 font-bold text-sm">✓ {so.icps.length} ICP Profiles Generated</p>
            <button
              onClick={handleGenerate}
              className="mt-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-all"
            >
              Regenerate ICPs
            </button>
          </div>
        )}
      </div>

      {so.icps.length > 0 && (
        <div className="space-y-8">
          {so.icps.map((icp: gemini.DetailedICP, idx: number) => (
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
                <h3 className="text-3xl font-black">{safeStr(icp?.name)}</h3>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <h4 className="text-xs font-bold uppercase text-text-secondary mb-3 tracking-widest">🔹 Who They Are</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">{safeStr(icp?.whoTheyAre)}</p>
                  </section>
                  <section>
                    <h4 className="text-xs font-bold uppercase text-text-secondary mb-3 tracking-widest">🔹 Core Responsibilities</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">{safeStr(icp?.responsibilities)}</p>
                  </section>
                </div>

                <section>
                  <h4 className="text-xs font-bold uppercase text-text-secondary mb-4 tracking-widest">🔹 Pain Points (Detailed)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {safeArr<string>(icp?.painPoints).map((p, i) => (
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
                    <p className="text-sm leading-relaxed text-text-secondary">{safeStr(icp?.goals)}</p>
                  </section>
                  <section>
                    <h4 className="text-xs font-bold uppercase text-text-secondary mb-3 tracking-widest">🔹 Buying Triggers</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">{safeStr(icp?.triggers)}</p>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <h4 className="text-xs font-bold uppercase text-text-secondary mb-3 tracking-widest">🔹 Objections</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">{safeStr(icp?.objections)}</p>
                  </section>
                  <section>
                    <h4 className="text-xs font-bold uppercase text-text-secondary mb-3 tracking-widest">🔹 Psychology</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">{safeStr(icp?.psychology)}</p>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <h4 className="text-xs font-bold uppercase text-text-secondary mb-3 tracking-widest">🔹 Where They Hang Out</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">{safeStr(icp?.hangouts)}</p>
                  </section>
                  <section className="p-6 bg-primary/5 rounded-2xl border border-primary/20">
                    <h4 className="text-xs font-bold uppercase text-primary mb-3 tracking-widest">🔹 How to Position</h4>
                    <p className="text-sm font-medium leading-relaxed">{safeStr(icp?.positioning)}</p>
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

// ─────────────────────────────────────────────
// STEP 3 — VALUE PROPOSITION
// ─────────────────────────────────────────────

const Step3ValueProp = () => {
  const { state, setStep, completeAndGoToStep, updateOutput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const so = buildSafeOutputs(state?.outputs);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      await generateOutput(3);
    } catch (err: any) {
      setError(safeStr(err?.message, 'Failed to generate value prop.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Value Proposition Engine</h2>
        <p className="text-text-secondary">Generate structured, strategic value prop tables for your top 3 ICPs.</p>
      </div>

      {so.valuePropTables.length === 0 ? (
        <div className="space-y-6">
          <p className="text-text-secondary italic">No positioning generated yet. Using fallback data based on your ICPs.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {so.icps.map((icp: gemini.DetailedICP, i: number) => (
              <div key={i} className="p-4 bg-section-alt border border-border rounded-xl">
                <div className="text-xs font-bold text-primary mb-2">{safeStr(icp?.name)}</div>
                <div className="text-xs text-text-secondary leading-relaxed">
                  Focus on solving: {safeArr<string>(icp?.painPoints)[0] ?? 'Target pains'}
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
            <h3 className="text-lg font-bold text-primary">✓ Positioning Strategy Inferred Successfully</h3>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {so.valuePropTables.map((row: any, i: number) => (
              <div
                key={i}
                className="bg-section border border-border rounded-3xl overflow-hidden hover:border-primary transition-all group shadow-2xl relative"
              >
                <div className="p-6 bg-section-alt border-b border-border flex items-center justify-between">
                  <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-black flex items-center justify-center font-black rounded-lg text-sm">
                      {i + 1}
                    </div>
                    {safeStr(row?.icp)}
                  </h3>
                  <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest text-primary italic">
                    {safeStr(row?.coreAngle)} Strategy
                  </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-text-secondary tracking-[0.2em] flex items-center gap-2">
                        <span className="text-lg">🎯</span> Desired Outcome
                      </h4>
                      <p className="text-lg font-bold leading-relaxed pr-4 border-l-2 border-primary/30 pl-4">
                        {safeStr(row?.desiredOutcome)}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-text-secondary tracking-[0.2em] flex items-center gap-2">
                        <span className="text-lg">🔥</span> Current Problem
                      </h4>
                      <p className="text-sm text-text-secondary leading-relaxed pl-4">{safeStr(row?.currentProblem)}</p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-text-secondary tracking-[0.2em] flex items-center gap-2">
                        <span className="text-lg">🔄</span> What They Replace
                      </h4>
                      <p className="text-sm font-medium text-red-400/80 line-through decoration-red-500/50 pl-4">
                        {safeStr(row?.replacement)}
                      </p>
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
                      <p className="text-lg font-black leading-tight italic">"{safeStr(row?.method)}"</p>
                    </div>
                    <div className="space-y-3 relative z-10 pt-4 border-t border-primary/20">
                      <h4 className="text-xs font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                        <span className="text-lg">💡</span> Why This Wins
                      </h4>
                      <p className="text-sm font-medium leading-relaxed italic">
                        {safeStr(row?.whyThisWins, 'This mechanism creates a high-authority bridge between latent pain and your specific solution.')}
                      </p>
                    </div>
                    <div className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                      <Target size={14} /> Core Positioning Angle: {safeStr(row?.coreAngle)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3 mt-12 bg-section p-6 rounded-3xl border border-border">
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

// ─────────────────────────────────────────────
// STEP 4 — WEBSITE BUILDER
// ─────────────────────────────────────────────

const Step4WebsiteBuilder = () => {
  const { state, setStep, completeStep, updateInput, generateOutput } = useWorkshop();
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const si = buildSafeInputs(state?.inputs);
  const so = buildSafeOutputs(state?.outputs);

  const handleGenerate = async () => {
    setShowErrors(true);
    setLoading(true);
    setError(null);
    try {
      await generateOutput(4);
    } catch (err: any) {
      setError(safeStr(err?.message, 'Failed to generate website assets.'));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { updateInput('inspirationImage', reader.result as string); };
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

      {so.websitePrompt ? (
        <div className="space-y-8">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
            <p className="text-emerald-500 font-bold text-sm">✓ Website Prompt Engineered Successfully</p>
          </div>

          <OutputCard title="AI Studio Prompt" copyText={so.websitePrompt}>
            <pre className="whitespace-pre-wrap font-mono text-sm bg-section p-4 rounded-xl border border-border overflow-x-auto text-text-secondary scrollbar-thin scrollbar-thumb-primary/20">
              {so.websitePrompt}
            </pre>
          </OutputCard>

          <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-black font-black text-xl shrink-0">👉</div>
            <div>
              <h3 className="font-bold text-lg">Your prompt is ready! Use Google AI Studio to build your site:</h3>
              <a href="https://aistudio.google.com/apps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium break-all">
                https://aistudio.google.com/apps
              </a>
              <p className="text-xs text-text-secondary mt-1">Copy the prompt above and paste it into AI Studio for instant code generation.</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 mt-12 bg-section p-8 rounded-3xl border border-border">
            <ActionButton
              onClick={() => { completeStep(4); setStep(5); }}
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
              <DebouncedInput
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg focus:border-primary/50 outline-none transition-all"
                placeholder="e.g. Myntmore"
                value={si.brandName}
                onDebounce={(val) => updateInput('brandName', val)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-secondary">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-12 w-12 rounded-lg border border-border p-1 cursor-pointer shrink-0 bg-transparent"
                    value={si.primaryColor}
                    onChange={(e) => updateInput('primaryColor', e.target.value)}
                  />
                  <DebouncedInput
                    type="text"
                    className="w-full px-3 py-3 rounded-xl border border-border bg-bg focus:border-primary/50 outline-none font-mono text-xs transition-all"
                    value={si.primaryColor}
                    onDebounce={(val) => updateInput('primaryColor', val)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-secondary">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-12 w-12 rounded-lg border border-border p-1 cursor-pointer shrink-0 bg-transparent"
                    value={si.secondaryColor}
                    onChange={(e) => updateInput('secondaryColor', e.target.value)}
                  />
                  <DebouncedInput
                    type="text"
                    className="w-full px-3 py-3 rounded-xl border border-border bg-bg focus:border-primary/50 outline-none font-mono text-xs transition-all"
                    value={si.secondaryColor}
                    onDebounce={(val) => updateInput('secondaryColor', val)}
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold uppercase text-text-secondary">Design Inspiration (Screenshot)</label>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1">
                  Find UI Ideas on Pinterest ↗
                </a>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  <div className="flex flex-col items-center text-text-secondary group-hover:text-primary">
                    <Upload size={24} className="mb-2" />
                    <span className="text-sm font-bold">{si.inspirationImage ? 'Change Screenshot' : 'Upload UI Inspiration'}</span>
                  </div>
                </label>
                {si.inspirationImage && (
                  <div className="w-32 h-32 rounded-2xl border border-border overflow-hidden relative group shadow-lg">
                    <img src={si.inspirationImage} alt="Inspiration" className="w-full h-full object-cover" />
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
              <button onClick={() => setError(null)} className="px-3 py-1.5 bg-red-500/20 rounded-lg font-bold hover:bg-red-500/30 transition-colors text-xs shrink-0">
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {so.websitePrompt && (
        <>
          <div className="mt-12 space-y-6 pt-12 border-t border-border/50">
            <div>
              <h3 className="text-xl font-black flex items-center gap-2">
                <Zap size={22} className="text-primary" /> Refine Your Output
              </h3>
              <p className="text-sm text-text-secondary mt-1">Found a gap? Use these targeted prompts inside AI Studio to polish your site.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Conversion Optimization', desc: 'Sharpen CTAs and hooks.', prompt: 'Optimize this website for maximum conversion. Make the hero section more compelling and ensure CTAs are clear, aggressive, and strategically placed.' },
                { title: 'Visual Hierarchy', desc: 'Improve section flow.', prompt: 'Improve the visual hierarchy of this page. Structure the sections so the user\'s eye naturally flows from the problem to the solution, using clear typography differences.' },
                { title: 'Modern UI Upgrade', desc: 'Apply 2024 tech aesthetic.', prompt: 'Upgrade the UI aesthetic to feel like a premium, modern tech startup from 2024. Use subtle gradients, bento-box layouts, and glassmorphism where appropriate.' },
                { title: 'Mobile Layout', desc: 'Force responsive stack orders.', prompt: 'Optimize this entire prompt for a mobile-first layout. Ensure font sizes, spacing, and stack orders are explicitly defined for mobile viewports.' },
                { title: 'Consistency Check', desc: 'Align tone across sections.', prompt: 'Review and rewrite the copy to perfectly match a bold, authoritative, yet approachable B2B tone. Ensure colors and CSS match the brand identity.' },
                { title: 'Trust Markers', desc: 'Add social proof hooks.', prompt: 'Enhance the trust-building elements of this site. Integrate realistic placeholders for social proof, logos, testimonials, and data-backed claims.' },
              ].map((p, i) => (
                <div key={i} className="p-5 bg-section-alt border border-border rounded-2xl flex flex-col gap-3 group hover:border-primary/50 transition-all">
                  <h4 className="font-bold text-sm">{p.title}</h4>
                  <p className="text-[11px] text-text-secondary leading-tight">{p.desc}</p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(p.prompt); alert('Prompt copied!'); }}
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
              <MessageSquare size={20} className="text-primary" /> Common Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { q: 'How do I deploy?', a: 'Copy HTML/CSS to a file, push to GitHub, and link to Vercel.' },
                { q: 'AI cut off mid-code?', a: "Type 'continue code' in AI Studio." },
                { q: 'Broken design?', a: "Run the 'Modern UI Upgrade' prompt above." },
                { q: 'Generic copy?', a: 'Supply your specific ROI metrics as reference.' },
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

// ─────────────────────────────────────────────
// STEP 5 — GTM STRATEGY
// ─────────────────────────────────────────────

const Step5GTMStrategy = () => {
  const { state, setStep, completeStep, completeAndGoToStep, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'leadGen' | 'partner' | 'event' | 'magnets'>('leadGen');

  const so = buildSafeOutputs(state?.outputs);
  const strategy = so.gtmStrategy;
  const magnets = safeArr(so.leadMagnets);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      await generateOutput(5);
    } catch (err: any) {
      setError(safeStr(err?.message, 'Something went wrong. Please try again.'));
    }
    setLoading(false);
  };

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

      <div className="mt-8 space-y-6">
        {strategy && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
            <p className="text-emerald-500 font-bold text-sm">✓ GTM Roadmap Synchronized</p>
            <button onClick={handleGenerate} className="mt-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-all">
              Regenerate GTM Strategy
            </button>
          </div>
        )}
      </div>

      {strategy && (
        <div className="space-y-8">
          <div className="flex flex-wrap gap-2 p-1 bg-section border border-border rounded-xl w-fit">
            {(['leadGen', 'partner', 'event', 'magnets'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-section-alt'}`}
              >
                {tab === 'leadGen' ? 'Outreach Strategy' : tab === 'partner' ? 'Partner Led Growth' : tab === 'event' ? 'Event Led Growth' : 'Lead Magnets'}
              </button>
            ))}
          </div>

          <div className="space-y-8">
            {activeTab === 'leadGen' && (
              <div className="space-y-8">
                <section className="space-y-4">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <Target size={24} className="text-primary" /> Outreach Strategy
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {safeArr(strategy?.leadGen?.targeting).map((t: any, i: number) => (
                      <div key={i} className="p-6 bg-section border border-border rounded-2xl space-y-3">
                        <div className="text-xs font-black uppercase text-primary tracking-widest">{safeStr(t?.icp)}</div>
                        <div className="space-y-2">
                          <div className="text-sm font-bold">Roles: <span className="text-text-secondary font-normal">{safeStr(t?.roles)}</span></div>
                          <div className="text-sm font-bold">Size: <span className="text-text-secondary font-normal">{safeStr(t?.size)}</span></div>
                          <div className="text-sm font-bold">Industry: <span className="text-text-secondary font-normal">{safeStr(t?.industries)}</span></div>
                          <div className="text-sm font-bold">Geo: <span className="text-text-secondary font-normal">{safeStr(t?.geo)}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <Globe size={24} className="text-primary" /> Channel Strategy
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {safeArr(strategy?.leadGen?.channels).map((c: any, i: number) => (
                      <div key={i} className="p-6 bg-section border border-border rounded-2xl space-y-2">
                        <div className="text-lg font-black">{safeStr(c?.channel)}</div>
                        <div className="text-sm text-text-secondary leading-relaxed"><span className="font-bold text-text">Why:</span> {safeStr(c?.why)}</div>
                        <div className="text-sm text-text-secondary leading-relaxed"><span className="font-bold text-text">Approach:</span> {safeStr(c?.approach)}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <Send size={24} className="text-primary" /> Outreach Strategy
                  </h3>
                  <div className="space-y-6">
                    {safeArr(strategy?.leadGen?.outreach).map((o: any, i: number) => (
                      <div key={i} className="p-8 bg-section border border-border rounded-2xl space-y-6">
                        <div className="text-lg font-black text-primary uppercase tracking-widest">{safeStr(o?.icp)}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary">Angles & Hooks</h4>
                            <div className="space-y-2">
                              {safeArr<string>(o?.angles).map((a: string, j: number) => (
                                <div key={j} className="text-sm p-3 bg-section-alt rounded-lg border border-border">{a}</div>
                              ))}
                            </div>
                            <div className="space-y-2">
                              {safeArr<string>(o?.hooks).map((h: string, j: number) => (
                                <div key={j} className="text-sm p-3 bg-primary/5 rounded-lg border border-primary/20 italic">"{h}"</div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary">Distribution Tips</h4>
                            <div className="space-y-4">
                              {safeArr(o?.channelTips).map((ct: any, j: number) => (
                                <div key={j} className="space-y-2">
                                  <div className="text-[10px] font-bold uppercase text-primary/70">{safeStr(ct?.channel)} Best Practices</div>
                                  <div className="p-4 bg-section-alt rounded-xl border border-border space-y-2">
                                    {safeArr<string>(ct?.tips).map((tip: string, k: number) => (
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
                    <TrendingUp size={24} className="text-primary" /> Funnel Design
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {safeArr(strategy?.leadGen?.funnel).map((f: any, i: number) => (
                      <div key={i} className="p-6 bg-section border border-border rounded-2xl relative">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-black rounded-full flex items-center justify-center font-black text-xs shadow-lg">{i + 1}</div>
                        <div className="text-xs font-black uppercase tracking-widest text-primary mb-2">{safeStr(f?.step)}</div>
                        <div className="text-xs text-text-secondary leading-relaxed">{safeStr(f?.description)}</div>
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
                      <User size={24} className="text-primary" /> Ideal Partners
                    </h3>
                    <div className="space-y-4">
                      {safeArr(strategy?.partnerGrowth?.idealPartners).map((ip: any, i: number) => (
                        <div key={i} className="p-6 bg-section border border-border rounded-2xl space-y-2">
                          <div className="text-xs font-black uppercase text-primary tracking-widest">{safeStr(ip?.icp)}</div>
                          <div className="flex flex-wrap gap-2">
                            {safeArr<string>(ip?.partners).map((p: string, j: number) => (
                              <span key={j} className="px-3 py-1 bg-section-alt rounded-full text-xs font-bold border border-border">{p}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xl font-black flex items-center gap-2">
                      <Layers size={24} className="text-primary" /> Partnership Models
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {safeArr<string>(strategy?.partnerGrowth?.models).map((m: string, i: number) => (
                        <div key={i} className="p-4 bg-section border border-border rounded-xl text-sm font-bold flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-primary" /> {m}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <section className="space-y-4">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <MessageSquare size={24} className="text-primary" /> Partner Outreach
                  </h3>
                  <div className="p-8 bg-section border border-border rounded-2xl space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary">Pitch Message</h4>
                      <div className="p-6 bg-section-alt rounded-2xl border border-border text-sm leading-relaxed italic relative group">
                        {safeStr(strategy?.partnerGrowth?.outreach?.pitch)}
                        <button
                          onClick={() => navigator.clipboard.writeText(safeStr(strategy?.partnerGrowth?.outreach?.pitch))}
                          className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary">Value Exchange Logic</h4>
                      <div className="text-sm text-text-secondary leading-relaxed">{safeStr(strategy?.partnerGrowth?.outreach?.logic)}</div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <TrendingUp size={24} className="text-primary" /> Scale Strategy
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {safeArr<string>(strategy?.partnerGrowth?.scale).map((s: string, i: number) => (
                      <div key={i} className="p-6 bg-section border border-border rounded-2xl text-sm leading-relaxed">
                        <span className="text-primary font-black mr-2">0{i + 1}.</span>
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
                      <Calendar size={24} className="text-primary" /> Event Types
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {safeArr<string>(strategy?.eventGrowth?.types).map((t: string, i: number) => (
                        <div key={i} className="px-6 py-3 bg-section border border-border rounded-xl font-bold text-sm shadow-sm">{t}</div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xl font-black flex items-center gap-2">
                      <Sparkles size={24} className="text-primary" /> Event Ideas
                    </h3>
                    <div className="space-y-4">
                      {safeArr(strategy?.eventGrowth?.ideas).map((id: any, i: number) => (
                        <div key={i} className="p-6 bg-section border border-border rounded-2xl space-y-3">
                          <div className="text-xs font-black uppercase text-primary tracking-widest">{safeStr(id?.icp)}</div>
                          <ul className="space-y-2">
                            {safeArr<string>(id?.topics).map((topic: string, j: number) => (
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
                      <TrendingUp size={24} className="text-primary" /> Event Funnel
                    </h3>
                    <div className="p-6 bg-section border border-border rounded-2xl text-sm leading-relaxed text-text-secondary">
                      {safeStr(strategy?.eventGrowth?.funnel)}
                    </div>
                  </section>
                  <section className="space-y-4">
                    <h3 className="text-xl font-black flex items-center gap-2">
                      <Zap size={24} className="text-primary" /> Conversion Strategy
                    </h3>
                    <div className="p-6 bg-section border border-border rounded-2xl text-sm leading-relaxed text-text-secondary">
                      {safeStr(strategy?.eventGrowth?.conversion)}
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
                  {magnets.map((lm: any, i: number) => (
                    <div key={i} className="p-8 bg-section border border-border rounded-3xl space-y-6 relative overflow-hidden group hover:border-primary transition-all hover:shadow-xl hover:-translate-y-1">
                      <div className="absolute top-0 right-0 p-4 bg-primary/10 rounded-bl-3xl">
                        <Zap size={24} className="text-primary" />
                      </div>
                      <div className="space-y-2">
                        <div className="inline-block px-3 py-1 bg-section-alt border border-border rounded-lg text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2">{safeStr(lm?.format)}</div>
                        <h3 className="text-2xl font-black pr-8 leading-tight">{safeStr(lm?.name)}</h3>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest italic">Segment: {safeStr(lm?.targetICP)}</p>
                      </div>
                      <div className="space-y-5">
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase text-text-secondary flex items-center gap-1">The Tool Outcome:</div>
                          <div className="text-sm font-bold leading-relaxed italic">"{safeStr(lm?.whatItDoes)}"</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-section-alt border border-border rounded-2xl space-y-2">
                            <div className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-1"><ArrowRight size={10} /> User Input</div>
                            <div className="text-[11px] font-bold leading-tight">{safeStr(lm?.userInput)}</div>
                          </div>
                          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-2">
                            <div className="text-[9px] font-black uppercase text-primary/70 flex items-center gap-1"><Zap size={10} /> Tool Output</div>
                            <div className="text-[11px] font-bold leading-tight">{safeStr(lm?.output)}</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-[10px] font-black uppercase text-text-secondary">Strategic Business Value:</div>
                          <p className="text-xs font-medium text-text-secondary leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">{safeStr(lm?.whyValuable)}</p>
                        </div>
                        <div className="pt-4 border-t border-border flex flex-col gap-3">
                          <div className="inline-block w-fit px-4 py-2 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                            {safeStr(lm?.cta)}
                          </div>
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

// ─────────────────────────────────────────────
// STEP 6 — OUTREACH ENGINE
// ─────────────────────────────────────────────

const Step6OutreachEngine = () => {
  const { state, setStep, completeStep, completeAndGoToStep, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const si = buildSafeInputs(state?.inputs);
  const so = buildSafeOutputs(state?.outputs);
  const out = so.outreachEngineOutput;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      await generateOutput(6);
    } catch (err: any) {
      setError(safeStr(err?.message, 'Something went wrong. Please try again.'));
    }
    setLoading(false);
  };

  const angles = ['Authority', 'ROI', 'Pain-led', 'Contrarian', 'Curiosity', 'Offer-led'] as const;
  const channels = ['LinkedIn', 'Email', 'Both'] as const;

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
              {channels.map((c) => (
                <button
                  key={c}
                  onClick={() => updateInput('outreachChannel', c)}
                  className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${si.outreachChannel === c ? 'bg-primary border-primary text-black' : 'border-border text-text-secondary hover:border-primary/50'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-text-secondary tracking-wider">Strategic Angle</label>
            <div className="grid grid-cols-2 gap-2">
              {angles.map((a) => (
                <button
                  key={a}
                  onClick={() => updateInput('outreachAngle', a)}
                  className={`py-2 rounded-xl border font-bold text-[10px] uppercase tracking-wider transition-all ${si.outreachAngle === a ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20' : 'border-border text-text-secondary hover:border-primary/50'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {out && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
              <p className="text-emerald-500 font-bold text-sm">✓ {si.outreachAngle} Campaign Generated</p>
              <button onClick={handleGenerate} className="mt-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-all">
                Regenerate Outreach
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">{error}</div>
      )}

      {out && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          <div className="p-8 bg-primary/5 border-2 border-primary/20 rounded-3xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap size={64} className="text-primary" />
            </div>
            <h4 className="text-xs font-black uppercase text-primary mb-4 tracking-[0.2em] flex items-center gap-2">
              <Sparkles size={16} /> Strategy Hook: {si.outreachAngle}
            </h4>
            <p className="text-xl font-black leading-tight italic">
              "{safeStr(out?.strategySummary)}"
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
              <Linkedin size={20} className="text-primary" /> LinkedIn Sequence
            </h3>
            <div className="space-y-4">
              <div className="p-6 bg-section border border-border rounded-xl group hover:border-primary/30 transition-all">
                <span className="block text-[10px] uppercase font-bold text-primary mb-2 tracking-widest">Connection Request</span>
                <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap">
                  {safeStr(out?.linkedIn?.connectionRequest)}
                </p>
                <button
                  onClick={() => { navigator.clipboard.writeText(safeStr(out?.linkedIn?.connectionRequest)); alert('Copied!'); }}
                  className="mt-4 text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1 hover:underline"
                >
                  <Copy size={12} /> Copy Request
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {safeArr<string>(out?.linkedIn?.followUps).map((f: string, i: number) => (
                  <div key={i} className="p-4 bg-section/50 border border-border rounded-xl">
                    <span className="block text-[8px] uppercase font-bold text-text-secondary mb-2 text-right">Follow-up {i + 1}</span>
                    <p className="text-[11px] leading-relaxed italic text-text-secondary">"{f}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
              <Mail size={20} className="text-primary" /> Cold Email Campaign
            </h3>
            <div className="space-y-4">
              <div className="p-6 bg-section border-2 border-primary/10 rounded-xl relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="absolute top-0 right-0 bg-primary/10 px-3 py-1 text-[8px] font-black uppercase tracking-tighter">Primary Asset</div>
                <div className="inline-block px-3 py-1 bg-bg rounded-lg border border-border text-[10px] font-bold uppercase tracking-widest text-primary mb-4">
                  Subject: {safeStr(out?.email?.subjectLine)}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-text-primary">
                  {safeStr(out?.email?.body)}
                </p>
                <div className="flex gap-4 mt-6 pt-4 border-t border-border">
                  <button
                    onClick={() => { navigator.clipboard.writeText(safeStr(out?.email?.body)); alert('Email body copied!'); }}
                    className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1 hover:underline"
                  >
                    <Copy size={12} /> Copy Body
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(safeStr(out?.email?.subjectLine)); alert('Subject line copied!'); }}
                    className="text-[10px] font-bold uppercase tracking-widest text-text-secondary flex items-center gap-1 hover:underline"
                  >
                    <Copy size={12} /> Copy Subject
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safeArr<string>(out?.email?.followUps).map((f: string, i: number) => (
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

// ─────────────────────────────────────────────
// STEP 7 — SUMMARY
// ─────────────────────────────────────────────

const Step7Summary = () => {
  const { state } = useWorkshop();
  const [error, setError] = useState<string | null>(null);

  const si = buildSafeInputs(state?.inputs);
  const so = buildSafeOutputs(state?.outputs);

  const handleDownload = () => {
    const missing: string[] = [];
    if (!so.profileClarityScore) missing.push('Profile Optimization');
    if (!so.icps.length) missing.push('ICP Breakdown');
    if (!so.valuePropTables.length) missing.push('Value Proposition');
    if (!so.gtmStrategy) missing.push('GTM Strategy');
    if (!so.outreachEngineOutput) missing.push('Outreach Strategy');

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
        <div className="p-8 border-2 border-border rounded-3xl bg-section shadow-sm group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-primary group-hover:scale-110 transition-transform" size={20} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Target Market</h4>
          </div>
          <p className="text-sm leading-relaxed">
            {so.icps.length > 0
              ? `${so.icps.length} ICPs identified, led by ${safeStr(so.icps[0]?.name, 'Primary ICP')}.`
              : 'Market segments defined based on your offering.'}
          </p>
        </div>

        <div className="p-8 border-2 border-primary/30 rounded-3xl bg-primary/5 shadow-sm group">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-primary group-hover:scale-110 transition-transform" size={20} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Core Positioning</h4>
          </div>
          <div className="space-y-2">
            {so.valuePropTables.length > 0 ? (
              <>
                <div className="text-lg font-black text-primary leading-tight">
                  {safeStr(so.valuePropTables[0]?.desiredOutcome, 'Scale your operations')}
                </div>
                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                  Method: {safeStr(so.valuePropTables[0]?.method, 'Strategic Implementation')}
                </p>
              </>
            ) : (
              <p className="text-sm text-text-secondary italic">Positioning inferred from client metrics and pain points.</p>
            )}
          </div>
        </div>

        <div className="p-8 border-2 border-border rounded-3xl bg-section shadow-sm group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <Send className="text-primary group-hover:scale-110 transition-transform" size={20} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Outreach Strategy</h4>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-bold">{si.outreachChannel} | {si.outreachAngle}</div>
            {so.outreachEngineOutput && (
              <p className="text-[11px] text-text-secondary italic line-clamp-3">"{safeStr(so.outreachEngineOutput?.strategySummary)}"</p>
            )}
          </div>
        </div>

        <div className="p-8 border-2 border-border rounded-3xl bg-section shadow-sm group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <Download className="text-primary group-hover:scale-110 transition-transform" size={20} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Strategy Assets</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['ICP Playbook', 'Landing Page Prompt', 'Sequence Assets', 'Full GTM Plan'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-[10px] font-bold text-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 mt-12 bg-section p-8 rounded-3xl border border-border">
        <ActionButton onClick={handleDownload} label="Generate Strategy PDF" microtext="Your complete business playbook" />
        <button
          onClick={() => { navigator.clipboard.writeText(JSON.stringify(so, null, 2)); alert('Full strategy data copied!'); }}
          className="text-text-secondary hover:text-primary transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
        >
          <Copy size={14} /> Copy Full Strategy Data
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MODALS
// ─────────────────────────────────────────────

const ResetModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="max-w-md w-full bg-section border-2 border-red-500/20 rounded-3xl p-8 shadow-2xl text-center"
    >
      <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
        <RotateCcw className="text-red-500" size={40} />
      </div>
      <h2 className="text-3xl font-black mb-4">Are you sure you want to restart?</h2>
      <p className="text-text-secondary mb-8 leading-relaxed">This will erase all your progress.</p>
      <div className="space-y-3">
        <button onClick={onConfirm} className="w-full py-4 bg-red-500 text-white rounded-xl font-black text-lg hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-2">
          Reset
        </button>
        <button onClick={onCancel} className="w-full py-4 bg-bg text-text-secondary border border-border rounded-xl font-bold text-lg hover:bg-section transition-all">
          Cancel
        </button>
      </div>
    </motion.div>
  </div>
);

const ResumeModal = ({ onResume, onStartOver }: { onResume: () => void; onStartOver: () => void }) => (
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
      <p className="text-text-secondary mb-8">We found your saved progress. Would you like to continue from your last step or start a new workshop?</p>
      <div className="space-y-3">
        <button onClick={onResume} className="w-full py-4 bg-primary text-black rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
          Resume Workshop <ArrowRight size={20} />
        </button>
        <button onClick={onStartOver} className="w-full py-4 bg-bg text-text-secondary border border-border rounded-xl font-bold text-lg hover:bg-section transition-all flex items-center justify-center gap-2">
          <RotateCcw size={18} /> Start Over
        </button>
      </div>
    </motion.div>
  </div>
);

// ─────────────────────────────────────────────
// STEP 0 — LEAD CAPTURE
// ─────────────────────────────────────────────

const Step0LeadCapture = React.memo(({
  user,
  loading,
  error,
  initialInputs,
  onGoogleLogin,
  onLogout,
  onSubmit,
}: {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  initialInputs: any;
  onGoogleLogin: () => void;
  onLogout: () => void;
  onSubmit: (data: any) => void;
}) => {
  const safe = buildSafeInputs(initialInputs);
  const [localInputs, setLocalInputs] = useState({
    fullName: safe.fullName,
    workEmail: safe.workEmail,
    phone: safe.phone,
    companyName: safe.companyName === 'Your Company' ? '' : safe.companyName,
  });

  useEffect(() => {
    if (user) {
      setLocalInputs((prev) => ({
        ...prev,
        fullName: prev.fullName || safeStr(user.displayName),
        workEmail: prev.workEmail || safeStr(user.email),
      }));
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setLocalInputs((prev) => ({ ...prev, [field]: value }));
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
          <img src="/logo.png" alt="Logo" className="h-16 w-auto mx-auto mb-6 object-contain" />
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-primary mb-4">
            {user ? 'Complete Your Profile' : 'Start Your Growth Workshop'}
          </h1>
          <p className="text-text-secondary text-lg">
            {user ? 'Just a few more details to personalize your experience.' : 'Login with Google to begin your personalized growth system.'}
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
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                  Continue with Google
                </>
              )}
            </button>
            <p className="text-center text-xs text-text-secondary font-medium">Secure, 1-click entry. No password required.</p>
          </div>
        ) : (
          <form onSubmit={handleLocalSubmit} className="space-y-6">
            <div className="space-y-4">
              {[
                { field: 'fullName', label: 'Full Name *', type: 'text', required: true, placeholder: 'e.g. John Doe', readOnly: false },
                { field: 'workEmail', label: 'Work Email *', type: 'email', required: true, placeholder: 'john@company.com', readOnly: !!user?.email },
                { field: 'phone', label: 'Phone Number', type: 'tel', required: false, placeholder: '+1 (555) 000-0000', readOnly: false },
                { field: 'companyName', label: 'Company Name', type: 'text', required: false, placeholder: 'Your Company Inc.', readOnly: false },
              ].map(({ field, label, type, required, placeholder, readOnly }) => (
                <div key={field} className="space-y-2">
                  <label className="text-xs font-bold uppercase text-text-secondary tracking-widest">{label}</label>
                  <input
                    type={type}
                    required={required}
                    readOnly={readOnly}
                    className={`w-full px-4 py-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg text-lg transition-all ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                    value={(localInputs as any)[field] ?? ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>

            {error && <p className="text-red-500 text-sm font-bold text-center bg-red-500/10 py-3 rounded-xl">{error}</p>}

            <button type="submit" className="w-full py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3">
              Enter Workshop <ArrowRight size={24} />
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

// ─────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────

const INITIAL_WORKSHOP_INPUTS: WorkshopState['inputs'] = {
  fullName: '', workEmail: '', phone: '', companyName: '',
  yourRole: [], yourRoleOther: '',
  linkedinUrl: '', linkedinHeadline: '', linkedinAbout: '',
  offer: '',
  targetIcpDesignation: [], targetIcpDesignationOther: '',
  tonePreference: [], tonePreferenceOther: '',
  icp1_roles: [], icp1_rolesOther: '', icp1_sizes: [], icp1_sizesOther: '', icp1_industries: [], icp1_industriesOther: '',
  icp2_roles: [], icp2_rolesOther: '', icp2_sizes: [], icp2_sizesOther: '', icp2_industries: [], icp2_industriesOther: '',
  icp3_roles: [], icp3_rolesOther: '', icp3_sizes: [], icp3_sizesOther: '', icp3_industries: [], icp3_industriesOther: '',
  industry: [], industryOther: '', companySize: [], companySizeOther: '',
  geography: [], geographyOther: '', decisionMaker: [], decisionMakerOther: '',
  painPoints: [], painPointsOther: '', budget: [], budgetOther: '',
  outcome: [], outcomeOther: '', method: [], methodOther: '',
  replacement: [], replacementOther: '',
  brandName: '', primaryColor: '#FFE600', secondaryColor: '#000000',
  inspirationImage: null,
  outreachChannel: 'Both', freeOfferType: 'Interactive Tool', freeOfferTypeOther: '',
  toolName: '', toolDescription: '', strategicNotes: '',
  narrativeAngles: [], narrativeAnglesOther: '',
  dmAngle: [], dmAngleOther: '', dmTone: [], dmToneOther: '',
  campaignType: [], campaignTypeOther: '', tone: [], toneOther: '',
  cta: [], ctaOther: '', numFollowUps: '3', numFollowUpsOther: '',
  outreachAngle: 'Authority',
};

const INITIAL_WORKSHOP_STATE: Omit<WorkshopState, 'isCheckingStatus'> = {
  currentStep: 0,
  completedSteps: [],
  submissionId: null,
  leadFormFilled: false,
  inputs: INITIAL_WORKSHOP_INPUTS,
  outputs: {
    profileClarityScore: 0, scoreMeaning: '', scoreExplanation: '',
    optimizedHeadlines: [], optimizedAbout: '', positioningAngles: '',
    keywordScore: 0, icps: [], icpSummary: '', valueProp: '',
    valuePropTables: [], websitePrompt: '', gtmStrategy: null,
    outreachEngineOutput: null, leadMagnets: [],
    globalSolution: '', profileImprovements: [],
  },
  isGenerating: false,
  generationError: null,
};

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState<WorkshopState>(() => {
    const fullStateSaved = localStorage.getItem('workshop_v2_full_state');
    if (fullStateSaved) {
      try {
        const parsed = JSON.parse(fullStateSaved);
        return {
          ...INITIAL_WORKSHOP_STATE,
          ...parsed,
          inputs: buildSafeInputs({ ...INITIAL_WORKSHOP_INPUTS, ...(parsed?.inputs ?? {}) }),
          outputs: buildSafeOutputs({ ...INITIAL_WORKSHOP_STATE.outputs, ...(parsed?.outputs ?? {}) }),
          isCheckingStatus: false,
        } as WorkshopState;
      } catch (e) {
        console.error('[Persistence] Error parsing fullStateSaved', e);
      }
    }

    const savedLeadData = localStorage.getItem('userLeadData');
    if (savedLeadData) {
      try {
        const parsed = JSON.parse(savedLeadData);
        return {
          ...INITIAL_WORKSHOP_STATE,
          currentStep: 1,
          completedSteps: [0],
          submissionId: safeStr(parsed?.submissionId) || null,
          leadFormFilled: !!parsed?.submissionId,
          isCheckingStatus: false,
          inputs: buildSafeInputs({ ...INITIAL_WORKSHOP_INPUTS, ...parsed }),
        } as WorkshopState;
      } catch (e) {
        console.error('Error parsing lead data', e);
      }
    }

    return { ...INITIAL_WORKSHOP_STATE, isCheckingStatus: false } as WorkshopState;
  });

  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [sessionToResume, setSessionToResume] = useState<WorkshopState | null>(null);
  const { saveInBackground, isSaving: isSbSaving } = useNonBlockingSave();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'syncing'>('idle');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setState((prev) => ({ ...prev, isCheckingStatus: true }));
        try {
          const docRef = doc(db, 'users', firebaseUser.uid, 'workshop', 'active');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const savedState = docSnap.data() as WorkshopState;
            setSessionToResume({
              ...savedState,
              inputs: buildSafeInputs(savedState?.inputs),
              outputs: buildSafeOutputs(savedState?.outputs),
            });
            setShowResumeModal(true);
          } else {
            const { data } = await supabase
              .from('workshop_submissions')
              .select('id, workshop_inputs')
              .eq('user_uid', firebaseUser.uid)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            if (data) {
              setState((prev) => ({
                ...prev,
                leadFormFilled: true,
                submissionId: safeStr(data?.id) || null,
                inputs: buildSafeInputs({ ...prev.inputs, ...(data?.workshop_inputs ?? {}) }),
              }));
            }
          }
        } catch (err) {
          console.warn('Error checking for existing session', err);
        } finally {
          setState((prev) => ({ ...prev, isCheckingStatus: false }));
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try { await signOut(auth); } catch (err) { console.error('Logout Error:', err); }
  };

  // Fault-tolerant hybrid persistence
  useEffect(() => {
    if (state.leadFormFilled && state.currentStep > 0) {
      try {
        localStorage.setItem('workshop_v2_full_state', JSON.stringify(state));
        if (saveStatus === 'idle' || saveStatus === 'saved') setSaveStatus('saving');
      } catch (e) {
        console.error('[Persistence] LocalStorage Sync Failed', e);
      }

      if (user) {
        const syncToCloud = async () => {
          setSaveStatus('syncing');
          try {
            const docRef = doc(db, 'users', user.uid, 'workshop', 'active');
            await updateDoc(docRef, { ...state });
            saveInBackground('workshop_submissions', {
              user_uid: user.uid,
              user_email: safeStr(user.email),
              full_name: state.inputs?.fullName ?? '',
              work_email: state.inputs?.workEmail ?? '',
              phone: state.inputs?.phone ?? '',
              company_name: state.inputs?.companyName ?? '',
              your_role: safeArr<string>(state.inputs?.yourRole),
              current_step: state.currentStep,
              workshop_inputs: state.inputs,
              workshop_outputs: state.outputs,
            });
            setSaveStatus('saved');
          } catch (err) {
            console.warn('[Persistence] Cloud Sync Warning:', err);
            try {
              const docRef = doc(db, 'users', user.uid, 'workshop', 'active');
              await setDoc(docRef, state);
              setSaveStatus('saved');
            } catch (innerErr) {
              setSaveStatus('idle');
            }
          }
        };
        const timer = setTimeout(syncToCloud, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, state, saveInBackground]);

  const handleResume = () => {
    if (sessionToResume) setState(sessionToResume);
    setShowResumeModal(false);
  };

  const handleStartOver = () => {
    localStorage.removeItem('workshop_progress_step');
    localStorage.removeItem('userLeadData');
    window.location.reload();
  };

  const handleResetWorkshop = () => {
    ['workshop_v2_full_state', 'userLeadData', 'workshop_progress_step'].forEach((k) =>
      localStorage.removeItem(k)
    );
    setState({
      ...INITIAL_WORKSHOP_STATE,
      leadFormFilled: true,
      currentStep: 1,
      completedSteps: [0],
      isCheckingStatus: false,
    });
    setShowResetModal(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (err: any) {
      console.error('Google Login Error:', err);
      setError('Google Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (formData: any) => {
    const fullName = safeStr(formData?.fullName);
    const workEmail = safeStr(formData?.workEmail);
    const phone = safeStr(formData?.phone);
    const companyName = safeStr(formData?.companyName);

    setState((prev) => ({
      ...prev,
      leadFormFilled: true,
      currentStep: 1,
      completedSteps: [...prev.completedSteps.filter((s) => s !== 0), 0],
      inputs: buildSafeInputs({ ...prev.inputs, fullName, workEmail, phone, companyName }),
    }));

    const runBackgroundSave = async () => {
      try {
        if (user) {
          await setDoc(doc(db, 'users', user.uid, 'workshop', 'active'), {
            ...state,
            leadFormFilled: true,
            currentStep: 1,
            completedSteps: [0],
            inputs: buildSafeInputs({ ...state.inputs, fullName, workEmail, phone, companyName }),
          });
        }
        const { data, error: sbError } = await supabase
          .from('workshop_submissions')
          .upsert({
            user_uid: safeStr(user?.uid),
            user_email: safeStr(user?.email),
            full_name: fullName,
            work_email: workEmail,
            phone,
            company_name: companyName,
            your_role: safeArr<string>(state.inputs?.yourRole),
            current_step: 0,
            workshop_inputs: buildSafeInputs({ ...state.inputs, fullName, workEmail, phone, companyName }),
            workshop_outputs: state.outputs,
          }, { onConflict: 'user_uid' })
          .select()
          .single();

        if (sbError) {
          console.warn('Supabase Upsert Error:', sbError);
        } else if (data?.id) {
          setSubmissionId(safeStr(data.id));
          localStorage.setItem(
            'userLeadData',
            JSON.stringify({ fullName, workEmail, phone, companyName, yourRole: safeArr<string>(state.inputs?.yourRole), submissionId: data.id })
          );
        }
      } catch (err) {
        console.error('Background Save Error:', err);
      }
    };

    runBackgroundSave();
  };

  const setStep = (step: StepId) => {
    const maxAllowedStep = Math.max(...safeArr<StepId>(state.completedSteps), -1 as any) + 1;
    if (step > maxAllowedStep) return;
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const updateInput = (key: keyof WorkshopState['inputs'], value: any) => {
    setState((prev) => ({
      ...prev,
      inputs: buildSafeInputs({ ...prev.inputs, [key]: value }),
    }));
  };

  const completeStep = (step: StepId) => {
    setState((prev) => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(step) ? prev.completedSteps : [...prev.completedSteps, step],
    }));
  };

  const completeAndGoToStep = (current: StepId, next: StepId) => {
    setState((prev) => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(current) ? prev.completedSteps : [...prev.completedSteps, current],
      currentStep: next,
    }));
  };

  const updateOutput = (key: keyof WorkshopState['outputs'], value: any) => {
    setState((prev) => ({
      ...prev,
      outputs: buildSafeOutputs({ ...prev.outputs, [key]: value }),
    }));
  };

  // Supabase incremental sync
  useEffect(() => {
    if (!state.submissionId) return;
    const syncData = async () => {
      try {
        await supabase
          .from('workshop_submissions')
          .update({
            current_step: state.currentStep,
            completed_steps: state.completedSteps,
            workshop_inputs: state.inputs,
            workshop_outputs: state.outputs,
          })
          .eq('id', state.submissionId);
      } catch (err) {
        console.error('Supabase Sync Exception:', err);
      }
    };
    const timer = setTimeout(syncData, 1000);
    return () => clearTimeout(timer);
  }, [state.submissionId, state.currentStep, state.completedSteps, state.inputs, state.outputs]);

  const setSubmissionId = (id: string) => setState((prev) => ({ ...prev, submissionId: id }));

  // ── generateOutput: single hardened version ──
  const generateOutput = async (step: StepId) => {
    setState((prev) => ({ ...prev, isGenerating: true, generationError: null }));

    // Snapshot the latest state safely
    let si!: WorkshopState['inputs'];
    let so!: WorkshopState['outputs'];

    setState((prev) => {
      si = buildSafeInputs(prev.inputs);
      so = buildSafeOutputs(prev.outputs);
      return prev; // no mutation, just read
    });

    // If setState callback hasn't executed synchronously yet (edge-case), fall back
    if (!si) { si = buildSafeInputs(state.inputs); }
    if (!so) { so = buildSafeOutputs(state.outputs); }

    try {
      if (step === 1) {
        const roleStr = normalizeInputList(si.yourRole, si.yourRoleOther);
        const targetIcpStr = normalizeInputList(si.targetIcpDesignation, si.targetIcpDesignationOther);
        const toneStr = normalizeInputList(si.tonePreference, si.tonePreferenceOther);

        const result = await gemini.optimizeLinkedInProfile({
          headline: si.linkedinHeadline,
          about: si.linkedinAbout,
          role: roleStr,
          company: si.companyName,
          targetIcp: targetIcpStr,
          tone: toneStr,
          offer: si.offer,
        });

        setState((prev) => ({
          ...prev,
          outputs: buildSafeOutputs({
            ...prev.outputs,
            profileClarityScore: result.clarityScore,
            scoreMeaning: result.scoreMeaning,
            scoreExplanation: result.scoreExplanation,
            optimizedHeadlines: result.headlines,
            optimizedAbout: result.aboutSection,
            positioningAngles: result.positioningAngles,
            keywordScore: result.keywordScore,
          }),
        }));
      } else if (step === 2) {
        // Build safe data-driven ICP inputs
        const icps = ([1, 2, 3] as const).map((index) => {
          const roles = (si as any)[`icp${index}_roles`] || [];
          const other = (si as any)[`icp${index}_rolesOther`] || '';
          const sizes = (si as any)[`icp${index}_sizes`] || [];
          const industries = (si as any)[`icp${index}_industries`] || [];
          const indOther = (si as any)[`icp${index}_industriesOther`] || '';

          return {
            roles: [
              ...safeArr<string>(roles),
              ...safeStr(other).split(',').map((r: string) => r.trim()).filter(Boolean),
            ],
            industries: [
              ...safeArr<string>(industries),
              ...safeStr(indOther).split(',').map((r: string) => r.trim()).filter(Boolean),
            ],
            companySizes: safeArr<string>(sizes),
          };
        });

        const validIcps = icps.some((i) => i.roles.length || i.industries.length)
          ? icps
          : [{ roles: ['Strategic Target'], industries: ['B2B'], companySizes: ['Growth Stage'] }];

        const result = await gemini.generateDetailedICPs({ icps: validIcps, offer: si.offer });

        setState((prev) => ({
          ...prev,
          outputs: buildSafeOutputs({
            ...prev.outputs,
            icps: result,
            icpSummary: `Generated ${result.length} detailed strategic ICP(s): ${result.map((r: any) => safeStr(r?.name)).join(', ')}`,
          }),
        }));
      } else if (step === 3) {
        const icpsToUse = so.icps.length
          ? so.icps
          : [{ name: 'Target Segment', painPoints: ['Missing optimization'] }];

        const narrativeAngles = normalizeInputArray(si.narrativeAngles, si.narrativeAnglesOther);
        const tonePreference = normalizeInputArray(si.tonePreference, si.tonePreferenceOther);

        const vpTables = await gemini.generateValuePropTables({
          icps: icpsToUse,
          offer: si.offer,
          narrativeAngles: narrativeAngles.length > 0 ? narrativeAngles : ['Authority', 'ROI'],
          tonePreference: tonePreference.length > 0 ? tonePreference : ['Professional'],
        });

        const globalSol = await gemini.generateGlobalSolution(vpTables);

        setState((prev) => ({
          ...prev,
          outputs: buildSafeOutputs({
            ...prev.outputs,
            valuePropTables: vpTables,
            globalSolution: globalSol,
          }),
        }));
      } else if (step === 4) {
        if (!si.brandName.trim()) throw new Error('Enter a brand name first');

        const narrativeAngles = normalizeInputArray(si.narrativeAngles, si.narrativeAnglesOther);
        const tonePreference = normalizeInputArray(si.tonePreference, si.tonePreferenceOther);

        const websitePromptOutput = await gemini.generateWebsitePrompt({
          brandName: si.brandName,
          primaryColor: si.primaryColor,
          secondaryColor: si.secondaryColor,
          inspirationImage: si.inspirationImage,
          valueProp: so.globalSolution || 'Our strategic value proposition',
          icpSummary: so.icpSummary || 'Strategic target audience',
          offer: si.offer,
          narrativeAngles: narrativeAngles.length > 0 ? narrativeAngles : ['Authority', 'ROI'],
          tonePreference: tonePreference.length > 0 ? tonePreference : ['Professional'],
        });

        setState((prev) => ({
          ...prev,
          outputs: buildSafeOutputs({ ...prev.outputs, websitePrompt: websitePromptOutput }),
          completedSteps: prev.completedSteps.includes(4) ? prev.completedSteps : [...prev.completedSteps, 4],
        }));
      } else if (step === 5) {
        const industryStr = normalizeInputList(si.industry, si.industryOther) ||
          safeStr(so.icps[0]?.whoTheyAre) ||
          'B2B Services';

        const strategy = await gemini.generateDetailedGTM({
          icps: so.icps,
          offer: si.offer,
          valuePropTables: so.valuePropTables,
          industry: industryStr,
        });

        setState((prev) => ({
          ...prev,
          outputs: buildSafeOutputs({
            ...prev.outputs,
            gtmStrategy: strategy,
            leadMagnets: safeArr(strategy?.leadMagnets),
          }),
          completedSteps: prev.completedSteps.includes(5) ? prev.completedSteps : [...prev.completedSteps, 5],
        }));
      } else if (step === 6) {
        if (!so.gtmStrategy) throw new Error('Complete GTM Strategy step first');

        const outreach = await gemini.generateOutreachEngine({
          clientName: si.fullName,
          companyName: si.companyName,
          whatTheySell: si.offer,
          targetIndustry: normalizeInputList(si.industry, si.industryOther) || 'B2B',
          primaryProblem: safeStr(so.icps[0]?.painPoints?.[0], 'Inefficiency'),
          valueProp: so.globalSolution || 'Strategic growth positioning',
          icpSummary: so.icpSummary || 'Target ICP segments',
          gtmStrategy: JSON.stringify(so.gtmStrategy ?? {}).substring(0, 2000),
          angle: si.outreachAngle,
          channel: si.outreachChannel,
        });

        setState((prev) => ({
          ...prev,
          outputs: buildSafeOutputs({ ...prev.outputs, outreachEngineOutput: outreach }),
          completedSteps: prev.completedSteps.includes(6) ? prev.completedSteps : [...prev.completedSteps, 6],
        }));
      }

      setState((prev) => ({ ...prev, isGenerating: false, generationError: null }));
    } catch (err: any) {
      console.error('Error generating output:', err);
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        generationError: safeStr(err?.message, 'Something went wrong.'),
      }));
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
            <div className="flex items-center justify-between mb-12">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain max-w-[160px]" style={{ aspectRatio: 'auto' }} />
              {saveStatus !== 'idle' && (
                <div className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all duration-300 ${saveStatus === 'syncing' ? 'bg-primary/20 text-primary animate-pulse' :
                    saveStatus === 'saving' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-green-500/10 text-green-600'
                  }`}>
                  {saveStatus === 'syncing' ? (<><Loader2 className="animate-spin" size={10} /> Syncing...</>) :
                    saveStatus === 'saving' ? (<><CheckCircle2 size={10} className="text-blue-400" /> Saved Locally</>) :
                      (<><CheckCircle2 size={10} /> All changes saved</>)}
                </div>
              )}
            </div>
            <nav className="space-y-1">
              {steps.map((s) => (
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
          <div className="absolute bottom-0 w-full p-8 border-t border-border bg-bg space-y-4">
            <button
              onClick={() => setShowResetModal(true)}
              className="w-full py-3 border border-red-500/30 text-red-500/70 hover:bg-red-500 hover:text-white transition-all rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group"
            >
              <RotateCcw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
              Reset & Start Over
            </button>
            <div className="flex items-center gap-3 text-text-secondary text-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Workshop Live Mode
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 lg:ml-72 min-h-screen flex flex-col">
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
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-text-primary">{safeStr(user.displayName, 'User')}</span>
                    <button onClick={handleLogout} className="text-[10px] text-text-secondary hover:text-red-500 transition-colors uppercase font-bold tracking-widest">Logout</button>
                  </div>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-border" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-section border border-border flex items-center justify-center text-xs font-bold">
                      {safeStr(user.displayName).charAt(0) || safeStr(user.email).charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-section border border-border flex items-center justify-center text-xs font-bold">?</div>
              )}
            </div>
          </header>

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

              <div className="mt-20 pt-8 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => setStep(Math.max(1, state.currentStep - 1) as StepId)}
                  disabled={state.currentStep === 1 || state.isGenerating}
                  className="px-6 py-3 rounded-xl font-bold text-text-secondary hover:bg-section transition-all disabled:opacity-0"
                >
                  Back
                </button>
                <div className="relative group">
                  <button
                    disabled={state.isGenerating}
                    onClick={async () => {
                      const isCompleted = state.completedSteps.includes(state.currentStep as StepId);
                      if (!isCompleted) {
                        try { await generateOutput(state.currentStep as StepId); } catch (e) { /* handled internally */ }
                      } else {
                        setStep(Math.min(7, state.currentStep + 1) as StepId);
                      }
                    }}
                    className={`px-8 py-4 rounded-xl font-black transition-all flex items-center gap-3 shadow-xl ${state.isGenerating ? 'bg-section text-text-secondary cursor-wait translate-y-1' : 'bg-primary text-black hover:scale-[1.02] active:scale-[0.98] hover:shadow-primary/30'
                      }`}
                  >
                    {state.isGenerating ? (
                      <><Loader2 className="animate-spin" size={20} /> Generating Assets...</>
                    ) : state.completedSteps.includes(state.currentStep as StepId) ? (
                      <>
                        {state.currentStep === 1 ? 'Go to ICP Builder' :
                          state.currentStep === 2 ? 'Go to Value Proposition' :
                            state.currentStep === 3 ? 'Generate Website Assets' :
                              state.currentStep === 4 ? 'Create Strategy' :
                                state.currentStep === 5 ? 'Generate Outreach' :
                                  state.currentStep === 6 ? 'Finalize Strategy Report' : 'Next Step'}
                        <ArrowRight size={20} />
                      </>
                    ) : (
                      <>
                        {state.currentStep === 1 ? 'Optimize Profile' :
                          state.currentStep === 2 ? 'Generate ICPs' :
                            state.currentStep === 3 ? 'Generate Value Prop' :
                              state.currentStep === 4 ? 'Build Website Prompt' :
                                state.currentStep === 5 ? 'Generate GTM Strategy' :
                                  state.currentStep === 6 ? 'Generate Outreach' : 'Generate Assets'}
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                  {state.generationError && (
                    <div className="absolute bottom-full right-0 mb-4 w-64 p-3 bg-red-500 text-white text-xs font-bold rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-2">
                      {state.generationError}
                    </div>
                  )}
                </div>
              </div>

              <footer className="mt-32 pt-16 border-t border-border/50 text-center space-y-10 pb-10">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-[0.3em]">Explore, connect, or build your growth engine.</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                  {[
                    { icon: <Linkedin size={24} />, label: 'Connect', href: 'https://www.linkedin.com/in/tejasjhaveri/' },
                    { icon: <Image size={24} />, label: 'Behind the scenes', href: 'https://www.instagram.com/tejas_jhaveri/' },
                    { icon: <Calendar size={24} />, label: 'Book a call', href: 'https://calendly.com/founder-myntmore/30min?month=2026-03' },
                    { icon: <Mail size={24} />, label: 'Get insights', href: 'https://myntmore.com/website-newsletter/' },
                    { icon: <Layers size={24} />, label: 'Explore services', href: 'https://myntmoreservices.notion.site/Myntmore-Core-Services-19d522641d38809d94bae2cad1b5c957?source=copy_link' },
                  ].map((item, idx) => (
                    <motion.a
                      key={idx}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className="p-4 rounded-2xl bg-section border border-border group-hover:border-primary group-hover:bg-primary/5 group-hover:shadow-[0_0_20px_rgba(255,230,0,0.15)] transition-all">
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                    </motion.a>
                  ))}
                </div>
              </footer>
            </div>
          </div>
        </main>
      </div>

      <div id="strategy-report-container">
        <StrategyReport state={state} />
      </div>

      <AnimatePresence>
        {showResumeModal && <ResumeModal onResume={handleResume} onStartOver={handleStartOver} />}
        {showResetModal && <ResetModal onConfirm={handleResetWorkshop} onCancel={() => setShowResetModal(false)} />}
      </AnimatePresence>
    </WorkshopContext.Provider>
  );
}

/*
 ═══════════════════════════════════════════════════════════════════
  CHANGE LOG — ALL FIXES APPLIED
 ═══════════════════════════════════════════════════════════════════

 1. NEW: safeStr(v, fallback) utility — guarantees a string, never undefined/null.
 2. NEW: safeArr<T>(v, fallback) utility — guarantees an array, never undefined/null.
 3. NEW: buildSafeInputs(raw) factory — single centralised function that produces a
         fully typed, fully defaulted inputs object. Called in:
         - Every component (replaces ad-hoc spread+override objects)
         - updateInput()
         - handleSubmit()
         - generateOutput() snapshot
         - localStorage restore
         - Firebase restore

 4. NEW: buildSafeOutputs(raw) factory — mirrors buildSafeInputs for outputs.
         Called in:
         - Every component
         - updateOutput()
         - generateOutput() setState calls
         - localStorage restore

 5. FIX: MultiSelectDropdown — `selected` prop wrapped with safeArr() so .includes()
         and .map() never throw on undefined.

 6. FIX: Step1ProfileCheck — replaced manual safeInputs spread with buildSafeInputs();
         replaced manual safeOutputs spread with buildSafeOutputs().
         All template expressions use safeStr() / safeArr().
         scoreExplanation array accesses (whatsWorking, toImprove, scoreBreakdown)
         all wrapped with safeArr().

 7. FIX: Step2ICPBuilder — dynamic ICP key access
         (`icp${num}_roles` etc.) now goes through safeArr/safeStr rather than
         direct cast, eliminating "cannot read of undefined" on empty persisted state.

 8. FIX: Step3ValueProp — all `row?.xyz` accesses wrapped with safeStr().
         icps fallback uses safeArr. icp.painPoints wrapped with safeArr.

 9. FIX: Step4WebsiteBuilder — si.inspirationImage guarded (typed as string|null).

10. FIX: Step5GTMStrategy — every strategy sub-object access
         (strategy?.leadGen?.targeting, strategy?.partnerGrowth?.scale, etc.)
         wrapped with safeArr() / safeStr() at render time.

11. FIX: Step6OutreachEngine — out?.linkedIn?.connectionRequest,
         out?.linkedIn?.followUps, out?.email?.body etc. all wrapped.

12. FIX: Step7Summary — so.icps[0]?.name, so.valuePropTables[0]?.method etc.
         wrapped with safeStr().

13. FIX: Step0LeadCapture — initialInputs passed through buildSafeInputs().
         user.displayName / user.email access wrapped with safeStr().

14. FIX: App.generateOutput — replaced the fragile setState-capture-trick with
         a direct buildSafeInputs/buildSafeOutputs call on the current state ref,
         plus a fallback if the callback hasn't fired. All internal accesses use
         safeArr / safeStr (e.g. si.yourRole, so.icps[0]?.painPoints?.[0]).

15. FIX: App.handleSubmit — formData fields wrapped with safeStr().

16. FIX: App initialiser (useState) — parsed localStorage state now run through
         buildSafeInputs + buildSafeOutputs, preventing stale/partial state shapes
         from old sessions from causing crashes.

17. FIX: App persistence useEffect — state.inputs.yourRole wrapped with safeArr().

18. FIX: ScoreTooltip bullets — wrapped with safeArr().

19. REMOVED: Redundant per-component manual safe-default spreads (replaced by
    the centralised factories).

20. REMOVED: Blocking validation in generateOutput that checked role/company before
    allowing generation — replaced with graceful fallbacks (empty strings / default
    arrays) so generation always proceeds.

 REMAINING RISK AREAS (outside this file):
 - StrategyReport component: receives `state` prop — ensure it also calls
   buildSafeInputs/buildSafeOutputs internally.
 - gemini service return types: if the API returns partial objects, add optional
   chaining at the call-site as done above.
 - ActionButton, DebouncedInput, DebouncedTextarea: ensure they handle undefined
   `value` props (add `value ?? ''` inside those components).
 ═══════════════════════════════════════════════════════════════════
*/
