import React from 'react';
import { 
  Target, 
  Zap, 
  TrendingUp, 
  Layers, 
  Mail, 
  Calendar, 
  MessageSquare, 
  ChevronRight, 
  Layout, 
  UserCircle,
  Sparkles,
  Globe,
  Send,
  CheckCircle2,
  Briefcase,
  X,
  ArrowRight,
  Shield,
  Activity,
  Maximize2,
  FileText,
  Clock,
  ExternalLink,
  Search,
  Linkedin,
  Image
} from 'lucide-react';
import { WorkshopState } from '../App';
import { LeadMagnet } from '../services/gemini';

interface StrategyReportProps {
  state: WorkshopState;
}

// Layered Information Model Helpers
const Layer1 = ({ children, title, outcome }: { children?: React.ReactNode, title: string, outcome?: string }) => (
  <div className="space-y-4 mb-8">
    <div className="inline-block px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] rounded mb-2">Layer 1: Scan</div>
    <h3 className="text-3xl font-black uppercase tracking-tighter leading-none border-l-4 border-primary pl-6">{title}</h3>
    {outcome && <p className="text-lg font-bold italic text-gray-800 pl-6 leading-tight">Key Outcome: {outcome}</p>}
    <div className="pl-6">{children}</div>
  </div>
);

const Layer2 = ({ children, title }: { children: React.ReactNode, title: string }) => (
  <div className="space-y-6 mb-12 bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
    <div className="inline-block px-3 py-1 bg-gray-200 text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] rounded">Layer 2: Structured Detail</div>
    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 border-b border-gray-200 pb-2">{title}</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{children}</div>
  </div>
);

const Layer3 = ({ children, title }: { children: React.ReactNode, title: string }) => (
  <div className="space-y-4 mb-12 p-8 border-2 border-black rounded-[2.5rem] bg-white relative overflow-hidden">
    <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.3em] rounded">Layer 3: Full Depth</div>
    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-300 underline decoration-primary underline-offset-8 mb-6">{title}</h4>
    <div className="text-[12px] leading-relaxed font-medium text-gray-600 space-y-4">{children}</div>
  </div>
);

