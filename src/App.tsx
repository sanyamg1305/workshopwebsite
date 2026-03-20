/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  Briefcase,
  Image,
  Share2,
  Calendar,
  Layers
} from 'lucide-react';
import * as gemini from './services/gemini';
import { supabase } from './services/supabase';

// --- Types ---

type StepId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface WorkshopState {
  currentStep: StepId;
  completedSteps: StepId[];
  submissionId: string | null;
  inputs: {
    fullName: string;
    workEmail: string;
    phone: string;
    companyName: string;
    leadRole: string;
    linkedinHeadline: string;
    linkedinAbout: string;
    role: string;
    targetIcp: string;
    tonePreference: string;
    industry: string;
    companySize: string;
    geography: string;
    decisionMaker: string;
    painPoints: string[];
    budget: string;
    outcome: string;
    method: string;
    replacement: string;
    brandName: string;
    brandColor: string;
    inspirationUrl: string;
    campaignType: string;
    tone: string;
    cta: string;
    dmAngle: string;
    dmTone: string;
  };
  outputs: {
    profileClarityScore: number;
    optimizedHeadlines: string[];
    optimizedAbout: string;
    optimizedPositioning: string;
    keywordScore: number;
    icpSummary: string;
    valueProp: string;
    websitePrompt: string;
    gtmReport: {
      primary: string;
      secondary: string;
      plan: string[];
      results: string;
    };
    campaignFlow: string[];
    dmMessages: { name: string; message: string; whyItWorks: string }[];
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
  setSubmissionId: (id: string) => void;
} | null>(null);

const useWorkshop = () => {
  const context = useContext(WorkshopContext);
  if (!context) throw new Error('useWorkshop must be used within WorkshopProvider');
  return context;
};

// --- Components ---

const Step0LeadCapture = () => {
  const { state, updateInput, setStep, completeStep, setSubmissionId } = useWorkshop();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, workEmail, phone, companyName, leadRole } = state.inputs;
    
    if (!fullName || !workEmail || !phone || !companyName) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      // Save to Supabase
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
        console.error("Supabase Insert Error:", sbError);
        throw sbError;
      }

      if (!data) throw new Error("No data returned from database.");

      // Save to localStorage
      const leadData = { fullName, workEmail, phone, companyName, leadRole, submissionId: data.id };
      localStorage.setItem('userLeadData', JSON.stringify(leadData));
      
      setSubmissionId(data.id);
      completeStep(0);
      setStep(1);
    } catch (err: any) {
      console.error("Workshop Start Error:", err);
      let errorMessage = 'Failed to start workshop. Please try again.';
      
      if (err.message?.includes('relation "workshop_submissions" does not exist')) {
        errorMessage = 'Database table "workshop_submissions" is missing in your Supabase project.';
      } else if (err.message?.includes('row-level security policy')) {
        errorMessage = 'Database permission denied. Please check your Supabase RLS policies.';
      } else if (err.message?.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your internet connection or Supabase URL.';
      }
      
      setError(errorMessage);
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
            <label className="text-xs font-bold uppercase text-text-secondary">Role (Optional)</label>
            <select
              className="w-full px-4 py-4 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg text-lg appearance-none cursor-pointer"
              value={state.inputs.leadRole}
              onChange={(e) => updateInput('leadRole', e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="Founder">Founder</option>
              <option value="Marketer">Marketer</option>
              <option value="Sales">Sales</option>
              <option value="Freelancer">Freelancer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 mt-4"
          >
            Start Workshop
            <ArrowRight size={24} />
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
  const { state, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = ['Founder', 'CEO', 'Consultant', 'Freelancer', 'Agency Owner', 'Sales Leader', 'Marketing Director', 'Other'];
  const tones = ['Bold', 'Professional', 'Casual', 'Witty', 'Direct', 'Empathetic', 'Data-driven'];

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    try {
      await generateOutput(1);
    } catch (err) {
      setError("Failed to optimize profile. Please check your API key.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Profile Optimizer</h2>
        <p className="text-text-secondary">Optimize your LinkedIn profile for maximum conversion.</p>
      </div>

      <div className="bg-section p-6 rounded-2xl border border-border space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-text-secondary">LinkedIn Headline</label>
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
          <label className="text-xs font-bold uppercase text-text-secondary">Role</label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg appearance-none cursor-pointer"
            value={state.inputs.role}
            onChange={(e) => updateInput('role', e.target.value)}
          >
            <option value="">Select Role</option>
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-text-secondary">Target ICP</label>
          <input
            type="text"
            placeholder="e.g. Talent Leaders, SaaS Founders..."
            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-bg"
            value={state.inputs.targetIcp}
            onChange={(e) => updateInput('targetIcp', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-text-secondary">Tone Preference</label>
          <div className="flex flex-wrap gap-2">
            {tones.map(t => (
              <Chip 
                key={t} 
                label={t} 
                selected={state.inputs.tonePreference === t} 
                onClick={() => updateInput('tonePreference', t)} 
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleOptimize}
          disabled={loading || !state.inputs.linkedinHeadline || !state.inputs.linkedinAbout || !state.inputs.role || !state.inputs.targetIcp || !state.inputs.tonePreference}
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
                  navigator.clipboard.writeText(state.outputs.optimizedPositioning);
                  alert('Positioning copied!');
                }}
                className="p-2 hover:bg-primary/10 rounded-lg text-primary"
              >
                <Copy size={16} />
              </button>
            </div>
            <h4 className="text-xs font-bold uppercase text-primary mb-4 tracking-widest flex items-center gap-2">
              <Target size={16} />
              Strategic Positioning
            </h4>
            <p className="text-xl font-bold italic leading-relaxed">"{state.outputs.optimizedPositioning}"</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const Step2ICPBuilder = () => {
  const { state, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateOutput(2);
    } finally {
      setLoading(false);
    }
  };

  const industries = ['SaaS', 'Agencies', 'E-commerce', 'Coaches', 'Local', 'Other'];
  const sizes = ['1–10', '10–50', '50–200', '200+'];
  const geos = ['India', 'US', 'Europe', 'Global'];
  const dms = ['Founder', 'CEO', 'Head of Marketing', 'Head of Sales', 'Growth Lead'];
  const pains = ['Not enough leads', 'Low calls', 'Poor conversion', 'Expensive ads', 'No system'];
  const budgets = ['<1k', '1–5k', '5–20k', '20k+'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">ICP Builder</h2>
        <p className="text-text-secondary">Define your Ideal Customer Profile with a few clicks.</p>
      </div>

      <div className="space-y-6">
        <section>
          <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-text-secondary">Industry</label>
          <div className="flex flex-wrap gap-2">
            {industries.map(i => (
              <Chip key={i} label={i} selected={state.inputs.industry === i} onClick={() => updateInput('industry', i)} />
            ))}
          </div>
        </section>

        <section>
          <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-text-secondary">Company Size</label>
          <div className="flex flex-wrap gap-2">
            {sizes.map(s => (
              <Chip key={s} label={s} selected={state.inputs.companySize === s} onClick={() => updateInput('companySize', s)} />
            ))}
          </div>
        </section>

        <section>
          <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-text-secondary">Geography</label>
          <div className="flex flex-wrap gap-2">
            {geos.map(g => (
              <Chip key={g} label={g} selected={state.inputs.geography === g} onClick={() => updateInput('geography', g)} />
            ))}
          </div>
        </section>

        <section>
          <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-text-secondary">Decision Maker</label>
          <div className="flex flex-wrap gap-2">
            {dms.map(d => (
              <Chip key={d} label={d} selected={state.inputs.decisionMaker === d} onClick={() => updateInput('decisionMaker', d)} />
            ))}
          </div>
        </section>

        <section>
          <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-text-secondary">Pain Points (Multi-select)</label>
          <div className="flex flex-wrap gap-2">
            {pains.map(p => (
              <Chip 
                key={p} 
                label={p} 
                selected={state.inputs.painPoints.includes(p)} 
                onClick={() => {
                  const newPains = state.inputs.painPoints.includes(p)
                    ? state.inputs.painPoints.filter(x => x !== p)
                    : [...state.inputs.painPoints, p];
                  updateInput('painPoints', newPains);
                }} 
              />
            ))}
          </div>
        </section>

        <section>
          <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-text-secondary">Monthly Budget</label>
          <div className="flex flex-wrap gap-2">
            {budgets.map(b => (
              <Chip key={b} label={b} selected={state.inputs.budget === b} onClick={() => updateInput('budget', b)} />
            ))}
          </div>
        </section>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
      >
        {loading && <Loader2 className="animate-spin" size={24} />}
        {loading ? 'Generating ICP...' : 'Generate ICP Summary'}
      </button>

      {state.outputs.icpSummary && (
        <OutputCard title="ICP Summary" copyText={state.outputs.icpSummary}>
          {state.outputs.icpSummary}
        </OutputCard>
      )}
    </div>
  );
};

const Step3ValueProp = () => {
  const { state, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateOutput(3);
    } finally {
      setLoading(false);
    }
  };

  const outcomes = ['More leads', 'More calls', 'Better conversion', 'Scale outbound', 'Better ROI'];
  const methods = ['LinkedIn outreach', 'Cold email', 'Automation', 'AI', 'Content'];
  const replacements = ['Expensive ads', 'Hiring SDRs', 'Manual work', 'Inconsistent pipeline'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Value Proposition</h2>
        <p className="text-text-secondary">Craft a high-converting one-liner for your business.</p>
      </div>

      <div className="space-y-6">
        <section>
          <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-text-secondary">Primary Outcome</label>
          <div className="flex flex-wrap gap-2">
            {outcomes.map(o => (
              <Chip key={o} label={o} selected={state.inputs.outcome === o} onClick={() => updateInput('outcome', o)} />
            ))}
          </div>
        </section>

        <section>
          <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-text-secondary">Your Method</label>
          <div className="flex flex-wrap gap-2">
            {methods.map(m => (
              <Chip key={m} label={m} selected={state.inputs.method === m} onClick={() => updateInput('method', m)} />
            ))}
          </div>
        </section>

        <section>
          <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-text-secondary">What you replace</label>
          <div className="flex flex-wrap gap-2">
            {replacements.map(r => (
              <Chip key={r} label={r} selected={state.inputs.replacement === r} onClick={() => updateInput('replacement', r)} />
            ))}
          </div>
        </section>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
      >
        {loading && <Loader2 className="animate-spin" size={24} />}
        {loading ? 'Generating Value Prop...' : 'Generate Value Prop'}
      </button>

      {state.outputs.valueProp && (
        <OutputCard title="Value Proposition" highlight copyText={state.outputs.valueProp}>
          {state.outputs.valueProp}
        </OutputCard>
      )}
    </div>
  );
};

const Step4WebsiteBuilder = () => {
  const { state, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateOutput(4);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
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
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-text-secondary">Brand Color</label>
          <div className="flex gap-3">
            <input
              type="color"
              className="h-12 w-20 rounded-xl border border-border p-1 cursor-pointer"
              value={state.inputs.brandColor}
              onChange={(e) => updateInput('brandColor', e.target.value)}
            />
            <input
              type="text"
              className="flex-1 px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none font-mono text-sm"
              value={state.inputs.brandColor}
              onChange={(e) => updateInput('brandColor', e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold uppercase text-text-secondary">Design Inspiration URL</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none"
            placeholder="Paste a Pinterest or Dribbble link"
            value={state.inputs.inspirationUrl}
            onChange={(e) => updateInput('inspirationUrl', e.target.value)}
          />
          <p className="text-[10px] text-text-secondary">Find a website style you like and paste it here.</p>
        </div>
      </div>

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
        </div>
      )}
    </div>
  );
};

const Step5GTMStrategy = () => {
  const { state, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateOutput(5);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">GTM Strategy</h2>
        <p className="text-text-secondary">Your customized Go-To-Market roadmap for the next 90 days.</p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
      >
        {loading && <Loader2 className="animate-spin" size={24} />}
        {loading ? 'Generating Report...' : 'Generate GTM Report'}
      </button>

      {state.outputs.gtmReport.primary && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-section border border-border rounded-2xl overflow-hidden shadow-lg"
        >
          <div className="bg-primary p-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-black">
              <TrendingUp size={24} />
              GTM Strategy Report
            </h3>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-xs font-bold uppercase text-text-secondary mb-2 block">Primary Channel</label>
                <div className="text-2xl font-bold text-text-primary">{state.outputs.gtmReport.primary}</div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-text-secondary mb-2 block">Secondary Channel</label>
                <div className="text-2xl font-bold text-text-primary">{state.outputs.gtmReport.secondary}</div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-text-secondary mb-4 block">Weekly Action Plan</label>
              <div className="space-y-3">
                {state.outputs.gtmReport.plan.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-bg rounded-xl border border-border">
                    <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <span className="font-medium">{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-primary text-black rounded-2xl">
              <label className="text-xs font-bold uppercase opacity-60 mb-2 block">Expected Results (90 Days)</label>
              <div className="text-xl font-medium italic">"{state.outputs.gtmReport.results}"</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const Step6OutreachCampaign = () => {
  const { state, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateOutput(6);
    } finally {
      setLoading(false);
    }
  };

  const types = ['LinkedIn', 'Email', 'Hybrid', 'Twitter/X', 'Cold Call Script'];
  const tones = ['Friendly', 'Direct', 'Insight-led', 'Curious', 'Challenger', 'Helpful', 'Urgent'];
  const ctas = ['Soft', 'Direct', 'Question-based', 'Value-first', 'Calendar Link', 'Reply-based'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Outreach Campaign</h2>
        <p className="text-text-secondary">Design the flow of your automated outreach sequence.</p>
      </div>

      <div className="space-y-6">
        <section>
          <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-text-secondary">Campaign Type</label>
          <div className="flex flex-wrap gap-2">
            {types.map(t => (
              <Chip key={t} label={t} selected={state.inputs.campaignType === t} onClick={() => updateInput('campaignType', t)} />
            ))}
          </div>
        </section>

        <section>
          <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-text-secondary">Tone of Voice</label>
          <div className="flex flex-wrap gap-2">
            {tones.map(t => (
              <Chip key={t} label={t} selected={state.inputs.tone === t} onClick={() => updateInput('tone', t)} />
            ))}
          </div>
        </section>

        <section>
          <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-text-secondary">Call to Action</label>
          <div className="flex flex-wrap gap-2">
            {ctas.map(c => (
              <Chip key={c} label={c} selected={state.inputs.cta === c} onClick={() => updateInput('cta', c)} />
            ))}
          </div>
        </section>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !state.inputs.campaignType || !state.inputs.tone || !state.inputs.cta}
        className="w-full py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
      >
        {loading && <Loader2 className="animate-spin" size={24} />}
        {loading ? 'Generating Flow...' : 'Generate Campaign Flow'}
      </button>

      {state.outputs.campaignFlow.length > 0 && (
        <div className="space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
            <Layers size={16} className="text-primary" />
            Campaign Sequence
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {state.outputs.campaignFlow.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 bg-section border border-border rounded-2xl relative group hover:border-primary transition-all"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-black rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                  {i + 1}
                </div>
                <div className="text-xs text-text-secondary leading-relaxed">
                  {step}
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(step);
                    alert('Step content copied!');
                  }}
                  className="mt-4 w-full py-2 text-[10px] font-bold uppercase tracking-wider border border-border rounded-lg hover:bg-primary hover:border-primary hover:text-black transition-all"
                >
                  Copy Step
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Step7DMGenerator = () => {
  const { state, updateInput, generateOutput } = useWorkshop();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateOutput(7);
    } finally {
      setLoading(false);
    }
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
        <section>
          <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-text-secondary">Message Angle</label>
          <div className="flex flex-wrap gap-2">
            {angles.map(a => (
              <Chip key={a} label={a} selected={state.inputs.dmAngle === a} onClick={() => updateInput('dmAngle', a)} />
            ))}
          </div>
        </section>

        <section>
          <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-text-secondary">Message Tone</label>
          <div className="flex flex-wrap gap-2">
            {tones.map(t => (
              <Chip key={t} label={t} selected={state.inputs.dmTone === t} onClick={() => updateInput('dmTone', t)} />
            ))}
          </div>
        </section>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
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
  const { state } = useWorkshop();

  const handleDownload = () => {
    const content = `
B2B LEAD GENERATION WORKSHOP SUMMARY
-------------------------
ICP: ${state.outputs.icpSummary}
VALUE PROP: ${state.outputs.valueProp}
GTM STRATEGY: ${state.outputs.gtmReport.primary} + ${state.outputs.gtmReport.secondary}
EXPECTED RESULTS: ${state.outputs.gtmReport.results}
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workshop-summary.txt';
    a.click();
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
            <div className="text-sm font-bold">{state.outputs.gtmReport.primary}</div>
            <div className="text-xs text-text-secondary">Secondary: {state.outputs.gtmReport.secondary}</div>
          </div>
        </div>

        <div className="p-8 border-2 border-border rounded-3xl bg-section shadow-sm hover:border-primary transition-colors group">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="text-primary group-hover:scale-110 transition-transform" size={20} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Campaign Setup</h4>
          </div>
          <div className="text-sm font-bold">{state.inputs.campaignType}</div>
          <div className="text-xs text-text-secondary">{state.inputs.tone} Tone · {state.inputs.cta} CTA</div>
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
          <Send size={20} />
          Download Summary
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
      leadRole: '',
      linkedinHeadline: '',
      linkedinAbout: '',
      role: '',
      targetIcp: '',
      tonePreference: '',
      industry: '',
      companySize: '',
      geography: '',
      decisionMaker: '',
      painPoints: [],
      budget: '',
      outcome: '',
      method: '',
      replacement: '',
      brandName: '',
      brandColor: '#FFC947',
      inspirationUrl: '',
      campaignType: '',
      tone: '',
      cta: '',
      dmAngle: '',
      dmTone: '',
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
            optimizedHeadlines: [],
            optimizedAbout: '',
            optimizedPositioning: '',
            keywordScore: 0,
            icpSummary: '',
            valueProp: '',
            websitePrompt: '',
            gtmReport: { primary: '', secondary: '', plan: [], results: '' },
            campaignFlow: [],
            dmMessages: [],
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
        optimizedHeadlines: [],
        optimizedAbout: '',
        optimizedPositioning: '',
        keywordScore: 0,
        icpSummary: '',
        valueProp: '',
        websitePrompt: '',
        gtmReport: { primary: '', secondary: '', plan: [], results: '' },
        campaignFlow: [],
        dmMessages: [],
      }
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
        const result = await gemini.optimizeLinkedInProfile({
          headline: inputs.linkedinHeadline,
          about: inputs.linkedinAbout,
          role: inputs.role,
          targetIcp: inputs.targetIcp,
          tone: inputs.tonePreference
        });
        newOutputs.profileClarityScore = result.clarityScore;
        newOutputs.optimizedHeadlines = result.headlines;
        newOutputs.optimizedAbout = result.aboutSection;
        newOutputs.optimizedPositioning = result.positioning;
        newOutputs.keywordScore = result.keywordScore;
      } else if (step === 2) {
        const summary = `We target ${inputs.industry} companies with ${inputs.companySize} employees in ${inputs.geography}. Our primary contact is the ${inputs.decisionMaker} who is struggling with ${inputs.painPoints.join(', ')} and has a budget of ${inputs.budget}/mo.`;
        newOutputs.icpSummary = summary;
      } else if (step === 3) {
        const prop = await gemini.generateValueProp(inputs.outcome, inputs.method, inputs.replacement);
        newOutputs.valueProp = prop;
      } else if (step === 4) {
        const prompt = await gemini.generateWebsitePrompt(inputs.brandName, inputs.brandColor, inputs.inspirationUrl, newOutputs.valueProp);
        newOutputs.websitePrompt = prompt;
      } else if (step === 5) {
        const report = await gemini.generateGTMStrategy(inputs.industry, newOutputs.icpSummary, newOutputs.valueProp);
        newOutputs.gtmReport = report;
      } else if (step === 6) {
        const flow = await gemini.generateCampaignFlow(inputs.campaignType, inputs.tone, inputs.cta, newOutputs.icpSummary, newOutputs.valueProp);
        newOutputs.campaignFlow = flow;
      } else if (step === 7) {
        const dms = await gemini.generateDMAngles(inputs.industry, newOutputs.icpSummary, newOutputs.valueProp);
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
      <WorkshopContext.Provider value={{ state, setStep, updateInput, completeStep, generateOutput }}>
        <Step0LeadCapture />
      </WorkshopContext.Provider>
    );
  }

  return (
    <WorkshopContext.Provider value={{ state, setStep, updateInput, completeStep, generateOutput, setSubmissionId }}>
      <div className="flex min-h-screen bg-bg">
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
    </WorkshopContext.Provider>
  );
}
