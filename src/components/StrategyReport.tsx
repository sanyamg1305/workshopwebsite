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

export const StrategyReport = ({ state }: StrategyReportProps) => {
  const { inputs, outputs } = state;
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
               A performance-engineered GTM strategy designed to penetrate the {inputs.targetIcp?.[0] || 'target market'} through high-authority positioning and systematic outreach.
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
      </section>

      {/* 2. EXECUTIVE SNAPSHOT (MANDATORY 1-PAGE SUMMARY) */}
      <section className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-20">
          <span className="text-6xl font-black text-primary italic opacity-20">01</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black">Executive Snapshot</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">A 60-second summary of strategy and outcomes</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {/* Layer 1 Focus */}
          <div className="grid grid-cols-3 gap-8">
            <div className="p-8 bg-black text-white rounded-[2.5rem] flex flex-col justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-6">Core Mission</span>
              <p className="text-lg font-black leading-tight uppercase italic decoration-primary underline underline-offset-8">"{outputs.globalSolution?.split('\n\n')[0].substring(0, 80) || inputs.offer}..."</p>
            </div>
            <div className="p-8 border-2 border-black rounded-[2.5rem] flex flex-col justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-6">Market Focus</span>
              <p className="text-xl font-black leading-tight uppercase tracking-tighter">{inputs.targetIcp?.join(', ')}</p>
            </div>
            <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] flex flex-col justify-between text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-6">Engagement Score</span>
              <div className="text-6xl font-black italic text-black">{outputs.profileClarityScore || 85}%</div>
            </div>
          </div>

          <div className="grid grid-cols-[2fr,1fr] gap-12">
            <div className="space-y-8">
               <div className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 border-b border-gray-100 pb-2">Primary Value Drivers</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="p-1.5 bg-black text-white text-[9px] font-black uppercase tracking-widest w-fit rounded">Desired Outcome</div>
                      <p className="text-sm font-bold leading-relaxed">{outputs.valuePropTables?.[0]?.desiredOutcome || "Accelerated growth through systematic distribution"}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="p-1.5 bg-primary text-black text-[9px] font-black uppercase tracking-widest w-fit rounded">Proprietary Method</div>
                      <p className="text-sm font-bold leading-relaxed italic underline decoration-primary underline-offset-4">{outputs.valuePropTables?.[0]?.method || "High-Authority Value-Led Outreach"}</p>
                    </div>
                  </div>
               </div>

               <div className="space-y-6 bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Tactical Roadmap Overview</h3>
                  <div className="space-y-6">
                    <div className="flex gap-6 items-start">
                      <div className="text-2xl font-black text-black opacity-30 italic leading-none">W1</div>
                      <div className="space-y-1">
                        <p className="text-sm font-black uppercase tracking-tight">System Infrastructure</p>
                        <p className="text-[11px] text-gray-500 font-medium">LinkedIn Profile optimization & GTM integration</p>
                      </div>
                    </div>
                    <div className="flex gap-6 items-start">
                      <div className="text-2xl font-black text-black opacity-30 italic leading-none">W2</div>
                      <div className="space-y-1">
                        <p className="text-sm font-black uppercase tracking-tight">Channel Activation</p>
                        <p className="text-[11px] text-gray-500 font-medium">Activation of direct-response outreach sequences</p>
                      </div>
                    </div>
                    <div className="flex gap-6 items-start">
                      <div className="text-2xl font-black text-black opacity-30 italic leading-none">W4</div>
                      <div className="space-y-1">
                        <p className="text-sm font-black uppercase tracking-tight">Optimization Loop</p>
                        <p className="text-[11px] text-gray-500 font-medium">Conversion testing and scale of high-intent channels</p>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="p-10 border-2 border-black rounded-[2.5rem] space-y-8 flex flex-col justify-center">
               <div className="space-y-2">
                 <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Tone Matrix</h4>
                 <div className="flex flex-wrap gap-2">
                    {state.inputs.tonePreference?.map((tone, i) => (
                      <span key={i} className="px-3 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-lg">{tone}</span>
                    ))}
                 </div>
               </div>
               <div className="space-y-2">
                 <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Channel Split</h4>
                 <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                    <p className="text-xl font-black uppercase italic tracking-tighter text-black">{inputs.outreachChannel || 'Dual Channel'}</p>
                 </div>
               </div>
               <div className="space-y-2">
                 <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Consulting Lead</h4>
                 <p className="text-sm font-black italic">Myntmore Advisory</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROFILE OPTIMIZATION (LAYERED) */}
      <section className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-20">
          <span className="text-6xl font-black text-primary italic opacity-20">02</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black">Authority Infrastructure</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">LinkedIn Profile Optimization & Logic</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-16">
           <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] rounded">Layer 1: Scanning Outcome</div>
              <div className="p-12 bg-gray-50 border-2 border-black rounded-[3rem] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 -z-10"><UserCircle size={160}/></div>
                 <div className="space-y-12">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Target Authority Headline</h4>
                       <p className="text-[44px] font-black leading-[0.9] text-black tracking-tighter uppercase">{outputs.optimizedHeadlines?.[0]}</p>
                    </div>
                    <div className="flex items-center gap-12 pt-12 border-t border-gray-200">
                       <div className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Positioning Pivot</h4>
                          <p className="text-xl font-bold italic text-gray-800">"{outputs.positioningAngles}"</p>
                       </div>
                       <div className="text-right">
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Impact Score</span>
                          <div className="text-[80px] font-black italic leading-none text-primary">{outputs.profileClarityScore}</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="inline-block px-4 py-1.5 bg-gray-100 text-gray-400 text-[9px] font-black uppercase tracking-[0.3em] rounded">Layer 2: Structured Details</div>
              <div className="grid grid-cols-[1fr,2.5fr] gap-12">
                 <div className="space-y-8">
                    <div className="space-y-3">
                       <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Score Analysis</h4>
                       <p className="text-xs font-medium leading-relaxed text-gray-600">{outputs.scoreExplanation}</p>
                    </div>
                    <div className="space-y-3">
                       <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Improvement Areas</h4>
                       <ul className="space-y-2">
                          {outputs.scoreMeaning?.split('.').filter(Boolean).slice(0, 3).map((item, i) => (
                            <li key={i} className="text-[10px] font-bold text-gray-500 flex items-start gap-2">
                               <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                               {item.trim()}
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
                 <div className="p-12 border-2 border-black rounded-[2.5rem] bg-white">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 underline decoration-primary underline-offset-8">Engagement Narrative (About Section)</h4>
                    <div className="text-[13px] leading-relaxed font-medium text-gray-700 whitespace-pre-wrap columns-2 gap-12">
                       {outputs.optimizedAbout}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 4. ICP SEGMENTS (3-LAYER STRUCTURE) */}
      <section className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-20">
          <span className="text-6xl font-black text-primary italic opacity-20">03</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black">Ideal Customer Segments</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Multi-layered psychographic profiling</div>
          </div>
        </div>

        <div className="space-y-24">
          {outputs.icps?.map((icp, i) => (
            <div key={i} className="page-break-inside-avoid space-y-12">
              {/* L1 & L2 Combined */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] gap-16 border-t border-gray-100 pt-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-black text-gray-100">{i + 1}</div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary italic">Primary ICP</p>
                      <h3 className="text-4xl font-black uppercase leading-[0.85] tracking-tighter">{icp.name}</h3>
                    </div>
                  </div>
                  <div className="p-5 bg-black text-white rounded-2xl">
                     <p className="text-sm font-bold leading-tight italic">"{icp.positioning}"</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12">
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Activity size={14} className="text-primary" /> Core Pain Points
                      </h4>
                      <ul className="space-y-3">
                         {icp.painPoints?.map((p, j) => (
                           <li key={j} className="text-[11px] font-bold text-gray-800 flex items-start gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100/50">
                              <span className="text-primary">•</span> {p}
                           </li>
                         ))}
                      </ul>
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Zap size={14} className="text-primary" /> Buying Triggers
                      </h4>
                      <div className="p-6 border-l-4 border-black bg-gray-50 rounded-r-2xl">
                         <p className="text-[11px] leading-relaxed font-medium text-gray-600 italic">"{icp.triggers}"</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* L3 Detail */}
              <div className="grid grid-cols-3 gap-8">
                 <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100 space-y-4">
                    <h5 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Who They Are</h5>
                    <p className="text-[11px] leading-relaxed text-gray-600 font-medium">{icp.whoTheyAre}</p>
                 </div>
                 <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100 space-y-4">
                    <h5 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Goals & Objections</h5>
                    <div className="space-y-4">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase text-text-secondary">Primary Goal</p>
                          <p className="text-[11px] font-bold text-gray-800">{icp.goals}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase text-text-secondary">Main Objection</p>
                          <p className="text-[11px] font-bold text-gray-800">{icp.objections}</p>
                       </div>
                    </div>
                 </div>
                 <div className="bg-black text-white p-8 rounded-3xl space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Globe size={60}/></div>
                    <h5 className="text-[9px] font-black uppercase tracking-widest text-primary">Strategic Insight</h5>
                    <p className="text-[11px] leading-relaxed italic text-gray-300">"{icp.psychology}"</p>
                 </div>
              </div>
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
           {/* Global Value Prop (L1) */}
           <div className="p-16 bg-black text-white rounded-[4rem] text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-primary/5 -z-10" />
              <div className="space-y-6">
                 <span className="text-[11px] font-black uppercase tracking-[0.8em] text-gray-500">Core Market Positioning</span>
                 <h3 className="text-[54px] font-black leading-[0.85] tracking-tighter uppercase">{outputs.globalSolution?.split('.')[0] || "Strategic Market Dominance"}</h3>
                 <div className="flex justify-center items-center gap-10 pt-10 border-t border-white/10 max-w-2xl mx-auto">
                    <div className="text-right">
                       <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500">Focus ICP</span>
                       <p className="text-sm font-bold uppercase text-primary italic leading-none">{inputs.targetIcp?.[0]}</p> 
                    </div>
                    <div className="h-4 w-4 bg-primary rotate-45" />
                    <div className="text-left">
                       <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500">Focus Method</span>
                       <p className="text-sm font-bold uppercase text-primary italic leading-none">{outputs.valuePropTables?.[0]?.method.split(' ')[0] || 'Strategic Integration'}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* ICP Tables (L2/L3) */}
           <div className="space-y-24">
              {outputs.valuePropTables?.map((row, i) => (
                <div key={i} className="page-break-inside-avoid space-y-12">
                   <div className="flex items-center gap-6 justify-between border-b-4 border-black pb-4">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-black text-primary flex items-center justify-center font-black rounded-lg">0{i+1}</div>
                         <h4 className="text-3xl font-black uppercase tracking-tight">{row.icp}</h4>
                      </div>
                      <div className="px-5 py-2 bg-primary/10 border border-primary text-black font-black uppercase italic tracking-widest text-xs rounded-full">
                        {row.coreAngle} Strategy
                      </div>
                   </div>

                   <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="text-left p-6 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-tl-3xl">Strategic Lever</th>
                          <th className="text-left p-6 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-tr-3xl">Transformation Content</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="p-8 font-black uppercase text-[10px] tracking-widest text-gray-400 w-1/3">The High-Intent Outcome</td>
                          <td className="p-8 text-2xl font-black leading-tight bg-primary/5 italic">"{row.desiredOutcome}"</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="p-8 font-black uppercase text-[10px] tracking-widest text-gray-400 w-1/3">Critical Problem Friction</td>
                          <td className="p-8 text-sm font-bold leading-relaxed text-gray-700">{row.currentProblem}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="p-8 font-black uppercase text-[10px] tracking-widest text-gray-400 w-1/3">Competitive Displacement</td>
                          <td className="p-8 text-sm font-black text-red-500 line-through decoration-red-500 opacity-60">Replaces: {row.replacement}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="p-8 font-black uppercase text-[10px] tracking-widest text-primary w-1/3 italic">The Proprietary Method</td>
                          <td className="p-8 text-xl font-black uppercase underline underline-offset-8 decoration-primary italic">{row.method}</td>
                        </tr>
                      </tbody>
                   </table>

                   <div className="p-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] text-center max-w-2xl mx-auto">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-4">Tactical Logic: Why this wins</span>
                      <p className="text-lg font-bold leading-tight text-gray-800 italic">"{row.whyThisWins}"</p>
                   </div>
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
           <div className="grid grid-cols-2 gap-12">
              <div className="p-10 bg-black text-white rounded-[3rem] space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Aesthetic Identity</h4>
                 <div className="space-y-2">
                    <p className="text-4xl font-black uppercase leading-none tracking-tighter">High-Density <br />Precision</p>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Systematic Glassmorphism • Dynamic Micro-Animations • Minimalist Structuralism</p>
                 </div>
              </div>
              <div className="flex items-center gap-10">
                 <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full border-4 border-black shadow-lg" style={{ backgroundColor: inputs.primaryColor || '#000' }}></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Primary</span>
                 </div>
                 <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full border-4 border-gray-100 shadow-md" style={{ backgroundColor: inputs.secondaryColor || '#fff' }}></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Secondary</span>
                 </div>
                 <div className="h-16 w-px bg-gray-100 mx-4" />
                 <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Typography</span>
                    <p className="text-sm font-black uppercase tracking-tight italic">Inter / Outfit</p>
                 </div>
              </div>
           </div>

           {outputs.websitePrompt && (
             <div className="space-y-10">
                <div className="inline-block px-4 py-1.5 bg-gray-100 text-gray-400 text-[9px] font-black uppercase tracking-[0.3em] rounded">Layer 2: Structural Specification</div>
                <div className="p-10 border-2 border-black bg-white rounded-[3rem] relative shadow-xl">
                   <div className="absolute top-0 right-16 -translate-y-1/2 px-6 py-2 bg-black text-primary text-[11px] font-black uppercase tracking-[0.3em] rounded-full">Lead-Gen Architecture</div>
                   <div className="text-[13px] font-medium leading-relaxed text-gray-700 whitespace-pre-wrap columns-2 gap-16">
                     {outputs.websitePrompt}
                   </div>
                </div>
             </div>
           )}

           <div className="grid grid-cols-3 gap-8">
              {[
                { label: "UX Intent", value: "Frictionless navigation with high-density value delivery." },
                { label: "Mobile First", value: "Responsive structural integrity preserved across breakpoints." },
                { label: "CTA Strategy", value: "Primary conversion triggers placed at neural focus points." }
              ].map((item, i) => (
                <div key={i} className="p-8 border border-gray-100 rounded-3xl space-y-3">
                   <h5 className="text-[9px] font-black uppercase tracking-widest text-primary italic">{item.label}</h5>
                   <p className="text-[11px] font-medium leading-relaxed text-gray-600">{item.value}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 6. GTM STRATEGY (DISTRIBUTION MATRIX) */}
      <section className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-20">
          <span className="text-6xl font-black text-primary italic opacity-20">06</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black">Omnichannel Distribution Matrix</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tactical channel deployment per segment</div>
          </div>
        </div>

        <div className="space-y-20">
           {outputs.gtmStrategy?.leadGen.outreach.map((o: any, i: number) => (
             <div key={i} className="page-break-inside-avoid space-y-10">
                <div className="flex items-center gap-6 justify-between border-b-2 border-black pb-4">
                   <h4 className="text-2xl font-black uppercase tracking-tighter">Segment Activation: {o.icp}</h4>
                   <div className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Target size={14}/> Core Strategy
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-12">
                   {o.channelTips?.map((ct: any, j: number) => (
                     <div key={j} className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-black text-primary flex items-center justify-center rounded-2xl shadow-lg">
                              <Globe size={22} />
                           </div>
                           <div className="space-y-1">
                              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 italic">Primary Channel</span>
                              <p className="text-lg font-black uppercase tracking-tight">{ct.channel}</p>
                           </div>
                        </div>
                        <ul className="space-y-4">
                           {ct.tips?.map((tip: string, k: number) => (
                             <li key={k} className="text-[12px] font-bold leading-relaxed text-gray-700 flex items-start gap-4">
                                <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0 shadow-sm" />
                                {tip}
                             </li>
                           ))}
                        </ul>
                     </div>
                   ))}
                </div>

                <div className="p-10 border-2 border-black rounded-[3rem] bg-white grid grid-cols-2 gap-12 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-[0.03] -z-10"><Send size={120} /></div>
                   <div className="space-y-3">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Distribution Angles</h5>
                      <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-tight">
                         {o.angles?.map((angle: string, k: number) => (
                           <span key={k} className="px-3 py-1 bg-black text-white rounded-lg">{angle}</span>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-3">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Strategic Hooks</h5>
                      <div className="space-y-2">
                         {o.hooks?.map((hook: string, k: number) => (
                           <p key={k} className="text-[11px] font-bold leading-relaxed italic border-l-2 border-primary pl-4 text-gray-600">"{hook}"</p>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* 7. OUTREACH SYSTEM (PRESERVED SCRIPTS) */}
      <section className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-20">
          <span className="text-6xl font-black text-primary italic opacity-20">07</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black">Activation Sequences</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">High-Authority Lead Activation Loops</div>
          </div>
        </div>

        {outputs.outreachEngineOutput ? (
          <div className="space-y-24">
            <div className="p-16 bg-primary/10 border-2 border-primary rounded-[4rem] text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10"><Zap size={140} className="text-primary" /></div>
               <span className="text-[11px] font-black uppercase tracking-[0.6em] text-primary mb-6 block">The Activation Hook</span>
               <p className="text-4xl font-black leading-tight uppercase italic tracking-tighter">"{outputs.outreachEngineOutput.strategySummary}"</p>
            </div>

            <div className="grid grid-cols-1 gap-20">
              {outputs.outreachEngineOutput.linkedIn && (
                <div className="space-y-12">
                   <div className="flex items-center gap-6 justify-between border-b-2 border-black pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black text-primary flex items-center justify-center rounded-[1.25rem] shadow-xl">
                          <MessageSquare size={22} />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">LinkedIn Conversion Loop</h3>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 bg-gray-50 px-4 py-2 rounded-full">Social Infrastructure</span>
                   </div>

                   <div className="grid grid-cols-[1.5fr,1fr] gap-12">
                      <div className="space-y-6">
                         <div className="p-12 border-2 border-black bg-white rounded-[3rem] relative shadow-lg">
                            <span className="absolute top-0 left-12 -translate-y-1/2 px-5 py-2 bg-black text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Master Connection Request</span>
                            <p className="text-[15px] font-bold leading-relaxed italic border-l-8 border-primary pl-8 text-gray-800">
                               "{outputs.outreachEngineOutput.linkedIn.connectionRequest}"
                            </p>
                         </div>
                         <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 italic text-[11px] text-gray-500 font-medium leading-relaxed">
                            <h5 className="text-[8px] font-black uppercase tracking-widest text-primary mb-2 not-italic underline decoration-primary underline-offset-4">Strategic Logic</h5>
                            Low pressure, high authority. Focuses on peer-to-peer connection rather than sales friction.
                         </div>
                      </div>
                      <div className="space-y-6">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Follow-up Sequence</h4>
                         <div className="space-y-4">
                            {outputs.outreachEngineOutput.linkedIn.followUps?.map((f: string, i: number) => (
                              <div key={i} className="p-8 bg-black text-white rounded-[2.5rem] relative group border border-transparent hover:border-primary transition-all">
                                 <div className="absolute top-0 right-0 p-4 font-black italic text-4xl opacity-10 leading-none">0{i+1}</div>
                                 <p className="text-[12px] font-bold leading-relaxed italic text-gray-300">"{f}"</p>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {outputs.outreachEngineOutput.email && (
                <div className="space-y-12 pt-20 border-t-4 border-gray-50">
                   <div className="flex items-center gap-6 justify-between border-b-2 border-black pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary text-black flex items-center justify-center rounded-[1.25rem] shadow-xl">
                          <Mail size={22} />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Direct-Response Email Blitz</h3>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 bg-gray-50 px-4 py-2 rounded-full">Inbound Activation</span>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-12">
                      <div className="space-y-8">
                         <div className="p-12 border border-gray-200 bg-gray-50 rounded-[4rem] space-y-8 relative overflow-hidden group hover:border-black transition-all">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rotate-45 -z-10 transition-transform group-hover:scale-150 duration-700" />
                            <div className="space-y-2">
                               <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Priority Thread Strategy</span>
                               <h4 className="text-3xl font-black uppercase leading-tight tracking-tighter border-b-4 border-primary pb-4">Subject: {outputs.outreachEngineOutput.email.subjectLine}</h4>
                            </div>
                            <div className="text-[14px] leading-relaxed whitespace-pre-wrap font-medium text-gray-700 border-l border-gray-200 pl-10 pt-4">
                               {outputs.outreachEngineOutput.email.body}
                            </div>
                         </div>
                      </div>
                      <div className="space-y-8">
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">The Multi-Tap Sequence</h4>
                            <div className="space-y-4">
                               {outputs.outreachEngineOutput.email.followUps?.map((f: string, i: number) => (
                                 <div key={i} className="p-8 border-2 border-primary bg-primary/5 rounded-[2.5rem] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 px-4 py-1 bg-primary text-black text-[8px] font-black uppercase tracking-widest">Day +{ (i+1)*2 }</div>
                                    <p className="text-[11px] font-black text-gray-900 leading-tight italic">"{f}"</p>
                                 </div>
                               ))}
                            </div>
                         </div>
                         <div className="p-8 bg-black text-white rounded-3xl space-y-2">
                            <span className="text-[8px] font-black uppercase tracking-widest text-primary">Technical Tip</span>
                            <p className="text-[10px] font-bold leading-relaxed text-gray-400">Ensure SPF/DKIM/DMARC records are authenticated before initiation.</p>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border-4 border-dashed border-gray-100 rounded-[4rem]">
             <Activity className="animate-pulse text-gray-200 mb-4" size={48} />
             <p className="text-gray-400 italic font-black uppercase tracking-[0.3em] text-xs">Waiting for sequence activation data</p>
          </div>
        )}
      </section>

      {/* 8. HIGH-CONVERSION LEAD MAGNETS (PREMIUM ASSETS) */}
      <section className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-20">
          <span className="text-6xl font-black text-primary italic opacity-20">08</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black">Strategic Conversion Assets</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Designed high-value lead magnets</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {outputs.gtmStrategy?.leadMagnets?.map((m: any, i: number) => (
            <div key={i} className="page-break-inside-avoid border-2 border-black p-12 rounded-[3.5rem] relative overflow-hidden bg-white hover:shadow-2xl transition-all group">
               <div className="absolute top-4 right-16 text-[140px] font-black text-gray-50 -z-10 group-hover:text-primary/10 transition-colors uppercase leading-none italic">{i + 1}</div>
               
               <div className="grid grid-cols-[1.5fr,2fr] gap-16">
                  <div className="space-y-10 flex flex-col justify-between">
                     <div className="space-y-6">
                        <div className="inline-block px-5 py-2 bg-black text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full group-hover:bg-primary group-hover:text-black transition-colors">
                          {m.format}
                        </div>
                        <h4 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">{m.title}</h4>
                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                           <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Target Persona</p>
                           <p className="text-sm font-bold text-black">{m.targetICP}</p>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-1">
                           <span className="text-[9px] font-black uppercase tracking-widest text-primary italic">Projected Market Value</span>
                           <div className="text-4xl font-black text-black tracking-tighter italic">${m.value?.replace(/[^0-9]/g, '') || '5,000'}+</div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="px-6 py-3 bg-black text-primary text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-lg group-hover:shadow-primary/20">
                              {m.cta}
                           </div>
                           <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                              <ExternalLink size={20} />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-12 p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                     <div className="space-y-3">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-2">Problem To Solved</h5>
                        <p className="text-sm font-bold text-gray-800 italic leading-relaxed">"{m.problem}"</p>
                     </div>
                     <div className="space-y-3">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-2">The Transformation Logic</h5>
                        <p className="text-base font-black uppercase underline decoration-primary underline-offset-8 leading-tight">{m.outcome}</p>
                     </div>
                     <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Deliverables Included</h5>
                        <div className="grid grid-cols-1 gap-3">
                           {m.contents?.map((content: string, idx: number) => (
                             <div key={idx} className="text-[11px] font-bold leading-tight flex items-center gap-4 text-gray-600 bg-white p-4 rounded-xl shadow-sm border border-gray-50">
                                <CheckCircle2 size={16} className="text-primary shrink-0" />
                                {content}
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

      {/* 9. 90-DAY EXECUTION ROADMAP (MATRIX) */}
      <section className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-24">
          <span className="text-6xl font-black text-primary italic opacity-20">09</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black">Strategic Execution Matrix</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">90-Day implementation roadmap</div>
          </div>
        </div>

        <div className="space-y-12">
           <div className="bg-black text-white p-16 rounded-[4rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5"><Calendar size={180} /></div>
              <div className="max-w-xl space-y-6">
                 <span className="text-[11px] font-black uppercase tracking-[0.8em] text-primary italic">Campaign Goal</span>
                 <h3 className="text-5xl font-black uppercase leading-[0.9] tracking-tighter">Full System <br/>Integration & <br/>Scale</h3>
                 <div className="h-2 w-32 bg-primary"></div>
                 <p className="text-sm font-medium text-gray-400 leading-relaxed uppercase tracking-widest">The following roadmap outlines the technical and tactical benchmarks required for market dominance.</p>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-4">
              {[
                { week: "01", title: "Infrastructure & Positioning", items: ["Complete LinkedIn transformation", "CRM and tracking integration", "Lead Magnet asset finalization", "Target sequence setup"] },
                { week: "02", title: "Channel Activation Blitz", items: ["Launch connection request sequences", "Activate primary Email threads", "Scale initial 1:1 engagement hooks", "Initial performance data extraction"] },
                { week: "04", title: "Optimization & Conversion", items: ["A/B test subject line performance", "Refine ICP specific angles", "Abtract engagement into appointments", "Partner-led component activation"] },
                { week: "08", title: "Scale Elevation", items: ["Scale high-reply channels (+200%)", "Implement semi-automated follow-ups", "Event-led growth initiation", "Strategic quarterly review"] }
              ].map((step, i) => (
                <div key={i} className="group flex items-stretch gap-10 p-1 border-b border-gray-100 last:border-b-0">
                   <div className="w-32 bg-gray-50 flex flex-col items-center justify-center p-8 transition-colors group-hover:bg-primary shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black mb-1">Week</span>
                      <span className="text-4xl font-black italic tracking-tighter group-hover:text-black">{step.week}</span>
                   </div>
                   <div className="flex-1 py-10 flex items-center justify-between group-hover:pl-4 transition-all pr-12">
                      <div className="space-y-2">
                         <h4 className="text-2xl font-black uppercase tracking-tighter">{step.title}</h4>
                      </div>
                      <div className="flex gap-4">
                         {step.items.map((item, j) => (
                           <div key={j} className="h-2 w-2 rounded-full bg-gray-200 group-hover:bg-primary transition-colors" />
                         ))}
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 10. SYSTEM VIEW (NEW VISUAL FLOW) */}
      <section className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white flex flex-col justify-center">
        <div className="flex items-baseline gap-6 mb-24 justify-center">
          <span className="text-6xl font-black text-primary italic opacity-20">10</span>
          <div className="space-y-2 text-center">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-black text-center">System Integration View</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">End-to-end strategic flow</div>
          </div>
        </div>

        <div className="relative space-y-32 before:absolute before:left-1/2 before:top-10 before:bottom-10 before:w-1 before:bg-gray-50 before:-translate-x-1/2 before:-z-10">
           <div className="grid grid-cols-2 gap-32">
              <div className="text-right space-y-4">
                 <div className="p-10 bg-black text-white rounded-[3rem] inline-block shadow-2xl">
                    <Target size={40} className="text-primary ml-auto mb-6" />
                    <h4 className="text-4xl font-black uppercase tracking-tighter italic">ICP Selection</h4>
                    <p className="text-[11px] font-bold text-gray-400 leading-tight tracking-[0.2em] mt-4 uppercase">Hyper-Targeted <br/>Segments</p>
                 </div>
              </div>
              <div className="self-center">
                 <p className="text-xs font-black uppercase tracking-[0.4em] text-primary italic">Step 01</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-32">
              <div className="col-start-2 space-y-4">
                 <div className="p-10 border-4 border-black bg-white rounded-[3rem] inline-block shadow-2xl">
                    <Layers size={40} className="text-primary mb-6" />
                    <h4 className="text-4xl font-black uppercase tracking-tighter italic">Positioning</h4>
                    <p className="text-[11px] font-bold text-gray-400 leading-tight tracking-[0.2em] mt-4 uppercase">Authority Driven <br/>Messages</p>
                 </div>
              </div>
              <div className="col-start-1 row-start-1 self-center text-right order-first">
                 <p className="text-xs font-black uppercase tracking-[0.4em] text-primary italic">Step 02</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-32">
              <div className="text-right space-y-4">
                 <div className="p-10 bg-primary text-black rounded-[3rem] inline-block shadow-2xl">
                    <Layout size={40} className="mb-6 opacity-40" />
                    <h4 className="text-4xl font-black uppercase tracking-tighter italic">Conversion</h4>
                    <p className="text-[11px] font-black text-black/50 leading-tight tracking-[0.2em] mt-4 uppercase">Systematic Funnel <br/>Activation</p>
                 </div>
              </div>
              <div className="self-center">
                 <p className="text-xs font-black uppercase tracking-[0.4em] text-primary italic">Step 03</p>
              </div>
           </div>
        </div>
      </section>

      {/* 11. APPENDIX (MANDATORY ZERO DATA LOSS) */}
      <section className="min-h-[29.7cm] p-[2cm] page-break-after-always bg-white">
        <div className="flex items-baseline gap-6 mb-20 border-b-2 border-gray-100 pb-12">
          <span className="text-6xl font-black text-gray-100 italic">AP</span>
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.6em] text-gray-400 italic">Strategic Appendix</h2>
            <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Supplemental framework logic & raw data</div>
          </div>
        </div>

        <div className="space-y-16">
           <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary underline underline-offset-8">Raw Market Logic</h3>
              <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 space-y-8 text-[12px] font-medium leading-relaxed text-gray-600">
                 <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-4">
                       <h4 className="text-[9px] font-black uppercase text-black">Company Mission Context</h4>
                       <p>{inputs.context}</p>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-[9px] font-black uppercase text-black">Primary Target ICP Context</h4>
                       <p>{inputs.targetIcp?.join(', ')}</p>
                    </div>
                 </div>
                 <div className="pt-8 border-t border-gray-200">
                    <h4 className="text-[9px] font-black uppercase text-black mb-4">Lead Magnet Strategic Alignment</h4>
                    <p>{outputs.gtmStrategy?.strategicNarrative}</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-12">
              <div className="space-y-6">
                 <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary underline underline-offset-8">Output Metadata</h3>
                 <div className="p-8 border border-gray-100 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                       <span className="text-[9px] font-black uppercase text-gray-400">Total Segments</span>
                       <span className="text-xs font-black">{outputs.icps?.length}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                       <span className="text-[9px] font-black uppercase text-gray-400">Assets Generated</span>
                       <span className="text-xs font-black">{ (outputs.gtmStrategy?.leadMagnets?.length || 0) + (outputs.valuePropTables?.length || 0) }</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                       <span className="text-[9px] font-black uppercase text-gray-400">Campaign Logic</span>
                       <span className="text-xs font-black italic">{state.inputs.outreachAngle}</span>
                    </div>
                 </div>
              </div>
              <div className="space-y-6">
                 <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary underline underline-offset-8">Release Authorization</h3>
                 <div className="p-8 bg-black text-white rounded-3xl space-y-6 flex flex-col justify-center h-full">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-primary text-black flex items-center justify-center font-black">OK</div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Document authenticated for client release.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <footer className="mt-40 text-center border-t border-gray-100 pt-10">
           <p className="text-[9px] font-black uppercase tracking-[1em] text-gray-300">Confidential © {new Date().getFullYear()} Myntmore Advisory Group</p>
        </footer>
      </section>

      {/* 12. CONNECT & EXPLORE (PREMIUM RESOURCE HUB) */}
      <section className="min-h-[29.7cm] p-[2cm] page-break-before-always bg-white flex flex-col items-center justify-center text-center">
        <div className="flex items-baseline gap-6 mb-16 justify-center">
          <span className="text-6xl font-black text-primary italic opacity-20">12</span>
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
              desc: "Connect with the founder",
              href: "https://www.linkedin.com/in/tejasjhaveri/"
            },
            {
              icon: <Image size={32} className="group-hover:text-black transition-colors" />,
              title: "Instagram",
              desc: "Behind the scenes & insights",
              href: "https://www.instagram.com/tejas_jhaveri/"
            },
            {
              icon: <Calendar size={32} className="group-hover:text-black transition-colors" />,
              title: "Book a Call",
              desc: "Schedule a strategy session",
              href: "https://calendly.com/founder-myntmore/30min?month=2026-03"
            },
            {
              icon: <Mail size={32} className="group-hover:text-black transition-colors" />,
              title: "Newsletter",
              desc: "Get weekly growth insights",
              href: "https://myntmore.com/website-newsletter/"
            },
            {
              icon: <Layers size={32} className="group-hover:text-black transition-colors" />,
              title: "Core Services",
              desc: "Explore Myntmore offerings",
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
