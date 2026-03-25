import { Target, Zap, TrendingUp, Layers, Mail, Calendar, MessageSquare, ChevronRight, Layout, UserCircle } from 'lucide-react';
import { WorkshopState } from '../App';

interface StrategyReportProps {
  state: WorkshopState;
}

export const StrategyReport = ({ state }: StrategyReportProps) => {
  const { inputs, outputs } = state;
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div id="strategy-report" className="bg-white text-black p-[2cm] w-[21cm] min-h-[29.7cm] mx-auto shadow-2xl print:shadow-none print:m-0 print:p-[1cm] font-sans selection:bg-yellow-200">
      {/* 1. COVER PAGE */}
      <section className="h-[25.7cm] flex flex-col justify-between border-b-4 border-black pb-12 mb-12 page-break-after-always">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-2xl">M</div>
            <span className="font-black tracking-tighter text-2xl uppercase">Myntmore Workshop</span>
          </div>
          <h1 className="text-7xl font-black mb-6 leading-[0.9] uppercase tracking-tight">
            B2B Lead Generation <br />
            <span className="text-primary italic">Strategy Report</span>
          </h1>
          <div className="h-2 w-32 bg-primary mb-12"></div>
          <p className="text-2xl font-bold text-gray-800 max-w-2xl mb-4">
            {outputs.globalSolution?.split('.')[0] || "Strategic engine for " + inputs.brandName}
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Prepared For</p>
              <p className="text-2xl font-black uppercase">{inputs.brandName || inputs.fullName}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Date</p>
              <p className="text-xl font-bold">{date}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CLIENT OVERVIEW */}
      <section className="py-12 border-b border-gray-100 page-break-inside-avoid">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
          <div className="w-4 h-4 bg-black"></div> 01 | Client Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-sm font-bold uppercase text-gray-400 mb-2">Core Offer</h3>
            <p className="text-lg font-medium leading-relaxed">{inputs.offer}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase text-gray-400 mb-2">Primary Target</h3>
            <p className="text-lg font-medium leading-relaxed">{inputs.targetIcp.join(', ')}</p>
          </div>
        </div>
      </section>

      {/* 3. ICP BREAKDOWN */}
      <section className="py-12 border-b border-gray-100 page-break-before-always">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-2">
          <div className="w-4 h-4 bg-black"></div> 02 | Strategic ICP Breakdown
        </h2>
        <div className="space-y-12">
          {outputs.icps?.map((icp, i) => (
            <div key={i} className="page-break-inside-avoid border-l-4 border-black pl-8">
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">{icp.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div>
                  <h4 className="font-bold text-xs uppercase text-gray-400 mb-2">Context</h4>
                  <p className="leading-relaxed">{icp.whoTheyAre}</p>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase text-gray-400 mb-2">Pain Points</h4>
                  <ul className="space-y-1">
                    {icp.painPoints.slice(0, 5).map((p, j) => (
                      <li key={j} className="flex gap-2 text-gray-600">
                        <span className="text-black font-bold">/</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. VALUE PROPOSITION TABLE */}
      <section className="py-12 border-b border-gray-100 page-break-before-always">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-2">
          <div className="w-4 h-4 bg-black"></div> 03 | Value Proposition Engine
        </h2>
        <div className="space-y-8">
          {outputs.valuePropTables?.map((row, i) => (
            <div key={i} className="page-break-inside-avoid border border-black rounded-xl overflow-hidden">
              <div className="bg-black text-white p-4 font-black uppercase tracking-widest text-xs flex justify-between items-center">
                <span>{row.icp} | Strategic Value Prop</span>
                <span className="italic text-primary">{row.coreAngle}</span>
              </div>
              <div className="p-8 grid grid-cols-2 gap-12 text-[11px] leading-relaxed">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-black uppercase text-gray-400 mb-2 tracking-tighter">Desired Outcome</h4>
                    <p className="font-bold text-sm bg-primary/5 p-3 border-l-2 border-black">{row.desiredOutcome}</p>
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-gray-400 mb-2 tracking-tighter">Current Problem</h4>
                    <p className="text-gray-700">{row.currentProblem}</p>
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-gray-400 mb-2 tracking-tighter">What They Replace</h4>
                    <p className="text-red-800 italic line-through decoration-red-900/30">{row.replacement}</p>
                  </div>
                </div>
                <div className="space-y-6 border-l border-gray-100 pl-12 bg-gray-50/50">
                  <div>
                    <h4 className="font-black uppercase text-gray-400 mb-2 tracking-tighter">Your Method</h4>
                    <p className="font-black text-sm italic">"{row.method}"</p>
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-gray-400 mb-2 tracking-tighter text-primary">Why This Wins</h4>
                    <p className="font-medium text-gray-800 underline decoration-primary/30 underline-offset-4">{row.whyThisWins || "Unique mechanism creates non-generic authority."}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WEBSITE STRATEGY */}
      <section className="py-12 border-b border-gray-100 page-break-before-always">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-2">
          <div className="w-4 h-4 bg-black"></div> 04 | Website Conversion Assets
        </h2>
        {outputs.websitePrompt && (
          <div className="p-8 bg-gray-50 border border-black rounded-lg">
             <div className="prose prose-sm max-w-none prose-headings:uppercase prose-headings:font-black prose-headings:tracking-widest">
                <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-gray-700">
                  {outputs.websitePrompt.substring(0, 1500)}...
                </pre>
             </div>
          </div>
        )}
      </section>

      {/* 6. PROFILE OPTIMIZATION */}
      <section className="py-12 border-b border-gray-100 page-break-before-always">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-2">
          <div className="w-4 h-4 bg-black"></div> 05 | LinkedIn Authority Growth
        </h2>
        <div className="space-y-8">
          <div className="p-8 bg-black text-white rounded-lg">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 italic">Optimized Headline</h4>
            <p className="text-2xl font-black leading-snug">{outputs.optimizedHeadlines?.[0] || 'N/A'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h4 className="text-xs font-black uppercase text-gray-400 mb-4">Strategic About Section</h4>
              <div className="text-sm whitespace-pre-wrap leading-relaxed space-y-4">
                {outputs.optimizedAbout}
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-6 border-2 border-primary rounded-lg">
                <h4 className="text-xs font-black uppercase tracking-widest mb-2 italic text-primary">Core Positioning Shift</h4>
                <p className="text-sm font-bold">{outputs.positioningAngles}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <span className="text-xs font-black uppercase">Clarity Score</span>
                <span className="text-2xl font-black">{outputs.profileClarityScore}/100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. GTM STRATEGY */}
      <section className="py-12 border-b border-gray-100 page-break-before-always">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-2">
          <div className="w-4 h-4 bg-black"></div> 06 | Go-To-Market Execution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {outputs.gtmStrategy?.leadGen.channels.map((ch, i) => (
            <div key={i} className="p-6 bg-gray-50 border border-gray-200">
              <h4 className="text-xs font-black uppercase mb-2 tracking-widest">{ch.channel}</h4>
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-3 italic">{ch.why}</p>
              <p className="text-xs leading-relaxed">{ch.approach}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. LEAD MAGNET IDEAS */}
      <section className="py-12 border-b border-gray-100 page-break-before-always">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-2">
          <div className="w-4 h-4 bg-black"></div> 07 | High-Conversion Lead Magnets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outputs.gtmStrategy?.leadMagnets.map((m, i) => (
            <div key={i} className="p-6 border border-black flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight mb-2">{m.name}</h4>
                <p className="text-xs text-gray-600 mb-4">{m.whatItDoes}</p>
              </div>
              <div className="text-[10px] font-black uppercase text-primary italic">Usage: {m.howToUse}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. OUTREACH ENGINE */}
      <section className="py-12 border-b border-gray-100 page-break-before-always">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-2">
          <div className="w-4 h-4 bg-black"></div> 08 | Outreach Strategy Engine
        </h2>
        
        {outputs.outreachEngineOutput ? (
          <div className="space-y-12">
            <div className="p-8 bg-gray-50 border-l-4 border-black">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Strategic Hook</h4>
              <p className="text-xl font-bold leading-relaxed italic">"{outputs.outreachEngineOutput.strategySummary}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {outputs.outreachEngineOutput.linkedIn && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                    <MessageSquare size={16} /> LinkedIn Sequence
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-black text-white text-[11px] leading-relaxed">
                      <span className="block text-[8px] uppercase font-black text-primary mb-1">Connection Request</span>
                      {outputs.outreachEngineOutput.linkedIn.connectionRequest}
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 text-[11px] leading-relaxed">
                      <span className="block text-[8px] uppercase font-black text-gray-400 mb-1">Initial DM</span>
                      {outputs.outreachEngineOutput.linkedIn.initialDM}
                    </div>
                    {outputs.outreachEngineOutput.linkedIn.followUps?.map((f, i) => (
                      <div key={i} className="p-4 bg-gray-50 border border-gray-100 text-[11px] leading-relaxed italic">
                        <span className="block text-[8px] uppercase font-black text-gray-300 mb-1">Follow-up {i + 1}</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {outputs.outreachEngineOutput.email && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                    <Mail size={16} /> Cold Email Strategy
                  </h3>
                  <div className="space-y-4">
                    <div className="p-6 border-2 border-black rounded-lg">
                      <span className="block text-[8px] uppercase font-black text-gray-400 mb-1">Subject: {outputs.outreachEngineOutput.email.subjectLine}</span>
                      <div className="text-[11px] leading-relaxed whitespace-pre-wrap mt-4 font-medium">
                        {outputs.outreachEngineOutput.email.body}
                      </div>
                    </div>
                    {outputs.outreachEngineOutput.email.followUps?.map((f, i) => (
                      <div key={i} className="p-4 bg-primary/5 border-l-2 border-primary text-[11px] leading-relaxed">
                        <span className="block text-[8px] uppercase font-black text-primary/50 mb-1 text-right">Email Follow-up {i + 1}</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 italic">No outreach sequence generated yet.</p>
        )}
      </section>

      {/* 10. ACTION PLAN */}
      <section className="py-12 border-b-4 border-black page-break-before-always">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-2">
          <div className="w-4 h-4 bg-black"></div> 09 | 90-Day Execution Roadmap
        </h2>
        <div className="space-y-12 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
           <div className="relative pl-24 page-break-inside-avoid">
             <div className="absolute left-0 top-0 w-16 h-16 bg-black text-white flex items-center justify-center font-black text-xl">W1</div>
             <h4 className="text-xl font-black uppercase mb-2">Foundation & Setup</h4>
             <p className="text-sm text-gray-600 leading-relaxed">System implementation, tracking setup, and LinkedIn profile overhaul.</p>
           </div>
           <div className="relative pl-24 page-break-inside-avoid">
             <div className="absolute left-0 top-0 w-16 h-16 bg-black text-white flex items-center justify-center font-black text-xl">W2</div>
             <h4 className="text-xl font-black uppercase mb-2">Outbound Blitz</h4>
             <p className="text-sm text-gray-600 leading-relaxed">Activation of all multi-channel sequences and initial appointment setting.</p>
           </div>
           <div className="relative pl-24 page-break-inside-avoid">
             <div className="absolute left-0 top-0 w-16 h-16 bg-black text-white flex items-center justify-center font-black text-xl">W4</div>
             <h4 className="text-xl font-black uppercase mb-2">Scale & Optimize</h4>
             <p className="text-sm text-gray-600 leading-relaxed">Reviewing data patterns, scaling winning channels, and launching partners.</p>
           </div>
        </div>
      </section>

      <footer className="pt-24 text-center">
        <div className="flex justify-center gap-4 mb-8">
           <div className="w-2 h-2 rounded-full bg-black"></div>
           <div className="w-2 h-2 rounded-full bg-primary italic"></div>
           <div className="w-2 h-2 rounded-full bg-black"></div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">End of Strategic Document</p>
      </footer>
    </div>
  );
};
