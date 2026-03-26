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
  X
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
    <div id="strategy-report" className="bg-white text-black p-[2cm] w-[21cm] min-h-[29.7cm] mx-auto shadow-2xl print:shadow-none print:m-0 print:p-[1.5cm] font-sans selection:bg-yellow-200 antialiased">
      
      {/* 1. PREMIUM COVER PAGE */}
      <section className="h-[25.7cm] flex flex-col justify-between border-t-[16px] border-black pt-20 pb-12 mb-12 page-break-after-always">
        <div className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black text-primary flex items-center justify-center font-black text-3xl">M</div>
            <div className="flex flex-col">
              <span className="font-black tracking-[0.2em] text-sm uppercase">Myntmore</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Strategic Advisory Group</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-black uppercase tracking-[0.3em] text-primary">
              Private & Confidential
            </div>
            <h1 className="text-[84px] font-black leading-[0.85] uppercase tracking-tighter text-black mt-4">
              Growth <br />
              <span className="text-gray-300">Playbook</span>
            </h1>
            <div className="h-1 w-48 bg-primary"></div>
          </div>

          <div className="max-w-xl">
             <p className="text-2xl font-black uppercase tracking-tight leading-tight text-gray-800">
                {outputs.globalSolution?.split('.')[0] || `The ${inputs.brandName} Growth Engine`}
             </p>
             <p className="text-sm text-gray-500 mt-4 leading-relaxed font-medium">
               A comprehensive multi-channel distribution strategy designed for {inputs.brandName} to dominate the {inputs.targetIcp?.[0] || 'market'} segment.
             </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-20 border-t border-gray-100 pt-12">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Client / Organization</p>
            <p className="text-2xl font-black uppercase tracking-tight">{inputs.brandName || "Workshop Client"}</p>
            <p className="text-sm font-bold text-gray-400">{inputs.fullName}</p>
          </div>
          <div className="space-y-2 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Release Date</p>
            <p className="text-2xl font-black tracking-tighter">{date}</p>
            <p className="text-sm font-bold text-primary italic uppercase tracking-wider">v1.0 Strategic Release</p>
          </div>
        </div>
      </section>

      {/* 2. EXECUTIVE SUMMARY */}
      <section className="py-20 border-b border-gray-100 page-break-inside-avoid">
        <div className="flex items-baseline gap-4 mb-12">
          <span className="text-4xl font-black text-primary italic opacity-30">01</span>
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-black">Client Infrastructure</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Core Value Proposition</h3>
            <p className="text-xl font-bold leading-tight text-gray-800 italic">"{outputs.globalSolution?.split('\n\n')[0] || inputs.offer}"</p>
          </div>
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Market Focus</h3>
              <p className="text-sm font-black uppercase tracking-tight">{inputs.targetIcp?.join(' • ')}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Strategic Tone</h3>
              <div className="flex gap-2">
                 {state.inputs.tonePreference?.map((tone: string, i: number) => (
                   <span key={i} className="px-3 py-1 bg-gray-50 border border-gray-100 text-[9px] font-black uppercase tracking-widest">{tone}</span>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ICP BREAKDOWN (PREMIUM CARDS) */}
      <section className="py-20 border-b border-gray-100 page-break-before-always">
        <div className="flex items-baseline gap-4 mb-16">
          <span className="text-4xl font-black text-primary italic opacity-30">02</span>
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-black">Target ICP Segments</h2>
        </div>
        <div className="space-y-16">
          {outputs.icps?.map((icp, i) => (
            <div key={i} className="page-break-inside-avoid relative">
              <div className="absolute -left-8 top-0 text-6xl font-black text-gray-50 -z-10">{i + 1}</div>
              <div className="grid grid-cols-[1fr,2fr] gap-12">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{icp.name}</h3>
                  <div className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] w-fit">Primary Segment</div>
                </div>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Context & Psychographics</h4>
                    <p className="text-sm leading-relaxed text-gray-600 font-medium">{icp.whoTheyAre}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Core Pain Points</h4>
                       <ul className="space-y-2">
                         {icp.painPoints?.slice(0, 4).map((p, j) => (
                           <li key={j} className="text-[11px] leading-snug flex items-start gap-2">
                             <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                             <span className="font-bold text-gray-700">{p}</span>
                           </li>
                         ))}
                       </ul>
                    </div>
                    <div className="space-y-3">
                       <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Key Triggers</h4>
                       <p className="text-[11px] font-medium leading-relaxed italic text-gray-500">{icp.triggers}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. VALUE PROPOSITION TABLE (HIGH DENSITY) */}
      <section className="py-20 border-b border-gray-100 page-break-before-always text-center">
        <div className="flex items-baseline gap-4 mb-20 justify-center flex-col items-center">
          <span className="text-4xl font-black text-primary italic opacity-30">03</span>
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-black">Strategic Positioning Engine</h2>
        </div>
        <div className="space-y-12 text-left">
          {outputs.valuePropTables?.map((row, i) => (
            <div key={i} className="page-break-inside-avoid border-2 border-black rounded-lg overflow-hidden bg-white shadow-xl">
              <div className="bg-black text-white px-8 py-5 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 mb-1">Positioning Angle</span>
                  <span className="text-lg font-black uppercase tracking-tight">{row.icp}</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 mb-1">Strategic Framework</span>
                  <div className="text-primary font-black uppercase italic tracking-widest text-sm">{row.coreAngle}</div>
                </div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-10 space-y-8 border-r border-gray-100">
                   <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">The Desired Outcome</h4>
                      <p className="text-base font-black leading-tight bg-primary/10 p-5 border-l-4 border-primary">"{row.desiredOutcome}"</p>
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">The Critical Problem</h4>
                      <p className="text-sm font-medium leading-relaxed text-gray-600">{row.currentProblem}</p>
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Inefficient Alternatives</h4>
                      <p className="text-sm font-bold text-red-700/60 flex items-center gap-2">
                        <X size={12} className="shrink-0" />
                        <span className="italic">Replaces: {row.replacement}</span>
                      </p>
                   </div>
                </div>
                <div className="p-10 space-y-8 bg-gray-50/50">
                   <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">The Proprietary Method</h4>
                      <p className="text-base font-black leading-tight uppercase italic underline decoration-primary underline-offset-4">{row.method}</p>
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Strategic Advantage</h4>
                      <p className="text-sm font-bold text-gray-800 leading-relaxed border-t border-gray-200 pt-4 flex gap-3">
                         <TrendingUp size={16} className="text-primary shrink-0" />
                         {row.whyThisWins}
                      </p>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WEBSITE STRATEGY (TECHNICAL SPEC) */}
      <section className="py-20 border-b border-gray-100 page-break-before-always">
        <div className="flex items-baseline gap-4 mb-16">
          <span className="text-4xl font-black text-primary italic opacity-30">04</span>
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-black">Website Conversion Blueprint</h2>
        </div>
        {outputs.websitePrompt && (
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-12">
               <div className="p-8 bg-black text-white rounded-3xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary italic">Visual Direction</h4>
                  <div className="space-y-2">
                     <p className="text-3xl font-black uppercase leading-none">High-Density <br />Premium</p>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Systematic Glassmorphism • Dynamic Hover States • Minimalist Structuralism</p>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-1">
                     <div className="w-12 h-12 rounded-full border-2 border-primary bg-bg" style={{ backgroundColor: inputs.primaryColor || '#000' }}></div>
                     <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Primary</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                     <div className="w-12 h-12 rounded-full border-2 border-border bg-bg" style={{ backgroundColor: inputs.secondaryColor || '#fff' }}></div>
                     <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Secondary</span>
                  </div>
               </div>
            </div>

            <div className="p-10 border border-gray-200 bg-gray-50 rounded-[2rem] relative">
              <div className="absolute top-0 right-10 -translate-y-1/2 px-4 py-1 bg-black text-primary text-[10px] font-black uppercase tracking-widest">Structural Prompt</div>
              <div className="text-[11px] font-mono leading-relaxed text-gray-600 whitespace-pre-wrap">
                {outputs.websitePrompt}
              </div>
              <div className="mt-8 text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">End of Structural Specification</div>
            </div>
          </div>
        )}
      </section>

      {/* 6. PROFILE OPTIMIZATION (INFLUENCE ENGINE) */}
      <section className="py-20 border-b border-gray-100 page-break-before-always">
        <div className="flex items-baseline gap-4 mb-20">
          <span className="text-4xl font-black text-primary italic opacity-30">05</span>
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-black">Executive Presence Engine</h2>
        </div>
        <div className="space-y-12">
           <div className="bg-black text-white p-12 rounded-[2rem] space-y-10">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Headline</h4>
                 <p className="text-3xl font-black leading-tight uppercase tracking-tight">{outputs.optimizedHeadlines?.[0]}</p>
              </div>
              <div className="grid grid-cols-2 gap-12 pt-10 border-t border-white/10">
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Positioning Pivot</h4>
                    <p className="text-sm font-bold italic leading-relaxed">"{outputs.positioningAngles}"</p>
                 </div>
                 <div className="flex items-center justify-end gap-6 text-right">
                    <div className="space-y-1">
                       <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Influence Score</span>
                       <div className="text-5xl font-black italic text-primary">{outputs.profileClarityScore}</div>
                    </div>
                    <div className="h-12 w-px bg-white/10"></div>
                 </div>
              </div>
           </div>

           <div className="p-12 border border-gray-100 bg-white shadow-lg rounded-[2rem]">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-8 underline decoration-primary underline-offset-8 font-bold">Consulting-Grade 'About' Narrative</h4>
              <div className="grid grid-cols-2 gap-12 text-xs leading-relaxed font-medium text-gray-600 whitespace-pre-wrap">
                 <div>{outputs.optimizedAbout?.split('\n\n').slice(0, Math.ceil((outputs.optimizedAbout?.split('\n\n').length || 0) / 2)).join('\n\n')}</div>
                 <div>{outputs.optimizedAbout?.split('\n\n').slice(Math.ceil((outputs.optimizedAbout?.split('\n\n').length || 0) / 2)).join('\n\n')}</div>
              </div>
           </div>
        </div>
      </section>

      {/* 7. GTM STRATEGY (DISTRIBUTION MATRIX) */}
      <section className="py-20 border-b border-gray-100 page-break-before-always">
        <div className="flex items-baseline gap-4 mb-16">
          <span className="text-4xl font-black text-primary italic opacity-30">06</span>
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-black">Omnichannel Distribution Matrix</h2>
        </div>
        <div className="grid grid-cols-3 gap-8">
           {outputs.gtmStrategy?.leadGen.outreach.map((o: any, i: number) => (
             <div key={i} className="p-8 bg-black text-white rounded-3xl space-y-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 italic leading-tight">Segment: <br />{o.icp}</h4>
                  <div className="space-y-6">
                    {o.channelTips?.map((ct: any, j: number) => (
                      <div key={j} className="space-y-2">
                        <span className="px-2 py-0.5 bg-white/10 rounded flex items-center gap-2 w-fit">
                           <Globe size={10} className="text-primary" />
                           <span className="text-[8px] font-black uppercase tracking-widest">{ct.channel}</span>
                        </span>
                        <ul className="space-y-2 pt-1 border-l border-white/10 pl-3">
                          {ct.tips?.map((tip: string, k: number) => (
                            <li key={k} className="text-[9px] font-medium leading-tight text-gray-400 italic">
                               {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* 8. HIGH-CONVERSION LEAD MAGNETS (PREMIUM ASSETS) */}
      <section className="py-20 border-b border-gray-100 page-break-before-always text-center">
        <div className="flex items-baseline gap-4 mb-20 justify-center flex-col items-center">
          <span className="text-4xl font-black text-primary italic opacity-30">07</span>
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-black">Strategic Conversion Assets</h2>
        </div>
        <div className="grid grid-cols-1 gap-10 text-left">
          {outputs.gtmStrategy?.leadMagnets?.map((m: LeadMagnet, i: number) => (
            <div key={i} className="page-break-inside-avoid border-2 border-black p-12 rounded-[2.5rem] relative overflow-hidden bg-white hover:shadow-2xl transition-all">
               <div className="absolute top-0 right-12 translate-y-[-10%] text-[120px] font-black text-gray-50 -z-10">{i + 1}</div>
               <div className="grid grid-cols-[1.5fr,2fr] gap-16">
                  <div className="space-y-6">
                     <div className="inline-block px-4 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-full">
                       {m.format}
                     </div>
                     <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">{m.title}</h4>
                     <p className="text-[10px] font-black uppercase text-primary tracking-widest">Designed for: {m.targetICP}</p>
                     <div className="pt-6 border-t border-gray-100 space-y-4">
                        <div className="space-y-1">
                           <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Projected Market Value</span>
                           <div className="text-2xl font-black text-emerald-500">{m.value}</div>
                        </div>
                        <div className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest w-fit rounded-lg">
                           {m.cta}
                        </div>
                     </div>
                  </div>
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <h5 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Strategic Core Problem</h5>
                        <p className="text-sm font-bold text-gray-800 italic leading-relaxed">"{m.problem}"</p>
                     </div>
                     <div className="space-y-2">
                        <h5 className="text-[9px] font-black uppercase tracking-widest text-gray-400">The Transformation Outcome</h5>
                        <p className="text-sm font-black uppercase underline decoration-primary underline-offset-4">{m.outcome}</p>
                     </div>
                     <div className="space-y-3">
                        <h5 className="text-[9px] font-black uppercase tracking-widest text-gray-300 font-bold">Consulting Deliverables Included</h5>
                        <ul className="grid grid-cols-2 gap-4">
                           {m.contents?.map((content, idx) => (
                             <li key={idx} className="text-[10px] font-medium leading-tight flex items-center gap-2 text-gray-500">
                                <div className="w-1 h-1 bg-black rounded-full shrink-0" />
                                {content}
                             </li>
                           ))}
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. OUTREACH ENGINE (SEQUENCING) */}
      <section className="py-20 border-b border-gray-100 page-break-before-always text-center">
        <div className="flex items-baseline gap-4 mb-20 flex-col items-center">
          <span className="text-4xl font-black text-primary italic opacity-30">08</span>
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-black">Activation Sequences</h2>
        </div>
        
        {outputs.outreachEngineOutput ? (
          <div className="space-y-20 text-left">
            <div className="max-w-3xl mx-auto space-y-4 text-center">
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 mb-4 block">The Strategic Narrative Hook</span>
               <p className="text-4xl font-black leading-tight uppercase tracking-tighter italic">"{outputs.outreachEngineOutput.strategySummary}"</p>
            </div>

            <div className="grid grid-cols-1 gap-16">
              {outputs.outreachEngineOutput.linkedIn && (
                <div className="space-y-10">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-black text-primary flex items-center justify-center">
                        <MessageSquare size={18} />
                     </div>
                     <h3 className="text-xl font-black uppercase tracking-tighter">LinkedIn Conversion Loop</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="p-10 border-2 border-primary bg-primary/5 rounded-[2.5rem] space-y-4">
                        <span className="text-[9px] font-black uppercase text-primary tracking-widest">Master Connection Hook</span>
                        <p className="text-sm font-bold leading-relaxed italic border-l-4 border-primary pl-6">
                           "{outputs.outreachEngineOutput.linkedIn.connectionRequest}"
                        </p>
                     </div>
                     <div className="space-y-4">
                        {outputs.outreachEngineOutput.linkedIn.followUps?.map((f, i) => (
                          <div key={i} className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">
                             <span className="text-[8px] font-black uppercase text-gray-300 tracking-[0.3em] mb-2 block text-right">Sequence Drop {i + 1}</span>
                             <p className="text-[11px] font-medium leading-relaxed italic text-gray-600">"{f}"</p>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              )}

              {outputs.outreachEngineOutput.email && (
                <div className="space-y-10 pt-12 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center">
                        <Mail size={18} />
                     </div>
                     <h3 className="text-xl font-black uppercase tracking-tighter">Direct-Response Email Blitz</h3>
                  </div>
                  <div className="grid grid-cols-[2fr,1fr] gap-12">
                     <div className="p-10 border-2 border-black rounded-[2.5rem] space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[8px] font-black uppercase tracking-[0.2em]">Priority Thread</div>
                        <div className="space-y-1">
                           <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Subject Line Analysis</span>
                           <p className="text-lg font-black uppercase underline decoration-primary underline-offset-8 italic">{outputs.outreachEngineOutput.email.subjectLine}</p>
                        </div>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-gray-600 border-l border-gray-100 pl-8 pt-4">
                           {outputs.outreachEngineOutput.email.body}
                        </div>
                     </div>
                     <div className="space-y-4">
                        {outputs.outreachEngineOutput.email.followUps?.map((f, i) => (
                          <div key={i} className="p-6 bg-primary/5 border-l-4 border-primary rounded-xl">
                             <span className="text-[8px] font-black uppercase text-primary tracking-widest mb-2 block font-bold">Follow-up {i + 1}</span>
                             <p className="text-[11px] font-medium leading-tight text-gray-700">{f}</p>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 italic font-medium uppercase tracking-[0.3em] text-xs">Awaiting Activation Sequence Generation</p>
        )}
      </section>

      {/* 10. 90-DAY ROADMAP (EXECUTIVE) */}
      <section className="py-20 border-b-[20px] border-black page-break-before-always text-center">
        <div className="flex items-baseline gap-4 mb-20 justify-center flex-col items-center">
          <span className="text-4xl font-black text-primary italic opacity-30">09</span>
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-black">Strategic Execution Matrix</h2>
        </div>
        <div className="space-y-16 relative before:absolute before:left-12 before:top-4 before:bottom-4 before:w-px before:bg-gray-100 before:border-l before:border-dashed before:border-gray-300 text-left">
           {[
             { title: "Foundation & System Overhaul", week: "01", desc: "Technical system implementation, tracking activation, and LinkedIn infrastructure optimization." },
             { title: "Multi-Channel Blitz Activation", week: "02", desc: "Launching connection request sequences, primary email threads, and activating initial 1:1 hooks." },
             { title: "Scale & Revenue Optimization", week: "04", desc: "Segment performance analysis, scaling high-reply channels, and activating partner-led components." }
           ].map((step, i) => (
             <div key={i} className="relative pl-32 page-break-inside-avoid">
               <div className="absolute left-0 top-0 w-24 h-24 bg-black text-primary flex items-center justify-center font-black text-2xl group transition-all">
                  W<span className="text-white italic">{step.week}</span>
               </div>
               <div className="space-y-2 py-4">
                 <h4 className="text-2xl font-black uppercase tracking-tighter leading-none">{step.title}</h4>
                 <p className="text-sm text-gray-500 leading-relaxed font-medium max-w-lg">{step.desc}</p>
               </div>
             </div>
           ))}
        </div>
      </section>

      <footer className="pt-24 text-center pb-12">
        <div className="flex justify-center gap-6 mb-8">
           <div className="w-1 h-1 rounded-full bg-black"></div>
           <div className="w-1 h-1 rounded-full text-primary italic font-black">M</div>
           <div className="w-1 h-1 rounded-full bg-black"></div>
        </div>
        <div className="space-y-4">
          <p className="text-[9px] font-black uppercase tracking-[0.8em] text-gray-300">End of Strategic Specification</p>
          <div className="flex justify-center gap-12 mt-12 opacity-30 grayscale saturate-0">
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-black"></div>
                <span className="text-[8px] font-black uppercase tracking-widest text-black">M. Workshop</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