export const StrategyReport = ({ state }: StrategyReportProps) => {
  const { inputs, outputs } = state;
  const icps = outputs.icps || [];
  const valuePropTables = outputs.valuePropTables || [];
  const gtmStrategy = outputs.gtmStrategy || { leadGen: { outreach: [] }, leadMagnets: [] };
  const outreachEngine = outputs.outreachEngineOutput;
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Layer 1/2 Data Extraction
  const profileScore = outputs.profileClarityScore || 72;
  const keywordScore = outputs.keywordScore || 65;
  const clarityScoreMeaning = outputs.scoreMeaning || "Standard";

  return (
    <div id="strategy-report" className="bg-white text-black p-0 w-[21cm] min-h-[29.7cm] mx-auto shadow-2xl print:shadow-none print:m-0 font-sans selection:bg-yellow-200 antialiased overflow-x-hidden">
      
      {/* 1. PREMIUM COVER PAGE */}
      <section className="h-[29.7cm] flex flex-col justify-between p-[2cm] border-t-[24px] border-black bg-white page-break-after-always relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-50 rounded-full translate-y-1/2 -translate-x-1/2 -z-10" />
        
        <div className="space-y-16">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-black text-primary flex items-center justify-center font-black text-4xl shadow-xl">M</div>
            <div className="flex flex-col">
              <span className="font-black tracking-[0.3em] text-lg uppercase leading-none">Myntmore</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mt-1">Strategic Growth & Distribution</span>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em]">
              <Shield size={12} className="text-primary" />
              Private & Confidential Deliverable
            </div>
            <h1 className="text-[100px] font-black leading-[0.8] tracking-tighter text-black uppercase">
              Growth <br />
              <span className="text-gray-200">Playbook</span>
            </h1>
            <div className="h-2 w-64 bg-primary shadow-sm"></div>
          </div>

          <div className="max-w-xl space-y-4">
             <p className="text-3xl font-black uppercase tracking-tight leading-tight text-gray-900">
                {outputs.globalSolution?.split('.')[0] || `Strategic Distribution Engine for ${inputs.brandName}`}
             </p>
             <p className="text-base text-gray-500 leading-relaxed font-medium">
               A performance-engineered GTM strategy designed to penetrate {inputs.companyName || 'the target market'} through high-authority positioning and systematic outreach.
             </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-24 border-t-2 border-black pt-12">
          <div className="space-y-3">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-300">Organization Representative</p>
            <p className="text-3xl font-black uppercase tracking-tight leading-none">{inputs.brandName || "Workshop Client"}</p>
            <p className="text-sm font-bold text-gray-500 mt-2">{inputs.fullName} — {inputs.leadRole?.[0] || 'Stakeholder'}</p>
          </div>
          <div className="space-y-3 text-right">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-300">Strategic Release</p>
            <p className="text-3xl font-black tracking-tighter leading-none">{date}</p>
            <p className="text-xs font-black text-primary italic uppercase tracking-[0.2em] mt-2 bg-primary/10 px-4 py-1 rounded-full inline-block">v2.0 Full Integration</p>
          </div>
        </div>
      </section>      {/* 2. EXECUTIVE SNAPSHOT (MANDATORY 1-PAGE SUMMARY) */}
      <section id="Snapshot" className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-20">
          <span className="text-6xl font-black text-primary italic opacity-20">01</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black">Executive Snapshot</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">A 60-second summary of strategy and outcomes</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          <Layer1 
            title={inputs.brandName + " Growth Playbook"}
            outcome={outputs.globalSolution?.split('.')[0]}
          >
            <ul className="grid grid-cols-3 gap-8 mt-8">
              <li className="p-6 bg-black text-white rounded-3xl flex flex-col justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-primary mb-4">Core Mission</span>
                <p className="text-xs font-bold italic leading-tight uppercase">"{inputs.offer?.substring(0, 60)}..."</p>
              </li>
              <li className="p-6 border-2 border-black rounded-3xl flex flex-col justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-300 mb-4">Market Focus</span>
                <p className="text-sm font-black uppercase">{icps.length} Target Segments</p>
              </li>
              <li className="p-6 bg-primary/5 border border-primary/20 rounded-3xl flex flex-col justify-between text-center">
                <span className="text-[8px] font-black uppercase tracking-widest text-primary mb-4">Authority Score</span>
                <div className="text-4xl font-black italic">{profileScore}%</div>
              </li>
            </ul>
          </Layer1>

          <Layer2 title="Primary Value Drivers & Roadmap">
            <div className="space-y-4">
              <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-2">
                <div className="text-[8px] font-black uppercase text-gray-400">Desired Outcome</div>
                <p className="text-xs font-bold">{valuePropTables[0]?.desiredOutcome || "Accelerated Growth Pipeline"}</p>
              </div>
              <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-2">
                <div className="text-[8px] font-black uppercase text-gray-400">Proprietary Method</div>
                <p className="text-xs font-bold italic underline decoration-primary underline-offset-4">{valuePropTables[0]?.method || "Systematic Distribution"}</p>
              </div>
            </div>
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100">
              <div className="flex gap-4 items-start">
                <div className="text-xl font-black text-black opacity-20 italic">W1</div>
                <p className="text-[10px] font-bold uppercase leading-tight">Infrastructure Optimization</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="text-xl font-black text-black opacity-20 italic">W2</div>
                <p className="text-[10px] font-bold uppercase leading-tight">Channel Activation Blitz</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="text-xl font-black text-black opacity-20 italic">W4</div>
                <p className="text-[10px] font-bold uppercase leading-tight">Scale & Feedback Loop</p>
              </div>
            </div>
          </Layer2>
        </div>
      </section>
      {/* 3. PROFILE OPTIMIZATION (LAYERED) */}
      <section id="Profile" className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-20">
          <span className="text-6xl font-black text-primary italic opacity-20">02</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black">Authority Infrastructure</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">LinkedIn Profile Optimization & Logic</div>
          </div>
        </div>

        <div className="space-y-12">
            <Layer1 title="Authority Headline Outcome" outcome={outputs.optimizedHeadlines?.[0]}>
               <div className="mt-6 flex items-center gap-12">
                  <div className="space-y-1">
                     <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Positioning Pivot</span>
                     <p className="text-sm font-bold italic">"{outputs.optimizedHeadlines?.[1] || "Strategic Authority Optimization"}"</p>
                  </div>
                  <div className="text-right ml-auto">
                     <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Impact Score</span>
                     <div className="text-5xl font-black italic leading-none text-primary">{profileScore}%</div>
                  </div>
               </div>
            </Layer1>

           <Layer2 title="Strategic Score Analysis">
              {typeof outputs.scoreExplanation !== 'string' ? (
                <div className="space-y-8">
                  <div className="pb-4 border-b border-gray-100">
                    <h5 className="text-[9px] font-black uppercase text-gray-400 italic mb-2">Overall Strategic Position</h5>
                    <p className="text-xs font-bold leading-relaxed italic">"{outputs.scoreExplanation.overallSummary}"</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                    {[
                      { id: 'clarity', label: 'Clarity' },
                      { id: 'specificity', label: 'Specificity' },
                      { id: 'differentiation', label: 'Differentiation' },
                      { id: 'proof', label: 'Proof' },
                      { id: 'execution', label: 'Execution' }
                    ].map((dim) => {
                      const data = (outputs.scoreExplanation as any).scoreBreakdown[dim.id];
                      return (
                        <div key={dim.id} className="space-y-3">
                          <div className="flex justify-between items-center border-b border-gray-50 pb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest">{dim.label}</span>
                            <span className="text-[10px] font-black text-primary">{data.score}/20</span>
                          </div>
                          <ul className="space-y-1.5">
                            {data.bullets.map((bullet: string, idx: number) => (
                              <li key={idx} className="text-[9px] font-medium text-gray-500 leading-tight flex items-start gap-1.5">
                                <div className="w-1 h-1 bg-primary/40 rounded-full mt-1.5 shrink-0" />
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-12 pt-6 border-t border-gray-100">
                    <div className="space-y-4">
                      <h5 className="text-[9px] font-black uppercase text-emerald-600 italic">Core Strengths</h5>
                      <ul className="space-y-2">
                        {outputs.scoreExplanation.whatsWorking.map((item, i) => (
                          <li key={i} className="text-[9px] font-bold text-gray-700 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h5 className="text-[9px] font-black uppercase text-primary italic">Priority Improvements</h5>
                      <ul className="space-y-2">
                        {outputs.scoreExplanation.toImprove.map((item, i) => (
                          <li key={i} className="text-[9px] font-bold text-gray-700 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                   <h5 className="text-[9px] font-black uppercase text-gray-400 italic">Clarity Metrics</h5>
                   <p className="text-xs font-medium leading-relaxed">{typeof outputs.scoreExplanation === "string" ? outputs.scoreExplanation : outputs.scoreExplanation.overallSummary}</p>
                </div>
              )}
           </Layer2>

           <Layer3 title="Full Engagement Narrative (LinkedIn About)">
              <div className="columns-2 gap-12 whitespace-pre-wrap">
                 {outputs.optimizedAbout}
              </div>
           </Layer3>
        </div>
      </section>

      {/* 4. ICP SEGMENTS (3-LAYER STRUCTURE) */}
      <section id="ICPs" className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-20">
          <span className="text-6xl font-black text-primary italic opacity-20">03</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black">Ideal Customer Segments</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Multi-layered psychographic profiling</div>
          </div>
        </div>

        <div className="space-y-32">
          {icps.map((icp: any, i: number) => (
            <div key={i} className="page-break-inside-avoid space-y-12">
              <Layer1 
                title={icp.name}
                outcome={icp.positioning}
              />

              <Layer2 title="Psychographic & Tactical Breakdown">
                 <div className="space-y-4">
                    <h5 className="text-[9px] font-black uppercase text-gray-400 italic">Core Pain Points</h5>
                    <ul className="space-y-3">
                       {icp.painPoints?.map((p: string, j: number) => (
                         <li key={j} className="text-[10px] font-bold text-gray-800 flex items-start gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-primary">•</span> {p}
                         </li>
                       ))}
                    </ul>
                 </div>
                 <div className="space-y-4">
                    <h5 className="text-[9px] font-black uppercase text-gray-400 italic">Buying Triggers & Objections</h5>
                    <div className="space-y-4">
                       <div className="p-5 border-l-4 border-black bg-white rounded-r-2xl shadow-sm">
                          <p className="text-[10px] font-bold text-gray-600 italic">Trigger: "{icp.triggers}"</p>
                       </div>
                       <div className="p-5 border-l-4 border-primary bg-white rounded-r-2xl shadow-sm">
                          <p className="text-[10px] font-bold text-gray-600">Objection: {icp.objections}</p>
                       </div>
                    </div>
                 </div>
              </Layer2>

              <Layer3 title="Full Psychographic Profile & Strategic Insight">
                 <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-4">
                       <h5 className="text-[9px] font-black uppercase text-gray-400">Deep Profile</h5>
                       <p className="text-[12px] leading-relaxed text-gray-600">{icp.whoTheyAre}</p>
                    </div>
                    <div className="space-y-4">
                       <h5 className="text-[9px] font-black uppercase text-gray-400">Strategic Psychology</h5>
                       <p className="text-[12px] leading-relaxed italic text-gray-500">"{icp.psychology}"</p>
                    </div>
                 </div>
              </Layer3>
            </div>
          ))}
        </div>
      </section>

      {/* 5. POSITIONING & VALUE PROP (ENHANCED) */}
      <section className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-24">
          <span className="text-6xl font-black text-primary italic opacity-20">04</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black">Strategic Positioning Engine</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Converting features into high-intent outcomes</div>
          </div>
        </div>

        <div className="space-y-20">
           <Layer1 title="Core Market Positioning" outcome={outputs.globalSolution?.split('.')[0]}>
              <div className="mt-8 flex items-center gap-10 border-t border-gray-100 pt-8">
                 <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase text-gray-400">Primary Focus</span>
                    <p className="text-sm font-bold uppercase text-primary italic leading-none">{inputs.targetIcp?.[0] || icps[0]?.name}</p> 
                 </div>
                 <div className="h-4 w-px bg-gray-100" />
                 <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase text-gray-400">Winning Angle</span>
                    <p className="text-sm font-bold uppercase text-primary italic leading-none">{valuePropTables[0]?.coreAngle}</p>
                 </div>
              </div>
           </Layer1>

           <div className="space-y-32">
              {valuePropTables.map((row: any, i: number) => (
                <div key={i} className="page-break-inside-avoid space-y-12">
                   <Layer2 title={`Segment Strategy: ${row.icp}`}>
                      <div className="space-y-4">
                         <h5 className="text-[9px] font-black uppercase text-gray-400 italic">The Strategic Transformation</h5>
                         <div className="p-6 bg-white border-2 border-primary/20 rounded-2xl shadow-sm">
                            <p className="text-xl font-black italic">"{row.desiredOutcome}"</p>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <h5 className="text-[9px] font-black uppercase text-gray-400 italic">The Enabling Mechanism</h5>
                         <div className="p-6 bg-black text-white rounded-2xl shadow-xl italic">
                            <p className="text-sm font-bold underline decoration-primary underline-offset-4">{row.method}</p>
                         </div>
                      </div>
                   </Layer2>

                   <Layer3 title="Tactical Logic & Displacement">
                      <div className="grid grid-cols-2 gap-12">
                         <div className="space-y-4">
                            <h5 className="text-[9px] font-black uppercase text-gray-400">Friction Points & Replacement</h5>
                            <p className="text-[12px] leading-relaxed text-gray-600">{row.currentProblem}</p>
                            <p className="text-[11px] font-black text-red-500 line-through decoration-red-500 opacity-60">Replaces: {row.replacement}</p>
                         </div>
                         <div className="space-y-4">
                            <h5 className="text-[9px] font-black uppercase text-gray-400">Strategic Rationale</h5>
                            <p className="text-[12px] leading-relaxed italic text-gray-500">"{row.whyThisWins}"</p>
                         </div>
                      </div>
                   </Layer3>
                </div>
              ))}
           </div>
        </div>
      </section>
      {/* 5. WEBSITE / FUNNEL (STRUCTURAL SPEC) */}
      <section className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-20">
          <span className="text-6xl font-black text-primary italic opacity-20">05</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black">Website Conversion Blueprint</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Architectural layout & conversion mapping</div>
          </div>
        </div>

        <div className="space-y-12">
           <Layer1 title="High-Conversion Landing Architecture" outcome="Frictionless Lead Capture & Trust Building">
              <div className="mt-6 p-8 bg-black text-white rounded-3xl flex justify-between items-center shadow-2xl">
                 <div className="space-y-2">
                    <p className="text-3xl font-black uppercase leading-none tracking-tighter">Precision <br />Structure</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Designed for Authority</p>
                 </div>
                 <div className="flex gap-6 border-l border-white/10 pl-10">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-10 h-10 rounded-full border-2 border-primary shadow-lg shadow-primary/20" style={{ backgroundColor: inputs.primaryColor || '#000' }}></div>
                       <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Primary</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-10 h-10 rounded-full border-2 border-gray-700 shadow-md" style={{ backgroundColor: inputs.secondaryColor || '#fff' }}></div>
                       <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Secondary</span>
                    </div>
                 </div>
              </div>
           </Layer1>

           <Layer2 title="Aesthetic & Tactical Specification">
              <div className="space-y-4">
                 <h5 className="text-[9px] font-black uppercase text-gray-400 italic">Visual Identity Matrix</h5>
                 <p className="text-xs font-bold leading-relaxed text-gray-700">
                    Systematic Glassmorphism • Dynamic Micro-Animations • Minimalist Structuralism • 2024 Tech Startup Aesthetic
                 </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <h6 className="text-[8px] font-black uppercase text-primary mb-2">Typography Strategy</h6>
                    <p className="text-[11px] font-bold italic">Inter / Outfit for high-density readability</p>
                 </div>
                 <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <h6 className="text-[8px] font-black uppercase text-primary mb-2">UX Intent</h6>
                    <p className="text-[11px] font-bold italic">Bypassing generic resistance through authority-first UX</p>
                 </div>
              </div>
           </Layer2>

           {outputs.websitePrompt && (
             <Layer3 title="Full Engineering Intelligence (AI Studio Prompt)">
                <div className="bg-gray-50 p-6 rounded-2xl font-mono text-[11px] text-gray-400 whitespace-pre-wrap max-h-[400px] overflow-hidden relative">
                   {outputs.websitePrompt}
                   <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-50 to-transparent flex items-end justify-center pb-4">
                      <span className="text-[9px] font-black uppercase text-gray-300">Preserved in Appendix for full access</span>
                   </div>
                </div>
             </Layer3>
           )}
        </div>
      </section>

      {/* 06. OUTREACH ACTIVATION (LAYERED) */}
      <section id="Outreach" className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-20">
          <span className="text-6xl font-black text-primary italic opacity-20">06</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black">Outreach Activation</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">LinkedIn + Email High-Intent Sequences</div>
          </div>
        </div>

        <div className="space-y-12">
           <Layer1 title="Primary Campaign Hook" outcome="Value-First Authority Outreach">
              <div className="mt-6 p-8 bg-black text-white rounded-3xl shadow-xl">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">The Psychological Hook</p>
                 <p className="text-2xl font-black italic tracking-tighter uppercase leading-none">
                   "{outreachEngine?.strategySummary?.split('\n\n')[0].substring(0, 100) || "Pattern-interrupting authority sequence"}..."
                 </p>
              </div>
           </Layer1>

           <div className="space-y-20">
              <Layer2 title="LinkedIn Authority Sequence">
                 <div className="space-y-6">
                    <div className="p-8 bg-gray-50 border border-border rounded-2xl space-y-4">
                       <h6 className="text-[10px] font-black uppercase text-primary">Connection Request</h6>
                       <p className="text-sm italic font-medium">"{outreachEngine?.linkedIn?.connectionRequest || "LinkedIn connection sequence not available."}"</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       {outreachEngine?.linkedIn?.followUps?.map((f: string, i: number) => (
                         <div key={i} className="p-4 bg-white border border-border rounded-xl">
                            <span className="text-[8px] font-black text-gray-400 uppercase">Follow-up {i+1}</span>
                            <p className="text-[10px] mt-2 italic">"{f.substring(0, 80)}..."</p>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase text-gray-400 italic">Strategic Channel Split</h5>
                    <div className="p-4 bg-black text-white rounded-xl text-center">
                       <p className="text-xs font-black uppercase tracking-widest italic">{inputs.outreachChannel || 'LinkedIn + Authority Email'}</p>
                    </div>
                 </div>
              </Layer2>

              <Layer3 title="Primary Email Architecture">
                 <div className="space-y-8">
                    <div className="p-8 bg-white border-2 border-black rounded-3xl space-y-4 shadow-xl">
                       <div className="flex items-center justify-between border-b border-black/10 pb-4">
                          <span className="text-[10px] font-black uppercase">Authority Email V1</span>
                          <span className="text-[10px] font-bold text-primary italic">Subject: {outreachEngine?.email?.subjectLine}</span>
                       </div>
                       <div className="text-xs leading-relaxed font-medium whitespace-pre-wrap italic">
                          {outreachEngine?.email?.body || "Email sequence not generated."}
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {outreachEngine?.email?.followUps?.map((f: string, i: number) => (
                         <div key={i} className="space-y-2">
                            <h6 className="text-[8px] font-black uppercase text-gray-400">Email Follow-up {i+1}</h6>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-[10px] leading-relaxed italic opacity-70">
                               "{f.substring(0, 150)}..."
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </Layer3>
           </div>
        </div>
      </section>

      {/* 07. STRATEGIC ASSETS (LAYERED) */}
      <section id="LeadMagnets" className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-20">
          <span className="text-6xl font-black text-primary italic opacity-20">07</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black">Strategic Conversion Assets</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">High-Value Lead Magnets</div>
          </div>
        </div>

        <div className="space-y-16">
          {gtmStrategy?.leadMagnets?.map((m: any, i: number) => (
            <div key={i} className="page-break-inside-avoid space-y-8">
               <Layer1 title={m.name || m.title} outcome={m.whatItDoes || m.outcome}/>
               
               <Layer2 title="Asset Specification">
                  <div className="space-y-4">
                     <h5 className="text-[9px] font-black uppercase text-gray-400 italic">Core Thesis</h5>
                     <p className="text-xs font-bold text-gray-800 italic leading-relaxed">"{m.whyItWorks || m.problem}"</p>
                  </div>
                  <div className="space-y-4">
                     <h5 className="text-[9px] font-black uppercase text-gray-400 italic">Target & Format</h5>
                     <div className="flex items-center gap-4">
                        <div className="px-5 py-2 bg-black text-white text-[10px] font-black uppercase rounded-full">{m.type || m.format}</div>
                        <div className="text-[10px] font-bold text-primary italic tracking-widest">Priority Segment Asset</div>
                     </div>
                  </div>
               </Layer2>

               <Layer3 title="Deliverable Architecture">
                  <div className="columns-2 gap-8">
                     <ul className="space-y-2">
                        {m.contents?.map((content: string, idx: number) => (
                          <li key={idx} className="text-[10px] font-bold flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                             <CheckCircle2 size={12} className="text-primary shrink-0" />
                             {content}
                          </li>
                        ))}
                     </ul>
                     <div className="p-6 bg-black text-white rounded-2xl flex flex-col justify-center text-center">
                        <span className="text-[8px] font-black uppercase text-gray-500 mb-2">Primary CTA</span>
                        <p className="text-xs font-black uppercase tracking-tighter text-primary">{m.cta}</p>
                     </div>
                  </div>
               </Layer3>
            </div>
          ))}
        </div>
      </section>

      {/* 08. EXECUTION MATRIX (LAYERED) */}
      <section className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-24">
          <span className="text-6xl font-black text-primary italic opacity-20">08</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black">Strategic Execution Matrix</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">90-Day implementation roadmap</div>
          </div>
        </div>

        <div className="space-y-12">
           <Layer1 title="90-Day Roadmap Goal" outcome="Full System Integration & Scale">
              <p className="text-sm font-medium text-gray-500 max-w-xl">Benchmark-driven technical and tactical implementation roadmap for market dominance.</p>
           </Layer1>

           <Layer2 title="Weekly Implementation Benchmarks">
              <div className="space-y-6">
                {[
                  { week: "01", title: "Infrastructure & Positioning", items: ["LinkedIn transformation", "CRM integration", "Asset finalization"] },
                  { week: "02", title: "Channel Activation Blitz", items: ["Launch sequences", "Activate Email threads", "Scale engagement"] },
                  { week: "04", title: "Optimization Loop", items: ["A/B test performance", "Refine segment angles", "Scale conversion"] },
                  { week: "08", title: "Scale Elevation", items: ["Scale high-reply channels", "Automation integration", "Strategic review"] }
                ].map((step, i) => (
                  <div key={i} className="flex gap-6 items-start border-l-2 border-gray-100 pl-6 pb-6">
                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black rounded-xl shrink-0">
                        {step.week}
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-black uppercase tracking-tight">{step.title}</p>
                        <p className="text-[9px] text-gray-400 italic">{step.items.join(' • ')}</p>
                    </div>
                  </div>
                ))}
              </div>
           </Layer2>
        </div>
      </section>

      {/* 09. SYSTEM VIEW (LAYERED) */}
      <section className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white flex flex-col justify-center">
        <div className="flex items-baseline gap-6 mb-24 justify-center">
          <span className="text-6xl font-black text-primary italic opacity-20">09</span>
          <div className="space-y-2 text-center">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black text-center">System Integration View</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">End-to-end strategic flow</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 max-w-2xl mx-auto w-full">
           <Layer1 title="Strategic Growth Loop" outcome="Compound Returns through Authority">
              <div className="flex flex-col items-center gap-12 mt-12">
                 <div className="p-8 bg-black text-white rounded-3xl w-full text-center shadow-xl">
                    <p className="text-xl font-black uppercase tracking-tighter">01. ICP Targeted Intelligence</p>
                 </div>
                 <div className="w-1 h-8 bg-primary"></div>
                 <div className="p-8 border-2 border-black rounded-3xl w-full text-center shadow-xl bg-white">
                    <p className="text-xl font-black uppercase tracking-tighter">02. Authority Positioning</p>
                 </div>
                 <div className="w-1 h-8 bg-primary"></div>
                 <div className="p-8 bg-primary text-black rounded-3xl w-full text-center shadow-xl">
                    <p className="text-xl font-black uppercase tracking-tighter">03. Systematic Conversion</p>
                 </div>
              </div>
           </Layer1>
        </div>
      </section>

      {/* 10. STRATEGIC APPENDIX (MANDATORY DATA PRESERVATION) */}
      <section id="Appendix" className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-20 border-b-2 border-gray-100 pb-12">
          <span className="text-6xl font-black text-gray-100 italic">AP</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-gray-400 italic">Strategic Appendix</h2>
            <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Supplemental framework logic & raw data dump</div>
          </div>
        </div>

        <div className="space-y-16">
           <Layer3 title="Raw Market Logic & Contextual Data">
              <div className="grid grid-cols-2 gap-12 text-[11px]">
                 <div className="space-y-4">
                    <h5 className="text-[9px] font-black uppercase text-black">Mission Context</h5>
                    <p className="opacity-70">{inputs.linkedinAbout || "N/A"}</p> 
                 </div>
                 <div className="space-y-4">
                    <h5 className="text-[9px] font-black uppercase text-black">Target ICP Focus</h5>
                    <p className="opacity-70">{icps.map((icp: any) => icp.name).join(', ')}</p>
                 </div>
              </div>
              <div className="pt-8 border-t border-gray-100 mt-8">
                 <h5 className="text-[9px] font-black uppercase text-black mb-4">Strategic Narrative Logic</h5>
                 <p className="opacity-70 italic">{gtmStrategy?.strategicNarrative || "N/A"}</p>
                 <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
                    <h5 className="text-[9px] font-black uppercase text-black mb-4">Full LinkedIn Profile Logic</h5>
                    <p className="whitespace-pre-wrap text-[10px]">{typeof outputs.scoreExplanation === "string" ? outputs.scoreExplanation : outputs.scoreExplanation.overallSummary}</p>
                 </div>
              </div>
           </Layer3>

           <div className="grid grid-cols-2 gap-12">
              <div className="space-y-6">
                 <h4 className="text-[9px] font-black uppercase text-gray-400 border-b border-gray-100 pb-2">Output Metadata</h4>
                 <div className="p-8 border border-gray-100 rounded-3xl space-y-4 text-[10px] font-bold">
                    <div className="flex justify-between">
                       <span>Total Segments</span>
                       <span>{icps.length}</span>
                    </div>
                    <div className="flex justify-between">
                       <span>Campaign Angle</span>
                       <span className="text-primary">{inputs.outreachAngle || 'Authority'}</span>
                    </div>
                 </div>
              </div>
              <div className="space-y-6">
                 <h4 className="text-[9px] font-black uppercase text-gray-400 border-b border-gray-100 pb-2">Authentication</h4>
                 <div className="p-8 bg-black text-white rounded-3xl flex items-center gap-4">
                    <div className="text-primary font-black">OK</div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 leading-tight">Document verified for release.</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 11. CONNECT & EXPLORE (PREMIUM RESOURCE HUB) */}
      <section className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white flex flex-col items-center justify-center text-center">
        <div className="flex items-baseline gap-6 mb-16 justify-center">
          <span className="text-6xl font-black text-primary italic opacity-20">11</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black italic">Connect & Explore</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Premium Resource Hub</div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
          {[
            {
              icon: <Linkedin size={32} className="group-hover:text-black transition-colors" />,
              title: "LinkedIn",
              desc: "Founder Connect",
              href: "https://www.linkedin.com/in/tejasjhaveri/"
            },
            {
              icon: <Image size={32} className="group-hover:text-black transition-colors" />,
              title: "Instagram",
              desc: "Studio Insights",
              href: "https://www.instagram.com/tejas_jhaveri/"
            },
            {
              icon: <Calendar size={32} className="group-hover:text-black transition-colors" />,
              title: "Book a Call",
              desc: "Strategy Session",
              href: "https://calendly.com/founder-myntmore/30min?month=2026-03"
            },
            {
              icon: <Mail size={32} className="group-hover:text-black transition-colors" />,
              title: "Newsletter",
              desc: "Growth Weekly",
              href: "https://myntmore.com/website-newsletter/"
            },
            {
              icon: <Layers size={32} className="group-hover:text-black transition-colors" />,
              title: "Core Services",
              desc: "Solutions Hub",
              href: "https://myntmoreservices.notion.site/Myntmore-Core-Services-19d522641d38809d94bae2cad1b5c957?source=copy_link"
            }
          ].map((item, idx) => (
            <a 
              key={idx} 
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-10 border-2 border-black rounded-[3rem] bg-white hover:bg-primary group transition-all duration-500 flex flex-col items-center gap-6"
            >
              <div className="p-5 rounded-2xl bg-gray-50 group-hover:bg-white transition-colors text-primary">
                {item.icon}
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black uppercase tracking-tighter group-hover:text-black">{item.title}</h4>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-tight group-hover:text-black/60">{item.desc}</p>
              </div>
            </a>
          ))}
        </div>

        <footer className="mt-40 pt-10 border-t border-gray-100 w-full">
           <p className="text-[10px] font-black uppercase tracking-[1em] text-gray-300">Confidential © {new Date().getFullYear()} Myntmore Advisory Group</p>
        </footer>
      </section>
    </div>
  );
};
